(function (root) {
  'use strict';
  var PROJECT = 'mamxrfceltluvlonvsqx', SUBJECT = 'chinese', VERSION = 1;
  var TABLES = ['chinese_vocabulary','chinese_review_history','chinese_study_sessions','chinese_progress','chinese_writings'];
  var nativeSet = Storage.prototype.setItem, nativeGet = Storage.prototype.getItem;
  var activeUser = '', generation = 0, channel = null, flushing = false;
  var anonymousKey = 'studynova:' + PROJECT + ':anonymous:' + SUBJECT + ':v' + VERSION;
  function cacheKey(uid){ return 'studynova:' + PROJECT + ':' + uid + ':' + SUBJECT + ':v' + VERSION }
  function queueKey(uid){ return cacheKey(uid) + ':queue' }
  function parse(raw, fallback){ try { var value=JSON.parse(raw); return value&&typeof value==='object'?value:fallback } catch(e){ return fallback } }
  function empty(){ return {words:[],reviewLog:[],reviewSession:null,settings:{},streak:0,lastStudy:'',writing:{essays:[],corrections:[],topics:[]}} }
  function read(uid){ return Object.assign(empty(),parse(nativeGet.call(localStorage,uid?cacheKey(uid):anonymousKey),{})) }
  function publish(data){ root.dispatchEvent(new CustomEvent('studynova:subject-data',{detail:{subject:SUBJECT,userId:activeUser||null,data:data}})) }
  function local(data){ nativeSet.call(localStorage,activeUser?cacheKey(activeUser):anonymousKey,JSON.stringify(data)) }
  function uuid(value){ var raw=String(value||'');if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw)) return raw;var key=cacheKey(activeUser||'anonymous')+':ids',map=parse(nativeGet.call(localStorage,key),{});if(!map[raw]){map[raw]=crypto.randomUUID();nativeSet.call(localStorage,key,JSON.stringify(map))}return map[raw] }
  function fingerprint(type,value){ var identity=value&&(value.id||value.date||value.answeredAt||value.updatedAt||value.createdAt);return type+':'+String(identity||JSON.stringify(value||{})) }
  function rows(data,uid){
    return {
      chinese_vocabulary:(data.words||[]).map(function(w){return{id:uuid(w.id),user_id:uid,hanzi:w.hanzi||'',pinyin:w.pinyin||'',meaning:w.meaning||'',hsk:w.hsk||null,topic:w.topic||null,payload:w,source_fingerprint:fingerprint('word',w),updated_at:new Date().toISOString()}}),
      chinese_review_history:(data.reviewLog||[]).map(function(x){var fp=fingerprint('review',x);return{id:uuid(x.id||fp),user_id:uid,vocabulary_id:/^[0-9a-f-]{36}$/i.test(x.wordId||'')?x.wordId:null,correct:!!x.correct,mode:x.mode||'unknown',answered_at:x.date||new Date().toISOString(),payload:x,source_fingerprint:fp}}),
      chinese_study_sessions:data.reviewSession?[{id:uuid(data.reviewSession.id),user_id:uid,status:data.reviewSession.done?'completed':'active',mode:data.reviewSession.mode||null,payload:data.reviewSession,source_fingerprint:'active-review'}]:[],
      chinese_progress:[{user_id:uid,streak:Number(data.streak)||0,last_study:data.lastStudy||null,payload:{settings:data.settings||{}},updated_at:new Date().toISOString()}],
      chinese_writings:((data.writing&&data.writing.essays)||[]).map(function(x){return{id:uuid(x.id),user_id:uid,title:x.title||'',topic:x.topic||null,content:x.content||'',notes:x.notes||'',payload:x,source_fingerprint:fingerprint('writing',x),updated_at:x.updatedAt||new Date().toISOString()}})
    }
  }
  function enqueue(data){
    var previous=read(activeUser);local(data); if(!activeUser)return;
    /* The user and subject are captured now, not when connectivity returns. */
    var oldRows=rows(previous,activeUser),newRows=rows(data,activeUser),deleted={};TABLES.forEach(function(t){var keep=new Set(newRows[t].map(function(x){return x.source_fingerprint}).filter(Boolean));deleted[t]=oldRows[t].map(function(x){return x.source_fingerprint}).filter(function(x){return x&&!keep.has(x)})});
    nativeSet.call(localStorage,queueKey(activeUser),JSON.stringify({userId:activeUser,subject:SUBJECT,snapshot:data,deleted:deleted,createdAt:new Date().toISOString()}));
    flush();
  }
  async function flush(){
    if(flushing||!navigator.onLine||!activeUser||!root.SN||!SN.client)return;
    var uid=activeUser, item=parse(nativeGet.call(localStorage,queueKey(uid)),null);
    if(!item||item.userId!==uid||item.subject!==SUBJECT)return;
    flushing=true;
    try { var grouped=rows(item.snapshot,uid);
      for (var i=0;i<TABLES.length;i++) { var table=TABLES[i], values=grouped[table]; if(!values.length)continue;
        var result=await SN.client.from(table).upsert(values,{onConflict:table==='chinese_progress'?'user_id':'user_id,source_fingerprint'}); if(result.error)throw result.error;
      }
      for(var j=0;j<TABLES.length;j++){var target=TABLES[j],removed=item.deleted&&item.deleted[target]||[];if(!removed.length)continue;var deletion=await SN.client.from(target).delete().eq('user_id',uid).in('source_fingerprint',removed);if(deletion.error)throw deletion.error}
      if(activeUser===uid) localStorage.removeItem(queueKey(uid));
    } catch(error){ console.warn('Chinese sync deferred',error) } finally { flushing=false }
  }
  async function load(uid,token){
    var results=await Promise.all(TABLES.map(function(t){return SN.client.from(t).select('*').eq('user_id',uid)}));
    if(token!==generation||uid!==activeUser)return;
    var failure=results.find(function(r){return r.error});
    if(failure){ console.warn('Chinese load failed; local data was preserved',failure.error); return }
    var by={};TABLES.forEach(function(t,i){by[t]=results[i].data||[]}); var p=by.chinese_progress[0];
    var data=empty();data.words=by.chinese_vocabulary.map(function(x){return Object.assign({},x.payload,{id:x.id,hanzi:x.hanzi,pinyin:x.pinyin,meaning:x.meaning,hsk:x.hsk,topic:x.topic})});
    data.reviewLog=by.chinese_review_history.map(function(x){return Object.assign({},x.payload,{id:x.id,wordId:x.vocabulary_id,correct:x.correct,mode:x.mode,date:x.answered_at})});
    var session=by.chinese_study_sessions.find(function(x){return x.status==='active'});data.reviewSession=session&&Object.assign({},session.payload,{id:session.id});
    if(p){data.streak=p.streak;data.lastStudy=p.last_study||'';data.settings=p.payload.settings||{}}
    data.writing={essays:by.chinese_writings.map(function(x){return Object.assign({},x.payload,{id:x.id,title:x.title,topic:x.topic,content:x.content,notes:x.notes})}),corrections:[],topics:[]};
    local(data);publish(data); /* A successful empty read stays empty; IELTS is never consulted. */
  }
  function stop(){generation++;if(channel&&root.SN&&SN.client)SN.client.removeChannel(channel);channel=null}
  function switchUser(user){stop();activeUser=user&&user.id||'';publish(read(activeUser));if(!activeUser||!SN.client)return;var token=generation;
    load(activeUser,token);channel=SN.client.channel('studynova-chinese-'+activeUser).on('postgres_changes',{event:'*',schema:'public'},function(message){var row=message.new||message.old||{};if(TABLES.includes(message.table)&&row.user_id===activeUser&&activeUser===user.id)load(user.id,generation)}).subscribe();flush()
  }
  root.StudyNovaSubjectData={subject:SUBJECT,read:function(){return read(activeUser)},save:enqueue,flush:flush,switchUser:switchUser,stop:stop,cacheKey:cacheKey};
  root.addEventListener('studynova-auth-change',function(e){switchUser(e.detail&&e.detail.user)});root.addEventListener('online',flush);root.addEventListener('pagehide',stop);
})(window);
