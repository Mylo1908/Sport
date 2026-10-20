import {test} from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {blankDay,validJournal,parseDailyNumber,mergeJournal,journalPoints,journalSummary} from '../src/journal.ts';
import {emptyState,newSession,parseImport,localDate} from '../src/domain.ts';
import {defaultPlan,defaultCatalog,applyDay} from '../src/training-plan.ts';
import {saveState,loadState} from '../src/db.ts';
test('Journal: optional values, comma decimals, integer steps, valid dates and multiple activities',()=>{
 const d=blankDay('2026-10-18');assert.equal(d.steps,null);assert.equal(parseDailyNumber('',24),null);assert.equal(parseDailyNumber('78,25',1000),78.25);assert.equal(parseDailyNumber('1.2',10000,true),undefined);assert.equal(parseDailyNumber('-1',100),undefined);
 d.activities=[{id:'a',name:'Yoga',minutes:20,km:null,note:'ruhig'},{id:'b',name:'Rad',minutes:null,km:5.5,note:''}];d.bodyWeightKg=78.25;assert.ok(validJournal({[d.date]:d}));assert.ok(!validJournal({'2026-02-30':{...d,date:'2026-02-30'}}));assert.ok(!validJournal({[d.date]:{...d,steps:1.2}}));assert.ok(!validJournal({[d.date]:{...d,activities:[d.activities[0],d.activities[0]]}}));
});
test('One local date, explicit zero versus unknown, conflict preservation and no legacy double counting',()=>{
 const a={...blankDay('2026-10-18'),steps:0};const b={...blankDay('2026-10-20'),steps:1200,bodyWeightKg:70.5};
 const journal=mergeJournal({[a.date]:a},{[a.date]:{...a,steps:999},[b.date]:b});assert.equal(journal[a.date].steps,0);assert.equal(Object.keys(mergeJournal(journal,journal)).length,2);assert.deepEqual(journalPoints(journal,'bodyWeightKg'),[{date:b.date,value:70.5}]);assert.equal(journalSummary(journal,'2026-10-01','2026-10-31').steps,1200);assert.equal(journalSummary({},a.date,b.date).steps,null);
 assert.equal(localDate(new Date(2026,9,18,0,1)),'2026-10-18');
});
test('Journal persistence and backup v3 preserve draft, sessions, photos, plans, timers and RIR',async()=>{
 const plan=defaultPlan(),catalog=defaultCatalog;const draft=newSession(plan.weekDays[0],catalog);draft.sets[0].rir=2;draft.timer={endsAt:null,remainingMs:90000,durationMs:90000,next:'Weiter'};const settings={photos:{[catalog[0].id]:'data:image/png;base64,YQ=='}};
 const d={...blankDay('2026-10-18'),bodyWeightKg:78.5,notes:'Ruhetag'};const state={...emptyState,plan,catalog,draft,settings,journal:{[d.date]:d}};await saveState(state,plan,catalog);const restored=await loadState();assert.deepEqual({...restored,catalog:state.catalog},state);assert.deepEqual(new Map(restored.catalog!.map(e=>[e.id,e])),new Map(catalog.map(e=>[e.id,e])));
 const edited={...restored,journal:{...restored.journal,[d.date]:{...d,steps:4567}}};await saveState(edited,plan,catalog);assert.deepEqual(await loadState(),edited);
 const backup={app:'Sport',schemaVersion:3,...edited};assert.deepEqual(parseImport(JSON.parse(JSON.stringify(backup)),catalog.map(e=>e.id)).journal,edited.journal);
 assert.throws(()=>parseImport({...backup,journal:{[d.date]:{...d,bodyWeightKg:-4}}},catalog.map(e=>e.id)));
 for(const version of [1,2])assert.equal(parseImport({...backup,schemaVersion:version,journal:undefined},catalog.map(e=>e.id)).journal,undefined);
});
test('Normal plans produce all cards; explicit empty-rest draft repair preserves identity and notes',()=>{
 const plan=defaultPlan();for(const day of plan.weekDays){const session=newSession(day,defaultCatalog);assert.deepEqual([...new Set(session.sets.map(s=>s.exerciseId))],day.exerciseIds)}
 const rest=plan.weekDays.find(d=>!d.exerciseIds.length)!;const draft={...newSession(rest),notes:'Erhalten',steps:123};assert.equal(draft.sets.length,0);const repaired=applyDay(draft,plan.weekDays[0],defaultCatalog);assert.equal(repaired.id,draft.id);assert.equal(repaired.notes,'Erhalten');assert.equal(repaired.steps,123);assert.equal(new Set(repaired.sets.map(s=>s.exerciseId)).size,6);
});
