import './globals.css';
import { Inter } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

// SEO OPTIMIZED METADATA
export const metadata = {
    title: 'Timba Clicker | Ganancias Infinitas & Timbas Reales',
    description: 'El juego clicker viral. Toca la moneda, acumula fortuna y canjea tus puntos por Timbas Reales. Play the ultimate casino idle game now.',
    keywords: ['Timba Clicker', 'Casino Game', 'Juego de Clicker', 'Ganar Dinero', 'Idle Game', 'Timba Casino', 'Next.js Game', 'Clicker Viral'],
    authors: [{ name: 'Timba Games' }],
    creator: 'Timba Games',
    publisher: 'Timba Games',
    robots: 'index, follow',
    openGraph: {
        title: '👑 TIMBA CLICKER - ¿Eres Millonario?',
        description: 'Entra y demuestra cuánto puedes ganar. ¡Canje real disponible!',
        type: 'website',
        locale: 'es_ES',
        siteName: 'Timba Clicker',
    },
    twitter: {
        card: 'summary_large_image',
        title: '👑 TIMBA CLICKER - ¿Eres Millonario?',
        description: 'El juego clicker viral. ¡Canjea tus Timbitas por premios reales!',
    },
};

// STRICT VIEWPORT CONFIG for all platforms
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
        <html lang="es">
            <head>
                {/* Telegram WebApp SDK */}
                <script src="https://telegram.org/js/telegram-web-app.js" async></script>
                {/* PWA / Mobile compatibility */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="format-detection" content="telephone=no" />

                {/* Telegram Detection Script */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            var isTelegram = false;
                            if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
                                isTelegram = true;
                            }
                            if (typeof navigator !== 'undefined' && /Telegram/i.test(navigator.userAgent)) {
                                isTelegram = true;
                            }
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
            <body className={inter.className}>
                {/* JSON-LD Structured Data for SEO */}
                <Script
                    id="json-ld"
                    type="application/ld+json"
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "VideoGame",
                            "name": "Timba Clicker",
                            "description": "El juego clicker viral. Toca la moneda, acumula fortuna y canjea tus puntos por Timbas Reales.",
                            "operatingSystem": "Web, Android, iOS",
                            "applicationCategory": "Game",
                            "gamePlatform": ["Web Browser", "Mobile"],
                            "genre": ["Clicker", "Idle", "Casino"],
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            },
                            "author": {
                                "@type": "Organization",
                                "name": "Timba Games"
                            }
                        })
                    }}
                />
                {children}
            </body>
        </html>
    );
}
