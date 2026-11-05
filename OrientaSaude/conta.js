/* OrientaSaúde Original — autenticação pública com Supabase.
 * Dados pessoais só são gravados por RPC autenticada no backend criptografado.
 * NÃO usar localStorage nem Auth user_metadata para dados sensíveis.
 */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const c=window.ORIENTA_SUPABASE||{};
  const configured=/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(c.url||'') &&
    (/^sb_publishable_[A-Za-z0-9_-]+$/.test(c.publishableKey||'') ||
     /^eyJ[A-Za-z0-9_.-]+$/.test(c.publishableKey||''));
  let sb=null, user=null, recovery=false, tab='login',activeRequest=false;
  const accountQuery=new URLSearchParams(window.location.search);
  const manageProfile=accountQuery.get('perfil')==='1';
  const accessRequired=accountQuery.has('acesso');
  const HOME_URL=new URL('index.html',window.location.href).href;
  function goHome(){window.location.replace(HOME_URL);}
  const show=(id,on)=>{$(id).hidden=!on;};
  const alert=(msg,bad=false)=>{
    $('account-status').textContent=msg;
    $('account-status').classList.toggle('error',bad);
  };
  const digits=v=>String(v||'').replace(/\D/g,'');
  function cpfOk(value){
    const s=digits(value);
    if(!/^\d{11}$/.test(s)||/^(\d)\1{10}$/.test(s))return false;
    const d=n=>{
      let sum=0;
      for(let i=0;i<n;i++)sum+=Number(s[i])*(n+1-i);
      const result=(sum*10)%11;
      return result===10?0:result;
    };
    return d(9)===Number(s[9])&&d(10)===Number(s[10]);
  }
  const formBusy=(form,on)=>{for(const b of form.querySelectorAll('button[type=submit]'))b.disabled=on;};
  function setTab(name){
    tab=name;
    show('login-form',name==='login');
    show('signup-form',name==='signup');
    show('reset-form',name==='reset');
    show('confirmation-panel',name==='confirmation');
    show('auth-tabs',name!=='confirmation');
    $('show-login').setAttribute('aria-pressed',String(name==='login'));
    $('show-signup').setAttribute('aria-pressed',String(name==='signup'));
    $('show-login').classList.toggle('selected',name==='login');
    $('show-signup').classList.toggle('selected',name==='signup');
    alert('');
  }
  function extractProfile(){
    const d=new FormData($('profile-form'));
    const p={
      full_name:String(d.get('full_name')||'').trim(),
      preferred_name:String(d.get('preferred_name')||'').trim(),
      gender_identity:String(d.get('gender_identity')||'').trim(),
      phone:digits(d.get('phone')),
      cpf:digits(d.get('cpf')),
      birth_date:String(d.get('birth_date')||'')
    };
    if(!$('accept-privacy').checked)throw Error('Confirme o consentimento para salvar.');
    if(p.full_name.length<5||p.full_name.length>120)throw Error('Informe o nome completo.');
    if(!p.preferred_name||p.preferred_name.length>80)throw Error('Informe como gostaria de ser chamado.');
    if(!p.gender_identity)throw Error('Selecione uma opção de identidade de gênero.');
    if(p.phone.length<8||p.phone.length>15)throw Error('Informe o telefone com DDD/código de país.');
    if(!cpfOk(p.cpf))throw Error('CPF inválido. Confira os 11 dígitos.');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(p.birth_date))throw Error('Informe a data de nascimento.');
    const dt=new Date(p.birth_date+'T12:00:00Z');
    if(Number.isNaN(dt.getTime())||dt.toISOString().slice(0,10)!==p.birth_date||
        p.birth_date<'1900-01-01'||p.birth_date>new Date().toISOString().slice(0,10))
      throw Error('Data de nascimento inválida.');
    return p;
  }
  async function refreshProfile(){
    const form=$('profile-form');
    form.reset();
    const {data,error}=await sb.rpc('read_my_profile');
    if(error){
      alert('Não foi possível consultar o perfil. Verifique se a migração SQL foi aplicada corretamente.',true);
      return;
    }
    if(!data){
      $('profile-state').textContent='Cadastro de informações pessoais pendente';
      alert('Você já entrou. Complete agora o cadastro pessoal para salvá-lo criptografado.');
      return;
    }
    const names=['full_name','preferred_name','gender_identity','phone','cpf','birth_date'];
    for(const n of names){
      const field=form.elements.namedItem(n);
      if(field)field.value=String(data[n]||'');
    }
    $('profile-state').textContent='Perfil armazenado de forma criptografada';
    alert('Perfil pessoal carregado com segurança.');
  }
  async function render(){
    if(!sb||activeRequest)return;
    activeRequest=true;
    try{
      const {data,error}=await sb.auth.getUser();
      user=error?null:(data.user||null);
      if(recovery){
        show('login-screen',false);show('profile-screen',false);show('new-password-form',true);
        return;
      }
      if(user && !manageProfile){
        // Usuário já autenticado: manter a tela inicial como destino.
        goHome();
        return;
      }
      show('back-app',!!user);
      show('new-password-form',false);
      show('login-screen',!user);
      show('profile-screen',!!user);
      if(user){
        $('account-email').textContent=user.email||'Conta autenticada';
        $('birth-date').max=new Date().toISOString().slice(0,10);
        await refreshProfile();
      } else {
        $('profile-form').reset();
        setTab(tab);
        if(accessRequired)alert('Para usar o OrientaSaúde, entre ou crie uma conta primeiro.');
      }
    }finally{activeRequest=false;}
  }
  $('show-login').addEventListener('click',()=>setTab('login'));
  $('show-signup').addEventListener('click',()=>setTab('signup'));
  $('forgot-password').addEventListener('click',()=>setTab('reset'));
  $('back-to-login').addEventListener('click',()=>setTab('login'));
  $('confirmation-go-login').addEventListener('click',()=>setTab('login'));
  $('show-cpf').addEventListener('click',()=>{
    const el=$('cpf'),on=el.type==='password';
    el.type=on?'text':'password';
    $('show-cpf').textContent=on?'Ocultar':'Mostrar';
    $('show-cpf').setAttribute('aria-pressed',String(on));
  });
  // Mostrar/ocultar somente o campo selecionado. Nunca persistir senha visível.
  for(const button of document.querySelectorAll('[data-toggle-password]')){
    button.addEventListener('click',()=>{
      const input=document.getElementById(button.dataset.togglePassword);
      if(!input)return;
      const visible=input.type==='password';
      input.type=visible?'text':'password';
      button.textContent=visible?'Ocultar':'Mostrar';
      button.setAttribute('aria-pressed',String(visible));
      button.setAttribute('aria-label',(visible?'Ocultar':'Mostrar')+' senha');
    });
  }
  $('signup-form').addEventListener('submit',async e=>{
    e.preventDefault();if(!sb)return;
    const form=e.currentTarget,d=new FormData(form);
    const email=String(d.get('email')||'').trim().toLowerCase();
    const pass=String(d.get('password')||'');
    if(pass.length<12||pass!==String(d.get('confirm')||'')){
      alert('Utilize senha de pelo menos 12 caracteres e confirme a senha.',true);return;
    }
    formBusy(form,true);
    try{
      const {data,error}=await sb.auth.signUp({
        email,password:pass,
        options:{emailRedirectTo:new URL('conta.html',location.href).href}
      });
      if(error)throw error;
      form.reset();
      if(data.session){
        goHome();
        return;
      }else{
        // O e-mail precisa ser confirmado pelo link do Supabase antes do primeiro login.
        // Mantém as instruções na tela até o usuário escolher "Entrar".
        setTab('confirmation');
        $('confirmation-panel').focus();
      }
    }catch(_){alert('Não foi possível criar a conta. Revise o e-mail e tente novamente.',true);}
    finally{formBusy(form,false);}
  });
  $('login-form').addEventListener('submit',async e=>{
    e.preventDefault();if(!sb)return;
    const form=e.currentTarget,d=new FormData(form);
    formBusy(form,true);
    try{
      const {error}=await sb.auth.signInWithPassword({
        email:String(d.get('email')||'').trim(),password:String(d.get('password')||'')
      });
      if(error)throw error;
      form.reset();
      // O login é obrigatório para o aplicativo; uma sessão válida abre o início.
      await render();
    }catch(_){alert('Não foi possível entrar. Confira o e-mail, a senha e a confirmação da conta.',true);}
    finally{formBusy(form,false);}
  });
  $('reset-form').addEventListener('submit',async e=>{
    e.preventDefault();if(!sb)return;
    const form=e.currentTarget,d=new FormData(form);
    formBusy(form,true);
    try{
      const {error}=await sb.auth.resetPasswordForEmail(String(d.get('email')||'').trim(),{
        redirectTo:new URL('conta.html',location.href).href
      });
      if(error)throw error;
      alert('Se este e-mail estiver cadastrado, você receberá instruções para redefinir a senha.');
      form.reset();
    }catch(_){alert('Não foi possível solicitar a recuperação da senha.',true);}
    finally{formBusy(form,false);}
  });
  $('new-password-form').addEventListener('submit',async e=>{
    e.preventDefault();if(!sb)return;
    const form=e.currentTarget,pass=$('new-password').value;
    if(pass.length<12){alert('Sua nova senha deve ter pelo menos 12 caracteres.',true);return;}
    formBusy(form,true);
    try{
      const {error}=await sb.auth.updateUser({password:pass});
      if(error)throw error;
      recovery=false;form.reset();await render();
      alert('Sua senha foi atualizada.');
    }catch(_){alert('Não foi possível atualizar a senha.',true);}
    finally{formBusy(form,false);}
  });
  $('profile-form').addEventListener('submit',async e=>{
    e.preventDefault();if(!sb||!user)return;
    const form=e.currentTarget;
    let values;
    try{values=extractProfile();}catch(error){alert(error.message,true);return;}
    formBusy(form,true);
    try{
      const {error}=await sb.rpc('save_my_profile',{p_profile:values});
      if(error)throw error;
      $('profile-state').textContent='Perfil armazenado de forma criptografada';
      alert('Seu perfil foi salvo de forma criptografada no banco.');
    }catch(_){alert('O perfil não foi salvo. Confira a instalação das funções de criptografia no Supabase.',true);}
    finally{formBusy(form,false);}
  });
  $('logout').addEventListener('click',async()=>{
    if(!sb)return;
    try{
      const {error}=await sb.auth.signOut({scope:'local'});
      if(error)throw error;
      user=null;
      $('profile-form').reset();
      window.location.replace('conta.html?saiu=1');
    }catch(_){alert('Não foi possível encerrar a sessão. Tente novamente.',true);}
  });
  $('remove-profile').addEventListener('click',async()=>{
    if(!sb||!user||prompt('Para apagar os dados pessoais do perfil, digite APAGAR:')!=='APAGAR')return;
    const {error}=await sb.rpc('delete_my_profile');
    if(error){alert('Não foi possível excluir os dados do perfil.',true);return;}
    $('profile-form').reset();$('profile-state').textContent='Cadastro de informações pessoais pendente';
    alert('Dados do perfil excluídos. O e-mail de login permanece cadastrado.');
  });
  $('remove-account').addEventListener('click',async()=>{
    if(!sb||!user||prompt('Para excluir a conta e o perfil, digite EXCLUIR:')!=='EXCLUIR')return;
    const {error}=await sb.rpc('delete_my_account');
    if(error){alert('Não foi possível excluir a conta.',true);return;}
    try{await sb.auth.signOut({scope:'local'});}catch(_){}
    sessionStorage.removeItem('orientasaude_faculdade_original_auth_v1');
    location.replace('conta.html?conta_excluida=1');
  });
  async function start(){
    if(!configured){
      show('setup-warning',true);
      show('account-app',false);
      return;
    }
    try{
      const supa=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.79.0/+esm');
      sb=supa.createClient(c.url.replace(/\/$/,''),c.publishableKey,{
        auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true,
          storage:window.sessionStorage,storageKey:'orientasaude_faculdade_original_auth_v1'}
      });
      show('setup-warning',false);show('account-app',true);
      sb.auth.onAuthStateChange(event=>{
        if(event==='PASSWORD_RECOVERY')recovery=true;
        if(event==='SIGNED_OUT')recovery=false;
        if(['INITIAL_SESSION','SIGNED_IN','SIGNED_OUT','PASSWORD_RECOVERY'].includes(event))
          setTimeout(()=>render().catch(()=>{}),0);
      });
      await render();
      if(accountQuery.has('conta_excluida'))
        alert('A conta foi excluída. Você pode criar outra quando desejar.');
      if(accountQuery.has('saiu'))
        alert('Você saiu. Entre novamente para acessar o OrientaSaúde.');
    }catch(_){
      show('setup-warning',true);show('account-app',false);
      alert('Erro ao inicializar o serviço de autenticação. Verifique a conexão e as configurações.',true);
    }
  }
  start();
})();
