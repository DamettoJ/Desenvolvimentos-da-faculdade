/* Diretório de especialidades do OrientaSaúde: HTML/CSS/JS, sem servidor. */
(() => {
'use strict';
const info=window.ORIENTA_SPECIALTIES;
const root=document.getElementById('specialty-root');
if(!info||!root)return;
const dict={
'pt-BR':{back:'Voltar ao OrientaSaúde',title:'Especialidades médicas e de saúde',sub:'Encontre áreas de atendimento, clínicas, profissionais divulgados e contatos públicos em Foz do Iguaçu.',search:'Buscar especialidade, profissional ou estabelecimento',all:'Todas',medical:'Especialidades médicas',multi:'Outras áreas da saúde',sus:'Rede SUS',locations:'locais',professionals:'Profissionais divulgados',unknown:'Nome do profissional não confirmado nesta fonte. Consulte a equipe da clínica.',phone:'Contato',address:'Endereço',service:'Atendimento',call:'Ligar',map:'Como chegar',source:'Ver fonte',result:'especialidades encontradas',empty:'Nenhuma especialidade encontrada. Experimente outra busca.',data:'Fontes consultadas em 30/10/2026',important:'Este diretório reúne exemplos verificados de serviços existentes, não uma lista exaustiva de profissionais da cidade. Equipes, convênios, telefones e horários podem mudar. Confirme disponibilidade, nome do profissional, CRM/RQE ou registro profissional e forma de atendimento antes de se deslocar.',public:'Para consultas pelo SUS, busque orientação na UBS e confirme a necessidade de encaminhamento ou regulação. A presença da especialidade no cadastro não garante vaga imediata.',emergency:'Em emergência com risco imediato, ligue 192 (SAMU).',none:'Telefone não divulgado'},
'en':{back:'Back to OrientaSaúde',title:'Medical and healthcare specialties',sub:'Find specialties, clinics, publicly listed professionals and contact details in Foz do Iguaçu.',search:'Search specialty, professional or clinic',all:'All',medical:'Medical specialties',multi:'Other health services',sus:'Public healthcare (SUS)',locations:'locations',professionals:'Publicly listed professionals',unknown:'Professional name not confirmed in this source. Please ask the clinic.',phone:'Contact',address:'Address',service:'Care access',call:'Call',map:'Directions',source:'Source',result:'matching specialties',empty:'No results. Try a different search.',data:'Sources checked October 30, 2026',important:'This is a sourced sample of local services, not a complete list of all doctors. Teams, insurance, phone numbers and availability may change. Confirm the clinician, their professional registration and appointment conditions before visiting.',public:'For public SUS appointments, ask your local primary-care clinic about referrals and scheduling. A listed specialty does not guarantee an available appointment.',emergency:'In a life-threatening emergency in Brazil, call 192 (SAMU).',none:'Phone not published'},
'es':{back:'Volver a OrientaSaúde',title:'Especialidades médicas y de salud',sub:'Busca especialidades, clínicas, profesionales publicados y contactos en Foz do Iguaçu.',search:'Buscar especialidad, profesional o clínica',all:'Todas',medical:'Especialidades médicas',multi:'Otras áreas de salud',sus:'Atención pública (SUS)',locations:'establecimientos',professionals:'Profesionales publicados',unknown:'El nombre del profesional no consta en esta fuente. Consulta en la clínica.',phone:'Contacto',address:'Dirección',service:'Acceso a la atención',call:'Llamar',map:'Cómo llegar',source:'Fuente',result:'especialidades encontradas',empty:'No hay resultados. Prueba otra búsqueda.',data:'Fuentes consultadas el 30/10/2026',important:'Este directorio contiene una selección verificada, no una lista completa de médicos. Equipos, seguros, teléfonos y disponibilidad pueden cambiar. Confirma el profesional, su registro y las condiciones antes de acudir.',public:'Para citas del SUS, consulta en tu centro de atención primaria sobre derivaciones y programación. No se garantiza una cita inmediata.',emergency:'Ante una emergencia grave en Brasil, llama al SAMU al 192.',none:'Teléfono no publicado'}
};
const pack=window.OrientaLanguagePack;
for(const loc of (pack?.options||[])) if(!dict[loc.code]){
 const ui=pack.tipsUI[loc.code]||{};
 dict[loc.code]={...dict['pt-BR'],back:ui.back||'Voltar ao OrientaSaúde',title:ui.specialties||'Especialidades médicas e de saúde',all:ui.all||'Todas',medical:ui.specialties||'Especialidades médicas',phone:ui.phone||'Contato',address:ui.location||'Endereço',call:ui.call||'Ligar',map:ui.navigate||'Como chegar',source:ui.source||'Ver fonte',important:pack.notes[loc.code]||dict['pt-BR'].important,emergency:pack.notes[loc.code]||dict['pt-BR'].emergency};
}
let lang='pt-BR';try{const saved=localStorage.getItem('orientasaude-studio-language-v1');if(dict[saved])lang=saved}catch{}
let category='all';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
const norm=s=>String(s??'').toLocaleLowerCase(lang).normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const t=()=>dict[lang];
const toName=s=>lang==='en'?s.en:lang==='es'?s.es:s.name;
const nameSpec=id=>toName(info.specialties.find(s=>s.id===id)||{name:id,en:id,es:id});
const byId=Object.fromEntries(info.clinics.map(c=>[c.id,c]));
const linkCall=n=>'tel:+55'+String(n).replace(/\D/g,'');
const mapLink=(c)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(c.name+', '+c.address+', Foz do Iguaçu, Paraná, Brasil');
function facility(c,sp){
 const doctors=info.professionals.filter(p=>p.clinic===c.id&&p.spec===sp.id);
 const badge=c.access==='SUS'?'spec-public':'spec-private';
 return `<article class="spec-facility"><div class="spec-facility-head"><h4>${safe(c.name)}</h4><span class="spec-access ${badge}">${safe(c.access)}</span></div>
 <p class="spec-detail"><strong>${t().address}:</strong> ${safe(c.address)}, Foz do Iguaçu – PR</p>
 <p class="spec-detail"><strong>${t().phone}:</strong> ${c.phone?`<a href="${linkCall(c.phone)}">${safe(c.phone)}</a>`:t().none}</p>
 <div class="spec-doctors"><strong>${t().professionals}</strong>${doctors.length?`<ul>${doctors.map(d=>`<li><b>${safe(d.name)}</b><span>${safe(d.registration)}</span></li>`).join('')}</ul>`:`<p>${t().unknown}</p>`}</div>
 <div class="spec-actions">${c.phone?`<a class="spec-call" href="${linkCall(c.phone)}">${t().call}</a>`:''}<a href="${mapLink(c)}" target="_blank" rel="noopener noreferrer">${t().map}</a><a href="${safe(c.source)}" target="_blank" rel="noopener noreferrer">${t().source}</a></div></article>`;
}
function section(s){const places=s.clinics.map(id=>byId[id]).filter(Boolean);const name=toName(s);
 const people=info.professionals.filter(p=>places.some(c=>c.id===p.clinic)&&p.spec===s.id);
 const search=norm([s.name,s.en,s.es,...places.map(c=>c.name+' '+c.address),...people.map(p=>p.name)].join(' '));
 return `<details class="spec-section" data-id="${safe(s.id)}" data-kind="${s.kind}" data-has-sus="${places.some(c=>c.access==='SUS')?'1':'0'}" data-search="${safe(search)}"><summary><span class="spec-summary-icon" aria-hidden="true">${s.kind==='medica'?'✚':'♥'}</span><span class="spec-summary-title"><b>${safe(name)}</b><small>${places.length} ${t().locations}</small></span><span class="spec-chevron" aria-hidden="true">⌄</span></summary><div class="spec-cards">${places.map(c=>facility(c,s)).join('')}</div></details>`;
}
function render(){const x=t();document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 document.title=x.title+' | OrientaSaúde';
 root.innerHTML=`<header class="spec-header"><a href="./" class="spec-back">← ${x.back}</a><div class="spec-identity"><span class="spec-logo">✚</span><strong>Orienta<span>Saúde</span></strong></div><label class="spec-lang-label">Idioma / Language <select id="spec-lang" aria-label="Idioma / Language" dir="ltr">${(pack?.options||[]).map(v=>`<option value="${v.code}" ${lang===v.code?'selected':''}>${safe(v.native)}</option>`).join('')}</select></label></header>
 <main class="spec-content"><div class="spec-intro"><h1>${x.title}</h1><p>${x.sub}</p><small>${x.data}</small></div>
 <div class="spec-emergency">${x.emergency} <a href="tel:192">192</a></div>
 <div class="spec-controls"><label class="spec-search-label" for="spec-search">${x.search}</label><input id="spec-search" type="search" placeholder="${x.search}" autocomplete="off"/><div class="spec-tabs" role="group" aria-label="${x.title}">${[['all',x.all],['medica',x.medical],['multi',x.multi],['sus',x.sus]].map(([id,label])=>`<button type="button" data-spec-filter="${id}" aria-pressed="${category===id}">${label}</button>`).join('')}</div></div>
 <p class="spec-results" id="spec-results" role="status"></p><div class="spec-list" id="spec-list">${info.specialties.map(section).join('')}</div><p id="spec-empty" hidden>${x.empty}</p>
 <footer class="spec-disclaimer"><p>${x.important}</p><p>${x.public}</p></footer></main>`;
 const hash=decodeURIComponent(location.hash.slice(1));const target=hash&&root.querySelector(`.spec-section[data-id="${CSS.escape(hash)}"]`);if(target){target.open=true;target.scrollIntoView({block:'start'});}
 update();
}
function update(){const query=norm(document.getElementById('spec-search')?.value||'');let count=0;
 root.querySelectorAll('.spec-section').forEach(el=>{const catOk=category==='all'||(category==='sus'?el.dataset.hasSus==='1':el.dataset.kind===category);const visible=catOk&&(!query||el.dataset.search.includes(query));el.hidden=!visible;if(visible){count++;if(query)el.open=true;}});
 root.querySelectorAll('[data-spec-filter]').forEach(el=>{const on=el.dataset.specFilter===category;el.setAttribute('aria-pressed',String(on));el.classList.toggle('selected',on);});
 document.getElementById('spec-results').textContent=count+' '+t().result;document.getElementById('spec-empty').hidden=count>0;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-spec-filter]');if(b){category=b.dataset.specFilter;update();}});
document.addEventListener('input',e=>{if(e.target.id==='spec-search')update()});
document.addEventListener('change',e=>{if(e.target.id==='spec-lang'&&dict[e.target.value]){lang=e.target.value;try{localStorage.setItem('orientasaude-studio-language-v1',lang)}catch{}render()}});
render();
})();