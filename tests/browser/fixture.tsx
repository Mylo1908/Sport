import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from '../../src/main';
import {AccountGate} from '../../src/CloudAccount';
import {SingleWriter} from '../../src/SingleWriter';
import {loadState,loadSyncMeta,saveState} from '../../src/db';
import {defaultCatalog,defaultPlan} from '../../src/training-plan';
import {newSession,localDate} from '../../src/domain';
import {emptyMeta,emptyProfile} from '../../src/cloud-model';
const scope='synthetic-browser-owner';
async function mount(){
 const root=createRoot(document.getElementById('qa-root')!);
 if(new URL(location.href).searchParams.has('login')){root.render(<SingleWriter><AccountGate>{()=>null}</AccountGate></SingleWriter>);return}
 const state=await loadState(scope);let meta=await loadSyncMeta(scope);
 if(!meta){
  state.plan=defaultPlan();state.catalog=structuredClone(defaultCatalog);state.profile=structuredClone(emptyProfile);state.settings={photos:{},restSeconds:90};
  const prior=newSession(state.plan.weekDays[0],state.catalog);const date=new Date();date.setDate(date.getDate()-7);prior.date=localDate(date);prior.startedAt=date.toISOString();prior.finishedAt=new Date(+date+3600000).toISOString();prior.endTime='18:00';prior.sets=prior.sets.map((s,i)=>({...s,status:'done',weightKg:50+i*2.5,reps:8+i%2}));state.sessions=[prior];
  meta=emptyMeta();meta.approved=true;await saveState(state,state.plan,state.catalog,scope,meta);
 }
 root.render(<SingleWriter><App initial={state} account={{uid:scope,email:'synthetic@example.invalid',meta}}/></SingleWriter>);
}
void mount();
