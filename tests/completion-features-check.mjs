import fs from 'node:fs';
const home=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const vault=fs.readFileSync(new URL('../studynova_writing_vault.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../studynova-motion.css',import.meta.url),'utf8');
const auth=fs.readFileSync(new URL('../studynova-auth.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');
const check=(c,m)=>{if(!c)throw new Error(m)};
for(const [name,html] of [['Home',home],['Writing Vault',vault]]){
 const modal=html.slice(html.indexOf('id="sn-auth-modal"'),html.indexOf('id="sn-ai-modal"'));
 check(modal.includes('id="sn-login-tab"')&&modal.includes('id="sn-register-tab"'),`${name}: auth tabs missing`);
 check(modal.includes('id="sn-settings-pass"')&&modal.includes('snSaveDisplayName()'),`${name}: account settings missing`);
 check(html.includes('studynova-motion.css')&&html.includes('studynova-auth.css')&&html.includes('studynova-auth.js'),`${name}: shared assets missing`);
}
check(home.includes('studynova_backup_reminder_dismissed_at')&&home.includes("backup_dismiss:'Dismiss'"),'Three-day backup dismissal is incomplete');
check(!home.includes("style.display=(total>=S.cfg.thresh)"),'Unlock banner must not override CSS display');
check(css.includes('grid-template-columns:minmax(0,1fr) auto')&&css.includes('prefers-reduced-motion'),'Responsive banner or reduced motion support missing');
check(sw.includes('novalab-pwa-v19')&&sw.includes('./studynova-motion.css')&&sw.includes('./studynova-auth.css')&&sw.includes('./studynova-auth.js')&&sw.includes('./assets/icons/studynova-icons.svg'),'Service worker v19 shell is incomplete');
check(auth.includes('auth.getSession()')&&auth.includes('auth.onAuthStateChange(')&&auth.includes('authSubscription.unsubscribe()'),'Shared session lifecycle is incomplete');
const menu=vault.slice(vault.indexOf('id="wv-top-menu-overlay"'),vault.indexOf('id="wv-primary-nav"'));
check(vault.includes('class="wv-account-trigger"')&&!menu.includes('snOpenAuth()'),'Writing account trigger must be outside Menu');
console.log('Completion feature regression checks passed.');
