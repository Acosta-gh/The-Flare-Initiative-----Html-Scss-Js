import { findElements } from "../utils/domUtils.js";

/**
 * Component to handle scroll-based animations.
 * - Uses IntersectionObserver when available (more efficient).
 * - Fallback with scroll + requestAnimationFrame if not supported.
 * - Respects prefers-reduced-motion.
 * - Configurable selectors and classes.
 * - Exposes destroy() to clean up listeners/observers.
 */
export default class AnimacionesScroll {
  constructor({
    selector = '.js-scroll',
    claseActiva = 'scrolled',
    root = null,
    rootMargin = '0px 0px -10% 0px',
    threshold = 0,
    observarUnaVez = true,
    autoInit = true
  } = {}) {
    this.selector = selector;
    this.claseActiva = claseActiva;
    this.root = root;
    this.rootMargin = rootMargin;
    this.threshold = threshold;
    this.observarUnaVez = observarUnaVez;

    this.elementos = [];
    this.observer = null;
    this._scrollHandler = null;
    this._rafId = null;

    if (autoInit) this.init();
  }

  init() {
    // Get elements via utility (supports dynamic loading if called again)
    this.elementos = findElements(this.selector);

    // Respect reduced motion preference
    const mediaReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaReduce && mediaReduce.matches) {
      // If user prefers reduced motion, mark all as visible without animation
      this.elementos.forEach((el) => el.classList.add(this.claseActiva));
      return;
    }

    if ('IntersectionObserver' in window) {
      this.setupObserver();
    } else {
      this.setupFallback();
    }

    // Run initial check for already visible elements (only for fallback)
    if (!('IntersectionObserver' in window)) {
      this.handleScroll(); // run once
    }
  }

  setupObserver() {
    // Create IntersectionObserver with bind to disconnect it later
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.add(this.claseActiva);
            if (this.observarUnaVez && this.observer) {
              this.observer.unobserve(el);
            }
          } else {
            // If we don't want it to remain visible, remove the class
            if (!this.observarUnaVez) {
              el.classList.remove(this.claseActiva);
            }
          }
        });
      },
      {
        root: this.root,
        rootMargin: this.rootMargin,
        threshold: this.threshold
      }
    );

    this.elementos.forEach((el) => {
      // Improve performance: indicate animation intent
      el.style.willChange = 'opacity, transform';
      this.observer.observe(el);
    });
  }

  setupFallback() {
    // Fallback using scroll + requestAnimationFrame (debounce)
    this._scrollHandler = this.handleScroll.bind(this);
    window.addEventListener('scroll', this._scrollHandler, { passive: true });
    window.addEventListener('resize', this._scrollHandler, { passive: true });
  }

  elementInView(el, offset = 1.25) {
    const elementTop = el.getBoundingClientRect().top;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return elementTop <= viewportHeight / offset;
  }

  elementOutOfView(el) {
    const elementTop = el.getBoundingClientRect().top;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return elementTop > viewportHeight;
  }

  displayScrollElement(el) {
    el.classList.add(this.claseActiva);
  }

  hideScrollElement(el) {
    el.classList.remove(this.claseActiva);
  }

  handleScroll() {
    // Debounce with requestAnimationFrame
    if (this._rafId) return;
    this._rafId = requestAnimationFrame(() => {
      this.elementos.forEach((el) => {
        if (this.elementInView(el, 1.25)) {
          this.displayScrollElement(el);
        } else if (this.elementOutOfView(el)) {
          this.hideScrollElement(el);
        }
      });
      this._rafId = null;
    });
  }

  refresh() {
    // Re-read elements from DOM (useful in SPAs or when dynamic content is injected)
    this.destroy(); // clean up first
    this.elementos = findElements(this.selector);
    this.init();
  }

  destroy() {
    // Clean up observer or listeners
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this._scrollHandler) {
      window.removeEventListener('scroll', this._scrollHandler, { passive: true });
      window.removeEventListener('resize', this._scrollHandler, { passive: true });
      this._scrollHandler = null;
    }
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    // Optional: clean up will-change styles if we added them
    this.elementos.forEach((el) => {
      if (el && el.style) {
        el.style.willChange = '';
      }
    });

    this.elementos = [];
  }
}
