import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,getDocs,collection,deleteDoc,serverTimestamp} from 'firebase/firestore';
import {writeToStore,RevisionConflict} from '../../src/cloud.ts';
test('Firestore authorization and revision transactions with two identities and anonymous access',async()=>{
 const rules=readFileSync('firestore.rules','utf8');const ownerUid=/uid == '([^']+)'/.exec(rules)![1];
 const env=await initializeTestEnvironment({projectId:'demo-sport',firestore:{rules,host:'127.0.0.1',port:8080}});
 try{const owner=env.authenticatedContext(ownerUid).firestore(),foreign=env.authenticatedContext('foreign-test').firestore(),anon=env.unauthenticatedContext().firestore();
 const path='users/'+ownerUid+'/journal/2026-10-18',payload=JSON.stringify({date:'2026-10-18',steps:1000});
 await assertSucceeds(setDoc(doc(owner,path),{revision:1,payload,updatedAt:serverTimestamp()}));await assertSucceeds(getDoc(doc(owner,path)));
 for(const db of [foreign,anon]){await assertFails(getDoc(doc(db,path)));await assertFails(getDocs(collection(db,'users/'+ownerUid+'/journal')));await assertFails(setDoc(doc(db,path),{revision:2,payload:'null',updatedAt:serverTimestamp()}));await assertFails(getDoc(doc(db,'users/'+ownerUid+'/admin/access')))}
 await assertFails(setDoc(doc(foreign,'users/foreign-test/settings/personal'),{revision:1,payload:'{}',updatedAt:serverTimestamp()}));
 await assertFails(setDoc(doc(owner,'users/'+ownerUid+'/admin/access'),{admin:true}));await assertFails(setDoc(doc(owner,'users/'+ownerUid+'/settings/personal'),{revision:1,payload:'{}',admin:true,updatedAt:serverTimestamp()}));
 await assertSucceeds(getDoc(doc(owner,'users/'+ownerUid+'/admin/access')));await assertFails(getDoc(doc(owner,'users/foreign-test/admin/access')));
 await assertFails(setDoc(doc(owner,path),{revision:1,payload:'overwrite',updatedAt:serverTimestamp()}));await assertFails(deleteDoc(doc(owner,path)));
 await assertFails(setDoc(doc(owner,'users/'+ownerUid+'/journal/large'),{revision:1,payload:'x'.repeat(250001),updatedAt:serverTimestamp()}));
 const newer=JSON.stringify({date:'2026-10-18',steps:2000});const saved=await writeToStore(owner as any,ownerUid,'journal/2026-10-18',newer,1);assert.equal(saved.revision,2);
 await assert.rejects(()=>writeToStore(owner as any,ownerUid,'journal/2026-10-18','old',1),RevisionConflict);assert.equal((await getDoc(doc(owner,path))).data()!.payload,newer);
 assert.equal((await writeToStore(owner as any,ownerUid,'journal/2026-10-18',newer,1)).revision,2);
 }finally{await env.cleanup()}
});
