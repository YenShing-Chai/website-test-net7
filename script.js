/* ============================================================
   NET7 – script.js
============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. PAGE ROUTING — with History API (pushState)
  ---------------------------------------------------------- */
  var pages    = document.querySelectorAll('.page');
  var allLinks = document.querySelectorAll('[data-page]');

  /* ── Detect file:// — History API not available ── */
  /* Disable History API when opened from file://, srcdoc iframe, or any non-http context */
  var IS_FILE = (function(){
    try {
      var proto = window.location.protocol;
      if (proto === 'file:' || proto === 'about:') return true;
      if (window.self !== window.top) return true;
    } catch(e) { return true; }
    return false;
  }());

  /* Show/hide mobile search btn */
  (function() {
    var mb = document.getElementById('searchBtnMobile');
    if (mb) mb.style.display = window.innerWidth <= 700 ? 'flex' : 'none';
    window.addEventListener('resize', function() {
      if (mb) mb.style.display = window.innerWidth <= 700 ? 'flex' : 'none';
    });
  }());

  /* ── Slug map: pageId → URL path ── */
  var SLUG_TO_PAGE = {
    '/'               : 'home',
    '/features'       : 'features',
    '/pricing'        : 'pricing',
    '/resources'      : 'resources',
    '/about'          : 'about',
    '/terms-of-use'   : 'terms',
    '/privacy-policy' : 'privacy',
    '/faq'            : 'faq-page',
    '/contact'        : 'contact',
  };
  var PAGE_TO_SLUG = {
    'home'     : '/',
    'features' : '/features',
    'pricing'  : '/pricing',
    'resources': '/resources',
    'about'    : '/about',
    'terms'    : '/terms-of-use',
    'privacy'  : '/privacy-policy',
    'faq-page' : '/faq',
    'contact'  : '/contact',
  };

  /* ── Page titles ── */
  var PAGE_TITLES = {
    'home'     : 'Net7 – Your Network Is Your Greatest Asset',
    'features' : 'Features – Net7',
    'pricing'  : 'Pricing – Net7',
    'resources': 'Resources – Net7',
    'about'    : 'About Us – Net7',
    'terms'    : 'Terms of Use – Net7',
    'privacy'  : 'Privacy Policy – Net7',
    'faq-page' : 'FAQ – Net7',
    'contact'  : 'Contact – Net7',
  };


  /* ----------------------------------------------------------
     FEATURES ACCORDION (Explore Net7)
  ---------------------------------------------------------- */
  function initFeaturesAccordion() {
    var items = document.querySelectorAll('.acc-item');
    items.forEach(function(item) {
      var btn = item.querySelector('.acc-item__q');
      if (!btn || btn._accBound) return;
      btn._accBound = true;
      btn.addEventListener('click', function() {
        var isOpen = item.classList.contains('open');
        items.forEach(function(i) { i.classList.remove('open'); });
        if (!isOpen) item.classList.add('open');
      });
    });
  }
  initFeaturesAccordion();

  function showPage(pageId, opts) {
    opts = opts || {};
    pages.forEach(function (p) { p.classList.remove('active'); });
    var target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.navbar__links .nav-link').forEach(function (link) {
      link.classList.remove('active');
      if (link.dataset.page === pageId) link.classList.add('active');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(revealVisible, 80);

    /* ── Update browser URL & title (only when served over http/https) ── */
    if (!IS_FILE) {
      var slug  = PAGE_TO_SLUG[pageId] || ('/' + pageId);
      var title = PAGE_TITLES[pageId]  || ('Net7 – ' + pageId);
      if (!opts.fromPopState) {
        history.pushState({ pageId: pageId }, title, slug);
      }
      document.title = title;
    }

    /* Initialise FAQ page when navigated to */
    if (pageId === 'faq-page') {
      if (typeof initFaqPage === 'function') initFaqPage();
    }

    /* GTM / GA4 virtual page view */
    if (window.dataLayer) {
      var slug2 = IS_FILE ? ('/' + pageId) : (PAGE_TO_SLUG[pageId] || ('/' + pageId));
      window.dataLayer.push({
        event:      'spa_page_view',
        page_path:  slug2,
        page_title: PAGE_TITLES[pageId] || pageId
      });
    }
  }
  window.showPage = showPage;

  /* ── Handle browser back / forward (http/https only) ── */
  if (!IS_FILE) {
    window.addEventListener('popstate', function (e) {
      var pageId = (e.state && e.state.pageId)
        ? e.state.pageId
        : (SLUG_TO_PAGE[window.location.pathname] || 'home');
      showPage(pageId, { fromPopState: true });
    });

    /* ── On first load: read URL path and navigate to correct page ── */
    (function initFromUrl() {
      var path   = window.location.pathname;
      var pageId = SLUG_TO_PAGE[path] || 'home';
      var slug   = PAGE_TO_SLUG[pageId] || '/';
      var title  = PAGE_TITLES[pageId]  || 'Net7';
      history.replaceState({ pageId: pageId }, title, slug);
      document.title = title;
      pages.forEach(function (p) { p.classList.remove('active'); });
      var target = document.getElementById('page-' + pageId);
      if (target) target.classList.add('active');
      document.querySelectorAll('.navbar__links .nav-link').forEach(function (link) {
        link.classList.remove('active');
        if (link.dataset.page === pageId) link.classList.add('active');
      });
      if (pageId === 'faq-page') {
        setTimeout(function () {
          if (typeof initFaqPage === 'function') initFaqPage();
        }, 0);
      }
    }());
  }

  allLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var page = link.dataset.page;
      if (page) showPage(page);
      var mm = document.getElementById('mobileMenu');
      if (mm && mm.classList.contains('open')) {
        mm.classList.remove('open');
        resetHamburger();
      }
    });
  });

  /* ----------------------------------------------------------
     2. MOBILE HAMBURGER
  ---------------------------------------------------------- */
  var hamburger  = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');

  function resetHamburger() {
    if (!hamburger) return;
    var s = hamburger.querySelectorAll('span');
    s[0].style.transform = '';
    s[1].style.opacity   = '';
    s[2].style.transform = '';
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(open));
      var s = hamburger.querySelectorAll('span');
      if (open) {
        s[0].style.transform = 'translateY(7px) rotate(45deg)';
        s[1].style.opacity   = '0';
        s[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else { resetHamburger(); }
    });
  }

  /* ----------------------------------------------------------
     3. USE CASES TABS
  ---------------------------------------------------------- */
  var ucTabs  = document.querySelectorAll('.uc-tab');
  var ucCards = document.querySelectorAll('#ucCardsGrid .uc-card');
  var ucEmpty = document.getElementById('ucEmpty');

  function filterUseCases(tab) {
    var activeTab = tab || document.querySelector('.uc-tab.active');
    var filter    = activeTab ? activeTab.dataset.tab : 'all';
    var visible   = 0;
    ucCards.forEach(function (card) {
      var cats = (card.dataset.categories || '').split(' ');
      var show = filter === 'all' || cats.indexOf(filter) !== -1;
      if (show) {
        card.classList.remove('uc-card--hidden');
        card.classList.remove('uc-card--fade-in');
        void card.offsetWidth;
        card.classList.add('uc-card--fade-in');
        visible++;
      } else {
        card.classList.add('uc-card--hidden');
        card.classList.remove('uc-card--fade-in');
      }
    });
    if (ucEmpty) ucEmpty.style.display = visible === 0 ? 'block' : 'none';
  }

  ucTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      ucTabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      filterUseCases(tab);
    });
  });
  filterUseCases();

  /* ----------------------------------------------------------
     4. LEGAL SIDEBAR SCROLL HIGHLIGHT
  ---------------------------------------------------------- */
  function initLegalSidebar(pageId) {
    var page = document.getElementById('page-' + pageId);
    if (!page) return;
    var sections = page.querySelectorAll('.legal-section[id]');
    var links    = page.querySelectorAll('.legal-sidebar__link');
    if (!sections.length || !links.length) return;
    window.addEventListener('scroll', function () {
      if (!page.classList.contains('active')) return;
      var fromTop = window.scrollY + 120;
      var current = null;
      sections.forEach(function (sec) { if (sec.offsetTop <= fromTop) current = sec.id; });
      links.forEach(function (link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) link.classList.add('active');
      });
    });
  }
  initLegalSidebar('terms');
  initLegalSidebar('privacy');

  /* ----------------------------------------------------------
     5. SCROLL-REVEAL
  ---------------------------------------------------------- */
  function revealVisible() {
    document.querySelectorAll('.js-reveal:not(.revealed)').forEach(function (el) {
      var page = el.closest('.page');
      if (page && !page.classList.contains('active')) return;
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) el.classList.add('revealed');
    });
  }

  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var page = entry.target.closest('.page');
        if (page && !page.classList.contains('active')) return;
        entry.target.classList.add('revealed');
        revealObs.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.js-reveal').forEach(function (el) { revealObs.observe(el); });
  } else {
    window.addEventListener('scroll', revealVisible, { passive: true });
  }
  revealVisible();

  /* ----------------------------------------------------------
     6. TESTIMONIAL CAROUSEL
  ---------------------------------------------------------- */
  var track   = document.getElementById('tcarouselTrack');
  var dotBtns = document.querySelectorAll('.tdot');
  var current = 0;
  var total   = dotBtns.length;
  var autoTimer;

  function getCardWidth() {
    if (!track) return 0;
    var first = track.querySelector('.tcard');
    return first ? first.offsetWidth + 24 : 0;
  }

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = 'translateX(-' + (current * getCardWidth()) + 'px)';
    dotBtns.forEach(function (d, i) { d.classList.toggle('tdot--active', i === current); });
  }

  if (track && dotBtns.length) {
    dotBtns.forEach(function (btn) {
      btn.addEventListener('click', function () { goTo(parseInt(btn.dataset.idx, 10)); resetAuto(); });
    });
    function startAuto() { autoTimer = setInterval(function () { goTo(current + 1); }, 4000); }
    function resetAuto() { clearInterval(autoTimer); startAuto(); }
    startAuto();

    var startX = 0, isDragging = false, dragDelta = 0;
    track.addEventListener('mousedown',  function (e) { isDragging = true; startX = e.clientX; track.style.transition = 'none'; });
    track.addEventListener('mousemove',  function (e) { if (!isDragging) return; dragDelta = e.clientX - startX; track.style.transform = 'translateX(-' + (current * getCardWidth() - dragDelta) + 'px)'; });
    track.addEventListener('mouseup',    finishDrag);
    track.addEventListener('mouseleave', finishDrag);
    track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; track.style.transition = 'none'; }, { passive: true });
    track.addEventListener('touchmove',  function (e) { dragDelta = e.touches[0].clientX - startX; track.style.transform = 'translateX(-' + (current * getCardWidth() - dragDelta) + 'px)'; }, { passive: true });
    track.addEventListener('touchend',   finishDrag);

    function finishDrag() {
      isDragging = false;
      track.style.transition = '';
      if (dragDelta < -60) goTo(current + 1);
      else if (dragDelta > 60) goTo(current - 1);
      else goTo(current);
      dragDelta = 0;
      resetAuto();
    }
  }

  /* ----------------------------------------------------------
     7. FAQ ACCORDION
  ---------------------------------------------------------- */
  function initFaq() {
    var items = document.querySelectorAll('.faq-item');
    items.forEach(function (item) {
      var btn = item.querySelector('.faq-item__q');
      if (!btn || btn._faqBound) return;
      btn._faqBound = true;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = item.classList.contains('open');
        var list = item.parentNode;
        list.querySelectorAll('.faq-item.open').forEach(function (o) {
          o.classList.remove('open');
          var ob = o.querySelector('.faq-item__q');
          if (ob) ob.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  initFaq();

  var _origShowPage = showPage;
  showPage = function (pageId) {
    _origShowPage(pageId);
    setTimeout(initFaq, 50);
    setTimeout(initFeaturesAccordion, 50);
  };

  /* ----------------------------------------------------------
     8. YOUTUBE CLICK-TO-LOAD
  ---------------------------------------------------------- */
  window.loadYouTube = function (posterEl) {
    var videoId = posterEl.dataset.videoid;
    if (!videoId) return;
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1';
    iframe.title = 'YouTube video player';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    iframe.className = 'yt-poster__iframe';
    posterEl.style.transition = 'opacity .3s ease';
    posterEl.style.opacity = '0';
    setTimeout(function () { posterEl.parentNode.replaceChild(iframe, posterEl); }, 280);
  };

  /* ----------------------------------------------------------
     9. GOOGLE MAPS CLICK-TO-LOAD
  ---------------------------------------------------------- */
  window.loadMap = function (posterEl) {
    var src = posterEl.dataset.src;
    if (!src) return;
    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = 'Net7 Location';
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.style.border = '0';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    iframe.className = 'map-poster__iframe';
    posterEl.style.transition = 'opacity .3s ease';
    posterEl.style.opacity = '0';
    setTimeout(function () { posterEl.parentNode.replaceChild(iframe, posterEl); }, 280);
  };

  /* ----------------------------------------------------------
     10. ACCOUNT — Coming Soon Bubble
  ---------------------------------------------------------- */
  var comingSoonBubble = document.getElementById('comingSoonBubble');
  var comingSoonOpen   = false;

  window.toggleComingSoon = function () {
    comingSoonOpen = !comingSoonOpen;
    comingSoonBubble.classList.toggle('show', comingSoonOpen);
  };

  document.addEventListener('click', function (e) {
    if (comingSoonOpen && !e.target.closest('.account-wrap')) {
      comingSoonOpen = false;
      comingSoonBubble.classList.remove('show');
    }
  });

  /* ----------------------------------------------------------
     11. SEARCH
  ---------------------------------------------------------- */
  var SEARCH_INDEX = [
    { page:'home',     title:'Home',                    desc:'Built for Networking. Made for Business.',                          icon:'home'     },
    { page:'home',     title:'How It Works',            desc:'Scan, Enrich, Locate, Sync, Activate — 5 steps to digitalise.',    icon:'steps'    },
    { page:'home',     title:'Value Proposition',       desc:'70% revenue saved, 40% faster onboarding, AI-driven insights.',    icon:'stats'    },
    { page:'home',     title:'FAQ / About',             desc:'Frequently asked questions about Net7.',                           icon:'faq'      },
    { page:'home',     title:'Contact Us',              desc:'Get in touch — hello@net7.com · +603-2709 7754.',                  icon:'contact'  },
    { page:'features', title:'Features',                desc:'All Net7 product features overview.',                              icon:'features' },
    { page:'features', title:'Business Card Scanning',  desc:'AI-powered OCR captures full card details instantly.',             icon:'features' },
    { page:'features', title:'Sales & Performance',     desc:'Monitor progress, assign follow-ups, close leads.',                icon:'features' },
    { page:'features', title:'Event & Networking',      desc:'Geotag contacts, track where cards were scanned.',                 icon:'features' },
    { page:'features', title:'Activity & Engagement',   desc:'Cloud sync, digital name card, NFC & QR sharing.',                icon:'features' },
    { page:'pricing',  title:'Pricing',                 desc:'Free Trial, Enterprise, and Enterprise+ plans.',                   icon:'pricing'  },
    { page:'pricing',  title:'Free Trial Plan',         desc:'Try Net7 free — no credit card required.',                        icon:'pricing'  },
    { page:'pricing',  title:'Enterprise Plan',         desc:'Full-featured plan for growing teams.',                           icon:'pricing'  },
    { page:'pricing',  title:'Enterprise+ Custom',      desc:'Custom plan for large organisations. Contact sales.',              icon:'pricing'  },
  ];

  var ICON_SVG = {
    home:     '<svg width="18" height="18" fill="none" stroke="#1A6BFF" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    steps:    '<svg width="18" height="18" fill="none" stroke="#1A6BFF" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    stats:    '<svg width="18" height="18" fill="none" stroke="#1A6BFF" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    faq:      '<svg width="18" height="18" fill="none" stroke="#1A6BFF" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    contact:  '<svg width="18" height="18" fill="none" stroke="#1A6BFF" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    features: '<svg width="18" height="18" fill="none" stroke="#1A6BFF" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    pricing:  '<svg width="18" height="18" fill="none" stroke="#1A6BFF" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg>',
    resources:'<svg width="18" height="18" fill="none" stroke="#1A6BFF" stroke-width="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
    about:    '<svg width="18" height="18" fill="none" stroke="#1A6BFF" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
    legal:    '<svg width="18" height="18" fill="none" stroke="#1A6BFF" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  };

  var PAGE_LABELS = {
    home:'Home', features:'Features', pricing:'Pricing',
    resources:'Resources', about:'About Us', terms:'Terms', privacy:'Privacy',
  };

  var searchHighlightIdx = -1;
  var searchResultItems  = [];

  window.openSearch = function () {
    var overlay = document.getElementById('searchOverlay');
    var input   = document.getElementById('searchInput');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    setTimeout(function () { input.focus(); }, 60);
    if (comingSoonOpen) { comingSoonOpen = false; comingSoonBubble.classList.remove('show'); }
  };

  window.closeSearch = function () {
    var overlay = document.getElementById('searchOverlay');
    var input   = document.getElementById('searchInput');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
    input.value = '';
    document.getElementById('searchResults').innerHTML =
      '<p class="search-modal__hint">Start typing to search across all pages</p>';
    searchHighlightIdx = -1;
    searchResultItems  = [];
  };

  window.runSearch = function (query) {
    var resultsEl = document.getElementById('searchResults');
    query = query.trim();
    if (!query) {
      resultsEl.innerHTML = '<p class="search-modal__hint">Start typing to search across all pages</p>';
      searchResultItems = [];
      searchHighlightIdx = -1;
      return;
    }
    var q = query.toLowerCase();
    var matches = SEARCH_INDEX.filter(function (item) {
      return item.title.toLowerCase().indexOf(q) > -1 ||
             item.desc.toLowerCase().indexOf(q)  > -1 ||
             item.page.toLowerCase().indexOf(q)  > -1 ||
             (PAGE_LABELS[item.page]||'').toLowerCase().indexOf(q) > -1;
    });
    if (!matches.length) {
      resultsEl.innerHTML = '<p class="search-modal__empty">No results for <strong>"' + query + '"</strong></p>';
      searchResultItems = [];
      searchHighlightIdx = -1;
      return;
    }
    var grouped = {};
    matches.forEach(function (m) {
      if (!grouped[m.page]) grouped[m.page] = [];
      grouped[m.page].push(m);
    });
    function highlight(text, q) {
      var idx = text.toLowerCase().indexOf(q.toLowerCase());
      if (idx === -1) return text;
      return text.substring(0, idx) + '<mark>' + text.substring(idx, idx + q.length) + '</mark>' + text.substring(idx + q.length);
    }
    var html = '';
    var itemIdx = 0;
    searchResultItems = [];
    Object.keys(grouped).forEach(function (page) {
      html += '<div class="search-group"><p class="search-group__label">' + (PAGE_LABELS[page] || page) + '</p>';
      grouped[page].forEach(function (item) {
        var idx = itemIdx++;
        searchResultItems.push(item);
        html += '<button class="search-item" data-idx="' + idx + '" onclick="searchGo(' + idx + ')">' +
          '<span class="search-item__icon">' + (ICON_SVG[item.icon] || ICON_SVG.home) + '</span>' +
          '<span class="search-item__body"><span class="search-item__title">' + highlight(item.title, query) + '</span>' +
          '<span class="search-item__desc">' + highlight(item.desc, query) + '</span></span>' +
          '<svg class="search-item__arrow" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button>';
      });
      html += '</div>';
    });
    resultsEl.innerHTML = html;
    searchHighlightIdx = -1;
  };

  window.searchGo = function (idx) {
    var item = searchResultItems[idx];
    if (!item) return;
    closeSearch();
    showPage(item.page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.searchKeyNav = function (e) {
    var items = document.querySelectorAll('.search-item');
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); searchHighlightIdx = Math.min(searchHighlightIdx + 1, items.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); searchHighlightIdx = Math.max(searchHighlightIdx - 1, 0); }
    else if (e.key === 'Enter') { e.preventDefault(); if (searchHighlightIdx > -1) searchGo(searchHighlightIdx); else if (items.length === 1) searchGo(0); return; }
    else if (e.key === 'Escape') { closeSearch(); return; }
    else { return; }
    items.forEach(function (el, i) {
      el.classList.toggle('highlighted', i === searchHighlightIdx);
      if (i === searchHighlightIdx) el.scrollIntoView({ block: 'nearest' });
    });
  };

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      var overlay = document.getElementById('searchOverlay');
      if (overlay.classList.contains('open')) closeSearch();
      else openSearch();
    }
    if (e.key === 'Escape') {
      var overlay = document.getElementById('searchOverlay');
      if (overlay.classList.contains('open')) closeSearch();
    }
  });

  /* ----------------------------------------------------------
     12. FAQ PAGE — data + rendering (INSIDE IIFE so initFaqPage
         is in same scope as showPage which calls it)
  ---------------------------------------------------------- */
  var faqData = [
    {
      id: 'getting-started',
      topic: 'Getting Started',
      icon: '<svg width="48" height="48" fill="none" stroke="#1A6BFF" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      qa: [
        { q: 'What is NET7 and how does it work?', a: 'NET7 is an AI-powered networking engine that digitally captures every connection via business card scan, QR code, or NFC tap, and turns it into structured, actionable relationship data. It automates follow-ups, surfaces warm introduction paths, and tracks every interaction.' },
        { q: 'How do I create my NET7 account?', a: 'Download the NET7 app from the App Store or Google Play, tap "Sign Up", enter your email and set a password. You can also sign up via our website and access your account from any browser.' },
        { q: 'Is there a free trial available?', a: 'Yes! NET7 offers a 1-month free trial on the Enterprise plan so you can experience the full feature set before committing. No credit card required to start.' }
      ]
    },
    {
      id: 'scanning',
      topic: 'Card Scanning',
      icon: '<svg width="48" height="48" fill="none" stroke="#1A6BFF" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M17 17h3M17 14h3v3"/></svg>',
      qa: [
        { q: 'How accurate is the business card scanning?', a: 'NET7 uses advanced AI-powered OCR to achieve over 95% accuracy in capturing business card information. It recognises multiple languages and card formats. If anything needs correction, you can edit manually before saving.' },
        { q: 'Which languages does the scanner support?', a: 'The scanner currently supports English, Bahasa Malaysia, Mandarin, Japanese, Korean, and most Latin-script languages. More languages are added with each update.' },
        { q: 'Can I scan multiple cards at once?', a: 'Yes, NET7 supports batch scanning. Simply point the camera at multiple cards in sequence and they will all be queued for processing and saved to your contacts.' }
      ]
    },
    {
      id: 'digital-card',
      topic: 'Digital Name Card',
      icon: '<svg width="48" height="48" fill="none" stroke="#1A6BFF" stroke-width="1.5" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
      qa: [
        { q: 'Can I share my digital name card without the app?', a: 'Yes! Share your digital name card via a unique QR code or NFC tap — no app download required for the recipient. They simply scan or tap to instantly view and save your contact details.' },
        { q: 'How do I update my digital card?', a: 'Go to Profile → Edit Card in the app. Any changes you save are immediately reflected on your card — everyone who visits your card link will always see the latest version.' },
        { q: 'Can I have multiple digital card designs?', a: 'Enterprise plan users can create multiple card templates for different contexts — for example, a formal card for clients and a casual one for networking events.' }
      ]
    },
    {
      id: 'security',
      topic: 'Privacy & Security',
      icon: '<svg width="48" height="48" fill="none" stroke="#1A6BFF" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      qa: [
        { q: 'Is my contact data secure and private?', a: 'Absolutely. All data is encrypted at rest and in transit using enterprise-grade AES-256 encryption. NET7 is SOC 2 compliant and you retain full ownership of your data. We never sell or share your data with third parties.' },
        { q: 'Can I delete my data?', a: 'Yes. You can delete individual contacts, export your full data, or delete your entire account at any time from Settings → Privacy → Delete Account. Deletion is permanent and immediate.' },
        { q: 'Who can see my contacts?', a: 'Only you can see your personal contacts. In Enterprise accounts, contacts can be shared with your team according to the permissions your admin sets. You always have control over what is shared.' }
      ]
    },
    {
      id: 'sync',
      topic: 'Sync & Devices',
      icon: '<svg width="48" height="48" fill="none" stroke="#1A6BFF" stroke-width="1.5" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>',
      qa: [
        { q: 'Can I sync my contacts across multiple devices?', a: 'Yes. NET7 uses secure cloud sync to keep your contacts and activity history up to date across all your devices in real time — iOS, Android, and web browser.' },
        { q: 'Does NET7 integrate with my existing CRM?', a: 'NET7 integrates with Salesforce, HubSpot, and Zoho CRM on Enterprise plans. Contacts and interaction history sync automatically on a schedule you configure.' },
        { q: 'Can I export my contacts to Excel or CSV?', a: 'Yes. Go to Contacts → Export and choose your preferred format: CSV, Excel, or vCard. You can export all contacts or filter by tag, date range, or event.' }
      ]
    },
    {
      id: 'plans',
      topic: 'Plans & Billing',
      icon: '<svg width="48" height="48" fill="none" stroke="#1A6BFF" stroke-width="1.5" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg>',
      qa: [
        { q: "What\'s the difference between Personal and Enterprise plans?", a: 'Personal plans are for individual professionals. Enterprise plans unlock team collaboration, shared contact pools, admin dashboards, role-based permissions, API integrations, and a dedicated Customer Success Manager.' },
        { q: 'Can I upgrade or downgrade my plan anytime?', a: 'Yes. You can upgrade immediately from within the app or your account portal. Downgrades take effect at the end of your current billing cycle.' },
        { q: 'What payment methods are accepted?', a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex), online banking, and corporate invoice billing for Enterprise accounts.' }
      ]
    }
  ];

  function renderFaqRecommended() {
    var container = document.getElementById('faqRecommended');
    if (!container) return;
    var html = '', shown = 0;
    for (var i = 0; i < faqData.length && shown < 3; i++) {
      if (!faqData[i].qa || !faqData[i].qa.length) continue;
      var first = faqData[i].qa[0];
      html += '<div class="faqp-rec-card' + (shown === 0 ? ' faqp-rec-card--active' : '') + '" onclick="openFaqTopic(\'' + faqData[i].id + '\')">'
            + '<div class="faqp-rec-card__body"><div class="faqp-rec-card__topic">' + faqData[i].topic + '</div>'
            + '<div class="faqp-rec-card__q">' + first.q + '</div></div>'
            + '<svg class="faqp-rec-card__arrow" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>'
            + '</div>';
      shown++;
    }
    container.innerHTML = html;
  }

  function renderFaqTopics() {
    var container = document.getElementById('faqTopicsGrid');
    if (!container) return;
    var html = '';
    for (var i = 0; i < faqData.length; i++) {
      var t = faqData[i];
      html += '<div class="faqp-topic-card" onclick="openFaqTopic(\'' + t.id + '\')">'
            + '<div class="faqp-topic-card__icon">' + t.icon + '</div>'
            + '<div class="faqp-topic-card__name">' + t.topic + '</div>'
            + '<div class="faqp-topic-card__count">' + t.qa.length + ' article' + (t.qa.length !== 1 ? 's' : '') + '</div>'
            + '</div>';
    }
    container.innerHTML = html;
  }

  window.openFaqTopic = function (topicId) {
    var topic = null;
    for (var i = 0; i < faqData.length; i++) {
      if (faqData[i].id === topicId) { topic = faqData[i]; break; }
    }
    if (!topic) return;
    document.getElementById('faqDetailTitle').textContent = topic.topic;
    document.getElementById('faqDetailCount').textContent = topic.qa.length + ' article' + (topic.qa.length !== 1 ? 's' : '');
    document.getElementById('faqDetailIcon').innerHTML = topic.icon;
    var listHtml = '';
    for (var j = 0; j < topic.qa.length; j++) {
      listHtml += '<div class="faq-item js-faq">'
                + '<button class="faq-item__q" aria-expanded="false">'
                + '<span class="faq-item__text">' + topic.qa[j].q + '</span>'
                + '<span class="faq-item__icon"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></span>'
                + '</button>'
                + '<div class="faq-item__a"><p>' + topic.qa[j].a + '</p></div>'
                + '</div>';
    }
    document.getElementById('faqDetailList').innerHTML = listHtml;
    setTimeout(initFaq, 0);
    document.querySelector('.faqp-recommended').style.display = 'none';
    document.querySelector('.faqp-topics').style.display = 'none';
    document.getElementById('faqDetail').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.showFaqTopics = function () {
    document.querySelector('.faqp-recommended').style.display = '';
    document.querySelector('.faqp-topics').style.display = '';
    document.getElementById('faqDetail').style.display = 'none';
  };

  function initFaqPage() {
    renderFaqRecommended();
    renderFaqTopics();
    window.showFaqTopics();
  }

  /* Also expose faqData so CMS applyFaqPage can replace it */
  window._faqData = faqData;

})(); /* end IIFE */

