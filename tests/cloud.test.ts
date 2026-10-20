import {test} from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {emptyMeta,recordsFromState,stateFromRecords,diffRecords,emptyProfile,validProfile,canonical} from '../src/cloud-model.ts';
import {emptyState,newSession,parseImport} from '../src/domain.ts';
import {defaultPlan,defaultCatalog} from '../src/training-plan.ts';
import {blankDay} from '../src/journal.ts';
import {loadState,saveState,loadSyncMeta} from '../src/db.ts';
const fixture=()=>({...structuredClone(emptyState),plan:defaultPlan(),catalog:structuredClone(defaultCatalog),journal:{'2026-10-18':{...blankDay('2026-10-18'),bodyWeightKg:78.5}},profile:{...emptyProfile,displayName:'Test'}});
const cloud=(values:Record<string,string>,revision=1)=>Object.fromEntries(Object.entries(values).map(([k,payload])=>[k,{revision,payload}]));
test('Cloud records keep stable IDs and all raw training data, photos remain local',()=>{
 const s=fixture();s.draft=newSession(s.plan.weekDays[0],s.catalog);s.draft.sets[0].rir=2;s.settings.photos={a:'data:image/png;base64,YQ=='};s.sessions=[{...structuredClone(s.draft),finishedAt:new Date().toISOString()}];const records=recordsFromState(s);assert.ok(!JSON.stringify(records).includes('data:image'));const roundtrip=stateFromRecords(records,s.settings.photos);assert.deepEqual(roundtrip,s);assert.equal(canonical({b:1,a:2}),canonical({a:2,b:1}));assert.throws(()=>stateFromRecords({...records,'journal/2026-10-18':canonical({...s.journal['2026-10-18'],steps:-1})},{}));
});
test('Three-way merge: two devices, offline/reconnect, remote pull, no duplicates and conflicts',()=>{
 const base=cloud(recordsFromState(fixture()));const local=Object.fromEntries(Object.entries(base).map(([k,v])=>[k,v.payload]));const remote=structuredClone(base);const path='journal/2026-10-18';const newer=canonical({...blankDay('2026-10-18'),steps:200});
 remote[path]={revision:2,payload:newer};let diff=diffRecords(local,base,remote);assert.deepEqual(diff.pull[path],remote[path]);assert.equal(Object.keys(diff.conflicts).length,0);
 local[path]=canonical({...blankDay('2026-10-18'),steps:100});diff=diffRecords(local,base,remote);assert.equal(diff.conflicts[path].local,local[path]);assert.equal(diff.conflicts[path].remote.payload,newer);assert.equal(diff.push[path],undefined);
 diff=diffRecords(local,base,base);assert.equal(diff.push[path],local[path]);const sent=cloud(local,3);diff=diffRecords(local,sent,sent);assert.equal(Object.keys(diff.push).length,0);assert.equal(Object.keys(diff.conflicts).length,0);
});
test('Empty cloud cannot erase local draft; active-draft tombstones and remote changes conflict safely',()=>{
 const s=fixture();s.draft=newSession(s.plan.weekDays[0],s.catalog);const records=recordsFromState(s);assert.equal(diffRecords(records,{},{}).push['drafts/active'],records['drafts/active']);
 const base=cloud(records);const finished={...records,'drafts/active':'null'};const other=structuredClone(base);other['drafts/active']={revision:2,payload:canonical({...s.draft,notes:'Anderes Gerät'})};
 const diff=diffRecords(finished,base,other);assert.equal(diff.conflicts['drafts/active'].local,'null');assert.equal(diff.conflicts['drafts/active'].remote.revision,2);
});
test('Account caches and migration are isolated, durable pending changes and original legacy data survive',async()=>{
 const legacy=fixture();legacy.draft=newSession(legacy.plan.weekDays[0],legacy.catalog);await saveState(legacy,legacy.plan,legacy.catalog);const meta=emptyMeta();meta.approved=true;
 await saveState(legacy,legacy.plan,legacy.catalog,'owner-test',meta);const other=await loadState('stranger-test');assert.equal(other.sessions.length,0);assert.equal(other.draft,null);assert.deepEqual(other.journal,{});
 const before=await loadState();const changed={...legacy,journal:{'2026-10-18':{...blankDay('2026-10-18'),steps:1234}}};await saveState(changed,changed.plan,changed.catalog,'owner-test',meta);assert.equal((await loadState('owner-test')).journal!['2026-10-18'].steps,1234);assert.deepEqual(await loadState(),before);assert.equal((await loadSyncMeta('owner-test'))!.approved,true);assert.equal(await loadSyncMeta('stranger-test'),undefined);
 const fresh=await import('../src/db.ts?cloud-reopen');assert.equal((await fresh.loadState('owner-test')).draft.id,legacy.draft.id);assert.equal((await fresh.loadState('owner-test')).journal['2026-10-18'].steps,1234);
});
test('Backup profiles remain optional and validated in formats 1–3',()=>{
 const s=fixture(),ids=s.catalog.map(e=>e.id);for(const schemaVersion of [1,2,3]){const data={app:'Sport',schemaVersion,...s};assert.deepEqual(parseImport(data,ids).profile,s.profile);assert.throws(()=>parseImport({...data,profile:{...s.profile,stepGoal:-1}},ids))}
 assert.ok(!validProfile({...emptyProfile,heightCm:999}));assert.ok(validProfile(emptyProfile));
});
