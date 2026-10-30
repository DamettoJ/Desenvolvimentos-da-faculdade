/* OrientaSaúde · interface educativa independente, sem rastreamento ou APIs. */
(() => {
  'use strict';
  const pack=window.OrientaLanguagePack;
  const root = document.getElementById('tips-root');
  if (!root) return;
  const items = window.ORIENTA_TIPS || [];
  const sources = window.ORIENTA_TIPS_SOURCES || {};
  const UI = {
    'pt-BR': {
      nav:'Voltar ao OrientaSaúde', title:'Dicas de Saúde', subtitle:'Cuidados simples para você, sua família e sua comunidade.',
      lead:'Pequenas atitudes fazem diferença. Explore temas do dia a dia com explicações fáceis, orientações práticas e fontes públicas confiáveis.',
      reviewed:'Fontes públicas consultadas em 30/10/2026', safe:'Informação educativa: não substitui consultas, diagnóstico ou tratamentos.',
      emergency:'Se houver dor forte no peito, falta de ar intensa, desmaio ou outro risco imediato, ligue 192 (SAMU) no Brasil.',
      today:'Comece pelo básico', todayDesc:'Três hábitos para lembrar no dia a dia',
      hand:'Lave as mãos com água e sabonete.', water:'Cuide da hidratação e da água potável, conforme sua idade.', vaccines:'Confira as vacinas recomendadas para sua fase da vida.',
      themes:'Escolha um tema', all:'Todos os temas', audience:'Para quem?', everyone:'Todas as idades', kids:'Crianças e cuidadores', teens:'Adolescentes', adults:'Adultos', elders:'Pessoas idosas', pregnant:'Gestação',
      hygiene:'Higiene', food:'Alimentação', wellbeing:'Bem-estar', prevention:'Prevenção', safety:'Cuidados e segurança', children:'Primeira infância', warning:'Sinais de alerta',
      search:'Pesquisar dicas, temas e cuidados', found:'dicas encontradas', tip:'dica encontrada', none:'Não encontramos dicas com esses filtros. Experimente outra palavra ou categoria.',
      practical:'Veja os cuidados práticos', sources:'Ler fonte oficial', shared:'Dicas gerais e orientações específicas da faixa etária selecionada.',
      for:'Público', source:'Baseado em fonte pública', disclaimer:'Conteúdo educativo de prevenção. Pessoas com condições de saúde, limitações ou necessidades específicas devem seguir as orientações da equipe de saúde. Em emergências, ligue 192 (SAMU).',
      more:'Mais informações no site oficial', language:'Idioma', size:'Tamanho do texto', see:'Abrir dica', consult:'Procure atendimento se houver sintomas preocupantes ou piora.',
      ageLabel:'Fase da vida', topicLabel:'Tema', help:'Para dúvidas individuais, procure sua UBS ou outro profissional de saúde.',
      hours:'As recomendações variam conforme idade, condição clínica e necessidades individuais.'
    },
    en: {
      nav:'Back to OrientaSaúde', title:'Health Tips', subtitle:'Simple care for you, your family and your community.',
      lead:'Small steps can make a difference. Explore daily health topics with clear explanations, practical guidance and trustworthy public sources.',
      reviewed:'Public sources checked on October 30, 2026', safe:'Educational information: not a substitute for medical visits, diagnosis or treatment.',
      emergency:'For severe chest pain, serious trouble breathing, fainting or immediate danger in Brazil, call SAMU at 192.',
      today:'Start with the basics', todayDesc:'Three everyday habits worth remembering',
      hand:'Wash hands with soap and water.', water:'Drink safe water as appropriate for your age and health.', vaccines:'Check the vaccines recommended for your age.',
      themes:'Choose a topic', all:'All topics', audience:'Who is this for?', everyone:'All ages', kids:'Children and caregivers', teens:'Teens', adults:'Adults', elders:'Older adults', pregnant:'Pregnancy',
      hygiene:'Hygiene', food:'Food & water', wellbeing:'Well-being', prevention:'Prevention', safety:'Safety and care', children:'Early childhood', warning:'Warning signs',
      search:'Search tips, topics and care', found:'tips found', tip:'tip found', none:'No matching tips. Try another keyword or category.',
      practical:'View practical steps', sources:'Read official source', shared:'General tips plus advice specific to the selected age group.',
      for:'Audience', source:'Based on a public health source', disclaimer:'Educational prevention content. People with health conditions, limitations or specific needs should follow professional advice. In emergencies in Brazil, call 192 (SAMU).',
      more:'More information from the official source', language:'Language', size:'Text size', see:'Open tip', consult:'Seek care for concerning or worsening symptoms.',
      ageLabel:'Life stage', topicLabel:'Topic', help:'For individual questions, visit your local clinic or healthcare professional.',
      hours:'Advice varies by age, health status and individual needs.'
    },
    es: {
      nav:'Volver a OrientaSaúde', title:'Consejos de Salud', subtitle:'Cuidados sencillos para ti, tu familia y tu comunidad.',
      lead:'Pequeños hábitos hacen la diferencia. Explora temas diarios de salud con explicaciones sencillas, pasos prácticos y fuentes públicas confiables.',
      reviewed:'Fuentes públicas consultadas el 30/10/2026', safe:'Información educativa: no sustituye consultas, diagnósticos ni tratamientos.',
      emergency:'Ante dolor fuerte en el pecho, dificultad respiratoria intensa, desmayo u otro peligro inmediato en Brasil, llama al SAMU al 192.',
      today:'Comienza por lo básico', todayDesc:'Tres hábitos para recordar cada día',
      hand:'Lávate las manos con agua y jabón.', water:'Bebe agua segura según tu edad y condición de salud.', vaccines:'Revisa las vacunas recomendadas para tu edad.',
      themes:'Elige un tema', all:'Todos los temas', audience:'¿Para quién?', everyone:'Todas las edades', kids:'Niños y cuidadores', teens:'Adolescentes', adults:'Adultos', elders:'Personas mayores', pregnant:'Embarazo',
      hygiene:'Higiene', food:'Alimentación', wellbeing:'Bienestar', prevention:'Prevención', safety:'Seguridad y cuidados', children:'Primera infancia', warning:'Señales de alarma',
      search:'Buscar consejos, temas y cuidados', found:'consejos encontrados', tip:'consejo encontrado', none:'No encontramos consejos con estos filtros. Prueba otro término o categoría.',
      practical:'Ver consejos prácticos', sources:'Leer fuente oficial', shared:'Consejos generales y orientaciones específicas para la edad seleccionada.',
      for:'Público', source:'Basado en una fuente pública', disclaimer:'Contenido educativo de prevención. Las personas con condiciones de salud o necesidades particulares deben seguir las indicaciones de profesionales sanitarios. En emergencias en Brasil, llama al 192 (SAMU).',
      more:'Más información en la fuente oficial', language:'Idioma', size:'Tamaño de letra', see:'Abrir consejo', consult:'Busca atención ante síntomas preocupantes o que empeoran.',
      ageLabel:'Etapa de vida', topicLabel:'Tema', help:'Para dudas individuales, acude a tu centro de salud o a un profesional.',
      hours:'Las recomendaciones varían según la edad, la salud y las necesidades individuales.'
    }
  };
  for(const loc of (pack?.options||[])) if(!UI[loc.code]){
    UI[loc.code]={...UI['pt-BR'],...(pack.tipsUI[loc.code]||{}),
      lead:pack.notes[loc.code] || UI['pt-BR'].lead,
      disclaimer:pack.notes[loc.code] || UI['pt-BR'].disclaimer};
  }
  const catOrder=['higiene','alimentacao','bemestar','prevencao','seguranca','criancas','sinais'];
  const catTitle={higiene:'hygiene',alimentacao:'food',bemestar:'wellbeing',prevencao:'prevention',seguranca:'safety',criancas:'children',sinais:'warning'};
  const audienceOrder=['todas','criancas','adolescentes','adultos','idosos','gestacao'];
  const ageTitle={todas:'everyone',criancas:'kids',adolescentes:'teens',adultos:'adults',idosos:'elders',gestacao:'pregnant'};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const stored=(key,defaultValue)=>{try{return localStorage.getItem(key)||defaultValue}catch{return defaultValue}};
  let lang=stored('orientasaude-language-v1','pt-BR');if(!UI[lang])lang='pt-BR';
  let topic='todos', audience='todas', search='', scale=Number(stored('orientasaude-tip-font','0'));if(![0,1,2].includes(scale))scale=0;
  const t=()=>UI[lang];
  const currentEmergency=()=>window.OrientaBorder?.cities?.[window.OrientaBorder.getCity()] || {id:'foz',emergency:'192',emergencyService:'SAMU'};
  function emergencyCopy(){
    const city=currentEmergency();
    if(city.id==='foz')return t().emergency;
    if(lang==='en')return 'For a medical emergency in '+city.name+', call '+city.emergency+' ('+city.emergencyService+'). Seek help immediately for severe chest pain, difficulty breathing or fainting.';
    if(lang==='es')return 'En una emergencia médica en '+city.name+', llama al '+city.emergency+' ('+city.emergencyService+'). Busca ayuda inmediata ante dolor fuerte en el pecho, dificultad respiratoria o desmayo.';
    return 'Em emergência médica em '+city.name+', ligue '+city.emergency+' ('+city.emergencyService+'). Busque ajuda imediata para dor forte no peito, dificuldade de respirar ou desmaio.';
  }
  function localDisclaimer(){
    const city=currentEmergency();
    if(city.id==='foz')return t().disclaimer;
    if(lang==='en')return 'Educational information. Follow your healthcare professional’s advice and local vaccination guidelines. Medical emergency: '+city.emergency+' ('+city.emergencyService+').';
    if(lang==='es')return 'Información educativa. Sigue las recomendaciones de profesionales y el calendario de vacunación local. Emergencia médica: '+city.emergency+' ('+city.emergencyService+').';
    return 'Informação educativa. Siga orientações profissionais e o calendário de vacinação local. Emergência médica: '+city.emergency+' ('+city.emergencyService+').';
  }
  function card(item){
    const original=item.translations[lang]||item.translations['pt-BR'];
    const d={...original,title:pack?.tips?.[lang]?.[item.id]||original.title};const source=sources[item.source];
    const audienceLabel=item.ages.includes('todas')?t().everyone:item.ages.map(a=>t()[ageTitle[a]]).join(' · ');
    const lookFor=norm([d.title,d.summary,...d.steps,item.category,audienceLabel].join(' '));
    return `<article class="tip-card" data-tip="${esc(item.id)}" data-category="${esc(item.category)}" data-ages="${esc(item.ages.join(' '))}" data-search="${esc(lookFor)}">
      <div class="tip-card-head"><span class="tip-emoji" aria-hidden="true">${esc(item.emoji)}</span><div class="tip-card-heading"><span class="tip-kicker">${esc(t()[catTitle[item.category]])}</span><h3>${esc(d.title)}</h3></div></div>
      <p class="tip-summary">${esc(d.summary)}</p>
      <div class="tip-audience">${esc(audienceLabel)}</div>
      <details class="tip-details" ${['alertas','sinais'].includes(location.hash.slice(1))&&item.id==='alertas'?'open':''}>
        <summary>${esc(t().practical)} <span class="tip-expand" aria-hidden="true">⌄</span></summary>
        <ol>${d.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol>
        <a class="tip-source" href="${esc(source[1])}" target="_blank" rel="noopener noreferrer">${esc(t().sources)} · ${esc(source[0])} ↗</a>
      </details>
    </article>`;
  }
  function render(){
    document.documentElement.lang=lang;
    document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    document.documentElement.style.setProperty('--tips-scale',String([1,1.11,1.22][scale]));
    document.title=`${t().title} | OrientaSaúde`;
    root.innerHTML=`<div class="tips-wrap">
      <header class="tips-header"><a class="tips-back" href="./" aria-label="${esc(t().nav)}">← <span>${esc(t().nav)}</span></a>
      <a class="tips-brand" href="./"><span class="tips-brand-icon" aria-hidden="true">✚</span> Orienta<span>Saúde</span></a>
      <div class="tips-header-tools"><label class="tip-lang-label" for="tips-lang">${esc(t().language)}</label>
        <select id="tips-lang" aria-label="${esc(t().language)}" dir="ltr">${(pack?.options||[]).map(v=>`<option value="${v.code}" ${lang===v.code?'selected':''}>${v.flag} ${esc(v.native)}</option>`).join('')}</select>
        <button class="tips-font" type="button" data-tip-font title="${esc(t().size)}" aria-label="${esc(t().size)}">A+</button></div></header>
      <main id="main-content" class="tips-main">
      <section class="tips-hero" aria-labelledby="tip-title"><div><p class="tips-overline">OrientaSaúde · ${esc(t().title)}</p><h1 id="tip-title">${esc(t().title)}</h1><h2>${esc(t().subtitle)}</h2><p>${esc(t().lead)}</p><span class="tips-review">${esc(t().reviewed)}</span></div><div class="tips-hero-art" aria-hidden="true"><span>💙</span><span>🧼</span><span>🥬</span><span>🌿</span></div></section>
      <div class="tips-safe">ⓘ ${esc(t().safe)}</div>
      <section class="tips-basics" aria-labelledby="tip-basics-title"><div class="tips-section-title"><div><h2 id="tip-basics-title">${esc(t().today)}</h2><p>${esc(t().todayDesc)}</p></div></div>
      <div class="tips-basics-grid"><div><span aria-hidden="true">🧼</span>${esc(t().hand)}</div><div><span aria-hidden="true">💧</span>${esc(t().water)}</div><div><span aria-hidden="true">💉</span>${esc(t().vaccines)}</div></div></section>
      <section class="tips-library" aria-labelledby="tips-library-title"><div class="tips-section-title"><div><h2 id="tips-library-title">${esc(t().themes)}</h2><p>${esc(t().shared)}</p></div></div>
      <div class="tips-filter-panel"><div class="tips-age-control"><label for="tips-age">${esc(t().ageLabel)}</label><select id="tips-age">${audienceOrder.map(a=>`<option value="${a}" ${audience===a?'selected':''}>${esc(t()[ageTitle[a]])}</option>`).join('')}</select></div>
      <div class="tips-search-control"><label for="tips-search">${esc(t().search)}</label><input type="search" id="tips-search" autocomplete="off" placeholder="${esc(t().search)}" value="${esc(search)}"></div>
      <fieldset class="tips-topics"><legend>${esc(t().topicLabel)}</legend><div class="tips-topic-pills">${[['todos',t().all],...catOrder.map(c=>[c,t()[catTitle[c]]])].map(([key,label])=>`<button type="button" data-topic="${key}" aria-pressed="${topic===key}">${esc(label)}</button>`).join('')}</div></fieldset></div>
      <p class="tips-count" id="tips-count" role="status" aria-live="polite"></p>
      <div class="tips-grid" id="tips-grid">${items.map(card).join('')}</div><p class="tips-empty" id="tips-empty" hidden>${esc(t().none)}</p>
      </section>
      <div class="tips-emergency"><div><strong>${esc(emergencyCopy())}</strong><p>${esc(t().consult)}</p></div><a href="tel:${currentEmergency().emergency}">☎ ${esc(currentEmergency().emergencyService)} ${esc(currentEmergency().emergency)}</a></div>
      <footer class="tips-footer"><p>${esc(localDisclaimer())}</p><p>${esc(t().help)}</p><small>${esc(t().reviewed)}</small></footer></main></div>`;
    update();
    if(location.hash==='#sinais'||location.hash==='#alertas'){
      const warning=root.querySelector('[data-tip="alertas"]');
      warning?.querySelector('details')?.setAttribute('open','');
      requestAnimationFrame(()=>warning?.scrollIntoView({block:'center',behavior:'instant'}));
    }
  }
  function update(){
    let n=0;
    root.querySelectorAll('.tip-card').forEach(el=>{
      const audiences=el.dataset.ages.split(' ');
      const matchAudience=audience==='todas'||audiences.includes('todas')||audiences.includes(audience);
      const visible=(topic==='todos'||el.dataset.category===topic)&&matchAudience&&(!search||el.dataset.search.includes(norm(search)));
      el.hidden=!visible;if(visible)n++;
    });
    root.querySelectorAll('[data-topic]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.topic===topic)));
    root.querySelector('#tips-count').textContent=`${n} ${n===1?t().tip:t().found}`;
    root.querySelector('#tips-empty').hidden=n!==0;
  }
  root.addEventListener('input',event=>{
    if(event.target.id==='tips-search'){search=event.target.value;update()}
  });
  root.addEventListener('change',event=>{
    if(event.target.id==='tips-age'){audience=event.target.value;update()}
    if(event.target.id==='tips-lang'){
      lang=event.target.value;
      try{localStorage.setItem('orientasaude-language-v1',lang)}catch{}
      render();
      document.getElementById('tips-search')?.focus({preventScroll:true});
    }
  });
  root.addEventListener('click',event=>{
    const filter=event.target.closest('[data-topic]');
    if(filter){topic=filter.dataset.topic;update()}
    if(event.target.closest('[data-tip-font]')){
      scale=(scale+1)%3;try{localStorage.setItem('orientasaude-tip-font',String(scale))}catch{}
      document.documentElement.style.setProperty('--tips-scale',String([1,1.11,1.22][scale]));
    }
  });
  render();
})();