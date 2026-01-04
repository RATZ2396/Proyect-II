/**
 * Handles Telegram WebApp initialization safely.
 */
export function initTelegram() {
    // Check if running in browser with TG context
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;

        // Signal we are ready
        tg.ready();

        // Expand to full height
        tg.expand();

        // Match header color to our app
        tg.setHeaderColor('#050505');
        tg.setBackgroundColor('#050505');

        const user = tg.initDataUnsafe?.user;

        // Return user context if valid
        if (user) {
            return {
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                isTelegram: true
            };
        }
    }

    // Fallback for Web Mode
    return {
        isTelegram: false,
        first_name: 'Guest'
    };
}
