/* Seleção de cidade persistida, navegação regional e segurança em alertas. */
(() => {
'use strict';
const B=window.OrientaBorder;if(!B)return;
const locales={
 'pt-BR':{city:'Cidade de atendimento',call:'Emergência',notice:'Em uma emergência, ligue para o serviço do país onde você está.',see:'Ver atendimento local',choose:'Selecione a cidade para mostrar estabelecimentos e especialidades locais'},
 en:{city:'Care location',call:'Emergency',notice:'In an emergency, call the service in the country where you currently are.',see:'View local care',choose:'Select a city to see local clinics and specialties'},
 es:{city:'Ciudad de atención',call:'Emergencia',notice:'En una emergencia, llama al servicio del país donde estés.',see:'Ver atención local',choose:'Selecciona la ciudad para mostrar centros y especialidades locales'}
};
const language=()=>{try{return locales[localStorage.getItem('orientasaude-language-v1')]?localStorage.getItem('orientasaude-language-v1'):'pt-BR'}catch{return 'pt-BR'}};
function cityLabel(city){return city.flag+' '+city.name+' ('+city.country+')'}
function pageURL(area){return new URL('fronteira.html?city='+B.getCity()+'&area='+area,document.baseURI).href}
function attach(){const content=document.getElementById('app-content');if(!content)return;const page=content.querySelector('.page');if(!page||page.querySelector('.br-citybar'))return;
 const city=B.cities[B.getCity()],t=locales[language()];
 const bar=document.createElement('div');bar.className='br-citybar';
 const l=document.createElement('label');l.className='br-city-label';l.htmlFor='br-home-city';l.textContent=t.city;
 const select=document.createElement('select');select.id='br-home-city';select.className='br-city-select';select.setAttribute('aria-label',t.choose);
 for(const v of Object.values(B.cities)){const option=document.createElement('option');option.value=v.id;option.textContent=cityLabel(v);option.selected=v.id===city.id;select.appendChild(option)}
 const info=document.createElement('span');info.className='br-city-info';info.textContent=city.system+' · '+t.call+': '+city.emergency+' ('+city.emergencyService+')';
 const flex=document.createElement('div');flex.className='br-city-control';flex.append(l,select);
 const quick=document.createElement('a');quick.className='br-city-explore';quick.textContent=t.see+' ↗';quick.href=pageURL('units');
 bar.append(flex,info,quick);
 const header=page.querySelector('.logo-row,.back-head');if(header)header.insertAdjacentElement('afterend',bar);else page.prepend(bar);
 updateEmergency(page,city,t);
}
function updateEmergency(page,city,t){
 if(city.id==='foz')return;
 const alertText=t.notice+' '+city.emergencyService+': '+city.emergency+'.';
 for(const el of page.querySelectorAll('.disclaimer-fixed'))el.textContent='OrientaSaúde: informação educativa, não diagnóstico. '+alertText;
 const hero=page.querySelector('button.emergency p');if(hero)hero.textContent=alertText;
 for(const el of page.querySelectorAll('.notice p,.meta-note,.info-card p,.result-page strong')){
   if(el.children.length)continue;
   if(/192\s*\(SAMU\)|SAMU\s*192|ligue\s*192/i.test(el.textContent))el.textContent=alertText;
 }
 for(const el of page.querySelectorAll('a[href="tel:192"]')){el.href='tel:'+city.emergency;el.textContent=t.call+': '+city.emergency+' ('+city.emergencyService+')';}
}
// Captura antes dos scripts de navegação por especialidade e unidades existentes.
document.addEventListener('click',event=>{
 const el=event.target.closest('[data-go],[data-specialty]');if(!el)return;
 const city=B.getCity();
 const go=el.dataset.go;
 let area=null;
 if(go==='emergency')area='emergency';
 else if(city!=='foz'&&(go==='units'))area='units';
 else if(city!=='foz'&&(go==='specialties'||el.dataset.specialty))area='specialties';
 if(!area)return;
 event.preventDefault();event.stopImmediatePropagation();
 window.location.assign(pageURL(area));
},true);
document.addEventListener('change',event=>{
 if(event.target.id!=='br-home-city')return;
 const value=event.target.value;if(!B.setCity(value))return;
 // Atualização integral de página preserva registros no localStorage e não muda idioma.
 window.location.assign(new URL('./?city='+value,document.baseURI).href);
});
const root=document.getElementById('app-content');
if(root){new MutationObserver(attach).observe(root,{childList:true});attach();}
})();