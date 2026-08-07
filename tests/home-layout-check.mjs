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
check(home.includes('class="sn-home-orbit home-goal-progress"') && home.includes('<svg viewBox="0 0 120 120">'), 'Home goal progress must use a compact, normalized SVG.');
check((home.match(/<circle cx="60" cy="60" r="46"/g) || []).length === 2, 'Home goal progress must contain only its track and progress circles.');
check(!home.includes('<ellipse') && !home.includes('transform="rotate('), 'Home goal progress must not contain an oversized orbit.');
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
check(html.includes('font-size:clamp(42px,3.6vw,58px)') && html.includes('letter-spacing:-.035em'), 'Home hero responsive typography is missing.');
check(html.includes('font-size:clamp(32px,2.6vw,38px)') && html.includes('@media(max-width:600px)'), 'Responsive statistic typography is missing.');
check(html.includes('width:clamp(108px,11vw,132px);aspect-ratio:1') && html.includes('place-items:center;overflow:hidden'), 'Home goal wrapper must be square, centered, and clipped.');
check(html.includes('#page-home .sn-home-orbit{width:100px;margin:18px auto 0}'), 'Home goal progress must remain compact on mobile.');
check(worker.includes('novalab-pwa-v24') && worker.includes('novalab-runtime-v24'), 'Service-worker caches must be v23.');
check(!html.includes(['studynova', 'lab.vercel.app'].join('')), 'Legacy production URL remains in Home.');

console.log('Home layout regression checks passed.');
