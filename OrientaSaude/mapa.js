/* The map remains offline-safe. No third-party request occurs until explicit user action. */
(() => {'use strict';
 const B=window.OrientaBorder;
 if(!B)return;
 const $=s=>document.querySelector(s), safe=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
 const cselect=$('#city'),input=$('#query'),container=$('#places'),sos=$('#sos'),map=$('#map-frame');
 let city=B.getCity(),type='all',focus=null,loaded=false,origin=null,locationBusy=false;
 cselect.value=city;
 function facilities(){
  if(city==='foz')return (window.ORIENTA_FOZ_UNITS||[]).map(([kind,name,address,phone,hours,cnes],i)=>({id:'foz'+i,kind:kind==='ubs'?'primary':'hospital',name,address,phone,hours:hours==='24h'?'24 horas, todos os dias':'Segunda a sexta, '+hours,source:'https://cnes2.datasus.gov.br/Mod_Conjunto.asp?VCo_Unidade=410830'+cnes}));
  return (B.cities[city].places||[]).map((x,i)=>({...x,id:x.id||'loc'+i,kind:x.kind==='hospital'?'hospital':'primary'}));
 }
 const all=()=>facilities();
 const locText=p=>p.name+', '+p.address+', '+B.cities[city].name+', '+B.cities[city].country;
 const route=p=>'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(locText(p))+(origin?'&origin='+encodeURIComponent(origin.kind==='gps'?(origin.lat+','+origin.lng):origin.address):'');
 const phone=p=>p.phone?'tel:+'+String(p.phone).replace(/\D/g,''):null;
 function show(){
  const c=B.cities[city],items=all().filter(p=>(type==='all'||p.kind===type)&&norm(p.name+' '+p.address+' '+(p.access||'')).includes(norm(input.value)));
  $('#count').textContent=items.length+' locais encontrados';
  $('#emergency-link').href='./fronteira.html?city='+city+'&area=emergency';
  sos.innerHTML='<span>Emergência: '+safe(c.emergencyService)+'</span><a href="tel:'+safe(c.emergency)+'">'+safe(c.emergency)+'</a>';
  container.innerHTML=items.length?items.map(p=>'<article class="place '+(focus===p.id?'selected':'')+'"><div class="place-head"><h3>'+safe(p.name)+'</h3><span>'+(p.kind==='hospital'?'Hospital / UPA':'Posto / UBS')+'</span></div><p>📍 '+safe(p.address)+'</p><p>☎ '+(p.phone?safe(p.phone):'Contato não confirmado')+' · '+safe(p.hours||'Horário: confirmar')+'</p><div class="place-actions"><button type="button" data-select="'+safe(p.id)+'">Ver no mapa</button>'+(phone(p)?'<a href="'+phone(p)+'">Ligar</a>':'')+'<a href="'+route(p)+'" target="_blank" rel="noopener noreferrer">Rota</a><a href="'+safe(p.source||c.source)+'" target="_blank" rel="noopener noreferrer">Fonte</a></div></article>').join(''):'<p>Nenhum local encontrado para esta pesquisa.</p>';
  const loadButton=$('#load-map');if(loadButton)loadButton.disabled=!(focus||origin);
 }

 function status(message,state){
  const el=$('#location-status');el.textContent=message;el.dataset.state=state||'info';
 }
 function placeholder(message){
  loaded=false;map.className='map-placeholder';
  map.innerHTML='<div class="map-icon">⌖</div><p>'+safe(message)+'</p><button id="load-map" type="button">Carregar mapa</button>';
  show();
 }
 function pick(id){
  const p=all().find(x=>x.id===id);if(!p)return;
  focus=p.id;$('#map-title').textContent=p.name;$('#route').href=route(p);$('#route').hidden=false;
  placeholder('Ao clicar em Carregar mapa, o Google Maps receberá o nome e o endereço deste estabelecimento. Sua localização só será incluída na rota se você a tiver informado.');
 }
 function setOrigin(value,label){
  origin=value;focus=null;$('#map-title').textContent=label;
  $('#route').hidden=true;$('#clear-location').hidden=false;
  status('Localização definida somente nesta página. Clique em Carregar mapa para visualizá-la.','success');
  placeholder('Sua localização está definida. Clique em Carregar mapa para enviar o local ao Google Maps e visualizá-lo.');
 }
 function requestLocation(){
  if(locationBusy)return;
  if(!window.isSecureContext){
   status('Para usar o GPS, abra o aplicativo em uma conexão HTTPS segura. Você também pode informar um endereço.','error');return;
  }
  if(!navigator.geolocation){
   status('Seu navegador não oferece geolocalização. Use Informar endereço para continuar.','error');return;
  }
  locationBusy=true;const button=$('#my-location');
  button.disabled=true;button.textContent='Obtendo localização…';
  status('Aguardando a autorização de localização do navegador…','info');
  const done=()=>{locationBusy=false;button.disabled=false;button.textContent='⌖ Usar minha localização'};
  navigator.geolocation.getCurrentPosition(
   position=>{
    done();const lat=Number(position.coords.latitude),lng=Number(position.coords.longitude);
    if(!Number.isFinite(lat)||!Number.isFinite(lng)){status('O GPS retornou coordenadas inválidas. Tente novamente ou informe um endereço.','error');return}
    setOrigin({kind:'gps',lat,lng},'Minha localização (GPS)');
    status('Localização autorizada neste acesso. Precisão estimada: '+Math.round(position.coords.accuracy||0)+' metros. O aplicativo não salva suas coordenadas.','success');
   },
   error=>{
    done();
    if(error.code===1)status('A permissão foi negada. Autorize a localização nas configurações do site (ícone ao lado do endereço) ou informe seu endereço manualmente.','error');
    else if(error.code===2)status('O navegador não conseguiu determinar sua posição. Verifique o GPS e a conexão ou informe um endereço.','error');
    else status('A localização demorou para responder. Tente novamente ou informe um endereço.','error');
   },
   {enableHighAccuracy:true,timeout:14000,maximumAge:60000}
  );
 }
 function load(){
  if(loaded || (!focus&&!origin))return;
  const p=focus?all().find(x=>x.id===focus):null;
  if(focus&&!p)return;
  const place=p?locText(p):origin.kind==='gps'?(origin.lat+','+origin.lng):origin.address;
  const iframe=document.createElement('iframe');
  iframe.title=p?'Mapa de '+p.name:'Mapa da localização informada';
  iframe.referrerPolicy='strict-origin-when-cross-origin';
  iframe.loading='lazy';iframe.allowFullscreen=true;
  iframe.src='https://maps.google.com/maps?q='+encodeURIComponent(place)+'&output=embed';
  map.replaceChildren(iframe);map.className='map-placeholder loaded';loaded=true;
 }
 document.addEventListener('click',e=>{
  if(e.target.id==='load-map'){load();return}
  if(e.target.id==='my-location'){requestLocation();return}
  if(e.target.id==='manual-location-toggle'){
   const form=$('#manual-location-form');form.hidden=!form.hidden;
   e.target.setAttribute('aria-expanded',String(!form.hidden));
   if(!form.hidden)$('#manual-location').focus();
   return;
  }
  if(e.target.id==='clear-location'){
   origin=null;focus=null;$('#clear-location').hidden=true;$('#route').hidden=true;
   $('#map-title').textContent='Selecione um estabelecimento ou sua localização';
   status('Localização retirada desta página. Nenhuma coordenada foi salva.','info');
   placeholder('Selecione um estabelecimento, use o GPS ou informe um endereço para visualizar a região.');
   return;
  }
  const b=e.target.closest('[data-select]');
  if(b){pick(b.dataset.select);return}
  const t=e.target.closest('[data-type]');
  if(t){type=t.dataset.type;document.querySelectorAll('[data-type]').forEach(v=>v.classList.toggle('active',v===t));show()}
 });
 document.addEventListener('submit',e=>{
  if(e.target.id!=='manual-location-form')return;
  e.preventDefault();
  const address=$('#manual-location').value.trim();
  if(address.length<4){status('Informe um endereço, bairro ou ponto de referência com pelo menos quatro caracteres.','error');return}
  setOrigin({kind:'manual',address},'Endereço informado');
  e.target.hidden=true;$('#manual-location-toggle').setAttribute('aria-expanded','false');
 });
 cselect.addEventListener('change',()=>{
  if(!B.setCity(cselect.value))return;
  city=cselect.value;focus=null;loaded=false;input.value='';
  $('#route').hidden=true;
  $('#map-title').textContent=origin?(origin.kind==='gps'?'Minha localização (GPS)':'Endereço informado'):'Selecione um estabelecimento ou sua localização';
  placeholder(origin?'Sua localização continua definida. Clique em Carregar mapa para visualizá-la, ou escolha uma unidade da nova cidade.':'Selecione uma unidade, use o GPS ou informe um endereço para visualizar a região.');
  history.replaceState(null,'','?city='+city);
 });
 input.addEventListener('input',show);show();
})();