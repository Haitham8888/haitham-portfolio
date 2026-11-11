/* Deterrents against casual copying. Nothing on the web can be made impossible to copy; this
   simply closes the easy doors: the context menu, view-source / save / dev-tools shortcuts,
   dragging pictures out, and selecting the page. Contact details and the terminal stay usable. */
(function () {
  'use strict';
  function editable(t) { return t && t.closest && t.closest('input, textarea, [contenteditable], .mail, .phone, .term'); }

  document.addEventListener('contextmenu', function (e) { if (!editable(e.target)) e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { if (e.target && /^(IMG|CANVAS|A)$/.test(e.target.tagName)) e.preventDefault(); });
  document.addEventListener('selectstart', function (e) { if (!editable(e.target)) e.preventDefault(); });
  document.addEventListener('copy', function (e) { if (!editable(e.target) && !editable(document.activeElement)) { var s = window.getSelection && String(window.getSelection()); if (!s) return; e.preventDefault(); } });

  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase(), mod = e.ctrlKey || e.metaKey;
    var block =
      k === 'f12' ||
      (mod && e.shiftKey && (k === 'i' || k === 'j' || k === 'c' || k === 'k')) ||   // dev tools
      (e.metaKey && e.altKey && (k === 'i' || k === 'j' || k === 'c' || k === 'u')) || // dev tools / source on macOS
      (mod && !e.shiftKey && (k === 'u' || k === 's'));                                // view source, save page
    if (block) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  try {
    var css = 'font: 600 13px/1.6 monospace; color: #4ade80;';
    console.log('%c© Al-Haitham — haithamhattan.sa\nDesign, code and ASCII artwork are original work. All rights reserved.\nPlease do not copy. For collaboration: info@haithamhattan.sa', css);
  } catch (_) {}
})();
