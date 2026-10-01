(() => {
  "use strict";

  /* Footer year */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Mobile navigation toggle */
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");
  const menuIcon = '<svg width="24" height="24"><use href="#icon-menu"/></svg>';
  const closeIcon = '<svg width="24" height="24"><use href="#icon-close"/></svg>';

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.innerHTML = isOpen ? closeIcon : menuIcon;
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.innerHTML = menuIcon;
      });
    });
  }

  /* Notdienst button: on mobile, briefly pulse + reveal the "Notdienst"
     label whenever scrolling comes to a stop — but only every now and
     then (cooldown), so it draws the eye without becoming annoying. */
  const phoneBtn = document.querySelector(".header-phone");
  if (phoneBtn) {
    const isMobile = () => window.matchMedia("(max-width: 860px)").matches;
    let scrollStopTimer;
    let lastPulse = 0;
    const COOLDOWN_MS = 12000;
    const SHOW_MS = 2400;

    const firePulse = () => {
      lastPulse = Date.now();
      phoneBtn.classList.add("pulse");
      window.setTimeout(() => phoneBtn.classList.remove("pulse"), SHOW_MS);
    };

    // Show it once shortly after load, even without any scrolling,
    // so the effect is guaranteed to be visible at least once.
    window.setTimeout(() => {
      if (isMobile()) firePulse();
    }, 1800);

    window.addEventListener(
      "scroll",
      () => {
        if (!isMobile()) return;
        window.clearTimeout(scrollStopTimer);
        scrollStopTimer = window.setTimeout(() => {
          if (Date.now() - lastPulse < COOLDOWN_MS) return;
          firePulse();
        }, 500);
      },
      { passive: true }
    );
  }

  /* Scroll-reveal animations */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Hero van: drives in/out as the hero scrolls in/out of view.
     The wheels' rotation is a CSS transition on the same duration/easing
     as the body's translateX — not a separate spin animation — so they
     decelerate and stop in perfect lockstep with the vehicle, with zero
     popping at the end. Once fully parked, a brief idle wobble kicks in. */
  const heroVisual = document.querySelector(".hero-visual");
  const van = document.querySelector(".van");
  if (heroVisual && van && "IntersectionObserver" in window) {
    const vanObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          van.classList.remove("settled");
          heroVisual.classList.toggle("van-parked", entry.isIntersecting);
        });
      },
      { threshold: 0.15 }
    );
    vanObserver.observe(heroVisual);

    van.addEventListener("transitionend", (e) => {
      if (e.propertyName === "transform" && heroVisual.classList.contains("van-parked")) {
        van.classList.add("settled");
      }
    });
  }

  /* Smooth scroll with sticky-header offset */
  const header = document.getElementById("site-header");
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  /* Contact form — frontend-only submit feedback */
  const form = document.getElementById("contact-form");
  const formNote = document.getElementById("form-note");

  if (form && formNote) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const nameField = form.querySelector("#name");
      const firstName = (nameField && nameField.value.trim().split(" ")[0]) || "";
      formNote.textContent = firstName
        ? `Danke, ${firstName}! Wir melden uns schnellstmöglich bei Ihnen.`
        : "Danke für Ihre Nachricht! Wir melden uns schnellstmöglich bei Ihnen.";
      form.reset();
    });
  }
})();
