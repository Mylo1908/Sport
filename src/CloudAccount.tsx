import React,{useEffect,useRef,useState} from 'react';
import type {User} from 'firebase/auth';
import {NumberField} from './NumberField';
import {cloudReady,cloudConfig} from './firebase-config';
import {watchAccount,authorized,login,logout,readChanges,writeRecord,verifyAdmin,cloudError,RevisionConflict} from './cloud';
import {emptyMeta,recordsFromState,stateFromRecords,diffRecords,emptyProfile,type SyncMeta,type Records,type Profile} from './cloud-model';
import {loadState,loadSyncMeta,saveState} from './db';
import {defaultPlan,defaultCatalog} from './training-plan';
import type {State} from './domain';
export type AccountContext={uid:string;email:string;meta:SyncMeta};
export function AccountGate({children}:{children:(initial:State|undefined,account:AccountContext|undefined)=>React.ReactNode}){
 const [user,setUser]=useState<User|null>(null),[known,setKnown]=useState(!cloudReady()),[initial,setInitial]=useState<State>(),[account,setAccount]=useState<AccountContext>(),[legacy,setLegacy]=useState<State>(),[remote,setRemote]=useState<Records>(),[error,setError]=useState(''),[busy,setBusy]=useState(false),[email,setEmail]=useState(''),[password,setPassword]=useState('');
 const generation=useRef(0);
 useEffect(()=>{if(!cloudReady())return;return watchAccount(u=>{const gen=++generation.current;setKnown(false);setUser(u);setInitial(undefined);setAccount(undefined);setLegacy(undefined);setRemote(undefined);setError('');
  if(!u){setKnown(true);return}if(!authorized(u)){setError('Dieser Account ist nicht freigeschaltet.');void logout();setKnown(true);return}
  void Promise.all([loadState(u.uid),loadSyncMeta(u.uid)]).then(async([s,meta])=>{if(gen!==generation.current)return;if(meta?.approved){setInitial(s);setAccount({uid:u.uid,email:u.email??'',meta});setKnown(true)}else{const [old,cloud]=await Promise.all([loadState(),readChanges(u.uid,{})]);if(gen!==generation.current)return;setLegacy(old);setRemote(cloud.records);setKnown(true)}}).catch(e=>{if(gen===generation.current){setError(cloudError(e));setKnown(true)}})
 })},[]);
 if(!cloudReady())return <>{children(undefined,undefined)}</>;
 async function adopt(includeLocal:boolean){if(!user||!remote||!legacy)return;const gen=generation.current;setBusy(true);try{
  const state=includeLocal?structuredClone(legacy):stateFromRecords(Object.fromEntries(Object.entries(remote).map(([k,v])=>[k,v.payload])),{});
  const meta=emptyMeta();meta.approved=true;
  // For a local migration do not pretend different remote values are a common ancestor.
  if(!includeLocal)meta.base=remote;
  await saveState(state,state.plan??defaultPlan(),state.catalog??defaultCatalog,user.uid,meta);if(gen!==generation.current)return;setInitial(state);setAccount({uid:user.uid,email:user.email??'',meta});
 }catch(e){setError(cloudError(e))}finally{setBusy(false)}}
 async function signIn(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{await login(email.trim(),password);setPassword('')}catch(e){setError(cloudError(e));setPassword('')}finally{setBusy(false)}}
 function legacyBackup(){if(!legacy)return;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({app:'Sport',schemaVersion:3,...legacy,plan:legacy.plan??defaultPlan(),catalog:legacy.catalog??defaultCatalog,journal:legacy.journal??{}},null,2)],{type:'application/json'}));a.download='Sport-vor-Cloud-Backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
 if(known&&user&&authorized(user)&&initial&&account&&account.uid===user.uid)return <React.Fragment key={account.uid}>{children(initial,account)}</React.Fragment>;
 return <main className="account-gate"><section className="panel"><h1>Sport · Privater Account</h1>{error&&<p role="alert">{error}</p>}{!known?<p>Account und lokalen Speicher prüfen …</p>:!user?<form onSubmit={signIn}><p>Nur ausdrücklich freigeschaltete Accounts. Keine öffentliche Registrierung.</p><label className="field">E-Mail<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="field">Passwort<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary" disabled={busy}>Anmelden</button></form>:legacy&&remote?<><h2>Erste Datenübernahme auf diesem Gerät</h2><p>Bitte zuerst ein Backup herunterladen. Die bisherigen lokalen Originaldaten bleiben erhalten.</p><p>Lokal: {legacy.sessions.length} Trainings · {Object.keys(legacy.journal??{}).length} Journaltage · {legacy.draft?'aktiver Entwurf':'kein Entwurf'} · {Object.keys(legacy.settings.photos).length} Fotos.</p><p>Cloud: {Object.keys(remote).filter(k=>k.startsWith('sessions/')).length} Trainings · {Object.keys(remote).filter(k=>k.startsWith('journal/')).length} Journaltage. Unterschiedliche Versionen werden als Konflikt vorgelegt.</p><div className="actions"><button onClick={legacyBackup}>Backup herunterladen</button><button disabled={busy} onClick={()=>void adopt(true)}>Lokale Daten zur Übernahme vormerken</button><button disabled={busy} onClick={()=>void adopt(false)}>Cloud laden · lokale Originale behalten</button></div></>:<p>Accountdaten konnten nicht geladen werden. Verbindung prüfen und Seite neu laden.</p>}{user&&<button onClick={()=>void logout()}>Abmelden</button>}</section></main>
}
export function CloudPanel({account,getState,commit,exportBackup,onProfile,visible,onStatus,canApply}:{account?:AccountContext;canApply:()=>boolean;visible:boolean;onStatus:(s:string)=>void;getState:()=>State;commit:(state:State)=>Promise<unknown>;exportBackup:()=>void;onProfile:(p:Profile)=>void}){
 const [status,setStatus]=useState('Lokal gespeichert'),[detail,setDetail]=useState(''),[admin,setAdmin]=useState(false),[tick,render]=useState(0);
 const running=useRef(false),mounted=useRef(true),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);const lastWork=useRef(0);
 const meta=account?.meta;
 useEffect(()=>onStatus(status),[status]);
 useEffect(()=>{if(!account)return;const check=()=>{if(location.hash==='#/admin')void verifyAdmin(account.uid).then(()=>setAdmin(true)).catch(e=>{setAdmin(false);setDetail(cloudError(e))})};check();window.addEventListener('hashchange',check);return()=>window.removeEventListener('hashchange',check)},[account?.uid]);

 const sync=async()=>{if(!account||!meta||running.current||!mounted.current||!canApply())return;if(!navigator.onLine){setStatus('Offline · Änderungen lokal vorgemerkt');return}running.current=true;lastWork.current=Date.now();setStatus('Synchronisierung läuft');
  try{const changed=await readChanges(account.uid,meta.cursors);if(!mounted.current)return;if(!canApply()){setStatus('Lokal gespeichert · Änderungen vorgemerkt');clearTimeout(timer.current);timer.current=setTimeout(()=>void sync(),1000);return;}
   const remote={...meta.base,...Object.fromEntries(Object.entries(meta.conflicts).map(([k,c])=>[k,c.remote])),...changed.records};
   const local=recordsFromState(getState());const diff=diffRecords(local,meta.base,remote);
   const candidate={...local,...Object.fromEntries(Object.entries(diff.pull).map(([k,v])=>[k,v.payload]))};
   const state=stateFromRecords(candidate,getState().settings.photos);meta.base={...meta.base,...diff.pull};meta.conflicts=diff.conflicts;meta.cursors=changed.cursors;await commit(state);
   let writes=0;
   for(const [path,payload] of Object.entries(diff.push)){if(!mounted.current)return;
    // Never write an obsolete in-flight local version.
    if(recordsFromState(getState())[path]!==payload)continue;
    try{const saved=await writeRecord(account.uid,path,payload,meta.base[path]?.revision??0);meta.base[path]=saved;writes++}
    catch(e){if(e instanceof RevisionConflict){meta.conflicts[path]={local:recordsFromState(getState())[path]??'null',remote:e.remote}}else throw e}
    if(!mounted.current)return;if(canApply())await commit(getState());
   }
   if(!mounted.current)return;const pending=Object.keys(diffRecords(recordsFromState(getState()),meta.base,meta.base).push).length;
   if(!Object.keys(meta.conflicts).length&&!pending)meta.lastSuccess=new Date().toISOString();if(canApply())await commit(getState());render(n=>n+1);
   setStatus(Object.keys(meta.conflicts).length?'Konflikt erfordert Entscheidung':pending?'Lokal gespeichert · Änderungen vorgemerkt':'Cloud aktuell');setDetail(changed.reads+' Dokument-Lesezugriffe (inkl. leere Abfragen) · '+writes+' bestätigte Schreibvorgänge in diesem Lauf');
  }catch(e){if(mounted.current){setStatus(navigator.onLine?'Synchronisierung fehlgeschlagen':'Offline · Änderungen lokal vorgemerkt');setDetail(cloudError(e))}}
  finally{running.current=false}
 };
 useEffect(()=>{mounted.current=true;if(!account)return()=>{mounted.current=false};void sync();
  const online=()=>void sync();const offline=()=>setStatus('Offline · Änderungen lokal vorgemerkt');const focus=()=>{if(Date.now()-lastWork.current>30000)void sync()};window.addEventListener('online',online);window.addEventListener('offline',offline);window.addEventListener('focus',focus);const poll=setInterval(()=>{if(document.visibilityState==='visible')void sync()},60000);
  return()=>{mounted.current=false;window.removeEventListener('online',online);window.removeEventListener('offline',offline);window.removeEventListener('focus',focus);clearInterval(poll);clearTimeout(timer.current)}
 },[account?.uid]);
 // Debounce local edits, but do not start polling on every React render.
 const signature=JSON.stringify(recordsFromState(getState()));
 useEffect(()=>{if(!account||!meta)return;if(!navigator.onLine)setStatus('Offline · Änderungen lokal vorgemerkt');else if(!running.current&&Object.keys(diffRecords(recordsFromState(getState()),meta.base,meta.base).push).length)setStatus('Lokal gespeichert · Änderungen vorgemerkt');clearTimeout(timer.current);timer.current=setTimeout(()=>void sync(),5000);return()=>clearTimeout(timer.current)},[signature,account?.uid]);
 async function resolve(path:string,choice:'local'|'remote'){if(!meta||!canApply()||running.current)return;const conflict=meta.conflicts[path];if(!conflict)return;try{
  const all=recordsFromState(getState());const currentLocal=all[path]??'null';
  const state=stateFromRecords({...all,[path]:choice==='remote'?conflict.remote.payload:currentLocal},getState().settings.photos);
  meta.archives??=[];meta.archives.push({path,local:currentLocal,remote:conflict.remote,chosen:choice,at:new Date().toISOString()});
  meta.base[path]=conflict.remote;delete meta.conflicts[path];await commit(state);render(n=>n+1);setStatus('Lokal gespeichert · Entscheidung vorgemerkt');void sync();
 }catch(e){setDetail(cloudError(e))}}
 const p=getState().profile??emptyProfile;
 return <section className="panel cloud-panel" hidden={!visible}><h2>{account?'Mein Account & Cloud':'Cloud-Einrichtung'}</h2>{!account?<p>Cloud ist noch nicht aktiviert. Firebase Spark, Eigentümer-UID und veröffentlichte Sicherheitsregeln müssen vor der Freischaltung geprüft werden. Die App speichert weiterhin lokal.</p>:<><p>{account.email} · <strong role="status">{status}</strong></p><p>Letzte vollständig bestätigte Synchronisierung: {meta?.lastSuccess?new Date(meta.lastSuccess).toLocaleString('de-DE'):'noch keine'}</p>{detail&&<p role="status">{detail}</p>}<p>Gerätefotos bleiben lokal und im Backup. Keine automatische Fotosynchronisierung.</p><div className="actions"><button onClick={()=>void sync()}>Jetzt synchronisieren</button><button onClick={exportBackup}>Eigene Daten exportieren</button><button onClick={()=>{location.hash='/admin';void verifyAdmin(account.uid).then(()=>setAdmin(true)).catch(e=>{setAdmin(false);setDetail(cloudError(e))})}}>Admin öffnen</button><button onClick={()=>void logout().catch(e=>{setAdmin(false);setDetail(cloudError(e))})}>Sicher abmelden</button></div>
 {Object.entries(meta?.conflicts??{}).map(([path,c])=><article className="cloud-conflict" key={path}><h3>Konflikt: {path}</h3><p>Beide Versionen bleiben lokal erhalten. Auswahl betrifft diesen vollständigen Datensatz.</p><details><summary>Versionen vergleichen</summary><h4>Dieses Gerät</h4><pre>{JSON.stringify(JSON.parse(recordsFromState(getState())[path]??c.local),null,2)}</pre><h4>Cloud · Revision {c.remote.revision}</h4><pre>{JSON.stringify(JSON.parse(c.remote.payload),null,2)}</pre></details><button disabled={status==='Synchronisierung läuft'} onClick={()=>void resolve(path,'local')}>Aktuelle lokale Version behalten</button><button disabled={status==='Synchronisierung läuft'} onClick={()=>void resolve(path,'remote')}>Cloud-Version übernehmen</button></article>)}
 {admin&&<article><h3>Private Administration</h3><p>Account: {account.uid}</p><p>Serverseitige Admin-Berechtigung geprüft · {getState().sessions.length} Trainings · {Object.keys(getState().journal??{}).length} Journaltage · {Object.keys(meta?.conflicts??{}).length} Konflikte · {meta?.archives?.length??0} archivierte Entscheidungen.</p><p>Geschätzte synchronisierbare Nutzdaten: {new Blob([signature]).size.toLocaleString('de-DE')} Bytes. Keine projektweite Quotenmessung; maßgeblich ist die Firebase-Konsole.</p><details><summary>Gespeicherte Trainingseinheiten</summary>{getState().sessions.map(s=><p key={s.id}>{s.date} · {s.type} · {s.sets.filter(x=>x.status==='done').length} erledigte Sätze · ID {s.id}</p>)}</details><details><summary>Gespeicherte Journaltage</summary>{Object.values(getState().journal??{}).sort((a,b)=>b.date.localeCompare(a.date)).map(d=><p key={d.date}>{d.date} · {d.steps??'—'} Schritte · {d.bodyWeightKg??'—'} kg Körpergewicht · {d.activities.length} weitere Aktivitäten</p>)}</details></article>}</>}
 <details><summary>Mein Profil · freiwillige Angaben</summary><p>Körpergewicht im Journal bleibt ein eigener zeitabhängiger Messwert. Trainingsgewichte bleiben in kg; die Profilpräferenz ist nur eine Angabe.</p>{(['displayName','goal','birthDate'] as const).map(k=><label className="field" key={k}>{({displayName:'Anzeigename',goal:'Trainingsziel',birthDate:'Geburtsdatum'})[k]}<input type={k==='birthDate'?'date':'text'} maxLength={k==='goal'?1000:100} value={p[k]} onChange={e=>onProfile({...p,[k]:e.target.value})}/></label>)}{(['heightCm','stepGoal','startingWeightKg'] as const).map(k=><NumberField key={k} label={({heightCm:'Körpergröße cm',stepGoal:'Persönliches Schrittziel',startingWeightKg:'Ausgangsgewicht kg'})[k]} value={p[k]} integer={k==='stepGoal'} max={k==='heightCm'?300:k==='startingWeightKg'?1000:1000000} onChange={n=>onProfile({...p,[k]:n})}/>)}<label className="field">Bevorzugte Gewichtseinheit<select value={p.unit} onChange={e=>onProfile({...p,unit:e.target.value as 'kg'|'lb'})}><option value="kg">kg</option><option value="lb">lb (Profilpräferenz)</option></select></label></details>
 </section>
}
