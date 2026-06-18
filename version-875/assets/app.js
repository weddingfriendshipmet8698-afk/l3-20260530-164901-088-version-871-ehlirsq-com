(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupImages() {
    document.querySelectorAll("img[data-cover]").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
      });
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-to]"));
    var prev = carousel.querySelector("[data-slide-prev]");
    var next = carousel.querySelector("[data-slide-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot) {
        dot.classList.toggle("is-active", Number(dot.getAttribute("data-slide-to")) === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-to")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function textForCard(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-tags") || "",
      card.getAttribute("data-year") || "",
      card.textContent || ""
    ].join(" ").toLowerCase();
  }

  function applyFilter(input) {
    var scope = input.closest("main") || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".filter-scope .movie-card, .filter-scope .rank-item"));
    var query = input.value.trim().toLowerCase();
    cards.forEach(function (card) {
      var matched = !query || textForCard(card).indexOf(query) !== -1;
      card.classList.toggle("hidden-by-filter", !matched);
    });
  }

  function setupFilters() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
      if (q && !input.value) {
        input.value = q;
      }
      applyFilter(input);
      input.addEventListener("input", function () {
        applyFilter(input);
      });
    });
  }

  function setupPlayers() {
    document.querySelectorAll("video[data-video-src]").forEach(function (video) {
      var box = video.closest("[data-player]");
      var button = box ? box.querySelector("[data-play-toggle]") : null;
      var src = video.getAttribute("data-video-src");
      var attached = false;
      var hls = null;

      function attach() {
        if (attached || !src) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      function play() {
        attach();
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      video.addEventListener("play", function () {
        if (box) {
          box.classList.add("is-playing");
        }
      });

      video.addEventListener("pause", function () {
        if (box) {
          box.classList.remove("is-playing");
        }
      });

      video.addEventListener("click", function () {
        attach();
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupImages();
    setupCarousel();
    setupFilters();
    setupPlayers();
  });
})();
