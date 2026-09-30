/**
 * Academia Theme - Main JavaScript
 * Handles theme switching, mobile menu, and TOC highlighting
 */

(function() {
  'use strict';

  // ==========================================================================
  // Theme Toggle
  // ==========================================================================
  
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  
  function getPreferredTheme() {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) return stored;
    } catch (e) {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
  }
  
  function toggleTheme() {
    const current = html.getAttribute('data-theme');
    // Resolve 'auto' to the actual current appearance before toggling
    const resolved = current === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : current;
    const next = resolved === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Follow system theme changes only when no explicit user preference is stored
  function onSystemThemeChange(isDark) {
    try {
      if (!localStorage.getItem('theme')) {
        // Update attribute only – do NOT persist to localStorage so CSS keeps control
        html.setAttribute('data-theme', isDark ? 'dark' : 'light');
      }
    } catch (e) {
      html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }

  var mql = window.matchMedia('(prefers-color-scheme: dark)');
  // addEventListener supported in Safari ≥ 14; fall back to addListener for older Safari
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', function(e) { onSystemThemeChange(e.matches); });
  } else if (typeof mql.addListener === 'function') {
    mql.addListener(function(e) { onSystemThemeChange(e.matches); });
  }

  // Re-apply theme on BFCache restore (Safari aggressively caches pages)
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
      try {
        var stored = localStorage.getItem('theme');
        html.setAttribute('data-theme', stored || 'auto');
      } catch (err) {}
    }
  });

  // ==========================================================================
  // Mobile Menu
  // ==========================================================================
  
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuOverlay = document.getElementById('mobile-menu-overlay');
  
  function openMenu() {
    mobileMenu.classList.add('mobile-menu--open');
    menuOverlay.classList.add('mobile-menu-overlay--visible');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenu.removeAttribute('inert');
    document.body.style.overflow = 'hidden';
    menuClose.focus();
  }
  
  function closeMenu() {
    mobileMenu.classList.remove('mobile-menu--open');
    menuOverlay.classList.remove('mobile-menu-overlay--visible');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.setAttribute('inert', '');
    document.body.style.overflow = '';
    menuToggle.focus();
  }
  
  if (menuToggle) {
    menuToggle.addEventListener('click', openMenu);
  }
  
  if (menuClose) {
    menuClose.addEventListener('click', closeMenu);
  }
  
  if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
  }
  
  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('mobile-menu--open')) {
      closeMenu();
    }
  });
  
  // Close menu when clicking a link
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu__link');
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // ==========================================================================
  // Table of Contents - Active Section Highlighting
  // ==========================================================================
  
  const tocNav = document.getElementById('toc-nav');
  
  if (tocNav) {
    const tocLinks = tocNav.querySelectorAll('a');
    const headings = [];
    
    // Collect all headings that match TOC links
    tocLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.slice(1);
        const heading = document.getElementById(id);
        if (heading) {
          headings.push({ element: heading, link: link });
        }
      }
    });
    
    if (headings.length > 0) {
      // Intersection Observer for TOC highlighting
      const observerOptions = {
        root: null,
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0
      };
      
      let activeLink = null;
      
      function setActiveLink(link) {
        if (activeLink) {
          activeLink.classList.remove('toc-active');
        }
        if (link) {
          link.classList.add('toc-active');
          activeLink = link;
        }
      }
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const heading = headings.find(h => h.element === entry.target);
            if (heading) {
              setActiveLink(heading.link);
            }
          }
        });
      }, observerOptions);
      
      headings.forEach(({ element }) => {
        observer.observe(element);
      });
      
      // Set initial active state based on scroll position
      function setInitialActive() {
        const scrollY = window.scrollY;
        const headerOffset = 100;
        
        for (let i = headings.length - 1; i >= 0; i--) {
          const { element, link } = headings[i];
          const rect = element.getBoundingClientRect();
          const offsetTop = rect.top + scrollY - headerOffset;
          
          if (scrollY >= offsetTop) {
            setActiveLink(link);
            return;
          }
        }
        
        // If no heading is past the scroll position, activate the first one
        if (headings.length > 0) {
          setActiveLink(headings[0].link);
        }
      }
      
      // Run on load
      setInitialActive();
      
      // Smooth scroll for TOC links
      tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
              const headerOffset = 80;
              const elementPosition = target.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
              
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
              
              // Update URL without jumping
              history.pushState(null, null, href);
            }
          }
        });
      });
    }
  }

  // ==========================================================================
  // Smooth Scroll for All Anchor Links
  // ==========================================================================
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Update URL
        history.pushState(null, null, href);
      }
    });
  });

  // ==========================================================================
  // Code Block Copy Button
  // ==========================================================================
  
  const codeBlocks = document.querySelectorAll('pre > code');
  
  codeBlocks.forEach(codeBlock => {
    const pre = codeBlock.parentElement;
    
    // Anchor copy button to the non-scrolling wrapper (.highlight or .code-block-wrapper)
    // so it stays pinned to the top-right when the user scrolls code horizontally
    let wrapper = pre.parentElement;
    if (!wrapper || (!wrapper.classList.contains('highlight') && !wrapper.classList.contains('code-block-wrapper'))) {
      wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
    }
    wrapper.style.position = 'relative';
    
    const copyButton = document.createElement('button');
    copyButton.className = 'code-copy-btn';
    copyButton.textContent = 'Copy';
    copyButton.setAttribute('aria-label', 'Copy code to clipboard');
    
    copyButton.addEventListener('click', async () => {
      const code = codeBlock.textContent;
      
      try {
        await navigator.clipboard.writeText(code);
        copyButton.textContent = 'Copied!';
        copyButton.classList.add('copied');
        
        setTimeout(() => {
          copyButton.textContent = 'Copy';
          copyButton.classList.remove('copied');
        }, 2000);
      } catch (err) {
        copyButton.textContent = 'Error';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      }
    });
    
    wrapper.appendChild(copyButton);
  });

  // ==========================================================================
  // External Links - Add Icons and Target
  // ==========================================================================
  
  const contentLinks = document.querySelectorAll('.content a[href^="http"]');
  
  contentLinks.forEach(link => {
    // Skip if already has target
    if (!link.hasAttribute('target')) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // ==========================================================================
  // Language Switcher – Record Explicit Choice
  // ==========================================================================
  // When the user actively clicks a language link, store the preference so the
  // auto-detection script never overrides their decision on future visits.
  document.addEventListener('click', function(e) {
    var link = e.target.closest('.lang-switcher__link');
    if (!link) return;
    try {
      var hreflang = (link.getAttribute('hreflang') || link.getAttribute('lang') || '').toLowerCase();
      localStorage.setItem('lang-pref', hreflang.startsWith('pt') ? 'pt-br' : 'en');
    } catch (e) {}
  });

  // ==========================================================================
  // Reading Progress Indicator (Optional)
  // ==========================================================================
  
  const progressBar = document.querySelector('.reading-progress');
  
  if (progressBar) {
    const article = document.querySelector('.article__content');
    
    if (article) {
      function updateProgress() {
        const articleRect = article.getBoundingClientRect();
        const articleTop = articleRect.top + window.scrollY;
        const articleHeight = articleRect.height;
        const windowHeight = window.innerHeight;
        const scrollY = window.scrollY;
        
        const progress = Math.min(
          Math.max((scrollY - articleTop + windowHeight * 0.3) / articleHeight, 0),
          1
        );
        
        progressBar.style.transform = `scaleX(${progress})`;
      }
      
      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
    }
  }

})();

