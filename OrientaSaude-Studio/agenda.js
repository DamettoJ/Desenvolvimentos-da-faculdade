/* Local-only agenda. Reads the same reminder store as the main OrientaSaúde; no external API. */
(() => {'use strict';
const STORE='orientasaude-studio-demo-v1';const q=s=>document.querySelector(s);const esc=s=>String(s??'').replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[k]));
function get(){try{const a=JSON.parse(localStorage.getItem(STORE)||'{}');return Array.isArray(a.reminders)?a.reminders:[]}catch{return []}}
const today=new Date(),zero=v=>String(v).padStart(2,'0'),iso=d=>d.getFullYear()+'-'+zero(d.getMonth()+1)+'-'+zero(d.getDate());
const start=new Date(today.getFullYear(),today.getMonth(),1);let month=new Date(start),chosen=iso(today);
const stamp=d=>Math.floor(new Date(d+'T12:00:00').getTime()/86400000);
function occurs(e,day){if(!e||!e.date||e.date>day)return false;if(e.date===day)return true;
 const repeat=e.repeat||'none';if(repeat==='none')return false;
 if(repeat==='daily')return true;
 if(repeat==='weekly')return (stamp(day)-stamp(e.date))%7===0;
 if(repeat==='monthly')return Number(e.date.slice(8,10))===Number(day.slice(8,10));
 return false;
}
function list(day){return get().filter(e=>occurs(e,day)).sort((a,b)=>String(a.time).localeCompare(String(b.time)))}
function render(){q('#month-label').textContent=new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(month);
 const first=new Date(month.getFullYear(),month.getMonth(),1),last=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
 const offset=first.getDay();let html=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(x=>'<div class="weekday">'+x+'</div>').join('');
 for(let i=0;i<offset;i++)html+='<button disabled aria-hidden="true"></button>';
 for(let i=1;i<=last;i++){
 const day=iso(new Date(month.getFullYear(),month.getMonth(),i)), events=list(day);html+='<button type="button" data-day="'+day+'" class="'+(chosen===day?'current ':'')+(day===iso(today)?'today ':'')+(events.length?'has-events':'')+'" aria-label="'+new Intl.DateTimeFormat('pt-BR',{dateStyle:'full'}).format(new Date(day+'T12:00:00'))+(events.length?', '+events.length+' compromissos':'')+'">'+i+'</button>';
 }
 q('#days').innerHTML=html;
 q('#day-title').textContent='Compromissos de '+new Intl.DateTimeFormat('pt-BR',{dateStyle:'long'}).format(new Date(chosen+'T12:00:00'));
 const events=list(chosen);
 q('#day-events').innerHTML=events.length?events.map(e=>'<div class="day-event"><strong>'+esc(e.time||'--:--')+' · '+esc(e.title||'Compromisso')+'</strong><p>'+esc(e.kind==='medicamento'?'Medicamento registrado':e.kind==='consulta'?'Consulta':'Compromisso')+(e.notes?' · '+esc(e.notes):'')+'</p>'+(e.repeat&&e.repeat!=='none'?'<small>Repete: '+esc(({daily:'diariamente',weekly:'semanalmente',monthly:'mensalmente'})[e.repeat]||'')+'</small>':'')+'</div>').join(''):'<p class="empty">Nenhum compromisso neste dia.</p>';
}
q('#prev').addEventListener('click',()=>{month=new Date(month.getFullYear(),month.getMonth()-1,1);chosen=iso(month);render()});q('#next').addEventListener('click',()=>{month=new Date(month.getFullYear(),month.getMonth()+1,1);chosen=iso(month);render()});
q('#days').addEventListener('click',e=>{const b=e.target.closest('[data-day]');if(b){chosen=b.dataset.day;render()}});
q('input[name=date]').value=chosen;
q('#add').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget);const title=String(f.get('title')||'').trim(),date=String(f.get('date')||''),time=String(f.get('time')||'');
 if(!title||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))return;
 let data;try{data=JSON.parse(localStorage.getItem(STORE)||'{}')}catch{data={}};
 data.reminders=Array.isArray(data.reminders)?data.reminders:[];
 data.reminders.push({id:'rem-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),title,date,time,kind:String(f.get('kind')),notes:String(f.get('notes')||'').trim(),repeat:String(f.get('repeat')||'none'),done:false});
 try{localStorage.setItem(STORE,JSON.stringify(data));q('#status').textContent='Compromisso salvo neste navegador.';e.currentTarget.reset();q('input[name=date]').value=date;month=new Date(Number(date.slice(0,4)),Number(date.slice(5,7))-1,1);chosen=date;render()}catch{q('#status').textContent='Não foi possível salvar. Verifique o armazenamento do navegador.'}
});
const icalEscape=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const icalDate=(date,time)=>date.replace(/-/g,'')+'T'+time.replace(':','')+'00';
q('#ics').addEventListener('click',()=>{
 const reminders=get().filter(x=>x.title&&x.date&&x.time);
 if(!reminders.length){q('#status').textContent='Cadastre ao menos um compromisso antes de exportar.';return}
 const now=new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
 const events=reminders.map((e,i)=>{const start=e.date+'T'+e.time+':00',end=new Date(new Date(start).getTime()+30*60000);const endDate=iso(end),endTime=zero(end.getHours())+':'+zero(end.getMinutes());const repeat=({daily:'DAILY',weekly:'WEEKLY',monthly:'MONTHLY'})[e.repeat];
 return ['BEGIN:VEVENT','UID:orientasaude-'+(e.id||i).replace(/[^a-zA-Z0-9-]/g,'')+'@local','DTSTAMP:'+now,'DTSTART:'+icalDate(e.date,e.time),'DTEND:'+icalDate(endDate,endTime),'SUMMARY:'+icalEscape(e.title),'DESCRIPTION:'+icalEscape(e.notes||'Compromisso registrado pelo usuário'),repeat?'RRULE:FREQ='+repeat:null,'END:VEVENT'].filter(Boolean).join('\r\n')}).join('\r\n');
 const str='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//OrientaSaude//Agenda Local//PT-BR\r\nCALSCALE:GREGORIAN\r\n'+events+'\r\nEND:VCALENDAR\r\n';
 const blob=new Blob([str],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='orientasaude-agenda.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);q('#status').textContent='Arquivo exportado. O aplicativo de calendário escolhido será responsável pelas notificações.';
});
window.addEventListener('storage',render);render();
})();