import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {App} from '../../src/main';
import {AccountGate} from '../../src/CloudAccount';
import {SingleWriter} from '../../src/SingleWriter';
import {loadState,loadSyncMeta,saveState} from '../../src/db';
import {defaultCatalog,defaultPlan} from '../../src/training-plan';
import {newSession,localDate} from '../../src/domain';
import {emptyMeta,emptyProfile} from '../../src/cloud-model';
const scope='synthetic-browser-owner';
async function loadFixture(){
 const state=await loadState(scope);let meta=await loadSyncMeta(scope);
 if(!meta){
  state.plan=defaultPlan();state.catalog=structuredClone(defaultCatalog);state.profile=structuredClone(emptyProfile);state.settings={photos:{},restSeconds:90};
  const prior=newSession(state.plan.weekDays[0],state.catalog);const date=new Date();date.setDate(date.getDate()-7);prior.date=localDate(date);prior.startedAt=date.toISOString();prior.finishedAt=new Date(+date+3600000).toISOString();prior.endTime='18:00';prior.sets=prior.sets.map((s,i)=>({...s,status:'done',weightKg:50+i*2.5,reps:8+i%2}));state.sessions=[prior];
  meta=emptyMeta();meta.approved=true;await saveState(state,state.plan,state.catalog,scope,meta);
 }
 return {state,account:{uid:scope,email:'synthetic@example.invalid',meta}};
}
function Fixture(){
 const [ready,setReady]=useState<Awaited<ReturnType<typeof loadFixture>>>();
 useEffect(()=>{void loadFixture().then(setReady)},[]);
 return ready?<App initial={ready.state} account={ready.account}/>:<p>Synthetische Testdaten werden geladen …</p>;
}
const root=createRoot(document.getElementById('qa-root')!);
root.render(<SingleWriter>{new URL(location.href).searchParams.has('login')?<AccountGate>{()=>null}</AccountGate>:<Fixture/>}</SingleWriter>);
