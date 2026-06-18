(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMobileNav() {
    var toggle = qs('[data-nav-toggle]');
    var nav = qs('[data-main-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = qs('[data-hero]');

    if (!root) {
      return;
    }

    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    if (slides.length > 1) {
      start();
    }
  }

  function initLocalFilter() {
    var input = qs('[data-local-filter]');

    if (!input) {
      return;
    }

    var cards = qsa('[data-card]');

    input.addEventListener('input', function () {
      var keyword = normalize(input.value);

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-keywords') || card.textContent);
        card.style.display = haystack.indexOf(keyword) >= 0 ? '' : 'none';
      });
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card" data-card>' +
        '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-badge">' + escapeHtml(movie.year || movie.type) + '</span>' +
          '<span class="poster-play">播放</span>' +
        '</a>' +
        '<div class="card-body">' +
          '<div class="card-meta">' +
            '<span>' + escapeHtml(movie.region) + '</span>' +
            '<span>' + escapeHtml(movie.type) + '</span>' +
          '</div>' +
          '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function initSearchPage() {
    var results = qs('[data-search-results]');
    var input = qs('[data-search-input]');
    var button = qs('[data-search-button]');
    var typeSelect = qs('[data-search-type]');
    var regionSelect = qs('[data-search-region]');
    var data = window.MOVIE_DATA || [];

    if (!results || !input || !data.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function matches(movie, keyword, typeValue, regionValue) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' '));

      var keywordOk = !keyword || haystack.indexOf(keyword) >= 0;
      var typeOk = !typeValue || normalize(movie.type).indexOf(typeValue) >= 0;
      var regionOk = !regionValue || normalize(movie.region).indexOf(regionValue) >= 0;

      return keywordOk && typeOk && regionOk;
    }

    function render() {
      var keyword = normalize(input.value);
      var typeValue = normalize(typeSelect && typeSelect.value);
      var regionValue = normalize(regionSelect && regionSelect.value);
      var filtered = data.filter(function (movie) {
        return matches(movie, keyword, typeValue, regionValue);
      });

      if (!filtered.length) {
        results.innerHTML = '<div class="empty-state">未找到匹配内容，请尝试更换关键词。</div>';
        return;
      }

      results.innerHTML = filtered.slice(0, 120).map(cardTemplate).join('');
    }

    input.addEventListener('input', render);

    if (button) {
      button.addEventListener('click', render);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', render);
    }

    if (regionSelect) {
      regionSelect.addEventListener('change', render);
    }

    render();
  }

  function showPlayerMessage(shell, message) {
    var messageBox = qs('[data-player-message]', shell);

    if (!messageBox) {
      return;
    }

    messageBox.textContent = message;
    messageBox.classList.add('is-visible');
  }

  function initVideoPlayer() {
    qsa('[data-player]').forEach(function (shell) {
      var video = qs('video', shell);
      var button = qs('[data-player-start]', shell);
      var source = shell.getAttribute('data-m3u8');
      var hlsInstance = null;

      if (!video || !button || !source) {
        return;
      }

      button.addEventListener('click', function () {
        button.classList.add('is-hidden');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              showPlayerMessage(shell, '浏览器阻止了自动播放，请点击播放器继续播放。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showPlayerMessage(shell, '播放源暂时无法加载，请稍后重试。');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {
              showPlayerMessage(shell, '浏览器阻止了自动播放，请点击播放器继续播放。');
            });
          }, { once: true });
        } else {
          showPlayerMessage(shell, '当前浏览器需要 HLS 支持才能播放该视频。');
        }
      });

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initLocalFilter();
    initSearchPage();
    initVideoPlayer();
  });
})();
