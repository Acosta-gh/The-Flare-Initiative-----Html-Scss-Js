import { translations } from "../data/locales.js";

let currentLang =
  localStorage.getItem("site-lang") || navigator.language.split("-")[0] || "en";

if (!translations[currentLang]) currentLang = "en";

export function setLanguage(lang) {
  if (!translations[lang]) return;
  
  console.log(`Setting language to: ${lang}`);
  
  currentLang = lang;
  localStorage.setItem("site-lang", lang);
  
  updateDOM();
  updateAttributes();
  
  document.dispatchEvent(
    new CustomEvent("language-changed", {
      detail: { lang: currentLang },
    })
  );
}

function updateDOM() {
  const elements = document.querySelectorAll("[data-i18n]");
  
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = getNestedTranslation(translations[currentLang], key);
    
    if (text) {
      if (el.hasAttribute("data-html")) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    }
  });
}

function updateAttributes() {
  document.documentElement.lang = currentLang;
  
  // Manejar atributos con el formato data-i18n-attr="placeholder:key"
  const elementsWithAttrs = document.querySelectorAll("[data-i18n-attr]");
  
  elementsWithAttrs.forEach((el) => {
    const attrString = el.getAttribute("data-i18n-attr");
    
    // Puede ser "placeholder:footer.name_placeholder" o "alt:about.img_alt"
    const [attrName, key] = attrString.split(":");
    
    if (attrName && key) {
      const text = getNestedTranslation(translations[currentLang], key);
      
      if (text) {
        el.setAttribute(attrName, text);
      }
    }
  });
}

function getNestedTranslation(obj, path) {
  return path
    .split(".")
    .reduce((prev, curr) => (prev ? prev[curr] : null), obj);
}

export function initI18n() {
  setLanguage(currentLang);
}

export function getCurrentTranslation() {
  return translations[currentLang];
}