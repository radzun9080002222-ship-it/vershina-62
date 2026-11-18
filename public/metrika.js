(function () {
  'use strict';
  if (window.__vershinaMetrikaInstalled) return;
  window.__vershinaMetrikaInstalled = true;
  var counterId = 114341477;
  window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
  window.ym.l = Date.now();
  window.ym(counterId, 'init', { webvisor: true, clickmap: true, accurateTrackBounce: true, trackLinks: true });

  function goal(name) { window.ym(counterId, 'reachGoal', name); }
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || typeof target.closest !== 'function') return;
    var link = target.closest('a[href]');
    if (link) {
      var href = link.getAttribute('href') || '';
      if (/^tel:/i.test(href)) { goal('click_phone'); return; }
      try {
        var host = new URL(href, window.location.href).hostname.toLowerCase();
        if (host === 'wa.me' || host === 'api.whatsapp.com') goal('click_whatsapp');
        else if (host === 't.me' || host === 'telegram.me') goal('click_telegram');
        else if (host === 'max.ru') goal('click_max');
      } catch (_) { /* Ignore invalid/non-navigation links. */ }
      return;
    }
    if (target.closest('#calc button')) goal('calc_interaction');
  });
  document.addEventListener('input', function (event) {
    var target = event.target;
    if (target && typeof target.closest === 'function' && target.closest('#calc input')) goal('calc_interaction');
  });
  document.addEventListener('change', function (event) {
    var target = event.target;
    if (target && typeof target.closest === 'function' && target.closest('#calc select')) goal('calc_interaction');
  });

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.appendChild(script);
}());
