import {defaultPlan,defaultCatalog,validatePlan,validateCatalog} from './training-plan.ts';
import type {SyncMeta} from './cloud-model.ts';
import {emptyState,type State} from './domain.ts';
const stores=['plans','exercises','sessions','drafts','settings'];
const databases=new Map<string,Promise<IDBDatabase>>();
// App state is immutable. Avoid rewriting all finished sessions and photo data on every key.
const savedSnapshots=new WeakMap<IDBDatabase,{state:State;catalog:{id:string}[]}>();
function db(scope?:string){
 const name=scope?'sport-account-v1-'+encodeURIComponent(scope):'sport-local-v1';
 let pending=databases.get(name);
 if(!pending){
  pending=new Promise<IDBDatabase>((resolve,reject)=>{
   if(!globalThis.indexedDB){reject(Error('IndexedDB ist nicht verfügbar.'));return}
   let blocked=false;
   const r=indexedDB.open(name,1);
   r.onupgradeneeded=()=>stores.forEach(s=>{if(!r.result.objectStoreNames.contains(s))r.result.createObjectStore(s)});
   r.onsuccess=()=>{
    if(blocked){r.result.close();return}
    r.result.onversionchange=()=>{r.result.close();databases.delete(name)};
    resolve(r.result);
   };
   r.onerror=()=>reject(r.error);
   r.onblocked=()=>{blocked=true;reject(Error('Datenbank blockiert. Andere Sport-Tabs schließen.'))};
  });
  databases.set(name,pending);
  const opened=pending;
  void pending.catch(()=>{if(databases.get(name)===opened)databases.delete(name)});
 }
 return pending;
}
export async function loadState(scope?:string):Promise<State>{const d=await db(scope);savedSnapshots.delete(d);return new Promise((resolve,reject)=>{const t=d.transaction(stores,'readonly');const s=t.objectStore('sessions').getAll();const draft=t.objectStore('drafts').get('active');const settings=t.objectStore('settings').get('personal');const plan=t.objectStore('plans').get('user-v12');const exercises=t.objectStore('exercises').getAll();const journal=t.objectStore('settings').get('daily-journal-v1');const profile=t.objectStore('settings').get('profile-v1');t.oncomplete=()=>resolve({...(profile.result?{profile:profile.result}:{}),journal:journal.result??{},sessions:s.result,draft:draft.result??null,settings:settings.result??structuredClone(emptyState.settings),plan:plan.result??defaultPlan(),catalog:exercises.result.length?exercises.result:structuredClone(defaultCatalog)});t.onerror=()=>reject(t.error??Error('Lesetransaktion abgebrochen.'));t.onabort=()=>reject(t.error??Error('Laden abgebrochen.'))})}
export async function saveState(state:State,plan:unknown,exercises:{id:string}[],scope?:string,meta?:SyncMeta){
 const d=await db(scope),previous=savedSnapshots.get(d),old=previous?.state,catalog=state.catalog??exercises;
 return new Promise<void>((resolve,reject)=>{
  const t=d.transaction(stores,'readwrite');
  t.oncomplete=()=>{savedSnapshots.set(d,{state,catalog});resolve()};
  t.onerror=()=>reject(t.error??Error('Speichern fehlgeschlagen.'));
  t.onabort=()=>reject(t.error??Error('Speichern abgebrochen.'));
  try{
   if(state.plan&&state.plan!==old?.plan)t.objectStore('plans').put(state.plan,'user-v12');
   if(catalog!==previous?.catalog){
    const prior=new Map(previous?.catalog.map(e=>[e.id,e]));
    catalog.filter(e=>prior.get(e.id)!==e).forEach(e=>t.objectStore('exercises').put(e,e.id));
   }
   if(state.sessions!==old?.sessions){
    const prior=new Map(old?.sessions.map(s=>[s.id,s]));
    state.sessions.filter(s=>prior.get(s.id)!==s).forEach(s=>t.objectStore('sessions').put(s,s.id));
   }
   if(state.draft!==old?.draft){if(state.draft)t.objectStore('drafts').put(state.draft,'active');else t.objectStore('drafts').delete('active')}
   if(state.settings!==old?.settings)t.objectStore('settings').put(state.settings,'personal');
   if(state.journal&&state.journal!==old?.journal)t.objectStore('settings').put(state.journal,'daily-journal-v1');
   if(state.profile&&state.profile!==old?.profile)t.objectStore('settings').put(state.profile,'profile-v1');
   if(meta)t.objectStore('settings').put(meta,'sync-v1');
  }catch(error){t.abort();reject(error)}
 });
}


export async function loadSyncMeta(scope:string):Promise<SyncMeta|undefined>{const d=await db(scope);return new Promise((resolve,reject)=>{const r=d.transaction('settings','readonly').objectStore('settings').get('sync-v1');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
