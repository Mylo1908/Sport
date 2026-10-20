import {test,expect,type Page,type TestInfo} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';

// All data belongs to the separate synthetic build, never to the live account.
const tab=(page:Page,name:string)=>page.getByRole('navigation').getByRole('button',{name,exact:true}).click();
async function boot(page:Page){await page.goto('./');await expect(page.getByRole('heading',{name:'Trainingsübersicht',exact:true})).toBeVisible()}
async function start(page:Page){await tab(page,'Mein Training');await page.locator('.days').getByRole('button',{name:/Mo/}).click();await page.getByRole('button',{name:/^Training starten/}).click();await expect(page.locator('.mobile-workout-card')).toHaveCount(6)}
async function saved(page:Page){await expect(page.locator('.save')).not.toContainText('Speichert');await expect(page.locator('.alert')).toHaveCount(0)}
async function backup(page:Page){await saved(page);await tab(page,'Einstellungen');const event=page.waitForEvent('download');await page.getByRole('button',{name:/JSON-Backup herunterladen/}).click();const file=await (await event).path();return JSON.parse(await readFile(file!,'utf8'))}
async function layout(page:Page,width:number,view:string,info:TestInfo){
 const sizes=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
 expect(sizes.document,view+' horizontal overflow').toBeLessThanOrEqual(sizes.viewport+1);
 if(width<=760){const small=await page.locator('input:visible:not([type=checkbox]),select:visible,textarea:visible').evaluateAll(inputs=>inputs.filter(e=>parseFloat(getComputedStyle(e).fontSize)<16).map(e=>(e as HTMLInputElement).outerHTML));expect(small,view+' inputs below 16px').toEqual([])}
 if(width===390||width===1280)await page.screenshot({path:info.outputPath(`${view}-${width}.png`),fullPage:true});
}

for(const width of [320,375,390,430,768,1024,1280])test(`Responsive views at ${width}px`,async({page},info)=>{
 await page.setViewportSize({width,height:width<768?844:900});await boot(page);await layout(page,width,'dashboard',info);
 for(const name of ['Wochenplan','Verlauf & Statistik','Einstellungen']){await tab(page,name);await layout(page,width,name,info)}
 await tab(page,'Dashboard');await page.getByRole('button',{name:'Tagesdaten bearbeiten',exact:true}).click();await layout(page,width,'journal',info);
 await start(page);await layout(page,width,'workout',info);
 await page.getByRole('button',{name:/Übungen & Sätze ändern/}).click();await layout(page,width,'plan-editor',info);
 await page.getByRole('button',{name:'Änderungen verwerfen',exact:true}).click();
});

