// fade-effect.js
import { findElement } from '../utils/domUtils.js';

/**
 * FadeEffect
 * --------------------------
 * Applies a smooth fade-in animation to a selected DOM element on page load
 * or when manually invoked via `start()`.
 *
 * Features:
 * - Respects `prefers-reduced-motion` for accessibility.
 * - Uses a requestAnimationFrame-based animation loop.
 * - Configurable selector and duration.
 * - Auto-initialization optional.
 * - Includes a `destroy()` method to cancel ongoing animations and clean memory.
 */
export default class FadeEffect {
  /**
   * @param {Object} options
   * @param {string} [options.selector='body']
   *   CSS selector of the element to fade in.
   *
   * @param {number} [options.duration=500]
   *   Animation duration in milliseconds. Values below 0 are clamped to 0.
   *
   * @param {boolean} [options.autoInit=true]
   *   If true, the effect initializes immediately.
   */
  constructor({ selector = 'body', duration = 500, autoInit = true } = {}) {
    /** @type {string} */
    this.selector = selector;

    /** @type {number} */
    this.duration = Math.max(0, duration);

    /** @type {number|null} ID returned by requestAnimationFrame */
    this.rafId = null;

    /** @type {number|null} timestamp when animation starts */
    this.startTime = null;

    /** @type {HTMLElement|null} element to animate */
    this.element = null;

    if (autoInit) this.init();
  }

  /**
   * Initializes the fade effect.
   * - If reduced motion is preferred, animation is skipped.
   * - If DOM is still loading, waits for DOMContentLoaded.
   */
  init() {
    // Respect user motion preferences
    const media = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media && media.matches) {
      const el = findElement(this.selector);
      if (el) el.style.opacity = 1;
      return;
    }

    // Wait for DOM readiness if necessary
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start(), { once: true });
    } else {
      this.start();
    }
  }

  /**
   * Starts the fade-in animation.
   * - Finds the target element.
   * - Sets initial styles.
   * - Executes animation via requestAnimationFrame loop.
   */
  start() {
    this.element = findElement(this.selector);
    if (!this.element) return;

    this.element.style.opacity = '0';
    this.element.style.willChange = 'opacity';
    this.startTime = null;

    const step = (timestamp) => {
      if (!this.startTime) this.startTime = timestamp;

      const elapsed = timestamp - this.startTime;
      const progress = Math.min(1, elapsed / Math.max(1, this.duration));

      this.element.style.opacity = String(progress);

      if (progress < 1) {
        this.rafId = window.requestAnimationFrame(step);
      } else {
        this.cleanupStyle();
      }
    };

    this.rafId = window.requestAnimationFrame(step);
  }

  /**
   * Cleans up temporary inline animation styles
   * after the fade is complete.
   */
  cleanupStyle() {
    if (!this.element) return;
    this.element.style.willChange = '';
    this.element.style.opacity = '1'; // Ensures final state is correct
  }

  /**
   * Cancels any active animation frame and clears references.
   * Call this when removing the component or navigating away in SPA setups.
   */
  destroy() {
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.startTime = null;
    this.element = null;
  }
}
