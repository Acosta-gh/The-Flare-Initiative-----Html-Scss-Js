import { findElement } from "../utils/domUtils.js";

export function fadeEffect({
  selector = "body",
  duration = 500,
  autoInit = true,
} = {}) {
  let element = null;
  let rafId = null;
  let startTime = null;
  const dur = Math.max(0, duration);

  function cleanupStyle() {
    if (!element) return;
    element.style.willChange = "";
    element.style.opacity = "1";
  }

  function start() {
    element = findElement(selector);
    if (!element) return;
    element.style.opacity = "0";
    element.style.willChange = "opacity";
    startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / Math.max(1, dur));

      element.style.opacity = String(progress);

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        cleanupStyle();
      }
    }

    rafId = window.requestAnimationFrame(step);
  }

  function init() {
    const media =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media && media.matches) {
      const el = findElement(selector);
      if (el) el.style.opacity = 1;
      return;
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
      start();
    }
  }

  function destroy() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    element = null;
    startTime = null;
  }

  if (autoInit) init();

  return { init, start, destroy };
}
