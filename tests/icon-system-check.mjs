import fs from 'node:fs';
const files=['index.html','studynova_writing_vault.html','studynova-auth.js','studynova-realtime.js','writing-drafts.js','service-worker.js','manifest.webmanifest','assets/icons/studynova-icons.css','assets/icons/studynova-icons.js'];
const pictograph=/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
for(const file of files){const source=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');if(pictograph.test(source))throw new Error(`${file}: functional emoji remains`)}
const runtime=fs.readFileSync(new URL('../assets/icons/studynova-icons.js',import.meta.url),'utf8');
if(!runtime.includes('function novaIcon(')||!runtime.includes("customElements.define('sn-icon'"))throw new Error('Shared icon helper/custom element is missing');
for(const page of ['index.html','studynova_writing_vault.html']){const html=fs.readFileSync(new URL('../'+page,import.meta.url),'utf8');if(!html.includes('<sn-icon name="home"')||!html.includes('studynova-icons.js'))throw new Error(`${page}: static SVG icon integration missing`)}
const worker=fs.readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');if(!worker.includes('novalab-pwa-v19')||!worker.includes('studynova-icons.svg'))throw new Error('Icon cache shell/version is stale');
console.log('StudyNova icon source and offline checks passed.');
