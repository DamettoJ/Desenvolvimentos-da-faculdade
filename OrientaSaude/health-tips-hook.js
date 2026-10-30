/* Integra Dicas de Saúde ao primeiro OrientaSaúde sem modificar relatórios já salvos. */
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-go="education"],[data-article]');
 if(!button)return;
 event.preventDefault();
 event.stopImmediatePropagation();
 const dest=new URL('./dicas.html',document.baseURI);
 if(button.dataset.article==='sinais')dest.hash='sinais';
 window.location.assign(dest.href);
},true);