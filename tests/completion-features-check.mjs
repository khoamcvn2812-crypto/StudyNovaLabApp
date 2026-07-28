import fs from 'node:fs';
const home=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const vault=fs.readFileSync(new URL('../studynova_writing_vault.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../studynova-motion.css',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');
const check=(c,m)=>{if(!c)throw new Error(m)};
for(const [name,html] of [['Home',home],['Writing Vault',vault]]){
 const modal=html.slice(html.indexOf('id="sn-auth-modal"'),html.indexOf('id="sn-ai-modal"'));
 check(modal.includes('id="sn-login-tab"')&&modal.includes('id="sn-register-tab"'),`${name}: auth tabs missing`);
 check(modal.includes('id="sn-settings-pass"')&&modal.includes('snSaveDisplayName()'),`${name}: account settings missing`);
 check(html.includes('studynova-motion.css'),`${name}: shared motion stylesheet missing`);
}
check(home.includes('studynova_backup_reminder_dismissed_at')&&home.includes("backup_dismiss:'Dismiss'"),'Three-day backup dismissal is incomplete');
check(!home.includes("style.display=(total>=S.cfg.thresh)"),'Unlock banner must not override CSS display');
check(css.includes('grid-template-columns:minmax(0,1fr) auto')&&css.includes('prefers-reduced-motion'),'Responsive banner or reduced motion support missing');
check(sw.includes('novalab-pwa-v14')&&sw.includes('./studynova-motion.css'),'Service worker v14 shell is incomplete');
console.log('Completion feature regression checks passed.');
