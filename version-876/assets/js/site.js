(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-nav-menu]");

        if (menuButton && menu) {
            menuButton.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                });
            });

            if (slides.length > 1) {
                setInterval(function () {
                    show(current + 1);
                }, 5000);
            }
        }

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var panel = scope.parentElement.querySelector(".filter-panel");
            if (!panel) {
                return;
            }

            var input = panel.querySelector(".filter-input");
            var yearSelect = panel.querySelector(".filter-select");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));

            function applyFilter() {
                var keyword = normalize(input ? input.value : "");
                var year = yearSelect ? yearSelect.value : "";

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-haystack"));
                    var cardYear = card.getAttribute("data-year") || haystack;
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchYear = !year || cardYear.indexOf(year) !== -1;
                    card.classList.toggle("is-hidden", !(matchKeyword && matchYear));
                });
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", applyFilter);
            }
        });

        var resultBox = document.querySelector("[data-search-results]");
        if (resultBox && window.SEARCH_MOVIES) {
            var params = new URLSearchParams(window.location.search);
            var q = normalize(params.get("q"));
            var formInput = document.querySelector(".big-search input[name='q']");
            var summary = document.querySelector("[data-search-summary]");

            if (formInput) {
                formInput.value = params.get("q") || "";
            }

            var results = window.SEARCH_MOVIES.filter(function (movie) {
                if (!q) {
                    return true;
                }
                return normalize(movie.title + " " + movie.region + " " + movie.type + " " + movie.year + " " + movie.genre + " " + movie.tags.join(" ")).indexOf(q) !== -1;
            }).slice(0, 120);

            if (summary) {
                summary.textContent = q ? "搜索结果" : "推荐内容";
            }

            resultBox.innerHTML = results.map(function (movie) {
                var tags = movie.tags.slice(0, 2).map(function (tag) {
                    return "<span>" + escapeHtml(tag) + "</span>";
                }).join("");

                return "<article class=\"video-card movie-card\">" +
                    "<a class=\"card-link\" href=\"" + escapeHtml(movie.url) + "\">" +
                    "<div class=\"card-image-wrap\">" +
                    "<img class=\"video-card-image\" src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\">" +
                    "<span class=\"duration-badge\">" + escapeHtml(movie.year) + "</span>" +
                    "<span class=\"play-float\">▶</span>" +
                    "</div>" +
                    "<div class=\"card-body\">" +
                    "<span class=\"region-badge\">" + escapeHtml(movie.region) + "</span>" +
                    "<h2>" + escapeHtml(movie.title) + "</h2>" +
                    "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                    "<div class=\"tag-list\">" + tags + "</div>" +
                    "</div>" +
                    "</a>" +
                    "</article>";
            }).join("");
        }
    });

    function escapeHtml(value) {
        return (value || "").toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.setupPlayer = function (videoId, buttonId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var overlay = document.getElementById(overlayId);
        var shell = video ? video.closest(".player-shell") : null;
        var message = shell ? shell.querySelector(".player-message") : null;
        var hlsInstance = null;
        var prepared = false;

        if (!video || !button || !overlay) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }

            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.ERROR, function (_, data) {
                    if (data && data.fatal && message) {
                        message.textContent = "暂时无法播放，请稍后再试";
                    }
                });
            } else {
                video.src = streamUrl;
            }
        }

        function start() {
            prepare();
            overlay.classList.add("is-hidden");
            video.controls = true;
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            start();
        });

        overlay.addEventListener("click", start);

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
