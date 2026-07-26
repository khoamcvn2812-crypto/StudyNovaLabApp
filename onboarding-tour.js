(function () {
  'use strict';
  const KEYS = { home: 'studynova_tour_home_completed_v1', writing: 'studynova_tour_writing_completed_v1', cloud: 'studynova_tour_cloud_completed_v1' };
  const DEMO_KEY = 'studynova_tour_demo_v1';
  const words = ['achieve','benefit','challenge','education','environment','healthy','important','improve','reduce','support'];
  let active = null;

  const homeSteps = [
    ['#page-home .sn-hero','Chào mừng đến StudyNova Lab','Đây là trung tâm học IELTS của bạn. Dữ liệu học vẫn được lưu an toàn trên thiết bị.'],
    ["[onclick*=\"goTo('vocab')\"]",'Sổ từ vựng','Mở Sổ từ vựng để tìm, sửa và nghe lại từ đã lưu.'],
    ["[onclick*=\"goTo('add')\"]",'Thêm một từ thủ công','Điền từ, nghĩa, topic, ví dụ và collocations rồi lưu.'],
    ['#bulk-in','Nhập nhanh','Mỗi dòng dùng format:\nterm | meaning | topic | type | level | example | collocations | Writing example | Speaking example'],
    ['#bulk-preview','Preview trước khi nhập','Luôn xem Preview để phát hiện dòng thiếu hoặc sai cột trước khi nhập.'],
    ['[onclick="snOpenAiPanel()"]','AI Coach và ảnh từ vựng','AI Coach có thể tạo đúng format Nhập nhanh. Web không tự OCR hay tải ảnh đi nơi khác. Hãy che tên, mặt, điểm số, mã học sinh và dữ liệu riêng tư trước khi gửi ảnh cho ChatGPT.'],
    ['#page-vocab','10 từ demo an toàn','Tour chuẩn bị 10 từ demo trong vùng tạm riêng. Chúng không vào cloud, streak, thống kê, kiểm tra hay Mistake Bank. Hãy thử nút phát âm từ và câu ví dụ khi xem từ.'],
    ["[onclick*=\"goTo('review')\"]",'Luyện tập → Ôn tập','Bạn có thể thử một câu ở từng dạng hiện có: flashcard, trắc nghiệm và điền từ. Demo sẽ được dọn khi tour kết thúc.'],
    ["[onclick*=\"goTo('test')\"]",'Kiểm tra','Phần Kiểm tra vẫn sẵn sàng, nhưng tour không bắt bạn làm bài.'],
    ['a[href="studynova_writing_vault.html"]','Writing Vault','Mở Writing Vault khi bạn muốn lưu bài, sửa lỗi và dùng AI Writing Coach.']
  ];
  const writingSteps = [
    ["[onclick*=\"goTo('write')\"]",'Tạo bài viết mới','Mở trang viết để tạo bài mới. Tour không tự ghi hay đồng bộ bản nháp.'],
    ['#page-write','Thông tin bài viết','Chọn Task 1/Task 2, topic, band và trạng thái phù hợp.'],
    ['#essay-text','Bản nháp tự lưu','Nội dung được autosave cục bộ. Khi rời trang, StudyNova flush phần draft đang chờ trước.'],
    ["[onclick*=\"quickCorrection\"]",'Thêm lỗi nhanh','Chọn đoạn cần sửa rồi thêm lỗi nhanh vào hệ thống.'],
    ["[onclick*=\"goTo('corrections')\"]",'Mistake Bank','Ôn lại lỗi Writing đã lưu tại đây.'],
    ["[onclick*=\"snOpenAiPanel\"]",'AI Writing Coach','Tạo prompt chữa bài an toàn; tour không tự gửi bản nháp lên cloud.'],
    ['a[href="index.html"]','📚 NovaLab học tập','Dùng nút này hoặc Home để quay lại. Bản nháp local được flush trước khi chuyển trang.']
  ];
  const cloudSteps = [
    ['#sn-auth-modal','Tài khoản và cloud','Đăng nhập hoặc tạo tài khoản. Điện thoại dùng nút 👤; máy tính hiển thị cả tên. Tour không thực hiện thao tác cloud.'],
    ['#nova-cloud-panel','So sánh trước khi đồng bộ','So sánh dữ liệu máy và cloud trước khi chọn hướng đồng bộ.'],
    ['#nova-cloud-panel','Ba lựa chọn an toàn','Giữ bản máy → Cloud, Cloud → Máy, hoặc Gộp hai bản. Safety backup được tạo trước thao tác thay đổi local.'],
    ['#sn-profile-panel','Hồ sơ và đăng xuất','Bạn có thể sửa tên hiển thị, đổi mật khẩu và đăng xuất. Tên không dùng làm định danh tài khoản.']
  ];

  function demos() { const session = `tour_${Date.now()}`; localStorage.setItem(DEMO_KEY, JSON.stringify(words.map((term, i) => ({ id:`tour_demo_${session}_${i}`, term, def:`Nghĩa demo của ${term}`, ex:`This is an easy example with ${term}.`, isTourDemo:true, tourSessionId:session })))); }
  function cleanup() { localStorage.removeItem(DEMO_KEY); document.querySelectorAll('.sn-tour-target').forEach(x => x.classList.remove('sn-tour-target')); }
  function end(completed) { if (!active) return; if (completed) localStorage.setItem(KEYS[active.type], 'true'); cleanup(); active.layer.remove(); active = null; }
  function targetFor(selector) { try { const all = [...document.querySelectorAll(selector)]; return all.find(x => x.offsetParent !== null) || all[0] || document.body; } catch (_) { return document.body; } }
  function render() {
    if (!active) return;
    cleanup(); if (active.type === 'home') demos();
    const step = active.steps[active.index], target = targetFor(step[0]);
    target.scrollIntoView({behavior:'smooth',block:'center'}); target.classList.add('sn-tour-target');
    requestAnimationFrame(() => {
      if (!active) return; const rect = target.getBoundingClientRect(), focus = active.layer.querySelector('.sn-tour-focus'), card = active.layer.querySelector('.sn-tour-card');
      Object.assign(focus.style,{left:`${Math.max(4,rect.left-5)}px`,top:`${Math.max(4,rect.top-5)}px`,width:`${Math.max(30,Math.min(innerWidth-8,rect.width+10))}px`,height:`${Math.max(30,Math.min(innerHeight-8,rect.height+10))}px`});
      card.querySelector('h2').textContent=step[1]; card.querySelector('p').textContent=step[2]; card.querySelector('.sn-tour-progress').textContent=`${active.index+1}/${active.steps.length}`;
      card.querySelector('.sn-tour-back').disabled=active.index===0; card.querySelector('.sn-tour-next').textContent=active.index===active.steps.length-1?'Hoàn thành':'Tiếp tục';
      const below=rect.bottom+12, top=below+card.offsetHeight<innerHeight?below:Math.max(12,rect.top-card.offsetHeight-12); card.style.top=`${top}px`; card.style.left=`${Math.min(innerWidth-card.offsetWidth-12,Math.max(12,rect.left))}px`;
      card.focus();
    });
  }
  function start(type, manual) {
    if (active || (!manual && localStorage.getItem(KEYS[type]) === 'true')) return;
    const steps=type==='writing'?writingSteps:type==='cloud'?cloudSteps:homeSteps;
    const layer=document.createElement('div'); layer.className='sn-tour-layer'; layer.innerHTML='<div class="sn-tour-shade"></div><div class="sn-tour-focus"></div><section class="sn-tour-card" role="dialog" aria-modal="true" tabindex="-1"><button class="sn-tour-close" aria-label="Đóng">✕</button><h2></h2><p></p><div class="sn-tour-actions"><span class="sn-tour-progress"></span><button class="sn-tour-skip">Bỏ qua</button><button class="sn-tour-back">Quay lại</button><button class="sn-tour-next">Tiếp tục</button></div></section>';
    document.body.append(layer); active={type,steps,index:0,layer};
    layer.querySelector('.sn-tour-close').onclick=()=>end(false); layer.querySelector('.sn-tour-skip').onclick=()=>{if(confirm('Bạn muốn bỏ qua hướng dẫn?'))end(true)}; layer.querySelector('.sn-tour-back').onclick=()=>{active.index--;render()}; layer.querySelector('.sn-tour-next').onclick=()=>{if(++active.index>=steps.length)end(true);else render()}; render();
  }
  window.StudyNovaTour={start,cleanup};
  addEventListener('keydown',e=>{if(!active)return;if(e.key==='Escape')end(false);if(e.key==='ArrowRight')active.layer.querySelector('.sn-tour-next').click();if(e.key==='ArrowLeft'&&!active.layer.querySelector('.sn-tour-back').disabled)active.layer.querySelector('.sn-tour-back').click()});
  addEventListener('resize',()=>active&&render());
  document.addEventListener('DOMContentLoaded',()=>{
    cleanup();
    const menu=document.querySelector('.sn-top-menu,.wv-top-menu');
    if(menu){
      const help=document.createElement('section'); help.className='sn-tour-menu';
      const title=document.createElement('b'); title.textContent='Hướng dẫn sử dụng'; help.append(title);
      [['Hướng dẫn Home','home'],['Hướng dẫn Vocabulary','home'],['Hướng dẫn Writing Vault','writing'],['Hướng dẫn đăng nhập và sao lưu','cloud']].forEach(item=>{const button=document.createElement('button');button.type='button';button.className='btn btn-default btn-sm';button.textContent=item[0];button.onclick=()=>start(item[1],true);help.append(button)});
      menu.append(help);
    }
    document.addEventListener('click',event=>{if(event.target.closest('.sn-top-auth,[onclick*="snOpenAuth"],[onclick*="TopMenu"]')&&!localStorage.getItem(KEYS.cloud))setTimeout(()=>start('cloud',false),350)});
    const writing=location.pathname.includes('writing_vault'); setTimeout(()=>start(writing?'writing':'home',false),700);
  });
})();
