/* OrientaSaúde Studio: progressive visual enhancement of the original application.
   All business logic, routes, accessible controls and clinical disclaimers remain unchanged. */
(() => {
 'use strict';
 document.documentElement.classList.add('studio-version');
 const TRANSLATIONS={
  'pt-BR':{help:'Preciso de ajuda',desc:'Organize seus sintomas e saiba quando procurar atendimento.',more:'Outros cuidados e recursos',eyebrow:'CUIDADO, SEM COMPLICAÇÃO',quick:'Ajuda imediata',quickLabel:'Ver orientações de emergência'},
  'en':{help:'I need guidance',desc:'Describe your symptoms and learn when to seek care.',more:'More care resources',eyebrow:'CARE MADE CLEAR',quick:'Urgent help',quickLabel:'Emergency guidance'},
  'es':{help:'Necesito orientación',desc:'Describe tus síntomas y cuándo buscar atención.',more:'Más recursos de cuidado',eyebrow:'CUIDADO CON CLARIDAD',quick:'Ayuda urgente',quickLabel:'Orientación de emergencia'},
  'ja':{help:'相談したい',desc:'症状を整理し、受診が必要なときを知りましょう。',more:'その他の健康情報',eyebrow:'分かりやすい健康情報',quick:'緊急の助け',quickLabel:'救急のご案内'},
  'ar':{help:'أحتاج إلى إرشاد',desc:'صف أعراضك وتعرّف إلى وقت طلب الرعاية.',more:'المزيد من موارد الصحة',eyebrow:'رعاية واضحة وبسيطة',quick:'مساعدة عاجلة',quickLabel:'إرشادات الطوارئ'},
  'zh-CN':{help:'我需要帮助',desc:'记录症状并了解何时应就医。',more:'更多健康资源',eyebrow:'清晰、贴心的健康指导',quick:'紧急帮助',quickLabel:'紧急就医指引'},
  'ko':{help:'도움이 필요해요',desc:'증상을 정리하고 언제 진료받아야 하는지 알아보세요.',more:'추가 건강 정보',eyebrow:'간편하고 명확한 건강 안내',quick:'긴급 도움',quickLabel:'응급 안내'},
  'ht':{help:'Mwen bezwen konsèy',desc:'Dekri sentòm ou yo epi konnen kilè pou chèche swen.',more:'Lòt resous sante',eyebrow:'SWEN KI KLÈ AK SENP',quick:'Èd ijan',quickLabel:'Konsèy pou ijans'}
 };
 const locale=()=>{try{return window.OrientaI18n?.locale()||localStorage.getItem('orientasaude-studio-language-v1')||'pt-BR'}catch{return 'pt-BR'}};
 const dict=()=>TRANSLATIONS[locale()]||TRANSLATIONS['pt-BR'];
 const closestSection=(el)=>el?.closest('section');
 function customizeHome(page){
  const hero=page.querySelector('.hero');
  const grid=page.querySelector('.icon-grid');
  const emergency=page.querySelector('button.emergency');
  const help=grid?.querySelector('button[data-go="symptoms"]');
  if(!hero||!grid||!help||!emergency)return;
  const t=dict();
  const eyebrow=document.createElement('span');eyebrow.className='studio-differentiator';eyebrow.textContent=t.eyebrow;
  const title=hero.querySelector('h1');title?.parentNode?.insertBefore(eyebrow,title);
  const top=document.createElement('section');top.className='studio-priority';top.setAttribute('aria-label',t.help+' / '+t.quick);
  hero.insertAdjacentElement('afterend',top);
  const headline=help.querySelector('h3');if(headline)headline.textContent=t.help;
  const subtitle=help.querySelector('p');if(subtitle)subtitle.textContent=t.desc;
  help.setAttribute('aria-label',t.help+' — '+t.desc);
  top.append(help,emergency);
  emergency.setAttribute('aria-label',t.quickLabel);
  const extra=page.querySelector('.short-grid');
  const moreSection=closestSection(extra);
  if(moreSection){
   const details=document.createElement('details');details.className='studio-more';
   const summary=document.createElement('summary');summary.textContent=t.more;
   const container=document.createElement('div');container.className='studio-more-content';
   moreSection.parentElement.insertBefore(details,moreSection);
   details.append(summary,container);container.append(moreSection);
   const note=[...page.children].find(x=>x.classList?.contains('info-card')&&x.querySelector('h3')?.textContent?.includes('Dica'));
   if(note)container.append(note);
  }
 }
 function customizeSubpage(page){
  // Keep high-priority emergency guidance accessible without adding new panels of text.
  const first=page.querySelector('.back-head');
  if(!first||page.querySelector('.studio-quick-link'))return;
  const label=dict().quick;
  const button=document.createElement('button');button.type='button';button.className='studio-quick-link';button.dataset.go='emergency';button.textContent='✚ '+label;
  button.setAttribute('aria-label',dict().quickLabel);
  first.append(button);
 }
 function upgrade(){
  const page=document.querySelector('#app-content > .page');
  if(!page||page.dataset.studioReady==='true')return;
  page.dataset.studioReady='true';
  if(page.classList.contains('home-page'))customizeHome(page);
  else if(!page.querySelector('.notice.red')&&!page.querySelector('.primary-btn[href^="tel:"]'))customizeSubpage(page);
 }
 let pending=false;
 const schedule=()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;upgrade()})};
 const root=document.getElementById('app-content');
 if(root){const obs=new MutationObserver(schedule);obs.observe(root,{childList:true});schedule()}
})();