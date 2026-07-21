(function () {
  "use strict";

  var URL = "https://mamxrfcelttluvlonvsqx.supabase.co";
  var PUBLISHABLE_KEY = "sb_publishable_c6fDpnw-f8t7xnFMlsLHZA_hMi-Wwp1";
  var VOCAB_KEY = "vocabmaster_data_v1";
  var WRITING_KEY = "writingvault_data_v1";
  var LANG_KEY = "novalab_language_v1";
  var DEVICE_KEY = "novalab_device_id_v1";
  var BACKUP_KEY = "novalab_safety_backup_v1";
  var META_KEY = "novalab_supabase_sync_meta_v1";
  var client = window.supabase && window.supabase.createClient(URL, PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  window.SN = window.SN || {};
  Object.assign(window.SN, { ready: !!client, client: client, user: null, cloudBusy: false });

  var copy = {
    vi: {
      signedOut: "Chưa đăng nhập. Dữ liệu vẫn được lưu trên thiết bị.", signedIn: "Đã đăng nhập: {email}",
      account: "👤 Tài khoản và đồng bộ", device: "Dữ liệu máy", cloud: "Dữ liệu cloud",
      lastSync: "Đồng bộ gần nhất", backup: "Safety backup gần nhất", none: "Chưa có", checking: "Chưa kiểm tra",
      compare: "🔍 So sánh", upload: "☁️ Giữ bản máy → Cloud", download: "⬇ Giữ bản Cloud",
      merge: "🔀 Gộp hai bản", restore: "↩ Khôi phục safety backup", create: "Tạo tài khoản",
      login: "Đăng nhập Email", facebook: "Tiếp tục với Facebook", local: "Dùng local", logout: "Đăng xuất",
      password: "Mật khẩu", passwordHint: "Tối thiểu 8 ký tự, gồm chữ hoa và số", email: "Email",
      offline: "Không có kết nối mạng.", needLogin: "Vui lòng đăng nhập để dùng đồng bộ cloud.",
      noCloud: "Chưa có dữ liệu cloud. Dữ liệu máy được giữ nguyên.", badCloud: "Dữ liệu cloud không hợp lệ. Không có dữ liệu nào bị thay đổi.",
      backupFail: "Không thể tạo safety backup. Có thể localStorage đã đầy.", confirm: "Trước khi tiếp tục, web sẽ tạo backup cục bộ. Không tự động ghi đè dữ liệu. Tiếp tục?",
      uploaded: "Đồng bộ thành công.", loaded: "Đã khôi phục bản cloud.", restored: "Đã khôi phục safety backup.",
      noBackup: "Chưa có safety backup để khôi phục.", confirmEmail: "Tài khoản đã được tạo. Hãy xác nhận email trước khi đăng nhập.",
      created: "Tài khoản đã được tạo và đăng nhập.", logging: "Đang xử lý...", newerLocal: "Dữ liệu máy mới hơn",
      newerCloud: "Dữ liệu cloud mới hơn", same: "Hai bản giống nhau", cloudMissing: "Chưa có dữ liệu cloud",
      invalid: "Email hoặc mật khẩu không đúng.", unconfirmed: "Email chưa được xác nhận.", exists: "Email này đã được đăng ký.",
      weak: "Mật khẩu cần ít nhất 8 ký tự, có chữ hoa và số.", network: "Không thể kết nối Supabase. Hãy kiểm tra mạng.",
      permission: "Supabase từ chối truy cập. Hãy kiểm tra RLS cho user_app_data.", oauth: "Đăng nhập Facebook chưa được cấu hình đầy đủ trên Supabase hoặc Meta.",
      generic: "Thao tác thất bại. Vui lòng thử lại.", mergeReport: "Đã gộp: {vocab} từ, {essays} bài, {mistakes} lỗi; xử lý {duplicates} mục trùng."
    },
    en: {
      signedOut: "Not signed in. Data remains on this device.", signedIn: "Signed in: {email}", account: "👤 Account and sync",
      device: "Device data", cloud: "Cloud data", lastSync: "Last sync", backup: "Latest safety backup", none: "None yet", checking: "Not checked",
      compare: "🔍 Compare", upload: "☁️ Keep device copy → Cloud", download: "⬇ Keep cloud copy", merge: "🔀 Merge both copies",
      restore: "↩ Restore safety backup", create: "Create account", login: "Sign in with email", facebook: "Continue with Facebook",
      local: "Use locally", logout: "Sign out", password: "Password", passwordHint: "At least 8 characters, including an uppercase letter and a number", email: "Email",
      offline: "No internet connection.", needLogin: "Please sign in to use cloud sync.", noCloud: "No cloud data. Device data was left unchanged.",
      badCloud: "Cloud data is invalid. No data was changed.", backupFail: "Safety backup could not be created. localStorage may be full.",
      confirm: "A local backup will be created before continuing. Data will not be overwritten automatically. Continue?", uploaded: "Sync completed.",
      loaded: "Cloud data restored.", restored: "Safety backup restored.", noBackup: "There is no safety backup to restore.",
      confirmEmail: "Account created. Confirm your email before signing in.", created: "Account created and signed in.", logging: "Working...",
      newerLocal: "Device data is newer", newerCloud: "Cloud data is newer", same: "Both copies are identical", cloudMissing: "No cloud data",
      invalid: "Incorrect email or password.", unconfirmed: "Your email has not been confirmed.", exists: "This email is already registered.",
      weak: "Use at least 8 characters with an uppercase letter and a number.", network: "Supabase could not be reached. Check your connection.",
      permission: "Supabase denied access. Check RLS for user_app_data.", oauth: "Facebook sign-in is not fully configured in Supabase or Meta.",
      generic: "The operation failed. Please try again.", mergeReport: "Merged {vocab} words, {essays} essays and {mistakes} mistakes; handled {duplicates} duplicates."
    }
  };
  function lang() { return localStorage.getItem(LANG_KEY) === "en" ? "en" : "vi"; }
  function tr(key, vars) { var s = copy[lang()][key] || key; Object.keys(vars || {}).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); }); return s; }
  function alertFriendly(key) { window.alert(tr(key)); }
  function parse(key) { var raw = localStorage.getItem(key); if (!raw) return {}; var value = JSON.parse(raw); return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
  function deviceId() { var id = localStorage.getItem(DEVICE_KEY); if (!id) { id = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)); localStorage.setItem(DEVICE_KEY, id); } return id; }
  function collect() { return { schemaVersion: 1, vocabulary: parse(VOCAB_KEY), writingVault: parse(WRITING_KEY), settings: { language: lang() }, savedAt: new Date().toISOString(), deviceId: deviceId() }; }
  function valid(data) { return data && typeof data === "object" && !Array.isArray(data) && data.schemaVersion === 1 && data.vocabulary && data.writingVault; }
  function counts(data) { var v = (data && data.vocabulary) || {}, w = (data && data.writingVault) || {}; return { vocab: Array.isArray(v.words) ? v.words.length : 0, essays: Array.isArray(w.essays) ? w.essays.length : 0, mistakes: (Array.isArray(v.mistakes) ? v.mistakes.length : 0) + (Array.isArray(w.corrections) ? w.corrections.length : 0) }; }
  function summary(data) { var c = counts(data); return c.vocab + (lang() === "vi" ? " từ · " : " words · ") + c.essays + (lang() === "vi" ? " bài · " : " essays · ") + c.mistakes + (lang() === "vi" ? " lỗi" : " mistakes"); }
  function formatTime(value) { if (!value) return tr("none"); var d = new Date(value); return isNaN(d.getTime()) ? tr("none") : d.toLocaleString(lang() === "vi" ? "vi-VN" : "en-US"); }
  function meta() { try { return parse(META_KEY); } catch (_) { return {}; } }
  function setMeta(patch) { var value = Object.assign(meta(), patch); localStorage.setItem(META_KEY, JSON.stringify(value)); return value; }
  function backup(operation) { var value = { timestamp: new Date().toISOString(), operation: operation, appData: collect() }; localStorage.setItem(BACKUP_KEY, JSON.stringify(value)); setMeta({ backupAt: value.timestamp }); refreshUI(); return value; }
  function requireCloud() { if (!navigator.onLine) { alertFriendly("offline"); return false; } if (!SN.user) { alertFriendly("needLogin"); return false; } return true; }
  function errorKey(error, oauth) { var text = String(error && (error.message || error.code) || "").toLowerCase(); if (oauth) return "oauth"; if (text.includes("invalid login")) return "invalid"; if (text.includes("not confirmed")) return "unconfirmed"; if (text.includes("already registered") || text.includes("already been registered")) return "exists"; if (text.includes("password")) return "weak"; if (text.includes("row-level") || text.includes("permission") || text.includes("policy") || error && error.code === "42501") return "permission"; if (text.includes("fetch") || text.includes("network")) return "network"; return "generic"; }
  function setBusy(button, busy) { if (!button) return; if (busy) { button.dataset.oldText = button.textContent; button.textContent = tr("logging"); } else if (button.dataset.oldText) button.textContent = button.dataset.oldText; button.disabled = busy; }
  async function cloudRow() { var result = await client.from("user_app_data").select("app_data,updated_at").eq("user_id", SN.user.id).maybeSingle(); if (result.error) throw result.error; return result.data; }
  async function upsert(appData) { var now = new Date().toISOString(); var result = await client.from("user_app_data").upsert({ user_id: SN.user.id, app_data: appData, updated_at: now }, { onConflict: "user_id" }); if (result.error) throw result.error; setMeta({ lastSync: now }); return now; }
  function itemTime(x) { return Date.parse(x && (x.updatedAt || x.date || x.createdAt || x.at) || "") || 0; }
  function mergeArray(a, b, identity, stats) {
    var out = [], index = new Map();
    (a || []).concat(b || []).forEach(function (item) {
      var id = identity(item);
      if (!id) { out.push(item); return; }
      if (!index.has(id)) { index.set(id, out.length); out.push(item); return; }
      stats.duplicates++;
      var pos = index.get(id), old = out[pos], ot = itemTime(old), nt = itemTime(item);
      if (nt > ot) out[pos] = item;
      else if (!ot && !nt && JSON.stringify(old) !== JSON.stringify(item)) { var unique = id + "#" + out.length; index.set(unique, out.length); out.push(item); }
    });
    return out;
  }
  function mergeData(local, cloud) {
    if (!valid(local) || !valid(cloud)) throw new Error("unsafe-structure");
    var stats = { duplicates: 0 }, result = JSON.parse(JSON.stringify(cloud));
    var lv = local.vocabulary, cv = cloud.vocabulary, lw = local.writingVault, cw = cloud.writingVault;
    result.vocabulary = Object.assign({}, cv, lv);
    result.vocabulary.words = mergeArray(cv.words, lv.words, function (x) { return String(x && (x.id || x.term) || "").toLowerCase(); }, stats);
    result.vocabulary.mistakes = mergeArray(cv.mistakes, lv.mistakes, function (x) { return String(x && (x.id || (x.wrong + "|" + x.right)) || ""); }, stats);
    result.vocabulary.speakingLogs = mergeArray(cv.speakingLogs, lv.speakingLogs, function (x) { return String(x && (x.id || x.date) || ""); }, stats);
    result.vocabulary.topics = Array.from(new Set([].concat(cv.topics || [], lv.topics || [])));
    result.vocabulary.days = Object.assign({}, cv.days || {}, lv.days || {});
    result.vocabulary.activityDays = Object.assign({}, cv.activityDays || {}, lv.activityDays || {});
    result.vocabulary.reading = Object.assign({}, cv.reading || {}, lv.reading || {});
    ["passages", "questions", "paraphrases", "mistakes"].forEach(function (key) { result.vocabulary.reading[key] = mergeArray(cv.reading && cv.reading[key], lv.reading && lv.reading[key], function (x) { return String(x && x.id || ""); }, stats); });
    result.writingVault = Object.assign({}, cw, lw);
    result.writingVault.essays = mergeArray(cw.essays, lw.essays, function (x) { return String(x && x.id || ""); }, stats);
    result.writingVault.corrections = mergeArray(cw.corrections, lw.corrections, function (x) { return String(x && x.id || ""); }, stats);
    result.writingVault.drafts = mergeArray(cw.drafts, lw.drafts, function (x) { return String(x && x.draftId || ""); }, stats);
    result.writingVault.topics = Array.from(new Set([].concat(cw.topics || [], lw.topics || [])));
    result.settings = Object.assign({}, cloud.settings || {}, local.settings || {}); result.savedAt = new Date().toISOString(); result.deviceId = deviceId();
    return { data: result, stats: stats };
  }
  function applyData(data) { if (!valid(data)) throw new Error("invalid-cloud"); localStorage.setItem(VOCAB_KEY, JSON.stringify(data.vocabulary)); localStorage.setItem(WRITING_KEY, JSON.stringify(data.writingVault)); if (data.settings && ["vi", "en"].includes(data.settings.language)) localStorage.setItem(LANG_KEY, data.settings.language); }
  function refreshUI() {
    var local = document.getElementById("nova-local-summary"), last = document.getElementById("nova-last-sync"), back = document.getElementById("nova-safety-backup");
    if (local) local.textContent = summary(collect()); if (last) last.textContent = formatTime(meta().lastSync); if (back) back.textContent = formatTime(meta().backupAt);
    updateAuthUI(); translateUI();
  }
  function updateAuthUI() { var status = document.getElementById("sn-auth-status"), label = document.getElementById("sn-auth-label"); if (status) status.textContent = SN.user ? tr("signedIn", { email: SN.user.email || SN.user.id }) : tr("signedOut"); if (label) label.textContent = SN.user ? (SN.user.email || "Account").split("@")[0] : (lang() === "vi" ? "Đăng nhập" : "Sign in"); }
  function translateUI() {
    var modal = document.getElementById("sn-auth-modal"); if (!modal) return;
    var title = modal.querySelector(".sn-modal-title"); if (title) title.textContent = tr("account");
    var stats = modal.querySelectorAll(".nova-cloud-stat b"); ["device", "cloud", "lastSync", "backup"].forEach(function (k, i) { if (stats[i]) stats[i].textContent = tr(k); });
    var buttons = modal.querySelectorAll("button"); ["compare", "upload", "download", "merge", "restore", "create", "login", "facebook", "local", "logout"].forEach(function (k) { Array.from(buttons).find(function (b) { return ({compare:"snInspectCloud",upload:"snSaveCloud",download:"snLoadCloudSafe('cloud')",merge:"snLoadCloudSafe('merge')",restore:"snRestoreSafetyBackup",create:"snRegisterEmail",login:"snLoginEmail",facebook:"snLoginFacebook",local:"snLocalDemoLogin",logout:"snLogout"})[k] && b.getAttribute("onclick").includes(({compare:"snInspectCloud",upload:"snSaveCloud",download:"snLoadCloudSafe('cloud')",merge:"snLoadCloudSafe('merge')",restore:"snRestoreSafetyBackup",create:"snRegisterEmail",login:"snLoginEmail",facebook:"snLoginFacebook",local:"snLocalDemoLogin",logout:"snLogout"})[k]); })?.replaceChildren(document.createTextNode(tr(k))); });
    var fields = modal.querySelectorAll(".sn-auth-grid label"); if (fields[0]) fields[0].textContent = tr("email"); if (fields[1]) fields[1].textContent = tr("password"); var pass = document.getElementById("sn-auth-pass"); if (pass) pass.placeholder = tr("passwordHint");
    buttons.forEach(function (b) { b.setAttribute("aria-label", b.textContent.trim()); });
  }
  window.snOpenAuth = function () { document.getElementById("sn-auth-modal")?.classList.add("open"); refreshUI(); };
  window.snCloseAuth = function () { document.getElementById("sn-auth-modal")?.classList.remove("open"); };
  window.snRegisterEmail = async function () { var button = typeof event !== "undefined" && event.currentTarget, email = document.getElementById("sn-auth-email").value.trim(), pass = document.getElementById("sn-auth-pass").value; if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass)) return alertFriendly("weak"); setBusy(button, true); try { var r = await client.auth.signUp({ email: email, password: pass }); if (r.error) throw r.error; alertFriendly(r.data.session ? "created" : "confirmEmail"); } catch (e) { alertFriendly(errorKey(e)); } finally { setBusy(button, false); } };
  window.snLoginEmail = async function () { var button = typeof event !== "undefined" && event.currentTarget; setBusy(button, true); try { var r = await client.auth.signInWithPassword({ email: document.getElementById("sn-auth-email").value.trim(), password: document.getElementById("sn-auth-pass").value }); if (r.error) throw r.error; } catch (e) { alertFriendly(errorKey(e)); } finally { setBusy(button, false); } };
  window.snLoginFacebook = async function () { if (!navigator.onLine) return alertFriendly("offline"); try { var r = await client.auth.signInWithOAuth({ provider: "facebook", options: { redirectTo: "https://studynovalab.vercel.app" } }); if (r.error) throw r.error; } catch (e) { alertFriendly(errorKey(e, true)); } };
  window.snLocalDemoLogin = function () { window.snCloseAuth(); };
  window.snLogout = async function () { try { var r = await client.auth.signOut(); if (r.error) throw r.error; } catch (e) { alertFriendly(errorKey(e)); } };
  window.snInspectCloud = async function () { if (!requireCloud()) return null; try { var row = await cloudRow(), cloudEl = document.getElementById("nova-cloud-summary"), local = collect(); if (!row || !row.app_data) { if (cloudEl) cloudEl.textContent = tr("cloudMissing"); alertFriendly("noCloud"); return null; } if (!valid(row.app_data)) { alertFriendly("badCloud"); return null; } var relation = Date.parse(local.savedAt) > Date.parse(row.updated_at) ? tr("newerLocal") : Date.parse(local.savedAt) < Date.parse(row.updated_at) ? tr("newerCloud") : tr("same"); if (cloudEl) cloudEl.textContent = summary(row.app_data) + " · " + formatTime(row.updated_at) + " · " + relation; return row; } catch (e) { alertFriendly(errorKey(e)); return null; } };
  window.snSaveCloud = async function () { if (!requireCloud() || SN.cloudBusy) return; var button = typeof event !== "undefined" && event.currentTarget; setBusy(button, true); SN.cloudBusy = true; try { backup("device-to-cloud"); await upsert(collect()); refreshUI(); alertFriendly("uploaded"); } catch (e) { alertFriendly(e.name === "QuotaExceededError" ? "backupFail" : errorKey(e)); } finally { SN.cloudBusy = false; setBusy(button, false); } };
  window.snLoadCloudSafe = async function (mode) { if (!requireCloud() || SN.cloudBusy || !confirm(tr("confirm"))) return; var button = typeof event !== "undefined" && event.currentTarget; setBusy(button, true); SN.cloudBusy = true; try { var row = await cloudRow(); if (!row || !row.app_data) return alertFriendly("noCloud"); if (!valid(row.app_data)) return alertFriendly("badCloud"); var local = collect(); backup(mode === "merge" ? "merge" : "cloud-to-device"); var next = row.app_data, report; if (mode === "merge") { report = mergeData(local, row.app_data); next = report.data; } applyData(next); if (mode === "merge") await upsert(next); setMeta({ lastSync: new Date().toISOString() }); alert(mode === "merge" ? tr("mergeReport", Object.assign(counts(next), report.stats)) : tr("loaded")); location.reload(); } catch (e) { alertFriendly(e.name === "QuotaExceededError" ? "backupFail" : e.message === "unsafe-structure" ? "badCloud" : errorKey(e)); } finally { SN.cloudBusy = false; setBusy(button, false); } };
  window.snLoadCloud = function () { return window.snLoadCloudSafe("cloud"); };
  window.snRestoreSafetyBackup = function () { try { var saved = parse(BACKUP_KEY); if (!saved.appData) return alertFriendly("noBackup"); if (!confirm(tr("confirm"))) return; applyData(saved.appData); alertFriendly("restored"); location.reload(); } catch (e) { alertFriendly(e.name === "QuotaExceededError" ? "backupFail" : "badCloud"); } };
  if (client) { client.auth.getSession().then(function (r) { SN.user = r.data.session && r.data.session.user; refreshUI(); }); client.auth.onAuthStateChange(function (_, session) { SN.user = session && session.user; setTimeout(refreshUI, 0); }); }
  window.addEventListener("storage", function (e) { if (e.key === LANG_KEY) refreshUI(); });
  window.addEventListener("online", refreshUI); window.addEventListener("offline", refreshUI); setTimeout(refreshUI, 100);
})();
