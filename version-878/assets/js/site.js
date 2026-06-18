(function () {
  var navButton = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      navButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeIndex = 0;
  var heroTimer = null;

  function setHeroSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === activeIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === activeIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    heroTimer = window.setInterval(function () {
      setHeroSlide(activeIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      window.clearInterval(heroTimer);
      setHeroSlide(Number(dot.getAttribute('data-slide-to')) || 0);
      startHero();
    });
  });
  startHero();

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  var searchInput = document.getElementById('siteSearchInput');
  var searchList = document.getElementById('siteSearchList');
  var activeRegion = '';
  var activeType = '';

  function filterSearchList() {
    if (!searchList) {
      return;
    }
    var q = normalize(searchInput ? searchInput.value : '');
    Array.prototype.slice.call(searchList.querySelectorAll('.movie-card')).forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre')
      ].join(' '));
      var regionOk = !activeRegion || card.getAttribute('data-region') === activeRegion;
      var typeOk = !activeType || card.getAttribute('data-type') === activeType;
      var queryOk = !q || haystack.indexOf(q) !== -1;
      card.classList.toggle('is-hidden-by-filter', !(regionOk && typeOk && queryOk));
    });
  }

  if (searchInput && searchList) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
      searchInput.value = initialQuery;
    }
    searchInput.addEventListener('input', filterSearchList);
    Array.prototype.slice.call(document.querySelectorAll('[data-region]')).forEach(function (button) {
      button.addEventListener('click', function () {
        activeRegion = button.getAttribute('data-region') || '';
        Array.prototype.slice.call(document.querySelectorAll('[data-region]')).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        filterSearchList();
      });
    });
    Array.prototype.slice.call(document.querySelectorAll('[data-type]')).forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = button.getAttribute('data-type') || '';
        Array.prototype.slice.call(document.querySelectorAll('[data-type]')).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        filterSearchList();
      });
    });
    filterSearchList();
  }

  var pageFilterInput = document.querySelector('.page-filter-input');
  var pageFilterList = document.querySelector('[data-filter-list]');
  var activeYear = '';

  function filterPageList() {
    if (!pageFilterList) {
      return;
    }
    var q = normalize(pageFilterInput ? pageFilterInput.value : '');
    Array.prototype.slice.call(pageFilterList.querySelectorAll('.movie-card')).forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year')
      ].join(' '));
      var yearOk = !activeYear || card.getAttribute('data-year') === activeYear;
      var queryOk = !q || haystack.indexOf(q) !== -1;
      card.classList.toggle('is-hidden-by-filter', !(yearOk && queryOk));
    });
  }

  if (pageFilterInput && pageFilterList) {
    pageFilterInput.addEventListener('input', filterPageList);
    Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]')).forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.getAttribute('data-filter-value') || '';
        Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]')).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        filterPageList();
      });
    });
    filterPageList();
  }
}());
