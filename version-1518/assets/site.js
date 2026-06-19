(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-current", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-current", dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            start();
        }

        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var search = root.querySelector("[data-filter-search]");
            var region = root.querySelector("[data-filter-region]");
            var type = root.querySelector("[data-filter-type]");
            var year = root.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(root.querySelectorAll(".filter-card"));

            function applyFilters() {
                var query = search ? search.value.trim().toLowerCase() : "";
                var selectedRegion = region ? region.value : "";
                var selectedType = type ? type.value : "";
                var selectedYear = year ? year.value : "";

                cards.forEach(function (card) {
                    var searchable = (card.dataset.search || "").toLowerCase();
                    var matched = true;
                    if (query && searchable.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (selectedRegion && card.dataset.region !== selectedRegion) {
                        matched = false;
                    }
                    if (selectedType && card.dataset.type !== selectedType) {
                        matched = false;
                    }
                    if (selectedYear && card.dataset.year !== selectedYear) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden", !matched);
                });
            }

            [search, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && search) {
                search.value = q;
                applyFilters();
            }
        });
    });
})();

function startStaticPlayer(videoId, maskId, streamUrl) {
    var video = document.getElementById(videoId);
    var mask = document.getElementById(maskId);
    if (!video || !mask || !streamUrl) {
        return;
    }

    var loaded = false;
    var player = null;

    function load() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            player = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            player.loadSource(streamUrl);
            player.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
        video.controls = true;
    }

    function play() {
        load();
        mask.classList.add("is-hidden");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    mask.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener("play", function () {
        mask.classList.add("is-hidden");
    });

    window.addEventListener("pagehide", function () {
        if (player && typeof player.destroy === "function") {
            player.destroy();
        }
    });
}
