(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        setupHero();
        setupFilters();
        setupPlayers();
        hydrateSearchQuery();
    });

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var section = panel.closest("section") || document;
            var list = section.querySelector("[data-card-list]") || document.querySelector("[data-card-list]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            var text = panel.querySelector("[data-filter-text]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");

            function value(node) {
                return node ? node.value.trim().toLowerCase() : "";
            }

            function apply() {
                var q = value(text);
                var y = value(year);
                var t = value(type);
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-tags") || ""
                    ].join(" ").toLowerCase();
                    var yearMatch = !y || (card.getAttribute("data-year") || "").toLowerCase() === y;
                    var typeMatch = !t || (card.getAttribute("data-type") || "").toLowerCase() === t;
                    var textMatch = !q || haystack.indexOf(q) !== -1;
                    card.classList.toggle("is-filter-hidden", !(yearMatch && typeMatch && textMatch));
                });
            }

            [text, year, type].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", apply);
                    node.addEventListener("change", apply);
                }
            });
        });
    }

    function hydrateSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (!q) {
            return;
        }
        var field = document.querySelector("[data-filter-text]");
        if (field) {
            field.value = q;
            field.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (frame) {
            var video = frame.querySelector("video");
            var trigger = frame.querySelector("[data-play-trigger]");
            if (!video || !trigger) {
                return;
            }
            var stream = video.getAttribute("data-stream");
            var loaded = false;
            var hlsInstance = null;

            function attach() {
                if (loaded || !stream) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    loaded = true;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    loaded = true;
                    return;
                }
                video.src = stream;
                loaded = true;
            }

            function start() {
                attach();
                trigger.classList.add("is-hidden");
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        trigger.classList.remove("is-hidden");
                    });
                }
            }

            trigger.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                start();
            });

            video.addEventListener("play", function () {
                trigger.classList.add("is-hidden");
            });

            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    trigger.classList.remove("is-hidden");
                }
            });

            video.addEventListener("ended", function () {
                trigger.classList.remove("is-hidden");
            });

            frame.addEventListener("click", function (event) {
                if (event.target === frame) {
                    start();
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance && typeof hlsInstance.destroy === "function") {
                    hlsInstance.destroy();
                }
            });
        });
    }
})();