// ==========================================================================
// Subtle Scroll Reveal
// ==========================================================================
// Fades + slides in project cards, publication/patent rows, and the
// server-rendered blog list on load/scroll - kept in its own top-level IIFE
// (rather than inside the main one above) so an early return here for
// reduced-motion / no-IntersectionObserver support can't accidentally skip
// the theme toggle, mobile menu, or any other unrelated logic above.
// Deliberately scoped to page-load (SSR) content only, not the
// client-rendered blog search/filter results in list.html's own script,
// so it never fights with that script's own render() calls.
(function () {
  'use strict';

  var prefersReducedMotion = !window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

  var groups = [
    document.querySelectorAll('.projects-grid > .project-card'),
    document.querySelectorAll('.publications-list > .publication'),
    document.querySelectorAll('#blog-default-list > .list__item'),
    document.querySelectorAll('.homepage-highlights__grid > *')
  ];

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  groups.forEach(function (list) {
    Array.prototype.forEach.call(list, function (el, i) {
      el.setAttribute('data-reveal', '');
      // Small stagger so a row of cards cascades in rather than popping
      // together, capped so a long list doesn't end in a long dead wait.
      el.style.transitionDelay = (Math.min(i, 8) * 45) + 'ms';
      observer.observe(el);
    });
  });
})();

