/**
 * Palette switcher (preview/evaluation only - not part of the shipped theme).
 *
 * Mirrors the existing light/dark theme-toggle pattern in main.js: reads/writes
 * a separate localStorage key and sets a separate [data-palette] attribute on
 * <html>, so it works independently of (and doesn't interfere with) the real
 * theme toggle. Delete this file (and its <script> hook in baseof.html, and
 * custom.css) once a direction is picked - main.js and main.css need no
 * changes to keep working without it.
 */
(function () {
  'use strict';

  var html = document.documentElement;
  var PALETTE_KEY = 'palette-preview';
  var DARK_VARIANT_KEY = 'dark-variant-preview';

  var PALETTES = [
    { id: 'cardinal', label: 'Cardinal', swatch: 'linear-gradient(135deg, #8C1515, #8C1515)' },
    { id: 'editorial', label: 'Editorial', swatch: 'linear-gradient(135deg, #8f3a3a, #8f3a3a)' },
    { id: 'two-tone', label: 'Two-tone', swatch: 'linear-gradient(135deg, #8C1515 50%, #b83a1f 50%)' }
  ];

  // Three dark-mode surface directions - see custom.css for the rationale
  // (accent colors are untouched by this choice, only background/border).
  var DARK_VARIANTS = [
    { id: 'warm', label: 'Warm', swatch: 'linear-gradient(135deg, #18130f, #221b16)' },
    { id: 'midnight', label: 'Midnight', swatch: 'linear-gradient(135deg, #0a0a0a, #171717)' },
    { id: 'slate', label: 'Slate', swatch: 'linear-gradient(135deg, #11151c, #1a2029)' }
  ];

  function getStored(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function setStored(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  function isDarkMode() {
    var theme = html.getAttribute('data-theme');
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    // 'auto' (or unset) - fall back to the system preference, same check
    // main.js itself uses for the real theme toggle.
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function setPalette(id) {
    html.setAttribute('data-palette', id);
    setStored(PALETTE_KEY, id);
    updateActiveState('.palette-switcher__option[data-palette-id]', 'data-palette-id', id);
  }

  function setDarkVariant(id) {
    html.setAttribute('data-dark-variant', id);
    setStored(DARK_VARIANT_KEY, id);
    updateActiveState('.palette-switcher__option[data-variant-id]', 'data-variant-id', id);
  }

  function updateActiveState(selector, attr, activeId) {
    var buttons = document.querySelectorAll(selector);
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('data-active', buttons[i].getAttribute(attr) === activeId ? 'true' : 'false');
    }
  }

  function buildRow(rowLabel, ariaLabel, options, idAttr, onPick) {
    var row = document.createElement('div');
    row.className = 'palette-switcher__row';
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', ariaLabel);

    var label = document.createElement('span');
    label.className = 'palette-switcher__label';
    label.textContent = rowLabel;
    row.appendChild(label);

    options.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'palette-switcher__option';
      btn.setAttribute(idAttr, opt.id);
      btn.setAttribute('title', opt.label);
      btn.setAttribute('aria-label', opt.label);

      var swatch = document.createElement('span');
      swatch.className = 'palette-switcher__swatch';
      swatch.style.background = opt.swatch;
      btn.appendChild(swatch);

      btn.addEventListener('click', function () {
        onPick(opt.id);
      });

      row.appendChild(btn);
    });

    return row;
  }

  function buildSwitcher() {
    var wrap = document.createElement('div');
    wrap.className = 'palette-switcher';

    wrap.appendChild(buildRow('Palette', 'Light palette preview switcher', PALETTES, 'data-palette-id', setPalette));

    var darkRow = buildRow('Dark', 'Dark mode surface preview switcher', DARK_VARIANTS, 'data-variant-id', setDarkVariant);
    darkRow.hidden = !isDarkMode();
    wrap.appendChild(darkRow);

    document.body.appendChild(wrap);

    // The dark-variant row only matters (and only has anything to preview)
    // while the page is actually in dark mode - main.js sets data-theme
    // directly with no event of its own, so watch the attribute rather than
    // hooking its toggle handler (keeps this file fully independent of it).
    new MutationObserver(function () {
      darkRow.hidden = !isDarkMode();
    }).observe(html, { attributes: true, attributeFilter: ['data-theme'] });
  }

  // Apply any previously-chosen preview values immediately (before building
  // the widget) so a reload doesn't flash back to the default.
  var storedPalette = getStored(PALETTE_KEY);
  if (storedPalette) {
    html.setAttribute('data-palette', storedPalette);
  }
  var storedDarkVariant = getStored(DARK_VARIANT_KEY);
  if (storedDarkVariant) {
    html.setAttribute('data-dark-variant', storedDarkVariant);
  }

  function init() {
    buildSwitcher();
    updateActiveState('.palette-switcher__option[data-palette-id]', 'data-palette-id', html.getAttribute('data-palette'));
    updateActiveState('.palette-switcher__option[data-variant-id]', 'data-variant-id', html.getAttribute('data-dark-variant'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
