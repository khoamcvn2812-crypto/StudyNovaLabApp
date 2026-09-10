import fs from 'node:fs';
import assert from 'node:assert/strict';

const script = fs.readFileSync('studynova-quick-dictionary.js', 'utf8');
const css = fs.readFileSync('studynova-quick-dictionary.css', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const writing = fs.readFileSync('studynova_writing_vault.html', 'utf8');
const worker = fs.readFileSync('service-worker.js', 'utf8');

assert.match(script, /window\.getSelection\(\)/, 'selection API is used');
assert.match(script, /document\.addEventListener\('mouseup'/, 'desktop selection is supported');
assert.match(script, /document\.addEventListener\('touchend'/, 'touch selection is supported');
assert.match(script, /MAX_LENGTH=80/, 'selection length is capped');
assert.match(script, /input,textarea.*button.*nav.*menu.*code.*pre/, 'editing and navigation controls are excluded');
assert.match(script, /DEBOUNCE_MS=280/, 'lookups are debounced');
assert.match(script, /new AbortController/, 'stale and timed-out requests are cancelled');
assert.match(script, /textContent=/, 'remote values are rendered as text, not HTML');
assert.match(script, /findSaved\(term\)/, 'saved vocabulary is checked first');
assert.match(script, /Từ này đã có trong Sổ từ vựng/, 'duplicate feedback is localized');
assert.match(script, /studynova:prefill-vocabulary/, 'other StudyNova editions can use the prefill adapter');
assert.match(css, /@media\(max-width:600px\)/, 'mobile bottom sheet styles exist');
assert.match(css, /\.light \.sn-dictionary/, 'light mode is supported');
assert.match(index, /studynova-quick-dictionary\.js/, 'IELTS app loads the feature');
assert.match(writing, /studynova-quick-dictionary\.js/, 'Writing Vault loads the feature');
assert.match(worker, /novalab-pwa-v32/, 'PWA cache version was updated');
assert.match(worker, /url\.pathname\.startsWith\("\/api\/dictionary"\)/, 'private lookup responses bypass the service worker cache');

console.log('Quick dictionary checks passed.');
