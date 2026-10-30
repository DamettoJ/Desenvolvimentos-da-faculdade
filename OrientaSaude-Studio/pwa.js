/* Installation uses native browser invitation; no promise of support on every device. */
(() => {'use strict';let promptEvent=null;
 const notify=msg=>{const toast=document.getElementById('toast');if(toast){toast.textContent=msg;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),4800)}else alert(msg)};
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;document.documentElement.classList.add('os-install-available')});
 window.addEventListener('appinstalled',()=>{promptEvent=null;document.documentElement.classList.remove('os-install-available');notify('OrientaSaúde adicionado à tela inicial.')});
 window.OrientaInstall={async request(){if(promptEvent){const event=promptEvent;promptEvent=null;document.documentElement.classList.remove('os-install-available');await event.prompt();return}
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent);
 notify(ios?'No Safari, toque em Compartilhar e escolha Adicionar à Tela de Início.':'Use a opção Instalar aplicativo no menu do navegador, se disponível.');}};
 if('serviceWorker' in navigator && location.protocol==='https:'){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{}));
 }
})();