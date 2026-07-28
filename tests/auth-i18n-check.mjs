import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../studynova-auth.js', import.meta.url), 'utf8');
const modal = html.slice(html.indexOf('id="sn-auth-modal"'), html.indexOf('id="sn-ai-modal"'));
const literal = js.match(/var SN_AUTH_I18N=(\{[\s\S]*?\})\nfunction getCurrentStudyNovaLanguage/);
if (!literal) throw new Error('SN_AUTH_I18N dictionary is missing.');
const i18n = vm.runInNewContext(`(${literal[1]})`);
const check = (value, message) => { if (!value) throw new Error(message); };

for (const language of ['vi', 'en']) {
  for (const key of modal.matchAll(/data-sn-auth(?:-placeholder|-aria)?="([^"]+)"/g)) {
    check(i18n[language][key[1]], `Missing ${language} auth translation: ${key[1]}`);
  }
}
for (const key of ['sign_in_tab','create_account_tab','forgot_password','display_name','show_password','hide_password','signing_in','creating_account','welcome','local_data','cloud_data','account_settings','sign_out']) {
  check(i18n.vi[key] && i18n.en[key] && i18n.vi[key] !== i18n.en[key], `Bilingual term is incomplete: ${key}`);
}
check(i18n.vi.sign_in === 'Đăng nhập' && i18n.en.sign_in === 'Sign in', 'Sign-in terminology is inconsistent.');
check(i18n.en.invalid_login === 'The email or password is incorrect.', 'English Supabase login error is incorrect.');
check(i18n.vi.invalid_login === 'Email hoặc mật khẩu không chính xác.', 'Vietnamese Supabase login error is incorrect.');
check(js.includes("window.addEventListener('studynova-language-change',refresh)"), 'Open auth UI must update on the shared language event.');
const updater = js.slice(js.indexOf('function updateAuthLanguage'), js.indexOf('function validEmail'));
check(!updater.includes('.value='), 'Language updates must not replace user-entered values.');
check(updater.includes('data-sn-auth-placeholder') && updater.includes('data-sn-password-toggle'), 'Placeholders and accessible password labels must be translated.');
check(js.includes("busy(b,true,'signing_in')") && js.includes("busy(b,true,'creating_account')"), 'Localized loading states are not wired.');
check(!modal.includes('auth.sign_in') && !modal.includes('undefined'), 'A raw translation key is visible in the modal.');

console.log('Account internationalization regression checks passed.');
