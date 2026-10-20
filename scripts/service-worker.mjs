import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const output=process.argv[2]??'dist';
const {version:release}=JSON.parse(await readFile('package.json','utf8'));
await writeFile(output+'/release.json',JSON.stringify({version:release,commit:process.env.GITHUB_SHA??null})+'\n');
const assets=(await readdir(output+'/assets')).map(x=>'assets/'+x);
const illustrations=(await readdir(output+'/exercises')).filter(x=>x.endsWith('.svg')).map(x=>'exercises/'+x);
const files=['index.html','icon.svg','manifest.webmanifest','release.json',...assets,...illustrations];
const hash=createHash('sha256');for(const f of files)hash.update(await readFile(output+'/'+f));
const version='sport-'+hash.digest('hex').slice(0,12);
await writeFile(output+'/sw.js',`const CACHE=${JSON.stringify(version)};const FILES=${JSON.stringify(files.map(f=>'/Sport/'+f))};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('sport-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==location.origin||!u.pathname.startsWith('/Sport/'))return;
if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('/Sport/index.html')));return;}
event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));});`);

