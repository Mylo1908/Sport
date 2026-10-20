import { defineConfig } from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig(({mode})=>({
 base:'/Sport/',
 ...(mode==='browser-test'?{
  // Synthetic fixtures are a separate build. Production has no auth bypass.
  resolve:{alias:[{find:/^\.\/cloud(?:\.ts)?$/,replacement:fileURLToPath(new URL('./tests/browser/cloud-fixture.ts',import.meta.url))}]},
  build:{outDir:'dist-qa',rolldownOptions:{input:'tests/browser/fixture.html'}}
 }:{}),
}));

