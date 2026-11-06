/** Only substituted in the separate browser-test build. No Firebase connections. */
import {canonical,type CloudRecord,type Records} from '../../src/cloud-model';
// A synthetic server must retain revisions on reload and across test tabs.
// Each Playwright context has independent storage; this module is never shipped.
const storeKey='sport-qa-server-v1';
const readRecords=():Records=>JSON.parse(localStorage.getItem(storeKey)??'{}');
function putRecord(path:string,record:CloudRecord){localStorage.setItem(storeKey,JSON.stringify({...readRecords(),[path]:record}));return record}
export const cloudReady=()=>true;
export const authorized=(u:any)=>u?.uid==='synthetic-browser-owner';
export function watchAccount(next:(u:null)=>void){queueMicrotask(()=>next(null));return ()=>{}}
export const login=async()=>{throw Error('Synthetic fixture: no real login')};
export const logout=async()=>{};
export const verifyAdmin=async(uid:string)=>{if(uid!=='synthetic-browser-owner')throw Error('Not authorized')};
export class RevisionConflict extends Error{remote:CloudRecord;constructor(remote:CloudRecord){super('Synthetic revision conflict');this.remote=remote}}
export const cloudError=(e:any)=>e?.message??'Synthetic error';
export async function readChanges(_uid:string,cursors:any){await new Promise(r=>setTimeout(r,20));return {records:readRecords(),cursors,reads:6}}
export async function writeRecord(_uid:string,path:string,payload:string,revision:number){await new Promise(r=>setTimeout(r,10));const old=readRecords()[path]??{revision:0,payload:'null'};if(old.revision!==revision){if(old.payload===payload)return old;throw new RevisionConflict(old)}return putRecord(path,{revision:revision+1,payload})}
(window as any).qaRemote=(path:string,payload:any)=>putRecord(path,{revision:(readRecords()[path]?.revision??0)+1,payload:canonical(payload)});
