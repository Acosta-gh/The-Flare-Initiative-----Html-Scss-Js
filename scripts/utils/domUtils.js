/**
 * Finds a single DOM element using a CSS selector.
 *
 * @param {string} selector - The CSS selector used to query the DOM.
 * @returns {Element|null} The matched DOM element, or null if not found.
 * @example
 * const button = findElement('#submit-btn');
 */
export const findElement = (selector) => {
  const element = document.querySelector(selector);
  if (!element) {
    console.warn(`Element not found: ${selector}`);
  }
  return element;
};

/**
 * Finds multiple DOM elements using a CSS selector.
 *
 * @param {string} selector - The CSS selector used to query the DOM.
 * @returns {NodeListOf<Element>} A NodeList containing the matched elements.
 * @example
 * const items = findElements('.list-item');
 */
export const findElements = (selector) => {
  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) {
    console.warn(`No elements found: ${selector}`);
  }
  return elements;
};
