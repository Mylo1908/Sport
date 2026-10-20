import {initializeApp} from 'firebase/app';
import {initializeAuth,indexedDBLocalPersistence,browserLocalPersistence,onAuthStateChanged,signInWithEmailAndPassword,signOut,type User} from 'firebase/auth';
import {initializeFirestore,memoryLocalCache,collection,doc,getDocFromServer,getDocsFromServer,query,where,Timestamp,runTransaction,serverTimestamp} from 'firebase/firestore';
import {cloudConfig,cloudReady} from './firebase-config.ts';
import {groups,type Group,type Records,type CloudRecord} from './cloud-model.ts';
let instance:ReturnType<typeof create>|undefined;
function create(){const app=initializeApp(cloudConfig.firebase);return {auth:initializeAuth(app,{persistence:[indexedDBLocalPersistence,browserLocalPersistence]}),db:initializeFirestore(app,{localCache:memoryLocalCache()})}}
function client(){if(!cloudReady())throw Error('Cloud noch nicht freigeschaltet.');return instance??=create()}
export const authorized=(user:Pick<User,'uid'>|null)=>!!user&&user.uid===cloudConfig.ownerUid;
export function watchAccount(next:(user:User|null)=>void){return onAuthStateChanged(client().auth,next)}
export async function login(email:string,password:string){const user=(await signInWithEmailAndPassword(client().auth,email,password)).user;if(!authorized(user)){await logout();throw Error('Dieser Account ist nicht freigeschaltet.')}return user}
export const logout=()=>signOut(client().auth);
function requireOwner(uid:string){const user=client().auth.currentUser;if(!authorized(user)||uid!==user!.uid)throw Error('Kein autorisierter Account.')}
export async function verifyAdmin(uid:string){requireOwner(uid);if(uid!==cloudConfig.adminUid)throw Error('Kein Administrator.');await getDocFromServer(doc(client().db,'users',uid,'admin','access'));}
export async function readChanges(uid:string,cursors:Record<string,{seconds:number;nanoseconds:number}>){
 requireOwner(uid);const records:Records={},next={...cursors};let reads=0;
 for(const group of groups){const ref=collection(client().db,'users',uid,group);const cursor=cursors[group];const q=cursor?query(ref,where('updatedAt','>=',new Timestamp(cursor.seconds,cursor.nanoseconds))):query(ref);const data=await getDocsFromServer(q);reads+=Math.max(1,data.size);
  for(const d of data.docs){const v=d.data();if(!Number.isInteger(v.revision)||v.revision<1||typeof v.payload!=='string'||v.payload.length>250000||!v.updatedAt)throw Error('Ungültige Cloud-Daten.');records[group+'/'+d.id]={revision:v.revision,payload:v.payload};const t=v.updatedAt as Timestamp;const prior=next[group];if(!prior||t.seconds>prior.seconds||t.seconds===prior.seconds&&t.nanoseconds>prior.nanoseconds)next[group]={seconds:t.seconds,nanoseconds:t.nanoseconds};}
 }
 return {records,cursors:next,reads}
}
export class RevisionConflict extends Error{remote:CloudRecord;constructor(remote:CloudRecord){super('Cloud-Version wurde zwischenzeitlich geändert.');this.remote=remote}}
export async function writeRecord(uid:string,path:string,payload:string,revision:number){
 requireOwner(uid);return writeToStore(client().db,uid,path,payload,revision);
}
export async function writeToStore(db:ReturnType<typeof initializeFirestore>,uid:string,path:string,payload:string,revision:number){
 const [group,id,...extra]=path.split('/');if(extra.length||!groups.includes(group as Group)||!id||payload.length>250000)throw Error('Cloud-Datensatz zu groß oder ungültig.');
 const ref=doc(db,'users',uid,group,id);
 return runTransaction(db,async tx=>{const old=await tx.get(ref);const remote=old.exists()?old.data():{revision:0,payload:'null'};
  if(remote.revision!==revision){if(remote.payload===payload)return {revision:remote.revision,payload};throw new RevisionConflict({revision:remote.revision,payload:remote.payload})}
  const result={revision:revision+1,payload};tx.set(ref,{...result,updatedAt:serverTimestamp()});return result;
 });
}
export function cloudError(error:unknown){const code=(error as {code?:string})?.code??'';if(code.includes('resource-exhausted'))return 'Gratislimit erreicht. Lokal weiterarbeiten und Backup sichern; kein kostenpflichtiges Upgrade nötig.';if(code.includes('permission-denied'))return 'Cloud-Zugriff verweigert. UID und Sicherheitsregeln prüfen.';if(code.startsWith('auth/')){const messages:Record<string,string>={'auth/invalid-credential':'E-Mail oder Passwort wurde nicht erkannt.','auth/invalid-login-credentials':'E-Mail oder Passwort wurde nicht erkannt.','auth/wrong-password':'E-Mail oder Passwort wurde nicht erkannt.','auth/user-not-found':'E-Mail oder Passwort wurde nicht erkannt.','auth/invalid-email':'Bitte eine gültige E-Mail-Adresse eingeben.','auth/operation-not-allowed':'Die E-Mail-/Passwort-Anmeldung ist im Firebase-Projekt nicht aktiviert.','auth/invalid-api-key':'Die Firebase-Web-Konfiguration ist ungültig.','auth/api-key-not-valid.-please-pass-a-valid-api-key.':'Die Firebase-Web-Konfiguration ist ungültig.','auth/network-request-failed':'Firebase ist nicht erreichbar. Verbindung prüfen; lokale Daten bleiben erhalten.','auth/too-many-requests':'Zu viele Anmeldeversuche. Bitte später erneut versuchen.','auth/user-disabled':'Dieser Firebase-Account ist gesperrt.'};return (messages[code]??'Anmeldung fehlgeschlagen. Firebase-Konfiguration und Verbindung prüfen.')+' ('+code+')'}return error instanceof Error?error.message:'Synchronisierung fehlgeschlagen. Lokale Daten bleiben erhalten.'}
