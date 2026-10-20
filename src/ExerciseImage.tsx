import React,{useRef,useState} from 'react';
import {imageSource} from './exercise-images';
export function ExerciseImage({id,photo,equipment,imageKey,preview=true}:{id:string;photo?:string;equipment:string;imageKey?:string;preview?:boolean}){
 const[failed,setFailed]=useState<string[]>([]);
 const dialog=useRef<HTMLDialogElement>(null);
 const source=imageSource(imageKey??id,import.meta.env.BASE_URL,photo,failed);
 const label=`${equipment} · ${source===photo?'eigenes Foto':'technische Geräteillustration'}`;
 const picture=source?<img src={source} alt={label} width="460" height="360" loading="lazy" decoding="async" onError={()=>setFailed(x=>[...x,source])}/>:null;
 return <div className="equipment">{source?preview?<><button type="button" className="equipment-preview" aria-label={`${equipment}: Bild vergrößern`} onClick={()=>dialog.current?.showModal()}>{picture}</button><dialog ref={dialog} className="equipment-dialog" aria-label={label} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close()}}><img src={source} alt={label} width="460" height="360" loading="lazy" decoding="async"/><button type="button" onClick={()=>dialog.current?.close()}>Bild schließen</button></dialog></>:picture:<div className="image-fallback" role="img" aria-label={`Bild für ${equipment} nicht verfügbar`}>Bild nicht verfügbar</div>}</div>
}

