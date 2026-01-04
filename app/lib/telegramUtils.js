/**
 * Initializes Telegram WebApp if available.
 * @returns {Object|null} User object if available, null otherwise.
 */
export function initTelegram() {
    // Safety check for window and Telegram availability
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;

        // Signal readiness and expand view
        tg.ready();
        tg.expand();

        // Configure UI
        try {
            tg.setHeaderColor('#050505');
            tg.setBackgroundColor('#050505');
        } catch (e) {
            console.warn('Telegram specific styling failed', e);
        }

        const user = tg.initDataUnsafe?.user;

        // Return user or null
        if (user) {
            return {
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                language_code: user.language_code,
                isTelegram: true
            };
        }
    }

    return null;
}
