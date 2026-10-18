import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {exerciseImages,imageSource,standardImage} from '../src/exercise-images.ts';
const plan=JSON.parse(readFileSync(new URL('../src/plan.json',import.meta.url),'utf8'));
test('All 21 exercises have appropriate existing original SVGs, 11 device types',()=>{
 assert.equal(Object.keys(exerciseImages).length,21);assert.equal(new Set(Object.values(exerciseImages)).size,11);
 for(const e of plan.exerciseCatalog){const path=new URL('../public/exercises/'+exerciseImages[e.id]+'.svg',import.meta.url);assert.ok(existsSync(path),e.id);const svg=readFileSync(path,'utf8');assert.ok(svg.includes('viewBox="0 0 460 360"'));assert.ok(!/<text|<script|<image|https?:/.test(svg.replace('http://www.w3.org/2000/svg','')))}
 assert.equal(exerciseImages.romanian_deadlift,'barbell');assert.equal(exerciseImages.single_leg_adduction,'cable-ankle');assert.equal(exerciseImages.lying_leg_curl,'lying-leg-curl');assert.equal(exerciseImages.calf_raise_leg_press,'leg-press');
});
test('Own photos win; missing photos revert to illustration; neutral fallback only after failure',()=>{
 const id='pec_deck',base='/Sport/',photo='data:image/png;base64,example';const standard=standardImage(id,base);
 assert.equal(imageSource(id,base,photo,[]),photo);assert.equal(imageSource(id,base,undefined,[]),standard);assert.equal(imageSource(id,base,photo,[photo]),standard);assert.equal(imageSource(id,base,photo,[photo,standard]),null);assert.equal(imageSource(id,base,undefined,[standard]),null);
});
