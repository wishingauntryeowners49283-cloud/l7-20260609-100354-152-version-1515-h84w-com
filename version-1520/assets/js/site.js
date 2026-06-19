(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  setupHero();
  setupFilters();
})();

function setupHero() {
  var hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function show(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function play() {
    stop();
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(Number(dot.getAttribute('data-hero-dot')) || 0);
      play();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', play);
  show(0);
  play();
}

function setupFilters() {
  var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
  if (!lists.length) {
    return;
  }

  lists.forEach(function (list) {
    var scope = list.closest('section') || document;
    var input = scope.querySelector('[data-filter-input]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var categorySelect = scope.querySelector('[data-filter-category]');
    var countOutput = scope.querySelector('[data-count-output]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    populateSelect(yearSelect, uniqueValues(cards, 'year').sort(function (a, b) {
      return Number(b) - Number(a);
    }));
    populateSelect(typeSelect, uniqueValues(cards, 'type').sort());

    function apply() {
      var query = normalize(input ? input.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchType = !type || card.getAttribute('data-type') === type;
        var matchCategory = !category || haystack.indexOf(normalize(category)) !== -1;
        var matched = matchQuery && matchYear && matchType && matchCategory;

        card.classList.toggle('hidden-card', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (countOutput) {
        countOutput.textContent = String(visible);
      }
    }

    [input, yearSelect, typeSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
}

function uniqueValues(cards, key) {
  var values = [];
  var seen = Object.create(null);

  cards.forEach(function (card) {
    var value = card.getAttribute('data-' + key) || '';
    if (value && !seen[value]) {
      seen[value] = true;
      values.push(value);
    }
  });

  return values;
}

function populateSelect(select, values) {
  if (!select || select.getAttribute('data-ready') === '1') {
    return;
  }

  values.forEach(function (value) {
    var option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
  select.setAttribute('data-ready', '1');
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function applySearchQueryFromUrl() {
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  var input = document.querySelector('[data-filter-input]');

  if (query && input) {
    input.value = query;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function initMoviePlayer(videoId, overlayId, playId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var play = document.getElementById(playId);
  var hlsInstance = null;
  var loaded = false;

  if (!video || !overlay || !source) {
    return;
  }

  function loadSource() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startPlayback() {
    loadSource();
    overlay.classList.add('hidden');
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('hidden');
      });
    }
  }

  overlay.addEventListener('click', startPlayback);
  if (play) {
    play.addEventListener('click', startPlayback);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.currentTime) {
      overlay.classList.remove('hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
