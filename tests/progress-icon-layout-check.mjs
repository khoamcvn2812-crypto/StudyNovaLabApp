import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const check = (condition, message) => {
  if (!condition) throw new Error(message);
};

check(html.includes('#page-dash .stat-card{'), 'Progress card styling must remain scoped to the progress page.');
check(html.includes('grid-template-columns:88px minmax(0,1fr)'), 'Desktop progress icons must use an 88px panel.');
check(html.includes('#page-dash .stat-icon sn-icon{display:block;width:70%;height:70%'), 'Icons must be sized directly to 70% of their panel.');
check(html.includes('grid-template-columns:72px minmax(0,1fr)'), 'Tablet progress icons must use a 72px panel.');
check(html.includes('grid-template-columns:60px minmax(0,1fr)'), 'Mobile progress icons must use a 60px panel.');
check(!/#page-dash[^}]*transform:\s*scale\(/.test(html), 'Progress icons must not use transform scaling.');
check((html.match(/#page-dash \.stat-card:nth-child\(/g) || []).length === 5, 'Every progress KPI must retain its own color treatment.');

console.log('Progress icon layout checks passed.');
