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
    const resultDialog = document.querySelector("#area-result-modal");
    const resultTitle = document.querySelector("#area-result-title");
    const resultDescription = document.querySelector("#area-result-description");
    const resultContinue = document.querySelector("#area-result-continue");
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
    let resultPending = false;
    const hasResultDialog = Boolean(
      resultDialog &&
        resultTitle &&
        resultDescription &&
        resultContinue &&
        typeof resultDialog.showModal === "function"
    );

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

    function showResult(status, zip) {
      const inside = status === "inside";
      const title = inside
        ? "Great news — we service your area."
        : "That ZIP isn't on our current list.";
      const description = inside
        ? `ZIP ${zip} is on our sample service list. Call us to confirm scheduling and your exact address.`
        : `ZIP ${zip} isn't on our current sample list. You can still browse, or call us to check nearby coverage.`;

      setStatus(result, "");

      // Fail open: if the result dialog is unavailable, keep the inline result.
      if (!hasResultDialog) {
        setStatus(result, description, inside ? "success" : "error");
        return;
      }

      resultTitle.textContent = title;
      resultDescription.textContent = description;
      resultDialog.dataset.state = inside ? "success" : "error";
      resultPending = true;
      closeModal();

      window.setTimeout(() => {
        resultDialog.showModal();
        document.body.classList.add("modal-open");
        resultContinue.focus({ preventScroll: true });
      }, 0);
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
      showResult(ALLOWED_ZIPS.has(zip) ? "inside" : "outside", zip);
    });

    input.addEventListener("input", () => {
      input.removeAttribute("aria-invalid");
      setStatus(result, "");
    });

    skipButton.addEventListener("click", closeModal);
    closeButton.addEventListener("click", closeModal);
    openButton.addEventListener("click", openModal);

    // Let Escape trigger the browser's native dialog cancellation.
    modal.addEventListener("close", () => {
      saveDismissalFlag();

      // While the result dialog is opening, keep the page locked and let
      // that dialog manage focus.
      if (resultPending) {
        return;
      }

      document.body.classList.remove("modal-open");

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus !== document.body &&
        previousFocus.isConnected
      ) {
        previousFocus.focus({ preventScroll: true });
      }
    });

    if (hasResultDialog) {
      resultContinue.addEventListener("click", () => {
        resultDialog.close();
      });

      resultDialog.addEventListener("close", () => {
        resultPending = false;
        document.body.classList.remove("modal-open");

        if (openButton && openButton.isConnected) {
          openButton.focus({ preventScroll: true });
        }
      });
    }

    if (!readDismissalFlag()) {
      openModal();
    }
  }

  function initializeMobileMenu() {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector("#menu-toggle");
    const nav = document.querySelector("#site-nav");

    if (!header || !toggle || !nav) {
      return;
    }

    const mobileQuery = window.matchMedia("(max-width: 760px)");

    function setMenuOpen(open) {
      header.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    toggle.addEventListener("click", () => {
      const open = !header.classList.contains("menu-open");
      setMenuOpen(open);

      if (open) {
        const firstLink = nav.querySelector("a");

        if (firstLink) {
          firstLink.focus({ preventScroll: true });
        }
      } else {
        toggle.focus({ preventScroll: true });
      }
    });

    header.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) {
        setMenuOpen(false);

        if (mobileQuery.matches) {
          // Let the anchor navigation finish before restoring focus.
          window.setTimeout(() => {
            if (!header.classList.contains("menu-open")) {
              toggle.focus({ preventScroll: true });
            }
          }, 0);
        }
      }
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        header.classList.contains("menu-open")
      ) {
        setMenuOpen(false);
        toggle.focus({ preventScroll: true });
      }
    });

    document.addEventListener("click", (event) => {
      if (
        !header.classList.contains("menu-open") ||
        !(event.target instanceof Node) ||
        header.contains(event.target)
      ) {
        return;
      }

      setMenuOpen(false);
    });

    const handleMobileChange = (event) => {
      if (!event.matches) {
        setMenuOpen(false);
      }
    };

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", handleMobileChange);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(handleMobileChange);
    }

    setMenuOpen(false);
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

      // Keep the active dot visible when a future set of slides is too wide.
      const activeDot = dots[index];
      if (activeDot) {
        const dotLeft = activeDot.offsetLeft;
        const dotRight = dotLeft + activeDot.offsetWidth;
        const visibleLeft = dotsContainer.scrollLeft;
        const visibleRight = visibleLeft + dotsContainer.clientWidth;

        if (dotLeft < visibleLeft || dotRight > visibleRight) {
          dotsContainer.scrollTo({
            left: dotLeft - (dotsContainer.clientWidth - activeDot.offsetWidth) / 2,
            behavior: reducedMotion.matches ? "auto" : "smooth"
          });
        }
      }

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

  function initializeFormspree() {
    const form = document.querySelector("#quote-form");

    if (!form || typeof window.formspree !== "function") {
      return;
    }

    const match = form.action.match(/\/f\/([^/]+)/);
    const formId = match ? match[1] : "";

    if (!formId || formId === "YOUR_FORM_ID") {
      return;
    }

    window.formspree("initForm", {
      formElement: "#quote-form",
      formId,
      useDefaultStyles: false
    });
  }

  initializeYear();
  initializeReveals();
  initializeMobileMenu();
  initializeAreaModal();
  initializeCarousel();
  initializeFormspree();
})();
