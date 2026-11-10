/* OrientaSaúde - static offline cache, no sensitive records or external map requests. */
const VERSION='os-safe-20261110-scoped-data-01';
const STATIC=VERSION+'-assets';
const CORE=[
 './offline.html','./emergencia.html','./privacidade.html','./public-info.css','./manifest.webmanifest','./styles.css','./assets/favicon.svg','./assets/icon-192.png','./assets/icon-512.png',
 './app.js','./i18n.js','./language-pack.js','./flag-picker.js','./flag-picker.css','./locale.css',
 './border-data.js','./border-context.js','./border-embed.css','./border-legacy.js','./border-tips.js',
 './health-data.js','./health-ui.js','./health-units.css','./directory.css','./directory-init.js',
 './health-tips-hook.js','./health-tips-data.js','./health-tips.js','./health-tips.css',
 './specialty-hook.js','./specialty-data.js','./specialty-ui.js','./specialty.css',
 './border-page.js','./border.css','./mapa.js','./mapa.css',
 './agenda.css','./resumo.css',
 
 './upgrade.js','./upgrade.css','./pwa.js','./reader.js','./alertas.css','./alertas.js','./alert-hook.js','./alert-entry.css'
];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{const cache=await caches.open(STATIC);await Promise.allSettled(CORE.map(async p=>{try{const response=await fetch(p,{cache:'reload'});if(response.ok)await cache.put(new Request(p),response.clone())}catch{}}));await self.skipWaiting()})());
});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(x=>x.startsWith('os-safe-')&&x!==STATIC).map(x=>caches.delete(x)));await self.clients.claim()})())});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 // Jamais colocar respostas de autenticação, links de recuperação e configurações do cadastro em cache.
 if(/\/(?:conta\.html|conta\.js|conta\.css|supabase-config\.js|auth-gate\.js)$/.test(url.pathname))return;
 if(req.mode==='navigate'){
  event.respondWith((async()=>{
   const cache=await caches.open(STATIC);
   try{return await fetch(req,{cache:'no-store'})}catch{
    // Emergência e privacidade podem ser exibidas sem conta, inclusive offline.
    if(url.pathname.endsWith('/emergencia.html'))return await cache.match('./emergencia.html')||new Response('Sem conexão',{status:503});
    if(url.pathname.endsWith('/privacidade.html'))return await cache.match('./privacidade.html')||new Response('Sem conexão',{status:503});
    // Não servir HTML privado em cache sem validar novamente a sessão.
    return await cache.match('./offline.html')||new Response('Sem conexão',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}})
   }
  })());return;
 }
 event.respondWith((async()=>{
  const cache=await caches.open(STATIC);
  // Critical interface scripts/styles prefer the network when online to avoid stale maps on desktop.
  if(/\/(app|mapa|upgrade|agenda|resumo)\.(js|css)$/.test(url.pathname)){
   try{const fresh=await fetch(req,{cache:'no-store'});if(fresh.ok){await cache.put(req,fresh.clone());return fresh}}catch{}
   const previous=await cache.match(req,{ignoreSearch:true});if(previous)return previous;
   return new Response('Recurso offline indisponível',{status:503});
  }
  const found=await cache.match(req,{ignoreSearch:true});
  if(found){event.waitUntil(fetch(req).then(r=>r.ok?cache.put(req,r.clone()):null).catch(()=>{}));return found}
  try{const response=await fetch(req);if(response.ok&&['script','style','image','manifest'].includes(req.destination))cache.put(req,response.clone()).catch(()=>{});return response}catch{return new Response('Recurso offline indisponível',{status:503})}
 })());
});