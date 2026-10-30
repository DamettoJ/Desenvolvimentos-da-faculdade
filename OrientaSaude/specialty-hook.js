/* Encaminha a navegação do app original para o catálogo independente de especialidades. */
document.addEventListener('click',e=>{
 const button=e.target.closest('[data-go="specialties"],[data-specialty]');
 if(!button)return;
 e.preventDefault();e.stopImmediatePropagation();
 const dest=new URL('./especialidades.html',document.baseURI);
 const slug={geral:'clinica',pediatria:'pediatria',cardio:'cardiologia',orto:'ortopedia'};
 if(button.dataset.specialty&&slug[button.dataset.specialty])dest.hash=slug[button.dataset.specialty];
 window.location.assign(dest.href);
},true);