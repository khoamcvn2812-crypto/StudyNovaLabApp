(function(){
'use strict';
var history=[],controller=null,lastFailed='',accountId=null,composing=false;
var copy={
 vi:{empty:'Hãy nhập câu hỏi.',login:'Vui lòng đăng nhập để dùng AI Coach.',thinking:'AI Coach đang trả lời…',send:'Gửi',stop:'Dừng',retry:'Thử lại',network:'Mất kết nối khi gửi yêu cầu. Bản nháp của bạn vẫn được giữ.',protocol:'Máy chủ trả về phản hồi không hợp lệ. Vui lòng thử lại.',cancelled:'Đã dừng yêu cầu.',timeout:'Yêu cầu quá thời gian chờ. Bạn có thể thử lại.',newChat:'Đã bắt đầu cuộc trò chuyện mới.'},
 en:{empty:'Please enter a question.',login:'Please sign in to use AI Coach.',thinking:'AI Coach is responding…',send:'Send',stop:'Stop',retry:'Retry',network:'The request lost its network connection. Your draft has been kept.',protocol:'The server returned an invalid response. Please try again.',cancelled:'Request stopped.',timeout:'The request timed out. You can try again.',newChat:'Started a new conversation.'}
};
var labels={vi:{notice:'AI Coach là trợ lý AI. Nội dung bạn gửi sẽ được chuyển đến OpenAI để xử lý. Lịch sử chỉ được giữ trong phiên này; không gửi email hoặc toàn bộ dữ liệu học tập.',vocab:'Từ vựng',correct:'Sửa câu',message:'Tin nhắn',new_chat:'Cuộc trò chuyện mới',placeholder:'Nhập câu hỏi… Enter để gửi, Shift+Enter để xuống dòng'},en:{notice:'AI Coach is an AI assistant. Content you send is transferred to OpenAI for processing. History is kept only for this session; your email and full learning data are not sent.',vocab:'Vocabulary',correct:'Correct a sentence',message:'Message',new_chat:'New conversation',placeholder:'Type a question… Enter to send, Shift+Enter for a new line'}};
function lang(){try{return localStorage.getItem('novalab_language_v1')==='en'?'en':'vi'}catch{return'vi'}}
function el(id){return document.getElementById(id)}
function translate(){var values=labels[lang()];document.querySelectorAll('[data-sn-ai]').forEach(function(node){node.textContent=values[node.dataset.snAi]||node.textContent});var input=el('sn-ai-input');if(input)input.placeholder=values.placeholder;render()}
function say(text,type){var node=el('sn-ai-status');if(node){node.textContent=text||'';node.className='sn-ai-msg '+(type||'')}}
function render(){var chat=el('sn-ai-chat');if(!chat)return;chat.replaceChildren();if(!history.length){var empty=document.createElement('div');empty.className='sn-ai-empty';empty.textContent=lang()==='en'?'Ask about IELTS vocabulary, grammar, Writing, or practise Speaking in text.':'Hỏi về từ vựng, ngữ pháp, IELTS Writing hoặc luyện Speaking bằng hội thoại văn bản.';chat.appendChild(empty)}history.forEach(function(message){var item=document.createElement('div');item.className='sn-ai-message '+message.role;item.textContent=message.content;chat.appendChild(item)});chat.scrollTop=chat.scrollHeight}
function busy(on){var send=el('sn-ai-send'),stop=el('sn-ai-stop'),input=el('sn-ai-input');if(send){send.disabled=on;send.textContent=on?'…':copy[lang()].send}if(stop)stop.hidden=!on;if(input)input.disabled=on}
async function accessToken(){if(!window.SN||!SN.client)return'';var result=await SN.client.auth.getSession();return result.data.session&&result.data.session.access_token||''}
var safeErrors={
 vi:{disabled:'AI Coach chưa được bật.',not_configured:'AI Coach chưa được cấu hình đầy đủ.',unauthorized:'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',quota_exceeded:'Bạn đã hết lượt AI trong khoảng thời gian này. Vui lòng thử lại sau.',rate_limited:'Dịch vụ AI đang bận. Vui lòng thử lại sau.',billing_error:'Dịch vụ AI đã hết quota.',model_unavailable:'Model AI được cấu hình hiện không khả dụng.',openai_auth_error:'Dịch vụ AI chưa được xác thực đúng ở máy chủ.',timeout:'AI Coach phản hồi quá lâu. Bạn có thể thử lại.',empty_response:'AI Coach không trả về nội dung. Vui lòng thử lại.',invalid_request:'Nội dung gửi lên không hợp lệ hoặc quá dài.',server_error:'AI Coach tạm thời gặp lỗi. Vui lòng thử lại sau.'},
 en:{disabled:'AI Coach is not enabled.',not_configured:'AI Coach is not fully configured.',unauthorized:'Your session has expired. Please sign in again.',quota_exceeded:'You have reached the AI usage limit. Please try again later.',rate_limited:'The AI service is busy. Please try again later.',billing_error:'The AI service has no remaining quota.',model_unavailable:'The configured AI model is unavailable.',openai_auth_error:'The AI service is not correctly authenticated on the server.',timeout:'AI Coach took too long to respond. You can try again.',empty_response:'AI Coach returned no content. Please try again.',invalid_request:'The request is invalid or too large.',server_error:'AI Coach is temporarily unavailable. Please try again later.'}
};
function responseError(message,code,requestId){var suffix=requestId?' ('+(lang()==='en'?'request':'yêu cầu')+': '+requestId+')':'';return Object.assign(new Error(message+suffix),{code:code,requestId:requestId})}
async function readResponse(response){
 var requestId=response.headers&&response.headers.get('x-request-id')||'';
 var type=String(response.headers&&response.headers.get('content-type')||'').toLowerCase();
 var raw=await response.text();
 if(!type.includes('application/json')||!raw.trim())throw responseError(copy[lang()].protocol,'invalid_response',requestId);
 var data;try{data=JSON.parse(raw)}catch(_){throw responseError(copy[lang()].protocol,'invalid_response',requestId)}
 if(!response.ok){var code=data&&data.error&&data.error.code;throw responseError(safeErrors[lang()][code]||safeErrors[lang()].server_error,code||'server_error',data&&data.error&&data.error.requestId||requestId)}
 var answer=String(data&&data.text||'').trim();if(!answer)throw responseError(safeErrors[lang()].empty_response,'empty_response',data&&data.requestId||requestId);return answer
}
if(window.__SN_AI_TEST__)window.__snAiTest={readResponse:readResponse};
async function submit(text){text=String(text||'').trim();if(!text)return say(copy[lang()].empty,'error');if(controller)return;var input=el('sn-ai-input'),retry=el('sn-ai-retry'),token='';try{token=await accessToken()}catch(_){return say(safeErrors[lang()].server_error,'error')}if(!token){say(copy[lang()].login,'error');if(window.snOpenAuth)snOpenAuth();return}if(retry)retry.hidden=true;lastFailed='';history.push({role:'user',content:text});render();busy(true);say(copy[lang()].thinking,'ok');controller=new AbortController();var activeController=controller,timedOut=false,timer=setTimeout(function(){timedOut=true;activeController.abort()},35000);try{var response=await fetch('/api/ai-coach',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({language:lang(),messages:history.slice(-12)}),signal:activeController.signal,cache:'no-store'});var answer=await readResponse(response);history.push({role:'assistant',content:answer});if(input)input.value='';say('', '');render()}catch(error){history.pop();lastFailed=text;if(input)input.value=text;var message=error.name==='AbortError'?(timedOut?copy[lang()].timeout:copy[lang()].cancelled):(error instanceof TypeError?copy[lang()].network:error.message||safeErrors[lang()].server_error);say(message,'error');if(retry)retry.hidden=error.name==='AbortError'&&!timedOut;if(error.code==='unauthorized'&&window.snOpenAuth)snOpenAuth()}finally{clearTimeout(timer);controller=null;busy(false)}}
window.snAiSend=function(){submit(el('sn-ai-input')&&el('sn-ai-input').value)};
window.snAiStop=function(){if(controller)controller.abort()};
window.snAiRetry=function(){if(lastFailed)submit(lastFailed)};
window.snAiNewChat=function(){if(controller)controller.abort();history=[];lastFailed='';if(el('sn-ai-input'))el('sn-ai-input').value='';if(el('sn-ai-retry'))el('sn-ai-retry').hidden=true;say(copy[lang()].newChat,'ok');render()};
window.snAiStarter=function(text){var input=el('sn-ai-input');if(input){input.value=text;input.focus()}};
window.snOpenAiPanel=function(){var modal=el('sn-ai-modal');if(modal)modal.classList.add('open');setTimeout(function(){el('sn-ai-input')?.focus()},50)};
window.snCloseAiPanel=function(){el('sn-ai-modal')?.classList.remove('open')};
// Route legacy StudyNova AI entry points to this authenticated coach instead of
// the old copy-and-open placeholder flow.
window.toggleAI=window.snOpenAiPanel;
window.aiQ=function(prefix){window.snOpenAiPanel();window.snAiStarter(prefix||'')};
window.aiFromAdd=function(){var term=el('i-term')?.value.trim()||'';var meaning=el('i-def')?.value.trim()||'';window.snOpenAiPanel();window.snAiStarter('Giải thích từ/cụm từ này, gồm nghĩa, cách dùng, collocations và ví dụ IELTS: '+term+(meaning?' (nghĩa hiện có: '+meaning+')':''))};
window.doAI=function(){var legacy=el('ai-in');window.snOpenAiPanel();if(legacy?.value)window.snAiStarter(legacy.value)};
window.addEventListener('studynova-auth-change',function(event){var next=event.detail&&event.detail.user&&event.detail.user.id||null;if(accountId!==null&&next!==accountId)window.snAiNewChat();accountId=next});
window.addEventListener('studynova-language-change',translate);
document.addEventListener('DOMContentLoaded',function(){var input=el('sn-ai-input');if(input){input.addEventListener('compositionstart',function(){composing=true});input.addEventListener('compositionend',function(){composing=false});input.addEventListener('keydown',function(event){if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&!composing){event.preventDefault();window.snAiSend()}})}translate()});
})();
