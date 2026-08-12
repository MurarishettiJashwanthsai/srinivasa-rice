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
            'sameAs': [
                'https://www.linkedin.com/in/murarishetti-srinivasulu/',
            ],
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

        // Product Catalog Schema for /products or homepage catalog or /products/:slug
        if ((location.pathname.startsWith('/products') || location.pathname === '/') && Array.isArray(products) && products.length > 0) {
            products.forEach((prod) => {
                if (prod && prod.variety_name) {
                    const prodSlug = prod.slug || prod.variety_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    const isSpecificProduct = location.pathname === `/products/${prodSlug}`;

                    // If on catalog page, include all products; if on specific product detail page, include that specific product schema
                    if (!location.pathname.includes('/products/') || isSpecificProduct) {
                        schemas.push({
                            '@context': 'https://schema.org',
                            '@type': 'Product',
                            '@id': `${DOMAIN}/products/${prodSlug}#product`,
                            'url': `${DOMAIN}/products/${prodSlug}`,
                            'name': prod.variety_name,
                            'description': `${prod.variety_name} sourced from Miryalaguda. ${prod.processing || '100% Sortexed'}, Moisture: ${prod.moisture || '12-14% Max'}. Indicative export rate from Telangana rice hub.`,
                            'image': prod.image_url ? (prod.image_url.startsWith('http') ? prod.image_url : `${DOMAIN}/${prod.image_url}`) : `${DOMAIN}/logo.png`,
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
                                'priceSpecification': {
                                    '@type': 'UnitPriceSpecification',
                                    'price': prod.current_price_mt,
                                    'priceCurrency': 'INR',
                                    'unitCode': 'TNE',
                                    'valueAddedTaxIncluded': false,
                                    'referenceQuantity': {
                                        '@type': 'QuantitativeValue',
                                        'value': '1',
                                        'unitCode': 'TNE'
                                    }
                                }
                            },
                        });
                    }
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
