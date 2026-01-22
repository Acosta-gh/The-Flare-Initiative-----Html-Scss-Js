import { findElement } from "../utils/domUtils.js";

export function actualizarSaludo(selector = ".main__intro-salutations") {
  const elementoIntro = findElement(selector);
  
  if (!elementoIntro) {
    return;
  }

  const lang = document.documentElement.lang || "es";
  const esIngles = lang.toLowerCase().startsWith("en");

  const hora = new Date().getHours();
  let textoSaludo = "";

  if (esIngles) {
    if (hora < 12) textoSaludo = "Good morning";
    else if (hora < 18) textoSaludo = "Good afternoon";
    else textoSaludo = "Good evening";
  } else {
    if (hora < 12) textoSaludo = "Buenos días";
    else if (hora < 19) textoSaludo = "Buenas tardes"; 
    else textoSaludo = "Buenas noches";
  }

  elementoIntro.textContent = textoSaludo;
}

export const saludo = ({ selector = ".main__intro-salutations" } = {}) => {
    actualizarSaludo(selector);
    return { mostrarSaludo: () => actualizarSaludo(selector) };
};