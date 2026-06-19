document.addEventListener("DOMContentLoaded", function() {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function() {
      mobilePanel.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  const prev = document.querySelector("[data-hero-prev]");
  const next = document.querySelector("[data-hero-next]");
  let currentSlide = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  }

  function startTimer() {
    if (!slides.length) {
      return;
    }
    timer = window.setInterval(function() {
      showSlide(currentSlide + 1);
    }, 5000);
  }

  function restartTimer() {
    if (timer) {
      window.clearInterval(timer);
    }
    startTimer();
  }

  if (prev) {
    prev.addEventListener("click", function() {
      showSlide(currentSlide - 1);
      restartTimer();
    });
  }

  if (next) {
    next.addEventListener("click", function() {
      showSlide(currentSlide + 1);
      restartTimer();
    });
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener("click", function() {
      showSlide(index);
      restartTimer();
    });
  });

  startTimer();

  document.querySelectorAll("[data-filter-scope]").forEach(function(scope) {
    const input = scope.querySelector("[data-search-input]");
    const select = scope.querySelector("[data-year-filter]");
    const count = scope.querySelector("[data-filter-count]");
    const section = scope.closest("section");
    const cards = Array.from(section ? section.querySelectorAll("[data-movie-card]") : []);
    const empty = section ? section.querySelector("[data-empty-state]") : null;

    function updateCards() {
      const keyword = input ? input.value.trim().toLowerCase() : "";
      const year = select ? select.value : "";
      let shown = 0;

      cards.forEach(function(card) {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.category,
          card.dataset.tags
        ].join(" ").toLowerCase();
        const matchesText = !keyword || haystack.indexOf(keyword) !== -1;
        const matchesYear = !year || card.dataset.year === year;
        const visible = matchesText && matchesYear;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + shown + " 部";
      }
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", updateCards);
    }
    if (select) {
      select.addEventListener("change", updateCards);
    }
    updateCards();
  });
});
