import FadeEffect from './components/fadeEffect.js';
import Navbar from './components/navbar.js';
import ScrollAnimations from './components/scrollAnimations.js';

// import { findElement } from './utils/domUtils.js';

/**
 * Initializes the application once the DOM content is fully loaded.
 * 
 * This event listener ensures that all imported components are
 * instantiated only after the document has been parsed and is ready
 * for interaction.
 */
document.addEventListener("DOMContentLoaded", () => {
  /**
   * Initialize the fade effect component.
   * Handles fading interactions and transitions on page elements.
   */
  const fadeEffect = new FadeEffect();

  /**
   * Initialize the navigation bar component.
   * Manages navbar behavior such as toggles, scrolling behavior,
   * or dynamic class updates based on user interaction.
   */
  const navbar = new Navbar();

  /**
   * Initialize scroll-based animations.
   * Triggers animations when elements enter the viewport
   * during page scrolling.
   */
  const scrollAnimations = new ScrollAnimations();
});
