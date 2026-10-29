import {useEffect,useState} from 'react'
import {Home as HomeIcon,Dumbbell,BarChart3,History as HistoryIcon,User,Check,Plus,Play,Pause,RotateCcw,X,ChevronUp,ChevronDown,Trash2,Copy,SkipForward} from 'lucide-react'
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,LineChart,Line,CartesianGrid} from 'recharts'
import type {ExLog,SetLog,Session,State} from './types'
import {useHealth,exportJSON,parseBackup,importState,useStore,update,uid,iso,disp,toKg,vol,e1rm,weekKey,doneSets,lastSets,nDone,startSession,startByMuscles,startPastSession,resetAll} from './store'

const buzz=()=>navigator.vibrate?.(10)
const D=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const fmt=(n:number)=>Math.round(n).toLocaleString()
const Empty=({t}:{t:string})=><div className="card text-center text-white/50 text-sm">{t}</div>
const Stat=({l,v}:{l:string;v:string|number})=><div className="card flex-1 !p-3"><div className="text-2xl font-bold">{v}</div><div className="text-xs text-white/50">{l}</div></div>

function Num({v,on,ph,mode='decimal'}:{v:number;on:(n:number)=>void;ph:string;mode?:'decimal'|'numeric'}){
return <input className="inp text-center text-lg font-semibold !px-1" inputMode={mode} placeholder={ph} defaultValue={v||''} onChange={e=>on(parseFloat(e.target.value.replace(',','.'))||0)}/>}
function Field({l,children}:{l:string;children:React.ReactNode}){
return <label className="block"><div className="text-xs text-white/50 mb-1">{l}</div>{children}</label>}
let lastSelectedMuscles:string[]|null=null

