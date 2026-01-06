const CACHE_NAME = 'pwa-gym-tracker-cache-v1';
const urlsToCache = [
    './index.html',
    './app/Views/homepage.html',
    './app/Views/update-progress.html',
    './app/Views/css/colors.css',
    './app/Views/css/style.css',
    './js/app.js',
    './js/js-main.js',
    './js/read-write-data.js',
    './js/firebase-config.js',
    './js/firebase-connect.js',
    './images/icon-192x192.png',
    './images/icon-512x512.png',
    './manifest.json'
];

// Sự kiện install:
// - Được kích hoạt khi service worker lần đầu đăng ký hoặc khi có Service-worker mới(thay đổi trong trường CACHE_NAME).
// - Dùng để cache các tài nguyên cần thiết cho app hoạt động offline.
self.addEventListener('install', event => {
    console.log('[Service Worker] Install event triggered');
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

// Sự kiện fetch:
// - Được kích hoạt mỗi khi trình duyệt yêu cầu tài nguyên (HTML, CSS, JS, ảnh, ...).
// - Kiểm tra cache trước, nếu có thì trả về cache, nếu không thì tải từ mạng.
self.addEventListener('fetch', event => {
    console.log('[Service Worker] Fetch event:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({ type: 'CACHE_HIT', url: event.request.url });
                    });
                });
                return response;
            }
            return fetch(event.request).then(networkResponse => {
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({ type: 'NETWORK_FETCH', url: event.request.url });
                    });
                });
                return networkResponse;
            });
        })
    );
});

// Sự kiện activate:
// - Được kích hoạt sau khi service worker mới được cài đặt thành công.
// - Dùng để xóa các cache cũ không còn sử dụng, đảm bảo chỉ giữ lại cache mới nhất.
// - Chuyển quyền kiểm soát cho service worker mới với self.clients.claim().
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activate event triggered');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Hai biến toàn cục để lưu version manifest
let GLOBAL_CACHED_MANIFEST_VER = null;
let GLOBAL_FETCHED_MANIFEST_VER = null;

// // Sự kiện message:
// // - Được kích hoạt khi nhận được tin nhắn từ client (trang web).
// // - Dùng để kiểm tra và cập nhật phiên bản cache khi có yêu cầu từ client.
// self.addEventListener('message', async event => {
//     console.log('[Service Worker] Message event:', event.data);

//     if (event.data && event.data.type === 'CHECK_FOR_UPDATE') {
//         console.log('[Service Worker] Starting update process...');

//         // Fetch manifest mới từ server
//         const response = await fetch('./manifest.json');
//         const newManifest = await response.json();

//         // Lấy manifest cũ từ cache
//         const cachedManifest = await caches.match('./manifest.json').then(res => res ? res.json() : null);

//         // Kiểm tra phiên bản mới
//         if (cachedManifest && cachedManifest.ver !== newManifest.ver) {
//             console.log('New version detected:', newManifest.ver);

//             // Xóa cache cũ
//             await caches.delete(CACHE_NAME);
//             const cache = await caches.open(CACHE_NAME);

//             // Danh sách file cần cache
//             const filesToCache = urlsToCache;
//             let progress = 0;

//             // Cache từng file và gửi tiến trình cập nhật
//             for (let i = 0; i < filesToCache.length; i++) {
//                 const file = filesToCache[i];
//                 await cache.add(file);
//                 progress = Math.floor(((i + 1) / filesToCache.length) * 100);

//                 // Gửi tiến trình cập nhật đến client
//                 self.clients.matchAll().then(clients => {
//                     clients.forEach(client => {
//                         client.postMessage({
//                             type: 'UPDATE_PROGRESS',
//                             progress,
//                             file
//                         });
//                     });
//                 });
//             }

//             console.log('Cache updated with new version.');

//             // Gửi thông điệp hoàn tất cập nhật
//             self.clients.matchAll().then(clients => {
//                 clients.forEach(client => {
//                     client.postMessage({ type: 'UPDATE_COMPLETE' });
//                 });
//             });
//         } else {
//             console.log('No new version detected.');
//             // Gửi thông điệp không có bản cập nhật
//             self.clients.matchAll().then(clients => {
//                 clients.forEach(client => {
//                     client.postMessage({ type: 'NO_UPDATE' });
//                 });
//             });
//         }
//     }

//     // Xử lý sự kiện CHECKVERSION
//     if (event.data && (event.data.type === 'CHECKVERSION' || event.data.type === 'checkversion')) {
//         console.log('[Service Worker] CHECKVERSION event triggered');

//         try {
//             // Lấy manifest mới từ server
//             const response = await fetch('./manifest.json');
//             const newManifest = await response.json();

//             // Lấy manifest cũ từ cache (nếu có)
//             const cachedManifest = await caches.match('./manifest.json').then(res => res ? res.json() : null);

//             // Chỉ gán vào biến toàn cục (không gửi message, không cập nhật cache)
//             GLOBAL_FETCHED_MANIFEST_VER = newManifest && newManifest.ver ? newManifest.ver : null;
//             GLOBAL_CACHED_MANIFEST_VER = cachedManifest && cachedManifest.ver ? cachedManifest.ver : null;

