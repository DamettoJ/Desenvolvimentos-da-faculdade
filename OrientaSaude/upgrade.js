/* OrientaSaúde UX enhancements. Preserves existing app.js state and local records. */
(() => {'use strict';const root=document.getElementById('app-content');if(!root)return;
const $=(s,r=document)=>r.querySelector(s);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const T={
 'pt-BR':{search:'Buscar serviços e informações',placeholder:'Ex.: hospital, cardiologia, dicas...',map:'Ver mapa interativo de atendimento',mapSub:'Hospitais, postos, contatos e rotas',agenda:'Abrir meu calendário',print:'Resumo para consulta',install:'Instalar aplicativo',contrast:'Contraste reforçado',privacy:'Ocultar prévias de sintomas',privacyNote:'Oculta textos nesta tela, mas não criptografa os dados salvos no navegador.',show:'Mostrar detalhes nesta tela',hide:'Ocultar detalhes',purge:'Apagar relatos anteriores a',clear:'Excluir relatos antigos',week:'Compromissos nos próximos 7 dias',noWeek:'Seus compromissos aparecem aqui quando cadastrados',tip:'Dicas de Saúde',units:'Unidades de saúde',specialties:'Especialidades',calendar:'Calendário',emergency:'Emergência',records:'Meus registros',symptoms:'Descrever sintomas',maps:'Mapa',query:'Pesquisar',results:'Escolha uma área de atendimento',close:'Fechar resultados'},
 en:{search:'Search healthcare and information',placeholder:'For example: hospital, cardiology, tips...',map:'View interactive care map',mapSub:'Hospitals, clinics, contacts and directions',agenda:'Open my calendar',print:'Summary for appointment',install:'Install app',contrast:'High contrast',privacy:'Hide symptom previews',privacyNote:'Hides text on screen but does not encrypt saved browser data.',show:'Show details on this screen',hide:'Hide details',purge:'Delete reports older than',clear:'Delete old reports',week:'Appointments in the next 7 days',noWeek:'Appointments appear here when added',tip:'Health tips',units:'Healthcare facilities',specialties:'Specialties',calendar:'Calendar',emergency:'Emergency',records:'My records',symptoms:'Describe symptoms',maps:'Map',query:'Search',results:'Choose a care section',close:'Close results'},
 es:{search:'Buscar atención e información',placeholder:'Ej.: hospital, cardiología, consejos...',map:'Ver mapa interactivo',mapSub:'Hospitales, centros de salud y rutas',agenda:'Abrir mi calendario',print:'Resumen para consulta',install:'Instalar aplicación',contrast:'Alto contraste',privacy:'Ocultar datos de síntomas',privacyNote:'Oculta textos en pantalla, pero no cifra los datos guardados.',show:'Mostrar detalles',hide:'Ocultar detalles',purge:'Borrar relatos anteriores a',clear:'Borrar relatos antiguos',week:'Citas en los próximos 7 días',noWeek:'Tus citas aparecerán aquí al guardarlas',tip:'Consejos de salud',units:'Centros de salud',specialties:'Especialidades',calendar:'Calendario',emergency:'Emergencia',records:'Mis registros',symptoms:'Describir síntomas',maps:'Mapa',query:'Buscar',results:'Elige una sección de atención',close:'Cerrar resultados'}
};
const lang=()=>{try{return localStorage.getItem('orientasaude-language-v1')||'pt-BR'}catch{return 'pt-BR'}};
const tx=()=>T[lang()]||T['pt-BR'];const city=()=>window.OrientaBorder?.getCity?.()||'foz';
const prefsKey='orientasaude-ux-prefs';let prefs={};try{prefs=JSON.parse(localStorage.getItem(prefsKey)||'{}')||{}}catch{}
const save=()=>{try{localStorage.setItem(prefsKey,JSON.stringify(prefs))}catch{}};
const readData=()=>{try{return JSON.parse(localStorage.getItem('orientasaude-demo-v1')||'{}')}catch{return {}}};
const address=(file)=>new URL('./'+file,document.baseURI).href;
const setContrast=()=>document.documentElement.classList.toggle('os-high-contrast',!!prefs.contrast);setContrast();
const actions=[['symptoms','symptoms','user'],['units','units','pin'],['specialties','specialties','stethoscope'],['tip','education','book'],['records','records','records'],['calendar','agenda','calendar'],['maps','mapa','map']];
function navigate(to){if(to==='agenda')location.assign(address('agenda.html'));else if(to==='mapa')location.assign(address('mapa.html?city='+city()));else if(to==='education')location.assign(address('dicas.html?city='+city()));else {const b=root.querySelector('button[data-go="'+to+'"]')||document.querySelector('button[data-go="'+to+'"]');if(b)b.click();else if(to==='units'||to==='specialties')location.assign(address('fronteira.html?city='+city()+'&area='+to))}}
function weekCount(){const a=readData(),rs=Array.isArray(a.reminders)?a.reminders:[];const start=new Date();start.setHours(0,0,0,0);const end=new Date(start.getTime()+8*86400000);return rs.filter(e=>{const d=new Date(e.date+'T'+(e.time||'12:00')+':00');return !e.done&&d>=start&&d<end}).length}
function ensureHome(page){if($('.os-searchbox',page))return;
 const t=tx(),emergency=$('.emergency',page),hero=$('.hero',page);if(!emergency||!hero)return;
 const search=document.createElement('section');search.className='os-searchbox';search.innerHTML='<label for="os-lookup">'+esc(t.search)+'</label><div class="os-searchinput"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></svg><input type="search" id="os-lookup" placeholder="'+esc(t.placeholder)+'" autocomplete="off" aria-controls="os-suggestions" aria-expanded="false"></div><div id="os-suggestions" class="os-suggestions" hidden></div>';
 emergency.insertAdjacentElement('afterend',search);
 const map=document.createElement('a');map.className='os-map-callout';map.href=address('mapa.html?city='+city());map.innerHTML='<span class="os-map-symbol">⌖</span><span><strong>'+esc(t.map)+'</strong><small>'+esc(t.mapSub)+'</small></span><span aria-hidden="true">→</span>';
 const grid=$('.icon-grid',page);if(grid)grid.insertAdjacentElement('afterend',map);
 const count=weekCount(),summary=document.createElement('div');summary.className='os-week';summary.innerHTML='<span class="os-week-icon">◷</span><span>'+esc(count?String(count)+' · '+t.week:t.noWeek)+'</span><a href="'+address('agenda.html')+'">'+esc(t.agenda)+' →</a>';
 map.insertAdjacentElement('afterend',summary);
 const install=document.createElement('button');install.className='os-home-install';install.type='button';install.dataset.osInstall='1';install.textContent=t.install;summary.insertAdjacentElement('afterend',install);
}
const keywords={symptoms:['sintoma','febre','dor','tosse','náusea','symptom','fever','pain','síntoma'],units:['hospital','upa','posto','ubs','unidade','atendimento','clínica','clinic','centro de saúde'],specialties:['cardiologia','especialidade','médico','pediatria','ortopedia','psicologia','specialty'],education:['dica','higiene','prevenção','alimentação','saúde','tip','prevención'],records:['registro','histórico','relato','history'],agenda:['calendário','agenda','lembrete','consulta','medicamento','appointment'],mapa:['mapa','rota','localização','map','direção'],emergency:['emergência','urgência','samu','emergency']};
function searchResult(input){const list=$('#os-suggestions'),t=tx();if(!list)return;
 const raw=input.value.trim(),needle=raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(!needle){list.hidden=true;input.setAttribute('aria-expanded','false');return}
 const words=Object.entries(keywords).filter(([k,ws])=>([t[k==='education'?'tip':k==='agenda'?'calendar':k==='mapa'?'maps':k]||k,...ws]).some(w=>w.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(needle))).map(x=>x[0]);
 if(!words.length){list.hidden=false;list.innerHTML='<p>'+esc(t.results)+'</p>'+['units','specialties','education'].map(x=>'<button type="button" data-os-to="'+x+'">'+esc(t[x==='education'?'tip':x])+' →</button>').join('');return}
 list.hidden=false;list.innerHTML=words.slice(0,6).map(x=>'<button type="button" data-os-to="'+x+'">'+esc(t[x==='education'?'tip':x==='agenda'?'calendar':x==='mapa'?'maps':x])+' →</button>').join('');input.setAttribute('aria-expanded','true');
}
function ensureReminders(page){if($('.os-agenda-link',page))return;const title=$('.headline-with-action',page);if(!title)return;const link=document.createElement('a');link.href=address('agenda.html');link.className='os-agenda-link';link.textContent='▦ '+tx().agenda;title.insertAdjacentElement('afterend',link)}
function ensureRecords(page){if($('.os-reveal-bar',page))return;
 const wrap=document.createElement('div');wrap.className='os-reveal-bar';wrap.innerHTML='<a href="'+address('resumo.html')+'">▤ '+esc(tx().print)+'</a><button type="button" data-os-reveal>'+esc(tx().show)+'</button>';
 const h=$('.headline-with-action',page);if(h)h.insertAdjacentElement('afterend',wrap);page.classList.toggle('os-private',!!prefs.privacy)}
function ensureProfile(page){if($('.os-preferences',page))return;
 const card=document.createElement('section');card.className='white-card os-preferences';card.innerHTML='<h3>Recursos de acessibilidade e privacidade</h3><label><input type="checkbox" id="os-contrast" '+(prefs.contrast?'checked':'')+'> '+esc(tx().contrast)+'</label><label><input type="checkbox" id="os-privacy" '+(prefs.privacy?'checked':'')+'> '+esc(tx().privacy)+'</label><p>'+esc(tx().privacyNote)+'</p><div class="os-privacy-tools"><a href="'+address('agenda.html')+'">'+esc(tx().agenda)+'</a><a href="'+address('resumo.html')+'">'+esc(tx().print)+'</a><button type="button" data-os-install>'+esc(tx().install)+'</button></div><hr><label for="os-retention">'+esc(tx().purge)+'</label><select id="os-retention"><option value="30">30 dias</option><option value="90">90 dias</option><option value="365">365 dias</option></select><button type="button" class="os-delete" data-os-purge>'+esc(tx().clear)+'</button><small>Excluir relatos antigos é permanente. Não afeta lembretes. Sempre confirme antes de apagar.</small>';
 const privacy=[...page.querySelectorAll('.white-card')].find(x=>x.textContent.includes('Privacidade e armazenamento'));
 if(privacy)privacy.insertAdjacentElement('afterend',card);else page.appendChild(card)}
function ensureHealth(page){if($('.os-health-shortcuts',page))return;const section=document.createElement('section');section.className='os-health-shortcuts';section.innerHTML='<a href="'+address('mapa.html?city='+city())+'">⌖ '+esc(tx().map)+'</a><a href="'+address('agenda.html')+'">▦ '+esc(tx().agenda)+'</a>';
 const first=$('.feature-card',page)||$('.health-grid',page);first?.insertAdjacentElement('afterend',section)}
function paint(){const page=$('.page',root);if(!page)return;
 if(page.classList.contains('home-page'))ensureHome(page);
 else if(page.querySelector('#reminder-form')||page.querySelector('.headline-with-action [data-action=new-reminder]'))ensureReminders(page);
 else if(page.querySelector('.profile-intro'))ensureProfile(page);
 else if(page.querySelector('[data-open-record]')||page.querySelector('.headline-with-action [data-go=symptoms]'))ensureRecords(page);
 else if(page.querySelector('.feature-card'))ensureHealth(page);
}
root.addEventListener('input',e=>{if(e.target.id==='os-lookup')searchResult(e.target)});
root.addEventListener('keydown',e=>{if(e.target.id==='os-lookup'&&e.key==='Escape'){e.target.value='';searchResult(e.target)}if(e.target.id==='os-lookup'&&e.key==='Enter'){e.preventDefault();const b=$('#os-suggestions button');b?.click()}});
root.addEventListener('change',e=>{if(e.target.id==='os-contrast'){prefs.contrast=e.target.checked;save();setContrast()}if(e.target.id==='os-privacy'){prefs.privacy=e.target.checked;save()}});
root.addEventListener('click',e=>{const to=e.target.closest('[data-os-to]');if(to){navigate(to.dataset.osTo);return}
 if(e.target.closest('[data-os-install]')){window.OrientaInstall?.request();return}
 const reveal=e.target.closest('[data-os-reveal]');if(reveal){const page=reveal.closest('.page');page.classList.toggle('os-revealed');reveal.textContent=page.classList.contains('os-revealed')?tx().hide:tx().show;return}
 if(e.target.closest('[data-os-purge]')){const days=Number($('#os-retention')?.value||90);if(!Number.isInteger(days)||days<30)return;const data=readData(),before=Array.isArray(data.records)?data.records.length:0;const cutoff=Date.now()-days*86400000;
 const eligible=(Array.isArray(data.records)?data.records:[]).filter(x=>{const time=Date.parse(x.createdAt);return Number.isFinite(time)&&time<cutoff}).length;
 if(!eligible){alert('Nenhum relato anterior a '+days+' dias foi encontrado.');return;}
 const message='Excluir definitivamente '+eligible+' relatos anteriores a '+days+' dias? Esta ação não pode ser desfeita.';
 if(!confirm(message))return;
 data.records=(Array.isArray(data.records)?data.records:[]).filter(x=>{const t=Date.parse(x.createdAt);return !Number.isFinite(t)||t>=cutoff});
 try{localStorage.setItem('orientasaude-demo-v1',JSON.stringify(data));alert('Excluídos: '+(before-data.records.length)+' relatos.');location.reload()}catch{alert('O navegador não permitiu salvar a alteração.')}return}
});
new MutationObserver(paint).observe(root,{childList:true});paint();
})();