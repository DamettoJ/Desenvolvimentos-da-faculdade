/* Optional speech synthesis for public health tips only; user-initiated. */
(() => {'use strict';if(!('speechSynthesis' in window))return;
 const root=document.getElementById('tips-root');if(!root)return;
 const names={'pt-BR':'Ouvir dica','es':'Escuchar consejo','en':'Listen to tip','ja':'読み上げる','ar':'استمع إلى النصيحة','zh-CN':'朗读建议','ko':'내용 듣기','ht':'Koute konsèy'};
 const say=(card,button)=>{
  if(window.speechSynthesis.speaking){window.speechSynthesis.cancel();button.textContent=names[localStorage.getItem('orientasaude-studio-language-v1')]||'Ouvir dica';return}
  const text=[card.querySelector('h3')?.textContent,card.querySelector('.tip-summary')?.textContent,...card.querySelectorAll('ol li')].map(x=>typeof x==='string'?x:x?.textContent||'').filter(Boolean).join('. ');
  if(!text.trim())return;
  const u=new SpeechSynthesisUtterance(text);u.lang=localStorage.getItem('orientasaude-studio-language-v1')||'pt-BR';u.rate=.92;
  const btn=button;btn.textContent='■';u.onend=u.onerror=()=>{btn.textContent=names[u.lang]||'Ouvir dica'};
  window.speechSynthesis.speak(u);
 };
 function enhance(){root.querySelectorAll('.tip-card').forEach(card=>{if(card.querySelector('.os-speak'))return;const d=document.createElement('button');d.className='os-speak';d.type='button';d.textContent=names[localStorage.getItem('orientasaude-studio-language-v1')]||'Ouvir dica';d.title='Reprodução por voz depende do navegador e idioma instalado';card.append(d)})}
 root.addEventListener('click',e=>{const b=e.target.closest('.os-speak');if(b)say(b.closest('.tip-card'),b)});
 const style=document.createElement('style');style.textContent='.os-speak{display:inline-flex;align-items:center;justify-content:center;border:1px solid #d2e2f1;border-radius:10px;background:#f2f8ff;color:#0b63ab;font-size:.82rem;font-weight:800;min-height:40px;padding:8px 13px;margin-top:10px;cursor:pointer}.os-speak:focus-visible{outline:3px solid #7abaff;outline-offset:2px}';document.head.append(style);
 new MutationObserver(enhance).observe(root,{subtree:true,childList:true});enhance();
 window.addEventListener('pagehide',()=>window.speechSynthesis.cancel());
})();