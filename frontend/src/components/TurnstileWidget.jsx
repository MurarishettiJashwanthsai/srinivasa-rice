import { useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
const SCRIPT_ID = 'cloudflare-turnstile-script';

const TurnstileWidget = ({ onToken }) => {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);

    useEffect(() => {
        if (!SITE_KEY || typeof window === 'undefined') return undefined;

        let cancelled = false;
        const renderWidget = () => {
            if (cancelled || !containerRef.current || !window.turnstile || widgetIdRef.current !== null) return;
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: SITE_KEY,
                callback: (token) => onToken(token),
                'expired-callback': () => onToken(''),
                'error-callback': () => onToken(''),
                theme: 'auto',
            });
        };

        const existingScript = document.getElementById(SCRIPT_ID);
        if (existingScript) {
            if (window.turnstile) renderWidget();
            else existingScript.addEventListener('load', renderWidget, { once: true });
        } else {
            const script = document.createElement('script');
            script.id = SCRIPT_ID;
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            script.addEventListener('load', renderWidget, { once: true });
            document.head.appendChild(script);
        }

        return () => {
            cancelled = true;
            if (window.turnstile && widgetIdRef.current !== null) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, [onToken]);

    if (!SITE_KEY) return null;
    return <div ref={containerRef} className="min-h-[65px]" aria-label="Anti-spam verification" />;
};

export default TurnstileWidget;
