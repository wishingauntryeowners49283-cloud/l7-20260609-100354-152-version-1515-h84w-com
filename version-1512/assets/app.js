(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-toggle]');
        var mobilePanel = document.querySelector('[data-mobile-panel]');
        if (menuButton && mobilePanel) {
            menuButton.addEventListener('click', function () {
                mobilePanel.classList.toggle('open');
            });
        }

        document.querySelectorAll('[data-site-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var target = './search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === index);
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

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    restart();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    restart();
                });
            });
            show(0);
            restart();
        }

        var filterInput = document.querySelector('[data-filter-input]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var filterCount = document.querySelector('[data-filter-count]');

        function applyFilter(value) {
            var words = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
            var matched = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var visible = words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
                card.classList.toggle('hidden-card', !visible);
                if (visible) {
                    matched += 1;
                }
            });
            if (filterCount) {
                filterCount.textContent = value.trim() ? '匹配影片 ' + matched + ' 部' : '浏览全部片单';
            }
        }

        if (filterInput && cards.length) {
            var query = new URLSearchParams(window.location.search).get('q') || '';
            filterInput.value = query;
            applyFilter(query);
            filterInput.addEventListener('input', function () {
                applyFilter(filterInput.value);
            });
        }

        document.querySelectorAll('[data-chip]').forEach(function (chip) {
            chip.addEventListener('click', function () {
                if (!filterInput) {
                    return;
                }
                filterInput.value = chip.textContent.trim();
                applyFilter(filterInput.value);
                filterInput.focus();
            });
        });
    });
})();
