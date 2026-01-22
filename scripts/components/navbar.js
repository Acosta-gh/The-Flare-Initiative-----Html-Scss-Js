import { findElement, findElements } from "../utils/domUtils.js";

export function barraNavegacion({
  selectorHeader = ".header",
  selectorBurger = ".header__nav-burguer",
  selectorNavItems = ".header__nav-item",
  selectorNav = ".header__nav-list",
  selectorLangMenu = ".header__nav-langmenu",
  selectorLangItems = ".header__nav-langitem",
  selectorLangList = ".header__nav-langlist",
  autoInit = true,
} = {}) {
  // --- Estado interno ---
  let header, burger, navItems, nav, langMenu, langItems, langList;
  let permiteClickReciente = false;
  let clickTimeout = null;
  let rafScroll = null;

  // Referencias a handlers para poder removerlos
  const handlers = {
    onBurgerClick: null,
    onBurgerKeyDown: null,
    onDocClick: null,
    onNavItemClick: null,
    onLangMenuClick: null,
    onLangMenuKeyDown: null,
    onLangItemClick: null,
    onWindowScroll: null,
  };

  // --- Funciones internas (idénticas a tu clase) ---

  function deactivateAllNavItems() {
    navItems.forEach((item) => item.classList.remove("item--active"));
  }

  function toggleMenuElements() {
    const burgerActive = burger.classList.toggle("header__nav-burguer--active");
    nav.classList.toggle("header__nav--active");
    header.classList.toggle("header--active");
    burger.setAttribute("aria-expanded", burgerActive ? "true" : "false");
  }

  function toggleLangMenu() {
    if (!langMenu) return;
    langList?.classList.toggle("header__nav-langlist--active");
    const expanded = langMenu.classList.toggle("header__nav-langmenu--active");
    langMenu.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  function closeLangMenu() {
    if (!langMenu) return;
    langList?.classList.remove("header__nav-langlist--active");
    langMenu.classList.remove("header__nav-langmenu--active");
    langMenu.setAttribute("aria-expanded", "false");
  }

  // --- Event handlers (idénticos a tu clase) ---

  function onBurgerClick() {
    toggleMenuElements();
    closeLangMenu();
  }

  function onBurgerKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onBurgerClick();
    }
  }

  function onLangMenuClick(e) {
    toggleLangMenu();
    e.stopPropagation();
  }

  function onLangMenuKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onLangMenuClick(e);
    }
  }

  function onDocumentClick(e) {
    if (
      langList?.classList.contains("header__nav-langlist--active") &&
      !langList.contains(e.target) &&
      e.target !== langMenu &&
      !langMenu.contains(e.target)
    ) {
      closeLangMenu();
    }
  }

  function onNavItemClick(e, item) {
    permiteClickReciente = true;
    if (clickTimeout) clearTimeout(clickTimeout);
    toggleMenuElements();
    deactivateAllNavItems();
    item.classList.toggle("item--active");

    clickTimeout = setTimeout(() => {
      permiteClickReciente = false;
    }, 800);
  }

  function onLangItemClick(e, item) {
    toggleLangMenu();
    e.stopPropagation();
  }

  function onWindowScroll() {
    if (rafScroll) return;
    rafScroll = requestAnimationFrame(() => {
      if (!permiteClickReciente) deactivateAllNavItems();
      rafScroll = null;
    });
  }

  // --- Setup listeners ---
  function setupEventListeners() {
    handlers.onBurgerClick = onBurgerClick;
    handlers.onBurgerKeyDown = onBurgerKeyDown;
    handlers.onDocClick = onDocumentClick;
    handlers.onWindowScroll = onWindowScroll;
    handlers.onLangMenuClick = onLangMenuClick;
    handlers.onLangMenuKeyDown = onLangMenuKeyDown;
    burger.addEventListener("click", handlers.onBurgerClick);
    burger.addEventListener("keydown", handlers.onBurgerKeyDown);

    langMenu?.addEventListener("click", handlers.onLangMenuClick);
    langMenu?.addEventListener("keydown", handlers.onLangMenuKeyDown);

    document.addEventListener("click", handlers.onDocClick);
    window.addEventListener("scroll", handlers.onWindowScroll, {
      passive: true,
    });

    navItems.forEach((item) => {
      const handler = (e) => onNavItemClick(e, item);
      item.addEventListener("click", handler);
      item.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          handler(ev);
        }
      });
      item._navClickHandler = handler;
    });

    langItems.forEach((item) => {
      const handler = (e) => onLangItemClick(e, item);
      item.addEventListener("click", handler);
      item.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          handler(ev);
        }
      });
      item._langClickHandler = handler;
    });
  }

  // --- INIT ---
  function init() {
    header = findElement(selectorHeader);
    burger = findElement(selectorBurger);
    navItems = findElements(selectorNavItems);
    nav = findElement(selectorNav);
    langMenu = findElement(selectorLangMenu);
    langItems = findElements(selectorLangItems);
    langList = findElement(selectorLangList);
    if (!header || !burger || !nav || navItems.length === 0) {
      console.error(
        "No se encontraron los elementos necesarios para la navegación."
      );
      return;
    }

    burger.setAttribute("aria-expanded", "false");
    langMenu?.setAttribute("aria-expanded", "false");

    setupEventListeners();
  }

  // --- DESTROY ---
  function destroy() {
    burger?.removeEventListener("click", handlers.onBurgerClick);
    burger?.removeEventListener("keydown", handlers.onBurgerKeyDown);
    langMenu?.removeEventListener("click", handlers.onLangMenuClick);
    langMenu?.removeEventListener("keydown", handlers.onLangMenuKeyDown);

    document.removeEventListener("click", handlers.onDocClick);
    window.removeEventListener("scroll", handlers.onWindowScroll);

    navItems.forEach((item) => {
      if (item._navClickHandler) {
        item.removeEventListener("click", item._navClickHandler);
        delete item._navClickHandler;
      }
    });

    langItems.forEach((item) => {
      if (item._langClickHandler) {
        item.removeEventListener("click", item._langClickHandler);
        delete item._langClickHandler;
      }
    });

    if (clickTimeout) clearTimeout(clickTimeout);
    if (rafScroll) cancelAnimationFrame(rafScroll);
  }

  if (autoInit) init();

  return { init, destroy };
}
