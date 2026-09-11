import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync('shared/learning-system.css','utf8');
for(const token of ['--sn-space-4','--sn-radius-lg','--sn-shadow-card','--sn-accent-hover','--sn-accent-soft','--sn-on-accent','--sn-focus-ring','--sn-success','--sn-error','--sn-warning','--sn-info'])assert.ok(css.includes(token),`missing shared token ${token}`);
for(const [file,space,path] of [['english.html','english','shared/learning-system.css'],['studynova_writing_vault.html','english','shared/learning-system.css'],['chinese/index.html','chinese','../shared/learning-system.css'],['chinese/writing-vault.html','chinese','../shared/learning-system.css']]){const html=fs.readFileSync(file,'utf8');assert.ok(html.includes(`data-learning-space="${space}"`),`${file} missing learning-space scope`);assert.ok(html.includes(path),`${file} missing shared UI layer`)}
const chinese=fs.readFileSync('chinese/assets/app.js','utf8');assert.match(chinese,/localStorage\.getItem\('novalab_theme_v1'\)/);assert.match(chinese,/localStorage\.setItem\('novalab_theme_v1',theme\)/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css,/@media\(max-width:340px\)/);
console.log('Shared learning tokens, space identity, theme persistence, and responsive guards passed.');
