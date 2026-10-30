/* Informational monitoring of publicly available institutional sources. Not an official alert channel. */
(()=>{'use strict';
const B=window.OrientaBorder;
const citySelect=document.getElementById('alert-city'),langSelect=document.getElementById('alert-lang');
const $=id=>document.getElementById(id);
const pack=window.OrientaLanguagePack;
const sources={
 foz:[
  {name:'Paraná contra a Dengue — Foz do Iguaçu',level:'Município / Paraná',url:'https://www.dengue.pr.gov.br/Endereco/Foz-do-Iguacu',note:'Boletins epidemiológicos e dados da 9ª Regional de Saúde'},
  {name:'CIEVS / Secretaria da Saúde do Paraná',level:'Estado do Paraná',url:'https://www.saude.pr.gov.br/Pagina/Centro-de-Informacoes-Estrategicas-em-Vigilancia-em-Saude-CIEVS',note:'Vigilância e resposta a emergências, incluindo a rede municipal de Foz'},
  {name:'Secretaria da Saúde do Paraná — Dengue',level:'Estado do Paraná',url:'https://www.saude.pr.gov.br/Editoria/Dengue',note:'Informações e ações estaduais de prevenção'},
  {name:'Ministério da Saúde — Boletins Epidemiológicos',level:'Governo federal · Brasil',url:'https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/boletins/epidemiologicos',note:'Publicações nacionais de vigilância em saúde'},
  {name:'Anvisa — Alertas epidemiológicos de fronteiras',level:'Governo federal · Brasil',url:'https://www.gov.br/anvisa/pt-br/assuntos/paf/vigilancia-epidemiologica/alertas-epidemiologicos',note:'Notas técnicas sobre riscos em portos, aeroportos e fronteiras'}
 ],
 cde:[
  {name:'Municipalidad de Ciudad del Este — Dirección de Salud',level:'Município de Ciudad del Este',url:'https://mcde.gov.py/direccion/direccion-de-salud-',note:'Contato municipal e ações de saúde locais'},
  {name:'Programa Ampliado de Inmunizaciones — Ciudad del Este',level:'Governo nacional · Paraguai / município',url:'https://pai.mspbs.gov.py/ciudad-del-este/',note:'Informações públicas sobre vacinação e cobertura'},
  {name:'DGVS — Arboviroses e boletins de Alto Paraná',level:'Departamento de Alto Paraná',url:'https://dgvs.mspbs.gov.py/arbovirosis/',note:'Boletim do departamento X — Alto Paraná, dengue e chikungunya'},
  {name:'Dirección General de Vigilancia de la Salud',level:'Governo nacional · Paraguai',url:'https://dgvs.mspbs.gov.py/',note:'Alertas e notícias oficiais de vigilância epidemiológica'},
  {name:'Dirección General de Vigilancia — Boletim semanal',level:'Governo nacional · Paraguai',url:'https://dgvs.mspbs.gov.py/boletin-epidemiologico-semanal/',note:'Boletins periódicos nacionais (conferir ano e semana publicados)'},
  {name:'Ministerio de Salud Pública y Bienestar Social',level:'Governo nacional · Paraguai',url:'https://www.mspbs.gov.py/',note:'Recomendações e comunicados do sistema público de saúde'}
 ],
 iguazu:[
  {name:'Municipalidad de Puerto Iguazú — Control de Vectores',level:'Município de Puerto Iguazú',url:'https://www.iguazu.gob.ar/vectores/',note:'Ações locais de prevenção e controle de dengue e outros vetores'},
  {name:'Ministerio de Salud Pública de Misiones',level:'Província de Misiones',url:'https://salud.misiones.gob.ar/',note:'Notícias provinciais de saúde, incluindo Puerto Iguazú'},
  {name:'Vigilancia Epidemiológica de Misiones',level:'Província de Misiones',url:'https://salud.misiones.gob.ar/vigilancia-epidemiologica/',note:'Protocolos, guias e comunicados epidemiológicos'},
  {name:'Ministerio de Salud — Epidemiología',level:'Governo nacional · Argentina',url:'https://www.argentina.gob.ar/salud/epidemiologia',note:'Boletins, alertas e vigilância epidemiológica nacional'},
  {name:'Boletín Epidemiológico Nacional',level:'Governo nacional · Argentina',url:'https://www.argentina.gob.ar/salud/epidemiologia',note:'Acompanhe os informes semanais e notícias de saúde pública'}
 ]
};
const emergency={foz:['192','SAMU'],cde:['141','SEME'],iguazu:['107','Emergências médicas']};
const i18n={
 'pt-BR':{sources:'Acompanhe os órgãos oficiais',news:'Publicações recentes das fontes monitoradas',empty:'Nenhuma publicação automática foi confirmada para esta localidade. Acesse os órgãos oficiais abaixo.',status:'Publicações oficiais monitoradas',stale:'Dados automáticos podem estar desatualizados',pending:'Atualização automática ainda não confirmada',checked:'Última consulta automática',none:'Ainda não houve consulta automática bem-sucedida',link:'Consultar fonte oficial',date:'Publicado em',scope:'Abrangência',notRealtime:'Não é vigilância em tempo real. A ausência de publicações não significa ausência de risco.',reload:'Atualizar página'},
 es:{sources:'Fuentes oficiales de salud',news:'Publicaciones recientes de fuentes monitoreadas',empty:'No se han confirmado publicaciones automáticas para esta ciudad. Consulte las fuentes oficiales.',status:'Publicaciones oficiales monitoreadas',stale:'Los datos automáticos pueden estar desactualizados',pending:'Actualización automática aún no confirmada',checked:'Última consulta automática',none:'No se ha confirmado ninguna consulta automática',link:'Ver fuente oficial',date:'Publicado el',scope:'Ámbito',notRealtime:'No es vigilancia en tiempo real. La ausencia de publicaciones no significa ausencia de riesgos.',reload:'Actualizar página'},
 en:{sources:'Official public health sources',news:'Recent monitored publications',empty:'No automated publications have been confirmed for this area. Please consult official sources.',status:'Monitored official publications',stale:'Automated information may be out of date',pending:'Automated update not yet confirmed',checked:'Last automated check',none:'No successful automated check confirmed yet',link:'View official source',date:'Published',scope:'Scope',notRealtime:'Not real-time surveillance. No new publications does not mean no health risks.',reload:'Refresh page'}
};
const safeText=t=>String(t||'').replace(/\s+/g,' ').trim().slice(0,260);
const safeUrl=u=>{try{const t=new URL(u);return t.protocol==='https:'?t.href:null}catch{return null}};
const fmt=date=>{if(!date)return '';const d=new Date(date);return Number.isFinite(d.getTime())?d.toLocaleDateString(lang()==='en'?'en-US':lang()==='es'?'es-AR':'pt-BR',{day:'2-digit',month:'short',year:'numeric'}):''};
const lang=()=>{const v=langSelect.value;return i18n[v]?v:'pt-BR'},tx=()=>i18n[lang()];
function current(){return B?.getCity?.()||'foz'}
function setLang(){try{localStorage.setItem((location.pathname.includes('OrientaSaude-Studio/')?'orientasaude-studio-language-v1':'orientasaude-language-v1'),langSelect.value)}catch{}}
function renderSources(){const city=citySelect.value;const root=$('sources');root.replaceChildren();
 sources[city].forEach(s=>{const card=document.createElement('div');card.className='source-card';const title=document.createElement('strong');title.textContent=s.name;const sub=document.createElement('small');sub.textContent=s.level+' · '+s.note;const a=document.createElement('a');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=tx().link+' ↗';card.append(title,sub,a);root.append(card)});
 const back=$('top-emergency');back.href='./fronteira.html?city='+city+'&area=emergency';back.textContent='Emergência · '+emergency[city][1]+' '+emergency[city][0];$('help-link').href=back.href;
 $('sources-title').textContent=tx().sources;$('news-title').textContent=tx().news;$('reload').textContent=tx().reload;
}
let snapshot=null;
function renderData(){const root=$('articles');root.replaceChildren();const city=citySelect.value;
 const items=Array.isArray(snapshot?.items)?snapshot.items.filter(x=>x.city===city).slice(0,12):[];
 const checked=snapshot?.checked_at;const d=checked?Date.parse(checked):NaN;const fresh=Number.isFinite(d)&&Date.now()-d<48*60*60*1000&&Date.now()-d>0;
 const anyCheck=Number.isFinite(d);
 const feedKey={foz:'parana',cde:'dgvs',iguazu:'misiones'}[city];
 const localFeed=Array.isArray(snapshot?.sources)?snapshot.sources.find(s=>s.source===feedKey):null;
 const feedOk=localFeed?.status==='checked';
 $('monitor-status').textContent=!anyCheck?tx().pending:!feedOk?'Fonte regional indisponível na última consulta; use os links oficiais':fresh?tx().status:tx().stale;
 $('monitor-note').textContent=tx().notRealtime;
 $('monitor-time').textContent=anyCheck?tx().checked+': '+new Date(d).toLocaleString(lang()==='es'?'es-AR':lang()==='en'?'en-US':'pt-BR'):tx().none;
 document.querySelector('.status-panel').dataset.health=!fresh||!feedOk?'stale':'ok';
 if(!items.length){const p=document.createElement('p');p.className='empty';p.textContent=tx().empty;root.append(p);return}
 items.forEach(x=>{const url=safeUrl(x.url);if(!url)return;const item=document.createElement('article');item.className='article';const meta=document.createElement('div');meta.className='meta';const tag=document.createElement('span');tag.className='tag';tag.textContent=safeText(x.source);const date=document.createElement('span');date.textContent=fmt(x.published);const scope=document.createElement('span');scope.textContent=safeText(x.scope||'Nacional / regional');meta.append(tag,date,scope);const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=safeText(x.title);item.append(meta,link);root.append(item)})
}
async function load(){
 snapshot=null;
 // GitHub Actions commits may not trigger another Pages deployment. Read the public
 // repository's latest snapshot first; fall back to the copy published on Pages.
 const candidates=[
  'https://raw.githubusercontent.com/DamettoJ/Desenvolvimentos-da-faculdade/main/saude-publica/alertas.json',
  '../saude-publica/alertas.json?ts='+Date.now()
 ];
 for(const url of candidates){
  try{
   const response=await fetch(url,{cache:'no-store'});
   if(!response.ok)continue;
   const data=await response.json();
   if(!data||!Array.isArray(data.items)||data.schema_version!==1)continue;
   snapshot=data;break;
  }catch{}
 }
 renderData();
}
try{citySelect.value=current()}catch{citySelect.value='foz'}
const available=pack?.options?.filter(x=>x.code!=='gn');if(available?.length){langSelect.replaceChildren();available.forEach(v=>{const el=document.createElement('option');el.value=v.code;el.textContent=(v.native||v.code);langSelect.append(el)})}
try{const v=localStorage.getItem((location.pathname.includes('OrientaSaude-Studio/')?'orientasaude-studio-language-v1':'orientasaude-language-v1'));if(v)langSelect.value=v}catch{}
citySelect.addEventListener('change',()=>{B?.setCity?.(citySelect.value);renderSources();renderData()});
langSelect.addEventListener('change',()=>{setLang();renderSources();renderData()});
$('reload').addEventListener('click',()=>location.reload());renderSources();load();
})();