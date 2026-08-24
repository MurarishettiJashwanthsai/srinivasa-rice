import { useCallback, useEffect } from 'react';
import TurnstileWidget from '../components/TurnstileWidget';

const postToApp = (message) => {
    if (typeof window === 'undefined' || !window.ReactNativeWebView) return;
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
};

const MobileTurnstile = () => {
    useEffect(() => {
        document.title = 'Secure verification | Sri Srinivasa Canvassing';
        let robots = document.querySelector('meta[name="robots"]');
        if (!robots) {
            robots = document.createElement('meta');
            robots.setAttribute('name', 'robots');
            document.head.appendChild(robots);
        }
        robots.setAttribute('content', 'noindex, nofollow, noarchive');
    }, []);

    const handleToken = useCallback((token) => {
        if (token) postToApp({ type: 'verified', token });
    }, []);
    const handleError = useCallback(() => postToApp({ type: 'error' }), []);
    const handleExpire = useCallback(() => postToApp({ type: 'expired' }), []);

    return (
        <main className="min-h-screen bg-white flex items-center justify-center px-2" aria-label="Mobile anti-spam verification">
            <div className="w-full flex justify-center">
                <TurnstileWidget onToken={handleToken} onError={handleError} onExpire={handleExpire} />
            </div>
        </main>
    );
};

export default MobileTurnstile;
