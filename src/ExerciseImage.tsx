import React,{useState} from 'react';
import {imageSource} from './exercise-images';
export function ExerciseImage({id,photo,equipment,imageKey}:{id:string;photo?:string;equipment:string;imageKey?:string}){
 const[failed,setFailed]=useState<string[]>([]);
 const source=imageSource(imageKey??id,import.meta.env.BASE_URL,photo,failed);
 return <div className="equipment">{source?<img src={source} alt={`${equipment} — ${source===photo?'eigenes Foto':'technische Geräteillustration'}`} width="460" height="360" onError={()=>setFailed(x=>[...x,source])}/>:<div className="image-fallback" role="img" aria-label={`Bild für ${equipment} nicht verfügbar`}>Bild nicht verfügbar</div>}</div>
}

