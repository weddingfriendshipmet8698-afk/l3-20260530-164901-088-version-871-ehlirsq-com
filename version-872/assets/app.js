(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function encodeQuery(value) {
    return encodeURIComponent((value || '').trim());
  }

  function initMenu() {
    var button = one('.nav-toggle');
    var nav = one('.site-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    all('.search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = one('.search-input', form);
        if (!input) {
          return;
        }
        var query = encodeQuery(input.value);
        event.preventDefault();
        window.location.href = './search.html' + (query ? '?q=' + query : '');
      });
    });
  }

  function initHero() {
    var hero = one('.hero');
    if (!hero) {
      return;
    }
    var slides = all('.hero-slide', hero);
    var dots = all('.hero-dot', hero);
    var prev = one('.hero-prev', hero);
    var next = one('.hero-next', hero);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initLocalFilters() {
    var input = one('.local-filter-input');
    var cards = all('.movie-card');
    var buttons = all('.filter-button');
    if (!cards.length || (!input && !buttons.length)) {
      return;
    }
    var active = '';

    function apply() {
      var text = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matchText = !text || haystack.indexOf(text) !== -1;
        var matchButton = !active || haystack.indexOf(active.toLowerCase()) !== -1;
        card.style.display = matchText && matchButton ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        active = button.getAttribute('data-filter') || '';
        apply();
      });
    });
  }

  function safe(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function searchCard(item) {
    return '' +
      '<article class="movie-card" data-search="' + safe(item.text) + '">' +
      '<a class="poster-wrap" href="' + safe(item.link) + '">' +
      '<img class="poster-img" src="' + safe(item.cover) + '" alt="' + safe(item.title) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
      '<span class="movie-badge">' + safe(item.year) + '</span>' +
      '<span class="play-badge">▶</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<a class="movie-title" href="' + safe(item.link) + '">' + safe(item.title) + '</a>' +
      '<div class="movie-meta">' + safe(item.region) + ' · ' + safe(item.type) + '</div>' +
      '<p>' + safe(item.oneLine) + '</p>' +
      '<div class="tag-row"><span>' + safe(item.genre) + '</span></div>' +
      '</div>' +
      '</article>';
  }

  function initSearchPage() {
    var container = one('#search-results');
    var status = one('#search-status');
    if (!container || !window.SITE_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var inputs = all('.search-input');
    inputs.forEach(function (input) {
      input.value = query;
    });
    if (!query) {
      status.textContent = '输入关键词后即可浏览匹配内容';
      container.innerHTML = '';
      return;
    }
    var tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    var results = window.SITE_SEARCH_INDEX.filter(function (item) {
      var text = String(item.text || '').toLowerCase();
      return tokens.every(function (token) {
        return text.indexOf(token) !== -1;
      });
    }).slice(0, 120);
    status.textContent = results.length ? '已找到匹配内容' : '没有找到匹配内容';
    container.innerHTML = results.map(searchCard).join('');
  }

  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var error = document.getElementById(options.errorId);
    var source = options.source;
    var loaded = false;
    var hlsPlayer = null;

    if (!video || !button || !source) {
      return;
    }

    function setError(message) {
      if (error) {
        error.textContent = message || '';
      }
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsPlayer.loadSource(source);
        hlsPlayer.attachMedia(video);
        hlsPlayer.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setError('播放器加载失败，请稍后重试');
          }
        });
      } else {
        video.src = source;
      }
    }

    function play() {
      load();
      button.classList.add('is-hidden');
      setError('');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsPlayer) {
        hlsPlayer.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearchForms();
    initHero();
    initLocalFilters();
    initSearchPage();
  });
})();
