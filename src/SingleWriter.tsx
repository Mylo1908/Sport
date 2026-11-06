import React,{useEffect,useState} from 'react';

/** Hold one editing lease per origin. No database schema or stored data changes. */
export function SingleWriter({children}:{children:React.ReactNode}){
 const [state,setState]=useState<'checking'|'active'|'waiting'|'failed'>('checking');
 const [attempt,retry]=useState(0);
 useEffect(()=>{
  if(!navigator.locks){setState('active');return}
  let alive=true,release:undefined|(()=>void);
  const controller=new AbortController();
  // A reload can briefly overlap the previous document's lock. Wait for release
  // before mounting the app or reading its database, including in a second tab.
  const wait=setTimeout(()=>{if(alive)setState('waiting')},400);
  void navigator.locks.request('sport-editor-v1',{signal:controller.signal},async()=>{
   clearTimeout(wait);
   if(!alive)return;
   await new Promise<void>(resolve=>{release=resolve;setState('active')});
  }).catch(()=>{clearTimeout(wait);if(alive)setState('failed')});
  return()=>{alive=false;clearTimeout(wait);controller.abort();release?.()};
 },[attempt]);
 if(state==='active')return <>{children}</>;
 return <main className="account-gate"><section className="panel" role="status"><h1>Sport</h1>{state==='checking'?<p>Bearbeitungszugriff prüfen …</p>:state==='waiting'?<p>Sport ist bereits in einem anderen Tab geöffnet. Sobald du ihn schließt, wird dieser Tab mit dem aktuellen Trainingsstand geladen.</p>:<><p>Bearbeitungszugriff konnte nicht geprüft werden.</p><button onClick={()=>{setState('checking');retry(n=>n+1)}}>Erneut prüfen</button></>}</section></main>;
}
