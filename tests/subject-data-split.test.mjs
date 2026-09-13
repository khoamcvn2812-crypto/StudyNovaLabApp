import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync('chinese/assets/app.js','utf8');
const data=fs.readFileSync('shared/subject-data.js','utf8');
const realtime=fs.readFileSync('studynova-realtime.js','utf8');
const sql=fs.readFileSync('supabase/migrations/202609130001_split_chinese_learning_store.sql','utf8');

test('empty Chinese never falls back to IELTS',()=>{
  assert.equal(app.includes("new LocalStorageAdapter('vocabmaster_data_v1')"),false);
  assert.match(data,/function empty\(\)\{ return \{words:\[\]/);
  assert.doesNotMatch(data,/vocabmaster_data_v1|user_app_data/);
});
test('subject access and offline operations are account scoped',()=>{
  assert.match(data,/studynova:' \+ PROJECT \+ ':' \+ uid \+ ':' \+ SUBJECT/);
  assert.match(data,/userId:activeUser,subject:SUBJECT/);
  assert.match(data,/token!==generation\|\|uid!==activeUser/);
  assert.match(data,/row\.user_id===activeUser/);
  assert.doesNotMatch(realtime,/chinesemaster_data_v1/);
  assert.match(realtime,/persistAccountCache/);
  assert.match(realtime,/owner&&owner!==nextUser/);
});
test('migration enables owner RLS and parent ownership validation',()=>{
  for(const table of ['chinese_vocabulary','chinese_review_history','chinese_study_sessions','chinese_progress','chinese_writings']) assert.match(sql,new RegExp(`create table if not exists public\\.${table}`));
  for(const operation of ['select','insert','update','delete']) assert.match(sql,new RegExp(`create policy "owner ${operation}"`));
  assert.match(sql,/check_chinese_review_owner/);
  assert.match(sql,/source_fingerprint/);
  assert.match(sql,/chinese_migration_id_map/);
});
