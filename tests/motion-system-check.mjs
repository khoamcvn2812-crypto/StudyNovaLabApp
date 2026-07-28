import fs from 'node:fs';

const css = fs.readFileSync(new URL('../studynova-motion.css', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../studynova-motion.js', import.meta.url), 'utf8');
const home = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const writing = fs.readFileSync(new URL('../studynova_writing_vault.html', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
function check(value, message) { if (!value) throw new Error(message); }

for (const token of ['--sn-bg:', '--sn-primary:', '--sn-secondary:', '--sn-writing:', '--sn-success:', '--sn-warning:', '--sn-danger:', '--sn-focus:']) check(css.includes(token), `Missing colour token ${token}`);
check(css.includes('.sn-btn-motion:active') && css.includes('scale(.97)'), 'Button press motion is missing.');
check(css.includes('.sn-reveal') && css.includes('.is-visible'), 'Reveal fallback styles are missing.');
check(css.includes('prefers-reduced-motion:reduce'), 'Reduced-motion support is missing.');
check(css.includes(':focus-visible') && css.includes('var(--sn-focus)'), 'Keyboard focus treatment is missing.');
check(js.includes('new IntersectionObserver') && js.includes('observer.unobserve'), 'Shared, one-shot reveal observer is missing.');
check(js.includes("document.addEventListener('visibilitychange'"), 'Hidden-document motion handling is missing.');
check(js.includes("input[type=\"password\"]") && js.includes("input.value=''"), 'Passwords are not cleared when a modal closes.');
check(home.includes('studynova-motion.css') && home.includes('studynova-motion.js'), 'Home does not load motion assets.');
check(writing.includes('studynova-motion.css') && writing.includes('studynova-motion.js'), 'Writing Vault does not load motion assets.');
check(worker.includes('studynova-motion.css') && worker.includes('studynova-motion.js'), 'Motion assets are not in the PWA shell.');
console.log('Motion system regression checks passed.');
