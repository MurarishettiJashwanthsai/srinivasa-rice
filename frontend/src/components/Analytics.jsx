import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';

const GTM_ID = import.meta.env.VITE_GTM_ID?.trim();

const Analytics = () => {
    const location = useLocation();

    useEffect(() => {
        if (!GTM_ID || !/^GTM-[A-Z0-9]+$/i.test(GTM_ID) || document.getElementById('google-tag-manager')) return;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
        const script = document.createElement('script');
        script.id = 'google-tag-manager';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        trackEvent('page_view', { page_path: `${location.pathname}${location.search}` });
    }, [location.pathname, location.search]);

    return null;
};

export default Analytics;
