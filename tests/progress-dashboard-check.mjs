import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../studynova-progress.css',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../studynova-progress.js',import.meta.url),'utf8');
const worker=fs.readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');
const check=(condition,message)=>{if(!condition)throw new Error(message)};

check(html.includes('id="page-dash"')&&html.includes('id="sn-progress-kpis"'),'Progress page or KPI region is missing');
check(html.includes('data-progress-range="7"')&&html.includes('data-progress-range="30"'),'7/30-day range controls are missing');
check(html.includes('id="sn-progress-chart"')&&html.includes('id="sn-progress-skills"')&&html.includes('id="sn-progress-timeline"'),'Progress chart, skill cards, or timeline is missing');
check(html.includes('studynova-progress.css')&&html.includes('studynova-progress.js'),'Progress feature assets are not loaded');
check(html.includes('testHistory:[]')&&html.includes('S.testHistory.unshift')&&html.includes('firstPct:firstPct'),'Completed tests are not stored as progress history');
check(html.includes("StudyNovaRecordAnswer(word,rating!=='again')"),'Review answers do not update accuracy/mastery data');
check(js.includes("localStorage.getItem(WRITING_STORE)")&&js.includes('speakingLogs')&&js.includes('readingMetricsForDay'),'Cross-skill data sources are not connected');
check(js.includes("addEventListener('studynova-realtime-update'")&&js.includes("addEventListener('storage'"),'Progress dashboard does not react to realtime/cross-tab updates');
check(js.includes("data.cfg.progressRange=range")&&js.includes("typeof window.save==='function'"),'Selected range is not persisted in the synced app state');
check(!js.includes('Math.random()*100'),'Progress dashboard must not generate fake metrics');
check(css.includes('@media (max-width: 700px)')&&/min-height:\s*(?:4[4-9]|[5-9]\d|\d{3,})px/.test(css)&&css.includes('.sn-progress-bars.is-30'),'Responsive/touch-safe progress layout is incomplete');
check(worker.includes('novalab-pwa-v29')&&worker.includes('./studynova-progress.css')&&worker.includes('./studynova-progress.js'),'Progress assets are missing from the updated PWA shell');

const listeners={};
const storage=new Map();
const context={
  console,Date,Intl,Math,Set,JSON,Number,String,Array,Object,RegExp,isFinite,
  localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
  location:{hash:'',assign(){}},history:{replaceState(){}},
  document:{readyState:'loading',addEventListener(){},getElementById(){return null},querySelector(){return null},querySelectorAll(){return []}},
  addEventListener:(name,fn)=>{listeners[name]=fn},setTimeout:fn=>{fn();return 1},clearTimeout(){},CustomEvent:class CustomEvent{}
};
context.window=context;
vm.runInNewContext(js,context,{filename:'studynova-progress.js'});
const api=context.StudyNovaProgress;
check(api&&typeof api.dayMetrics==='function'&&typeof api.learningStats==='function','Progress metrics API did not initialize');
const sample={
  words:[{status:'mastered',correct_count:4,wrong_count:1},{status:'learning',correct_count:1,wrong_count:1}],
  days:{'2026-08-13':2},activityDays:{'2026-08-13':{valid:true,reviews:1,tests:1}},
  testHistory:[{date:'2026-08-13T09:00:00Z',firstPct:80}],
  speakingLogs:[{date:'2026-08-13T10:00:00Z'}],
  reading:{passages:[{at:'2026-08-13'}],questions:[{at:'2026-08-13'}]},dailyPlan:{},cfg:{daily:5}
};
const daily=api.dayMetrics(sample,{essays:[{updatedAt:'2026-08-13T08:00:00Z'}],corrections:[]},'2026-08-13');
check(daily.words===2&&daily.reviews===1&&daily.tests===1&&daily.reading===2&&daily.speaking===1&&daily.writing===1&&daily.active,'Daily cross-skill metrics are calculated incorrectly');
const learning=api.learningStats(sample);
check(learning.total===2&&learning.strong===1&&learning.accuracy===71,'Mastery or accuracy calculation is incorrect');

console.log('Progress dashboard regression checks passed.');
