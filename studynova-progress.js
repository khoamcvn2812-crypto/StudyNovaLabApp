(function(){
'use strict';

var STORE='vocabmaster_data_v1';
var WRITING_STORE='writingvault_data_v1';
var DAY_MS=86400000;

var COPY={
  vi:{
    kicker:'TIẾN TRÌNH HỌC TẬP',
    title:'Nhìn rõ tiến bộ, học đúng việc tiếp theo.',
    subtitle:'Theo dõi nhịp học, độ ghi nhớ và tiến trình IELTS từ dữ liệu thật của bạn.',
    rangeLabel:'Khoảng thời gian',days7:'7 ngày',days30:'30 ngày',goal:'Mục tiêu/ngày',wordUnit:'từ',
    overview:'Tổng quan tiến trình',currentStreak:'Chuỗi hiện tại',bestStreak:'Chuỗi tốt nhất',strongWords:'Từ đã vững',accuracy:'Độ chính xác',
    streakStart:'Bắt đầu chuỗi học hôm nay',streakKeep:'Duy trì nhịp học đều đặn',bestMeta:'Kỷ lục học liên tục',strongMeta:'{strong}/{total} từ ở mức đã quen hoặc thành thạo',accuracyMeta:'Tính từ các câu ôn đã có kết quả',noAnswers:'Chưa có câu trả lời',day:'ngày',
    activityTitle:'Hoạt động học tập',activitySubtitle:'Tổng hợp từ vựng, ôn tập và các kỹ năng theo ngày.',activeDays:'{count}/{range} ngày có học',
    nextEyebrow:'BƯỚC TIẾP THEO',nextLoading:'Đang chọn hoạt động phù hợp...',start:'Bắt đầu',
    skillsTitle:'Tiến trình theo kỹ năng',skillsSubtitle:'Số liệu được lấy trực tiếp từ từng khu vực học, không dùng dữ liệu mẫu.',
    calendarTitle:'Lịch học',calendarSubtitle:'Mỗi ô sáng là một ngày có ít nhất một hoạt động học hợp lệ.',calendarSummary:'{count} ngày hoạt động',
    recentTitle:'Hoạt động gần đây',recentSubtitle:'Những thay đổi mới nhất trong quá trình học.',recentEmpty:'Chưa có hoạt động để hiển thị. Thêm một từ hoặc hoàn thành một lượt học để bắt đầu theo dõi.',
    vocabulary:'Từ vựng',reviews:'Ôn tập',tests:'Kiểm tra',reading:'Reading',speaking:'Speaking',writing:'Writing',other:'Hoạt động',
    wordsStrong:'{strong}/{total} từ đã vững',dueWords:'{count} từ đang đến hạn',testCount:'{count} bài đã hoàn thành',passageCount:'{count} bài đọc · {questions} câu hỏi',speakingCount:'{count} lượt luyện · điểm TB {average}',writingCount:'{count} bài viết · {improved} đã cải thiện',
    masteryRate:'Tỷ lệ từ đã vững',reviewAccuracy:'Độ chính xác khi ôn',testAverage:'Điểm kiểm tra trung bình',activeRate:'Số ngày có luyện trong kỳ',
    openMap:'Mở bản đồ từ',reviewNow:'Ôn ngay',takeTest:'Làm bài kiểm tra',openReading:'Mở Reading Hub',openSpeaking:'Mở Speaking Studio',openWriting:'Mở Writing Vault',
    taskDueTitle:'Ôn {count} từ đến hạn',taskDueCopy:'Ôn đúng thời điểm giúp bạn giữ từ lâu hơn.',
    taskMistakeTitle:'Sửa {count} lỗi đang chờ',taskMistakeCopy:'Biến lỗi thật trong Writing và Speaking thành kiến thức có thể ôn lại.',
    taskDraftTitle:'Tiếp tục bài viết gần nhất',taskDraftCopy:'Bản nháp “{title}” đang chờ bạn hoàn thiện.',
    taskWordsTitle:'Thêm {count} từ để đạt mục tiêu',taskWordsCopy:'Bạn đã thêm {done}/{goal} từ trong mục tiêu hôm nay.',
    taskReadingTitle:'Luyện một bài Reading ngắn',taskReadingCopy:'Bạn chưa có hoạt động Reading trong khoảng thời gian đang xem.',
    taskSpeakingTitle:'Luyện Speaking trong 5 phút',taskSpeakingCopy:'Một lượt luyện ngắn giúp duy trì phản xạ nói.',
    taskTestTitle:'Kiểm tra mức độ ghi nhớ',taskTestCopy:'Bạn đã hoàn thành mục tiêu từ mới. Hãy kiểm tra lại những gì đã học.',
    addWords:'Thêm từ',openMistakes:'Mở sổ lỗi',continueWriting:'Tiếp tục viết',
    eventWord:'Đã thêm “{term}”',eventWordMeta:'Từ vựng · {topic}',eventReview:'Đã hoàn thành {count} lượt ôn',eventReviewMeta:'Ôn tập từ vựng',eventTest:'Bài kiểm tra đạt {score}%',eventTestFallback:'Đã hoàn thành {count} bài kiểm tra',eventReading:'Đã lưu bài Reading “{title}”',eventSpeaking:'Đã lưu một lượt Speaking',eventWriting:'Đã cập nhật “{title}”',eventCorrection:'Đã thêm một lỗi vào Writing Vault',
    today:'Hôm nay',yesterday:'Hôm qua'
  },
  en:{
    kicker:'LEARNING PROGRESS',
    title:'See your progress and learn the right thing next.',
    subtitle:'Track consistency, retention and IELTS progress using your real learning data.',
    rangeLabel:'Time range',days7:'7 days',days30:'30 days',goal:'Daily goal',wordUnit:'words',
    overview:'Progress overview',currentStreak:'Current streak',bestStreak:'Best streak',strongWords:'Strong words',accuracy:'Accuracy',
    streakStart:'Start your learning streak today',streakKeep:'Keep your learning rhythm going',bestMeta:'Longest consecutive run',strongMeta:'{strong}/{total} words are familiar or mastered',accuracyMeta:'Based on completed review answers',noAnswers:'No answered questions yet',day:'days',
    activityTitle:'Learning activity',activitySubtitle:'Vocabulary, review and skill activity by day.',activeDays:'{count}/{range} active days',
    nextEyebrow:'NEXT STEP',nextLoading:'Choosing the best activity...',start:'Start',
    skillsTitle:'Progress by skill',skillsSubtitle:'Metrics come directly from each learning area, with no sample data.',
    calendarTitle:'Learning calendar',calendarSubtitle:'Each highlighted cell is a day with at least one valid learning activity.',calendarSummary:'{count} active days',
    recentTitle:'Recent activity',recentSubtitle:'Your latest changes across the learning system.',recentEmpty:'No activity yet. Add a word or complete a learning session to start tracking progress.',
    vocabulary:'Vocabulary',reviews:'Review',tests:'Tests',reading:'Reading',speaking:'Speaking',writing:'Writing',other:'Activity',
    wordsStrong:'{strong}/{total} strong words',dueWords:'{count} words due',testCount:'{count} completed tests',passageCount:'{count} passages · {questions} questions',speakingCount:'{count} practices · {average} average',writingCount:'{count} essays · {improved} improved',
    masteryRate:'Strong-word rate',reviewAccuracy:'Review accuracy',testAverage:'Average test score',activeRate:'Active days in this range',
    openMap:'Open knowledge map',reviewNow:'Review now',takeTest:'Take a test',openReading:'Open Reading Hub',openSpeaking:'Open Speaking Studio',openWriting:'Open Writing Vault',
    taskDueTitle:'Review {count} due words',taskDueCopy:'Reviewing at the right time helps you retain words for longer.',
    taskMistakeTitle:'Fix {count} pending mistakes',taskMistakeCopy:'Turn real Writing and Speaking mistakes into reusable knowledge.',
    taskDraftTitle:'Continue your latest essay',taskDraftCopy:'Your “{title}” draft is waiting to be completed.',
    taskWordsTitle:'Add {count} words to reach your goal',taskWordsCopy:'You have added {done}/{goal} words toward today\'s target.',
    taskReadingTitle:'Complete a short Reading activity',taskReadingCopy:'There is no Reading activity in the selected range yet.',
    taskSpeakingTitle:'Practise Speaking for 5 minutes',taskSpeakingCopy:'A short practice keeps your speaking reflex active.',
    taskTestTitle:'Check what you remember',taskTestCopy:'Your new-word target is complete. Test what you have learned.',
    addWords:'Add words',openMistakes:'Open Mistake Bank',continueWriting:'Continue writing',
    eventWord:'Added “{term}”',eventWordMeta:'Vocabulary · {topic}',eventReview:'Completed {count} review session(s)',eventReviewMeta:'Vocabulary review',eventTest:'Test completed with {score}%',eventTestFallback:'Completed {count} test(s)',eventReading:'Saved Reading passage “{title}”',eventSpeaking:'Saved a Speaking practice',eventWriting:'Updated “{title}”',eventCorrection:'Added a mistake to Writing Vault',
    today:'Today',yesterday:'Yesterday'
  }
};

function state(){
  if(window.S&&typeof window.S==='object')return window.S;
  try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){return {}}
}
function writingState(){try{return JSON.parse(localStorage.getItem(WRITING_STORE)||'{}')}catch(e){return {}}}
function language(data){return data&&data.lang==='en'?'en':'vi'}
function c(data,key,vars){
  var value=(COPY[language(data)]&&COPY[language(data)][key])||COPY.vi[key]||key;
  Object.keys(vars||{}).forEach(function(name){value=value.split('{'+name+'}').join(String(vars[name]))});
  return value;
}
function esc(value){return String(value==null?'':value).replace(/[&<>'"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]})}
function clamp(value,min,max){return Math.max(min,Math.min(max,Number(value)||0))}
function pad(value){return String(value).padStart(2,'0')}
function dayKey(date){var d=date||new Date();return [d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())].join('-')}
function dateFromKey(key){var p=String(key||'').slice(0,10).split('-').map(Number);return p.length===3&&p.every(Boolean)?new Date(p[0],p[1]-1,p[2],12):new Date(key)}
function keyFromValue(value){
  if(!value)return '';
  if(/^\d{4}-\d{2}-\d{2}/.test(String(value)))return String(value).slice(0,10);
  var d=new Date(value);return isNaN(d)?'':dayKey(d);
}
function dateValue(value){
  if(value==null)return 0;
  if(typeof value==='number')return value;
  if(/^\d{4}-\d{2}-\d{2}$/.test(String(value)))return dateFromKey(value).getTime();
  var d=new Date(value);return isNaN(d)?0:d.getTime();
}
function lastKeys(count){
  var out=[],d=new Date();d.setHours(12,0,0,0);
  for(var i=count-1;i>=0;i--){var x=new Date(d);x.setDate(x.getDate()-i);out.push(dayKey(x))}
  return out;
}
function formatNumber(data,value){try{return new Intl.NumberFormat(language(data)==='en'?'en-US':'vi-VN').format(Number(value)||0)}catch(e){return String(Number(value)||0)}}
function setText(id,value){var el=document.getElementById(id);if(el)el.textContent=value}
function array(value){return Array.isArray(value)?value:[]}
function dateMatches(item,key,fields){return (fields||['date','at','updatedAt','createdAt']).some(function(field){return keyFromValue(item&&item[field])===key})}

function readingMetricsForDay(data,key){
  var reading=data.reading||{},count=0;
  ['passages','questions','paraphrases','mistakes'].forEach(function(group){count+=array(reading[group]).filter(function(item){return dateMatches(item,key)}).length});
  if(!count&&data.dailyPlan&&data.dailyPlan[key]&&data.dailyPlan[key].reading)count=1;
  return count;
}
function writingMetricsForDay(writing,key){
  var essayIds={},count=0;
  array(writing.essays).forEach(function(item){if(dateMatches(item,key,['updatedAt','createdAt'])){essayIds[String(item.id||count)]=true;count++}});
  count+=array(writing.corrections).filter(function(item){return dateMatches(item,key,['updatedAt','createdAt','date'])}).length;
  return count;
}
function dayMetrics(data,writing,key){
  var activity=data.activityDays&&data.activityDays[key]||{};
  var historyTests=array(data.testHistory).filter(function(item){return dateMatches(item,key,['date','createdAt'])}).length;
  var words=Number(data.days&&data.days[key])||0;
  if(!words)words=array(data.words).filter(function(item){return dateMatches(item,key,['at','createdAt'])}).length;
  var metric={
    key:key,
    words:words,
    reviews:Number(activity.reviews)||0,
    tests:Math.max(Number(activity.tests)||0,historyTests),
    reading:readingMetricsForDay(data,key),
    speaking:array(data.speakingLogs).filter(function(item){return dateMatches(item,key,['date','createdAt'])}).length,
    writing:writingMetricsForDay(writing,key),
    valid:!!activity.valid
  };
  metric.total=metric.words+metric.reviews+metric.tests+metric.reading+metric.speaking+metric.writing;
  metric.active=metric.total>0||metric.valid;
  return metric;
}

function allActiveKeys(data,writing){
  var keys={};
  Object.keys(data.days||{}).forEach(function(key){if(Number(data.days[key]))keys[key]=true});
  Object.keys(data.activityDays||{}).forEach(function(key){var a=data.activityDays[key]||{};if(a.valid||Number(a.reviews)||Number(a.tests))keys[key]=true});
  array(data.words).forEach(function(item){var key=keyFromValue(item.at||item.createdAt);if(key)keys[key]=true});
  ['passages','questions','paraphrases','mistakes'].forEach(function(group){array((data.reading||{})[group]).forEach(function(item){var key=keyFromValue(item.date||item.at||item.createdAt);if(key)keys[key]=true})});
  array(data.speakingLogs).forEach(function(item){var key=keyFromValue(item.date||item.createdAt);if(key)keys[key]=true});
  array(data.testHistory).forEach(function(item){var key=keyFromValue(item.date||item.createdAt);if(key)keys[key]=true});
  array(writing.essays).forEach(function(item){var key=keyFromValue(item.updatedAt||item.createdAt);if(key)keys[key]=true});
  array(writing.corrections).forEach(function(item){var key=keyFromValue(item.updatedAt||item.createdAt||item.date);if(key)keys[key]=true});
  return Object.keys(keys).filter(function(key){return /^\d{4}-\d{2}-\d{2}$/.test(key)}).sort();
}
function streakStats(data,writing){
  var keys=allActiveKeys(data,writing),set=new Set(keys),today=dayKey(),cursor=dateFromKey(today),current=0;
  if(!set.has(today))cursor.setDate(cursor.getDate()-1);
  while(set.has(dayKey(cursor))&&current<3660){current++;cursor.setDate(cursor.getDate()-1)}
  var best=0,run=0,last=0;
  keys.forEach(function(key){var ts=dateFromKey(key).getTime();run=last&&Math.round((ts-last)/DAY_MS)===1?run+1:1;best=Math.max(best,run);last=ts});
  return {current:current,best:best,active:set};
}

function masteryFor(word){
  if(typeof window.StudyNovaMastery==='function'){
    try{return window.StudyNovaMastery(word)}catch(e){}
  }
  var status=word.status||'new',strong=status==='mastered'||status==='ielts_ready';
  return {level:strong?'mastered':status==='learning'?'learning':'new',accuracy:Number(word.accuracy)||0,due:!!(word.srs&&word.srs.due&&word.srs.due<=dayKey())};
}
function learningStats(data){
  var words=array(data.words),strong=0,due=0,correct=0,wrong=0;
  words.forEach(function(word){
    var mastery=masteryFor(word),status=String(word.status||'');
    if(mastery.level==='familiar'||mastery.level==='mastered'||status==='mastered'||status==='ielts_ready')strong++;
    var legacyDue=word.srs&&word.srs.due&&String(word.srs.due).slice(0,10)<=dayKey();
    if(mastery.due||legacyDue)due++;
    var explicitCorrect=Number(word.correct_count||word.correctCount)||0,explicitWrong=Number(word.wrong_count||word.wrongCount)||0;
    if(explicitCorrect+explicitWrong){correct+=explicitCorrect;wrong+=explicitWrong}
    else if(word.srs&&Number(word.srs.reviews)){var reviews=Number(word.srs.reviews)||0,lapses=Math.min(reviews,Number(word.srs.lapses)||0);correct+=reviews-lapses;wrong+=lapses}
  });
  var attempts=correct+wrong;
  return {total:words.length,strong:strong,strongPct:words.length?Math.round(strong/words.length*100):0,due:due,correct:correct,wrong:wrong,attempts:attempts,accuracy:attempts?Math.round(correct/attempts*100):null};
}

function renderStaticCopy(data){
  setText('sn-progress-kicker',c(data,'kicker'));
  setText('sn-progress-title',c(data,'title'));
  setText('sn-progress-subtitle',c(data,'subtitle'));
  setText('sn-progress-goal-label',c(data,'goal'));
  setText('sn-progress-goal-unit',c(data,'wordUnit'));
  setText('sn-progress-activity-title',c(data,'activityTitle'));
  setText('sn-progress-activity-subtitle',c(data,'activitySubtitle'));
  setText('sn-progress-next-eyebrow',c(data,'nextEyebrow'));
  setText('sn-progress-skills-title',c(data,'skillsTitle'));
  setText('sn-progress-skills-subtitle',c(data,'skillsSubtitle'));
  setText('sn-progress-streak-title',c(data,'calendarTitle'));
  setText('sn-progress-streak-subtitle',c(data,'calendarSubtitle'));
  setText('sn-progress-recent-title',c(data,'recentTitle'));
  setText('sn-progress-recent-subtitle',c(data,'recentSubtitle'));
  var group=document.querySelector('.sn-progress-range');if(group)group.setAttribute('aria-label',c(data,'rangeLabel'));
  var buttons=document.querySelectorAll('[data-progress-range]');
  buttons.forEach(function(button){button.textContent=Number(button.dataset.progressRange)===30?c(data,'days30'):c(data,'days7')});
  var kpis=document.getElementById('sn-progress-kpis');if(kpis)kpis.setAttribute('aria-label',c(data,'overview'));
}
function kpi(icon,label,value,meta,tone){
  return '<article class="sn-progress-kpi" data-tone="'+tone+'"><span class="sn-progress-kpi-icon"><sn-icon name="'+icon+'" aria-hidden="true"></sn-icon></span><span class="sn-progress-kpi-label">'+esc(label)+'</span><strong class="sn-progress-kpi-value">'+esc(value)+'</strong><span class="sn-progress-kpi-meta">'+esc(meta)+'</span></article>';
}
function renderKpis(data,learning,streak){
  var host=document.getElementById('sn-progress-kpis');if(!host)return;
  host.innerHTML=
    kpi('streak',c(data,'currentStreak'),formatNumber(data,streak.current)+' '+c(data,'day'),streak.current?c(data,'streakKeep'):c(data,'streakStart'),'streak')+
    kpi('progress',c(data,'bestStreak'),formatNumber(data,streak.best)+' '+c(data,'day'),c(data,'bestMeta'),'best')+
    kpi('vocabulary',c(data,'strongWords'),learning.strongPct+'%',c(data,'strongMeta',{strong:formatNumber(data,learning.strong),total:formatNumber(data,learning.total)}),'mastery')+
    kpi('complete',c(data,'accuracy'),learning.accuracy==null?'—':learning.accuracy+'%',learning.attempts?c(data,'accuracyMeta'):c(data,'noAnswers'),'accuracy');
}

function renderChart(data,days){
  var host=document.getElementById('sn-progress-chart');if(!host)return;
  var max=Math.max.apply(null,[1].concat(days.map(function(day){return day.total||(day.valid?1:0)})));
  var lang=language(data),today=dayKey();
  var bars=days.map(function(day,index){
    var d=dateFromKey(day.key),total=day.total||(day.valid?1:0),height=total?Math.max(4,Math.round(total/max*100)):2,segments='';
    ['words','reviews','tests','reading','speaking','writing'].forEach(function(kind){if(day[kind])segments+='<i class="sn-progress-segment" data-kind="'+kind+'" style="height:'+Math.max(2,day[kind]/Math.max(day.total,1)*100)+'%"></i>'});
    if(!segments&&day.valid)segments='<i class="sn-progress-segment" data-kind="activity" style="height:100%"></i>';
    var details=[c(data,'vocabulary')+': '+day.words,c(data,'reviews')+': '+day.reviews,c(data,'tests')+': '+day.tests,c(data,'reading')+': '+day.reading,c(data,'speaking')+': '+day.speaking,c(data,'writing')+': '+day.writing].join(' · ');
    var label=days.length===7?new Intl.DateTimeFormat(lang==='en'?'en-US':'vi-VN',{weekday:'short'}).format(d):(index%5===0||index===days.length-1?String(d.getDate()):'');
    return '<div class="sn-progress-day'+(day.key===today?' is-today':'')+'" title="'+esc(day.key+' · '+details)+'" aria-label="'+esc(day.key+' · '+details)+'"><div class="sn-progress-stack-wrap"><span class="sn-progress-stack" style="height:'+height+'%">'+segments+'</span></div><span class="sn-progress-day-label">'+esc(label)+'</span></div>';
  }).join('');
  host.innerHTML='<div class="sn-progress-bars'+(days.length===30?' is-30':'')+'">'+bars+'</div>';
  host.setAttribute('aria-label',c(data,'activityTitle')+' — '+c(data,days.length===30?'days30':'days7'));
  var active=days.filter(function(day){return day.active}).length;
  setText('sn-progress-active-days',c(data,'activeDays',{count:active,range:days.length}));
  var legend=document.getElementById('sn-progress-legend');
  if(legend){
    var items=[['words','vocabulary','#60a5fa'],['reviews','reviews','#34d399'],['tests','tests','#a78bfa'],['reading','reading','#22d3ee'],['speaking','speaking','#fbbf24'],['writing','writing','#fb7185']];
    legend.innerHTML=items.map(function(item){return '<span><i style="--legend-color:'+item[2]+'"></i>'+esc(c(data,item[1]))+'</span>'}).join('');
  }
}

function latestDraft(writing){
  return array(writing.essays).filter(function(item){return /draft|editing|đang/i.test(String(item.status||''))}).sort(function(a,b){return dateValue(b.updatedAt||b.createdAt)-dateValue(a.updatedAt||a.createdAt)})[0]||null;
}
function nextTask(data,writing,learning,days){
  var mistakes=array(data.mistakes).filter(function(item){return !item.mastered}).length;
  var draft=latestDraft(writing),todayWords=Number(data.days&&data.days[dayKey()])||0,goal=Math.max(1,Number(data.cfg&&data.cfg.daily)||5),remaining=Math.max(0,goal-todayWords);
  if(learning.due)return {title:c(data,'taskDueTitle',{count:learning.due}),copy:c(data,'taskDueCopy'),action:c(data,'reviewNow'),page:'review'};
  if(mistakes)return {title:c(data,'taskMistakeTitle',{count:mistakes}),copy:c(data,'taskMistakeCopy'),action:c(data,'openMistakes'),page:'mistakes'};
  if(draft)return {title:c(data,'taskDraftTitle'),copy:c(data,'taskDraftCopy',{title:draft.title||draft.topic||'IELTS Writing'}),action:c(data,'continueWriting'),href:'studynova_writing_vault.html'};
  if(remaining)return {title:c(data,'taskWordsTitle',{count:remaining}),copy:c(data,'taskWordsCopy',{done:todayWords,goal:goal}),action:c(data,'addWords'),page:'add'};
  if(!days.some(function(day){return day.reading>0}))return {title:c(data,'taskReadingTitle'),copy:c(data,'taskReadingCopy'),action:c(data,'openReading'),page:'reading'};
  if(!days.slice(-3).some(function(day){return day.speaking>0}))return {title:c(data,'taskSpeakingTitle'),copy:c(data,'taskSpeakingCopy'),action:c(data,'openSpeaking'),page:'speaking'};
  return {title:c(data,'taskTestTitle'),copy:c(data,'taskTestCopy'),action:c(data,'takeTest'),page:'test'};
}
function renderNext(data,writing,learning,days){
  var task=nextTask(data,writing,learning,days),button=document.getElementById('sn-progress-next-action');
  setText('sn-progress-next-title',task.title);setText('sn-progress-next-copy',task.copy);
  if(button){button.textContent=task.action;button.onclick=function(){if(task.href)window.location.assign(task.href);else if(typeof window.goTo==='function')window.goTo(task.page)}}
}

function avg(values){var valid=values.map(Number).filter(function(value){return isFinite(value)&&value>0});return valid.length?valid.reduce(function(sum,value){return sum+value},0)/valid.length:null}
function daysWith(days,kind){return days.filter(function(day){return day[kind]>0}).length}
function skillCard(skill,index){
  return '<article class="sn-progress-skill" style="--skill-color:'+skill.color+'"><span class="sn-progress-skill-icon"><sn-icon name="'+skill.icon+'" aria-hidden="true"></sn-icon></span><div class="sn-progress-skill-copy"><b>'+esc(skill.title)+'</b><strong>'+esc(skill.value)+'</strong><span>'+esc(skill.meta)+'</span></div><div class="sn-progress-skill-progress"><div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+skill.pct+'"><i style="width:'+skill.pct+'%"></i></div><small>'+esc(skill.progressLabel)+' · '+skill.pct+'%</small></div><button type="button" class="sn-progress-skill-action" data-progress-skill="'+index+'">'+esc(skill.action)+'</button></article>';
}
function renderSkills(data,writing,learning,days){
  var host=document.getElementById('sn-progress-skills');if(!host)return;
  var history=array(data.testHistory),testCount=Math.max(Number(data.testsDone)||0,history.length),testAverage=avg(history.map(function(item){return item.firstPct!=null?item.firstPct:item.score}));
  var reading=data.reading||{},passages=array(reading.passages).length,questions=array(reading.questions).length;
  var speaking=array(data.speakingLogs),speakingAverage=avg(speaking.map(function(item){return item.score}));
  var essays=array(writing.essays),improved=essays.filter(function(item){return /checked|improved|complete|hoàn/i.test(String(item.status||''))}).length,writingAverage=avg(essays.map(function(item){return item.band}));
  var activeLabel=c(data,'activeRate'),skills=[
    {icon:'vocabulary',color:'#60a5fa',title:c(data,'vocabulary'),value:formatNumber(data,learning.strong)+' / '+formatNumber(data,learning.total),meta:c(data,'wordsStrong',{strong:learning.strong,total:learning.total}),pct:learning.strongPct,progressLabel:c(data,'masteryRate'),action:c(data,'openMap'),page:'knowledge-map'},
    {icon:'review',color:'#34d399',title:c(data,'reviews'),value:formatNumber(data,learning.due),meta:c(data,'dueWords',{count:learning.due}),pct:learning.accuracy==null?0:learning.accuracy,progressLabel:c(data,'reviewAccuracy'),action:c(data,'reviewNow'),page:'review'},
    {icon:'test',color:'#a78bfa',title:c(data,'tests'),value:formatNumber(data,testCount),meta:c(data,'testCount',{count:testCount}),pct:testAverage==null?0:Math.round(testAverage),progressLabel:c(data,'testAverage'),action:c(data,'takeTest'),page:'test'},
    {icon:'reading-hub',color:'#22d3ee',title:c(data,'reading'),value:formatNumber(data,passages),meta:c(data,'passageCount',{count:passages,questions:questions}),pct:Math.round(daysWith(days,'reading')/days.length*100),progressLabel:activeLabel,action:c(data,'openReading'),page:'reading'},
    {icon:'speaking-studio',color:'#fbbf24',title:c(data,'speaking'),value:formatNumber(data,speaking.length),meta:c(data,'speakingCount',{count:speaking.length,average:speakingAverage==null?'—':speakingAverage.toFixed(1)}),pct:Math.round(daysWith(days,'speaking')/days.length*100),progressLabel:activeLabel,action:c(data,'openSpeaking'),page:'speaking'},
    {icon:'writing-vault',color:'#fb7185',title:c(data,'writing'),value:formatNumber(data,essays.length),meta:c(data,'writingCount',{count:essays.length,improved:improved})+(writingAverage==null?'':' · Band '+writingAverage.toFixed(1)),pct:Math.round(daysWith(days,'writing')/days.length*100),progressLabel:activeLabel,action:c(data,'openWriting'),href:'studynova_writing_vault.html'}
  ];
  host.innerHTML=skills.map(skillCard).join('');
  host.querySelectorAll('[data-progress-skill]').forEach(function(button){button.onclick=function(){var skill=skills[Number(button.dataset.progressSkill)];if(skill.href)window.location.assign(skill.href);else if(typeof window.goTo==='function')window.goTo(skill.page)}});
}

function renderCalendar(data,days){
  var host=document.getElementById('sn-progress-calendar');if(!host)return;
  var max=Math.max.apply(null,[1].concat(days.map(function(day){return day.total||(day.valid?1:0)}))),today=dayKey();
  host.innerHTML=days.map(function(day){var amount=day.total||(day.valid?1:0),ratio=amount/max,level=!day.active?0:ratio>.66?3:ratio>.33?2:1;return '<span class="sn-progress-calendar-day'+(day.key===today?' is-today':'')+'" data-level="'+level+'" title="'+esc(day.key)+'"><span>'+esc(dateFromKey(day.key).getDate())+'</span></span>'}).join('');
  setText('sn-progress-streak-summary',c(data,'calendarSummary',{count:days.filter(function(day){return day.active}).length}));
}

function recentEvents(data,writing){
  var events=[],testDays={};
  array(data.words).forEach(function(item){var date=item.updatedAt||item.at||item.createdAt;if(date)events.push({date:date,icon:'vocabulary',key:'eventWord',vars:{term:item.term||''},meta:'eventWordMeta',metaVars:{topic:item.topic||'General'}})});
  array(data.testHistory).forEach(function(item){var date=item.date||item.createdAt;if(date){testDays[keyFromValue(date)]=true;events.push({date:date,icon:'test',key:'eventTest',vars:{score:item.firstPct!=null?item.firstPct:(item.score||0)},meta:'tests'})}});
  Object.keys(data.activityDays||{}).forEach(function(key){var item=data.activityDays[key]||{};if(Number(item.reviews))events.push({date:item.updatedAt||key,icon:'review',key:'eventReview',vars:{count:item.reviews},meta:'eventReviewMeta'});if(Number(item.tests)&&!testDays[key])events.push({date:item.updatedAt||key,icon:'test',key:'eventTestFallback',vars:{count:item.tests},meta:'tests'})});
  array((data.reading||{}).passages).forEach(function(item){var date=item.at||item.createdAt;if(date)events.push({date:date,icon:'reading-hub',key:'eventReading',vars:{title:item.title||'Reading'},meta:'reading'})});
  array(data.speakingLogs).forEach(function(item){var date=item.date||item.createdAt;if(date)events.push({date:date,icon:'speaking-studio',key:'eventSpeaking',meta:'speaking'})});
  array(writing.essays).forEach(function(item){var date=item.updatedAt||item.createdAt;if(date)events.push({date:date,icon:'writing-vault',key:'eventWriting',vars:{title:item.title||item.topic||'IELTS Writing'},meta:'writing'})});
  array(writing.corrections).forEach(function(item){var date=item.updatedAt||item.createdAt||item.date;if(date)events.push({date:date,icon:'mistake-bank',key:'eventCorrection',meta:'writing'})});
  return events.filter(function(item){return dateValue(item.date)>0}).sort(function(a,b){return dateValue(b.date)-dateValue(a.date)}).slice(0,7);
}
function timeLabel(data,value){
  var ts=dateValue(value),now=Date.now(),diff=Math.floor((now-ts)/DAY_MS),locale=language(data)==='en'?'en-US':'vi-VN';
  if(diff<=0&&dayKey(new Date(ts))===dayKey())return c(data,'today');
  if(diff===1)return c(data,'yesterday');
  try{return new Intl.DateTimeFormat(locale,{day:'2-digit',month:'short'}).format(new Date(ts))}catch(e){return keyFromValue(value)}
}
function renderTimeline(data,writing){
  var host=document.getElementById('sn-progress-timeline');if(!host)return;
  var events=recentEvents(data,writing);
  if(!events.length){host.innerHTML='<div class="sn-progress-empty">'+esc(c(data,'recentEmpty'))+'</div>';return}
  host.innerHTML=events.map(function(item){return '<article class="sn-progress-event"><span class="sn-progress-event-icon"><sn-icon name="'+item.icon+'" aria-hidden="true"></sn-icon></span><div><b>'+esc(c(data,item.key,item.vars))+'</b><p>'+esc(c(data,item.meta,item.metaVars))+'</p></div><time datetime="'+esc(String(item.date))+'">'+esc(timeLabel(data,item.date))+'</time></article>'}).join('');
}

function persistRange(data,range){
  data.cfg=data.cfg||{};data.cfg.progressRange=range;
  if(window.S===data&&typeof window.save==='function')window.save();
  else try{localStorage.setItem(STORE,JSON.stringify(data))}catch(e){}
}
function render(){
  var root=document.getElementById('page-dash');if(!root)return;
  var data=state(),writing=writingState();data.cfg=data.cfg||{};
  var range=Number(data.cfg.progressRange)===30?30:7,keys=lastKeys(range),days=keys.map(function(key){return dayMetrics(data,writing,key)}),learning=learningStats(data),streak=streakStats(data,writing);
  renderStaticCopy(data);
  document.querySelectorAll('[data-progress-range]').forEach(function(button){button.setAttribute('aria-pressed',String(Number(button.dataset.progressRange)===range))});
  var goal=document.getElementById('inline-goal');if(goal&&document.activeElement!==goal)goal.value=Math.max(1,Number(data.cfg.daily)||5);
  renderKpis(data,learning,streak);renderChart(data,days);renderNext(data,writing,learning,days);renderSkills(data,writing,learning,days);renderCalendar(data,days);renderTimeline(data,writing);
}
function bind(){
  document.querySelectorAll('[data-progress-range]').forEach(function(button){button.addEventListener('click',function(){var data=state(),range=Number(button.dataset.progressRange)===30?30:7;persistRange(data,range);render()})});
  if(!window.__studyNovaProgressDashWrapped&&typeof window.renderDash==='function'){
    window.__studyNovaProgressDashWrapped=true;
    var baseRenderDash=window.renderDash;
    window.renderDash=function(){var result=baseRenderDash.apply(this,arguments);render();return result};
  }
  if(!window.__studyNovaProgressGoToWrapped&&typeof window.goTo==='function'){
    window.__studyNovaProgressGoToWrapped=true;
    var baseGoTo=window.goTo;
    window.goTo=function(page){var result=baseGoTo.apply(this,arguments);if(page==='dash')render();return result};
  }
  if(location.hash==='#progress'&&typeof window.goTo==='function')window.goTo('dash');
  render();
}

window.StudyNovaProgress={render:render,dayMetrics:dayMetrics,learningStats:learningStats};
window.addEventListener('studynova-realtime-update',function(){setTimeout(render,30)});
window.addEventListener('studynova-learning-update',render);
window.addEventListener('studynova-language-change',render);
window.addEventListener('studynova-auth-change',render);
window.addEventListener('storage',function(event){if(!event.key||event.key===STORE||event.key===WRITING_STORE){if(event.key===STORE&&typeof window.load==='function')window.load();render()}});
window.addEventListener('hashchange',function(){if(location.hash==='#progress'&&typeof window.goTo==='function')window.goTo('dash')});
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind):setTimeout(bind,0);
})();
