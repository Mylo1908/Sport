import React,{useEffect,useState} from 'react';

/** Hold one editing lease per origin. No database schema or stored data changes. */
export function SingleWriter({children}:{children:React.ReactNode}){
 const [state,setState]=useState<'checking'|'active'|'blocked'>('checking');
 const [attempt,retry]=useState(0);
 useEffect(()=>{
  if(!navigator.locks){setState('active');return}
  let alive=true,release:undefined|(()=>void);
  void navigator.locks.request('sport-editor-v1',{ifAvailable:true},async lock=>{
   if(!alive)return;
   if(!lock){setState('blocked');return}
   setState('active');
   await new Promise<void>(resolve=>{release=resolve});
  }).catch(()=>{if(alive)setState('blocked')});
  return()=>{alive=false;release?.()};
 },[attempt]);
 if(state==='active')return <>{children}</>;
 return <main className="account-gate"><section className="panel" role="status"><h1>Sport</h1>{state==='checking'?<p>Bearbeitungszugriff prüfen …</p>:<><p>Sport ist bereits in einem anderen Tab geöffnet. Schließe den anderen Sport-Tab, bevor du hier weiterarbeitest. So überschreiben sich keine Trainingsentwürfe.</p><button onClick={()=>{setState('checking');retry(n=>n+1)}}>Erneut prüfen</button></>}</section></main>;
}
