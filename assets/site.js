(function() {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    ready(function() {
        document.querySelectorAll('[data-menu-toggle]').forEach(function(button) {
            button.addEventListener('click', function() {
                var menu = document.querySelector('[data-mobile-menu]');
                if (menu) {
                    menu.classList.toggle('is-open');
                }
            });
        });

        document.querySelectorAll('.site-search-form').forEach(function(form) {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var target = './search.html';
                window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
            });
        });

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function(slide, i) {
                    slide.classList.toggle('is-active', i === index);
                });
                dots.forEach(function(dot, i) {
                    dot.classList.toggle('is-active', i === index);
                });
            }

            function start() {
                clearInterval(timer);
                timer = setInterval(function() {
                    show(index + 1);
                }, 5000);
            }

            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            if (prev) {
                prev.addEventListener('click', function() {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener('click', function() {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function(dot, i) {
                dot.addEventListener('click', function() {
                    show(i);
                    start();
                });
            });
            start();
        }

        document.querySelectorAll('[data-filter-page]').forEach(function(page) {
            var input = page.querySelector('.filter-search');
            var selects = Array.prototype.slice.call(page.querySelectorAll('.filter-select'));
            var cards = Array.prototype.slice.call(page.querySelectorAll('[data-card]'));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q');
            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function matches(card) {
                var query = normalize(input ? input.value : '');
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));

                if (query && text.indexOf(query) === -1) {
                    return false;
                }

                return selects.every(function(select) {
                    var value = normalize(select.value);
                    if (!value) {
                        return true;
                    }
                    var key = select.getAttribute('data-filter');
                    return normalize(card.getAttribute('data-' + key)) === value;
                });
            }

            function apply() {
                cards.forEach(function(card) {
                    card.style.display = matches(card) ? '' : 'none';
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function(select) {
                select.addEventListener('change', apply);
            });
            apply();
        });
    });

    window.initMoviePlayer = function(streamUrl) {
        var video = document.getElementById('movieVideo');
        var covers = Array.prototype.slice.call(document.querySelectorAll('[data-play]'));
        var attached = false;
        var player = null;

        function attach() {
            if (!video || attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                player = new window.Hls({ maxBufferLength: 30 });
                player.loadSource(streamUrl);
                player.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function begin() {
            if (!video) {
                return;
            }
            attach();
            covers.forEach(function(cover) {
                cover.classList.add('is-hidden');
            });
            var playback = video.play();
            if (playback && playback.catch) {
                playback.catch(function() {});
            }
        }

        covers.forEach(function(cover) {
            cover.addEventListener('click', begin);
        });
        if (video) {
            video.addEventListener('click', function() {
                if (video.paused) {
                    begin();
                }
            });
        }
        window.addEventListener('pagehide', function() {
            if (player && player.destroy) {
                player.destroy();
            }
        });
    };
})();
