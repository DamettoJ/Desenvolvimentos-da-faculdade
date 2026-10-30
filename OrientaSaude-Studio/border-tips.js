/* O conteúdo educativo é geral, mas a prevenção local e a urgência seguem o país selecionado. */
(() => {
'use strict';const B=window.OrientaBorder;if(!B)return;
const translations={
 'pt-BR':{city:'Cidade',source:'Referências de saúde locais',warn:'Vacinação, horários e serviços dependem do país: confira recomendações oficiais para a sua cidade.',service:'Em emergência médica',call:'Ligar',more:'Saúde pública local'},
 en:{city:'City',source:'Local health resources',warn:'Vaccination schedules and health services vary by country. Check official guidance where you are.',service:'For a medical emergency',call:'Call',more:'Local public healthcare'},
 es:{city:'Ciudad',source:'Recursos sanitarios locales',warn:'Los calendarios de vacunación y servicios varían según el país. Consulta recomendaciones oficiales para tu ciudad.',service:'Ante una emergencia médica',call:'Llamar',more:'Salud pública local'}
};
const pack=window.OrientaLanguagePack;
for(const loc of (pack?.options||[])) if(!translations[loc.code]){
 translations[loc.code]={...translations['pt-BR'],city:pack.translate(loc.code,'Cidade'),call:pack.translate(loc.code,'Ligar'),warn:pack.notes[loc.code]||translations['pt-BR'].warn,source:pack.translate(loc.code,'Dicas de Saúde'),service:pack.translate(loc.code,'Emergência')};
}
const lang=()=>{try{return translations[localStorage.getItem('orientasaude-studio-language-v1')]?localStorage.getItem('orientasaude-studio-language-v1'):'pt-BR'}catch{return 'pt-BR'}};
const t=()=>translations[lang()];
const sourceFor=id=>id==='foz'?'https://www.gov.br/saude/pt-br':id==='cde'?'https://www.mspbs.gov.py/':'https://salud.misiones.gob.ar/';
function update(){
 const root=document.getElementById('tips-root');if(!root)return;
 const current=B.getCity(),city=B.cities[current],header=root.querySelector('.tips-header');if(!header)return;
 if(!root.querySelector('#tips-city')){
 const label=document.createElement('label');label.className='br-tips-city';label.textContent=t().city+':';
 const sel=document.createElement('select');sel.id='tips-city';sel.setAttribute('aria-label',t().city);for(const place of Object.values(B.cities)){const opt=document.createElement('option');opt.value=place.id;opt.textContent=place.flag+' '+place.name;opt.selected=place.id===current;sel.append(opt)}label.append(sel);header.append(label);
 }
 if(!root.querySelector('.br-tips-region')){
 const el=document.createElement('div');el.className='br-tips-region';const title=document.createElement('strong');title.textContent=city.flag+' '+city.name+' · '+t().source;
 const p=document.createElement('p');p.textContent=t().warn;
 const a=document.createElement('a');a.textContent=t().more+' ↗';a.target='_blank';a.rel='noopener noreferrer';a.href=sourceFor(current);
 el.append(title,p,a);const hero=root.querySelector('.tips-hero');hero?.insertAdjacentElement('afterend',el);
 }
 const alert=root.querySelector('.tips-emergency');if(alert){const strong=alert.querySelector('strong');if(strong)strong.textContent=t().service+': '+city.emergencyService+' '+city.emergency+'.';const a=alert.querySelector('a');if(a){a.href='tel:'+city.emergency;a.textContent='☎ '+t().call+' '+city.emergency;}}
}
document.addEventListener('change',event=>{if(event.target.id!=='tips-city')return;if(B.setCity(event.target.value))location.assign(new URL('./dicas.html?city='+event.target.value,document.baseURI).href)});
const root=document.getElementById('tips-root');if(root){new MutationObserver(update).observe(root,{childList:true});update();}
})();