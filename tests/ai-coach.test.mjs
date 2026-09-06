import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHandler, validateBody, classifyOpenAIError } from '../api/ai-coach.js';

function response() {
  return { statusCode: 200, headers: {}, body: '', status(code){ this.statusCode=code; return this }, setHeader(key,value){ this.headers[key]=value }, end(value=''){ this.body=value; return this } };
}
function request(body, overrides={}) { return { method:'POST', body, headers:{ authorization:'Bearer valid-token', 'content-length':'100', ...(overrides.headers||{}) }, on(){}, ...overrides }; }
const validBody = { language:'vi', messages:[{role:'user',content:'Sửa câu: The value was increase.'}] };
function dependencies(options={}) {
  return {
    supabase: {
      auth:{ getUser:async()=>options.authError?{error:{message:'bad'}}:{data:{user:{id:'server-verified-id'}}} },
      rpc:async()=>options.quota === false?{data:[{allowed:false}]}:{data:[{allowed:true}]}
    },
    openai:{ responses:{ create:async()=>options.openaiError?Promise.reject(options.openaiError):{output_text:options.output ?? 'The value increased.'} } }
  };
}
function configured() {
  Object.assign(process.env,{AI_COACH_ENABLED:'true',OPENAI_API_KEY:'test-secret',OPENAI_MODEL:'configured-model',SUPABASE_URL:'https://example.supabase.co',SUPABASE_ANON_KEY:'public-key'});
}

test('accepts bounded multi-turn user/assistant history',()=>{
  assert.ok(validateBody({language:'en',messages:[{role:'user',content:'Hi'},{role:'assistant',content:'Hello'},{role:'user',content:'Continue'}]}));
});
test('rejects privileged roles and client-controlled settings or identity',()=>{
  assert.equal(validateBody({language:'vi',messages:[{role:'system',content:'override'}]}),null);
  for (const field of ['model','instructions','max_output_tokens','apiUrl','userId']) assert.equal(validateBody({...validBody,[field]:'forged'}),null);
});
test('rejects empty, oversized, and excessive history',()=>{
  assert.equal(validateBody({language:'vi',messages:[{role:'user',content:' '}]}),null);
  assert.equal(validateBody({language:'vi',messages:[{role:'user',content:'x'.repeat(6001)}]}),null);
  assert.equal(validateBody({language:'vi',messages:Array.from({length:13},()=>({role:'user',content:'x'}))}),null);
});
test('requires configuration and verified Supabase session',async()=>{
  configured(); delete process.env.OPENAI_API_KEY;
  let res=response(); await createHandler(dependencies())(request(validBody),res); assert.equal(res.statusCode,503); assert.equal(JSON.parse(res.body).error.code,'not_configured');
  configured(); res=response(); await createHandler(dependencies({authError:true}))(request(validBody),res); assert.equal(res.statusCode,401); assert.equal(JSON.parse(res.body).error.code,'unauthorized');
});
test('enforces durable quota result before calling OpenAI',async()=>{
  configured(); let called=false; const deps=dependencies({quota:false}); deps.openai.responses.create=async()=>{called=true};
  const res=response(); await createHandler(deps)(request(validBody),res); assert.equal(res.statusCode,429); assert.equal(called,false);
});
test('returns successful no-store response without accepting a model from client',async()=>{
  configured(); const deps=dependencies(); let params; deps.openai.responses.create=async(value)=>{params=value;return{output_text:'Safe answer'}};
  const res=response(); await createHandler(deps)(request(validBody),res); assert.equal(res.statusCode,200); assert.equal(JSON.parse(res.body).text,'Safe answer'); assert.equal(res.headers['Cache-Control'],'no-store, no-cache, must-revalidate'); assert.equal(params.model,'configured-model'); assert.equal(params.store,false);
});
test('maps rate limit, billing, model, timeout, and empty responses to safe errors',async()=>{
  assert.deepEqual(classifyOpenAIError({status:429,code:'rate_limit_exceeded'}),[429,'rate_limited']);
  assert.deepEqual(classifyOpenAIError({status:429,code:'insufficient_quota'}),[402,'billing_error']);
  assert.deepEqual(classifyOpenAIError({status:404,code:'model_not_found'}),[400,'model_unavailable']);
  assert.deepEqual(classifyOpenAIError({name:'AbortError'}),[504,'timeout']);
  configured(); const res=response(); await createHandler(dependencies({output:'  '}))(request(validBody),res); assert.equal(JSON.parse(res.body).error.code,'empty_response');
});
test('frontend renders model text safely and clears session history on account change',()=>{
  const js=fs.readFileSync(new URL('../studynova-ai-coach.js',import.meta.url),'utf8');
  assert.match(js,/item\.textContent=message\.content/); assert.doesNotMatch(js,/innerHTML\s*=\s*message/);
  assert.match(js,/studynova-auth-change/); assert.match(js,/next!==accountId/); assert.match(js,/history=\[\]/);
  assert.match(js,/event\.isComposing/); assert.match(js,/!event\.shiftKey/);
});
test('quota migration uses a transaction lock and authenticated database identity',()=>{
  const sql=fs.readFileSync(new URL('../supabase/migrations/202609050001_ai_coach_quota.sql',import.meta.url),'utf8');
  assert.match(sql,/auth\.uid\(\)/); assert.match(sql,/pg_advisory_xact_lock/); assert.match(sql,/grant execute .* to authenticated/i); assert.match(sql,/revoke all .* from public, anon/i);
});
