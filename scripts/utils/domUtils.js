/**
 * Utilidades para manipulación del DOM
 */
export const findElement = (selector) => {
  const element = document.querySelector(selector);
  if (!element) {
    console.warn(`Elemento no encontrado: ${selector}`);
  }
  return element;
};

export const findElements = (selector) => {
  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) {
    console.warn(`No se encontraron elementos: ${selector}`);
  }
  return elements;
};