/** Ordered atomic snapshots. A late acknowledgement must never replace a newer edit. */
export class SnapshotQueue<T, M = undefined> {
 private tail: Promise<void> = Promise.resolve();
 private sequence = 0;
 private current: {current:T};
 private write: (value:T, meta:M|undefined)=>Promise<void>;
 private publish: (value:T)=>void;
 private status: (pending:boolean, error?:unknown)=>void;
 constructor(
  current: {current:T},
  write: (value:T, meta:M|undefined)=>Promise<void>,
  publish: (value:T)=>void,
  status: (pending:boolean, error?:unknown)=>void
 ) {this.current=current;this.write=write;this.publish=publish;this.status=status}
 enqueue(next:T, critical=false, meta?:M):Promise<void> {
  const previous=this.current.current, sequence=++this.sequence;
  // Following edits must build on this snapshot, including a pending completion.
  this.current.current=next;
  if(!critical)this.publish(next);
  this.status(true);
  const job=this.tail.then(()=>this.write(next,meta));
  this.tail=job.catch(()=>{});
  void job.then(()=>{
   if(sequence!==this.sequence)return;
   if(critical)this.publish(this.current.current);
   this.status(false);
  }).catch(error=>{
   const latest=sequence===this.sequence;
   if(latest&&critical){this.current.current=previous;this.publish(previous)}
   this.status(!latest,error);
  });
  return job;
 }
}
