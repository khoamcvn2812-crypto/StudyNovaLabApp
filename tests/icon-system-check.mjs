import fs from 'node:fs';
const files=['index.html','studynova_writing_vault.html','studynova-auth.js','studynova-realtime.js','writing-drafts.js','service-worker.js','manifest.webmanifest','assets/icons/studynova-icons.css','assets/icons/studynova-icons.js'];
const pictograph=/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
for(const file of files){const source=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');if(pictograph.test(source))throw new Error(`${file}: functional emoji remains`)}
const runtime=fs.readFileSync(new URL('../assets/icons/studynova-icons.js',import.meta.url),'utf8');
if(!runtime.includes('function novaIcon(')||!runtime.includes("customElements.define('sn-icon'"))throw new Error('Shared icon helper/custom element is missing');
for(const page of ['index.html','studynova_writing_vault.html']){const html=fs.readFileSync(new URL('../'+page,import.meta.url),'utf8');if(!html.includes('<sn-icon name="home"')||!html.includes('studynova-icons.js'))throw new Error(`${page}: static SVG icon integration missing`)}
const worker=fs.readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');if(!worker.includes('novalab-pwa-v24')||!worker.includes('studynova-icons.svg'))throw new Error('Icon cache shell/version is stale');
const home=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const todaySource=home.slice(home.indexOf('function todayTask()'),home.indexOf('window.novaV8StartToday'));
if(/icon:'<sn-icon/.test(todaySource))throw new Error('Dynamic task models must store icon names, not HTML markup');
if(/icon\.textContent\s*=\s*V8_TODAY_TASK\.icon/.test(home))throw new Error('Today icon markup is being escaped through textContent');
if(!home.includes("novaSetIcon(icon,V8_TODAY_TASK.icon,'sn-icon--large')"))throw new Error('Priority task icon is not rendered with the shared helper');
if(!home.includes('grid.replaceChildren()')||!home.includes('title.textContent=task.title'))throw new Error('Today Center cards must use safe DOM construction');
const vault=fs.readFileSync(new URL('../studynova_writing_vault.html',import.meta.url),'utf8');
if(/icon:'<sn-icon/.test(vault.slice(vault.indexOf('function searchItems(query)'),vault.indexOf('function filtered()'))))throw new Error('Writing search models must store icon names');
if(!home.includes("novaIcon(item.icon)")||!vault.includes("novaIcon(item.icon)"))throw new Error('Dynamic search icons must use the shared helper');
console.log('StudyNova icon source, dynamic task, search, and offline checks passed.');
