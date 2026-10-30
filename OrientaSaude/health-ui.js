/* Catálogo informativo: confira sempre horários e telefones com a unidade. */
(() => {
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const render=()=>{
  const places=window.ORIENTA_FOZ_UNITS||[];
  return '<section class="foz-directory"><h2>Unidades de saúde em Foz do Iguaçu</h2><p>Hospitais, UPAs e postos de saúde</p>'+
    '<p class="foz-count">'+places.length+' unidades cadastradas</p><div class="foz-grid">'+places.map(p=>{
    const [kind,name,address,phone,hours,cnes]=p;
    const route='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+' '+address+', Foz do Iguaçu PR');
    const cn='https://cnes2.datasus.gov.br/Mod_Conjunto.asp?VCo_Unidade=410830'+cnes;
    return '<article class="foz-unit"><div class="foz-top"><div><small>'+esc(kind.toUpperCase())+'</small><h3>'+esc(name)+'</h3></div><b>'+esc(hours)+'</b></div>'+
      '<p><strong>Endereço:</strong> '+esc(address)+'</p><p><strong>Telefone:</strong> '+esc(phone||'Não informado')+'</p>'+
      '<p><strong>Horário:</strong> '+esc(hours==='24h'?'24 horas, todos os dias':'Segunda a sexta, '+hours)+'</p>'+
      '<div class="foz-actions"><a href="'+route+'" target="_blank" rel="noopener noreferrer">Como chegar</a><a href="'+cn+'" target="_blank" rel="noopener noreferrer">Fonte: CNES</a></div></article>';
    }).join('')+'</div></section>';
 };
 window.OrientaUnidades={render};
})();