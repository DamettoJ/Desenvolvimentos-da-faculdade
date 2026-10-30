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
 document.addEventListener('change',e=>{
   if(e.target.id!=='br-legacy-city')return;
   if(!B.setCity(e.target.value))return;
   window.location.assign(new URL('./fronteira.html?city='+e.target.value+'&area='+area,document.baseURI).href);
 });
 mount();
 const host=isSpecial?document.getElementById('specialty-root'):document.querySelector('.foz-standalone');
 if(host&&!document.getElementById('br-legacy-city'))new MutationObserver(mount).observe(host,{childList:true});
})();