"use strict";

(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /*
   * EDIT: Allowed ZIP Codes
   *
   * SAMPLE screening list only.
   * Gustavo must approve actual coverage before launch.
   * Selected entries do NOT represent complete county coverage.
   */
  const ALLOWED_ZIPS = new Set([
    // Victorville
    "92392",
    "92394",
    "92395",

    // Hesperia
    "92344",
    "92345",

    // Apple Valley
    "92307",
    "92308",

    // Rancho Cucamonga — confirm travel/service availability
    "91701",
    "91730",
    "91737",
    "91739",

    // Additional sample San Bernardino County locations
    "92404",
    "92407",
    "92376",

    // Sample Riverside County locations
    "92501",
    "92503",
    "92504",
    "92505",
    "92509",
    "92551",
    "92553",
    "92880"
  ]);

  /* EDIT: Upload Limits — synchronize HTML help text if changing */
  const UPLOAD_LIMITS = {
    maxFiles: 5,
    maxBytesPerFile: 5 * 1024 * 1024,
    allowedTypes: new Set([
      "image/jpeg",
      "image/png",
      "image/webp"
    ])
  };

  function setStatus(element, message, state = "") {
    element.textContent = message;

    if (state) {
      element.dataset.state = state;
    } else {
      delete element.dataset.state;
    }
  }

  function initializeYear() {
    const year = document.querySelector("#year");

    if (year) {
      year.textContent = String(new Date().getFullYear());
    }
  }

  function initializeReveals() {
    const elements = [...document.querySelectorAll("[data-reveal]")];

    if (
      reducedMotion.matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.08
    });

    elements.forEach((element) => {
      // Keep immediately visible content visible, including the hero.
      if (element.getBoundingClientRect().top < window.innerHeight) {
        return;
      }

      element.classList.add("reveal-ready");
      observer.observe(element);
    });
  }

  function initializeAreaModal() {
    const modal = document.querySelector("#area-modal");
    const form = document.querySelector("#area-form");
    const input = document.querySelector("#area-address");
    const result = document.querySelector("#area-result");
    const skipButton = document.querySelector("#skip-area");
    const closeButton = document.querySelector("#close-area");
    const openButton = document.querySelector("#open-area");
    const storageKey = "sugs-area-dismissed";

    if (!modal || !form || !input || !result) {
      return;
    }

    // Keep the rest of the site usable in browsers without native dialog.
    if (typeof modal.showModal !== "function") {
      openButton.hidden = true;
      return;
    }

    let previousFocus = null;

    function readDismissalFlag() {
      try {
        return sessionStorage.getItem(storageKey) === "1";
      } catch {
        return false;
      }
    }

    function saveDismissalFlag() {
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch {
        // Private/restricted storage must not break browsing.
      }
    }

    function openModal() {
      if (modal.open) {
        return;
      }

      previousFocus = document.activeElement;
      form.reset();
      input.removeAttribute("aria-invalid");
      setStatus(result, "");
      skipButton.textContent = "Skip";

      modal.showModal();
      document.body.classList.add("modal-open");

      // Avoid immediately raising a mobile keyboard on first arrival.
      skipButton.focus();
    }

    function closeModal() {
      if (modal.open) {
        modal.close();
      }
    }

    /*
     * Require a trailing ZIP to avoid confusing a five-digit street number
     * with the destination ZIP. Supports ZIP+4 and an optional US suffix.
     * This is ZIP screening, not geocoding or address validation.
     */
    function extractZip(address) {
      const match = address.trim().match(
        /(?:^|[\s,])(\d{5})(?:-\d{4})?(?:\s*,?\s*(?:USA|US|United States))?\s*$/i
      );

      return match ? match[1] : null;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const zip = extractZip(input.value);

      if (!zip) {
        input.setAttribute("aria-invalid", "true");
        setStatus(
          result,
          "Please include a five-digit ZIP code at the end of your address, or enter just your ZIP.",
          "error"
        );
        input.focus();
        return;
      }

      input.removeAttribute("aria-invalid");

      if (ALLOWED_ZIPS.has(zip)) {
        setStatus(
          result,
          "Great news! We service your area.",
          "success"
        );
      } else {
        setStatus(
          result,
          "We currently don't service your area, but feel free to browse.",
          "error"
        );
      }

      skipButton.textContent = "Continue to site";
    });

    input.addEventListener("input", () => {
      input.removeAttribute("aria-invalid");
      setStatus(result, "");
      skipButton.textContent = "Skip";
    });

    skipButton.addEventListener("click", closeModal);
    closeButton.addEventListener("click", closeModal);
    openButton.addEventListener("click", openModal);

    // Let Escape trigger the browser's native dialog cancellation.
    modal.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
      saveDismissalFlag();

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus !== document.body &&
        previousFocus.isConnected
      ) {
        previousFocus.focus({ preventScroll: true });
      }
    });

    if (!readDismissalFlag()) {
      openModal();
    }
  }

  function initializeCarousel() {
    const carousel = document.querySelector("[data-carousel]");

    if (!carousel) {
      return;
    }

    const track = carousel.querySelector(".carousel-track");
    const slides = [...track.querySelectorAll(".slide")];
    const controls = carousel.querySelector(".carousel-controls");
    const previousButton = carousel.querySelector("[data-prev]");
    const nextButton = carousel.querySelector("[data-next]");
    const dotsContainer = carousel.querySelector(".carousel-dots");
    const status = carousel.querySelector("[data-slide-status]");

    if (slides.length === 0) {
      carousel.hidden = true;
      return;
    }

    let currentIndex = 0;
    let scrollFrame = null;

    slides.forEach((slide, index) => {
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", `${index + 1} of ${slides.length}`);
    });

    // Dots are generated from HTML slides; no separate image array needed.
    const dots = slides.map((slide, index) => {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      dot.setAttribute("aria-controls", "carousel-track");

      dot.addEventListener("click", () => {
        goToSlide(index);
      });

      dotsContainer.append(dot);
      return dot;
    });

    function updateControls(index, announce = true) {
      const changed = currentIndex !== index;
      currentIndex = index;

      dots.forEach((dot, dotIndex) => {
        if (dotIndex === index) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });

      previousButton.disabled = index === 0;
      nextButton.disabled = index === slides.length - 1;

      if (announce && changed) {
        status.textContent = `Slide ${index + 1} of ${slides.length}`;
      }
    }

    function nearestSlideIndex() {
      const trackLeft = track.getBoundingClientRect().left;
      let closestIndex = 0;
      let closestDistance = Infinity;

      slides.forEach((slide, index) => {
        const distance = Math.abs(
          slide.getBoundingClientRect().left - trackLeft
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      return closestIndex;
    }

    function goToSlide(index) {
      const targetIndex = Math.max(0, Math.min(index, slides.length - 1));
      const slide = slides[targetIndex];
      const left =
        slide.getBoundingClientRect().left -
        track.getBoundingClientRect().left +
        track.scrollLeft;

      track.scrollTo({
        left,
        behavior: reducedMotion.matches ? "auto" : "smooth"
      });

      updateControls(targetIndex);
    }

    function handleTrackScroll() {
      if (scrollFrame !== null) {
        return;
      }

      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = null;
        updateControls(nearestSlideIndex(), false);
      });
    }

    previousButton.addEventListener("click", () => {
      goToSlide(currentIndex - 1);
    });

    nextButton.addEventListener("click", () => {
      goToSlide(currentIndex + 1);
    });

    track.addEventListener("scroll", handleTrackScroll, { passive: true });

    track.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToSlide(currentIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goToSlide(currentIndex + 1);
      }
    });

    // Controls are unnecessary when there is only one slide.
    controls.hidden = slides.length < 2;
    updateControls(0, false);
  }

  function initializeQuoteForm() {
    const form = document.querySelector("#quote-form");
    const status = document.querySelector("#form-status");
    const photos = document.querySelector("#photos");
    const photoStatus = document.querySelector("#photo-status");

    if (!form || !status || !photos || !photoStatus) {
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');

    function validatePhotos() {
      const files = [...photos.files];

      if (files.length > UPLOAD_LIMITS.maxFiles) {
        setStatus(
          photoStatus,
          `Please choose no more than ${UPLOAD_LIMITS.maxFiles} photos.`,
          "error"
        );
        return false;
      }

      const unsupported = files.find(
        (file) => !UPLOAD_LIMITS.allowedTypes.has(file.type)
      );

      if (unsupported) {
        setStatus(
          photoStatus,
          "Please use JPEG, PNG, or WebP images.",
          "error"
        );
        return false;
      }

      const oversized = files.find(
        (file) => file.size > UPLOAD_LIMITS.maxBytesPerFile
      );

      if (oversized) {
        const maxMegabytes = UPLOAD_LIMITS.maxBytesPerFile / (1024 * 1024);

        setStatus(
          photoStatus,
          `Each photo must be ${maxMegabytes} MB or smaller.`,
          "error"
        );
        return false;
      }

      setStatus(photoStatus, "");
      return true;
    }

    photos.addEventListener("change", validatePhotos);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!validatePhotos()) {
        photos.focus();
        return;
      }

      // Never POST to the example endpoint; keep the entered data intact.
      if (form.action.includes("YOUR_FORM_ID")) {
        setStatus(
          status,
          "The quote form isn't connected yet. Please call us at 909-582-6445 while setup is completed.",
          "error"
        );
        status.focus();
        return;
      }

      const formData = new FormData(form);

      if (submitButton) {
        submitButton.disabled = true;
      }

      setStatus(status, "Sending your request...");

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" }
        });

        if (!response.ok) {
          throw new Error(`Form submission failed: ${response.status}`);
        }

        form.reset();
        setStatus(photoStatus, "");
        setStatus(
          status,
          "Thanks! Your request was sent. We'll follow up with you.",
          "success"
        );
      } catch (error) {
        console.error(error);
        setStatus(
          status,
          "Sorry, your request couldn't be sent. Please call or email us directly.",
          "error"
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }

        status.focus();
      }
    });
  }

  initializeYear();
  initializeReveals();
  initializeAreaModal();
  initializeCarousel();
  initializeQuoteForm();
})();
