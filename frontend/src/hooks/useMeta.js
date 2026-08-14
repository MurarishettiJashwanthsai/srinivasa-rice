import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_SOCIAL_IMAGE, SITE_NAME, getRouteMetadata } from '../seo/siteSeo';

const setMetaTag = (selector, attrName, attrValue, content) => {
    let element = document.querySelector(selector);
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
};

const setLinkTag = (rel, href) => {
    let element = document.querySelector(`link[rel="${rel}"]`);
    if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
    }
    element.setAttribute('href', href);
};

export const useMeta = ({
    title,
    description,
    canonical,
    robots,
    ogType,
    ogImage,
} = {}) => {
    const location = useLocation();

    useEffect(() => {
        const routeMetadata = getRouteMetadata(location.pathname);
        const requestedTitle = title || routeMetadata.title;
        const fullTitle = requestedTitle.includes(SITE_NAME)
            ? requestedTitle
            : `${requestedTitle} — ${SITE_NAME}`;
        const finalDescription = description || routeMetadata.description;
        const finalCanonical = canonical || routeMetadata.canonical;
        const finalRobots = robots || routeMetadata.robots;
        const finalOgType = ogType || routeMetadata.ogType;
        const finalOgImage = ogImage || routeMetadata.ogImage || DEFAULT_SOCIAL_IMAGE;
        document.title = fullTitle;

        // Standard Meta
        setMetaTag('meta[name="description"]', 'name', 'description', finalDescription);
        setMetaTag('meta[name="robots"]', 'name', 'robots', finalRobots);
        setLinkTag('canonical', finalCanonical);

        // Open Graph Meta
        setMetaTag('meta[property="og:type"]', 'property', 'og:type', finalOgType);
        setMetaTag('meta[property="og:url"]', 'property', 'og:url', finalCanonical);
        setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
        setMetaTag('meta[property="og:description"]', 'property', 'og:description', finalDescription);
        setMetaTag('meta[property="og:image"]', 'property', 'og:image', finalOgImage);
        setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);

        // Twitter Meta
        setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
        setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
        setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', finalDescription);
        setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', finalOgImage);
    }, [title, description, canonical, robots, ogType, ogImage, location.pathname]);
};

export default useMeta;
