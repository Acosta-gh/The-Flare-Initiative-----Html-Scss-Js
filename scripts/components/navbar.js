import { findElement, findElements } from "../utils/domUtils.js";

/**
 * Navigation bar controller component.
 *
 * This class manages:
 * - Burger menu open/close behavior
 * - Active state for navigation links
 * - Language selector dropdown (with accessibility)
 * - Scroll handling with requestAnimationFrame-based debounce
 * - Cleanup of event listeners (destroy)
 *
 * It uses shared DOM utilities (findElement/findElements)
 * and fully supports keyboard accessibility (Enter/Space).
 */
export default class BarraNavegacion {
  /**
   * @param {Object} options - Configuration for selectors and behavior.
   * @param {string} options.selectorHeader - Selector for the main header.
   * @param {string} options.selectorBurger - Selector for the burger/toggle button.
   * @param {string} options.selectorNavItems - Selector for each navigation item.
   * @param {string} options.selectorNav - Selector for the navigation container.
   * @param {string} options.selectorLangMenu - Selector for the language menu button.
   * @param {string} options.selectorLangItems - Selector for each language item.
   * @param {string} options.selectorLangList - Selector for the language dropdown list.
   * @param {boolean} options.autoInit - Whether to auto-initialize the component.
   */
  constructor({
    selectorHeader = ".header",
    selectorBurger = ".header__nav-burguer",
    selectorNavItems = ".header__nav-item",
    selectorNav = ".header__nav-list",
    selectorLangMenu = ".header__nav-langmenu",
    selectorLangItems = ".header__nav-langitem",
    selectorLangList = ".header__nav-langlist",
    autoInit = true,
  } = {}) {
    // Store selectors
    this.selectorHeader = selectorHeader;
    this.selectorBurger = selectorBurger;
    this.selectorNavItems = selectorNavItems;
    this.selectorNav = selectorNav;
    this.selectorLangMenu = selectorLangMenu;
    this.selectorLangItems = selectorLangItems;
    this.selectorLangList = selectorLangList;

    // Elements (populated at init)
    this.header = null;
    this.burger = null;
    this.navItems = null;
    this.nav = null;
    this.langMenu = null;
    this.langItems = null;
    this.langList = null;

    // Internal state flags
    this.permiteClickReciente = false; // Prevent unwanted deactivation after item click
    this.clickTimeout = null;
    this.rafScroll = null;

    // Bound event handlers stored for cleanup
    this._handlers = {
      onBurgerClick: null,
      onBurgerKeyDown: null,
      onDocClick: null,
      onNavItemClick: null,
      onLangMenuClick: null,
      onLangMenuKeyDown: null,
      onLangItemClick: null,
      onWindowScroll: null,
    };

    if (autoInit) this.init();
  }

  /**
   * Initializes the component by querying DOM elements and configuring events.
   * Called automatically unless autoInit is false.
   */
  init() {
    this.header = findElement(this.selectorHeader);
    this.burger = findElement(this.selectorBurger);
    this.navItems = findElements(this.selectorNavItems);
    this.nav = findElement(this.selectorNav);
    this.langMenu = findElement(this.selectorLangMenu);
    this.langItems = findElements(this.selectorLangItems);
    this.langList = findElement(this.selectorLangList);

    if (!this.burger || !this.nav || !this.header || this.navItems.length === 0) {
      console.error("Required elements for navigation were not found.");
      return;
    }

    // Initialize ARIA attributes
    this.burger.setAttribute("aria-expanded", "false");
    if (this.langMenu) this.langMenu.setAttribute("aria-expanded", "false");

    this.setupEventListeners();
  }

