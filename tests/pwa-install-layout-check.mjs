import fs from 'node:fs';
const pages=['index.html','studynova_writing_vault.html'];
const check=(condition,message)=>{if(!condition)throw new Error(message)};
for(const page of pages){
  const html=fs.readFileSync(new URL(`../${page}`,import.meta.url),'utf8');
  check(html.includes('id="pwa-install-group"')&&html.includes('id="pwa-install-more"'),`${page}: split install controls missing`);
  check(html.includes('aria-label="Cài đặt NovaLab"'),`${page}: plus button accessible name missing`);
  check(html.includes('.pwa-install-group.show{display:flex}')&&html.includes('gap:8px'),`${page}: responsive flex wrapper missing`);
  check(html.includes('.pwa-install-more{width:46px;min-width:44px'),`${page}: plus button touch target is too small`);
  check(!html.includes('.pwa-install-btn.show{display:flex}'),`${page}: visibility must belong to the wrapper`);
  check(html.includes('installMore.addEventListener("click"'),`${page}: plus button must preserve install behavior`);
}
console.log('PWA install layout regression checks passed.');