//             // Gửi kết quả về client (đơn giản)
//             self.clients.matchAll().then(clients => {
//                 clients.forEach(client => {
//                     client.postMessage({
//                         type: 'CHECKVERSION_DONE',
//                         fetchedVer: GLOBAL_FETCHED_MANIFEST_VER,
//                         cachedVer: GLOBAL_CACHED_MANIFEST_VER
//                     });
//                 });
//             });
//         } catch (err) {
//             console.error('[Service Worker] CHECKVERSION error:', err);
//         }
//     }
// });


// Helper: đọc CSV và trả về {ver, information, raw}
async function fetchLatestVersionFromCsv(url = './updated-version.csv') {
    try {
        const resp = await fetch(url, { cache: 'no-store' });
        if (!resp.ok) return null;
        const txt = await resp.text();
        const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) return null;
        const lastLine = lines[lines.length - 1];
        const cols = lastLine.split(',');
        return {
            ver: cols[0] ? cols[0].trim() : null,
            information: cols.length > 1 ? cols.slice(1).join(',').trim() : '',
            raw: txt
        };
    } catch (err) {
        console.error('[Service Worker] fetchLatestVersionFromCsv error:', err);
        return null;
    }
}

self.addEventListener('message', async event => {
    console.log('[Service Worker] Message event:', event.data);

    if (event.data && event.data.type === 'CHECK_FOR_UPDATE') {
        console.log('[Service Worker] Starting update process...');

        // Lấy CSV mới từ server
        const fetchedCsv = await fetchLatestVersionFromCsv();
        if (!fetchedCsv || !fetchedCsv.ver) {
            console.log('No valid fetched CSV/version.');
            self.clients.matchAll().then(clients => clients.forEach(c => c.postMessage({ type: 'NO_UPDATE' })));
            return;
        }

        // Lấy CSV cũ từ cache (nếu có)
        let cachedVer = null;
        const cachedResp = await caches.match('./updated-version.csv');
        if (cachedResp) {
            try {
                const cachedTxt = await cachedResp.text();
                const lines = cachedTxt.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
                if (lines.length >= 2) {
                    const last = lines[lines.length - 1].split(',');
                    cachedVer = last[0] ? last[0].trim() : null;

                }
            } catch (e) {
                console.warn('Failed to read cached CSV:', e);
            }
        }

        if (cachedVer !== fetchedCsv.ver) {
            console.log('New version detected:', fetchedCsv.ver);

            // Xóa cache cũ và tạo cache mới
            await caches.delete(CACHE_NAME);
            const cache = await caches.open(CACHE_NAME);

            // Cache danh sách file (bao gồm CSV)
            const filesToCache = urlsToCache.concat(['./updated-version.csv']);

            let progress = 0;
            for (let i = 0; i < filesToCache.length; i++) {
                const file = filesToCache[i];
                try {
                    await cache.add(file);
                } catch (err) {
                    console.warn('Failed to cache', file, err);
                }
                progress = Math.floor(((i + 1) / filesToCache.length) * 100);
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => client.postMessage({ type: 'UPDATE_PROGRESS', progress, file, information: fetchedCsv.information }));
                });
            }

            // Đảm bảo CSV mới được lưu (nếu fetch trả raw)
            try {
                await cache.put('./updated-version.csv', new Response(fetchedCsv.raw, { headers: { 'Content-Type': 'text/csv' } }));
            } catch (e) { /* ignore */ }

            console.log('Cache updated with new version.');

            self.clients.matchAll().then(clients => {
                clients.forEach(client => client.postMessage({ type: 'UPDATE_COMPLETE' }));
            });
        } else {
            console.log('No new version detected.');
            self.clients.matchAll().then(clients => clients.forEach(client => client.postMessage({ type: 'NO_UPDATE' })));
        }
    }

    // Xử lý CHECKVERSION: trả về version fetched và cached từ CSV
    if (event.data && (event.data.type === 'CHECKVERSION' || event.data.type === 'checkversion')) {
        console.log('[Service Worker] CHECKVERSION event triggered');

        try {
            const fetchedCsv = await fetchLatestVersionFromCsv();
            let fetchedVer = fetchedCsv && fetchedCsv.ver ? fetchedCsv.ver : null;

            // Lấy CSV cũ từ cache
            let cachedVer = null;
            const cachedResp = await caches.match('./updated-version.csv');
            if (cachedResp) {
                try {
                    const cachedTxt = await cachedResp.text();
                    const lines = cachedTxt.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
                    if (lines.length >= 2) {
                        const last = lines[lines.length - 1].split(',');
                        cachedVer = last[0] ? last[0].trim() : null;
                    }
                } catch (e) { /* ignore */ }
            }

            GLOBAL_FETCHED_MANIFEST_VER = fetchedVer;
            GLOBAL_CACHED_MANIFEST_VER = cachedVer;

            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'CHECKVERSION_DONE',
                        fetchedVer: GLOBAL_FETCHED_MANIFEST_VER,
                        cachedVer: GLOBAL_CACHED_MANIFEST_VER
                    });
                });
            });
        } catch (err) {
            console.error('[Service Worker] CHECKVERSION error:', err);
        }
    }
});
