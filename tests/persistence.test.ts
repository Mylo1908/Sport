import {test} from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {SnapshotQueue} from '../src/persistence.ts';
import {loadState,saveState} from '../src/db.ts';
import {emptyState,newSession,validateSession} from '../src/domain.ts';
import {defaultCatalog,defaultPlan,applyDay,dayFromSession} from '../src/training-plan.ts';
import {imageSource} from '../src/exercise-images.ts';
import {previousValues} from '../src/mobile-workout.ts';

const deferred=()=>{let resolve!:()=>void;let reject!:(e:Error)=>void;const promise=new Promise<void>((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
test('Late critical acknowledgement preserves newer edits and ordered writes',async()=>{
 const gate=deferred(),current={current:{draft:'active',profile:''}},published:any[]=[],written:any[]=[];
 const queue=new SnapshotQueue(current,async value=>{written.push(value);if(written.length===1)await gate.promise},v=>published.push(v),()=>{});
 const finish=queue.enqueue({draft:'',profile:''},true);
 assert.equal(current.current.draft,'');
 const edit=queue.enqueue({...current.current,profile:'synthetic'});
 gate.resolve();await finish;assert.equal(current.current.profile,'synthetic');await edit;
 assert.deepEqual(written,[{draft:'',profile:''},{draft:'',profile:'synthetic'}]);
 assert.deepEqual(published,[{draft:'',profile:'synthetic'}]);
});
test('Failed critical save keeps the previous draft, reports error, and retry works',async()=>{
 const before={draft:'active'},current={current:before},events:any[]=[];let fail=true;
 const queue=new SnapshotQueue(current,async()=>{if(fail)throw Error('QuotaExceededError')},()=>{},(pending,error)=>events.push({pending,error}));
 await assert.rejects(queue.enqueue({draft:''},true));await Promise.resolve();
 assert.equal(current.current,before);assert.equal(events.at(-1).pending,false);assert.match(String(events.at(-1).error),/Quota/);
 fail=false;await queue.enqueue({draft:''},true);assert.equal(current.current.draft,'');assert.equal(events.at(-1).error,undefined);
});
test('An earlier failed snapshot does not mark a newer queued write as saved',async()=>{
 const gate=deferred(),events:any[]=[],current={current:0};let calls=0;
 const queue=new SnapshotQueue(current,async()=>{if(++calls===1)throw Error('temporary');await gate.promise},()=>{},(pending,error)=>events.push({pending,error}));
 const one=queue.enqueue(1);const two=queue.enqueue(2);await assert.rejects(one);await Promise.resolve();
 assert.equal(events.at(-1).pending,true);gate.resolve();await two;assert.equal(events.at(-1).pending,false);assert.equal(current.current,2);
});
test('A failed IndexedDB open can be retried without reloading or altering schema',async()=>{
 const original=indexedDB.open.bind(indexedDB);let first=true;
 indexedDB.open=((...args:any[])=>{if(first){first=false;throw Error('temporary storage failure')}return original(...args)}) as any;
 try{await assert.rejects(loadState('qa-open-retry'),/temporary/);const state=await loadState('qa-open-retry');assert.equal(state.draft,null);await saveState({...structuredClone(emptyState),settings:{photos:{},restSeconds:91}},undefined,defaultCatalog,'qa-open-retry');assert.equal((await loadState('qa-open-retry')).settings.restSeconds,91)}finally{indexedDB.open=original}
});
test('An aborted IndexedDB read rejects instead of leaving the app loading forever',async()=>{
 await loadState('qa-aborted-read');
 const original=IDBDatabase.prototype.transaction;
 IDBDatabase.prototype.transaction=function(...args:any[]){const transaction=original.apply(this,args as any);if(args[1]==='readonly')queueMicrotask(()=>transaction.abort());return transaction} as any;
 try{await assert.rejects(loadState('qa-aborted-read'),/abgebrochen|abort/i)}finally{IDBDatabase.prototype.transaction=original}
});
test('Duplicate stable set IDs cannot enter backups and different exercises never inherit their values',()=>{
 const draft=newSession(defaultPlan().weekDays[0],defaultCatalog),ids=defaultCatalog.map(x=>x.id);
 draft.sets[0]={...draft.sets[0],weightKg:50,reps:8,status:'done'};
 const day=dayFromSession(draft),newId=defaultCatalog.find(e=>!day.exerciseIds.includes(e.id))!.id,oldId=day.exerciseIds[0];
 day.exerciseIds[0]=newId;day.prescriptions![newId]=day.prescriptions![oldId];delete day.prescriptions![oldId];
 const replaced=applyDay(draft,day,defaultCatalog);
 assert.equal(replaced.sets[0].exerciseId,newId);assert.equal(replaced.sets[0].weightKg,null);assert.equal(replaced.sets[0].status,'unknown');
 draft.sets[1].id=draft.sets[0].id;assert.equal(validateSession(draft,ids,false),false);
});
test('Unknown custom image keys cannot inherit Object.prototype entries',()=>{
 for(const key of ['constructor','__proto__','toString'])assert.equal(imageSource(key,'/Sport/',undefined,[]),null);
});
test('Immutable draft edits do not rewrite finished histories or unchanged photos',async()=>{
 const state={...structuredClone(emptyState),catalog:structuredClone(defaultCatalog),plan:defaultPlan(),draft:newSession(defaultPlan().weekDays[0]),sessions:[{...newSession(defaultPlan().weekDays[0]),finishedAt:new Date().toISOString()}]};
 await saveState(state,state.plan,state.catalog,'qa-dirty-writes');
 const original=IDBObjectStore.prototype.put,stores:string[]=[];
 IDBObjectStore.prototype.put=function(...args:any[]){stores.push(this.name);return original.apply(this,args as any)} as any;
 try{await saveState({...state,draft:{...state.draft,notes:'synthetic edit'}},state.plan,state.catalog,'qa-dirty-writes')}finally{IDBObjectStore.prototype.put=original}
 assert.deepEqual(stores,['drafts']);const restored=await loadState('qa-dirty-writes');assert.equal(restored.sessions.length,1);assert.equal(restored.draft?.notes,'synthetic edit');
});
test('A synchronous clone failure aborts the whole transaction and preserves earlier data',async()=>{
 const before={...structuredClone(emptyState),draft:newSession(defaultPlan().weekDays[0])};await saveState(before,undefined,defaultCatalog,'qa-atomic-failure');
 await assert.rejects(saveState({...before,draft:null,sessions:[{...before.draft,finishedAt:new Date().toISOString()}],profile:{invalid:()=>{}} as any},undefined,defaultCatalog,'qa-atomic-failure'));
 const restored=await loadState('qa-atomic-failure');assert.equal(restored.sessions.length,0);assert.equal(restored.draft?.id,before.draft.id);
});
test('Different known device variants never auto-fill weights across equipment',()=>{
 const prior=newSession(defaultPlan().weekDays[0],defaultCatalog);prior.finishedAt=new Date().toISOString();prior.date='2025-01-01';prior.sets[0]={...prior.sets[0],weightKg:50,reps:8,status:'done'};
 const current=newSession(defaultPlan().weekDays[0],defaultCatalog),id=current.sets[0].exerciseId;
 assert.ok(Object.keys(previousValues(current,[prior])).length>0);
 current.exerciseSnapshots![id]={...current.exerciseSnapshots![id],equipment:'Other synthetic machine'};
 assert.equal(Object.keys(previousValues(current,[prior])).length,0);
});
