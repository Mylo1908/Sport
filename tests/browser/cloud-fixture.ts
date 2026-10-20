/** Only substituted in the separate browser-test build. No Firebase connections. */
import {canonical,type Records} from '../../src/cloud-model';
const records:Records={};
export const cloudReady=()=>true;
export const authorized=(u:any)=>u?.uid==='synthetic-browser-owner';
export function watchAccount(next:(u:null)=>void){queueMicrotask(()=>next(null));return ()=>{}}
export const login=async()=>{throw Error('Synthetic fixture: no real login')};
export const logout=async()=>{};
export const verifyAdmin=async(uid:string)=>{if(uid!=='synthetic-browser-owner')throw Error('Not authorized')};
export class RevisionConflict extends Error{remote:any;constructor(remote:any){super('Synthetic revision conflict');this.remote=remote}}
export const cloudError=(e:any)=>e?.message??'Synthetic error';
export async function readChanges(_uid:string,cursors:any){await new Promise(r=>setTimeout(r,20));return {records:structuredClone(records),cursors,reads:6}}
export async function writeRecord(_uid:string,path:string,payload:string,revision:number){await new Promise(r=>setTimeout(r,10));const old=records[path];if((old?.revision??0)!==revision){if(old?.payload===payload)return old;throw new RevisionConflict(old)}return records[path]={revision:revision+1,payload}}
(window as any).qaRemote=(path:string,payload:any)=>{const old=records[path];records[path]={revision:(old?.revision??0)+1,payload:canonical(payload)}};
