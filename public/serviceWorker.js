const CACHE_NAME = "static-cache-v1";
//check the verson changed to v1 above
const DATA_CACHE_NAME = "data-cache-1";

const FILES_TO_CACHE = [
    // "/",
    "./index.html",
    "./css/styles.css",
    "./js/index.js",
    "./manifest.webmanifest",
    "./db.js",
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png"

    // add in incons follow css format
];


self.addEventListener("install", (evt)=>{
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache =>{
            console.log("Files Uploaded")
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});
self.addEventListener("activate", (evt)=>{
    //might need to be fetch above
    evt.waitUntil(
        caches.keys().then(keyList =>{
            return Promise.all(
                keyList.map(key=>{
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME){
                        console.log("Removing old data", key);
                        return caches.delete(key)
                    }
                })
            );       
        })
    );
    self.clients.claim();
})
self.addEventListener("fetch", (evt)=>{
    if (evt.request.url.inludes('/api/')){
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response =>{
                    if (response.status === 200){
                        cache.put(evt.request.url, response.clone())
                    }
                    return response;
                })
                .catch(err => {
                    return  cache.match(evt.request);
                });
            }).catch(err=>console.log(err))
        );
        return;
    }
    evt.respondWith(
        caches.open(CACHE_NAME).then(cache =>{
            return cache.match(evt.request).then(response =>{
                return respones || fetch(evt.request);
            });
        })
    );
});