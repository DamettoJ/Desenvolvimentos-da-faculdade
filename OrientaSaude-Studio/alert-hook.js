/* Small entry point in each app; never changes symptom or emergency logic. */
(()=>{'use strict';const root=document.getElementById('app-content');if(!root)return;
const getCity=()=>window.OrientaBorder?.getCity?.()||'foz';
function mount(){const page=root.querySelector('.home-page');if(!page||page.querySelector('.alert-entry'))return;
const section=document.createElement('section');section.className='alert-entry';section.setAttribute('aria-label','Vigilância em Saúde');
const link=document.createElement('a');link.href='./alertas.html?city='+encodeURIComponent(getCity());link.className='alert-entry-link';
link.innerHTML='<span class="alert-entry-icon" aria-hidden="true">✳</span><span class="alert-entry-copy"><strong>Saúde pública e alertas oficiais</strong><small>Acompanhe boletins de Foz, Ciudad del Este e Puerto Iguazú, com fontes e datas.</small></span><span aria-hidden="true">›</span>';
section.append(link);const hero=page.querySelector('.hero');const emergency=page.querySelector('.emergency');const anchor=page.querySelector('.os-searchbox')||emergency||hero;
if(anchor)anchor.insertAdjacentElement('afterend',section);else page.prepend(section)
}
new MutationObserver(mount).observe(root,{childList:true});mount();
})();