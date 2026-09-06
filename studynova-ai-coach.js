(function(){
'use strict';
var history=[],controller=null,lastFailed='',accountId=null,composing=false;
var copy={
 vi:{empty:'Hãy nhập câu hỏi.',login:'Vui lòng đăng nhập để dùng AI Coach.',thinking:'AI Coach đang trả lời…',send:'Gửi',stop:'Dừng',retry:'Thử lại',network:'Không thể kết nối. Bản nháp của bạn vẫn được giữ.',cancelled:'Đã dừng yêu cầu.',newChat:'Đã bắt đầu cuộc trò chuyện mới.'},
 en:{empty:'Please enter a question.',login:'Please sign in to use AI Coach.',thinking:'AI Coach is responding…',send:'Send',stop:'Stop',retry:'Retry',network:'Unable to connect. Your draft has been kept.',cancelled:'Request stopped.',newChat:'Started a new conversation.'}
};
var labels={vi:{notice:'AI Coach là trợ lý AI. Nội dung bạn gửi sẽ được chuyển đến OpenAI để xử lý. Lịch sử chỉ được giữ trong phiên này; không gửi email hoặc toàn bộ dữ liệu học tập.',vocab:'Từ vựng',correct:'Sửa câu',message:'Tin nhắn',new_chat:'Cuộc trò chuyện mới',placeholder:'Nhập câu hỏi… Enter để gửi, Shift+Enter để xuống dòng'},en:{notice:'AI Coach is an AI assistant. Content you send is transferred to OpenAI for processing. History is kept only for this session; your email and full learning data are not sent.',vocab:'Vocabulary',correct:'Correct a sentence',message:'Message',new_chat:'New conversation',placeholder:'Type a question… Enter to send, Shift+Enter for a new line'}};
function lang(){try{return localStorage.getItem('novalab_language_v1')==='en'?'en':'vi'}catch{return'vi'}}
function el(id){return document.getElementById(id)}
function translate(){var values=labels[lang()];document.querySelectorAll('[data-sn-ai]').forEach(function(node){node.textContent=values[node.dataset.snAi]||node.textContent});var input=el('sn-ai-input');if(input)input.placeholder=values.placeholder;render()}
function say(text,type){var node=el('sn-ai-status');if(node){node.textContent=text||'';node.className='sn-ai-msg '+(type||'')}}
function render(){var chat=el('sn-ai-chat');if(!chat)return;chat.replaceChildren();if(!history.length){var empty=document.createElement('div');empty.className='sn-ai-empty';empty.textContent=lang()==='en'?'Ask about IELTS vocabulary, grammar, Writing, or practise Speaking in text.':'Hỏi về từ vựng, ngữ pháp, IELTS Writing hoặc luyện Speaking bằng hội thoại văn bản.';chat.appendChild(empty)}history.forEach(function(message){var item=document.createElement('div');item.className='sn-ai-message '+message.role;item.textContent=message.content;chat.appendChild(item)});chat.scrollTop=chat.scrollHeight}
function busy(on){var send=el('sn-ai-send'),stop=el('sn-ai-stop'),input=el('sn-ai-input');if(send){send.disabled=on;send.textContent=on?'…':copy[lang()].send}if(stop)stop.hidden=!on;if(input)input.disabled=on}
async function accessToken(){if(!window.SN||!SN.client)return'';var result=await SN.client.auth.getSession();return result.data.session&&result.data.session.access_token||''}
async function submit(text){text=String(text||'').trim();if(!text)return say(copy[lang()].empty,'error');if(controller)return;var token=await accessToken();if(!token){say(copy[lang()].login,'error');if(window.snOpenAuth)snOpenAuth();return}var input=el('sn-ai-input'),retry=el('sn-ai-retry');if(retry)retry.hidden=true;lastFailed='';history.push({role:'user',content:text});render();busy(true);say(copy[lang()].thinking,'ok');controller=new AbortController();try{var response=await fetch('/api/ai-coach',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({language:lang(),messages:history.slice(-12)}),signal:controller.signal,cache:'no-store'});var data=await response.json().catch(function(){return{}});if(!response.ok)throw Object.assign(new Error(data.error&&data.error.message||copy[lang()].network),{code:data.error&&data.error.code});var answer=String(data.text||'').trim();if(!answer)throw new Error(copy[lang()].network);history.push({role:'assistant',content:answer});if(input)input.value='';say('', '');render()}catch(error){history.pop();lastFailed=text;if(input)input.value=text;say(error.name==='AbortError'?copy[lang()].cancelled:(error.message||copy[lang()].network),'error');if(retry)retry.hidden=error.name==='AbortError'}finally{controller=null;busy(false)}}
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
