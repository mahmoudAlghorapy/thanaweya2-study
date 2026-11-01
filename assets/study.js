/* Shared behaviour for unit explanation + exam pages.
 * Auto-graded parts:
 *   <input class="blank" data-a="ans1|ans2">          fill-in-the-blank
 *   <div class="mcq" data-a="b"> <label><input type="radio" value="a">…</label> … </div>
 *   <span class="tf" data-a="t|f">                     true / false (buttons are generated)
 * A button with [data-check="#id"] grades everything inside #id and writes "x / n" to [data-score="#id"].
 */
(function () {
  var norm = function (s) {
    return String(s).trim().toLowerCase()
      .replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
      .replace(/^ال/, '').replace(/\s+/g, ' ');
  };
  var uid = 0;
  document.querySelectorAll('.tf').forEach(function (el) {
    var name = 'tf' + (uid++);
    el.innerHTML = '<label><input type="radio" name="' + name + '" value="t" hidden>✔ صح</label>' +
                   '<label><input type="radio" name="' + name + '" value="f" hidden>✘ خطأ</label>';
    el.querySelectorAll('label').forEach(function (l) {
      l.addEventListener('click', function () {
        el.querySelectorAll('label').forEach(function (x) { x.style.background = '#fff'; });
        l.style.background = '#eef6ff';
      });
    });
  });
  document.querySelectorAll('.mcq').forEach(function (el) {
    var name = 'mcq' + (uid++);
    el.querySelectorAll('input[type=radio]').forEach(function (i) { i.name = name; });
  });
  document.querySelectorAll('[data-check]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var box = document.querySelector(btn.dataset.check), ok = 0, n = 0;
      box.querySelectorAll('.blank').forEach(function (inp) {
        n++;
        var good = inp.dataset.a.split('|').some(function (a) { return norm(a) === norm(inp.value); });
        inp.classList.toggle('ok', good); inp.classList.toggle('bad', !good); if (good) ok++;
      });
      box.querySelectorAll('.mcq,.tf').forEach(function (g) {
        n++;
        g.querySelectorAll('label').forEach(function (l) { l.classList.remove('ok', 'bad'); });
        var picked = g.querySelector('input:checked');
        var right = g.querySelector('input[value="' + g.dataset.a + '"]');
        if (right) right.parentNode.classList.add('ok');
        if (picked && picked.value === g.dataset.a) ok++;
        else if (picked) picked.parentNode.classList.add('bad');
      });
      var out = document.querySelector('[data-score="' + btn.dataset.check + '"]');
      if (out) out.textContent = 'درجتك: ' + ok + ' / ' + n;
    });
  });
  var all = document.getElementById('toggleAll'), shown = false;
  if (all) all.addEventListener('click', function () {
    shown = !shown;
    document.querySelectorAll('details.ans').forEach(function (d) { d.open = shown; });
    all.textContent = shown ? '🙈 إخفاء كل نماذج الإجابة' : '👁️ إظهار كل نماذج الإجابة';
  });
  var URL_ = "https://script.google.com/macros/s/AKfycbyZigwbjJMvA0gnwtbzffEBygN8gOcMAEvjRXxvtPnJsmAKiufFfppqO9TjA1Vp6Qt0rw/exec";
  try { fetch(URL_ + '?action=visit&page=' + encodeURIComponent(location.pathname) + '&ref=' + encodeURIComponent(document.referrer || '')).catch(function () {}); } catch (e) {}
})();
