(function(){
  'use strict';
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var buttonSelector='button,.btn,.pill,.theme,[role="button"]';
  var cardSelector='.sn-module-card,.sn-home-panel,.sn-density-card,.stat-card,.stat,.section,.word-item,.quiz-box,.speak-card,.rd-card';
  function decorate(root){
    var scope=root&&root.querySelectorAll?root:document;
    scope.querySelectorAll(buttonSelector).forEach(function(el){el.classList.add('sn-btn-motion')});
    scope.querySelectorAll(cardSelector).forEach(function(el){
      el.classList.add('sn-motion-card');
      if(el.closest('#page-writing')||/writing/i.test(el.textContent||''))el.classList.add('sn-writing-motion');
    });
  }
  function setupReveal(){
    var items=[].slice.call(document.querySelectorAll('.page .section,.page .sn-home-density,.page .sn-density-strip,.page .grid4'));
    items.forEach(function(el){el.classList.add('sn-reveal')});
    if(reduce||!('IntersectionObserver' in window)){items.forEach(function(el){el.classList.add('is-visible')});return}
    var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:.08,rootMargin:'0px 0px -24px'});
    items.forEach(function(el){observer.observe(el)});
  }
  function setupStateObserver(){
    var previous=document.querySelector('.page.active');
    new MutationObserver(function(records){
      records.forEach(function(record){
        var el=record.target;
        if(el.classList&&el.classList.contains('page')&&record.attributeName==='class'&&el.classList.contains('active')&&el!==previous){
          if(previous){var outgoing=previous;outgoing.classList.remove('sn-page-enter');outgoing.classList.add('sn-page-exit');setTimeout(function(){outgoing.classList.remove('sn-page-exit')},130)}
          el.classList.remove('sn-page-exit');void el.offsetWidth;el.classList.add('sn-page-enter');previous=el;
        }
        if(el.classList&&el.classList.contains('sn-modal')&&record.attributeName==='class'&&!el.classList.contains('open')&&!el.classList.contains('sn-closing')){
          el.classList.add('sn-closing');el.querySelectorAll('input[type="password"]').forEach(function(input){input.value=''});setTimeout(function(){el.classList.remove('sn-closing')},220);
        }
      });
    }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
  }
  function setupFlashGuard(){document.addEventListener('click',function(event){var card=event.target.closest('.flip-outer');if(!card||reduce)return;if(card.classList.contains('sn-flip-busy')){event.stopImmediatePropagation();return}card.classList.add('sn-flip-busy');setTimeout(function(){card.classList.remove('sn-flip-busy')},410)},true)}
  function setupLoading(){
    var names=['snLoginEmail','snRegisterEmail','snForgotPassword','snResetPassword','snSaveCloud','snInspectCloud','snLoadCloudSafe','exportData','saveEssay','bulkImport'];
    names.forEach(function(name){var original=window[name];if(typeof original!=='function'||original.__snLoading)return;var wrapped=function(){var button=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('button');if(button&&button.disabled)return;var label=button&&button.textContent;if(button){button.disabled=true;button.classList.add('sn-is-loading');button.setAttribute('aria-busy','true')}var result;try{result=original.apply(this,arguments)}catch(error){finish();throw error}function finish(){if(button){button.disabled=false;button.classList.remove('sn-is-loading');button.removeAttribute('aria-busy');if(label&&!button.textContent.trim())button.textContent=label}}if(result&&typeof result.finally==='function')return result.finally(finish);finish();return result};wrapped.__snLoading=true;window[name]=wrapped});
  }
  function init(){document.documentElement.classList.add('sn-motion-ready');decorate(document);setupReveal();setupStateObserver();setupFlashGuard();setupLoading();new MutationObserver(function(records){records.forEach(function(r){r.addedNodes.forEach(function(n){if(n.nodeType===1){decorate(n);if(n.matches&&n.matches(cardSelector))n.classList.add('sn-motion-card')}})})}).observe(document.body,{childList:true,subtree:true});document.addEventListener('visibilitychange',function(){document.body.classList.toggle('sn-document-hidden',document.hidden)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',setupLoading,{once:true});
})();
