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
  const confirmationParams=new URLSearchParams(window.location.hash.slice(1));
  const confirmationFailure=confirmationParams.get('error_code')||accountQuery.get('error_code');
  const confirmationDescription=confirmationParams.get('error_description')||'';
  let confirmationNotice='';
  const HOME_URL=new URL('index.html',window.location.href).href;
  function goHome(){window.location.replace(HOME_URL);}
  async function routeAfterLogin(){
    const required=new URL('conta.html?perfil=1&cadastro=obrigatorio',window.location.href).href;
    try {
      const result=await sb.rpc('read_my_profile_v2');
      if(!result.error&&profileComplete(result.data)){goHome();return;}
      if(result.error?.code==='PGRST202'){
        const old=await sb.rpc('read_my_profile');
        if(!old.error&&old.data &&
          String(old.data.full_name||'').trim().length>=5 &&
          /^\d{11}$/.test(String(old.data.cpf||'').replace(/\D/g,'')) &&
          /^\d{4}-\d{2}-\d{2}$/.test(String(old.data.birth_date||'')) &&
          !!String(old.data.gender_identity||'').trim()){
          goHome();return;
        }
      }
      window.location.replace(required);
    } catch (_) {window.location.replace(required);}
  }
  function authMessage(error, action='login'){
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

  const countryDigits=(value,limit)=>digits(value).slice(0,limit);
  function maskDocument(country,value){
    if(country==='OTHER')return String(value||'').toUpperCase().replace(/[^A-Z0-9/-]/g,'').slice(0,30);
    const d=countryDigits(value,country==='BR'?11:9);
    if(country==='BR'){
      return d.slice(0,3)+(d.length>3?'.'+d.slice(3,6):'')+
        (d.length>6?'.'+d.slice(6,9):'')+(d.length>9?'-'+d.slice(9,11):'');
    }
    return d.replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  }
  function updateCountryDocument(clear=false){
    const country=$('country-of-origin').value;
    const doc=$('national-id');
    const other=country==='OTHER';
    show('country-other-wrap',other);
    $('country-other').required=other;
    const labels={
      BR:['CPF brasileiro *','000.000.000-00','Informe os 11 dígitos do CPF. O sistema confere os dígitos verificadores.'],
      AR:['DNI argentino *','12.345.678','Informe o número do DNI, sem pontos. O formato é aplicado automaticamente.'],
      PY:['Cédula de Identidade paraguaia (C.I.) *','1.234.567','Informe o número da C.I. paraguaia, sem pontos. O formato é aplicado automaticamente.'],
      OTHER:['Documento nacional / passaporte *','Número do documento','Informe o número do documento do país selecionado.']
    };
    const opt=labels[country]||['Documento de identificação *','Selecione primeiro o país de origem','Escolha o país antes de informar o documento.'];
    $('national-id-label').textContent=opt[0];
    $('national-id-hint').textContent=opt[2];
    doc.placeholder=opt[1];
    doc.inputMode=country==='OTHER'?'text':'numeric';
    doc.maxLength=country==='BR'?14:country==='OTHER'?30:14;
    if(clear)doc.value='';
    else doc.value=maskDocument(country,doc.value);
  }
  function profileComplete(p){
    if(!p || typeof p!=='object')return false;
    const country=String(p.country_of_origin||'');
    const doc=String(p.national_id||'');
    return ['BR','AR','PY','OTHER'].includes(country) &&
      (country!=='OTHER'||String(p.country_other||'').trim().length>=2) &&
      String(p.full_name||'').trim().length>=5 &&
      String(p.gender_identity||'').trim().length>0 &&
      /^\d{4}-\d{2}-\d{2}$/.test(String(p.birth_date||'')) &&
      (country==='BR'?cpfOk(doc):
        country==='AR'?/^\d{7,9}$/.test(doc):
        country==='PY'?/^\d{5,9}$/.test(doc):
        /^[A-Z0-9/-]{4,30}$/i.test(doc));
  }

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
    const country=String(d.get('country_of_origin')||'');
    const doc=String(d.get('document_number')||'');
    const nationalId=country==='OTHER'?maskDocument(country,doc):digits(doc);
    const p={
      country_of_origin:country,
      country_other:String(d.get('country_other')||'').trim(),
      full_name:String(d.get('profile_full_name')||'').trim(),
      preferred_name:String(d.get('preferred_name')||'').trim(),
      gender_identity:String(d.get('gender_identity')||'').trim(),
      phone:digits(d.get('phone')),
      national_id:nationalId,
      birth_date:String(d.get('birth_date')||'')
    };
    if(!$('accept-privacy').checked)throw Error('Confirme o tratamento dos dados antes de salvar.');
    if(!country)throw Error('Selecione obrigatoriamente o país de origem.');
    if(p.country_of_origin==='OTHER'&&(p.country_other.length<2||p.country_other.length>80))
      throw Error('Informe o nome do seu país de origem.');
    if(p.full_name.length<5||p.full_name.length>120)
      throw Error('Informe seu nome completo.');
    if(p.preferred_name.length>80)throw Error('O nome de preferência deve ter até 80 caracteres.');
    if(!p.gender_identity)throw Error('Selecione uma opção de identidade sexual/de gênero.');
    if(p.phone.length>0&&(p.phone.length<8||p.phone.length>15))
      throw Error('Confira o telefone, caso tenha informado.');
    if(country==='BR'&&!cpfOk(nationalId))throw Error('CPF inválido. Confira os 11 dígitos.');
    if(country==='AR'&&!/^\d{7,9}$/.test(nationalId))throw Error('DNI argentino inválido: confira o número.');
    if(country==='PY'&&!/^\d{5,9}$/.test(nationalId))throw Error('C.I. paraguaia inválida: confira o número.');
    if(country==='OTHER'&&!/^[A-Z0-9/-]{4,30}$/.test(nationalId))
      throw Error('Informe um documento de identificação válido.');
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
    updateCountryDocument();
    const {data,error}=await sb.rpc('read_my_profile_v2');
    profileReady=!error&&profileComplete(data);
    show('onboarding-banner',!profileReady);
    show('back-app',profileReady);
    $('profile-state').textContent=profileReady
      ? 'Perfil registrado e protegido'
      : 'Cadastro obrigatório pendente';
    if(error){
      alert('A atualização do banco do perfil ainda não está disponível. Execute a migração SQL v2 no Supabase antes de salvar documentos de outros países.',true);
      return;
    }
    let profile=data;
    if(!profile){
      const legacy=await sb.rpc('read_my_profile');
      if(!legacy.error&&legacy.data)profile=legacy.data;
    }
    if(profile&&typeof profile==='object'){
      const values={
        profile_full_name:profile.full_name||'',
        preferred_name:profile.preferred_name||'',
        gender_identity:profile.gender_identity||'',
        phone:profile.phone||'',
        birth_date:profile.birth_date||'',
        country_of_origin:profile.country_of_origin||'',
        country_other:profile.country_other||''
      };
      for(const [name,value] of Object.entries(values)){
        const field=form.elements.namedItem(name);
        if(field)field.value=String(value);
      }
      updateCountryDocument();
      $('national-id').value=maskDocument(values.country_of_origin,profile.national_id||'');
    }
    if(profileReady)alert('Perfil pessoal carregado com segurança.');
    else alert('Selecione seu país de origem e informe o documento correspondente para concluir o cadastro obrigatório.');
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
        await routeAfterLogin();
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
  const signupPass=$('signup-password');
  const signupConfirm=$('signup-confirm');
  function updatePasswordHints(){
    const pass=signupPass.value,confirm=signupConfirm.value;
    $('password-hint').textContent=pass.length===0
      ? 'Use pelo menos 12 caracteres. Evite reutilizar senhas.'
      : pass.length>=12
        ? 'Comprimento mínimo atendido. Utilize uma senha exclusiva.'
        : 'Faltam '+(12-pass.length)+' caracteres para o mínimo de 12.';
    signupPass.setAttribute('aria-invalid',String(pass.length>0&&pass.length<12));
    $('password-match').textContent=confirm.length===0
      ? 'Repita exatamente a mesma senha.'
      : pass===confirm?'As duas senhas coincidem.':'As senhas ainda não coincidem.';
    signupConfirm.setAttribute('aria-invalid',String(confirm.length>0&&pass!==confirm));
  }
  signupPass.addEventListener('input',updatePasswordHints);
  signupConfirm.addEventListener('input',updatePasswordHints);
  $('country-of-origin').addEventListener('change',()=>updateCountryDocument(true));
  $('national-id').addEventListener('input',e=>{
    const field=e.currentTarget;
    field.value=maskDocument($('country-of-origin').value,field.value);
  });
  updateCountryDocument();
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
        await routeAfterLogin();
        return;
      }else{
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
      if(!data?.session||!data?.user)
        throw {code:'missing_session'};
      form.reset();
      await routeAfterLogin();
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
      const {error}=await sb.rpc('save_my_profile_v2',{p_profile:values});
      if(error)throw error;
      const saved=await sb.rpc('read_my_profile_v2');
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
  $('logout-and-clear-local').addEventListener('click',async()=>{
    if(!sb||!user)return;
    const ok=confirm('Apagar definitivamente os relatos e lembretes desta conta SALVOS NESTE APARELHO e encerrar a sessão? Esta ação não pode ser desfeita e não altera o perfil criptografado no Supabase.');
    if(!ok)return;
    const id=String(user.id||'');
    if(!/^[0-9a-f-]{36}$/i.test(id))return;
    try{
      const {error}=await sb.auth.signOut({scope:'local'});
      if(error)throw error;
      localStorage.removeItem('orientasaude-records-v2-'+id);
      location.replace('conta.html?saiu=1');
    }catch(_){alert('Não foi possível concluir a saída com limpeza. Tente novamente.',true);}
  });
  $('remove-profile').addEventListener('click',async()=>{
    if(!sb||!user||prompt('Para apagar os dados pessoais do perfil, digite APAGAR:')!=='APAGAR')return;
    const {error}=await sb.rpc('delete_my_profile_v2');
    if(error){alert('Não foi possível excluir os dados do perfil.',true);return;}
    const legacy=await sb.rpc('delete_my_profile');
    if(legacy.error){
      alert('O perfil internacional foi apagado, mas não foi possível confirmar a exclusão dos dados antigos. Verifique seu banco antes de considerar a exclusão concluída.',true);
      return;
    }
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
    const id=String(user.id||'');
    try{await sb.auth.signOut({scope:'local'});}catch(_){}
    if(/^[0-9a-f-]{36}$/i.test(id)){
      try{localStorage.removeItem('orientasaude-records-v2-'+id);}catch(_){}
    }
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
          if(data?.session){await routeAfterLogin();return;}
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
