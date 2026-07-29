(function(){
'use strict';
/* Local-first, record-level sync shared by Home and Writing Vault. */
var STORES={vocabmaster_data_v1:'vocabulary',writingvault_data_v1:'writing'};
var QUEUE='novalab_realtime_queue_v1',IDS='novalab_realtime_ids_v1',REVS='novalab_realtime_revisions_v1';
var nativeSet=Storage.prototype.setItem,nativeRemove=Storage.prototype.removeItem;
var applying=false,startedFor='',channel=null,flushTimer=null,snapshots={};
function json(raw,fallback){try{var value=JSON.parse(raw);return value&&typeof value==='object'?value:fallback}catch(e){return fallback}}
function read(key){return json(localStorage.getItem(key),{})}
function uuid(){return crypto.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;return(c==='x'?r:(r&3|8)).toString(16)})}
function stable(value){if(!value||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return'['+value.map(stable).join(',')+']';return'{'+Object.keys(value).sort().map(function(k){return JSON.stringify(k)+':'+stable(value[k])}).join(',')+'}'}
function recordKey(type,id){return type+':'+id}
function idFor(type,identity){var ids=json(localStorage.getItem(IDS),{}),key=recordKey(type,identity);if(!ids[key]){ids[key]=uuid();nativeSet.call(localStorage,IDS,JSON.stringify(ids))}return ids[key]}
function identity(item,index){return String(item&&(item.id||item.draftId||item.essayId||item.correctionId||item.date||item.term)||index)}
function split(storeKey,data){
  var prefix=STORES[storeKey],out={},arrayNames=Object.keys(data||{}).filter(function(k){return Array.isArray(data[k])});
  arrayNames.forEach(function(name){data[name].forEach(function(item,index){var type=prefix+'_'+name.replace(/([A-Z])/g,'_$1').toLowerCase(),eid=idFor(type,identity(item,index));out[recordKey(type,eid)]={entity_type:type,entity_id:eid,payload:item}})});
  var root={};Object.keys(data||{}).forEach(function(k){if(!Array.isArray(data[k]))root[k]=data[k]});
  var rootType=prefix+'_state',rootId=idFor(rootType,'root');out[recordKey(rootType,rootId)]={entity_type:rootType,entity_id:rootId,payload:root};
  return out;
}
function enqueue(rows){if(!rows.length)return;var q=json(localStorage.getItem(QUEUE),[]);if(!Array.isArray(q))q=[];rows.forEach(function(row){var i=q.findIndex(function(x){return x.entity_type===row.entity_type&&x.entity_id===row.entity_id});if(i<0)q.push(row);else q[i]=row});nativeSet.call(localStorage,QUEUE,JSON.stringify(q));scheduleFlush()}
function localChanged(storeKey,raw){
  if(applying||!STORES[storeKey])return;
  var now=split(storeKey,json(raw,{})),before=snapshots[storeKey]||{},revs=json(localStorage.getItem(REVS),{}),rows=[];
  Object.keys(now).forEach(function(k){if(!before[k]||stable(before[k].payload)!==stable(now[k].payload)){revs[k]=(Number(revs[k])||0)+1;rows.push(Object.assign({},now[k],{revision:revs[k],deleted_at:null}))}});
  Object.keys(before).forEach(function(k){if(!now[k]){revs[k]=(Number(revs[k])||0)+1;rows.push(Object.assign({},before[k],{payload:{},revision:revs[k],deleted_at:new Date().toISOString()}))}});
  snapshots[storeKey]=now;nativeSet.call(localStorage,REVS,JSON.stringify(revs));enqueue(rows);
}
Storage.prototype.setItem=function(key,value){nativeSet.call(this,key,value);if(this===localStorage)localChanged(String(key),String(value))};
Storage.prototype.removeItem=function(key){var old=this===localStorage&&STORES[key]?localStorage.getItem(key):null;nativeRemove.call(this,key);if(old!==null)localChanged(String(key),'{}')};
function storeFor(type){return type.indexOf('vocabulary_')===0?'vocabmaster_data_v1':type.indexOf('writing_')===0?'writingvault_data_v1':''}
function arrayName(type){return type.replace(/^(vocabulary|writing)_/,'').replace(/_([a-z])/g,function(_,c){return c.toUpperCase()})}
function notify(storeKey,row){window.dispatchEvent(new CustomEvent('studynova-realtime-update',{detail:{storageKey:storeKey,entityType:row.entity_type,entityId:row.entity_id}}));setTimeout(function(){try{if(typeof window.load==='function')window.load();if(storeKey==='writingvault_data_v1'&&typeof window.renderAll==='function')window.renderAll();if(storeKey==='vocabmaster_data_v1'){if(typeof window.renderDash==='function')window.renderDash();if(typeof window.renderVocab==='function')window.renderVocab();if(typeof window.novaV8RenderToday==='function')window.novaV8RenderToday();if(typeof window.refreshVocab==='function')window.refreshVocab()}}catch(e){console.warn('Realtime UI refresh failed',e)}},0)}
function applyRow(row){
  if(!row||!window.SN||!SN.user||row.user_id!==SN.user.id||row.source_device_id===SN.deviceId)return;
  var storeKey=storeFor(row.entity_type);if(!storeKey)return;var revs=json(localStorage.getItem(REVS),{}),rk=recordKey(row.entity_type,row.entity_id);if(Number(revs[rk])>=Number(row.revision))return;
  var data=read(storeKey),name=arrayName(row.entity_type);applying=true;
  try{if(/_state$/.test(row.entity_type)){if(!row.deleted_at)Object.assign(data,row.payload||{})}else{if(!Array.isArray(data[name]))data[name]=[];var ids=json(localStorage.getItem(IDS),{}),matchKey=Object.keys(ids).find(function(k){return k.indexOf(row.entity_type+':')===0&&ids[k]===row.entity_id}),legacy=matchKey&&matchKey.slice(row.entity_type.length+1),i=data[name].findIndex(function(x,index){return identity(x,index)===legacy});if(row.deleted_at){if(i>=0)data[name].splice(i,1)}else if(i>=0)data[name][i]=row.payload;else data[name].unshift(row.payload);if(!matchKey){ids[recordKey(row.entity_type,identity(row.payload,data[name].length-1))]=row.entity_id;nativeSet.call(localStorage,IDS,JSON.stringify(ids))}}revs[rk]=Number(row.revision)||1;nativeSet.call(localStorage,REVS,JSON.stringify(revs));nativeSet.call(localStorage,storeKey,JSON.stringify(data));snapshots[storeKey]=split(storeKey,data)}finally{applying=false}notify(storeKey,row)
}
async function flush(){
  clearTimeout(flushTimer);if(!navigator.onLine||!SN.client||!SN.user)return;var q=json(localStorage.getItem(QUEUE),[]);if(!Array.isArray(q)||!q.length)return;
  var deviceId=SN.deviceId;var rows=q.map(function(x){return Object.assign({},x,{user_id:SN.user.id,source_device_id:deviceId,updated_at:new Date().toISOString()})});
  var result=await SN.client.from('user_sync_records').upsert(rows,{onConflict:'user_id,entity_type,entity_id'});if(result.error){console.warn('Realtime sync deferred',result.error);return scheduleFlush(5000)}
  var sent=new Set(rows.map(function(x){return recordKey(x.entity_type,x.entity_id)+':'+x.revision}));var latest=json(localStorage.getItem(QUEUE),[]).filter(function(x){return !sent.has(recordKey(x.entity_type,x.entity_id)+':'+x.revision)});nativeSet.call(localStorage,QUEUE,JSON.stringify(latest))
}
function scheduleFlush(delay){clearTimeout(flushTimer);flushTimer=setTimeout(function(){flush().catch(function(e){console.warn('Realtime sync failed',e)})},delay==null?100:delay)}
async function start(){
  if(!window.SN||!SN.client||!SN.user||startedFor===SN.user.id)return;stop();startedFor=SN.user.id;SN.deviceId=(function(){var id=localStorage.getItem('novalab_device_id_v1');if(!id){id=uuid();nativeSet.call(localStorage,'novalab_device_id_v1',id)}return id})();
  Object.keys(STORES).forEach(function(k){snapshots[k]=split(k,read(k))});
  var initial=await SN.client.from('user_sync_records').select('*').eq('user_id',SN.user.id),cloudKeys=new Set();if(!initial.error)(initial.data||[]).forEach(function(row){cloudKeys.add(recordKey(row.entity_type,row.entity_id));applyRow(row)});
  channel=SN.client.channel('studynova-sync-'+SN.user.id).on('postgres_changes',{event:'*',schema:'public',table:'user_sync_records',filter:'user_id=eq.'+SN.user.id},function(message){applyRow(message.new||message.old)}).subscribe();
  /* First login migrates every existing local item without replacing the legacy backup. */
  Object.keys(STORES).forEach(function(k){var rows=split(k,read(k)),revs=json(localStorage.getItem(REVS),{}),missing=[];Object.keys(rows).forEach(function(rk){if(!cloudKeys.has(rk)){revs[rk]=Math.max(1,Number(revs[rk])||0);missing.push(Object.assign({},rows[rk],{revision:revs[rk],deleted_at:null}))}});nativeSet.call(localStorage,REVS,JSON.stringify(revs));snapshots[k]=rows;enqueue(missing)});scheduleFlush()
}
function stop(){if(channel&&window.SN&&SN.client)SN.client.removeChannel(channel);channel=null;startedFor=''}
window.addEventListener('online',function(){scheduleFlush(0)});window.addEventListener('pagehide',stop);
window.addEventListener('studynova-auth-change',function(){if(SN.user)start().catch(console.warn);else stop()});
var poll=setInterval(function(){if(window.SN&&SN.user)start().catch(console.warn)},500);window.addEventListener('pagehide',function(){clearInterval(poll)},{once:true});
})();