// ==========================================================================
// CSS for Code Copy Button (injected via JS)
// ==========================================================================

const copyButtonStyles = document.createElement('style');
copyButtonStyles.textContent = `
  .highlight,
  .code-block-wrapper {
    position: relative;
  }
  
  .code-copy-btn {
    position: absolute;
    top: var(--sp-2, 0.5rem);
    right: var(--sp-2, 0.5rem);
    padding: var(--sp-1, 0.25rem) var(--sp-3, 0.75rem);
    font-family: var(--font-sans, system-ui);
    font-size: var(--fs-xs, 0.75rem);
    font-weight: 500;
    color: var(--color-text-muted, #888);
    background: var(--color-bg-alt, #f5f5f5);
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: var(--radius-sm, 3px);
    cursor: pointer;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.2s ease, background 0.2s ease, color 0.2s ease;
  }
  
  @media (hover: none), (max-width: 768px) {
    .code-copy-btn {
      opacity: 0.85;
    }
  }

  @media (hover: hover) and (min-width: 769px) {
    .highlight:hover .code-copy-btn,
    .code-block-wrapper:hover .code-copy-btn,
    pre:hover .code-copy-btn {
      opacity: 1;
    }
  }
  
  .code-copy-btn:hover {
    opacity: 1;
    background: var(--color-bg-elevated, #fff);
    color: var(--color-text);
  }
  
  .code-copy-btn.copied {
    color: var(--color-success, #48bb78);
    border-color: var(--color-success, #48bb78);
  }
`;
document.head.appendChild(copyButtonStyles);

// Cite buttons (partials/content-links.html): open the paper's BibTeX in a
// dialog with Copy and Download. One dialog per page, built on first use.
(function () {
  var dialog = null, pre, titleEl, copyBtn, dlLink;
  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'cite-dialog';
    dialog.setAttribute('aria-labelledby', 'cite-dialog-title');
    dialog.innerHTML =
      '<div class="cite-dialog__head">' +
        '<div><p class="cite-dialog__label" id="cite-dialog-title">Cite this paper</p>' +
        '<p class="cite-dialog__paper"></p></div>' +
        '<button type="button" class="cite-dialog__close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<pre class="cite-dialog__bib" tabindex="0"></pre>' +
      '<div class="cite-dialog__actions">' +
        '<a class="cite-dialog__btn" download>Download .bib</a>' +
        '<button type="button" class="cite-dialog__btn cite-dialog__btn--primary">Copy BibTeX</button>' +
      '</div>';
    document.body.appendChild(dialog);
    pre = dialog.querySelector('.cite-dialog__bib');
    titleEl = dialog.querySelector('.cite-dialog__paper');
    copyBtn = dialog.querySelector('.cite-dialog__btn--primary');
    dlLink = dialog.querySelector('a.cite-dialog__btn');
    dialog.querySelector('.cite-dialog__close').addEventListener('click', function () { dialog.close(); });
    // Click on the backdrop (outside the box) closes it.
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    copyBtn.addEventListener('click', function () {
      var text = pre.textContent;
      function done() {
        copyBtn.textContent = 'Copied';
        setTimeout(function () { copyBtn.textContent = 'Copy BibTeX'; }, 1600);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
      function fallback() {
        var r = document.createRange(); r.selectNodeContents(pre);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        try { document.execCommand('copy'); done(); } catch (err) {}
      }
    });
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.content-links__cite');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    if (!dialog) build();
    var bib = btn.getAttribute('data-bibtex') || '';
    pre.textContent = bib;
    titleEl.textContent = btn.getAttribute('data-cite-title') || '';
    var key = (bib.match(/@\w+\{([^,]+),/) || [])[1] || 'citation';
    if (dlLink.href && dlLink.href.indexOf('blob:') === 0) URL.revokeObjectURL(dlLink.href);
    dlLink.href = URL.createObjectURL(new Blob([bib + '\n'], { type: 'application/x-bibtex' }));
    dlLink.setAttribute('download', key + '.bib');
    copyBtn.textContent = 'Copy BibTeX';
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  });
})();
