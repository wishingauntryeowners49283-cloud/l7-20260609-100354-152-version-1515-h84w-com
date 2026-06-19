(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var open = mobilePanel.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeHero = 0;

  function setHero(index) {
    if (!heroSlides.length) {
      return;
    }

    activeHero = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === activeHero);
    });

    heroDots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === activeHero);
    });
  }

  heroDots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      setHero(index);
    });
  });

  if (heroSlides.length) {
    setHero(0);
    window.setInterval(function () {
      setHero(activeHero + 1);
    }, 5600);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".movie-search"));
  var yearFilters = Array.prototype.slice.call(document.querySelectorAll(".year-filter"));
  var clearButtons = Array.prototype.slice.call(document.querySelectorAll(".search-clear"));
  var emptyState = document.querySelector(".empty-state");

  function filterMovies() {
    var input = searchInputs[0];
    var yearSelect = yearFilters[0];
    var query = input ? input.value.trim().toLowerCase() : "";
    var year = yearSelect ? yearSelect.value : "all";
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-category"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
      var cardYear = card.getAttribute("data-year") || "";
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchYear = year === "all" || cardYear === year;
      var show = matchQuery && matchYear;

      card.classList.toggle("hidden", !show);

      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("show", cards.length > 0 && visible === 0);
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", filterMovies);
  });

  yearFilters.forEach(function (select) {
    select.addEventListener("change", filterMovies);
  });

  clearButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      searchInputs.forEach(function (input) {
        input.value = "";
      });
      yearFilters.forEach(function (select) {
        select.value = "all";
      });
      filterMovies();
    });
  });

  var heroSearch = document.querySelector(".hero-search input");
  var heroSearchButton = document.querySelector(".hero-search button");

  if (heroSearch && heroSearchButton) {
    heroSearchButton.addEventListener("click", function () {
      var mainSearch = document.querySelector(".movie-search");

      if (mainSearch) {
        mainSearch.value = heroSearch.value;
        mainSearch.dispatchEvent(new Event("input"));
        mainSearch.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  window.initMoviePlayer = function (settings) {
    var video = document.getElementById(settings.videoId);
    var overlay = document.getElementById(settings.overlayId);
    var button = document.getElementById(settings.buttonId);
    var source = settings.source;
    var started = false;
    var hlsInstance = null;

    if (!video || !overlay || !button || !source) {
      return;
    }

    function playVideo() {
      var result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    function attachSource() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        return;
      }

      video.src = source;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      playVideo();
    }

    function start() {
      if (!started) {
        started = true;
        video.setAttribute("controls", "controls");
        overlay.classList.add("is-hidden");
        attachSource();
      } else {
        playVideo();
      }
    }

    overlay.addEventListener("click", start);
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      start();
    });
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
