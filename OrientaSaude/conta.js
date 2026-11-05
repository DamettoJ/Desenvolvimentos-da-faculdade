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
  let profileReady=false;
  function profileComplete(p){
    return !!p && typeof p==='object'
      && typeof p.full_name==='string' && p.full_name.trim().length>=5
      && typeof p.gender_identity==='string' && !!p.gender_identity.trim()
      && /^\d{11}$/.test(String(p.cpf||'').replace(/\D/g,''))
      && /^\d{4}-\d{2}-\d{2}$/.test(String(p.birth_date||''));
  }
  const accountQuery=new URLSearchParams(window.location.search);
  const manageProfile=accountQuery.get('perfil')==='1';
  const accessRequired=accountQuery.has('acesso');
  // Ler imediatamente o erro do retorno por e-mail, antes de o SDK tratar o fragmento.
  const confirmationParams=new URLSearchParams(window.location.hash.slice(1));
  const confirmationFailure=confirmationParams.get('error_code')||accountQuery.get('error_code');
  const confirmationDescription=confirmationParams.get('error_description')||'';
  let confirmationNotice='';
  const HOME_URL=new URL('index.html',window.location.href).href;
  function goHome(){window.location.replace(HOME_URL);}
  function authMessage(error, action='login'){
    // Mensagens seguras, sem exibir tokens, senhas ou detalhes privados da API.
    const code=String(error?.code||'').toLowerCase();
    const message=String(error?.message||'').toLowerCase();
    if(code==='email_not_confirmed'||message.includes('email not confirmed'))
      return 'Seu e-mail ainda aparece como não confirmado no Supabase. Abra o link de confirmação mais recente. Se já clicou nele, verifique se a confirmação foi registrada em Authentication → Users.';
    if(code==='invalid_credentials'||message.includes('invalid login credentials'))
      return 'E-mail ou senha incorretos. Use o mesmo endereço e senha do cadastro. Se esqueceu a senha, clique em “Esqueci minha senha”.';
    if(code==='email_address_not_authorized'||message.includes('email address not authorized'))
      return 'O provedor de e-mail do Supabase não está autorizado a enviar para esse endereço. Verifique o SMTP em Authentication.';
    if(code==='over_email_send_rate_limit'||code==='over_request_rate_limit'||message.includes('rate limit'))
      return 'Muitas tentativas em pouco tempo. Aguarde antes de tentar novamente.';
    if(code==='user_already_exists'||code==='email_exists'||message.includes('already registered'))
      return 'Este e-mail já possui cadastro. Use Entrar ou recupere a senha.';
    if(code==='signup_disabled'||code==='email_provider_disabled')
      return 'O cadastro está desabilitado nas configurações do Supabase. Verifique Authentication → Providers → Email.';
    if(code==='validation_failed'||code==='email_address_invalid')
      return 'Confira o formato do e-mail e os requisitos da senha.';
    if(code==='otp_expired'||code==='otp_disabled'||message.includes('token has expired'))
      return 'O link de confirmação expirou ou já foi utilizado. Solicite um novo e-mail de confirmação.';
    if(code==='network_request_failed'||message.includes('failed to fetch')||message.includes('network'))
      return 'Não foi possível comunicar com o Supabase. Confira a internet e tente novamente.';
    return action==='signup'
      ? 'Não foi possível concluir o cadastro. Confira os dados e tente novamente.'
      : 'Não foi possível entrar. Confira os dados, a confirmação do e-mail e a conexão com o Supabase.';
  }
  const authRedirect=()=>new URL('conta.html',window.location.href).href;
  if(confirmationFailure)
    confirmationNotice=authMessage({code:confirmationFailure,message:confirmationDescription},'login');
  else if(accountQuery.has('email_confirmado'))
    confirmationNotice='E-mail confirmado! Entre para acessar o OrientaSaúde.';
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
    profileReady=!error&&profileComplete(data);
    show('onboarding-banner',!profileReady);
    show('back-app',profileReady);
    $('profile-state').textContent=profileReady?'Perfil registrado e protegido':'Cadastro obrigatório pendente';
    if(error){
      alert('Não foi possível consultar seus dados no Supabase. O acesso ao aplicativo continuará bloqueado até a consulta funcionar.',true);
      return;
    }
    if(!data){
      $('profile-state').textContent='Cadastro de informações pessoais pendente';
      alert('Antes de acessar o OrientaSaúde, complete seus dados obrigatórios para salvá-los com criptografia.');
      return;
    }
    const names=['full_name','preferred_name','gender_identity','phone','cpf','birth_date'];
    for(const n of names){
      const field=form.elements.namedItem(n);
      if(field)field.value=String(data[n]||'');
    }
    if(profileReady)alert('Perfil pessoal carregado com segurança.');
    else alert('Seu cadastro ainda está incompleto. Preencha os campos obrigatórios para acessar o OrientaSaúde.');
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
      show('back-app',false);
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
        if(confirmationNotice)alert(confirmationNotice,!!confirmationFailure);
        else if(accessRequired)alert('Para usar o OrientaSaúde, entre ou crie uma conta primeiro.');
      }
    }finally{activeRequest=false;}
  }
  $('show-login').addEventListener('click',()=>setTab('login'));
  $('show-signup').addEventListener('click',()=>setTab('signup'));
  $('forgot-password').addEventListener('click',()=>setTab('reset'));
  $('resend-confirmation').addEventListener('click',async()=>{
    if(!sb)return;
    const email=String($('login-email').value||'').trim().toLowerCase();
    if(!email||!$('login-email').checkValidity()){
      alert('Preencha primeiro seu e-mail no campo acima para reenviar a confirmação.',true);
      $('login-email').focus();
      return;
    }
    const button=$('resend-confirmation');
    button.disabled=true;
    try{
      const {error}=await sb.auth.resend({
        type:'signup',email,options:{emailRedirectTo:authRedirect()}
      });
      if(error)throw error;
      alert('Se o e-mail estiver aguardando confirmação, uma nova mensagem será enviada. Abra o link mais recente.');
    }catch(error){alert(authMessage(error,'signup'),true);}
    finally{button.disabled=false;}
  });
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
        options:{emailRedirectTo:authRedirect()}
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
    }catch(error){alert(authMessage(error,'signup'),true);}
    finally{formBusy(form,false);}
  });
  $('login-form').addEventListener('submit',async e=>{
    e.preventDefault();if(!sb)return;
    const form=e.currentTarget,d=new FormData(form);
    formBusy(form,true);
    try{
      const {data,error}=await sb.auth.signInWithPassword({
        email:String(d.get('email')||'').trim().toLowerCase(),
        password:String(d.get('password')||'')
      });
      if(error)throw error;
      // signInWithPassword valida a senha no Supabase e retorna a sessão.
      // O auth-gate da página inicial faz uma nova verificação de identidade.
      if(!data?.session||!data?.user)
        throw {code:'missing_session'};
      form.reset();
      goHome();
      return;
    }catch(error){alert(authMessage(error,'login'),true);}
    finally{formBusy(form,false);}
  });
  $('reset-form').addEventListener('submit',async e=>{
    e.preventDefault();if(!sb)return;
    const form=e.currentTarget,d=new FormData(form);
    formBusy(form,true);
    try{
      const {error}=await sb.auth.resetPasswordForEmail(String(d.get('email')||'').trim(),{
        redirectTo:authRedirect()
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
      const initialRegistration=!profileReady;
      const {error}=await sb.rpc('save_my_profile',{p_profile:values});
      if(error)throw error;
      // Confirmar que o perfil foi persistido e está completo no próprio banco.
      const saved=await sb.rpc('read_my_profile');
      if(saved.error||!profileComplete(saved.data)){
        alert('Não foi possível verificar o perfil salvo. Confira a função de leitura no Supabase antes de continuar.',true);
        return;
      }
      profileReady=true;
      show('onboarding-banner',false);
      show('back-app',true);
      $('profile-state').textContent='Perfil registrado e protegido';
      if(initialRegistration){goHome();return;}
      alert('Seus dados foram atualizados e salvos com criptografia no banco.');
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
    profileReady=false;
    $('profile-form').reset();
    $('profile-state').textContent='Cadastro obrigatório pendente';
    show('onboarding-banner',true);
    show('back-app',false);
    alert('Dados do perfil excluídos. Para continuar usando o OrientaSaúde, faça um novo cadastro pessoal. Seu e-mail de login permanece cadastrado.');
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
      // Compatibilidade com links de e-mail personalizados que retornam token_hash
      // diretamente ao site (a confirmação padrão do Supabase é automática).
      const callbackParams=new URLSearchParams(window.location.search);
      const tokenHash=callbackParams.get('token_hash');
      const tokenType=callbackParams.get('type');
      if(tokenHash && (tokenType==='email'||tokenType==='signup')){
        const cleaned=new URL(window.location.href);
        cleaned.searchParams.delete('token_hash');
        cleaned.searchParams.delete('type');
        window.history.replaceState(null,'',cleaned.pathname+cleaned.search+cleaned.hash);
        try{
          const {data,error}=await sb.auth.verifyOtp({
            token_hash:tokenHash,type:tokenType==='signup'?'email':tokenType
          });
          if(error)throw error;
          if(data?.session){goHome();return;}
          confirmationNotice='E-mail confirmado! Entre para continuar no OrientaSaúde.';
        }catch(error){
          confirmationNotice=authMessage(error,'login');
        }
      }
      show('setup-warning',false);show('account-app',true);
      sb.auth.onAuthStateChange(event=>{
        if(event==='PASSWORD_RECOVERY')recovery=true;
        if(event==='SIGNED_OUT')recovery=false;
        if(['INITIAL_SESSION','SIGNED_IN','SIGNED_OUT','PASSWORD_RECOVERY'].includes(event))
          setTimeout(()=>render().catch(()=>{}),0);
      });
      // O Supabase interpreta a confirmação e estabelece a sessão ao iniciar.
      // Se o provedor devolveu erro, a tela Entrar mostra sua explicação.
      await render();
      if(confirmationFailure && window.location.hash.includes('error='))
        window.history.replaceState(null,'',window.location.pathname+window.location.search);
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
