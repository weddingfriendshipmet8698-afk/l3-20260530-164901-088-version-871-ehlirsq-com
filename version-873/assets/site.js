(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === activeIndex);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === activeIndex);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    var heroForm = document.querySelector("[data-hero-search]");
    if (heroForm) {
      heroForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = heroForm.querySelector("input");
        var query = input ? input.value.trim() : "";
        var url = "./search.html";
        if (query) {
          url += "?q=" + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    }

    var filterScope = document.querySelector("[data-filter-scope]");
    if (filterScope) {
      var keyword = filterScope.querySelector("[data-filter-keyword]");
      var region = filterScope.querySelector("[data-filter-region]");
      var type = filterScope.querySelector("[data-filter-type]");
      var year = filterScope.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(filterScope.querySelectorAll(".js-filter-card"));
      var empty = filterScope.querySelector("[data-no-results]");
      var params = new URLSearchParams(window.location.search);

      if (keyword && params.get("q")) {
        keyword.value = params.get("q");
      }

      function valueOf(control) {
        return control ? control.value.trim().toLowerCase() : "";
      }

      function filterCards() {
        var q = valueOf(keyword);
        var selectedRegion = valueOf(region);
        var selectedType = valueOf(type);
        var selectedYear = valueOf(year);
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-category") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-year") || ""
          ].join(" ").toLowerCase();
          var ok = true;

          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (selectedRegion && (card.getAttribute("data-region") || "").toLowerCase() !== selectedRegion) {
            ok = false;
          }
          if (selectedType && (card.getAttribute("data-type") || "").toLowerCase() !== selectedType) {
            ok = false;
          }
          if (selectedYear && (card.getAttribute("data-year") || "") !== selectedYear) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [keyword, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filterCards);
          control.addEventListener("change", filterCards);
        }
      });

      filterCards();
    }
  });
})();
