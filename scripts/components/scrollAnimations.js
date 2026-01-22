import { findElements } from "../utils/domUtils.js";

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
    this.elementos = findElements(this.selector);

    const mediaReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaReduce && mediaReduce.matches) {
      this.elementos.forEach((el) => el.classList.add(this.claseActiva));
      return;
    }

    if ('IntersectionObserver' in window) {
      this.setupObserver();
    } else {
      this.setupFallback();
    }

    if (!('IntersectionObserver' in window)) {
      this.handleScroll(); // run once
    }
  }

  setupObserver() {
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
      el.style.willChange = 'opacity, transform';
      this.observer.observe(el);
    });
  }

  setupFallback() {
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
    this.destroy(); 
    this.elementos = findElements(this.selector);
    this.init();
  }

  destroy() {
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

    this.elementos.forEach((el) => {
      if (el && el.style) {
        el.style.willChange = '';
      }
    });

    this.elementos = [];
  }
}