test('Workout persists entered values, corrections, RIR, timer and offline resume; backup/import preserves history',async({page,context})=>{
 await boot(page);await start(page);const first=page.locator('.mobile-workout-card').first();
 await expect(first.getByLabel('Gewicht · Satz 1 von 2',{exact:true})).toHaveValue('50');
 await first.getByLabel('Gewicht · Satz 1 von 2',{exact:true}).fill('52,5');
 await first.locator('.set-options summary').first().click();await first.getByLabel('RIR (optional)',{exact:true}).first().fill('2');
 await first.getByRole('button',{name:/Satz abschließen$/}).first().click();
 await expect(first.locator('.compact-set')).toContainText('52,5 kg');await expect(first.locator('.compact-set')).toContainText('RIR 2');
 await first.getByRole('button',{name:'Bearbeiten',exact:true}).first().click();await first.getByLabel('Wiederholungen · Satz 1 von 2',{exact:true}).fill('9');await first.getByRole('button',{name:/Korrektur speichern/}).click();
 await page.getByRole('button',{name:'Timer pausieren',exact:true}).click();await saved(page);await page.getByRole('button',{name:'Pausieren',exact:true}).click();await expect(page.getByRole('heading',{name:'Training pausiert',exact:true})).toBeVisible();
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await context.setOffline(true);await page.reload();await expect(page.getByRole('heading',{name:'Training pausiert',exact:true})).toBeVisible();
 await page.getByRole('button',{name:/^Fortsetzen/}).click();await expect(page.locator('.compact-set').first()).toContainText('52,5 kg × 9');await expect(page.locator('.rest-timer').getByRole('button',{name:'Fortsetzen',exact:true})).toBeVisible();
 await page.locator('.rest-timer').getByRole('button',{name:'Fortsetzen',exact:true}).click();await page.locator('.rest-timer').getByRole('button',{name:'Überspringen',exact:true}).click();
 await context.setOffline(false);await page.getByLabel('Trainingsnotizen',{exact:true}).fill('Synthetic QA note');await saved(page);await page.getByRole('button',{name:/Training beenden/}).click();await page.getByRole('button',{name:'Bestätigen & speichern',exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:'Training gespeichert.'})).toBeVisible();
 const data=await backup(page);expect(data.sessions).toHaveLength(2);expect(data.draft).toBeNull();const latest=data.sessions.find((s:any)=>s.notes==='Synthetic QA note');expect(latest.sets[0]).toMatchObject({weightKg:52.5,reps:9,rir:2,status:'done'});
 await page.getByLabel('JSON-Datei auswählen').setInputFiles({name:'synthetic-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await page.getByRole('button',{name:'Import bestätigen',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'0 Trainingseinheiten importiert'})).toBeVisible();
 expect((await backup(page)).sessions).toHaveLength(2);
});

test('Plan edits and custom exercises survive reload; a today-only edit preserves the template',async({page})=>{
 await boot(page);await tab(page,'Wochenplan');await page.getByRole('button',{name:/Trainingsplan bearbeiten/}).click();
 await page.locator('.plan-editor .days').getByRole('button',{name:/Mo/}).click();
 await page.getByText('Eigene Übung erstellen',{exact:true}).click();await page.getByLabel('Name',{exact:true}).fill('QA Kabelübung');await page.getByLabel('Gerät',{exact:true}).last().fill('QA Kabelzug');await page.getByLabel('Muskelgruppe',{exact:true}).last().fill('Rücken');await page.getByRole('button',{name:'Übung erstellen und hinzufügen',exact:true}).click();
 await page.locator('.editor-exercise').first().getByRole('button',{name:'+ Aufwärmsatz',exact:true}).click();await page.getByRole('button',{name:'Änderungen speichern',exact:true}).click();await saved(page);await page.reload();
 const original=await backup(page);expect(original.catalog.some((e:any)=>e.name==='QA Kabelübung')).toBe(true);const custom=original.catalog.find((e:any)=>e.name==='QA Kabelübung');expect(original.plan.weekDays[0].exerciseIds).toContain(custom.id);
 await tab(page,'Mein Training');await page.locator('.days').getByRole('button',{name:/Mo/}).click();await page.getByRole('button',{name:/^Training starten/}).click();
 await expect(page.locator('.mobile-workout-card')).toHaveCount(7);await page.getByRole('button',{name:/Übungen & Sätze ändern/}).click();await page.locator('.editor-exercise').filter({has:page.getByRole('heading',{name:'QA Kabelübung',exact:true})}).getByRole('button',{name:'Entfernen',exact:true}).click();await page.getByRole('button',{name:'Änderungen speichern',exact:true}).click();
 const result=await backup(page);expect(result.plan.weekDays[0].exerciseIds).toContain(custom.id);expect(result.draft.sets.some((s:any)=>s.exerciseId===custom.id)).toBe(false);expect(result.draft.sets.some((s:any)=>s.kind==='warmup')).toBe(true);
});

test('Journal and optional profile autosave valid decimal values and preserve unknowns',async({page})=>{
 await boot(page);await page.getByRole('button',{name:'Tagesdaten bearbeiten',exact:true}).click();await page.getByLabel('Datum',{exact:true}).fill('2025-12-20');
 await page.getByLabel('Schritte · Tagesziel 10.000',{exact:true}).fill('1234,5');await expect(page.getByLabel('Schritte · Tagesziel 10.000',{exact:true})).toHaveAttribute('aria-invalid','true');await page.getByLabel('Schritte · Tagesziel 10.000',{exact:true}).fill('1235');
 await page.getByLabel('Körpergewicht kg',{exact:true}).fill('78,5');await page.getByLabel('Laufstrecke km',{exact:true}).fill('3,2');await page.getByLabel('Laufdauer min',{exact:true}).fill('22');await page.getByLabel('Basketball min',{exact:true}).fill('0');await page.getByLabel('Schlafdauer h',{exact:true}).fill('7,5');
 for(const [name,minutes] of [['Rad','15'],['Gehen','10']]){await page.getByRole('button',{name:'Aktivität hinzufügen',exact:true}).click();const a=page.locator('.journal-activity').last();await a.getByLabel('Aktivität',{exact:true}).fill(name);await a.getByLabel('Dauer min',{exact:true}).fill(minutes)}
 await page.getByLabel('Tagesnotizen',{exact:true}).fill('Synthetic journal');await saved(page);await page.reload();await tab(page,'Einstellungen');await page.getByText('Mein Profil · freiwillige Angaben',{exact:true}).click();await page.getByLabel('Anzeigename',{exact:true}).fill('QA Profile');await page.getByLabel('Körpergröße cm',{exact:true}).fill('178,5');
 const data=await backup(page);expect(data.profile).toMatchObject({displayName:'QA Profile',heightCm:178.5,startingWeightKg:null});expect(data.journal['2025-12-20']).toMatchObject({steps:1235,bodyWeightKg:78.5,runningKm:3.2,basketballMinutes:0,sleepHours:7.5,notes:'Synthetic journal'});expect(data.journal['2025-12-20'].activities).toHaveLength(2);
});

test('Cloud status is immediate offline, conflicts require a choice and both versions are archived',async({page,context})=>{
 await boot(page);await tab(page,'Einstellungen');const status=page.locator('.cloud-panel strong[role=status]');await expect(status).toHaveText('Cloud aktuell');
 await context.setOffline(true);await expect(status).toContainText('Offline');await page.getByText('Mein Profil · freiwillige Angaben',{exact:true}).click();await page.getByLabel('Anzeigename',{exact:true}).fill('Local offline');await saved(page);await context.setOffline(false);await expect(status).toHaveText('Cloud aktuell');
 const data=await backup(page);await page.getByLabel('Anzeigename',{exact:true}).fill('Local conflict');await saved(page);await expect(status).toContainText('vorgemerkt');
 await page.evaluate(profile=>(window as any).qaRemote('settings/profile',{...profile,displayName:'Remote conflict'}),data.profile);await page.getByRole('button',{name:'Jetzt synchronisieren',exact:true}).click();await expect(page.getByRole('heading',{name:'Konflikt: settings/profile',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Aktuelle lokale Version behalten',exact:true}).click();await expect(status).toHaveText('Cloud aktuell');const recovered=await backup(page);expect(recovered.profile.displayName).toBe('Local conflict');expect(recovered.cloudRecovery.archives).toHaveLength(1);expect(recovered.cloudRecovery.archives[0].remote.payload).toContain('Remote conflict');
});

test('One editing tab protects the draft; the other can resume after release',async({page,context})=>{
 await boot(page);await start(page);await page.getByLabel('Trainingsnotizen',{exact:true}).fill('Cross-tab synthetic draft');await saved(page);
 const second=await context.newPage();await second.goto('./');await expect(second.getByText(/bereits in einem anderen Tab/)).toBeVisible();await expect(second.locator('.mobile-workout-card')).toHaveCount(0);
 await page.close();await second.getByRole('button',{name:'Erneut prüfen',exact:true}).click();await expect(second.getByRole('heading',{name:'Training pausiert',exact:true})).toBeVisible();await second.getByRole('button',{name:/^Fortsetzen/}).click();await expect(second.getByLabel('Trainingsnotizen',{exact:true})).toHaveValue('Cross-tab synthetic draft');
});

test('Illustration preview, own-photo priority, deletion and all eleven SVGs load',async({page})=>{
 await boot(page);await tab(page,'Wochenplan');await page.locator('.days').getByRole('button',{name:/Mo/}).click();const card=page.locator('.exercise').first();
 await card.getByRole('button',{name:/Bild vergrößern/}).click();await expect(card.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(card.getByRole('dialog')).not.toBeVisible();
 await card.getByText('Gerätefoto verwalten',{exact:true}).click();await card.getByLabel('Eigenes Foto',{exact:true}).setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')});await expect(card.locator('.equipment-preview img')).toHaveAttribute('src',/^data:image\/png/);await card.getByRole('button',{name:'Eigenes Foto entfernen',exact:true}).click();await expect(card.locator('.equipment-preview img')).toHaveAttribute('src',/smith-incline\.svg$/);
 const names=['smith-incline','pec-deck','cable-tower','pullover','row-machine','leg-press','leg-extension','lying-leg-curl','dumbbells-bench','barbell','cable-ankle'];
 const images=await page.evaluate(names=>Promise.all(names.map(name=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve({name,width:img.naturalWidth,height:img.naturalHeight});img.onerror=()=>resolve({name,error:true});img.src='/Sport/exercises/'+name+'.svg'}))),names);expect(images).toEqual(names.map(name=>({name,width:460,height:360})));
});

test('Anonymous admin stays locked, login fields are labelled and accessible',async({page})=>{
 await page.goto('./?login=1#/admin');await expect(page.getByRole('heading',{name:'Sport · Privater Account',exact:true})).toBeVisible();await expect(page.getByLabel('E-Mail',{exact:true})).toBeVisible();await expect(page.getByLabel('Passwort',{exact:true})).toBeVisible();await expect(page.getByText('Private Administration',{exact:true})).toHaveCount(0);
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
});

test('Automated accessibility checks on core views and a narrow reflow equivalent to 200% zoom',async({page})=>{
 await page.setViewportSize({width:640,height:900});await boot(page);
 for(const name of ['Dashboard','Wochenplan','Verlauf & Statistik','Einstellungen']){await tab(page,name);const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),name).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(641)}
});
