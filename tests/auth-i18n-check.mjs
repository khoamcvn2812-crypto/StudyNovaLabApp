import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../english.html', import.meta.url), 'utf8');
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
check(i18n.vi.network_error.includes('máy chủ xác thực'), 'Network errors must identify the authentication flow.');
check(i18n.vi.configuration_error && i18n.en.configuration_error, 'Authentication configuration errors need a dedicated message.');
check(js.includes("window.addEventListener('studynova-language-change',refresh)"), 'Open auth UI must update on the shared language event.');
const updater = js.slice(js.indexOf('function updateAuthLanguage'), js.indexOf('function validEmail'));
check(!updater.includes('.value='), 'Language updates must not replace user-entered values.');
check(updater.includes('data-sn-auth-placeholder') && updater.includes('data-sn-password-toggle'), 'Placeholders and accessible password labels must be translated.');
check(js.includes("busy(b,true,'signing_in')") && js.includes("busy(b,true,'creating_account')"), 'Localized loading states are not wired.');
const classifierSource = js.match(/function classifyAuthError\([\s\S]*?\nfunction authRequestInfo/);
check(classifierSource, 'Structured Supabase error classification is missing.');
const classifyAuthError = vm.runInNewContext(`${classifierSource[0].replace(/\nfunction authRequestInfo$/, '')}; classifyAuthError`, { TypeError });
check(classifyAuthError({code:'invalid_credentials',status:400}) === 'invalid_login', 'Invalid credentials must not be reported as a network error.');
check(classifyAuthError({code:'email_not_confirmed',status:400}) === 'email_unconfirmed', 'Unconfirmed email must have a specific error.');
check(classifyAuthError({code:'over_request_rate_limit',status:429}) === 'rate_limit', 'Rate limits must have a specific error.');
check(classifyAuthError({code:'invalid_api_key',status:401}) === 'configuration_error', 'Invalid Supabase configuration must not be reported as a network error.');
check(classifyAuthError(new TypeError('Failed to fetch')) === 'network_error', 'Only transport failures should use the network message.');
check(classifyAuthError({message:'unexpected parse failure',status:500}) === 'generic_error', 'Unrelated errors must not be mislabeled as network failures.');
check(js.includes("reportAuthError('sign_in_password',e)") && js.includes("operation:operation,url:request.url,method:request.method"), 'Safe sign-in diagnostics are not wired.');
check(!js.includes("console.warn(JSON.stringify({event:'studynova_auth_failure',email"), 'Authentication diagnostics must not contain email.');
check(!modal.includes('auth.sign_in') && !modal.includes('undefined'), 'A raw translation key is visible in the modal.');
check(i18n.vi.profile_load_error && i18n.en.retry_profile, 'Profile-load failures need a separate retryable message.');
check(modal.includes('id="sn-profile-message"') && modal.includes('onclick="snRetryProfile()"'), 'Signed-in profile retry UI is missing.');
check(js.includes("SN.user=r.data.user;authChanged();refresh()"), 'A successful auth response must activate its session without waiting for the profile query.');
check(js.includes("profileMessage(profile.error)") && js.includes("event:'studynova_profile_failure'"), 'Profile failures must be reported separately from auth failures.');
const loginSource=js.slice(js.indexOf('window.snLoginEmail='),js.indexOf(';window.snLoginFacebook'));
check(loginSource.includes('password:pass') && !loginSource.includes('pass.trim'), 'The password must be submitted exactly as entered.');
check(loginSource.includes('finally{busy(b,false)}'), 'The sign-in button must always leave its loading state.');

console.log('Account internationalization regression checks passed.');
