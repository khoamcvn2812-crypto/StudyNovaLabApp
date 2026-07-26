(function () {
  'use strict';
  const KEYS = { home: 'studynova_tour_home_completed_v1', writing: 'studynova_tour_writing_completed_v1', cloud: 'studynova_tour_cloud_completed_v1' };
  const DEMO_KEY = 'studynova_tour_demo_v1';
  const words = ['achieve','benefit','challenge','education','environment','healthy','important','improve','reduce','support'];
  let active = null;
  let activeTarget = null;
  let targetClickHandler = null;

  const homeSteps = [
    ['#page-home .sn-hero','Chào mừng đến StudyNova Lab','Đây là trung tâm học IELTS của bạn. Dữ liệu học vẫn được lưu an toàn trên thiết bị.'],
    ["[onclick*=\"goTo('vocab')\"]",'Sổ từ vựng','Mở Sổ từ vựng để tìm, sửa và nghe lại từ đã lưu.'],
    ["[onclick*=\"goTo('add')\"]",'Thêm một từ thủ công','Điền từ, nghĩa, topic, ví dụ và collocations rồi lưu.'],
    ['#bulk-in','Nhập nhanh','Mỗi dòng dùng format:\nterm | meaning | topic | type | level | example | collocations | Writing example | Speaking example'],
    ['[onclick*="bulkImport()"]','Nhập danh sách','Luôn xem Preview để phát hiện dòng thiếu hoặc sai cột trước khi nhập.'],
    ['[onclick*="snOpenAiPanel()"]','AI Coach và ảnh từ vựng','AI Coach có thể tạo đúng format Nhập nhanh. Web không tự OCR hay tải ảnh đi nơi khác. Hãy che tên, mặt, điểm số, mã học sinh và dữ liệu riêng tư trước khi gửi ảnh cho ChatGPT.'],
    ['#page-vocab','10 từ demo an toàn','Tour chuẩn bị 10 từ demo trong vùng tạm riêng. Chúng không vào cloud, streak, thống kê, kiểm tra hay Mistake Bank. Hãy thử nút phát âm từ và câu ví dụ khi xem từ.'],
    ["[onclick*=\"goTo('review')\"]",'Luyện tập → Ôn tập','Bạn có thể thử một câu ở từng dạng hiện có: flashcard, trắc nghiệm và điền từ. Demo sẽ được dọn khi tour kết thúc.'],
    ["[onclick*=\"goTo('test')\"]",'Kiểm tra','Phần Kiểm tra vẫn sẵn sàng, nhưng tour không bắt bạn làm bài.'],
    ['a[href="studynova_writing_vault.html"]','Writing Vault','Mở Writing Vault khi bạn muốn lưu bài, sửa lỗi và dùng AI Writing Coach.']
  ];
  const writingSteps = [
    ["[onclick*=\"goTo('write')\"]",'Tạo bài viết mới','Mở trang viết để tạo bài mới. Tour không tự ghi hay đồng bộ bản nháp.'],
    ['#page-write','Thông tin bài viết','Chọn Task 1/Task 2, topic, band và trạng thái phù hợp.'],
    ['#e-text','Bản nháp tự lưu','Nội dung được autosave cục bộ. Khi rời trang, StudyNova flush phần draft đang chờ trước.'],
    ["[onclick*=\"quickCheck()\"]",'Kiểm tra nhanh','Chạy kiểm tra nhanh cho bản nháp hiện tại trước khi lưu hoặc gửi chữa.'],
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

  function demos() { const session = `tour_${Date.now()}`; localStorage.setItem(DEMO_KEY, JSON.stringify(words.map((term, i) => ({ id:`tour_demo_${session}_${i}`, term, def:`Nghĩa demo của ${term}`, topic:'Tour demo', type:'word', level:'beginner', status:'new', at:new Date().toISOString().slice(0,10), rv:0, ex:`This is an easy example with ${term}.`, coll:'', wex:`Learners can ${term} their academic goals.`, sex:`I use ${term} when discussing everyday topics.`, isTourDemo:true, tourSessionId:session })))); document.dispatchEvent(new CustomEvent('studynova-tour-demo-change')); }
  function clearStage() {
    if (activeTarget && targetClickHandler) activeTarget.removeEventListener('click', targetClickHandler, false);
    document.querySelectorAll('.sn-tour-target,.tour-active-target').forEach(x => x.classList.remove('sn-tour-target','tour-active-target'));
    if (active && active.layer) active.layer.querySelectorAll('.sn-tour-shade,.sn-tour-focus,.tour-highlight,.tour-spotlight,.tour-spotlight-ring').forEach(x => x.remove());
    activeTarget = null;
    targetClickHandler = null;
  }
  function cleanup() { localStorage.removeItem(DEMO_KEY); document.dispatchEvent(new CustomEvent('studynova-tour-demo-change')); clearStage(); }
  function end(completed) { if (!active) return; if (completed) localStorage.setItem(KEYS[active.type], 'true'); cleanup(); active.layer.remove(); active = null; }
  function targetFor(selector) {
    try {
      const all = [...document.querySelectorAll(selector)];
      return all.find(x => x.offsetParent !== null) || all[0] || null;
    } catch (error) {
      console.warn('StudyNova tour has an invalid selector', selector, error);
      return null;
    }
  }
  function makeShade(layer, name, left, top, width, height) {
    if (width <= 0 || height <= 0) return;
    const shade = document.createElement('div');
    shade.className = `sn-tour-shade sn-tour-shade-${name}`;
    Object.assign(shade.style, { left:`${left}px`, top:`${top}px`, width:`${width}px`, height:`${height}px` });
    layer.insertBefore(shade, layer.querySelector('.sn-tour-card'));
  }
  function buildSpotlight(layer, rect) {
    const gap = 10;
    const hole = {
      left: Math.max(0, rect.left - gap), top: Math.max(0, rect.top - gap),
      right: Math.min(innerWidth, rect.right + gap), bottom: Math.min(innerHeight, rect.bottom + gap)
    };
    makeShade(layer, 'top', 0, 0, innerWidth, hole.top);
    makeShade(layer, 'bottom', 0, hole.bottom, innerWidth, innerHeight - hole.bottom);
    makeShade(layer, 'left', 0, hole.top, hole.left, hole.bottom - hole.top);
    makeShade(layer, 'right', hole.right, hole.top, innerWidth - hole.right, hole.bottom - hole.top);
    const focus = document.createElement('div');
    focus.className = 'sn-tour-focus tour-highlight tour-spotlight-ring';
    Object.assign(focus.style, { left:`${hole.left}px`, top:`${hole.top}px`, width:`${hole.right-hole.left}px`, height:`${hole.bottom-hole.top}px` });
    layer.insertBefore(focus, layer.querySelector('.sn-tour-card'));
    return hole;
  }
  function placeCard(card, hole) {
    card.style.removeProperty('bottom'); card.style.removeProperty('right');
    const margin = 12, width = card.offsetWidth, height = card.offsetHeight;
    const candidates = [
      { fits: hole.bottom + margin + height <= innerHeight, left: Math.min(innerWidth-width-margin, Math.max(margin,hole.left)), top: hole.bottom + margin },
      { fits: hole.top - margin - height >= 0, left: Math.min(innerWidth-width-margin, Math.max(margin,hole.left)), top: hole.top - margin - height },
      { fits: hole.right + margin + width <= innerWidth, left: hole.right + margin, top: Math.min(innerHeight-height-margin, Math.max(margin,hole.top)) },
      { fits: hole.left - margin - width >= 0, left: hole.left - margin - width, top: Math.min(innerHeight-height-margin, Math.max(margin,hole.top)) }
    ];
    const choice = candidates.find(item => item.fits);
    if (choice) Object.assign(card.style, { left:`${choice.left}px`, top:`${choice.top}px` });
    else {
      const bottomSpace = innerHeight - hole.bottom, topSpace = hole.top;
      const useBottom = bottomSpace >= topSpace;
      card.style.left = `${Math.max(margin,(innerWidth-width)/2)}px`;
      card.style.top = useBottom ? `${hole.bottom+margin}px` : `${margin}px`;
      card.style.maxHeight = `${Math.max(80,(useBottom?bottomSpace:topSpace)-margin*2)}px`;
    }
  }
  function handleTourClick() {
    // Deliberately runs in the bubbling phase after the target's own click handler.
    setTimeout(() => {
      if (!active) return;
      if (++active.index >= active.steps.length) end(true); else render();
    }, 0);
  }
  function auditClickTarget(target, rect) {
    const stack = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    const receiver = stack[0];
    const valid = receiver === target || target.contains(receiver);
    if (!valid) console.warn('StudyNova tour target is obstructed', { target, receiver });
    return valid;
  }
  function render() {
    if (!active) return;
    clearStage(); if (active.type === 'home') demos();
    const step = active.steps[active.index], target = targetFor(step[0]);
    if (!target) {
      console.warn('StudyNova tour skipped a missing target', step[0]);
      if (++active.index >= active.steps.length) end(true); else render();
      return;
    }
    target.scrollIntoView({behavior:'smooth',block:'center'});
    requestAnimationFrame(() => {
      if (!active) return;
      const rect = target.getBoundingClientRect(), card = active.layer.querySelector('.sn-tour-card');
      target.classList.add('sn-tour-target','tour-active-target'); activeTarget = target;
      if (target.matches(':disabled,[aria-disabled="true"]')) console.warn('StudyNova tour target is disabled', target);
      if (getComputedStyle(target).pointerEvents === 'none') console.warn('StudyNova tour target cannot receive pointer events', target);
      const hole = buildSpotlight(active.layer, rect);
      card.querySelector('h2').textContent=step[1]; card.querySelector('p').textContent=step[2]; card.querySelector('.sn-tour-progress').textContent=`${active.index+1}/${active.steps.length}`;
      card.querySelector('.sn-tour-back').disabled=active.index===0; card.querySelector('.sn-tour-next').textContent=active.index===active.steps.length-1?'Hoàn thành':'Tiếp tục';
      placeCard(card, hole);
      targetClickHandler = handleTourClick;
      target.addEventListener('click', targetClickHandler, { once:true, capture:false });
      requestAnimationFrame(() => auditClickTarget(target, target.getBoundingClientRect()));
      card.focus({ preventScroll:true });
    });
  }
  function start(type, manual) {
    if (active || (!manual && localStorage.getItem(KEYS[type]) === 'true')) return;
    const steps=type==='writing'?writingSteps:type==='cloud'?cloudSteps:homeSteps;
    const layer=document.createElement('div'); layer.className='sn-tour-layer'; layer.innerHTML='<section class="sn-tour-card" role="dialog" aria-modal="true" tabindex="-1"><button class="sn-tour-close" aria-label="Đóng">✕</button><h2></h2><p></p><div class="sn-tour-actions"><span class="sn-tour-progress"></span><button class="sn-tour-skip">Bỏ qua</button><button class="sn-tour-back">Quay lại</button><button class="sn-tour-next">Tiếp tục</button></div></section>';
    document.body.append(layer); active={type,steps,index:0,layer};
    layer.querySelector('.sn-tour-close').onclick=()=>end(false); layer.querySelector('.sn-tour-skip').onclick=()=>{if(confirm('Bạn muốn bỏ qua hướng dẫn?'))end(true)}; layer.querySelector('.sn-tour-back').onclick=()=>{active.index--;render()}; layer.querySelector('.sn-tour-next').onclick=()=>{if(++active.index>=steps.length)end(true);else render()}; render();
  }
  window.StudyNovaTour={start,cleanup,steps:{home:homeSteps,writing:writingSteps,cloud:cloudSteps},demoWords:words.slice()};
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
