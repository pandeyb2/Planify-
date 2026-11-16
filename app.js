const $=id=>document.getElementById(id);
const STORE='planify-v1';
let data=JSON.parse(localStorage.getItem(STORE)||'{"events":[],"tasks":[]}');
let filter='upcoming', alerted=new Set();
const save=()=>{localStorage.setItem(STORE,JSON.stringify(data));render()};
const today=()=>{let d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const dt=e=>new Date(`${e.date}T${e.time||'00:00'}:00`);
const fmt=d=>d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
const toast=m=>{let t=$('toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2600)};
$('todayLabel').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
$('greeting').textContent=(new Date().getHours()<12?'Good morning.':new Date().getHours()<18?'Good afternoon.':'Good evening.');
function render(){
 const now=new Date(), upcoming=data.events.filter(e=>dt(e)>=new Date(now.getTime()-60000)).sort((a,b)=>dt(a)-dt(b));
 $('eventCount').textContent=upcoming.length;
 $('taskCount').textContent=data.tasks.filter(t=>!t.done).length;
 $('nextReminder').textContent=upcoming.length?fmt(dt(upcoming[0])):'Nothing scheduled';
 let list=(filter==='all'?data.events:[...upcoming]).sort((a,b)=>dt(a)-dt(b));
 $('eventList').innerHTML=list.length?list.map(e=>`<article class="event"><div class="event-date"><b>${dt(e).toLocaleDateString(undefined,{day:'2-digit'})}</b><small>${dt(e).toLocaleDateString(undefined,{month:'short'})}</small></div><div><h4>${esc(e.title)}</h4><p>${fmt(dt(e))} · ${esc(e.time)}${e.location?' · '+esc(e.location):''}</p><span class="tag">${esc(e.category)}</span></div><div class="event-actions"><button class="icon-btn" title="Edit" data-edit="${e.id}">✎</button><button class="icon-btn" title="Delete" data-delete="${e.id}">⌫</button></div></article>`).join(''):'<div class="empty"><b>Your calendar is clear.</b>Add an event to start planning something lovely.</div>';
 $('taskList').innerHTML=data.tasks.length?data.tasks.map(t=>`<div class="task ${t.done?'done':''}"><input type="checkbox" data-task="${t.id}" ${t.done?'checked':''}><span class="task-name">${esc(t.title)}</span><small>${t.due?fmt(new Date(t.due+'T12:00:00')):''}</small><button class="icon-btn" data-taskdel="${t.id}" aria-label="Delete task">×</button></div>`).join(''):'<div class="empty" style="padding:14px 4px">No tasks yet. Add a priority for today.</div>';
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function openEvent(e){$('eventForm').reset();$('eventId').value=e?.id||'';$('dialogTitle').textContent=e?'Edit event':'Create an event';$('title').value=e?.title||'';$('date').value=e?.date||today();$('time').value=e?.time||'09:00';$('category').value=e?.category||'Personal';$('remind').value=e?.remind??'15';$('location').value=e?.location||'';$('notes').value=e?.notes||'';$('eventDialog').showModal()}
$('newEventBtn').onclick=()=>openEvent();$('closeDialog').onclick=$('cancelDialog').onclick=()=>$('eventDialog').close();
$('eventForm').onsubmit=ev=>{ev.preventDefault();let id=$('eventId').value||crypto.randomUUID();let item={id,title:$('title').value.trim(),date:$('date').value,time:$('time').value,category:$('category').value,remind:Number($('remind').value),location:$('location').value.trim(),notes:$('notes').value.trim(),alerted:false};data.events=data.events.filter(x=>x.id!==id);data.events.push(item);save();$('eventDialog').close();toast('Event saved')};
$('eventList').onclick=ev=>{let edit=ev.target.closest('[data-edit]'),del=ev.target.closest('[data-delete]');if(edit){let e=data.events.find(x=>x.id===edit.dataset.edit);openEvent(e)}if(del&&confirm('Delete this event?')){data.events=data.events.filter(x=>x.id!==del.dataset.delete);save();toast('Event deleted')}};
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));render()});
function openTask(){$('taskTitle').value='';$('taskDue').value='';$('taskDialog').showModal()}
$('addTaskBtn').onclick=$('quickTask').onclick=openTask;$('closeTask').onclick=$('cancelTask').onclick=()=>$('taskDialog').close();
$('taskForm').onsubmit=e=>{e.preventDefault();data.tasks.push({id:crypto.randomUUID(),title:$('taskTitle').value.trim(),due:$('taskDue').value,done:false});save();$('taskDialog').close();toast('Task added')};
$('taskList').onclick=e=>{let cb=e.target.closest('[data-task]'),del=e.target.closest('[data-taskdel]');if(cb){let t=data.tasks.find(x=>x.id===cb.dataset.task);t.done=cb.checked;save()}if(del){data.tasks=data.tasks.filter(t=>t.id!==del.dataset.taskdel);save()}};
$('exportBtn').onclick=()=>{let a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.href=url;a.download='planify-backup.json';a.click();URL.revokeObjectURL(url)};
$('importBtn').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{try{let obj=JSON.parse(await e.target.files[0].text());if(!Array.isArray(obj.events)||!Array.isArray(obj.tasks))throw 0;data=obj;save();toast('Backup imported')}catch{alert('That file is not a valid Planify backup.')}e.target.value=''};
async function enableNotifications(){if(!('Notification'in window)){alert('Notifications are not supported by this browser.');return}let p=await Notification.requestPermission();$('alertStatus').textContent=p==='granted'?'Alerts are enabled. Keep Planify open to receive scheduled reminders.':'Notifications are not enabled. You can still use your planner.';toast(p==='granted'?'Alerts enabled':'Permission not granted')}
$('notifyBtn').onclick=enableNotifications;
function checkReminders(){if(!('Notification'in window)||Notification.permission!=='granted')return;let now=Date.now();for(let e of data.events){let due=dt(e).getTime()-Number(e.remind||0)*60000;if(!e.alerted&&due<=now&&dt(e).getTime()>now-3600000){new Notification('Planify reminder: '+e.title,{body:`${e.time}${e.location?' · '+e.location:''}`,icon:'icons/icon-192.png',tag:e.id});e.alerted=true;localStorage.setItem(STORE,JSON.stringify(data));}}}
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
setInterval(checkReminders,15000);checkReminders();render();
if('Notification'in window&&Notification.permission==='granted')$('alertStatus').textContent='Alerts are enabled. Keep Planify open to receive scheduled reminders.';