function Home({go}:{go:(n:number)=>void}){
const {prefs,split,history,active}=useStore()
const h=new Date().getHours(),g=h<12?'Good morning':h<18?'Good afternoon':'Good evening'
const today=split.find(d=>d.weekday===new Date().getDay())
const wk=weekKey(iso()),thisWeek=history.filter(s=>weekKey(s.date)===wk)
const weeks=new Set(history.map(s=>weekKey(s.date)));let streak=0
const c=new Date(wk+'T00:00:00');if(!weeks.has(iso(c)))c.setDate(c.getDate()-7)
while(weeks.has(iso(c))){streak++;c.setDate(c.getDate()-7)}
const last=history[0]
const allMuscles=['Chest','Back','Legs','Shoulders','Biceps','Triceps','Abs']
for(const day of split){
for(const ex of day.exercises){
if(ex.muscle&&!allMuscles.includes(ex.muscle)){allMuscles.push(ex.muscle)}
}}
const todayMuscles:string[]=[]
if(today){
for(const ex of today.exercises){
if(ex.muscle&&!todayMuscles.includes(ex.muscle)){todayMuscles.push(ex.muscle)}
}}
const [selectedMuscles,setSelectedMuscles]=useState<string[]>(()=>{
if(lastSelectedMuscles!==null){return lastSelectedMuscles}
return todayMuscles
})
function toggleMuscle(m:string){
setSelectedMuscles(prev=>{
let next:string[]
if(prev.includes(m)){next=prev.filter(x=>x!==m)}
else{next=[...prev,m]}
lastSelectedMuscles=next
return next
})
}
const matchingExerciseNames=new Set<string>()
for(const m of selectedMuscles){
for(const day of split){
for(const ex of day.exercises){
if(ex.muscle===m){matchingExerciseNames.add(ex.name)}
}}}
const exerciseCount=matchingExerciseNames.size
const emptyMuscles:string[]=[]
for(const m of selectedMuscles){
let found=false
for(const day of split){
for(const ex of day.exercises){
if(ex.muscle===m){found=true;break}
}
if(found)break
}
if(!found){emptyMuscles.push(m)}
}
return <div className="space-y-4">
<div><div className="text-white/50 text-sm">{new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</div>
<h1 className="text-3xl font-extrabold">{g}{prefs.name?`, ${prefs.name}`:''}</h1></div>
{active?(
<button className="btn sec w-full justify-between" onClick={()=>go(1)}>Continue {active.name}<Play size={18}/></button>
):(
<div className="card space-y-3">
<div><div className="text-white/50 text-sm">What are you training?</div><div className="text-xl font-bold">Choose muscles</div></div>
{allMuscles.length===0?<div className="text-sm text-white/50">No muscles found in split. Add exercises in the Workout tab.</div>:(
<div className="flex flex-wrap gap-2">
{allMuscles.map(m=>{const on=selectedMuscles.includes(m)
return <button key={m} type="button" onClick={()=>toggleMuscle(m)} className={`h-10 px-3.5 rounded-xl text-sm font-semibold transition-all ${on?'bg-accent text-black':'bg-white/10 text-white hover:bg-white/15'}`}>{m}</button>})}
</div>)}
{emptyMuscles.length>0&&<div className="text-xs text-amber-400">No exercises saved for {emptyMuscles.join(', ')}. Add some in Workout &gt; Add exercise.</div>}
<button className="btn pri w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100" disabled={selectedMuscles.length===0} onClick={()=>{if(active)return go(1);if(selectedMuscles.length===0)return;startByMuscles(selectedMuscles);go(1)}}><Play size={18}/>{selectedMuscles.length===0?'Start workout':`Start workout · ${exerciseCount} ${exerciseCount===1?'exercise':'exercises'}`}</button>
</div>)}
<div className="card"><div className="text-white/50 text-sm">{today?'Planned today':'Today'}</div>
<div className="text-3xl font-extrabold my-1">{today?today.name:'Rest day'}</div>
{today&&<div className="text-sm text-white/50 mb-3">{today.exercises.length} exercises</div>}
<button className="btn pri w-full mt-2" onClick={()=>{if(active)return go(1);startSession(today?.id);go(1)}}><Play size={18}/>Start workout</button></div>
{!history.length?<Empty t="Finish your first workout and your stats show up here."/>:<>
<div className="flex gap-3"><Stat l="Workouts" v={history.length}/><Stat l="Week streak" v={streak}/><Stat l={`Volume (${prefs.unit})`} v={fmt(disp(history.reduce((a,s)=>a+vol(s),0),prefs.unit))}/></div>
<div className="card"><div className="flex justify-between mb-3"><b>This week</b><span className="text-white/50 text-sm">{thisWeek.length}/{prefs.goal}</span></div>
<div className="flex justify-between">{[0,1,2,3,4,5,6].map(i=>{const d=new Date(wk+'T00:00:00');d.setDate(d.getDate()+i)
const on=thisWeek.some(s=>s.date===iso(d));return <div key={i} className="text-center text-xs text-white/50"><div className={`w-9 h-9 rounded-full mb-1 flex items-center justify-center ${on?'bg-accent text-black':'bg-white/10'}`}>{on&&<Check size={16}/>}</div>{D[(i+1)%7][0]}</div>})}</div></div>
{last&&<div className="card"><div className="text-white/50 text-sm">Last workout · {last.date}</div><div className="text-xl font-bold">{last.name}</div>
<div className="text-sm text-white/60">{nDone(last)} sets · {fmt(disp(vol(last),prefs.unit))} {prefs.unit}</div></div>}</>}
</div>}

function ExCard({e,u,onDone}:{e:ExLog;u:'kg'|'lb';onDone:()=>void}){
const [open,setOpen]=useState(true),[ver,setVer]=useState(0)
const {history}=useStore();const prev=lastSets(history,e.name)
const mod=(fn:(x:ExLog)=>void)=>update(d=>{const x=d.active!.exercises.find(y=>y.id===e.id);if(x)fn(x)})
const setMod=(id:string,fn:(s:SetLog)=>void)=>mod(x=>{const s=x.sets.find(y=>y.id===id);if(s)fn(s)})
return <div className={`card ${e.skipped?'opacity-40':''}`}>
<button className="w-full flex justify-between items-center text-left" onClick={()=>setOpen(!open)}><div><div className="text-lg font-bold">{e.name}</div><div className="text-xs text-white/50">{e.muscle} · {doneSets(e).length}/{e.sets.length} sets</div></div>{open?<ChevronUp/>:<ChevronDown/>}</button>
{open&&<div className="mt-3 space-y-2">
{prev.length>0&&<div className="text-xs text-white/50">Last time: {prev.map(s=>`${disp(s.w,u)}×${s.r}`).join(' · ')} {u}</div>}
<div className="grid grid-cols-[20px_1fr_1fr_46px_46px] gap-1.5 text-[11px] text-white/40 text-center"><span/><span>{u}</span><span>reps</span><span>RPE</span><span/></div>
{e.sets.map((s,i)=><div key={s.id+ver} className="grid grid-cols-[20px_1fr_1fr_46px_46px] gap-1.5 items-center">
<span className="text-xs text-white/40">{i+1}</span>
<Num v={disp(s.w,u)} ph="0" on={n=>setMod(s.id,x=>{x.w=toKg(n,u)})}/>
<Num v={s.r} ph="0" mode="numeric" on={n=>setMod(s.id,x=>{x.r=n})}/>
<Num v={s.rpe||0} ph="–" on={n=>setMod(s.id,x=>{x.rpe=n||undefined})}/>
<button className={`h-12 rounded-xl flex items-center justify-center ${s.done?'bg-accent text-black':'bg-white/10'}`} onClick={()=>{buzz();setMod(s.id,x=>{x.done=!x.done});if(!s.done)onDone()}}><Check size={20}/></button></div>)}
<div className="flex gap-2 pt-1">
<button className="btn sec flex-1 !h-10 text-sm" onClick={()=>mod(x=>{const l=x.sets[x.sets.length-1];x.sets.push({id:uid(),w:l?.w||0,r:l?.r||0,done:false})})}><Plus size={16}/>Set</button>
<button className="btn sec !h-10 !px-3" onClick={()=>mod(x=>{x.sets.pop()})}><X size={16}/></button>
{prev.length>0&&<button className="btn sec !h-10 !px-3" title="Copy previous" onClick={()=>{mod(x=>{x.sets=prev.map(p=>({id:uid(),w:p.w,r:p.r,done:false}))});setVer(v=>v+1)}}><Copy size={16}/></button>}
<button className="btn sec !h-10 !px-3" onClick={()=>mod(x=>{x.skipped=!x.skipped})}><SkipForward size={16}/></button></div></div>}</div>}

function Active({a}:{a:Session}){
const {prefs}=useStore();const u=prefs.unit
const [left,setLeft]=useState(0),[run,setRun]=useState(false)
useEffect(()=>{if(!run)return;const t=setInterval(()=>setLeft(l=>{if(l<=1){setRun(false);navigator.vibrate?.(200);return 0}return l-1}),1000);return()=>clearInterval(t)},[run])
const n=nDone(a),total=a.exercises.reduce((s,e)=>s+e.sets.length,0)
const finish=()=>{if(!n&&!confirm('No sets completed. Discard this workout?'))return
update(d=>{const x=d.active;if(!x)return;if(n&&!d.history.some(h=>h.id===x.id)){if(!x.backfill){x.end=Date.now()}const nh=[x,...d.history];nh.sort((a,b)=>b.start-a.start);d.history=nh}d.active=null})}
return <div className="space-y-3">
<div className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-bg/95 backdrop-blur border-b border-line" style={{paddingTop:'calc(env(safe-area-inset-top) + 8px)'}}>
<div className="flex justify-between items-center"><div><div className="flex items-center gap-2"><span className="font-extrabold text-xl">{a.name}</span>{a.backfill&&<span className="text-xs bg-amber-400/20 text-amber-400 font-semibold px-2 py-0.5 rounded-md">Past workout</span>}</div><div className="text-xs text-white/50">{a.date} · {n}/{total} sets</div></div>
<div className="flex items-center gap-2"><span className="text-2xl font-bold tabular-nums w-16 text-right">{Math.floor(left/60)}:{String(left%60).padStart(2,'0')}</span>
<button className="btn sec !h-10 !px-3" onClick={()=>{if(left===0)setLeft(prefs.rest);setRun(!run)}}>{run?<Pause size={16}/>:<Play size={16}/>}</button>
<button className="btn sec !h-10 !px-3" onClick={()=>{setRun(false);setLeft(0)}}><RotateCcw size={16}/></button></div></div>
<div className="h-1 bg-white/10 rounded mt-2"><div className="h-1 bg-accent rounded transition-all" style={{width:`${total?n/total*100:0}%`}}/></div></div>
{a.exercises.map(e=><ExCard key={e.id} e={e} u={u} onDone={()=>{if(!a.backfill){setLeft(prefs.rest);setRun(true)}}}/>)}
<button className="btn sec w-full" onClick={()=>{const name=prompt('Exercise name');if(!name)return;const muscle=prompt('Muscle group','Other')||'Other'
update(d=>{d.active!.exercises.push({id:uid(),name:name.trim(),muscle,sets:Array.from({length:3},()=>({id:uid(),w:0,r:0,done:false}))})})}}><Plus size={18}/>Add exercise</button>
<button className="btn pri w-full" onClick={finish}>{a.backfill?'Save past workout':'Finish workout'}</button>
<button className="btn w-full text-red-400" onClick={()=>{if(confirm('Discard this workout? Logged sets will be lost.'))update(d=>{d.active=null})}}>Discard workout</button></div>}

function Workout({onOpenPast}:{onOpenPast:()=>void}){
const {active,split}=useStore()
if(active)return <Active a={active}/>
const sorted=[...split].sort((a,b)=>a.weekday-b.weekday)
const ed=(id:string,fn:(d:State['split'][number])=>void)=>update(s=>{const x=s.split.find(y=>y.id===id);if(x)fn(x)})
return <div className="space-y-4"><h1 className="text-3xl font-extrabold">Workout</h1>
<button className="btn sec w-full" onClick={()=>startSession()}><Play size={18}/>Start empty workout</button>
<button className="btn sec w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100" disabled={active!==null} onClick={()=>{if(!active)onOpenPast()}}><Plus size={18}/>Log a past workout</button>
{active!==null&&<div className="text-xs text-white/50 text-center">Finish or discard your current workout first</div>}
{sorted.map(d=><div key={d.id} className="card space-y-2">
<div className="flex justify-between items-center"><div><div className="text-xl font-bold">{d.name}</div><div className="text-xs text-white/50">{D[d.weekday]} · {d.exercises.length} exercises</div></div>
<div className="flex gap-1"><button className="btn pri !h-10 !px-4" onClick={()=>startSession(d.id)}><Play size={16}/>Start</button></div></div>
{d.exercises.map((e,i)=><div key={e.id} className="flex items-center gap-1 text-sm border-t border-line pt-2"><div className="flex-1"><div>{e.name}</div><div className="text-xs text-white/40">{e.muscle} · {e.sets} × {e.reps}</div></div>
<button className="p-2 text-white/50" onClick={()=>ed(d.id,x=>{if(i>0)[x.exercises[i-1],x.exercises[i]]=[x.exercises[i],x.exercises[i-1]]})}><ChevronUp size={16}/></button>
<button className="p-2 text-white/50" onClick={()=>{const n=prompt('Sets × reps (e.g. 4x8-10)',`${e.sets}x${e.reps}`);const m=n?.match(/^(\d+)\s*[x×]\s*(.+)$/);if(m)ed(d.id,x=>{const t=x.exercises[i];t.sets=+m[1];t.reps=m[2]})}}>{e.sets}x</button>
<button className="p-2 text-white/50" onClick={()=>ed(d.id,x=>{x.exercises.splice(i+1,0,{...e,id:uid()})})}><Copy size={15}/></button>
<button className="p-2 text-white/50" onClick={()=>ed(d.id,x=>{x.exercises.splice(i,1)})}><X size={16}/></button></div>)}
<div className="flex gap-2 pt-1"><button className="btn sec flex-1 !h-10 text-sm" onClick={()=>{const n=prompt('Exercise name');if(!n)return;const m=prompt('Muscle group (Chest, Back, Shoulders, Biceps, Triceps, Legs, Abs, or custom)','Chest')||'Other'
ed(d.id,x=>{x.exercises.push({id:uid(),name:n.trim(),muscle:m,sets:3,reps:'8-12'})})}}><Plus size={16}/>Exercise</button>
<button className="btn sec !h-10 !px-3 text-sm" onClick={()=>{const n=prompt('Day name',d.name);if(n)ed(d.id,x=>{x.name=n});const w=prompt('Weekday number (0=Sun … 6=Sat)',String(d.weekday));if(w!==null&&+w>=0&&+w<=6)ed(d.id,x=>{x.weekday=+w})}}>Edit</button>
<button className="btn sec !h-10 !px-3" onClick={()=>{if(confirm(`Delete ${d.name}?`))update(s=>{s.split=s.split.filter(y=>y.id!==d.id)})}}><Trash2 size={16}/></button></div></div>)}
<button className="btn sec w-full" onClick={()=>{const n=prompt('Day name');if(!n)return;const w=+(prompt('Weekday number (0=Sun … 6=Sat)','1')||1);update(s=>{s.split.push({id:uid(),name:n,weekday:w>=0&&w<=6?w:1,exercises:[]})})}}><Plus size={18}/>Add workout day</button></div>}

function Progress(){
const {history,prefs,active}=useStore();const u=prefs.unit
const names=[...new Set(history.flatMap(s=>s.exercises.filter(e=>doneSets(e).length).map(e=>e.name)))]
const [sel,setSel]=useState('');const cur=names.includes(sel)?sel:names[0]
if(!history.length)return <div className="space-y-4"><h1 className="text-3xl font-extrabold">Progress</h1><Empty t="No data yet. Complete a workout to see volume, progression and records."/></div>
const wk=new Date(weekKey(iso())+'T00:00:00')
const weeks=Array.from({length:8},(_,i)=>{const d=new Date(wk);d.setDate(d.getDate()-7*(7-i));const k=iso(d)
const ss=history.filter(s=>weekKey(s.date)===k);return {w:k.slice(5),workouts:ss.length,volume:Math.round(disp(ss.reduce((a,s)=>a+vol(s),0),u))}})
const pts=[...history].reverse().flatMap(s=>{const e=s.exercises.find(x=>x.name===cur);const ds=e?doneSets(e):[];return ds.length?[{d:s.date.slice(5),top:Math.max(...ds.map(x=>disp(x.w,u))),reps:Math.max(...ds.map(x=>x.r))}]:[]})
const prs=names.map(n=>{let w=0,e=0;history.forEach(s=>s.exercises.filter(x=>x.name===n).forEach(x=>doneSets(x).forEach(t=>{w=Math.max(w,t.w);e=Math.max(e,e1rm(t.w,t.r))})));return{n,w:disp(w,u),e:Math.round(disp(e,u)*10)/10}})
const mg:Record<string,number>={};history.forEach(s=>new Set(s.exercises.filter(e=>doneSets(e).length).map(e=>e.muscle)).forEach(m=>{mg[m]=(mg[m]||0)+1}))
const ax={stroke:'#666',fontSize:11,tickLine:false,axisLine:false} as const
return <div className="space-y-4"><h1 className="text-3xl font-extrabold">Progress</h1>
<div className="card"><b>Weekly volume ({u})</b><div className="h-44 mt-3"><ResponsiveContainer><BarChart data={weeks}><XAxis dataKey="w" {...ax}/><YAxis width={40} {...ax}/><Tooltip contentStyle={{background:'#161616',border:'1px solid #2a2a2a',borderRadius:12}}/><Bar dataKey="volume" fill="#b6ff3b" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></div>
<div className="card"><b>Workouts per week</b><div className="h-32 mt-3"><ResponsiveContainer><BarChart data={weeks}><XAxis dataKey="w" {...ax}/><YAxis width={24} allowDecimals={false} {...ax}/><Bar dataKey="workouts" fill="#b6ff3b" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></div>
<div className="card space-y-3"><b>Exercise history</b>
{names.length>0&&<select className="inp" value={cur} onChange={e=>setSel(e.target.value)}>{names.map(n=><option key={n}>{n}</option>)}</select>}
{pts.length<2?<div className="text-sm text-white/50">Log this exercise in at least two workouts to see a trend.</div>:
<div className="h-44"><ResponsiveContainer><LineChart data={pts}><CartesianGrid stroke="#222" vertical={false}/><XAxis dataKey="d" {...ax}/><YAxis width={40} domain={['auto','auto']} {...ax}/><Tooltip contentStyle={{background:'#161616',border:'1px solid #2a2a2a',borderRadius:12}}/><Line dataKey="top" name={`Top weight (${u})`} stroke="#b6ff3b" strokeWidth={2} dot/><Line dataKey="reps" name="Best reps" stroke="#888" strokeWidth={2} dot/></LineChart></ResponsiveContainer></div>}</div>
<div className="card"><b>Personal records</b>{prs.map(p=><div key={p.n} className="flex justify-between text-sm border-t border-line mt-2 pt-2"><span>{p.n}</span><span className="text-white/60">{p.w} {u} · e1RM {p.e}</span></div>)}</div>
<div className="card"><b>Muscle group frequency</b>{Object.entries(mg).sort((a,b)=>b[1]-a[1]).map(([m,c])=><div key={m} className="flex justify-between text-sm mt-2"><span>{m}</span><span className="text-white/60">{c} workouts</span></div>)}</div></div>}

function HistoryPage({onOpenPast}:{onOpenPast:()=>void}){
const {history,prefs,active}=useStore();const u=prefs.unit
const [q,setQ]=useState(''),[open,setOpen]=useState('')
const list=history.filter(s=>(s.name+s.date+s.exercises.map(e=>e.muscle).join(' ')).toLowerCase().includes(q.toLowerCase()))
return <div className="space-y-3"><h1 className="text-3xl font-extrabold">History</h1>
<button className="btn sec w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100" disabled={active!==null} onClick={()=>{if(!active)onOpenPast()}}><Plus size={16}/>Add past workout</button>
{active!==null&&<div className="text-xs text-white/50 text-center">Finish or discard your current workout first</div>}
<input className="inp" placeholder="Search name, date (2026-10) or muscle" value={q} onChange={e=>setQ(e.target.value)}/>
{!history.length&&<Empty t="Completed workouts appear here."/>}
{list.map(s=><div key={s.id} className="card"><button className="w-full text-left" onClick={()=>setOpen(open===s.id?'':s.id)}>
<div className="flex justify-between"><b className="text-lg">{s.name}</b><span className="text-sm text-white/50">{s.date}</span></div>
<div className="text-xs text-white/50 mt-1">{s.end?Math.round((s.end-s.start)/60000)+' min · ':''}{s.exercises.filter(e=>doneSets(e).length).length} exercises · {nDone(s)} sets · {fmt(disp(vol(s),u))} {u}</div>
<div className="text-xs text-white/40">{[...new Set(s.exercises.filter(e=>doneSets(e).length).map(e=>e.muscle))].join(', ')}</div></button>
{open===s.id&&<div className="mt-3 space-y-2">{s.exercises.filter(e=>doneSets(e).length).map(e=><div key={e.id} className="text-sm"><div className="font-semibold">{e.name}</div><div className="text-white/60">{doneSets(e).map(x=>`${disp(x.w,u)}×${x.r}${x.rpe?` @${x.rpe}`:''}`).join(' · ')}</div></div>)}
<button className="btn sec !h-10 w-full text-red-400" onClick={()=>{if(confirm('Delete this workout permanently?'))update(d=>{d.history=d.history.filter(x=>x.id!==s.id)})}}><Trash2 size={16}/>Delete workout</button></div>}</div>)}</div>}

function Profile(){
const {prefs,history}=useStore()
const set=(fn:(p:State['prefs'])=>void)=>update(d=>fn(d.prefs))
const [restInput,setRestInput]=useState(()=>String(prefs.rest))
const [goalInput,setGoalInput]=useState(()=>String(prefs.goal))
useEffect(()=>{setRestInput(String(prefs.rest))},[prefs.rest])
useEffect(()=>{setGoalInput(String(prefs.goal))},[prefs.goal])
const save=(name:string,type:string,body:string)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type}));a.download=name;a.click()}
const csv=()=>{const r=['date,workout,exercise,set,weight_kg,reps,rpe'];history.forEach(s=>s.exercises.forEach(e=>doneSets(e).forEach((x,i)=>r.push([s.date,s.name,e.name,i+1,x.w,x.r,x.rpe||''].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')))));save('lift.csv','text/csv',r.join('\n'))}
const imp=async(f?:File)=>{if(!f)return;try{const j=parseBackup(await f.text());if(confirm(`Replace ALL current data with this backup (${j.history.length} workouts, ${j.split.length} days)? Export current data first if unsure.`))importState(j)}catch(e){alert(e instanceof Error?e.message:'Could not read this file.')}}

return <div className="space-y-4"><h1 className="text-3xl font-extrabold">Profile</h1>
<div className="card space-y-3"><Field l="Name"><input className="inp" value={prefs.name} onChange={e=>set(p=>{p.name=e.target.value})}/></Field>
<Field l="Weight unit"><div className="flex gap-2">{(['kg','lb'] as const).map(x=><button key={x} type="button" className={`btn flex-1 ${prefs.unit===x?'pri':'sec'}`} onClick={()=>set(p=>{p.unit=x})}>{x}</button>)}</div></Field>
<Field l="Default rest (seconds)"><input className="inp" inputMode="numeric" value={restInput} onChange={e=>setRestInput(e.target.value.replace(/\D/g,''))} onBlur={()=>{let val=parseInt(restInput,10);if(isNaN(val)||val<=0){val=90}else if(val>600){val=600};setRestInput(String(val));set(p=>{p.rest=val})}}/></Field>
<Field l="Weekly workout goal"><input className="inp" inputMode="numeric" value={goalInput} onChange={e=>setGoalInput(e.target.value.replace(/\D/g,''))} onBlur={()=>{let val=parseInt(goalInput,10);if(isNaN(val)||val<0){val=4}else if(val>14){val=14};setGoalInput(String(val));set(p=>{p.goal=val})}}/></Field></div>
<div className="card space-y-2"><b>Backup</b><p className="text-xs text-white/50">Your data lives only in this browser on this phone. It is not synced anywhere. Deleting the app or clearing Safari data erases it, so export a backup regularly.</p>
<button className="btn sec w-full" onClick={()=>save('lift-backup.json','application/json',exportJSON())}>Export JSON backup</button>
<button className="btn sec w-full" onClick={csv}>Export CSV</button>
<label className="btn sec w-full">Import JSON backup<input type="file" accept="application/json,.json" className="hidden" onChange={e=>imp(e.target.files?.[0])}/></label>
<button className="btn w-full text-red-400" onClick={()=>{if(confirm('Erase ALL data? This cannot be undone.'))resetAll()}}>Reset app data</button></div></div>}

function PastWorkoutModal({onClose,go}:{onClose:()=>void;go:(n:number)=>void}){
const {split,history}=useStore()
const yesterday=new Date()
yesterday.setDate(yesterday.getDate()-1)
const defaultDate=iso(yesterday)
const todayStr=iso(new Date())

const [date,setDate]=useState(defaultDate)
const [selectedDayId,setSelectedDayId]=useState('')
const [selectedMuscles,setSelectedMuscles]=useState<string[]>([])

const allMuscles=['Chest','Back','Legs','Shoulders','Biceps','Triceps','Abs']
for(const day of split){
for(const ex of day.exercises){
if(ex.muscle&&!allMuscles.includes(ex.muscle)){allMuscles.push(ex.muscle)}
}}

const emptyMuscles:string[]=[]
for(const m of selectedMuscles){
let found=false
for(const day of split){
for(const ex of day.exercises){
if(ex.muscle===m){found=true;break}
}
if(found)break
}
if(!found){emptyMuscles.push(m)}
}

const isFuture=date>todayStr
const isInvalid=!date||isFuture
const hasExisting=history.some(s=>s.date===date)

function handleStart(){
if(isInvalid)return
startPastSession(date,selectedDayId?selectedDayId:undefined,selectedMuscles.length>0?selectedMuscles:undefined)
onClose()
go(1)
}

return <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
<div className="card w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4 bg-bg border border-line">
<div className="flex justify-between items-center">
<h2 className="text-xl font-bold">Log a past workout</h2>
<button className="p-2 text-white/50 hover:text-white" onClick={onClose}><X size={20}/></button></div>

<div>
<div className="text-xs text-white/50 mb-1">Date</div>
<input type="date" className="inp" max={todayStr} value={date} onChange={e=>setDate(e.target.value)}/>
{isFuture&&<div className="text-xs text-red-400 mt-1">Future dates are not allowed.</div>}</div>

{hasExisting&&<div className="text-xs text-amber-400 bg-amber-400/10 p-2.5 rounded-xl">You already have a workout on this date. Add another?</div>}

<div>
<div className="text-xs text-white/50 mb-1">Use a template day</div>
<select className="inp" value={selectedDayId} onChange={e=>{setSelectedDayId(e.target.value);if(e.target.value)setSelectedMuscles([])}}>
<option value="">None (choose muscles below)</option>
{split.map(d=><option key={d.id} value={d.id}>{d.name} ({d.exercises.length} exercises)</option>)}
</select></div>

<div className="space-y-2">
<div className="text-xs text-white/50">Or choose muscles</div>
<div className="flex flex-wrap gap-2">
{allMuscles.map(m=>{const on=selectedMuscles.includes(m)
return <button key={m} type="button" onClick={()=>{setSelectedDayId('');setSelectedMuscles(prev=>{if(prev.includes(m)){return prev.filter(x=>x!==m)}else{return [...prev,m]}})}} className={`h-10 px-3.5 rounded-xl text-sm font-semibold transition-all ${on?'bg-accent text-black':'bg-white/10 text-white hover:bg-white/15'}`}>{m}</button>})}
</div>
{emptyMuscles.length>0&&<div className="text-xs text-amber-400">No exercises saved for {emptyMuscles.join(', ')}. Add some in Workout &gt; Add exercise.</div>}</div>

<button className="btn pri w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100" disabled={isInvalid} onClick={handleStart}><Play size={18}/>Start logging</button>
</div></div>}

export default function App(){
const [tab,setTab]=useState(0),h=useHealth(),[pastModal,setPastModal]=useState(false)
const tabs=[[HomeIcon,'Home'],[Dumbbell,'Workout'],[BarChart3,'Progress'],[HistoryIcon,'History'],[User,'Profile']] as const
return <div className="min-h-screen" style={{paddingTop:'env(safe-area-inset-top)',paddingBottom:'calc(env(safe-area-inset-bottom) + 88px)'}}>
{!h.ok&&<div className="sticky top-0 z-50 bg-red-600 text-white text-sm p-3">Changes are not being saved: {h.msg} <button className="underline font-semibold" onClick={()=>setTab(4)}>Export a backup</button></div>}
<main className="px-4 pt-4 max-w-md mx-auto">{[<Home go={setTab}/>,<Workout onOpenPast={()=>setPastModal(true)}/>,<Progress/>,<HistoryPage onOpenPast={()=>setPastModal(true)}/>,<Profile/>][tab]}</main>
{pastModal&&<PastWorkoutModal onClose={()=>setPastModal(false)} go={setTab}/>}
<nav className="fixed bottom-0 inset-x-0 bg-bg/95 backdrop-blur border-t border-line flex justify-around pt-2" style={{paddingBottom:'calc(env(safe-area-inset-bottom) + 6px)'}}>
{tabs.map(([I,l],i)=><button key={l} onClick={()=>setTab(i)} className={`flex flex-col items-center gap-0.5 w-16 h-12 text-[11px] ${tab===i?'text-accent':'text-white/50'}`}><I size={22}/>{l}</button>)}</nav></div>}
