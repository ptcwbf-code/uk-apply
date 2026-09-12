/* 英国九校 · 香港八校 本科录取要求速查 —— Service Worker（离线可用）
 *
 * 这个站的数据全是本地文件，正好适合缓存：学生在地铁上、或者学校网不稳时也能查。
 *
 * 策略刻意分成两类，理由不同：
 *   · 导航请求（HTML）：**联网优先**，拿不到才回落到缓存。
 *     绝不能对 HTML 做缓存优先——那样一旦某一版发坏，用户会被永久锁在旧版上，
 *     连「刷新拿新版」这条路都断了。
 *   · 静态资源：**缓存优先**。它们都带 ?v=<版本>，同一个 URL 的内容不会再变。
 *
 * 缓存名从自己的脚本地址上取版本（register('sw.js?v=9.3')），
 * 所以版本号只在 index.html 的 ?v= 一处维护，不用两边同步。
 * activate 时把不属于当前版本的缓存全删掉。
 */
var VERSION = (function () {
  try { return new URL(self.location.href).searchParams.get('v') || '0'; }
  catch (e) { return '0'; }
})();
var CACHE = 'ukapply-' + VERSION;
var CORE = ['./', './index.html', './manifest.json', './favicon.svg', './icon-192.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
      .catch(function () { return self.skipWaiting(); })   // 预热失败不该卡住安装
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;      // 站外请求一律不碰

  // 导航：先走网络，离线才用缓存里的首页
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
        }
        return res;
      }).catch(function () {
        return caches.match('./index.html').then(function (r) { return r || caches.match('./'); });
      })
    );
    return;
  }

  // 静态资源：缓存优先（URL 带版本号，内容不变）
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
