import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser',testMatch:'*.spec.ts',fullyParallel:true,forbidOnly:!!process.env.CI,
 retries:0,workers:2,timeout:45000,expect:{timeout:10000},
 reporter:[['list'],['html',{open:'never'}]],
 use:{baseURL:'http://127.0.0.1:5173/Sport/',viewport:{width:390,height:844},locale:'de-DE',timezoneId:'Europe/Berlin',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[{name:'chromium',use:{browserName:'chromium'}},{name:'webkit',use:{browserName:'webkit'}}],
 webServer:{command:'vite preview --outDir dist-qa --host 127.0.0.1 --port 5173 --strictPort',url:'http://127.0.0.1:5173/Sport/',reuseExistingServer:!process.env.CI},
});
