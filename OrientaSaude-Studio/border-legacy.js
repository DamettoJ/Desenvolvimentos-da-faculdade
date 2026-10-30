/* Foz: preserva catálogo antigo, mas permite mudar para os outros lados da fronteira. */
(() => {
 'use strict';const B=window.OrientaBorder;if(!B)return;
 const isSpecial=location.pathname.endsWith('especialidades.html');
 const area=isSpecial?'specialties':'units';
 if(B.getCity()!=='foz'){
   window.location.replace(new URL('./fronteira.html?city='+B.getCity()+'&area='+area,document.baseURI).href);
   return;
 }
 function mount(){
   if(document.getElementById('br-legacy-city'))return;
   const host=isSpecial?document.getElementById('specialty-root'):document.querySelector('.foz-standalone');
   if(!host)return;
   const label=document.createElement('label');label.className='br-legacy-city';label.textContent='Atendimento em';
   const select=document.createElement('select');select.id='br-legacy-city';select.className='br-city-select';
   for(const city of Object.values(B.cities)){
     const option=document.createElement('option');option.value=city.id;option.textContent=city.flag+' '+city.name+' ('+city.country+')';option.selected=city.id==='foz';select.appendChild(option);
   }
   label.append(select);host.prepend(label);
 }
function mountLanguage(){
 if(isSpecial || document.getElementById('br-units-language'))return;
 const host=document.querySelector('.foz-standalone'),pack=window.OrientaLanguagePack;
 if(!host||!pack)return;
 const lang=pack.locale();
 document.documentElement.lang=lang;
 document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 const row=document.createElement('div');row.className='br-unit-langrow';
 const label=document.createElement('label');label.htmlFor='br-units-language';label.textContent=pack.translate(lang,'Escolher idioma');
 const sel=document.createElement('select');sel.id='br-units-language';sel.dir='ltr';sel.setAttribute('aria-label',label.textContent);
 for(const option of pack.options){const e=document.createElement('option');e.value=option.code;e.textContent=option.native;e.selected=option.code===lang;sel.append(e)}
 row.append(label,sel);
 const title=host.querySelector('.foz-directory>h2');
 if(title)title.textContent=pack.translate(lang,'Unidades de saúde')+' · Foz do Iguaçu';
 for(const el of host.querySelectorAll('.foz-unit strong')){const original=el.textContent.replace(/:$/,'').trim();el.textContent=pack.translate(lang,original)+':';}
 if(lang!=='pt-BR' && pack.notes[lang]){
  const note=document.createElement('small');note.className='br-unit-langnote';note.textContent=pack.notes[lang];row.append(note);
 }
 host.prepend(row);
}
 document.addEventListener('change',e=>{
   if(e.target.id==='br-units-language'){
     try{localStorage.setItem('orientasaude-studio-language-v1',e.target.value)}catch{}
     location.reload();return;
   }
   if(e.target.id!=='br-legacy-city')return;
   if(!B.setCity(e.target.value))return;
   window.location.assign(new URL('./fronteira.html?city='+e.target.value+'&area='+area,document.baseURI).href);
 });
 mount();mountLanguage();
 const host=isSpecial?document.getElementById('specialty-root'):document.querySelector('.foz-standalone');
 if(host&&!document.getElementById('br-legacy-city'))new MutationObserver(mount).observe(host,{childList:true});
})();