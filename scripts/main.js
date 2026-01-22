import ScrollAnimations from "./components/scrollAnimations.js";
import { actualizarSaludo } from "./components/greeting.js"; 
import { initI18n, setLanguage, getCurrentTranslation } from "./utils/i18n.js";
import { fadeEffect } from "./components/fadeEffect.js";
import { barraNavegacion } from "./components/navbar.js";
import { typewriter } from "./components/typewriter.js";

document.addEventListener("DOMContentLoaded", () => {
  new ScrollAnimations();
  fadeEffect();
  barraNavegacion();
  
  initI18n(); 

  actualizarSaludo();

const btnFr = document.querySelector("#btn-fr");
const btnEn = document.querySelector("#btn-en");

if (btnFr) btnFr.addEventListener("click", () => setLanguage("fr"));
if (btnEn) btnEn.addEventListener("click", () => setLanguage("en"));

  const introJobPositions = document.querySelector(".main__intro-position--type");
  let typewriterInstance = null;

  function startTypewriter() {
    if (!introJobPositions) return;
    if (typewriterInstance) typewriterInstance.stop();

    const currentData = getCurrentTranslation();
    const words = currentData.hero.jobs;

    typewriterInstance = typewriter(introJobPositions, words);
  }

  startTypewriter();

  document.addEventListener("language-changed", () => {
    startTypewriter();
    actualizarSaludo();
  });
});