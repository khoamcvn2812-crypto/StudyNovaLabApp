import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const english = read('english.html');
const writing = read('studynova_writing_vault.html');
const chinese = read('chinese/index.html');
const chineseApp = read('chinese/assets/app.js');
const chineseVault = read('chinese/writing-vault.html');
const chineseCss = read('chinese/assets/styles.css');
const check = (condition, message) => { if (!condition) throw new Error(message); };

for (const [name, source] of Object.entries({english, writing, chinese, chineseVault})) {
  check(source.includes('href="/"') && source.includes('data-platform-home'), `${name} needs a native link to the platform home.`);
  check(source.includes('aria-label="Về trang chủ StudyNova"'), `${name} needs a localized accessible name.`);
}
check(english.includes('<span>Tổng quan</span>') && writing.includes('<span>Tổng quan</span>'), 'English learning-area Home labels must be Overview.');
check(chineseApp.includes("vi:{home:'Tổng quan'") && chineseApp.includes("en:{home:'Overview'") && chineseApp.includes("zh:{home:'概览'"), 'Chinese mobile Overview labels must be localized.');
check(chineseVault.includes('<span>Tổng quan</span>'), 'Chinese Writing Vault must call its area home Overview.');
check(chineseApp.includes('window.speechSynthesis?.cancel?.()') && english.includes('window.speechSynthesis.cancel()'), 'Platform exit must stop speech.');
check(chineseApp.includes('preparePlatformExit(){save();') && english.includes("if(typeof save==='function') save()"), 'Platform exit must persist current learning state.');
check(chineseCss.includes('@media(max-width:900px){.platform-home-link{display:inline-flex}') && chineseCss.includes('.mobile-nav{height:'), 'Chinese mobile return link must live above the unchanged learning nav.');
check(!chineseApp.includes('history.back') && !english.includes('history.back'), 'Platform links must never use browser history navigation.');
console.log('Platform return navigation regression checks passed.');