  /**
   * Attaches event listeners for burger, navigation items,
   * language dropdown, document-click, and window scroll.
   */
  setupEventListeners() {
    this._handlers.onBurgerClick = this.onBurgerClick.bind(this);
    this._handlers.onBurgerKeyDown = this.onBurgerKeyDown.bind(this);
    this._handlers.onDocClick = this.onDocumentClick.bind(this);
    this._handlers.onWindowScroll = this.onWindowScroll.bind(this);
    this._handlers.onLangMenuClick = this.onLangMenuClick.bind(this);
    this._handlers.onLangMenuKeyDown = this.onLangMenuKeyDown.bind(this);

    this.burger.addEventListener("click", this._handlers.onBurgerClick);
    this.burger.addEventListener("keydown", this._handlers.onBurgerKeyDown);

    if (this.langMenu) {
      this.langMenu.addEventListener("click", this._handlers.onLangMenuClick);
      this.langMenu.addEventListener("keydown", this._handlers.onLangMenuKeyDown);
    }

    document.addEventListener("click", this._handlers.onDocClick);

    // Navigation items
    this.navItems.forEach((item) => {
      const handler = (e) => this.onNavItemClick(e, item);
      item.addEventListener("click", handler);
      item.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          handler(ev);
        }
      });
      item._navClickHandler = handler;
    });

    // Language items
    this.langItems.forEach((item) => {
      const handler = (e) => this.onLangItemClick(e, item);
      item.addEventListener("click", handler);
      item.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          handler(ev);
        }
      });
      item._langClickHandler = handler;
    });

    window.addEventListener("scroll", this._handlers.onWindowScroll, { passive: true });
  }

  /** Handles click on burger menu button. */
  onBurgerClick() {
    this.toggleMenuElements();
    this.closeLangMenu();
  }

  /**
   * Handles keyboard activation for the burger button.
   * Supports accessibility via Enter/Space.
   */
  onBurgerKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.onBurgerClick();
    }
  }

  /** Handles clicking on the language menu toggle. */
  onLangMenuClick(e) {
    this.toggleLangMenu();
    e.stopPropagation();
  }

  /** Keyboard accessibility for language menu. */
  onLangMenuKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.onLangMenuClick(e);
    }
  }

  /**
   * Detects clicks outside the language menu to close it.
   */
  onDocumentClick(e) {
    if (
      this.langList &&
      this.langMenu &&
      this.langList.classList.contains("header__nav-langlist--active")
    ) {
      const clickedOutside =
        !this.langList.contains(e.target) &&
        e.target !== this.langMenu &&
        !this.langMenu.contains(e.target);

      if (clickedOutside) this.closeLangMenu();
    }
  }

  /**
   * Handles click on any navigation item.
   * Activates the clicked item and closes the menu on mobile.
   */
  onNavItemClick(e, item) {
    this.permiteClickReciente = true;
    if (this.clickTimeout) clearTimeout(this.clickTimeout);

    this.toggleMenuElements();
    this.deactivateAllNavItems();
    item.classList.toggle("item--active");

    // Prevents scroll-related deactivation for a short time
    this.clickTimeout = setTimeout(() => {
      this.permiteClickReciente = false;
    }, 800);
  }

  /** Handles click on a language item and closes dropdown. */
  onLangItemClick(e, item) {
    this.toggleLangMenu();
    e.stopPropagation();
  }

  /**
   * Scroll handler debounced using requestAnimationFrame
   * for optimal performance.
   */
  onWindowScroll() {
    if (this.rafScroll) return;

    this.rafScroll = requestAnimationFrame(() => {
      if (!this.permiteClickReciente) {
        this.deactivateAllNavItems();
      }
      this.rafScroll = null;
    });
  }

  /** Removes active class from all navigation items. */
  deactivateAllNavItems() {
    this.navItems.forEach((item) => item.classList.remove("item--active"));
  }

  /** Toggles the language menu open/close state and updates ARIA. */
  toggleLangMenu() {
    if (!this.langMenu) return;

    if (this.langList) {
      this.langList.classList.toggle("header__nav-langlist--active");
    }

    const expanded = this.langMenu.classList.toggle("header__nav-langmenu--active");
    this.langMenu.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  /** Forces the language menu to close. */
  closeLangMenu() {
    if (!this.langMenu) return;

    if (this.langList) {
      this.langList.classList.remove("header__nav-langlist--active");
    }

    this.langMenu.classList.remove("header__nav-langmenu--active");
    this.langMenu.setAttribute("aria-expanded", "false");
  }

  /** Toggles classes that open/close the main burger menu. */
  toggleMenuElements() {
    const burgerActive = this.burger.classList.toggle("header__nav-burguer--active");

    this.nav.classList.toggle("header__nav--active");
    this.header.classList.toggle("header--active");

    // Update accessibility state
    this.burger.setAttribute("aria-expanded", burgerActive ? "true" : "false");
  }

  /**
   * Removes all event listeners and resets all internal references.
   * Call this when removing the component from DOM.
   */
  destroy() {
    if (this.burger) {
      this.burger.removeEventListener("click", this._handlers.onBurgerClick);
      this.burger.removeEventListener("keydown", this._handlers.onBurgerKeyDown);
    }

    if (this.langMenu) {
      this.langMenu.removeEventListener("click", this._handlers.onLangMenuClick);
      this.langMenu.removeEventListener("keydown", this._handlers.onLangMenuKeyDown);
    }

    document.removeEventListener("click", this._handlers.onDocClick);
    window.removeEventListener("scroll", this._handlers.onWindowScroll);

    this.navItems.forEach((item) => {
      if (item._navClickHandler) {
        item.removeEventListener("click", item._navClickHandler);
        delete item._navClickHandler;
      }
    });

    this.langItems.forEach((item) => {
      if (item._langClickHandler) {
        item.removeEventListener("click", item._langClickHandler);
        delete item._langClickHandler;
      }
    });

    if (this.clickTimeout) clearTimeout(this.clickTimeout);
    if (this.rafScroll) cancelAnimationFrame(this.rafScroll);

    // Reset references
    this.header = null;
    this.burger = null;
    this.navItems = [];
    this.nav = null;
    this.langMenu = null;
    this.langItems = [];
    this.langList = null;
    this._handlers = {};
  }
}