/* ============================================================
   FORM VALIDATION  (outside IIFE — needs global scope for onsubmit)
============================================================ */

function validateAndSubmit(e, form) {
  e.preventDefault();
  var fields  = form.querySelectorAll('[data-validate]');
  var isValid = true;
  fields.forEach(function (el) {
    el.classList.remove('field-invalid', 'field-valid');
    var err = el.parentElement.querySelector('.field-error');
    if (err) { err.textContent = ''; err.classList.remove('visible'); }
  });
  var successBanner = form.querySelector('.form-success');
  if (successBanner) successBanner.classList.remove('visible');
  fields.forEach(function (el) {
    var rule  = el.dataset.validate;
    var label = el.dataset.label || 'This field';
    var val   = el.value.trim();
    var err   = el.parentElement.querySelector('.field-error');
    var msg   = '';
    if (!val) { msg = label + ' is required.'; }
    if (!msg && rule === 'name') {
      if (val.length < 2) { msg = label + ' must be at least 2 characters.'; }
      else if (!/^[a-zA-ZÀ-ÿ\s'\-\.]+$/.test(val)) { msg = label + ' should contain letters only.'; }
    }
    if (!msg && rule === 'email' && val) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) { msg = 'Please enter a valid email address (e.g. name@company.com).'; }
    }
    if (msg) {
      isValid = false;
      el.classList.add('field-invalid');
      if (err) { err.textContent = msg; err.classList.add('visible'); }
    } else if (val) {
      el.classList.add('field-valid');
    }
  });
  if (!isValid) {
    form.classList.remove('form-shake');
    void form.offsetWidth;
    form.classList.add('form-shake');
    setTimeout(function () { form.classList.remove('form-shake'); }, 500);
    var firstErr = form.querySelector('.field-invalid');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  /* ── Collect form values ── */
  var nameEl    = form.querySelector('[data-label="Full Name"], [data-label="Name"]');
  var emailEl   = form.querySelector('[data-validate="email"]');
  var companyEl = form.querySelector('[data-label="Company"], [data-label="Company Name"]');
  var needEl    = form.querySelector('select');
  var msgEl     = form.querySelector('textarea');

  var payload = {
    name:    nameEl    ? nameEl.value.trim()    : '',
    email:   emailEl   ? emailEl.value.trim()   : '',
    company: companyEl ? companyEl.value.trim() : '',
    need:    needEl    ? needEl.value           : '',
    message: msgEl     ? msgEl.value.trim()     : ''
  };

  /* ── Submit button loading state ── */
  var btn = form.querySelector('[type="submit"]');
  var origHTML = btn ? btn.innerHTML : '';
  if (btn) { btn.classList.add('btn-submitting'); btn.innerHTML = 'Sending…'; }

  /* ── Submit directly to Airtable ── */
  var AIRTABLE_TOKEN   = 'YOUR_AIRTABLE_TOKEN';
  var AIRTABLE_BASE_ID = 'app5ZcErLCXmQoslo';
  var AIRTABLE_TABLE   = 'Submissions';
  var AIRTABLE_URL     = 'https://api.airtable.com/v0/' + AIRTABLE_BASE_ID + '/' + encodeURIComponent(AIRTABLE_TABLE);

  var record = {
    fields: {
      'Full Name':            payload.name,
      'Email':                payload.email,
      'Company':              payload.company,
      'Tell Us What You Need': payload.need,
      'Message':              payload.message
    }
  };

  fetch(AIRTABLE_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Bearer ' + AIRTABLE_TOKEN
    },
    body: JSON.stringify(record)
  })
  .then(function(res) {
    if (!res.ok) { return res.json().then(function(e) { throw e; }); }
    return res.json();
  })
  .then(function() {
    if (btn) { btn.classList.remove('btn-submitting'); btn.innerHTML = origHTML; }
    /* Show success banner */
    if (successBanner) successBanner.classList.add('visible');
    /* Clear all fields */
    fields.forEach(function(el) { el.value = ''; el.classList.remove('field-valid', 'field-invalid'); });
    if (needEl) needEl.selectedIndex = 0;
    if (msgEl)  msgEl.value = '';
    if (successBanner) successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function() { if (successBanner) successBanner.classList.remove('visible'); }, 6000);
  })
  .catch(function(err) {
    if (btn) { btn.classList.remove('btn-submitting'); btn.innerHTML = origHTML; }
    console.error('Airtable submit error:', err);
    alert('Something went wrong. Please email us directly at hello@net7.biz');
  });
}

