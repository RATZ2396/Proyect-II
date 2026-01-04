import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Timba Clicker',
    description: 'The ultimate casino clicker game',
};

// STRICT VIEWPORT CONFIG for all platforms
// Blocks Telegram's 10% zoom, prevents user scaling
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: '#000000',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                {/* Telegram WebApp SDK */}
                <script src="https://telegram.org/js/telegram-web-app.js" async></script>
                {/* PWA / Mobile compatibility */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="format-detection" content="telephone=no" />

                {/* Telegram Detection Script - Robust detection for WebApp and in-app browser */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            var isTelegram = false;
                            // Check for Telegram WebApp SDK
                            if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
                                isTelegram = true;
                            }
                            // Check userAgent for Telegram in-app browser
                            if (typeof navigator !== 'undefined' && /Telegram/i.test(navigator.userAgent)) {
                                isTelegram = true;
                            }
                            // Apply class to both html and body for maximum CSS specificity
                            if (isTelegram) {
                                document.documentElement.classList.add('is-telegram', 'telegram-web');
                                document.addEventListener('DOMContentLoaded', function() {
                                    document.body.classList.add('is-telegram', 'telegram-web');
                                });
                            }
                        })();
                    `
                }} />
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
