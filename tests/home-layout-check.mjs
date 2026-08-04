import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
const home = html.slice(html.indexOf('<div id="page-home"'), html.indexOf('<div id="page-dash"'));
const topbar = html.slice(html.indexOf('<div class="topbar">'), html.indexOf('<div class="sn-top-menu-overlay"'));
const menu = html.slice(html.indexOf('<div class="sn-top-menu-overlay"'), html.indexOf('<nav class="sn-unified-nav"'));

function check(condition, message) {
  if (!condition) throw new Error(message);
}

check(home.indexOf('class="sn-home-hero"') < home.indexOf('class="sn-home-priority'), 'Greeting must precede the priority task.');
check(home.indexOf('class="sn-home-stats"') < home.indexOf('class="sn-home-recent'), 'Four statistics must precede recent activity.');
check((home.match(/class="sn-home-stat /g) || []).length === 4, 'Home must contain exactly four quick statistics.');
check(home.includes('id="sn-home-greeting-title"') && home.includes('id="sn-home-goal-value"'), 'Dynamic greeting and goal progress are missing.');
check(home.includes('onclick="novaV8StartToday()"') && home.includes("onclick=\"goTo('dash')\""), 'Home hero actions are missing.');
check(home.includes('class="sn-recent-list"') && html.includes('sn-recent-empty'), 'Compact recent activity state is missing.');
check(!home.includes('<div class="sn-module-grid">'), 'Promotional module cards must not remain on Home.');
check(topbar.includes('class="sn-top-auth"') && topbar.includes('onclick="snOpenAuth()"'), 'Top-bar sign-in action is missing.');
check(!menu.includes('snOpenAuth()'), 'Sign-in must not remain inside the top menu.');
for (const handler of ["goTo('add')", "goTo('reading')", "goTo('speaking')", "goTo('review')", "goTo('test')", "goTo('vocab')"]) {
  check(html.includes(handler), `Required navigation handler is missing: ${handler}`);
}

check(html.includes('id="page-learn"'), 'Dedicated learning center is missing.');
check(html.includes('onclick="snOpenAddSheet(this)"'), 'Add navigation must open the add sheet.');
check(html.includes('id="sn-add-overlay"') && html.includes('aria-modal="true"'), 'Accessible add sheet is missing.');
check(html.includes('#page-home .sn-home-dashboard{display:grid;grid-template-columns:repeat(12,minmax(0,1fr))'), 'Home must use a 12-column desktop grid.');
check(html.includes('#page-home .sn-home-stats{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr))'), 'Desktop statistics must use four equal columns.');
check(html.includes('font-family:inherit'), 'New controls must inherit the existing font.');
check(worker.includes('novalab-pwa-v22') && worker.includes('novalab-runtime-v22'), 'Service-worker caches must be v22.');
check(!html.includes(['studynova', 'lab.vercel.app'].join('')), 'Legacy production URL remains in Home.');

console.log('Home layout regression checks passed.');
