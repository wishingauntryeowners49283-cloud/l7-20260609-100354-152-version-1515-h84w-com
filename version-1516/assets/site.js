(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  function showHero(nextIndex) {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showHero(index + 1);
    }, 5200);
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }

    startHero();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showHero(index - 1);
      restartHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showHero(index + 1);
      restartHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      restartHero();
    });
  });

  startHero();

  function bindSearch(input) {
    var targetSelector = input.getAttribute('data-target');
    var target = targetSelector ? document.querySelector(targetSelector) : document;
    var empty = document.querySelector('[data-empty-state]');

    if (!target) {
      return;
    }

    var cards = Array.prototype.slice.call(target.querySelectorAll('[data-movie-card]'));

    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !value || text.indexOf(value) !== -1;
        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-movie-search]')).forEach(bindSearch);
})();
