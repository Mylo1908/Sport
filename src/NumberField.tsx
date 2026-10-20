import React,{useState} from 'react';
import {parseDailyNumber} from './journal';
export function NumberField({label,value,max=1440,integer=false,onChange}:{label:string;value:number|null;max?:number;integer?:boolean;onChange:(n:number|null)=>void}){
 const [raw,setRaw]=useState<string|null>(null);const shown=raw??(value===null?'':String(value));const invalid=parseDailyNumber(shown,max,integer)===undefined;
 return <label className="field">{label}<input type="text" inputMode={integer?'numeric':'decimal'} value={shown} aria-invalid={invalid} placeholder="—" onChange={e=>{setRaw(e.target.value);const n=parseDailyNumber(e.target.value,max,integer);if(n!==undefined)onChange(n)}} onBlur={()=>{if(!invalid)setRaw(null)}}/>{invalid&&<small role="alert">Bitte {integer?'eine ganze Zahl':'eine Zahl (Komma möglich)'} zwischen 0 und {max} eingeben. Noch nicht gespeichert.</small>}</label>
}
