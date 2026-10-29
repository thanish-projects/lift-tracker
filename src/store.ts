import {useSyncExternalStore} from 'react'
import type {State,Ex,Session,Unit,ExLog} from './types'
import Dexie,{type Table} from 'dexie'
const LEGACY='lift.v1'
export const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36)
const ex=(name:string,muscle:string):Ex=>({id:uid(),name,muscle,sets:3,reps:'8-12'})
const day=(name:string,weekday:number,e:Ex[])=>({id:uid(),name,weekday,exercises:e})
const seed=():State=>({v:1,prefs:{name:'',unit:'kg',rest:90,goal:4},active:null,history:[],split:[
day('Chest & Triceps',1,[ex('Barbell Bench Press','Chest'),ex('Incline Dumbbell Press','Chest'),ex('Cable Fly','Chest'),ex('Rope Pushdown','Triceps'),ex('Overhead Extension','Triceps'),ex('Dips','Triceps')]),
day('Back & Biceps',2,[ex('Lat Pulldown','Back'),ex('Seated Row','Back'),ex('One-Arm Dumbbell Row','Back'),ex('Barbell Curl','Biceps'),ex('Incline Curl','Biceps'),ex('Hammer Curl','Biceps')]),
day('Legs',4,[ex('Squat','Legs'),ex('Romanian Deadlift','Legs'),ex('Leg Press','Legs')]),
day('Shoulders & Abs',5,[ex('Overhead Press','Shoulders'),ex('Lateral Raise','Shoulders'),ex('Rear Delt Fly','Shoulders'),ex('Cable Crunch','Abs'),ex('Hanging Leg Raise','Abs'),ex('Plank','Abs')])]})
class DB extends Dexie{
days!:Table<any,string>;sessions!:Table<any,string>;records!:Table<any,string>;meta!:Table<any,string>
constructor(){super('lift');
this.version(1).stores({days:'id,weekday',sessions:'id,date,status',records:'name',meta:'key'});
this.version(2).stores({days:'id,weekday,order'});
}}
// Schema changes: add this.version(2).stores({...}).upgrade(tx=>...) above. Never edit version(1).
const db=new DB()
const PK:Record<string,string>={days:'id',sessions:'id',records:'name',meta:'key'}
const TABLES=['days','sessions','records','meta']
type Item={id:string;j:string;r:any}
const it=(t:string,r:any):Item=>({id:r[PK[t]],j:JSON.stringify(r),r})
const cache:Record<string,Map<string,string>>={days:new Map(),sessions:new Map(),records:new Map(),meta:new Map()}
let hRef:Session[]|null=null,hItems:Item[]=[],rItems:Item[]=[]
const records=(h:Session[])=>{const m=new Map<string,{name:string;maxWeight:number;e1rm:number}>()
h.forEach(s=>s.exercises.forEach(e=>doneSets(e).forEach(x=>{const r=m.get(e.name)||{name:e.name,maxWeight:0,e1rm:0};r.maxWeight=Math.max(r.maxWeight,x.w);r.e1rm=Math.max(r.e1rm,e1rm(x.w,x.r));m.set(e.name,r)})));return [...m.values()]}
function build(s:State):Record<string,Item[]>{
if(s.history!==hRef){hRef=s.history;hItems=s.history.map(h=>it('sessions',{...h,status:'done'}));rItems=records(s.history).map(r=>it('records',r))}
return {days:s.split.map((d,i)=>it('days',{...d,order:i})),sessions:s.active?[...hItems,it('sessions',{...s.active,status:'active'})]:hItems,records:rItems,meta:[it('meta',{key:'prefs',value:s.prefs}),it('meta',{key:'init',value:true})]}}
async function write(s:State){
const b=build(s);const plan:[string,any[],string[],Map<string,string>][]=[]
for(const t of TABLES){const seen=new Map<string,string>();const puts:any[]=[]
for(const x of b[t]){seen.set(x.id,x.j);if(cache[t].get(x.id)!==x.j)puts.push(x.r)}
plan.push([t,puts,[...cache[t].keys()].filter(k=>!seen.has(k)),seen])}
await db.transaction('rw',db.days,db.sessions,db.records,db.meta,async()=>{for(const [t,p,d] of plan){const tb=db.table(t);if(d.length)await tb.bulkDelete(d);if(p.length)await tb.bulkPut(p)}})
for(const [t,,,n] of plan)cache[t]=n}
let health={ok:true,msg:''};const hs=new Set<()=>void>()
const setHealth=(ok:boolean,msg='')=>{if(health.ok===ok&&health.msg===msg)return;health={ok,msg};hs.forEach(f=>f())}
export const useHealth=()=>useSyncExternalStore(f=>{hs.add(f);return()=>{hs.delete(f)}},()=>health)
let q:Promise<void>=Promise.resolve(),dbOk=true
const save=()=>{if(!dbOk)return;q=q.then(()=>write(state)).then(()=>setHealth(true),(e:any)=>setHealth(false,e?.name==='QuotaExceededError'?'storage is full.':'the database rejected the write.'))}
let state:State=seed()
const subs=new Set<()=>void>()
export function update(fn:(d:State)=>void){
const d:State={...state,prefs:structuredClone(state.prefs),split:structuredClone(state.split),active:state.active?structuredClone(state.active):null}
fn(d);state=d;subs.forEach(f=>f());save()}
export const useStore=()=>useSyncExternalStore(f=>{subs.add(f);return()=>{subs.delete(f)}},()=>state)
export const resetAll=()=>update(d=>{Object.assign(d,seed())})
export const importState=(s:State)=>update(d=>{Object.assign(d,s)})
export const exportJSON=()=>JSON.stringify({app:'lift',exportedAt:new Date().toISOString(),...state},null,1)
export function parseBackup(text:string):State{
const j=JSON.parse(text)
if(!j||j.v!==1||!Array.isArray(j.split)||!Array.isArray(j.history)||typeof j.prefs!=='object'||!j.prefs)throw new Error('This is not a Lift backup file.')
const ok=(s:any)=>s&&typeof s.id==='string'&&typeof s.date==='string'&&typeof s.start==='number'&&Array.isArray(s.exercises)&&s.exercises.every((e:any)=>e&&typeof e.name==='string'&&Array.isArray(e.sets)&&e.sets.every((x:any)=>typeof x.w==='number'&&typeof x.r==='number'&&typeof x.done==='boolean'))
if(!j.split.every((d:any)=>d&&typeof d.id==='string'&&Array.isArray(d.exercises))||!j.history.every(ok)||(j.active&&!ok(j.active)))throw new Error('The backup contains malformed data. Nothing was changed.')
const seen=new Set<string>()
const history=j.history.filter((s:Session)=>!seen.has(s.id)&&seen.add(s.id)).sort((a:Session,b:Session)=>b.start-a.start)
return {v:1,prefs:{...seed().prefs,...j.prefs},split:j.split,active:j.active&&!seen.has(j.active.id)?j.active:null,history}}
export async function init(){
try{navigator.storage?.persist?.()}catch{}
let legacy:State|null=null
try{const t=localStorage.getItem(LEGACY);if(t)legacy=parseBackup(t)}catch{}
try{await db.open()
const [days,sess,meta]=await Promise.all([db.days.orderBy('order').toArray(),db.sessions.toArray(),db.meta.toArray()])
if(meta.some(m=>m.key==='init')){
const strip=({status,...r}:any)=>r
const act=sess.filter(s=>s.status==='active').sort((a,b)=>b.start-a.start)[0]
state={v:1,prefs:{...seed().prefs,...meta.find(m=>m.key==='prefs')?.value},split:days.map(({order,...d})=>d),active:act?strip(act):null,history:sess.filter(s=>s.status==='done').map(strip).sort((a,b)=>b.start-a.start)}
const b=build(state);TABLES.forEach(t=>{cache[t]=new Map(b[t].map(i=>[i.id,i.j]))})
}else{state=legacy||seed();await write(state)}
}catch{dbOk=false;state=legacy||seed();setHealth(false,'this browser blocked the local database (private mode?).')}}
export const disp=(kg:number,u:Unit)=>u==='kg'?kg:Math.round(kg*22.0462)/10
export const toKg=(v:number,u:Unit)=>u==='kg'?v:v/2.20462
export const vol=(s:Session)=>s.exercises.reduce((a,e)=>a+(e.skipped?0:e.sets.reduce((b,x)=>b+(x.done?x.w*x.r:0),0)),0)
export const e1rm=(w:number,r:number)=>r<=1?w:w*(1+r/30)
export const iso=(d=new Date())=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)
export const weekKey=(date:string)=>{const d=new Date(date+'T00:00:00');d.setDate(d.getDate()-(d.getDay()+6)%7);return iso(d)}
export const doneSets=(e:ExLog)=>e.skipped?[]:e.sets.filter(s=>s.done)
export const lastSets=(h:Session[],name:string)=>{for(const s of h){const e=s.exercises.find(x=>x.name===name&&doneSets(x).length);if(e)return doneSets(e)}return []}
export const nDone=(s:Session)=>s.exercises.reduce((a,e)=>a+doneSets(e).length,0)
export function startSession(dayId?:string){update(d=>{const t=d.split.find(x=>x.id===dayId)
d.active={id:uid(),name:t?.name||'Workout',date:iso(),start:Date.now(),exercises:(t?.exercises||[]).map(e=>({id:uid(),name:e.name,muscle:e.muscle,sets:Array.from({length:e.sets},()=>({id:uid(),w:0,r:0,done:false}))}))}})}
