/* The map remains offline-safe. No third-party request occurs until explicit user action. */
(() => {'use strict';
 const B=window.OrientaBorder;
 if(!B)return;
 const $=s=>document.querySelector(s), safe=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
 const cselect=$('#city'),input=$('#query'),container=$('#places'),sos=$('#sos'),map=$('#map-frame');
 let city=B.getCity(),type='all',focus=null,loaded=false;
 cselect.value=city;
 function facilities(){
  if(city==='foz')return (window.ORIENTA_FOZ_UNITS||[]).map(([kind,name,address,phone,hours,cnes],i)=>({id:'foz'+i,kind:kind==='ubs'?'primary':'hospital',name,address,phone,hours:hours==='24h'?'24 horas, todos os dias':'Segunda a sexta, '+hours,source:'https://cnes2.datasus.gov.br/Mod_Conjunto.asp?VCo_Unidade=410830'+cnes}));
  return (B.cities[city].places||[]).map((x,i)=>({...x,id:x.id||'loc'+i,kind:x.kind==='hospital'?'hospital':'primary'}));
 }
 const all=()=>facilities();
 const locText=p=>p.name+', '+p.address+', '+B.cities[city].name+', '+B.cities[city].country;
 const route=p=>'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(locText(p));
 const phone=p=>p.phone?'tel:+'+String(p.phone).replace(/\D/g,''):null;
 function show(){
  const c=B.cities[city],items=all().filter(p=>(type==='all'||p.kind===type)&&norm(p.name+' '+p.address+' '+(p.access||'')).includes(norm(input.value)));
  $('#count').textContent=items.length+' locais encontrados';
  $('#emergency-link').href='./fronteira.html?city='+city+'&area=emergency';
  sos.innerHTML='<span>Emergência: '+safe(c.emergencyService)+'</span><a href="tel:'+safe(c.emergency)+'">'+safe(c.emergency)+'</a>';
  container.innerHTML=items.length?items.map(p=>'<article class="place '+(focus===p.id?'selected':'')+'"><div class="place-head"><h3>'+safe(p.name)+'</h3><span>'+(p.kind==='hospital'?'Hospital / UPA':'Posto / UBS')+'</span></div><p>📍 '+safe(p.address)+'</p><p>☎ '+(p.phone?safe(p.phone):'Contato não confirmado')+' · '+safe(p.hours||'Horário: confirmar')+'</p><div class="place-actions"><button type="button" data-select="'+safe(p.id)+'">Ver no mapa</button>'+(phone(p)?'<a href="'+phone(p)+'">Ligar</a>':'')+'<a href="'+route(p)+'" target="_blank" rel="noopener noreferrer">Rota</a><a href="'+safe(p.source||c.source)+'" target="_blank" rel="noopener noreferrer">Fonte</a></div></article>').join(''):'<p>Nenhum local encontrado para esta pesquisa.</p>';
  const loadButton=$('#load-map');if(loadButton)loadButton.disabled=!focus;
 }
 function pick(id){const p=all().find(x=>x.id===id);if(!p)return;focus=p.id;loaded=false;$('#map-title').textContent=p.name;$('#route').href=route(p);$('#route').hidden=false;map.className='map-placeholder';map.innerHTML='<div class="map-icon">⌖</div><p>O Google Maps receberá o nome e endereço do estabelecimento quando você clicar abaixo. Não enviamos seus relatos de saúde.</p><button id="load-map" type="button">Carregar mapa</button>';show();}
 function load(){if(!focus||loaded)return;const p=all().find(x=>x.id===focus);if(!p)return;const iframe=document.createElement('iframe');iframe.title='Mapa de '+p.name;iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.loading='lazy';iframe.allowFullscreen=true;iframe.src='https://maps.google.com/maps?q='+encodeURIComponent(locText(p))+'&output=embed';map.replaceChildren(iframe);map.className='map-placeholder loaded';loaded=true;}
 document.addEventListener('click',e=>{if(e.target.id==='load-map'){load();return}const b=e.target.closest('[data-select]');if(b){pick(b.dataset.select);return}const t=e.target.closest('[data-type]');if(t){type=t.dataset.type;document.querySelectorAll('[data-type]').forEach(v=>v.classList.toggle('active',v===t));show()}});
 cselect.addEventListener('change',()=>{if(B.setCity(cselect.value)){city=cselect.value;focus=null;loaded=false;input.value='';map.className='map-placeholder';map.innerHTML='<div class="map-icon">⌖</div><p>Selecione uma unidade para visualizar o mapa.</p><button id="load-map" disabled>Carregar mapa</button>';$('#map-title').textContent='Selecione um estabelecimento';$('#route').hidden=true;history.replaceState(null,'','?city='+city);show()}});
 input.addEventListener('input',show);show();
})();