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
check(topbar.includes('id="pwa-install-group"') && topbar.includes('class="sn-header-add"') && topbar.includes('onclick="snOpenAddSheet(this)"'), 'Install and add controls must be in the top bar.');
check(topbar.includes('class="sn-top-auth"') && topbar.includes('onclick="snOpenAuth()"'), 'Top-bar sign-in action is missing.');
check(!menu.includes('snOpenAuth()'), 'Sign-in must not remain inside the top menu.');
for (const handler of ["goTo('add')", "goTo('reading')", "goTo('speaking')", "goTo('review')", "goTo('test')", "goTo('vocab')"]) {
  check(html.includes(handler), `Required navigation handler is missing: ${handler}`);
}

check(html.includes('class="sn-sidebar-brand"') && html.includes('@media(min-width:1024px)') && html.includes('grid-template-columns:clamp(220px,17vw,var(--sidebar-width)) minmax(0,1fr)'), 'Responsive desktop grid shell is missing.');
check(html.includes('position:sticky;top:20px') && html.includes('left:auto;right:auto;bottom:auto;transform:none'), 'Desktop sidebar must be sticky without fixed-position offsets.');
const desktopShell = html.slice(html.indexOf('@media(min-width:1024px)'), html.indexOf('@media(max-width:1023px)'));
check(!desktopShell.includes('position:fixed') && !desktopShell.includes('margin-left') && !desktopShell.includes('100vw'), 'Desktop shell must not mix grid with fixed offsets or viewport widths.');
check(!html.includes('#app{max-width:1460px') && !html.includes('#app{width:min(100%,1500px)'), 'A legacy centered app-width limiter remains.');
check(!html.includes('html,body{width:100%;min-height:100%;max-width:100%;overflow-x:hidden}'), 'Root overflow must not hide layout defects.');
check(html.includes('#app>:not(.sn-primary-nav){grid-column:2;min-width:0;max-width:none}'), 'Main children must occupy the non-overlapping grid column.');
check(html.includes('.topbar>.sn-logo-home{display:none}') && html.includes('@media(max-width:1023px){#app{display:block}'), 'Desktop and mobile brand visibility rules are missing.');
check(html.includes('--primary:#10d4a0') && html.includes('--secondary:#60a5fa') && html.includes('--accent:#a78bfa'), 'IELTS semantic design tokens are missing.');
check(html.includes('env(safe-area-inset-bottom)') && html.includes('@media(max-width:760px)'), 'Mobile safe-area handling is missing.');
check(html.includes('id="page-learn"'), 'Dedicated learning center is missing.');
check(html.includes('onclick="snOpenAddSheet(this)"'), 'Add navigation must open the add sheet.');
check(html.includes('id="sn-add-overlay"') && html.includes('aria-modal="true"'), 'Accessible add sheet is missing.');
check(html.includes('grid-template-columns:minmax(0,2fr) minmax(320px,1fr)'), 'Home must use the balanced two-column desktop grid.');
check(html.includes('#page-home .sn-home-stats{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr))'), 'Desktop statistics must use four equal columns.');
check(html.includes('font-family:inherit'), 'New controls must inherit the existing font.');
check(html.includes('font-size:clamp(42px,3.6vw,58px)') && html.includes('letter-spacing:-.035em'), 'Home hero responsive typography is missing.');
check(html.includes('font-size:clamp(32px,2.6vw,38px)') && html.includes('@media(max-width:600px)'), 'Responsive statistic typography is missing.');
check(html.includes('width:clamp(108px,11vw,132px);aspect-ratio:1') && html.includes('place-items:center;overflow:hidden'), 'Home goal wrapper must be square, centered, and clipped.');
check(html.includes('#page-home .sn-home-orbit{width:100px;margin:18px auto 0}'), 'Home goal progress must remain compact on mobile.');
check(worker.includes('novalab-pwa-v28') && worker.includes('novalab-runtime-v28'), 'Service-worker caches must be v28.');
check(!html.includes(['studynova', 'lab.vercel.app'].join('')), 'Legacy production URL remains in Home.');

console.log('Home layout regression checks passed.');
