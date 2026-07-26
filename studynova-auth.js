(function () {
  'use strict';

  const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  const PRODUCTION_ORIGIN = 'https://studynovaielts.vercel.app';
  const client = window.SN && window.SN.client;
  let displayName = '';
  let resendTimer = 0;

  const $ = id => document.getElementById(id);
  const passwordMessage = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa và một chữ số.';
  const safeError = error => {
    const value = String(error && (error.code || error.message) || '').toLowerCase();
    if (value.includes('already registered') || value.includes('user_already_exists')) return 'Email đã được đăng ký. Hãy đăng nhập hoặc chọn Quên mật khẩu.';
    if (value.includes('email not confirmed')) return 'Tài khoản chưa xác nhận email. Hãy kiểm tra hộp thư.';
    if (value.includes('invalid login')) return 'Email hoặc mật khẩu không đúng.';
    if (value.includes('rate limit') || value.includes('over_email_send_rate_limit')) return 'Đã gửi quá nhiều email. Vui lòng đợi rồi thử lại.';
    if (value.includes('signup') && value.includes('disabled')) return 'Tính năng tạo tài khoản đang tạm tắt.';
    if (value.includes('invalid email') || value.includes('email_address_invalid')) return 'Địa chỉ email không hợp lệ.';
    if (value.includes('password') && (value.includes('weak') || value.includes('policy'))) return 'Mật khẩu chưa đáp ứng yêu cầu bảo mật.';
    if (value.includes('expired') || value.includes('otp_expired')) return 'Liên kết đặt lại mật khẩu đã hết hạn.';
    if (value.includes('same password') || value.includes('different from the old')) return 'Mật khẩu mới phải khác mật khẩu hiện tại.';
    if (value.includes('recent') || value.includes('reauth')) return 'Vui lòng đăng nhập lại trước khi đổi mật khẩu.';
    if (value.includes('row-level') || value.includes('permission') || value.includes('42501')) return 'Không có quyền truy cập dữ liệu cloud.';
    if (value.includes('fetch') || value.includes('network') || value.includes('failed to fetch')) return 'Không thể kết nối Supabase.';
    return 'Thao tác thất bại. Vui lòng thử lại.';
  };

  function notify(message) {
    const status = $('sn-auth-v2-message');
    if (status) status.textContent = message;
    else alert(message);
  }

  function eye(input) {
    const wrap = document.createElement('span');
    wrap.className = 'sn-password-wrap';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sn-password-eye';
    button.textContent = '👁️';
    button.setAttribute('aria-label', 'Hiện mật khẩu');
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('mousedown', event => event.preventDefault());
    button.addEventListener('click', () => {
      const shown = input.type === 'text';
      input.type = shown ? 'password' : 'text';
      button.setAttribute('aria-label', shown ? 'Hiện mật khẩu' : 'Ẩn mật khẩu');
      button.setAttribute('aria-pressed', String(!shown));
      input.focus();
    });
    wrap.appendChild(button);
  }

  function field(id, label, type, autocomplete) {
    const box = document.createElement('div');
    const lab = document.createElement('label');
    lab.htmlFor = id;
    lab.textContent = label;
    const input = document.createElement('input');
    input.id = id; input.type = type; input.autocomplete = autocomplete;
    box.append(lab, input);
    return { box, input };
  }

  function validate(nameRequired) {
    const password = $('sn-auth-pass').value;
    const confirm = $('sn-auth-confirm').value;
    const failures = [];
    if (password.length < 8) failures.push('Chưa đủ 8 ký tự.');
    if (!/[A-Z]/.test(password)) failures.push('Chưa có chữ hoa.');
    if (!/\d/.test(password)) failures.push('Chưa có chữ số.');
    if (password !== confirm) failures.push('Hai mật khẩu không trùng nhau.');
    const name = $('sn-display-name').value.trim();
    if (nameRequired && (name.length < 2 || name.length > 30)) failures.push('Tên hiển thị phải từ 2–30 ký tự.');
    notify(failures.join(' ') || passwordMessage);
    return !failures.length;
  }

  async function ensureProfile(user, requestedName) {
    if (!client || !user) return;
    const result = await client.from('profiles').select('display_name').eq('user_id', user.id).maybeSingle();
    if (result.error && result.error.code !== 'PGRST116') throw result.error;
    if (result.data) displayName = result.data.display_name;
    else {
      const fallback = (requestedName || (user.email || '').split('@')[0] || 'Người dùng').trim().slice(0, 30);
      const created = await client.from('profiles').insert({ user_id: user.id, display_name: fallback });
      if (created.error) throw created.error;
      displayName = fallback;
    }
    updateAccountUI();
  }

  function updateAccountUI() {
    const user = window.SN && window.SN.user;
    document.querySelectorAll('.sn-top-auth-label, #sn-auth-label').forEach(node => {
      node.textContent = user ? (displayName || 'Tài khoản') : 'Đăng nhập';
      node.title = user ? (displayName || 'Tài khoản') : '';
    });
    if ($('sn-profile-current')) $('sn-profile-current').textContent = displayName || 'Tài khoản';
    if ($('sn-profile-panel')) $('sn-profile-panel').hidden = !user;
  }

  function enhanceModal() {
    const modal = $('sn-auth-modal');
    const grid = modal && modal.querySelector('.sn-auth-grid');
    if (!grid || $('sn-display-name')) return;
    const name = field('sn-display-name', 'Tên hiển thị', 'text', 'name');
    name.input.minLength = 2; name.input.maxLength = 30;
    grid.insertBefore(name.box, grid.firstChild);
    const oldPassword = $('sn-auth-pass');
    oldPassword.placeholder = 'Ít nhất 8 ký tự, có chữ hoa và số';
    oldPassword.autocomplete = 'current-password';
    eye(oldPassword);
    const confirmation = field('sn-auth-confirm', 'Xác nhận mật khẩu', 'password', 'new-password');
    grid.appendChild(confirmation.box); eye(confirmation.input);

    const message = document.createElement('div');
    message.id = 'sn-auth-v2-message'; message.className = 'sn-auth-status';
    message.textContent = passwordMessage;
    grid.after(message);

    const actions = message.nextElementSibling;
    const forgot = document.createElement('button'); forgot.type = 'button'; forgot.className = 'btn btn-default';
    forgot.textContent = 'Quên mật khẩu?'; forgot.onclick = window.snForgotPassword;
    const resend = document.createElement('button'); resend.type = 'button'; resend.id = 'sn-resend-confirm'; resend.className = 'btn btn-default';
    resend.textContent = 'Gửi lại email xác nhận'; resend.onclick = window.snResendConfirmation;
    actions.append(forgot, resend);

    const profile = document.createElement('section'); profile.id = 'sn-profile-panel'; profile.className = 'sn-account-section'; profile.hidden = true;
    profile.innerHTML = '<h3>Hồ sơ</h3><p>Tên hiện tại: <strong id="sn-profile-current"></strong></p><label for="sn-profile-name">Tên mới</label><input id="sn-profile-name" maxlength="30"><button class="btn btn-green" type="button" id="sn-save-profile">Lưu thay đổi</button><h3>Đổi mật khẩu</h3>';
    const changeGrid = document.createElement('div'); changeGrid.className = 'sn-auth-grid';
    const next = field('sn-new-password', 'Mật khẩu mới', 'password', 'new-password');
    const nextConfirm = field('sn-new-password-confirm', 'Xác nhận mật khẩu mới', 'password', 'new-password');
    changeGrid.append(next.box, nextConfirm.box); eye(next.input); eye(nextConfirm.input);
    const change = document.createElement('button'); change.type = 'button'; change.className = 'btn btn-blue'; change.textContent = 'Đổi mật khẩu'; change.onclick = window.snChangePassword;
    profile.append(changeGrid, change); modal.querySelector('.sn-modal-body').append(profile);
    $('sn-save-profile').onclick = window.snSaveDisplayName;
  }

  window.snRegisterEmail = async function () {
    if (!client || !validate(true)) return;
    const email = $('sn-auth-email').value.trim(), password = $('sn-auth-pass').value, name = $('sn-display-name').value.trim();
    try {
      const result = await client.auth.signUp({ email, password, options: { data: { display_name: name } } });
      if (result.error) throw result.error;
      if (result.data.user && result.data.session) await ensureProfile(result.data.user, name);
      notify(result.data.session ? 'Đã tạo tài khoản và đăng nhập.' : 'Đã tạo tài khoản. Hãy kiểm tra email để xác nhận.');
    } catch (error) { notify(safeError(error)); }
  };
  window.snLoginEmail = async function () {
    if (!client) return;
    try { const result = await client.auth.signInWithPassword({ email: $('sn-auth-email').value.trim(), password: $('sn-auth-pass').value }); if (result.error) throw result.error; }
    catch (error) { notify(safeError(error)); }
  };
  window.snLoginFacebook = async function () {
    if (!client) return;
    try { const result = await client.auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo: PRODUCTION_ORIGIN + '/' } }); if (result.error) throw result.error; }
    catch (error) { notify(safeError(error)); }
  };
  window.snForgotPassword = async function () {
    if (!client) return;
    try { await client.auth.resetPasswordForEmail($('sn-auth-email').value.trim(), { redirectTo: PRODUCTION_ORIGIN + '/' }); }
    finally { notify('Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.'); }
  };
  window.snResendConfirmation = async function () {
    if (!client || resendTimer) return;
    const button = $('sn-resend-confirm');
    try { const result = await client.auth.resend({ type: 'signup', email: $('sn-auth-email').value.trim() }); if (result.error) throw result.error; notify('Nếu email hợp lệ, thư xác nhận đã được gửi lại.'); }
    catch (error) { notify(safeError(error)); }
    resendTimer = 30; button.disabled = true;
    const timer = setInterval(() => { resendTimer--; button.textContent = resendTimer ? `Gửi lại sau ${resendTimer}s` : 'Gửi lại email xác nhận'; if (!resendTimer) { clearInterval(timer); button.disabled = false; } }, 1000);
  };
  window.snSaveDisplayName = async function () {
    const name = $('sn-profile-name').value.trim(), user = window.SN && window.SN.user;
    if (!user || name.length < 2 || name.length > 30) return notify('Tên hiển thị phải từ 2–30 ký tự.');
    try { const result = await client.from('profiles').update({ display_name: name, updated_at: new Date().toISOString() }).eq('user_id', user.id); if (result.error) throw result.error; displayName = name; updateAccountUI(); notify('Đã cập nhật tên hiển thị.'); }
    catch (error) { notify(safeError(error)); }
  };
  window.snChangePassword = async function () {
    const password = $('sn-new-password').value, confirmation = $('sn-new-password-confirm').value;
    if (!PASSWORD_RE.test(password)) return notify(passwordMessage);
    if (password !== confirmation) return notify('Hai mật khẩu không trùng nhau.');
    const identities = (window.SN.user && window.SN.user.identities) || [];
    if (identities.length && identities.every(item => item.provider === 'facebook')) return notify('Bạn đang dùng Facebook. Hãy dùng luồng khôi phục email nếu muốn thiết lập mật khẩu mà không ảnh hưởng tài khoản Facebook.');
    try { const result = await client.auth.updateUser({ password }); if (result.error) throw result.error; $('sn-new-password').value = $('sn-new-password-confirm').value = ''; resetPasswordVisibility(); notify('Đổi mật khẩu thành công.'); }
    catch (error) { notify(safeError(error)); }
  };

  function resetPasswordVisibility() {
    document.querySelectorAll('#sn-auth-modal input[type="text"][autocomplete*="password"]').forEach(input => { input.type = 'password'; });
    document.querySelectorAll('.sn-password-eye').forEach(button => { button.setAttribute('aria-label', 'Hiện mật khẩu'); button.setAttribute('aria-pressed', 'false'); });
  }
  const oldClose = window.snCloseAuth;
  window.snCloseAuth = function () { resetPasswordVisibility(); document.querySelectorAll('#sn-auth-modal input[autocomplete*="password"]').forEach(input => { input.value = ''; }); if (oldClose) oldClose(); };

  document.addEventListener('DOMContentLoaded', enhanceModal);
  if (client) client.auth.onAuthStateChange((event, session) => {
    window.SN.user = session && session.user;
    if (event === 'PASSWORD_RECOVERY') { setTimeout(() => { window.snOpenAuth(); enhanceModal(); notify('Hãy đặt mật khẩu mới để hoàn tất khôi phục.'); $('sn-profile-panel').hidden = false; $('sn-new-password').focus(); }, 0); }
    if (session && session.user) ensureProfile(session.user, session.user.user_metadata && session.user.user_metadata.display_name).catch(() => { displayName = 'Tài khoản'; updateAccountUI(); });
    else { displayName = ''; updateAccountUI(); }
  });
})();
