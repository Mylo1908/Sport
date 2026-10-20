import {copyFile} from 'node:fs/promises';
await copyFile('dist-qa/tests/browser/fixture.html','dist-qa/index.html');
