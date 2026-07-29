const CACHE_NAME = "novalab-pwa-v20";
const RUNTIME_CACHE = "novalab-runtime-v20";
const APP_SHELL = ["./","./index.html","./studynova_writing_vault.html","./studynova-auth.js","./studynova-realtime.js","./studynova-auth.css","./studynova-motion.css","./writing-drafts.js","./assets/icons/studynova-icons.svg","./assets/icons/studynova-icons.css","./assets/icons/studynova-icons.js","./assets/icons/index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./icons/apple-touch-icon.png"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>Promise.all(APP_SHELL.map(url=>cache.add(url).catch(error=>console.warn("Optional shell asset was not cached",url,error))))))});
self.addEventListener("message",event=>{if(event.data&&event.data.type==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>![CACHE_NAME,RUNTIME_CACHE].includes(key)).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
function cacheInBackground(event,request,response){
  const cacheCopy=response.clone();
  event.waitUntil(caches.open(RUNTIME_CACHE).then(cache=>cache.put(request,cacheCopy)));
}
self.addEventListener("fetch",event=>{const request=event.request;if(request.method!=="GET")return;const url=new URL(request.url);if(url.hostname.endsWith("supabase.co"))return;if(request.mode==="navigate"){event.respondWith(fetch(request).then(response=>{if(response.ok)cacheInBackground(event,request,response);return response}).catch(async()=>await caches.match(request)||await caches.match("./index.html")));return}event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response&&(response.ok||response.type==="opaque"))cacheInBackground(event,request,response);return response}))) });
