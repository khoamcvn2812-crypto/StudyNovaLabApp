import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
const home = html.slice(html.indexOf('<div id="page-home"'), html.indexOf('<div id="page-dash"'));
const topbar = html.slice(html.indexOf('<div class="topbar">'), html.indexOf('<div class="sn-top-menu-overlay"'));
const menu = html.slice(html.indexOf('<div class="sn-top-menu-overlay"'), html.indexOf('<nav class="sn-unified-nav"'));

function check(condition, message) {
  if (!condition) throw new Error(message);
}

check(home.indexOf('class="sn-hero"') < home.indexOf('class="sn-home-panel sn-today-v8"'), 'Today must follow the hero in the first Home row.');
check(home.indexOf('id="sn-density-strip"') < home.indexOf('id="sn-recent-heading"'), 'Statistics must precede recent activity in the second Home row.');
check(!home.includes('<div class="sn-module-grid">'), 'The five promotional module cards must not remain on Home.');
check(home.includes('onclick="novaV8StartToday()"'), 'Today Start action is missing.');
check(home.includes('href="studynova_writing_vault.html"'), 'Writing Vault link is missing from the hero.');
check(topbar.includes('class="sn-top-auth"') && topbar.includes('onclick="snOpenAuth()"'), 'Top-bar sign-in action is missing.');
check(!menu.includes('snOpenAuth()'), 'Sign-in must not remain inside the top menu.');
for (const handler of ["goTo('add')", "goTo('reading')", "goTo('speaking')", "goTo('review')", "goTo('test')", "goTo('vocab')"]) {
  check(html.includes(handler), `Required navigation handler is missing: ${handler}`);
}
check(worker.includes('novalab-pwa-v18') && worker.includes('novalab-runtime-v18'), 'Service-worker caches must be v18.');
check(!html.includes(['studynova', 'lab.vercel.app'].join('')), 'Legacy production URL remains in Home.');

console.log('Home layout regression checks passed.');
