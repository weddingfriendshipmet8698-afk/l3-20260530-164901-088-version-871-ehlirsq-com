(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      var value = input.value.trim();
      if (!value) {
        event.preventDefault();
        window.location.href = 'search.html';
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        play();
      });
    });

    showSlide(0);
    play();
  }

  var list = document.querySelector('[data-card-list]');
  if (list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-filter-year]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var reset = document.querySelector('[data-filter-reset]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (input && q) {
      input.value = q;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function matchCard(card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.category,
        card.dataset.genre,
        card.textContent
      ].join(' '));
      var keyword = input ? normalize(input.value) : '';
      var yearValue = year ? normalize(year.value) : '';
      var regionValue = region ? normalize(region.value) : '';
      var typeValue = type ? normalize(type.value) : '';

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }
      if (yearValue && normalize(card.dataset.year) !== yearValue) {
        return false;
      }
      if (regionValue && normalize(card.dataset.region).indexOf(regionValue) === -1) {
        return false;
      }
      if (typeValue && normalize(card.dataset.type).indexOf(typeValue) === -1) {
        return false;
      }
      return true;
    }

    function applyFilter() {
      cards.forEach(function (card) {
        card.classList.toggle('is-hidden', !matchCard(card));
      });
    }

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        applyFilter();
      });
    }

    applyFilter();
  }

  document.querySelectorAll('[data-scroll-player]').forEach(function (button) {
    button.addEventListener('click', function (event) {
      var player = document.querySelector('[data-player]');
      if (player) {
        event.preventDefault();
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var playButton = player.querySelector('[data-play-button]');
        if (playButton) {
          playButton.focus({ preventScroll: true });
        }
      }
    });
  });
})();
