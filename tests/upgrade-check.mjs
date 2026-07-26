import fs from 'node:fs';
const read = file => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const home=read('index.html'), writing=read('studynova_writing_vault.html'), auth=read('studynova-auth.js'), tour=read('onboarding-tour.js'), sw=read('service-worker.js'), sql=read('supabase/migrations/202607260001_create_profiles.sql');
const ok=(condition,message)=>{if(!condition)throw new Error(message)};
for(const html of [home,writing]) { ok(html.includes('onboarding-tour.js')&&html.includes('onboarding-tour.css'),'Tour assets missing'); ok(html.includes('studynova-auth.js')&&html.includes('studynova-auth.css'),'Auth assets missing'); }
ok(auth.includes('/^(?=.*[A-Z])(?=.*\\d).{8,}$/'),'Password policy missing');
ok(auth.includes("resetPasswordForEmail")&&auth.includes("PASSWORD_RECOVERY")&&auth.includes("updateUser({ password })"),'Recovery/change flow missing');
ok(auth.includes("provider: 'facebook'")&&auth.includes('PRODUCTION_ORIGIN'),'OAuth origin not centralized');
for(const key of ['studynova_tour_home_completed_v1','studynova_tour_writing_completed_v1','studynova_tour_cloud_completed_v1'])ok(tour.includes(key),`Missing ${key}`);
ok(tour.includes('tour_demo_')&&tour.includes('isTourDemo')&&tour.includes('tourSessionId'),'Demo isolation metadata missing');
ok(sw.includes('novalab-pwa-v12')&&sw.includes('onboarding-tour.js')&&sw.includes('studynova-auth.js'),'PWA cache missing new assets');
ok(sql.includes('user_id uuid primary key')&&!/unique\s*\(\s*display_name/i.test(sql),'Profile identity/duplicate-name rule invalid');
ok((sql.match(/auth\.uid\(\)/g)||[]).length>=4,'RLS ownership checks missing');
console.log('Upgrade regression checks passed.');
