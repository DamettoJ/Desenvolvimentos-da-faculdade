/* OrientaSaúde — protótipo acadêmico de frontend estático (GitHub Pages).
   Sem serviços externos, diagnósticos, prescrições ou coleta remota de dados. */
(() => {
  'use strict';

  const STORE = 'orientasaude-studio-demo-v1';
  const defaultData = {records:[], reminders:[], profile:{name:''}, font:0};
  function loadData(){
    try { const data = JSON.parse(localStorage.getItem(STORE) || '{}');
      return {...defaultData, ...data, records:Array.isArray(data.records)?data.records:[], reminders:Array.isArray(data.reminders)?data.reminders:[],profile:{...defaultData.profile,...data.profile}};
    } catch {return structuredClone(defaultData);}
  }
  let data = loadData();
  const state = {view:'home', from:'home', stage:1, selected:[], text:'', search:'', duration:'', worsening:'', intensity:'', flags:[], activeSpecialty:null, article:null, report:null, showReminderForm:false, filter:'todos', error:'', editingReminder:null};
  const app = document.getElementById('app-content');
  const nav = document.getElementById('tabbar');
  const toast = document.getElementById('toast');
  const i18n = window.OrientaI18n;
  let toastTimer = null;

  const specs = [
    {id:'geral',name:'Clínica geral',icon:'stethoscope',tone:'blue',desc:'Ponto de partida para avaliação de queixas de saúde em geral.',more:'A clínica geral avalia diferentes problemas de saúde, acompanha condições comuns e pode encaminhar para outras especialidades quando necessário.'},
    {id:'pediatria',name:'Pediatria',icon:'baby',tone:'purple',desc:'Cuidados e acompanhamento de crianças e adolescentes.',more:'A pediatria acompanha a saúde e o desenvolvimento de crianças e adolescentes e orienta pais ou responsáveis.'},
    {id:'cardio',name:'Cardiologia',icon:'heart',tone:'red',desc:'Avaliação profissional da saúde do coração e circulação.',more:'A cardiologia se dedica à avaliação e ao acompanhamento de condições relacionadas ao coração e ao sistema circulatório.'},
    {id:'orto',name:'Ortopedia',icon:'bone',tone:'yellow',desc:'Avaliação de ossos, músculos, articulações e movimento.',more:'A ortopedia cuida de problemas e lesões do sistema musculoesquelético.'}
  ];
  const symptomOptions = [
    {id:'Febre',icon:'heart',tone:'red'},
    {id:'Dor',icon:'alert',tone:'yellow'},
    {id:'Tosse',icon:'message',tone:'cyan'},
    {id:'Falta de ar',icon:'heart',tone:'purple'},
    {id:'Náusea',icon:'records',tone:'green'},
    {id:'Tontura',icon:'user',tone:'blue'}
  ];
  const articles = [
    {id:'observar',title:'Como acompanhar seus sintomas',icon:'notes',tone:'blue',subtitle:'Registre informações úteis para conversar com um profissional.',body:['Anote quando o sintoma começou, onde ocorre e se mudou ao longo do tempo.','Caso perceba piora, surgimento de novos sintomas ou algo que cause preocupação, procure orientação profissional.','A descrição dos sintomas ajuda na conversa, mas não permite confirmar um diagnóstico por este aplicativo.']},
    {id:'sinais',title:'Reconheça sinais de alerta',icon:'alert',tone:'red',subtitle:'Saiba quando não esperar por um aplicativo.',body:['Dor no peito, falta de ar intensa, desmaio, confusão súbita ou piora rápida exigem atenção urgente.','Na presença de risco imediato, procure atendimento de emergência. No Brasil, o SAMU atende pelo 192.','Se não souber avaliar a gravidade de uma situação, procure orientação profissional em vez de depender de classificações automáticas.']},
    {id:'consulta',title:'Prepare-se para uma consulta',icon:'calendar',tone:'purple',subtitle:'Organize os pontos importantes para o atendimento.',body:['Leve a lista de sintomas, a data de início e informações sobre o que mudou.','Informe ao profissional quais medicamentos você já utiliza, caso existam, e dúvidas que gostaria de esclarecer.','Não interrompa ou inicie medicamentos por conta deste aplicativo.']},
    {id:'prevencao',title:'Hábitos de cuidado e prevenção',icon:'book',tone:'yellow',subtitle:'Informações gerais para o dia a dia.',body:['Cultive hábitos de higiene, alimentação equilibrada, atividade física adequada à sua realidade e acompanhamento de saúde quando indicado.','As necessidades de prevenção variam conforme a pessoa. Busque profissionais e fontes oficiais para recomendações individuais.']}
  ];

  function persist(){try{localStorage.setItem(STORE,JSON.stringify(data));}catch{notify('O navegador não permitiu salvar os dados.');}}
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function icon(name,extra=''){return `<svg class="icon ${extra}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;}
  function round(name,tone='blue'){return `<span class="round-icon ${tone}">${icon(name)}</span>`;}
  function arrow(tone='blue-txt'){return icon('chevron',`arrow ${tone}`);}
  function alertText(){return 'Este aplicativo oferece apenas orientação informativa. Não faz diagnósticos nem substitui a avaliação de profissionais de saúde.';}
  function infoBar(message='Os conteúdos são informativos. Não use o aplicativo para escolher medicamentos ou substituir uma consulta.',ico='shield',tone='cyan'){
    return `<div class="info-card">${round(ico,tone)}<div><h3>Importante</h3><p>${message}</p></div></div>`;
  }
  function miniWarning(){return `<div class="disclaimer-fixed" role="note">OrientaSaúde: informação educativa, não diagnóstico. Em emergências, ligue 192 (SAMU).</div>`;}
  function notify(message){toast.textContent=i18n.t(message);toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),3300);}
  function dateLabel(value){try{return new Intl.DateTimeFormat(i18n.locale(),{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(`${value}T12:00:00`));}catch{return value;}}
  function whenLabel(iso){try{return new Date(iso).toLocaleString(i18n.locale(),{dateStyle:'short',timeStyle:'short'});}catch{return 'Data não disponível';}}
  function appHeader(){return `<header class="logo-row"><span class="logo-mark">${icon('activity')}</span><div class="logo-copy"><strong>Orienta<span>Saúde</span></strong><small>Orientação segura para cuidar de você</small></div><button class="font-button" type="button" data-action="font" title="Aumentar tamanho da letra" aria-label="Alternar tamanho das letras">A+</button></header>`;}
  function backHeader(title,sub,back='home'){return `<header class="back-head"><button class="back-button" type="button" data-go="${back}" aria-label="Voltar">${icon('back')}</button><div><h1>${title}</h1><p>${sub}</p></div></header>`;}
  function head(title,sub=''){return `<div class="section-head"><h2>${title}</h2>${sub?`<p>${sub}</p>`:''}</div>`;}
  function actCard(title,description,ico,tone,view){return `<button class="action-card" data-go="${view}" type="button">${round(ico,tone)}<div><h3>${title}</h3><p>${description}</p></div>${arrow(tone+'-txt')}</button>`;}
  function specialtyButton(s){return `<button class="specialty-tile" type="button" data-specialty="${s.id}">${round(s.icon,s.tone)}<strong>${s.name}</strong>${arrow(s.tone+'-txt')}</button>`;}
  function tabBar(){const active = ['symptoms','details','orientation','records'].includes(state.view)?'records':['reminders','health'].includes(state.view)?'reminders':['profile'].includes(state.view)?'profile':'home';
    return [['home','Início','home'],['records','Registros','records'],['health','Lembretes','bell'],['profile','Perfil','user']].map(([id,title,ico])=>`<button type="button" class="tab ${active===id?'active':''}" data-go="${id}" ${active===id?'aria-current="page"':''}><span class="nav-icon">${icon(ico)}</span><span>${title}</span></button>`).join('');
  }

  function home(){return `<div class="page home-page">
    ${appHeader()}
    <section class="hero"><div><h1>Olá! Vamos cuidar<br> da sua saúde?</h1><p>Conte o que está sentindo e receba orientações sobre quando buscar atendimento.</p></div><div class="hero-art">${icon('heart')}</div></section>
    <button class="emergency" type="button" data-go="emergency">${round('medkit','red')}<div><strong>EMERGÊNCIA</strong><p>Em caso de risco imediato, ligue 192 (SAMU).</p></div>${arrow('')}</button>
    <section>${head('Como podemos ajudar?','Escolha uma opção para começar')}<div class="icon-grid">
      ${actCard('Descrever sintomas','Conte o que está sentindo.','user','blue','symptoms')}
      ${actCard('Especialidades','Veja caminhos para atendimento.','stethoscope','green','specialties')}
      ${actCard('Consultas e lembretes','Organize seus compromissos.','calendar','purple','health')}
      ${actCard('Dicas de saúde','Informações claras e confiáveis.','book','yellow','education')}
      ${actCard('Meus registros','Consulte orientações anteriores.','records','cyan','records')}
      ${actCard('Unidades de saúde','Encontre locais de atendimento.','pin','blue','units')}
    </div></section>
    ${infoBar('O OrientaSaúde informa e orienta. Não faz diagnósticos nem substitui a avaliação de profissionais de saúde.','shield','green')}
    <section>${head('Também pode ajudar você')}<div class="short-grid">
      <button class="short-card" type="button" data-new-reminder="consulta">${round('clock','blue')}<strong>Lembrete de consulta</strong>${arrow()}</button>
      <button class="short-card" type="button" data-new-reminder="medicamento">${round('pill','purple')}<strong>Lembrete de medicamento</strong>${arrow('purple-txt')}</button>
      <button class="short-card" type="button" data-article="sinais">${round('message','green')}<strong>Entenda sinais de alerta</strong>${arrow('green-txt')}</button>
    </div></section>
    <div class="info-card">${round('clock','blue')}<div><h3>Dica para uma boa orientação</h3><p>Anote quando o sintoma começou, a intensidade e o que mudou. Essas informações ajudam na conversa com um profissional de saúde.</p></div></div>
    </div>`;}

  function stageBar(stage){return `<div class="stage-row" aria-label="Etapa ${stage} de 3"><div class="stage ${stage===1?'active':''}"><span>1</span>Sintomas</div><div class="stage ${stage===2?'active':''}"><span>2</span>Detalhes</div><div class="stage ${stage===3?'active':''}"><span>3</span>Orientação</div></div>`;}
  function symptoms(){return `<div class="page form-page">
    ${backHeader('Descrever sintomas','Conte como você está se sentindo','home')}
    ${stageBar(1)}
    <section><h2 class="form-label">O que você está sentindo?</h2><p class="form-hint">Marque uma ou mais opções. Você também pode escrever com suas próprias palavras.</p>
      <div class="search-wrap">${icon('search','small')}<label class="visually-hidden" for="symptom-search">Buscar ou digitar um sintoma</label><input id="symptom-search" type="search" placeholder="Buscar ou digitar um sintoma" value="${esc(state.search)}" autocomplete="off" /></div>
      <div class="symptoms-grid">${symptomOptions.map(s=>`<button class="symptom-tile ${state.selected.includes(s.id)?'selected':''}" type="button" data-symptom="${esc(s.id)}" data-symptom-name="${esc(s.id.toLowerCase())}" aria-pressed="${state.selected.includes(s.id)}">${round(s.icon,s.tone)}<strong>${s.id}</strong><span class="selection">${state.selected.includes(s.id)?icon('check','small'):''}</span></button>`).join('')}</div>
      <p id="no-search-results" class="meta-note" hidden>Não encontrou? Descreva o sintoma no campo abaixo.</p>
    </section>
    <div class="field-group"><label for="symptom-description">Quer explicar melhor?</label><textarea id="symptom-description" maxlength="1500" placeholder="Ex.: quando começou, onde dói, se algo melhora ou piora...">${esc(state.text)}</textarea></div>
    <div class="field-group"><span class="field-title">Há quanto tempo?</span><div class="pill-row">${[['hoje','Hoje'],['2-3','2–3 dias'],['mais','Mais tempo']].map(([id,t])=>`<button type="button" class="choice ${state.duration===id?'selected':''}" data-choice="duration" data-value="${id}" aria-pressed="${state.duration===id}">${t}</button>`).join('')}</div></div>
    <div class="field-group"><span class="field-title">O sintoma está piorando?</span><div class="pill-row">${[['sim','Sim','red'],['nao','Não','green'],['incerto','Não sei dizer','']].map(([id,t,color])=>`<button type="button" class="choice ${color} ${state.worsening===id?'selected':''}" data-choice="worsening" data-value="${id}" aria-pressed="${state.worsening===id}">${t}</button>`).join('')}</div></div>
    <div class="notice">${round('alert','yellow')}<div><strong>Atenção aos sinais graves</strong><p>Falta de ar intensa, dor no peito, desmaio ou piora rápida? Não espere pelo aplicativo. Procure ajuda imediatamente.</p></div></div>
    <p class="fine-print">${icon('shield')}Informe apenas o necessário. Esta ferramenta oferece orientação inicial e não confirma diagnósticos.</p>
    <div class="info-card">${round('check','green')}<div><h3>Você está no controle</h3><p>Revise as respostas e ajuste o relato antes de continuar.</p></div></div>
    ${state.error?`<p class="validation" role="alert">${esc(state.error)}</p>`:''}
    <button class="primary-btn" type="button" data-action="symptoms-next">Continuar para orientação</button>
  </div>`;}

  function details(){return `<div class="page form-page">
    ${backHeader('Detalhes do relato','Revise as informações antes de continuar','symptoms')}
    ${stageBar(2)}
    <div class="white-card"><h3>Resumo dos sintomas informados</h3><p>${esc([...state.selected, state.text.trim()].filter(Boolean).join(' • ')||'Nenhum sintoma informado')}</p><p class="data-line">Duração: ${esc(({hoje:'Hoje','2-3':'2–3 dias',mais:'Mais tempo'})[state.duration]||'Não informada')} · Evolução: ${esc(({sim:'Piorando',nao:'Sem piora relatada',incerto:'Não sei dizer'})[state.worsening]||'Não informada')}</p></div>
    <section><h2 class="form-label">Como você descreveria a intensidade?</h2><p class="form-hint">Essa informação serve para registrar o relato. Não define a gravidade clínica.</p><div class="pill-row section-pad">${[['leve','Leve'],['moderada','Moderada'],['intensa','Intensa'],['incerto','Não sei dizer']].map(([id,t])=>`<button class="choice ${state.intensity===id?'selected':''}" type="button" data-choice="intensity" data-value="${id}">${t}</button>`).join('')}</div></section>
    <section><h2 class="form-label">Você apresenta algum destes sinais?</h2><p class="form-hint">Se houver risco imediato, procure ajuda agora, sem continuar o questionário.</p><div class="list-stack section-pad">
      ${[['peito','Dor no peito'],['ar','Falta de ar intensa'],['desmaio','Desmaio ou confusão súbita'],['piora','Piora muito rápida']].map(([id,t])=>`<label class="symptom-tile ${state.flags.includes(id)?'selected':''}"><input type="checkbox" data-flag="${id}" ${state.flags.includes(id)?'checked':''} style="accent-color:#087bf4;min-width:18px;min-height:18px"/><strong>${t}</strong></label>`).join('')}
    </div></section>
    <div class="notice red">${round('alert','red')}<div><strong>Algum sinal grave?</strong><p>Não aguarde a orientação do aplicativo. Em situação de emergência no Brasil, ligue 192 (SAMU).</p></div></div>
    <div class="stack-buttons"><button class="primary-btn" type="button" data-action="details-next">Ver orientação informativa</button><button class="secondary-btn" type="button" data-go="symptoms">Revisar meus sintomas</button></div>
  </div>`;}

  function urgencyFor(report){
    // Demonstração de UI, não é sistema de triagem clínica validado.
    if(report.flags.length>0)return {kind:'high',name:'Alta — sinal de alerta informado',text:'Você indicou um sinal que pode exigir ajuda imediata. Não aguarde por este aplicativo; procure atendimento de emergência.'};
    if(report.worsening==='sim'||report.intensity==='intensa'||report.selected.includes('Falta de ar'))return {kind:'medium',name:'Atenção aumentada — procure avaliação',text:'Você informou piora, intensidade elevada ou falta de ar. É importante procurar orientação de um profissional, sem depender desta classificação demonstrativa.'};
    return {kind:'low',name:'Orientação geral — gravidade indeterminada',text:'As respostas não permitem descartar problemas importantes nem confirmar baixa urgência. Procure um profissional se os sintomas persistirem ou gerarem preocupação.'};
  }
  function orientation(){const record=state.report; const urgency = record ? urgencyFor(record) : null; return `<div class="page result-page">
    ${backHeader('Orientação inicial','Próximos passos para você','records')}
    <div class="soft-alert">${icon('shield')}<strong>Orientação informativa - Não é diagnóstico</strong></div>
    <section>${head('O que fazer agora','A orientação depende dos sintomas informados e da sua evolução. Em caso de dúvida, procure um profissional de saúde.')}
      <div class="confirmation"><div class="confirmation-title">${icon('check')}Seu relato foi registrado</div><div class="confirmation-body"><h3>Próximo passo recomendado</h3><p>Revise os sinais de alerta abaixo e procure atendimento se os sintomas persistirem, piorarem ou causarem preocupação.</p></div></div>
    </section>
    ${urgency?`<div class="urgency ${urgency.kind}"><span class="meta-note">Indicador demonstrativo — não validado para triagem</span><h3>${esc(urgency.name)}</h3><p>${esc(urgency.text)}</p></div>`:''}
    <div class="notice red">${round('alert','red')}<div><strong>Procure ajuda imediata se houver:</strong><ul class="alert-list"><li>Dor no peito ou falta de ar intensa</li><li>Desmaio, confusão súbita ou piora rápida</li></ul><p><strong>No Brasil, ligue 192 (SAMU) em uma emergência.</strong></p></div></div>
    <section>${head('Passos que podem ajudar')}<div class="step-list">
      <div class="step-card"><span class="step-number">1</span>${round('eye','blue')}<div><h3>Observe a evolução</h3><p>Anote quando começou, a intensidade e o que mudou.</p></div></div>
      <div class="step-card"><span class="step-number two">2</span>${round('stethoscope','green')}<div><h3>Busque orientação profissional</h3><p>Procure uma unidade de saúde se os sintomas persistirem ou preocuparem.</p></div></div>
      <div class="step-card"><span class="step-number three">3</span>${round('book','purple')}<div><h3>Use fontes confiáveis</h3><p>Consulte conteúdos educativos e evite se automedicar com base no aplicativo.</p></div></div>
    </div></section>
    <div class="stack-buttons"><button class="primary-btn" data-go="specialties">Encontrar atendimento</button><button class="secondary-btn" data-go="symptoms">Revisar meus sintomas</button></div>
    <div class="info-card">${round('heart','cyan')}<div><h3>Você não precisa decidir sozinho</h3><p>O OrientaSaúde apoia a busca por informação. Somente profissionais de saúde podem avaliar seu caso.</p></div></div>
    <div class="info-card">${round('shield','blue')}<div><h3>Antes do uso real</h3><p>As regras de orientação e os conteúdos de saúde devem ser revisados por profissionais qualificados.</p></div></div>
  </div>`;}

  function health(){return `<div class="page health-page">${appHeader()}
    <section>${head('Minha saúde','Acessos simples para o dia a dia')}</section>
    <section class="feature-card">${round('calendar','blue')}<div><h3>Consultas e lembretes</h3><p>Organize consultas e crie lembretes de horários.</p><button class="small-blue-btn" type="button" data-go="reminders">Ver meus lembretes</button></div></section>
    <section>${head('Encontrar atendimento','Explore especialidades e veja informações para buscar o serviço adequado.')}
      <button class="link-card" type="button" data-go="specialties">${round('search','green')}<div><h3>Especialidades médicas</h3><p>Consulte opções como clínica geral, pediatria, cardiologia e ortopedia.</p><span class="mini-tag green">Ver especialidades</span></div></button>
      <div class="specialties-grid section-pad">${specs.map(specialtyButton).join('')}</div>
      <button class="link-card soft-green section-pad" type="button" data-go="units">${round('pin','green')}<div><h3>Unidades de saúde</h3><p>Veja caminhos para localizar endereços e informações de atendimento.</p><span class="mini-tag green">Consultar unidades</span></div>${arrow('green-txt')}</button>
    </section>
    <section>${head('Cuide de você todos os dias')}<div class="health-grid">${actCard('Medicamentos','Crie lembretes de horários registrados por você.','pill','purple','reminders')}${actCard('Educação em saúde','Aprenda sobre sintomas e prevenção.','book','yellow','education')}</div></section>
    ${infoBar()}
    <button type="button" class="link-card" data-go="symptoms">${round('message','blue')}<div><h3>Precisa de orientação?</h3><p>Volte à tela inicial e descreva seus sintomas.</p></div>${arrow()}</button>
  </div>`;}

  function specialties(){const chosen=specs.find(s=>s.id===state.activeSpecialty); return `<div class="page">${backHeader('Especialidades médicas','Informações para encontrar atendimento','health')}
    <div class="soft-alert">${icon('info')}<p>Estas descrições são educativas. Elas não substituem a escolha de atendimento com um profissional e não representam agendamento.</p></div>
    ${head('Conheça as especialidades','Selecione uma opção para saber mais.')}
    <div class="specialties-grid">${specs.map(specialtyButton).join('')}</div>
    ${chosen?`<div class="white-card">${round(chosen.icon,chosen.tone)}<h3 style="margin-top:12px">${esc(chosen.name)}</h3><p>${esc(chosen.more)}</p><div class="stack-buttons"><button class="primary-btn" data-go="units">Buscar unidades de saúde</button></div></div>`:''}
    <div class="notice">${round('alert','yellow')}<div><strong>Em sinais graves, busque ajuda imediatamente</strong><p>Não espere por consulta eletiva ou orientação do aplicativo.</p></div></div>
  </div>`;}
  function units(){const q=encodeURIComponent('unidades de saúde Foz do Iguaçu Paraná');const google=`https://www.google.com/maps/search/?api=1&query=${q}`; const cnes='https://cnes.datasus.gov.br/';return `<div class="page">${backHeader('Unidades de saúde','Onde encontrar atendimento','health')}
    <div class="split-hero"><h1>Encontre atendimento em Foz do Iguaçu</h1><p>Consulte informações atualizadas de localização e funcionamento nos canais externos. Não temos cadastro próprio de unidades nesta demonstração.</p></div>
    <div class="list-stack">
      <div class="white-card">${round('pin','green')}<h3 style="margin-top:12px">Pesquisar locais em um mapa</h3><p>Veja unidades próximas, endereços, rotas e informações que precisam ser confirmadas diretamente com o serviço.</p><div class="row-buttons"><a class="small-outline" href="${google}" target="_blank" rel="noopener noreferrer">Abrir busca no Google Maps</a></div></div>
      <div class="white-card">${round('records','blue')}<h3 style="margin-top:12px">Cadastro Nacional de Estabelecimentos de Saúde</h3><p>Consulte a base pública de estabelecimentos de saúde do Brasil e filtre por município.</p><div class="row-buttons"><a class="small-outline" href="${cnes}" target="_blank" rel="noopener noreferrer">Consultar CNES / DataSUS</a></div></div>
    </div>
    <div class="notice red">${round('alert','red')}<div><strong>Emergência: SAMU 192</strong><p>Se houver risco imediato, não use mapas ou buscas como substitutos de atendimento urgente.</p></div></div>
  </div>`;}

  function education(){const article=articles.find(a=>a.id===state.article);return `<div class="page">${backHeader(article?article.title:'Educação em saúde',article?'Leitura informativa':'Aprenda sobre sintomas e prevenção',article?'education':'health')}
    ${article?`<div class="white-card">${round(article.icon,article.tone)}<h2 class="section-heading" style="margin-top:11px">${esc(article.title)}</h2><p style="margin-top:7px">${esc(article.subtitle)}</p><ul class="description-bullet">${article.body.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></div><button class="secondary-btn" data-go="education">Ver todos os conteúdos</button>`:
      `${head('Conteúdos educativos','Informações gerais para apoiar uma conversa com profissionais de saúde.')}<div class="list-stack">${articles.map(a=>`<button class="link-card" type="button" data-article="${a.id}">${round(a.icon,a.tone)}<div><h3>${esc(a.title)}</h3><p>${esc(a.subtitle)}</p></div>${arrow()}</button>`).join('')}</div>`}
    ${infoBar('Conteúdo acadêmico demonstrativo: revisão técnica por profissionais de saúde é necessária antes de uso público.','shield','blue')}
  </div>`;}

  function reminders(){const sorted=[...data.reminders].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));return `<div class="page">${backHeader('Consultas e lembretes','Organize seus compromissos de saúde','health')}
    <div class="headline-with-action"><h2>Meus lembretes</h2><button type="button" data-action="new-reminder">${icon('plus','small')} Novo</button></div>
    ${state.showReminderForm?`<form id="reminder-form" class="white-card" autocomplete="off"><h3>${state.editingReminder?'Editar lembrete':'Criar lembrete'}</h3>
      <div class="field-group"><label for="reminder-kind">Tipo</label><select id="reminder-kind" name="kind" required><option value="consulta" ${state.reminderKind==='consulta'?'selected':''}>Consulta</option><option value="medicamento" ${state.reminderKind==='medicamento'?'selected':''}>Medicamento</option><option value="outro">Outro compromisso</option></select></div>
      <div class="field-group"><label for="reminder-name">Descrição</label><input id="reminder-name" type="text" maxlength="100" name="title" required placeholder="Ex.: consulta marcada / horário registrado" /></div>
      <div class="field-row"><div class="field-group"><label for="reminder-date">Data</label><input id="reminder-date" type="date" name="date" required /></div><div class="field-group"><label for="reminder-time">Horário</label><input id="reminder-time" type="time" name="time" required /></div></div>
      <div class="field-group"><label for="reminder-notes">Observações (opcional)</label><textarea id="reminder-notes" name="notes" maxlength="400" placeholder="Anote apenas o necessário..."></textarea></div>
      <div class="stack-buttons"><button class="primary-btn" type="submit">Salvar lembrete</button><button class="secondary-btn" type="button" data-action="cancel-reminder">Cancelar</button></div></form>`:''}
    ${sorted.length?`<div class="list-stack">${sorted.map(r=>`<div class="list-entry"><div class="entry-head"><div><h3>${esc(r.title)}</h3><span class="mini-tag ${r.done?'green':''}">${r.kind==='consulta'?'Consulta':r.kind==='medicamento'?'Medicamento':'Compromisso'}${r.done?' · Concluído':''}</span><p>${icon('calendar','small')} ${dateLabel(r.date)} às ${esc(r.time)}</p>${r.notes?`<p>${esc(r.notes)}</p>`:''}</div><button class="icon-btn" aria-label="Excluir ${esc(r.title)}" type="button" data-remove-reminder="${esc(r.id)}">${icon('trash','small')}</button></div><div class="row-buttons"><button class="small-outline" type="button" data-done-reminder="${esc(r.id)}">${r.done?'Marcar como pendente':'Marcar como concluído'}</button></div></div>`).join('')}</div>`:
      `<div class="empty-state">${round('bell','blue')}<h3>Nenhum lembrete cadastrado</h3><p>Organize consultas e horários de medicamentos definidos por profissionais. Os dados são salvos neste navegador.</p>${!state.showReminderForm?`<button class="primary-btn" type="button" data-action="new-reminder">Criar primeiro lembrete</button>`:''}</div>`}
    <p class="meta-note">Os lembretes ficam neste navegador e não enviam alertas automáticos com o site fechado. Não escolha ou altere medicamentos com base neste aplicativo.</p>
  </div>`;}

  function records(){const filtered=data.records.filter(r=>state.filter==='todos'||(r.urgency||'')===state.filter);return `<div class="page">${backHeader('Meus registros','Histórico de orientações informativas','home')}
    <div class="headline-with-action"><h2>Relatos de sintomas</h2><button type="button" data-go="symptoms">${icon('plus','small')} Novo relato</button></div>
    ${data.records.length?`<div class="filter-pills">${[['todos','Todos'],['high','Atenção alta'],['medium','Atenção aumentada'],['low','Orientação geral']].map(([id,t])=>`<button type="button" class="choice ${state.filter===id?'selected':''}" data-filter="${id}">${t}</button>`).join('')}</div>`:''}
    ${filtered.length?`<div class="list-stack">${filtered.map(r=>`<div class="list-entry"><div class="entry-head"><div><h3>${esc([...(r.selected||[]),r.text].filter(Boolean).join(' • ')||'Relato de sintomas')}</h3><p>${whenLabel(r.createdAt)}</p><span class="mini-tag ${r.urgency==='high'?'red':r.urgency==='medium'?'amber':'green'}">${r.urgency==='high'?'Sinal de alerta informado':r.urgency==='medium'?'Atenção aumentada':'Orientação geral'}</span></div><button type="button" class="icon-btn" data-remove-record="${esc(r.id)}" aria-label="Excluir registro">${icon('trash','small')}</button></div><div class="row-buttons"><button type="button" class="small-outline" data-open-record="${esc(r.id)}">Ver orientação</button></div></div>`).join('')}</div>`:
      `<div class="empty-state">${round('records','blue')}<h3>${data.records.length?'Nenhum registro neste filtro':'Você ainda não tem registros'}</h3><p>Descreva o que está sentindo para manter um histórico local e consultar orientações gerais.</p><button class="primary-btn" type="button" data-go="symptoms">Descrever sintomas</button></div>`}
    <p class="meta-note">Seus relatos são armazenados somente neste dispositivo e podem ser apagados na seção Perfil. Não utilize o histórico como prontuário médico.</p>
  </div>`;}
  function profile(){return `<div class="page">${backHeader('Meu perfil','Preferências e dados deste navegador','home')}
    <div class="profile-intro">${round('user','blue')}<div><h2>${data.profile.name?esc(data.profile.name):'Bem-vindo ao OrientaSaúde'}</h2><p>Protótipo acadêmico sem login e sem servidor.</p></div></div>
    <form id="profile-form" class="white-card"><h3>Personalizar meu perfil</h3><div class="field-group"><label for="profile-name">Como deseja ser chamado? (opcional)</label><input id="profile-name" name="name" maxlength="60" value="${esc(data.profile.name)}" placeholder="Nome ou apelido" /></div><div class="stack-buttons"><button class="primary-btn" type="submit">Salvar preferência</button></div></form>
    <div class="white-card"><h3>Acessibilidade</h3><p>Altere o tamanho do texto usando o botão A+ na página inicial ou a opção abaixo.</p><div class="row-buttons"><button class="small-outline" type="button" data-action="font">Alterar tamanho de texto: ${['Padrão','Grande','Muito grande'][data.font%3]}</button></div></div>
    <div class="white-card"><h3>Privacidade e armazenamento</h3><p>Registros, lembretes e preferências são salvos apenas no armazenamento local do navegador. Não há envio para servidores, login ou sincronização entre aparelhos.</p><div class="row-buttons"><button class="small-outline" type="button" data-action="export">Exportar meus dados</button><button class="small-outline" type="button" data-action="clear">Apagar dados locais</button></div></div>
    ${infoBar('Este projeto é uma demonstração acadêmica. Os conteúdos e regras precisam de revisão por profissionais de saúde antes de qualquer uso real.','shield','green')}
    <div class="app-endnote">OrientaSaúde · Protótipo de Engenharia de Software · Projeto acadêmico · Foz do Iguaçu, PR</div>
  </div>`;}
  function emergency(){return `<div class="page">${backHeader('Emergência','Quando buscar ajuda imediatamente','home')}
    <div class="notice red">${round('medkit','red')}<div><strong>Em caso de risco imediato, ligue 192 (SAMU)</strong><p>Não espere pelo preenchimento de sintomas, por respostas deste site ou por buscas de endereço.</p></div></div>
    ${head('Exemplos de sinais graves')}
    <div class="step-list"><div class="step-card">${round('heart','red')}<div><h3>Dor no peito ou falta de ar intensa</h3><p>Não aguarde orientação por aplicativo.</p></div></div><div class="step-card">${round('alert','yellow')}<div><h3>Desmaio ou confusão súbita</h3><p>Procure ajuda imediata.</p></div></div><div class="step-card">${round('clock','blue')}<div><h3>Piora rápida</h3><p>Busque atendimento de urgência.</p></div></div></div>
    <a href="tel:192" class="primary-btn" style="text-decoration:none">Ligar para 192 (SAMU)</a>
    <p class="meta-note">O atendimento de emergência pode variar por região; o número 192 é do SAMU no Brasil.</p>
  </div>`;}

  function render(scroll=true){
    document.documentElement.style.setProperty('--scale',[1,1.1,1.22][data.font%3]);
    let view = state.view;
    const pages = {home,symptoms,details,orientation,health,specialties,units,education,reminders,records,profile,emergency};
    app.innerHTML=(pages[view]||home)()+miniWarning();
    nav.innerHTML=tabBar();
    i18n.localize(app);
    i18n.localize(nav);
    i18n.addPicker(app);
    document.title=`${i18n.t(view==='home'?'Início':({symptoms:'Descrever sintomas',details:'Detalhes',orientation:'Orientação',health:'Minha saúde',specialties:'Especialidades',units:'Unidades',education:'Dicas de saúde',reminders:'Lembretes',records:'Registros',profile:'Perfil',emergency:'Emergência'})[view]||'OrientaSaúde')} | OrientaSaúde`;
    if(scroll)window.scrollTo({top:0,behavior:'instant'});
  }
  function startSymptoms(){state.selected=[];state.text='';state.search='';state.duration='';state.worsening='';state.intensity='';state.flags=[];state.report=null;state.error='';}
  function navigate(view){if(view==='symptoms' && !['symptoms','details','orientation'].includes(state.view))startSymptoms();
    if(view==='education')state.article=null;
    if(view==='specialties'&&state.view!=='specialties')state.activeSpecialty=null;
    state.view=view;state.error='';render();}
  function openReminder(type){state.view='reminders';state.showReminderForm=true;state.editingReminder=null;state.reminderKind=type||'consulta';render();}
  function currentReport(){return {id:`rec-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,createdAt:new Date().toISOString(),selected:[...state.selected],text:state.text.trim(),duration:state.duration,worsening:state.worsening,intensity:state.intensity,flags:[...state.flags]};}
  function saveReport(){const rec=currentReport();rec.urgency=urgencyFor(rec).kind;data.records.unshift(rec);persist();state.report=rec;state.view='orientation';render();}

  document.addEventListener('click',e=>{
    const t=e.target.closest('button[data-go],button[data-action],button[data-specialty],button[data-article],button[data-symptom],button[data-choice],button[data-new-reminder],button[data-remove-reminder],button[data-done-reminder],button[data-remove-record],button[data-open-record],button[data-filter]');
    if(!t)return;
    if(t.dataset.go){navigate(t.dataset.go);return;}
    if(t.dataset.symptom){const value=t.dataset.symptom;if(state.selected.includes(value))state.selected=state.selected.filter(s=>s!==value);else state.selected.push(value);state.error='';render(false);return;}
    if(t.dataset.choice){state[t.dataset.choice]=t.dataset.value;render(false);return;}
    if(t.dataset.specialty){state.activeSpecialty=t.dataset.specialty;state.view='specialties';render();return;}
    if(t.dataset.article){state.article=t.dataset.article;state.view='education';render();return;}
    if(t.dataset.newReminder){openReminder(t.dataset.newReminder);return;}
    if(t.dataset.filter){state.filter=t.dataset.filter;render(false);return;}
    if(t.dataset.openRecord){const record=data.records.find(r=>r.id===t.dataset.openRecord);if(record){state.report=record;state.view='orientation';render();}return;}
    if(t.dataset.removeRecord){if(!confirm(i18n.t('Deseja excluir este registro deste navegador?')))return;data.records=data.records.filter(r=>r.id!==t.dataset.removeRecord);persist();render(false);notify('Registro excluído.');return;}
    if(t.dataset.removeReminder){if(!confirm(i18n.t('Deseja excluir este lembrete?')))return;data.reminders=data.reminders.filter(r=>r.id!==t.dataset.removeReminder);persist();render(false);notify('Lembrete excluído.');return;}
    if(t.dataset.doneReminder){const r=data.reminders.find(r=>r.id===t.dataset.doneReminder);if(r){r.done=!r.done;persist();render(false);}return;}
    switch(t.dataset.action){
      case 'font':data.font=(data.font+1)%3;persist();render(false);notify(`Texto: ${['padrão','grande','muito grande'][data.font]}.`);break;
      case 'symptoms-next':if(!state.selected.length&&!state.text.trim()){state.error='Selecione ao menos um sintoma ou descreva o que está sentindo.';render(false);return;}state.view='details';render();break;
      case 'details-next':saveReport();break;
      case 'new-reminder':openReminder('consulta');break;
      case 'cancel-reminder':state.showReminderForm=false;state.editingReminder=null;render(false);break;
      case 'export':{const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),...data},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='orientasaude-meus-dados.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Exportação iniciada.');break;}
      case 'clear':if(confirm(i18n.t('Apagar todos os registros, lembretes e preferências deste navegador? Esta ação não pode ser desfeita.'))){data=structuredClone(defaultData);try{['orientasaude-studio-city-v1','orientasaude-studio-ux-prefs','orientasaude-studio-tip-font'].forEach(key=>localStorage.removeItem(key))}catch{}i18n.setLanguage('pt-BR');persist();window.location.assign('./');}break;
    }
  });
  document.addEventListener('input',e=>{
    if(e.target.id==='symptom-description')state.text=e.target.value;
    if(e.target.id==='symptom-search'){
      state.search=e.target.value;
      const term=state.search.trim().toLocaleLowerCase(i18n.locale());
      let shown=0;
      document.querySelectorAll('[data-symptom-name]').forEach(el=>{const ok=el.dataset.symptomName.includes(term);el.hidden=!ok;if(ok)shown++;});
      const empty=document.getElementById('no-search-results');if(empty)empty.hidden=shown>0;
    }
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='app-language'){
      const keep={};
      ['reminder-name','reminder-date','reminder-time','reminder-notes','reminder-kind','profile-name'].forEach(id=>{const el=document.getElementById(id);if(el)keep[id]=el.value;});
      i18n.setLanguage(e.target.value);
      render(false);
      Object.entries(keep).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.value=value;});
      return;
    }
    if(e.target.dataset.flag){const val=e.target.dataset.flag;if(e.target.checked&&!state.flags.includes(val))state.flags.push(val);if(!e.target.checked)state.flags=state.flags.filter(f=>f!==val);}
  });
  document.addEventListener('submit',e=>{
    if(e.target.id==='reminder-form'){
      e.preventDefault();const f=new FormData(e.target),title=String(f.get('title')||'').trim(),date=f.get('date'),time=f.get('time');
      if(!title||!date||!time){notify('Preencha descrição, data e horário.');return;}
      data.reminders.push({id:`rem-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,kind:String(f.get('kind')),title,date:String(date),time:String(time),notes:String(f.get('notes')||'').trim(),done:false});persist();state.showReminderForm=false;render(false);notify('Lembrete salvo neste navegador.');
    }
    if(e.target.id==='profile-form'){e.preventDefault();const f=new FormData(e.target);data.profile.name=String(f.get('name')||'').trim();persist();render(false);notify('Preferência salva.');}
  });
  render();
})();