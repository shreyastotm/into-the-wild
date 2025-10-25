(function () {
  try {
    window.__ITW_DEBUG__ = { errors: [], resources: [], longTasks: [], lags: [], notes: [] };
    Error.stackTraceLimit = 100;

    // 1) Capture JS errors and promise rejections
    window.addEventListener('error', function (e) {
      window.__ITW_DEBUG__.errors.push({
        type: 'error',
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error && e.error.stack ? e.error.stack : null,
        time: Date.now()
      });
      console.log('[BOOT][ERROR]', e.message, e.filename, e.lineno, e.colno, e.error);
    }, true);

    window.addEventListener('unhandledrejection', function (e) {
      var reason = e.reason || {};
      window.__ITW_DEBUG__.errors.push({
        type: 'unhandledrejection',
        message: reason.message || String(reason),
        stack: reason.stack || null,
        time: Date.now()
      });
      console.log('[BOOT][REJECTION]', reason);
    });

    // 2) Resource timing (capture script/module loads)
    if ('PerformanceObserver' in window) {
      var po = new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.initiatorType === 'script') {
            window.__ITW_DEBUG__.resources.push({
              name: entry.name,
              start: entry.startTime,
              dur: entry.duration,
              transferSize: entry.transferSize
            });
            console.log('[BOOT][RESOURCE]', entry.name, Math.round(entry.duration) + 'ms');
          }
        }
      });
      try { po.observe({ type: 'resource', buffered: true }); } catch (_) {}
    }

    // 3) Long task observer
    try {
      var poLT = new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.entryType === 'longtask') {
            window.__ITW_DEBUG__.longTasks.push({
              start: entry.startTime,
              dur: entry.duration
            });
            console.log('[BOOT][LONGTASK]', Math.round(entry.duration) + 'ms');
          }
        }
      });
      poLT.observe({ type: 'longtask', buffered: true });
    } catch (_) {}

    // 4) Event loop lag (infinite loops/blocking detection)
    (function monitorLag() {
      var last = performance.now();
      setInterval(function () {
        var now = performance.now();
        var delta = now - last - 100;
        last = now;
        if (delta > 250) {
          window.__ITW_DEBUG__.lags.push({ delta: Math.round(delta), time: Date.now() });
          console.log('[BOOT][LAG]', Math.round(delta) + 'ms');
        }
      }, 100);
    })();

    // 5) Route changes (to correlate with crashes)
    (function hookHistory() {
      var origPush = history.pushState;
      history.pushState = function () {
        window.__ITW_DEBUG__.notes.push({ type: 'pushState', url: arguments[2], time: Date.now() });
        return origPush.apply(this, arguments);
      };
      window.addEventListener('popstate', function () {
        window.__ITW_DEBUG__.notes.push({ type: 'popstate', url: location.href, time: Date.now() });
      });
    })();

    console.log('[BOOT] Early diagnostics active');
  } catch (e) {
    console.log('[BOOT][INIT_ERROR]', e);
  }
})();


