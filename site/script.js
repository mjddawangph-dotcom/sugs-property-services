"use strict";

/*
 * Sug's Property Services
 * No dependencies, analytics, cookies, ZIP persistence, or network submissions.
 *
 * DEEPSEEK_EDIT markers identify intended customization points.
 */
(() => {
  // DEEPSEEK_EDIT: Service ZIP Allowlist
  // Preliminary example coverage, NOT a geospatial radius calculation.
  // Strings preserve ZIP formatting. Excludes PO-box-only/unique ZIPs.
  // Owner must approve actual travel coverage before launch.
  const SERVICE_ZIPS = Object.freeze([
    // Victorville
    "92392", "92394", "92395",

    // Hesperia
    "92344", "92345",

    // Apple Valley
    "92307", "92308",

    // Rancho Cucamonga
    "91701", "91730", "91737", "91739",

    // Riverside: selected residential ZIPs
    "92501", "92503", "92504", "92505", "92506", "92507", "92508",

    // San Bernardino: selected residential ZIPs
    "92401", "92404", "92405", "92407", "92408", "92410", "92411"
  ]);

  const serviceZipSet = new Set(SERVICE_ZIPS);
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  /*
   * DEEPSEEK_EDIT: ZIP Validation Logic
   * Results:
   *   malformed = not exactly five ASCII digits
   *   inside    = well-formed ZIP in the approved allowlist
   *   outside   = well-formed ZIP absent from the allowlist
   *
   * "outside" does not establish distance or actual address eligibility.
   * Pure function: no storage, DOM writes, or network activity.
   */
  function checkServiceZip(rawZip) {
    const zip = String(rawZip ?? "").trim();

    if (!/^\d{5}$/.test(zip)) {
      return { status: "malformed", zip };
    }

    return {
      status: serviceZipSet.has(zip) ? "inside" : "outside",
      zip
    };
  }

  function updateCopyrightYear() {
    const yearElement = document.getElementById("copyright-year");

    if (yearElement) {
      yearElement.textContent = String(new Date().getFullYear());
    }
  }

  /*
   * DEEPSEEK_EDIT: Scroll Animation Controller
   * Observe each [data-reveal] element once.
   * Remove reveal-pending on intersection, then unobserve.
   * Fail open: unsupported observer or initialization error leaves content visible.
   * Keyboard navigation also reveals a focused element's containing block.
   */
  function initializeScrollReveals() {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));

    if (
      !elements.length ||
      motionPreference.matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    let observer;

    const reveal = (element) => {
      element.classList.remove("reveal-pending");
      observer?.unobserve(element);
    };

    const revealAll = () => {
      observer?.disconnect();
      elements.forEach((element) => {
        element.classList.remove("reveal-pending");
      });
    };

    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              reveal(entry.target);
            }
          });
        },
        {
          root: null,
          threshold: 0.08,
          rootMargin: "0px 0px -24px 0px"
        }
      );

      elements.forEach((element) => {
        observer.observe(element);
        element.classList.add("reveal-pending");
      });

      document.addEventListener("focusin", (event) => {
        if (!(event.target instanceof Element)) {
          return;
        }

        const container = event.target.closest("[data-reveal]");

        if (container) {
          reveal(container);
        }
      });

      // Respond if the user enables reduced motion during the visit.
      const handleMotionChange = (event) => {
        if (event.matches) {
          revealAll();
        }
      };

      if (typeof motionPreference.addEventListener === "function") {
        motionPreference.addEventListener("change", handleMotionChange);
      } else if (typeof motionPreference.addListener === "function") {
        motionPreference.addListener(handleMotionChange);
      }
    } catch (error) {
      revealAll();
      console.warn("Scroll reveals disabled; content remains visible.", error);
    }
  }

  /*
   * DEEPSEEK_EDIT: Service-Area Modal Controller
   *
   * Native showModal() supplies modal semantics, background inertness,
   * and focus containment. Escape is routed through the smooth-close path.
   *
   * The outside-area popup uses a second view inside the same dialog,
   * avoiding stacked dialogs and disruptive window.alert() calls.
   */
  function initializeAreaDialog() {
    const dialog = document.getElementById("area-dialog");
    const form = document.getElementById("zip-form");
    const zipInput = document.getElementById("zip-code");
    const errorElement = document.getElementById("zip-error");
    const checkView = document.getElementById("zip-check-view");
    const outsideView = document.getElementById("zip-outside-view");
    const outsideDismiss = document.getElementById("outside-dismiss");
    const statusBanner = document.getElementById("area-status");
    const primaryCta = document.getElementById("primary-cta");
    const reopenButtons = document.querySelectorAll("[data-open-area]");
    const closeButtons = document.querySelectorAll("[data-close-area]");

    if (
      !dialog ||
      !form ||
      !zipInput ||
      !errorElement ||
      !checkView ||
      !outsideView ||
      !outsideDismiss ||
      !statusBanner ||
      typeof dialog.showModal !== "function"
    ) {
      // Unsupported browsers can browse and call without a blocking overlay.
      return;
    }

    let closing = false;
    let closeTimer = null;
    let closeCompletion = null;
    let returnFocusTarget = primaryCta;

    // Read the CSS close duration so animation timing has one source of truth.
    function getCloseDelay() {
      if (motionPreference.matches) {
        return 0;
      }

      const raw = getComputedStyle(dialog)
        .getPropertyValue("--motion-short")
        .trim();
      const amount = Number.parseFloat(raw);

      if (!Number.isFinite(amount)) {
        return 180;
      }

      return raw.endsWith("ms") ? amount : amount * 1000;
    }

    function clearError() {
      errorElement.textContent = "";
      zipInput.removeAttribute("aria-invalid");
    }

    function resetCheckView() {
      checkView.hidden = false;
      outsideView.hidden = true;
      dialog.setAttribute("aria-labelledby", "area-dialog-title");
      dialog.setAttribute("aria-describedby", "area-dialog-description");
      clearError();
    }

    function openDialog(trigger = primaryCta) {
      if (dialog.open || closing) {
        return;
      }

      resetCheckView();
      form.reset();
      returnFocusTarget = trigger;
      dialog.classList.remove("is-closing");

      try {
        dialog.showModal();
        document.body.classList.add("modal-open");
        zipInput.focus({ preventScroll: true });
      } catch (error) {
        document.body.classList.remove("modal-open");
        console.warn("ZIP dialog unavailable; browsing remains enabled.", error);
      }
    }

    function closeDialog(afterClose = null) {
      if (!dialog.open || closing) {
        return;
      }

      closing = true;
      closeCompletion = afterClose;
      dialog.classList.add("is-closing");

      const finish = () => {
        closeTimer = null;

        if (dialog.open) {
          dialog.close();
        }
      };

      const delay = getCloseDelay();

      if (delay === 0) {
        finish();
      } else {
        // Guaranteed completion even if transitionend does not fire.
        closeTimer = window.setTimeout(finish, delay + 30);
      }
    }

    dialog.addEventListener("close", () => {
      if (closeTimer !== null) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }

      document.body.classList.remove("modal-open");
      dialog.classList.remove("is-closing");
      closing = false;

      if (
        returnFocusTarget instanceof HTMLElement &&
        returnFocusTarget.isConnected
      ) {
        returnFocusTarget.focus({ preventScroll: true });
      }

      const completion = closeCompletion;
      closeCompletion = null;

      if (typeof completion === "function") {
        completion();
      }
    });

    dialog.addEventListener("cancel", (event) => {
      // Escape acts like Skip / Continue Browsing, with the same cleanup.
      event.preventDefault();
      closeDialog();
    });

    closeButtons.forEach((button) => {
      button.addEventListener("click", () => closeDialog());
    });

    reopenButtons.forEach((button) => {
      button.hidden = false;
      button.addEventListener("click", () => openDialog(button));
    });

    zipInput.addEventListener("input", clearError);

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (closing) {
        return;
      }

      const result = checkServiceZip(zipInput.value);

      if (result.status === "malformed") {
        zipInput.setAttribute("aria-invalid", "true");
        errorElement.textContent = "Please enter a valid five-digit ZIP code.";
        zipInput.focus({ preventScroll: true });
        return;
      }

      clearError();

      // Clear stale success information when a new valid-format ZIP is checked.
      statusBanner.textContent = "";

      if (result.status === "inside") {
        closeDialog(() => {
          // textContent prevents inserted markup from becoming executable.
          statusBanner.textContent =
            `We service your area! ZIP ${result.zip} is on our service list. ` +
            "Call Gustavo to confirm scheduling and your exact address.";
        });
        return;
      }

      checkView.hidden = true;
      outsideView.hidden = false;
      dialog.setAttribute("aria-labelledby", "outside-title");
      dialog.setAttribute("aria-describedby", "outside-description");
      dialog.scrollTop = 0;
      outsideDismiss.focus({ preventScroll: true });
    });

    // Show on each full page load, as requested. No persistence is used.
    openDialog(primaryCta);
  }

  // Separate initialization paths prevent a modal issue from hiding page content.
  updateCopyrightYear();
  initializeScrollReveals();
  initializeAreaDialog();
})();
