import {emptyState,validateSession,validSettings,type State} from './domain.ts';
import {defaultPlan,defaultCatalog,validateCatalog,validatePlan} from './training-plan.ts';
import {validJournal,validDate} from './journal.ts';
export type Profile={displayName:string;heightCm:number|null;birthDate:string;goal:string;stepGoal:number|null;startingWeightKg:number|null;unit:'kg'|'lb'};
export const emptyProfile:Profile={displayName:'',heightCm:null,birthDate:'',goal:'',stepGoal:null,startingWeightKg:null,unit:'kg'};
export function validProfile(p:any):p is Profile{return !!p&&typeof p.displayName==='string'&&p.displayName.length<=100&&typeof p.goal==='string'&&p.goal.length<=1000&&typeof p.birthDate==='string'&&(p.birthDate===''||validDate(p.birthDate))&&[p.heightCm,p.stepGoal,p.startingWeightKg].every(n=>n===null||typeof n==='number'&&Number.isFinite(n)&&n>=0)&& (p.heightCm===null||p.heightCm<=300)&&(p.stepGoal===null||Number.isInteger(p.stepGoal)&&p.stepGoal<=1000000)&&(p.startingWeightKg===null||p.startingWeightKg<=1000)&&['kg','lb'].includes(p.unit)}
export const groups=['sessions','journal','plans','exercises','drafts','settings'] as const;
export type Group=typeof groups[number];
export type CloudRecord={revision:number;payload:string};
export type Records=Record<string,CloudRecord>;
export type SyncMeta={base:Records;conflicts:Record<string,{local:string;remote:CloudRecord}>;approved:boolean;lastSuccess:string|null;cursors:Record<string,{seconds:number;nanoseconds:number}>;archives?:{path:string;local:string;remote:CloudRecord;chosen:'local'|'remote';at:string}[]};
export const emptyMeta=():SyncMeta=>({base:{},conflicts:{},approved:false,lastSuccess:null,cursors:{}});
export function canonical(value:any):string{if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).filter(k=>value[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';return JSON.stringify(value)}
const safeId=(id:string)=>encodeURIComponent(id).replaceAll('.','%2E');
export const key=(group:Group,id:string)=>group+'/'+safeId(id);
export function recordsFromState(state:State):Record<string,string>{
 const out:Record<string,string>={};for(const s of state.sessions)out[key('sessions',s.id)]=canonical(s);
 for(const d of Object.values(state.journal??{}))out[key('journal',d.date)]=canonical(d);
 out['plans/current']=canonical(state.plan??defaultPlan());
 for(const e of state.catalog??defaultCatalog)out[key('exercises',e.id)]=canonical(e);
 out['drafts/active']=canonical(state.draft);
 const {photos,...settings}=state.settings;out['settings/personal']=canonical(settings);
 out['settings/profile']=canonical(state.profile??emptyProfile);return out
}
export function stateFromRecords(records:Record<string,string>,photos:Record<string,string>):State{
 const state:State={...structuredClone(emptyState),journal:{},catalog:[],settings:{photos},profile:structuredClone(emptyProfile)};
 const parsed=Object.entries(records).map(([k,p])=>[k,JSON.parse(p)] as const);
 // Validate the complete candidate before accepting anything into IndexedDB.
 for(const [k,v] of parsed)if(k.startsWith('exercises/')&&v!==null){if(!validateCatalog([v])||key('exercises',v.id)!==k)throw Error('Ungültige Cloud-Übung. Lokale Daten erhalten.');state.catalog!.push(v)}
 if(!state.catalog!.length)state.catalog=structuredClone(defaultCatalog);
 const ids=state.catalog!.map(e=>e.id);
 for(const [k,v] of parsed){
  if(v===null)continue;
  if(k.startsWith('sessions/')){if(!validateSession(v,ids)||key('sessions',v.id)!==k)throw Error('Ungültiges Cloud-Training.');state.sessions.push(v)}
  else if(k.startsWith('journal/')){if(!validJournal({[v.date]:v})||key('journal',v.date)!==k)throw Error('Ungültiger Cloud-Journaltag.');state.journal![v.date]=v}
  else if(k==='plans/current'){if(!validatePlan(v,ids))throw Error('Ungültiger Cloud-Plan.');state.plan=v}
  else if(k==='drafts/active'){if(!validateSession(v,ids,false))throw Error('Ungültiger Cloud-Entwurf.');state.draft=v}
  else if(k==='settings/personal'){if(!v||typeof v!=='object'||Array.isArray(v)||'photos'in v||!validSettings(v))throw Error('Ungültige Cloud-Einstellungen.');state.settings={...v,photos}}
  else if(k==='settings/profile'){if(!validProfile(v))throw Error('Ungültiges Cloud-Profil.');state.profile=v}
 }
 state.plan??=defaultPlan();return state
}
export function diffRecords(local:Record<string,string>,base:Records,remote:Records){
 const pull:Records={},push:Record<string,string>={},conflicts:SyncMeta['conflicts']={};
 for(const k of new Set([...Object.keys(local),...Object.keys(base),...Object.keys(remote)])){
  const l=local[k]??'null',b=base[k]?.payload??'null',r=remote[k];
  // Missing remote documents are not deletion instructions. Deletions are versioned tombstones.
  if(!r){if(l!=='null')push[k]=l;continue}
  if(l===r.payload){pull[k]=r;continue}
  if(l===b){pull[k]=r;continue}
  if(r.payload===b){push[k]=l;continue}
  conflicts[k]={local:l,remote:r};
 }
 return {pull,push,conflicts}
}

/** Import fills unknown optional profile fields; explicit existing values always win. */
export function mergeProfile(existing:Profile|undefined,incoming:Profile|undefined):Profile|undefined{
 if(!existing)return incoming;
 if(!incoming)return existing;
 return Object.fromEntries(Object.entries(existing).map(([key,value])=>[key,value===null||value===''?incoming[key as keyof Profile]:value])) as Profile;
}
