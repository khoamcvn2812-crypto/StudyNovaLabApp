import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../studynova-auth.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../studynova-auth.css', import.meta.url), 'utf8');
const modal = html.slice(html.indexOf('id="sn-auth-modal"'), html.indexOf('id="sn-ai-modal"'));
const check = (condition, message) => { if (!condition) throw new Error(message); };

check(modal.includes('id="sn-signed-out-view"') && modal.includes('id="sn-signed-in-view" hidden'), 'Signed-out and signed-in states must be separate.');
check(modal.includes('id="sn-login-tab"') && modal.includes('id="sn-register-tab"'), 'Both authentication tabs are required.');
check((modal.match(/class="sn-auth-tab(?: is-active)?"/g) || []).length === 2, 'Both tabs must use the same sn-auth-tab class.');
check(css.includes('font-family:inherit!important') && css.includes('letter-spacing:0!important') && css.includes('text-transform:none!important'), 'Auth tabs must override inherited typography consistently.');
check(js.includes("classList.toggle('is-active',login)") && js.includes("classList.toggle('is-active',!login)"), 'Tab switching must update is-active without changing labels.');
const login = modal.slice(modal.indexOf('id="sn-login-pane"'), modal.indexOf('id="sn-register-pane"'));
const register = modal.slice(modal.indexOf('id="sn-register-pane"'), modal.indexOf('id="sn-recovery-pane"'));
check(!login.includes('Tên hiển thị'), 'Login must not ask for a display name.');
check(register.includes('Tên hiển thị'), 'Registration must ask for a display name.');
check((modal.match(/onclick="snTogglePassword\(this\)"/g) || []).length === 7, 'Every password field must have its own visibility toggle.');
check(modal.includes('Khôi phục mật khẩu') && modal.includes('← Quay lại đăng nhập'), 'Recovery navigation is incomplete.');
check(js.includes('/^(?=.*[A-Z])(?=.*\\d).{8,}$/'), 'Strong-password validation is missing.');
check(js.includes("pass!==confirmPass"), 'Password confirmation validation is missing.');
check(js.includes("out.hidden=showAccount") && js.includes("inside.hidden=!showAccount"), 'Authentication state must exclusively select one view.');
check(js.includes("m.display_name||m.full_name||m.name"), 'Display name must be preferred over email.');
check(js.includes("user.user_metadata") && js.includes("from('profiles')"), 'Profile metadata persistence is missing.');
check(js.includes("options:{data:{display_name:name}}"), 'Signup does not send the display name in Auth metadata.');
check(js.includes("querySelectorAll('#sn-auth-label,.sn-top-auth-label')"), 'Shared display-name rendering is missing for Home or Writing Vault.');
check(js.includes("onConflict:'user_id'"), 'Profiles are not associated by the authenticated user id.');
for (const handler of ['snInspectCloud','snSaveCloud','snLoadCloudSafe','snRestoreSafetyBackup']) check(modal.includes(handler) && js.includes(handler), `${handler} must remain wired.`);
check(html.includes('@media(max-width:520px)') && html.includes('.sn-modal{padding:10px}'), '360px modal overflow protection is missing.');

console.log('Account modal regression checks passed.');