/* ================================================================
   REQUEST DEMO — navigate to home page & scroll to capture form
================================================================ */
/* ================================================================
   SCROLL TO CAPTURE FORM — used by Watch Demo + Footer Contact Us
================================================================ */
function scrollToCapture() {
  if (typeof showPage === 'function') showPage('home');
  setTimeout(function() {
    var formWrap = document.querySelector('.capture-v2__form-wrap');
    if (formWrap) {
      formWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var firstInput = formWrap.querySelector('input:not([type="hidden"]), textarea, select');
      if (firstInput) setTimeout(function() { firstInput.focus(); }, 500);
    }
  }, 150);
}

function openRequestDemo() {
  /* Close mobile menu if open */
  var mm = document.getElementById('mobileMenu');
  if (mm && mm.classList.contains('open')) {
    mm.classList.remove('open');
    var hamburger = document.getElementById('hamburger');
    if (hamburger) {
      var spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
      hamburger.setAttribute('aria-expanded', 'false');
    }
  }
  /* Navigate to home page */
  if (typeof showPage === 'function') showPage('home');
  /* Scroll to capture-v2 section */
  setTimeout(function() {
    var section = document.querySelector('.capture-v2');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var firstInput = section.querySelector('input:not([type="hidden"]), textarea, select');
      if (firstInput) setTimeout(function() { firstInput.focus(); }, 500);
    }
  }, 150);
}

document.addEventListener('input', function (e) {
  var el = e.target;
  if (!el.dataset || !el.dataset.validate) return;
  el.classList.remove('field-invalid');
  var err = el.parentElement ? el.parentElement.querySelector('.field-error') : null;
  if (err) { err.textContent = ''; err.classList.remove('visible'); }
});

/* ── FAQ Page init on load (if faq-page starts active) ── */
document.addEventListener('DOMContentLoaded', function () {
  var faqPage = document.getElementById('page-faq-page');
  if (faqPage && faqPage.classList.contains('active')) {
    if (typeof initFaqPage === 'function') initFaqPage();
  }
});
