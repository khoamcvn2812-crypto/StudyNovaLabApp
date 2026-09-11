(function(root){
  const languages={
    english:{code:'en',name:{vi:'Tiếng Anh',en:'English'},path:'/english.html',symbol:'Aa',programs:['IELTS'],pronunciation:'en-US',features:['vocabulary','review','progress','writing-vault','ai-coach','dictionary'],palette:{accent:'#10d4a0',hover:'#0fbd91',soft:'rgba(16,212,160,.14)',onAccent:'#04131d',focus:'#60a5fa'}},
    chinese:{code:'zh',name:{vi:'Tiếng Trung',en:'Chinese',zh:'中文'},path:'/chinese/',symbol:'汉',programs:['HSK'],pronunciation:'zh-CN',features:['vocabulary','quick-import','multiple-choice','fill','listen','mistakes','schedule','history','progress','speaking','writing-vault'],palette:{accent:'#c9362b',hover:'#aa281f',soft:'rgba(201,54,43,.13)',onAccent:'#fff',focus:'#d6a51d'}}
  };
  const byPath=path=>Object.values(languages).find(item=>path===item.path||path.startsWith(item.path));
  root.StudyNovaLanguages=Object.freeze({languages:Object.freeze(languages),byPath});
})(globalThis);
