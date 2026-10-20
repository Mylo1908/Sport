import {validJournal,type Journal} from './journal.ts';
import {targets,validateCatalog,validatePlan,type Exercise,type UserPlan,type Day,type RestTimer} from './training-plan.ts';
export type Status='unknown'|'done'|'skipped'|'not-done';
export type SetEntry={exerciseId:string;number:number;weightKg:number|null;reps:number|null;status:Status;id?:string;kind?:'work'|'warmup';repMin?:number|null;repMax?:number|null;rir?:number|null};
export type Session={id:string;date:string;type:string;startTime:string;endTime:string|null;startedAt:string;finishedAt:string|null;sets:SetEntry[];warmup:string[];steps:number|null;runningKm:number|null;basketballMinutes:number|null;sleepHours:number|null;notes:string;planWeekday?:number;exerciseSnapshots?:Record<string,Exercise>;timer?:RestTimer|null};
export type Settings={photos:Record<string,string>;autoRest?:boolean;restSeconds?:number};
export type State={sessions:Session[];draft:Session|null;settings:Settings;plan?:UserPlan;catalog?:Exercise[];journal?:Journal};
export const emptyState:State={sessions:[],draft:null,settings:{photos:{}}};
export function localDate(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function newSession(day:Day,catalog:Exercise[]=[]):Session{return {id:crypto.randomUUID(),date:localDate(),type:day.type,planWeekday:day.weekday,startTime:new Date().toTimeString().slice(0,5),endTime:null,startedAt:new Date().toISOString(),finishedAt:null,sets:day.exerciseIds.flatMap(exerciseId=>targets(day,exerciseId).map((t,i)=>({id:crypto.randomUUID(),exerciseId,number:i+1,weightKg:null,reps:null,status:'unknown' as Status,kind:t.kind??'work',repMin:t.repMin??null,repMax:t.repMax??null}))),exerciseSnapshots:Object.fromEntries(catalog.filter(e=>day.exerciseIds.includes(e.id)).map(e=>[e.id,structuredClone(e)])),warmup:[],steps:null,runningKm:null,basketballMinutes:null,sleepHours:null,notes:''}}
export const doneSets=(s:Session)=>s.sets.filter(x=>x.status==='done'&&x.weightKg!==null&&x.reps!==null);

export const completed=(s:Session)=>doneSets(s).filter(x=>x.kind!=='warmup');
export const incomplete=(s:Session)=>s.sets.filter(x=>x.status==='unknown'||(x.status==='done'&&(x.weightKg===null||x.reps===null)));
export function weekStart(date:string){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-(d.getDay()+6)%7);return localDate(d)}
export function lastResult(sessions:Session[],id:string,before:string){return sessions.filter(s=>s.date<=before&&s.sets.some(x=>x.exerciseId===id&&x.kind!=='warmup'&&x.status==='done'&&x.weightKg!==null&&x.reps!==null)).sort((a,b)=>(b.date+b.startTime).localeCompare(a.date+a.startTime))[0]?.sets.filter(x=>x.exerciseId===id)}
const number=(x:unknown,max=10000000)=>x===null||(typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=max);
const date=(x:unknown):x is string=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!isNaN(Date.parse(x+'T12:00:00'))&&localDate(new Date(x+'T12:00:00'))===x;
const time=(x:unknown)=>typeof x==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(x);
export function validateSession(s:any,ids:string[],finished=true):s is Session{
 return !!s&&typeof s.id==='string'&&s.id.length>0&&date(s.date)&&typeof s.type==='string'&&time(s.startTime)&&(s.endTime===null||time(s.endTime))&&typeof s.startedAt==='string'&&!isNaN(Date.parse(s.startedAt))&&(!finished||typeof s.finishedAt==='string'&&!isNaN(Date.parse(s.finishedAt)))&&Array.isArray(s.sets)&&s.sets.length<=10000&&s.sets.every((x:any)=>x&&(x.id===undefined||typeof x.id==='string'&&x.id.length>0&&x.id.length<300)&&ids.includes(x.exerciseId)&&Number.isInteger(x.number)&&x.number>=1&&x.number<=100&&number(x.weightKg,2000)&&number(x.reps,1000)&&(x.reps===null||Number.isInteger(x.reps))&&['unknown','done','skipped','not-done'].includes(x.status)&&(x.kind===undefined||['work','warmup'].includes(x.kind))&&(x.rir===undefined||number(x.rir,10))&&[x.repMin,x.repMax].every(n=>n===undefined||number(n,1000)&&(n===null||Number.isInteger(n)))&&(x.repMin==null||x.repMax==null||x.repMin<=x.repMax)&&(!finished||x.status!=='done'||x.weightKg!==null&&x.reps!==null))&&new Set(s.sets.map((x:any)=>x.exerciseId+':'+x.number)).size===s.sets.length&&Array.isArray(s.warmup)&&s.warmup.every((x:any)=>typeof x==='string')&&number(s.steps)&& (s.steps===null||Number.isInteger(s.steps))&&number(s.runningKm,1000)&&number(s.basketballMinutes,1440)&&number(s.sleepHours,24)&&typeof s.notes==='string'&&(s.planWeekday===undefined||Number.isInteger(s.planWeekday)&&s.planWeekday>=1&&s.planWeekday<=7)&&(s.exerciseSnapshots===undefined||s.exerciseSnapshots&&typeof s.exerciseSnapshots==='object'&&validateCatalog(Object.values(s.exerciseSnapshots))&&Object.entries(s.exerciseSnapshots).every(([id,e]:any)=>id===e.id))&&(s.timer===undefined||s.timer===null||validTimer(s.timer));
}
export function parseImport(raw:unknown,ids:string[]):{sessions:Session[];draft?:Session|null;settings?:Settings;plan?:UserPlan;catalog?:Exercise[];journal?:Journal}{
 const data=raw as any;
 if(!data||![1,2,3].includes(data.schemaVersion))throw Error('Unbekanntes Dateiformat oder Version.');
 let sessions:any[];
 if(data.schemaVersion>=2){if(data.app!=='Sport'||!validateCatalog(data.catalog)||!validatePlan(data.plan,data.catalog.map((e:Exercise)=>e.id)))throw Error('Ungültiger Plan oder Übungskatalog.');ids=[...new Set([...ids,...data.catalog.map((e:Exercise)=>e.id)])]}

 if(data.importType==='historical-training-sessions'){
  if(!Array.isArray(data.entries))throw Error('Einträge fehlen.');
  sessions=data.entries.map((e:any)=>{
   if(!date(e.date)||!time(e.startTime)||!time(e.endTime)||!Array.isArray(e.sets)||typeof e.warmupCompleted!=='boolean')throw Error('Ungültiger historischer Eintrag.');
   return {id:`historical-${e.date}-${e.startTime}-${e.type}`,date:e.date,type:e.type,startTime:e.startTime,endTime:e.endTime,startedAt:`${e.date}T${e.startTime}:00`,finishedAt:`${e.date}T${e.endTime}:00`,sets:e.sets.flatMap((x:any)=>[1,2].map(n=>{const v=x['set'+n];if(!v)throw Error('Satz fehlt.');return {exerciseId:x.exerciseId,number:n,weightKg:v.weightKg,reps:v.reps,status:v.weightKg!==null&&v.reps!==null?'done':'unknown'}})),warmup:e.warmupCompleted?['Import: Warm-up bestätigt']:[],steps:e.steps,runningKm:e.runningKm,basketballMinutes:e.basketballMinutes,sleepHours:e.sleepHours??null,notes:e.dataNote??''};
  });
 }else if(data.app==='Sport'&&Array.isArray(data.sessions)){sessions=data.sessions;}else throw Error('Kein Sport-Backup oder Trainingsimport.');
 if(sessions.length>10000||!sessions.every(s=>validateSession(s,ids)))throw Error('Ungültige Trainingswerte. Import abgebrochen.');
 const result:{sessions:Session[];draft?:Session|null;settings?:Settings;plan?:UserPlan;catalog?:Exercise[];journal?:Journal}={sessions};if(data.schemaVersion>=2){result.plan=data.plan;result.catalog=data.catalog;}
 if(data.app==='Sport'){
  if(data.draft!==null&&!validateSession(data.draft,ids,false))throw Error('Ungültiger Entwurf.');
  result.draft=data.draft;
  const photos=data.settings?.photos;
  if(!photos||typeof photos!=='object'||Array.isArray(photos)||Object.entries(photos).some(([k,v])=>!ids.includes(k)||typeof v!=='string'||!/^data:image\/(png|jpeg|webp);base64,/.test(v)||v.length>4000000))throw Error('Ungültige Fotoeinstellungen.');
  if(!validSettings(data.settings))throw Error('Ungültige Timer-Einstellungen.');result.settings={...data.settings,photos};
 }
 if(data.schemaVersion===3){if(!validJournal(data.journal))throw Error('Ungültiges Tagesjournal. Import abgebrochen.');result.journal=data.journal;}
 return result;
}
export function mergeSessions(existing:Session[],incoming:Session[]){const out=[...existing];let duplicates=0;for(const s of incoming){if(out.some(x=>x.id===s.id||x.date===s.date&&x.startTime===s.startTime&&x.type===s.type)){duplicates++;continue;}out.push(s)}return {sessions:out,duplicates,added:out.length-existing.length}}


export function validTimer(t:any){return !!t&&[t.remainingMs,t.durationMs].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=7200000)&&(t.endsAt===null||typeof t.endsAt==='number'&&Number.isFinite(t.endsAt))&&typeof t.next==='string'}
export function validSettings(s:Settings){return (s.autoRest===undefined||typeof s.autoRest==='boolean')&&(s.restSeconds===undefined||Number.isInteger(s.restSeconds)&&s.restSeconds>=0&&s.restSeconds<=3600)}
