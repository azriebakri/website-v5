(function () {
  var root = document.documentElement;

  // Theme toggle: flips between light and dark, remembered per browser.
  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = root.dataset.theme ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // Footer year.
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Career timeline: position bars from their data-from / data-to months.
  function toMonths(value) {
    var d = value === 'now' ? new Date() : new Date(value + '-01T00:00:00');
    return d.getFullYear() * 12 + d.getMonth();
  }

  var bars = document.querySelectorAll('.tl-bar');
  if (!bars.length) return;

  var start = Infinity;
  bars.forEach(function (bar) { start = Math.min(start, toMonths(bar.dataset.from)); });
  var firstYear = Math.floor(start / 12);
  start = firstYear * 12;
  var end = toMonths('now') + 1;
  var span = end - start;

  bars.forEach(function (bar) {
    var from = toMonths(bar.dataset.from);
    var to = toMonths(bar.dataset.to);
    bar.style.left = ((from - start) / span) * 100 + '%';
    bar.style.width = Math.max(((to - from) / span) * 100, 1) + '%';
  });

  var axis = document.querySelector('.tl-years');
  if (axis) {
    var lastYear = Math.floor((end - 1) / 12);
    var step = window.innerWidth < 700 ? 3 : 1;
    for (var y = firstYear + 1; y <= lastYear; y += step) {
      var tick = document.createElement('span');
      tick.textContent = y;
      tick.style.left = ((y * 12 - start) / span) * 100 + '%';
      axis.appendChild(tick);
    }
  }
})();
