import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,onAuthStateChanged} from 'firebase/auth';
test('Email/password login, failed password, auth observer and logout in Auth emulator',async()=>{
 const app=initializeApp({apiKey:'demo-key',projectId:'demo-sport'},'auth-test-'+Date.now());const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});
 try{const email='synthetic-'+Date.now()+'@example.invalid';const created=await createUserWithEmailAndPassword(auth,email,'Synthetic-only-45!');const uid=created.user.uid;await signOut(auth);assert.equal(auth.currentUser,null);
 await assert.rejects(()=>signInWithEmailAndPassword(auth,email,'wrong-password'));
 const signed=await signInWithEmailAndPassword(auth,email,'Synthetic-only-45!');assert.equal(signed.user.uid,uid);
 const observed=await new Promise<string|null>(resolve=>{let stop=()=>{};stop=onAuthStateChanged(auth,u=>{resolve(u?.uid??null);setTimeout(stop,0)})});assert.equal(observed,uid);
 await signOut(auth);assert.equal(auth.currentUser,null);
 }finally{await deleteApp(app)}
});
