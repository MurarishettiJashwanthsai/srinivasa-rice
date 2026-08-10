import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DOMAIN = 'https://www.srinivascanvassing.com';

export const StructuredData = ({ products = [] }) => {
    const location = useLocation();

    useEffect(() => {
        const existingScript = document.getElementById('ss-dynamic-structured-data');
        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement('script');
        script.id = 'ss-dynamic-structured-data';
        script.type = 'application/ld+json';

        const schemas = [];

        // Organization Schema
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': `${DOMAIN}/#organization`,
            'name': 'Sri Srinivasa Canvassing',
            'url': `${DOMAIN}/`,
            'logo': {
                '@type': 'ImageObject',
                'url': `${DOMAIN}/logo.png`,
            },
            'description': 'Rice sourcing, canvassing and export support from Miryalaguda, Telangana, India.',
            'telephone': '+91-9866760028',
            'email': 'srinivasulu@srinivascanvassing.com',
            'address': {
                '@type': 'PostalAddress',
                'streetAddress': 'Miryalaguda',
                'addressLocality': 'Miryalaguda',
                'addressRegion': 'Telangana',
                'postalCode': '508207',
                'addressCountry': 'IN',
            },
        });

        // WebSite Schema
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': `${DOMAIN}/#website`,
            'url': `${DOMAIN}/`,
            'name': 'Sri Srinivasa Canvassing',
            'description': 'Wholesale Rice Sourcing & Export Merchant from Miryalaguda',
            'publisher': {
                '@id': `${DOMAIN}/#organization`,
            },
        });

        // BreadcrumbList Schema based on path
        const pathSegments = location.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
            const breadcrumbItems = [
                {
                    '@type': 'ListItem',
                    'position': 1,
                    'name': 'Home',
                    'item': `${DOMAIN}/`,
                },
            ];

            let currentPath = '';
            pathSegments.forEach((segment, index) => {
                currentPath += `/${segment}`;
                const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
                breadcrumbItems.push({
                    '@type': 'ListItem',
                    'position': index + 2,
                    'name': name,
                    'item': `${DOMAIN}${currentPath}`,
                });
            });

            schemas.push({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                'itemListElement': breadcrumbItems,
            });
        }

        // Product Catalog Schema for /products or homepage catalog
        if ((location.pathname === '/products' || location.pathname === '/') && Array.isArray(products) && products.length > 0) {
            products.forEach((prod) => {
                if (prod && prod.variety_name) {
                    schemas.push({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        'name': prod.variety_name,
                        'description': `${prod.variety_name} sourced from Miryalaguda. ${prod.processing || '100% Sortexed'}, Moisture: ${prod.moisture || '12-14% Max'}.`,
                        'brand': {
                            '@type': 'Brand',
                            'name': 'Sri Srinivasa Canvassing',
                        },
                        'offers': {
                            '@type': 'Offer',
                            'priceCurrency': 'INR',
                            'price': prod.current_price_mt,
                            'priceValidUntil': new Date(Date.now() + 86400000).toISOString().split('T')[0],
                            'itemCondition': 'https://schema.org/NewCondition',
                            'availability': 'https://schema.org/InStock',
                            'seller': {
                                '@type': 'Organization',
                                'name': 'Sri Srinivasa Canvassing',
                            },
                        },
                    });
                }
            });
        }

        script.text = JSON.stringify(schemas);
        document.head.appendChild(script);

        return () => {
            const el = document.getElementById('ss-dynamic-structured-data');
            if (el) el.remove();
        };
    }, [location.pathname, products]);

    return null;
};

export default StructuredData;
