import{newSession,type Session,type SetEntry}from'./domain.ts';
import{setKey,type Day,type Exercise}from'./training-plan.ts';
export type PreviousValue={weightKg:number;reps:number;sessionId:string;date:string};
function valid(s:SetEntry){return s.status==='done'&&typeof s.weightKg==='number'&&Number.isFinite(s.weightKg)&&s.weightKg>=0&&s.weightKg<=2000&&typeof s.reps==='number'&&Number.isInteger(s.reps)&&s.reps>=0&&s.reps<=1000}
/** Match ordinal positions within each exercise and set type, never across exercises. */
export function previousValues(session:Session,history:Session[]):Record<string,PreviousValue>{
 const ordered=history.filter(s=>s.finishedAt&&s.id!==session.id&&(s.date<session.date||s.date===session.date&&s.startTime<=session.startTime)).slice().sort((a,b)=>(b.date+'T'+b.startTime).localeCompare(a.date+'T'+a.startTime)||b.id.localeCompare(a.id));
 const sources=new Map<string,Session|undefined>();const positions=new Map<string,number>();const result:Record<string,PreviousValue>={};
 for(const set of session.sets){const kind=set.kind??'work';const group=JSON.stringify([set.exerciseId,kind]);const ordinal=positions.get(group)??0;positions.set(group,ordinal+1);if(!sources.has(group))sources.set(group,ordered.find(s=>s.sets.some(x=>x.exerciseId===set.exerciseId&&(x.kind??'work')===kind&&valid(x))));const source=sources.get(group);const previous=source?.sets.filter(x=>x.exerciseId===set.exerciseId&&(x.kind??'work')===kind)[ordinal];if(previous&&valid(previous))result[setKey(set)]={weightKg:previous.weightKg!,reps:previous.reps!,sessionId:source!.id,date:source!.date};}
 return result;
}
export function prefillNewSets(session:Session,history:Session[],existing:SetEntry[]=[]){const old=new Set(existing.map(setKey));const refs=previousValues(session,history);const sources:Record<string,PreviousValue>={};const sets=session.sets.map(s=>{const key=setKey(s),p=refs[key];if(old.has(key)||s.status!=='unknown'||s.weightKg!==null||s.reps!==null||!p)return s;sources[key]=p;return{...s,weightKg:p.weightKg,reps:p.reps}});return{session:{...session,sets},sources}}
export function newSuggestedSession(day:Day,catalog:Exercise[],history:Session[]){return prefillNewSets(newSession(day,catalog),history)}
export function adjustValue(value:number|null,delta:number,max:number){return Math.max(0,Math.min(max,Math.round(((value??0)+delta)*100)/100))}
/** undefined = unfinished/invalid editing text, null = intentionally empty. */
export function parseEntry(text:string,max:number,integer=false):number|null|undefined{const s=text.trim();if(s==='')return null;if(!(integer?/^\d+$/:/^\d+(?:[.,]\d+)?$/).test(s))return undefined;const n=Number(s.replace(',','.'));return Number.isFinite(n)&&n>=0&&n<=max&&(!integer||Number.isInteger(n))?n:undefined}

export function shouldStartRest(set:SetEntry,wasDone:boolean,enabled:boolean,seconds:number){return enabled&&!wasDone&&set.status==='done'&&set.kind!=='warmup'&&Number.isFinite(seconds)&&seconds>0}
