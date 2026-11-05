/* OrientaSaúde Original — verificação de sessão por página.
 * Controle de navegação no frontend: o GitHub Pages continua público.
 * Qualquer acesso a dados privados deve ser autorizado no próprio Supabase
 * por RLS/RPC, nunca apenas por esta verificação no navegador.
 */
(() => {
  'use strict';
  const HOME = new URL('index.html', window.location.href);
  const LOGIN = new URL('conta.html?acesso=necessario', HOME);
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
  async function verify() {
    if (checking || redirecting) return;
    checking = true;
    try {
      const { data, error } = await client.auth.getUser();
      if (error || !data?.user || data.user.is_anonymous === true) {
        goToLogin();
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
