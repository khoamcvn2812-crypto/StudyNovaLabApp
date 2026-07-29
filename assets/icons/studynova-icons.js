(function(){
  'use strict';
  var sprite='assets/icons/studynova-icons.svg';

  function sanitiseToken(value){
    return String(value||'').toLowerCase().replace(/[^a-z0-9-]/g,'');
  }

  function novaIcon(name,className){
    var safeName=sanitiseToken(name)||'info';
    var safeClass=String(className||'').split(/\s+/).map(sanitiseToken).filter(Boolean).join(' ');
    return '<svg class="sn-icon '+safeClass+'" aria-hidden="true" focusable="false"><use href="'+sprite+'#icon-'+safeName+'"></use></svg>';
  }

  function renderIcon(element){
    if(!element||element.dataset.snRendered)return;
    element.dataset.snRendered='true';
    element.innerHTML=novaIcon(element.getAttribute('name')||'info',element.getAttribute('icon-class')||'');
  }

  if(!customElements.get('sn-icon')){
    customElements.define('sn-icon',class extends HTMLElement{
      connectedCallback(){renderIcon(this)}
      static get observedAttributes(){return ['name','icon-class']}
      attributeChangedCallback(){delete this.dataset.snRendered;renderIcon(this)}
    });
  }

  function setIcon(target,name,className){
    var element=typeof target==='string'?document.querySelector(target):target;
    if(element)element.innerHTML=novaIcon(name,className);
  }

  window.novaIcon=novaIcon;
  window.novaSetIcon=setIcon;
  window.StudyNovaIcons={create:novaIcon,set:setIcon,sprite:sprite};
})();
