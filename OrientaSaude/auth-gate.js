/* OrientaSaúde Original — verificação de sessão por página.
 * Controle de navegação no frontend: o GitHub Pages continua público.
 * Qualquer acesso a dados privados deve ser autorizado no próprio Supabase
 * por RLS/RPC, nunca apenas por esta verificação no navegador.
 */
(() => {
  'use strict';
  const HOME = new URL('index.html', window.location.href);
  const LOGIN = new URL('conta.html?acesso=necessario', HOME);
  const REQUIRED_PROFILE = new URL('conta.html?perfil=1&cadastro=obrigatorio', HOME);
  // Só liberar o aplicativo depois de encontrar os quatro dados obrigatórios
  // no banco para o próprio usuário autenticado.
  function profileComplete(p) {
    return !!p && typeof p === 'object' &&
      typeof p.full_name === 'string' && p.full_name.trim().length >= 5 &&
      typeof p.gender_identity === 'string' && !!p.gender_identity.trim() &&
      /^\d{11}$/.test(String(p.cpf || '').replace(/\D/g, '')) &&
      /^\d{4}-\d{2}-\d{2}$/.test(String(p.birth_date || ''));
  }
  const STORAGE_KEY = 'orientasaude_faculdade_original_auth_v1';
  const c = window.ORIENTA_SUPABASE || {};
  const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(c.url || '') &&
    (/^sb_publishable_[A-Za-z0-9_-]+$/.test(c.publishableKey || '') ||
     /^eyJ[A-Za-z0-9_.-]+$/.test(c.publishableKey || ''));
  let client, checking = false, redirecting = false;
  function goToLogin() {
    if (redirecting) return;
    redirecting = true;
    // replace() impede que voltar retorne à página bloqueada.
    window.location.replace(LOGIN.href);
  }
  function goToProfile() {
    if (redirecting) return;
    redirecting = true;
    // A tela de cadastro é a única rota até o registro obrigatório ficar completo.
    window.location.replace(REQUIRED_PROFILE.href);
  }
  async function verify() {
    if (checking || redirecting) return;
    checking = true;
    try {
      const { data, error } = await client.auth.getUser();
      if (error || !data?.user || data.user.is_anonymous === true) {
        goToLogin();
        return;
      }
      // Não confiar em um sinal salvo no navegador: consultar o perfil a cada
      // abertura/retorno ao app, via RPC autenticada e isolada no Supabase.
      const profileResult = await client.rpc('read_my_profile');
      if (profileResult.error || !profileComplete(profileResult.data)) {
        goToProfile();
        return;
      }
      document.documentElement.setAttribute('data-orienta-auth', 'ok');
    } catch (_) {
      // Sem conexão para verificar a sessão, não liberar o app.
      goToLogin();
    } finally {
      checking = false;
    }
  }
  async function start() {
    if (!configured) { goToLogin(); return; }
    try {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.79.0/+esm');
      client = createClient(c.url.replace(/\/$/, ''), c.publishableKey, {
        auth: {
          storage: window.sessionStorage,
          storageKey: STORAGE_KEY,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        }
      });
      client.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') goToLogin();
      });
      // getUser faz uma requisição ao Auth e valida a identidade no servidor.
      await verify();
      // Revalidar quando o usuário retorna à aba ou usa o histórico do navegador.
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) void verify();
      });
      window.addEventListener('pageshow', event => {
        if (event.persisted) void verify();
      });
    } catch (_) {
      goToLogin();
    }
  }
  void start();
})();
