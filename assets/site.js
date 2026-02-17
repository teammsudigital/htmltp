// Local behaviors that do not depend on WordPress runtime.
(function () {
  var THEME_KEY = "site_theme";
  var themes = ["theme-orange", "theme-teal", "theme-blue", "theme-red"];

  function applyTheme(themeName) {
    themes.forEach(function (theme) {
      document.body.classList.remove(theme);
    });
    document.body.classList.add(themeName);
    localStorage.setItem(THEME_KEY, themeName);
    updateActiveSwatch(themeName);
  }

  function updateActiveSwatch(activeTheme) {
    var swatches = document.querySelectorAll(".theme-swatch");
    swatches.forEach(function (btn) {
      var isActive = btn.getAttribute("data-theme") === activeTheme;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function initTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    var themeToUse = themes.indexOf(saved) >= 0 ? saved : "theme-red";
    applyTheme(themeToUse);
  }

  function mountThemeSwitcher() {
    var box = document.createElement("div");
    box.className = "theme-switcher";
    box.innerHTML =
      '<button class="theme-switcher-toggle" type="button" aria-label="Open theme palette" aria-expanded="false">🎨</button>' +
      '<div class="theme-switcher-panel" role="dialog" aria-label="Theme palette">' +
      '<p class="theme-switcher-title">Theme</p>' +
      '<div class="theme-switcher-grid">' +
      '<button class="theme-swatch theme-swatch-orange" type="button" data-theme="theme-orange" aria-label="Orange theme" aria-pressed="false"></button>' +
      '<button class="theme-swatch theme-swatch-teal" type="button" data-theme="theme-teal" aria-label="Teal theme" aria-pressed="false"></button>' +
      '<button class="theme-swatch theme-swatch-blue" type="button" data-theme="theme-blue" aria-label="Blue theme" aria-pressed="false"></button>' +
      '<button class="theme-swatch theme-swatch-red" type="button" data-theme="theme-red" aria-label="Red theme" aria-pressed="false"></button>' +
      "</div>" +
      "</div>";

    var toggleBtn = box.querySelector(".theme-switcher-toggle");

    toggleBtn.addEventListener("click", function () {
      var isOpen = box.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    box.addEventListener("click", function (e) {
      var btn = e.target.closest(".theme-swatch");
      if (!btn) return;
      var theme = btn.getAttribute("data-theme");
      applyTheme(theme);
      box.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("click", function (e) {
      if (!box.contains(e.target)) {
        box.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        box.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });

    document.body.appendChild(box);
    updateActiveSwatch(
      document.body.classList.contains("theme-teal")
        ? "theme-teal"
        : document.body.classList.contains("theme-blue")
        ? "theme-blue"
        : document.body.classList.contains("theme-red")
        ? "theme-red"
        : "theme-orange"
    );
  }

  initTheme();
  mountThemeSwitcher();

  function fixTestimonials() {
    var root = document.querySelector(".elementor-element-fb177a2");
    if (!root) return;
    var viewport = root.querySelector(".e-n-carousel");
    var wrapper = root.querySelector(".swiper-wrapper");
    if (!viewport || !wrapper) return;

    // Static export has animation classes without Elementor runtime.
    root.querySelectorAll(".elementor-invisible").forEach(function (el) {
      el.classList.remove("elementor-invisible");
    });

    var testimonials = [];
    var seenAuthors = {};
    root.querySelectorAll(".swiper-slide").forEach(function (slide) {
      var quote = slide.querySelector(".elementor-widget-heading .elementor-heading-title");
      var author = slide.querySelector(".elementor-icon-box-title span");
      var role = slide.querySelector(".elementor-icon-box-description");
      var image = slide.querySelector(".elementor-icon-box-image img");
      var quoteText = quote ? quote.textContent.trim().replace(/\s+/g, " ") : "";
      var authorText = author ? author.textContent.trim().replace(/\s+/g, " ") : "";
      var roleText = role ? role.textContent.trim().replace(/\s+/g, " ") : "Patient";
      var imageSrc = image ? image.getAttribute("src") || "" : "";

      if (quoteText.length < 30 || authorText.length < 2) return;
      if (seenAuthors[authorText.toLowerCase()]) return;
      seenAuthors[authorText.toLowerCase()] = true;

      testimonials.push({
        quote: quoteText,
        author: authorText,
        role: roleText || "Patient",
        image: imageSrc
      });
    });

    if (!testimonials.length) return;
    while (testimonials.length < 3) {
      testimonials.push({
        quote: testimonials[testimonials.length - 1].quote,
        author: testimonials[testimonials.length - 1].author,
        role: testimonials[testimonials.length - 1].role,
        image: testimonials[testimonials.length - 1].image
      });
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    wrapper.innerHTML = testimonials
      .map(function (item, index) {
        var imageHtml = item.image
          ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.author) + '" loading="lazy" decoding="async">'
          : "";
        return (
          '<div class="swiper-slide" role="group" aria-roledescription="slide" aria-label="' +
          (index + 1) +
          " / " +
          testimonials.length +
          '" data-swiper-slide-index="' +
          index +
          '">' +
          '<article class="static-testimonial-card">' +
          '<div class="static-testimonial-stars" aria-hidden="true">★★★★★</div>' +
          '<p class="static-testimonial-quote">' +
          escapeHtml(item.quote) +
          "</p>" +
          '<div class="static-testimonial-person">' +
          '<div class="static-testimonial-avatar">' +
          imageHtml +
          "</div>" +
          '<p class="static-testimonial-name">' +
          escapeHtml(item.author) +
          "</p>" +
          '<p class="static-testimonial-role">' +
          escapeHtml(item.role) +
          "</p>" +
          "</div>" +
          "</article>" +
          "</div>"
        );
      })
      .join("");

    var slides = Array.prototype.slice.call(wrapper.querySelectorAll(".swiper-slide"));
    var pagination = root.querySelector(".swiper-pagination");
    var currentIndex = 0;
    var startX = 0;
    var deltaX = 0;
    var dragging = false;

    function getPerView() {
      if (window.matchMedia("(max-width: 767px)").matches) return 1;
      if (window.matchMedia("(max-width: 1024px)").matches) return 2;
      return 3;
    }

    function getMaxIndex(perView) {
      return Math.max(0, slides.length - perView);
    }

    function buildBullets(totalPages, activeIndex) {
      if (!pagination) return;
      pagination.innerHTML = "";
      for (var i = 0; i < totalPages; i += 1) {
        var bullet = document.createElement("span");
        bullet.className = "swiper-pagination-bullet";
        if (i === activeIndex) {
          bullet.classList.add("swiper-pagination-bullet-active");
          bullet.setAttribute("aria-current", "true");
        }
        bullet.setAttribute("role", "button");
        bullet.setAttribute("tabindex", "0");
        bullet.setAttribute("data-bullet-index", i.toString());
        bullet.setAttribute("aria-label", "Go to slide " + (i + 1));
        pagination.appendChild(bullet);
      }
    }

    function render() {
      var perView = getPerView();
      var maxIndex = getMaxIndex(perView);
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }

      var slideWidth = 100 / perView;
      slides.forEach(function (slide) {
        slide.style.flex = "0 0 " + slideWidth + "%";
        slide.style.maxWidth = slideWidth + "%";
      });

      wrapper.style.transform = "translate3d(-" + currentIndex * slideWidth + "%, 0, 0)";
      buildBullets(maxIndex + 1, currentIndex);
    }

    if (pagination) {
      pagination.addEventListener("click", function (e) {
        var bullet = e.target.closest(".swiper-pagination-bullet");
        if (!bullet) return;
        currentIndex = parseInt(bullet.getAttribute("data-bullet-index") || "0", 10) || 0;
        render();
      });

      pagination.addEventListener("keydown", function (e) {
        var bullet = e.target.closest(".swiper-pagination-bullet");
        if (!bullet) return;
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        currentIndex = parseInt(bullet.getAttribute("data-bullet-index") || "0", 10) || 0;
        render();
      });
    }

    viewport.addEventListener(
      "touchstart",
      function (e) {
        startX = e.touches[0].clientX;
        deltaX = 0;
        dragging = true;
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchmove",
      function (e) {
        if (!dragging) return;
        deltaX = e.touches[0].clientX - startX;
      },
      { passive: true }
    );

    viewport.addEventListener("touchend", function () {
      if (!dragging) return;
      var threshold = 45;
      var perView = getPerView();
      var maxIndex = getMaxIndex(perView);
      if (Math.abs(deltaX) > threshold) {
        if (deltaX < 0 && currentIndex < maxIndex) {
          currentIndex += 1;
        } else if (deltaX > 0 && currentIndex > 0) {
          currentIndex -= 1;
        }
      }
      dragging = false;
      render();
    });

    if (viewport.classList.contains("swiper-initialized")) {
      viewport.classList.remove("swiper-initialized");
      viewport.classList.remove("swiper-horizontal");
      viewport.classList.remove("swiper-backface-hidden");
    }
    wrapper.removeAttribute("style");
    render();

    window.addEventListener("resize", render);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(render);
    }
  }

  fixTestimonials();

  var form = document.querySelector("form.static-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var existing = document.getElementById("form-static-note");
      if (existing) {
        existing.remove();
      }

      var note = document.createElement("p");
      note.id = "form-static-note";
      note.style.marginTop = "12px";
      note.style.color = "#7c2d12";
      note.textContent =
        "Form captured locally. For live leads, connect this form to Formspree/Getform/Netlify Forms.";
      form.appendChild(note);
      form.reset();
    });
  }

  var btn = document.getElementById("backToTop");
  if (btn) {
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
