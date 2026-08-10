import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_DOMAIN = 'https://www.srinivascanvassing.com';
const DEFAULT_IMAGE = `${DEFAULT_DOMAIN}/logo.png`;

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
    title = 'Rice Sourcing and Export from Miryalaguda',
    description = 'Rice sourcing, canvassing and export support from Miryalaguda, Telangana. View available products, packaging, credentials and bulk enquiry information.',
    ogType = 'website',
    ogImage = DEFAULT_IMAGE,
} = {}) => {
    const location = useLocation();

    useEffect(() => {
        const fullTitle = title.includes('Sri Srinivasa Canvassing')
            ? title
            : `${title} — Sri Srinivasa Canvassing`;
        document.title = fullTitle;

        const currentUrl = `${DEFAULT_DOMAIN}${location.pathname}${location.search}`;

        // Standard Meta
        setMetaTag('meta[name="description"]', 'name', 'description', description);
        setLinkTag('canonical', currentUrl);

        // Open Graph Meta
        setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
        setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
        setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
        setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
        setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
        setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Sri Srinivasa Canvassing');

        // Twitter Meta
        setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
        setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
        setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
        setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);
    }, [title, description, ogType, ogImage, location.pathname, location.search]);
};

export default useMeta;
