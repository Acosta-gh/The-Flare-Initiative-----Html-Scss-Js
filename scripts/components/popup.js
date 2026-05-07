export function initPopup() {
    const popupOverlay = document.getElementById('fundraiser-popup');
    const closeBtn = document.getElementById('popup-close');
    const ctaCloseBtn = document.getElementById('popup-cta-close');
    const dontShowAgainKey = 'flare_popup_seen_trevor_claydon';

    if (!popupOverlay || !closeBtn) return;

    // Check if user has already dismissed the popup
    const hasSeenPopup = localStorage.getItem(dontShowAgainKey);

    if (!hasSeenPopup) {
        // Delay popup slightly for better UX
        setTimeout(() => {
            showPopup();
        }, 1500);
    }

    const dismissPopup = () => {
        hidePopup();
        localStorage.setItem(dontShowAgainKey, 'true');
    };

    closeBtn.addEventListener('click', dismissPopup);
    if (ctaCloseBtn) ctaCloseBtn.addEventListener('click', dismissPopup);

    // Close on overlay click
    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
            hidePopup();
            localStorage.setItem(dontShowAgainKey, 'true');
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popupOverlay.classList.contains('is-visible')) {
            hidePopup();
            localStorage.setItem(dontShowAgainKey, 'true');
        }
    });

    function showPopup() {
        popupOverlay.classList.add('is-visible');
        document.body.style.overflow = 'hidden'; // Prevent scroll
    }

    function hidePopup() {
        popupOverlay.classList.remove('is-visible');
        document.body.style.overflow = ''; // Restore scroll
    }
}
