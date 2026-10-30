(() => {
 const root=document.getElementById('foz-directory-root');
 if(!root || !window.OrientaUnidades) return;
 root.innerHTML=window.OrientaUnidades.render();
 let kind='todos';
 const search=document.getElementById('foz-search');
 const normalize=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 function filter(){
  const q=normalize(search.value);
  let visible=0;
  root.querySelectorAll('.foz-unit').forEach(card=>{
   const category=card.querySelector('.foz-top small')?.textContent?.trim();
   const matchKind=kind==='todos' || (kind==='ubs'&&category==='UBS') || (kind==='upa'&&category==='UPA') || (kind==='hospital'&&category==='HOSPITAL');
   const show=matchKind&&normalize(card.textContent).includes(q);
   card.hidden=!show;if(show) visible++;
  });
  root.querySelector('.foz-count').textContent=visible+' unidades encontradas';
  document.querySelectorAll('button[data-kind]').forEach(b=>b.classList.toggle('selected',b.dataset.kind===kind));
 }
 search.addEventListener('input',filter);
 document.querySelectorAll('button[data-kind]').forEach(btn=>btn.addEventListener('click',()=>{kind=btn.dataset.kind;filter()}));
})();