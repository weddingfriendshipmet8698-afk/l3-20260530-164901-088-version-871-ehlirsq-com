(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function initMobileNav() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
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
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                start();
            });
        });

        start();
    }

    function initPosterFallback() {
        document.querySelectorAll('img[data-fallback="poster"]').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-hidden');
            }, { once: true });
        });
    }

    function initFilters() {
        document.querySelectorAll('.js-filter-scope').forEach(function (scope) {
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var search = scope.querySelector('.js-search');
            var typeSelect = scope.querySelector('.js-type');
            var regionSelect = scope.querySelector('.js-region');
            var yearSelect = scope.querySelector('.js-year');
            var genreSelect = scope.querySelector('.js-genre');
            var count = scope.querySelector('.js-result-count');
            var noResults = scope.querySelector('.no-results');
            if (!cards.length) {
                return;
            }

            function includesValue(source, value) {
                if (!value) {
                    return true;
                }
                return (source || '').indexOf(value) !== -1;
            }

            function apply() {
                var keyword = search ? search.value.trim().toLowerCase() : '';
                var type = typeSelect ? typeSelect.value : '';
                var region = regionSelect ? regionSelect.value : '';
                var year = yearSelect ? yearSelect.value : '';
                var genre = genreSelect ? genreSelect.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var matchesKeyword = !keyword || (card.getAttribute('data-search') || '').toLowerCase().indexOf(keyword) !== -1;
                    var matchesType = includesValue(card.getAttribute('data-type'), type);
                    var matchesRegion = includesValue(card.getAttribute('data-region'), region);
                    var matchesYear = includesValue(card.getAttribute('data-year'), year);
                    var matchesGenre = includesValue(card.getAttribute('data-genre'), genre);
                    var matched = matchesKeyword && matchesType && matchesRegion && matchesYear && matchesGenre;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }
                if (noResults) {
                    noResults.hidden = visible !== 0;
                }
            }

            [search, typeSelect, regionSelect, yearSelect, genreSelect].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            });
        });
    }

    function initPlayers() {
        document.querySelectorAll('.js-player').forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.player-button');
            var source = player.getAttribute('data-src');
            if (!video || !button || !source) {
                return;
            }
            var hlsInstance = null;

            function attachSource() {
                if (video.dataset.ready === 'true') {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        } else {
                            hlsInstance.destroy();
                        }
                    });
                } else {
                    video.src = source;
                }
                video.dataset.ready = 'true';
            }

            function playVideo() {
                attachSource();
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        player.classList.remove('is-playing');
                    });
                }
            }

            button.addEventListener('click', playVideo);
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                player.classList.remove('is-playing');
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMobileNav();
        initHeroSlider();
        initPosterFallback();
        initFilters();
        initPlayers();
    });
}());
