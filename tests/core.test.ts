import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import 'fake-indexeddb/auto';
import {newSession,completed,incomplete,parseImport,mergeSessions,lastResult,weekStart,validateSession,emptyState} from '../src/domain.ts';
import {loadState,saveState} from '../src/db.ts';
const plan=JSON.parse(readFileSync(new URL('../src/plan.json',import.meta.url),'utf8'));
const ids=plan.exerciseCatalog.map((x:any)=>x.id);
const sample=()=>({...newSession(plan.weekDays[0]),finishedAt:new Date().toISOString(),endTime:'15:00'});
test('Plan: seven days, 21 unique exercises, 66 sets, exact muscle counts',()=>{
 assert.equal(plan.weekDays.length,7);assert.equal(new Set(ids).size,21);assert.equal(plan.weekDays.reduce((n:number,d:any)=>n+d.exerciseIds.length*2,0),66);
 assert.equal(plan.weekDays.filter((d:any)=>d.exerciseIds.length===0).length,2);
 const muscles:Record<string,number>={};for(const day of plan.weekDays)for(const id of day.exerciseIds){const e=plan.exerciseCatalog.find((x:any)=>x.id===id);assert.ok(e);muscles[e.primaryMuscle]=(muscles[e.primaryMuscle]??0)+2}assert.deepEqual(muscles,plan.weeklyPlan.plannedWorkingSetsByPrimaryMuscle);
});
test('Draft starts with unknown values and independent statuses',()=>{const s=newSession(plan.weekDays[0]);assert.equal(completed(s).length,0);assert.equal(incomplete(s).length,12);assert.ok(s.sets.every(x=>x.weightKg===null&&x.reps===null&&x.status==='unknown'));s.sets[0].status='skipped';s.sets[1].status='not-done';assert.equal(incomplete(s).length,10)});
test('Only complete done sets contribute to performance',()=>{const s=sample();s.sets[0]={...s.sets[0],status:'done',weightKg:0,reps:8};s.sets[1]={...s.sets[1],status:'skipped',weightKg:100,reps:8};assert.equal(completed(s).length,1);assert.equal(validateSession(s,ids),true);s.sets[0].reps=null;assert.equal(validateSession(s,ids),false);assert.equal(validateSession(s,ids,false),true)});
test('Backup validation is strict and merging preserves existing data',()=>{const s=sample();const backup={app:'Sport',schemaVersion:1,sessions:[s],draft:null,settings:{photos:{}}};const parsed=parseImport(backup,ids);assert.equal(parsed.sessions.length,1);assert.equal(mergeSessions([s],parsed.sessions).added,0);assert.equal(mergeSessions([s],[{...s,id:'different-id'}]).duplicates,1);assert.throws(()=>parseImport({...backup,sessions:[{...s,steps:-1}]},ids));assert.throws(()=>parseImport({...backup,sessions:[{...s,date:'2026-02-30'}]},ids));assert.throws(()=>parseImport({...backup,sessions:[{...s,sets:[{...s.sets[0],exerciseId:'bad'}]}]},ids));assert.throws(()=>parseImport({...backup,settings:{photos:{bad:'javascript:x'}}},ids));assert.throws(()=>parseImport({schemaVersion:9},ids));});
test('Historical import converts provided values and preserves unknowns',()=>{const raw={schemaVersion:1,importType:'historical-training-sessions',entries:[{date:'2025-01-01',type:'Push',startTime:'12:00',endTime:'13:00',warmupCompleted:true,steps:null,runningKm:null,basketballMinutes:0,sets:[{exerciseId:ids[0],set1:{weightKg:12,reps:7},set2:{weightKg:null,reps:null}}]}]};const s=parseImport(raw,ids).sessions[0];assert.equal(s.steps,null);assert.equal(s.runningKm,null);assert.equal(s.basketballMinutes,0);assert.equal(s.sets[1].status,'unknown');assert.equal(completed(s).length,1);assert.throws(()=>parseImport({...raw,entries:[{...raw.entries[0],sets:[] ,startTime:'25:00'}]},ids))});
test('Previous values are drawn only from saved sessions',()=>{const s=sample();s.date='2025-01-01';s.sets[0]={...s.sets[0],status:'done',weightKg:25,reps:9};assert.equal(lastResult([s],ids[0],'2025-01-02')?.[0].weightKg,25);assert.equal(lastResult([s],ids[0],'2024-01-01'),undefined);assert.equal(weekStart('2026-10-18'),'2026-10-12')});
test('IndexedDB persists drafts, sessions, plan, catalog and settings across reloads',async()=>{const draft=newSession(plan.weekDays[1]);draft.sets[0].weightKg=17;const settings={photos:{}};await saveState({...emptyState,draft,settings},plan,plan.exerciseCatalog);const restored=await loadState();assert.equal(restored.draft?.sets[0].weightKg,17);const finished={...draft,endTime:'16:00',finishedAt:new Date().toISOString()};await saveState({...restored,sessions:[finished],draft:null},plan,plan.exerciseCatalog);const reloaded=await loadState();assert.equal(reloaded.draft,null);assert.equal(reloaded.sessions.length,1);assert.equal(reloaded.sessions[0].id,finished.id);const serialized={app:'Sport',schemaVersion:1,...reloaded};assert.equal(parseImport(JSON.parse(JSON.stringify(serialized)),ids).sessions.length,1)});
test('Leave/reopen/resume/finalize preserves earlier sessions and photos, backup roundtrips',async()=>{
 const prior=await loadState();const draft=newSession(plan.weekDays[4]);draft.sets[0]={...draft.sets[0],weightKg:17.5,reps:8,status:'done'};draft.sets[1].weightKg=17.5;
 const settings={photos:{pec_deck:'data:image/png;base64,YQ=='}};
 await saveState({...prior,draft,settings},plan,plan.exerciseCatalog);
 // A fresh module represents reopening the app with no in-memory db promise.
 const fresh=await import('../src/db.ts?reopen=1');const restored=await fresh.loadState();
 assert.equal(restored.draft.id,draft.id);assert.equal(restored.draft.sets[0].weightKg,17.5);assert.equal(restored.draft.sets[0].reps,8);assert.equal(restored.draft.sets[1].reps,null);assert.deepEqual(restored.settings,settings);assert.deepEqual(restored.sessions,prior.sessions);
 restored.draft.sets[1]={...restored.draft.sets[1],reps:6,status:'done'};await fresh.saveState(restored,plan,plan.exerciseCatalog);
 const resumed=await loadState();assert.equal(resumed.draft?.sets[1].reps,6);
 const finished={...resumed.draft!,finishedAt:new Date().toISOString(),endTime:'16:30'};await saveState({...resumed,draft:null,sessions:[...resumed.sessions,finished]},plan,plan.exerciseCatalog);
 const final=await fresh.loadState();assert.equal(final.draft,null);assert.equal(final.sessions.length,prior.sessions.length+1);assert.equal(completed(final.sessions.find((s:any)=>s.id===finished.id)).length,2);assert.deepEqual(final.settings,settings);
 const backup=parseImport(JSON.parse(JSON.stringify({app:'Sport',schemaVersion:1,...final})),ids);assert.deepEqual(backup.sessions,final.sessions);assert.deepEqual(backup.settings,settings);assert.equal(mergeSessions(final.sessions,backup.sessions).added,0);
});
