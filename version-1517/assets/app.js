(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
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
      restart();
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var cardGrid = document.querySelector("[data-card-grid]");
    if (filterInput && cardGrid) {
      var cards = Array.prototype.slice.call(cardGrid.querySelectorAll("[data-card]"));
      filterInput.addEventListener("input", function () {
        var keyword = filterInput.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          card.classList.toggle("is-filter-hidden", keyword && haystack.indexOf(keyword) === -1);
        });
      });
    }

    var sortButtons = document.querySelectorAll("[data-sort-button]");
    sortButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var grid = document.querySelector("[data-card-grid]");
        if (!grid) {
          return;
        }
        var mode = button.getAttribute("data-sort-button");
        var items = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        items.sort(function (a, b) {
          if (mode === "title") {
            return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
          }
          return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
        });
        items.forEach(function (item) {
          grid.appendChild(item);
        });
      });
    });

    var siteSearchInput = document.querySelector("[data-site-search]");
    var siteSearchButton = document.querySelector("[data-site-search-button]");
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");

    function cardTemplate(item) {
      return [
        '<article class="movie-card">',
        '  <a href="video/' + item.url + '">',
        '    <div class="poster-wrap">',
        '      <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '      <span class="poster-tag">' + escapeHtml(item.type) + '</span>',
        '      <span class="poster-year">' + item.year + '</span>',
        '    </div>',
        '    <div class="card-body">',
        '      <h3>' + escapeHtml(item.title) + '</h3>',
        '      <p>' + escapeHtml(item.oneLine) + '</p>',
        '      <div class="card-meta">',
        '        <span>' + escapeHtml(item.region) + '</span>',
        '        <span>' + escapeHtml(item.genre) + '</span>',
        '      </div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function runSiteSearch() {
      if (!siteSearchInput || !results || !window.MOVIE_DATA) {
        return;
      }
      var keyword = siteSearchInput.value.trim().toLowerCase();
      var data = window.MOVIE_DATA;
      var filtered = data.filter(function (item) {
        if (!keyword) {
          return true;
        }
        return [item.title, item.year, item.type, item.region, item.genre, item.tags, item.category]
          .join(" ")
          .toLowerCase()
          .indexOf(keyword) !== -1;
      }).slice(0, 120);
      if (title) {
        title.textContent = keyword ? "搜索结果" : "推荐片单";
      }
      results.innerHTML = filtered.map(cardTemplate).join("");
    }

    if (siteSearchInput && results) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (query) {
        siteSearchInput.value = query;
      }
      siteSearchInput.addEventListener("input", runSiteSearch);
      if (siteSearchButton) {
        siteSearchButton.addEventListener("click", runSiteSearch);
      }
      runSiteSearch();
    }
  });
})();
