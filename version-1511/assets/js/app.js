function qs(selector, root) {
    return (root || document).querySelector(selector);
}

function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

function normalizeText(value) {
    return (value || "").toString().toLowerCase().trim();
}

document.addEventListener("DOMContentLoaded", function () {
    var toggle = qs(".menu-toggle");
    var panel = qs(".mobile-panel");
    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    setupHero();
    setupCatalogFilter();
    setupQueryInput();
});

function setupHero() {
    var hero = qs(".hero");
    if (!hero) {
        return;
    }

    var slides = qsa(".hero-slide", hero);
    var dots = qsa(".hero-dots button", hero);
    var prev = qs(".hero-prev", hero);
    var next = qs(".hero-next", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === index);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            show(i);
            start();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            show(index - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            show(index + 1);
            start();
        });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
}

function setupQueryInput() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    var input = qs("[data-filter-input]");
    if (input && q) {
        input.value = q;
        input.dispatchEvent(new Event("input"));
    }
}

function setupCatalogFilter() {
    var input = qs("[data-filter-input]");
    var year = qs("[data-filter-year]");
    var region = qs("[data-filter-region]");
    var cards = qsa(".movie-card[data-title]");
    var empty = qs(".empty-state");

    if (!input && !year && !region) {
        return;
    }

    function apply() {
        var q = normalizeText(input ? input.value : "");
        var y = year ? year.value : "";
        var r = region ? region.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalizeText([
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.getAttribute("data-category")
            ].join(" "));
            var matchText = !q || haystack.indexOf(q) !== -1;
            var matchYear = !y || card.getAttribute("data-year") === y;
            var matchRegion = !r || card.getAttribute("data-region") === r;
            var show = matchText && matchYear && matchRegion;
            card.style.display = show ? "" : "none";
            if (show) {
                visible += 1;
            }
        });

        if (empty) {
            empty.style.display = visible ? "none" : "block";
        }
    }

    [input, year, region].forEach(function (node) {
        if (node) {
            node.addEventListener("input", apply);
            node.addEventListener("change", apply);
        }
    });

    apply();
}

function initMoviePlayer(url) {
    var video = qs(".movie-video");
    var cover = qs(".play-cover");
    var isReady = false;
    var hls = null;

    if (!video) {
        return;
    }

    function attach() {
        if (isReady) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }

        isReady = true;
    }

    function playVideo() {
        attach();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener("play", function () {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
