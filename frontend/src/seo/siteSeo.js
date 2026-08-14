import { PRODUCT_CATALOG, canonicalProductSlug, getCatalogProduct } from '../data/productCatalog';

export const SITE_URL = 'https://www.srinivascanvassing.com';
export const SITE_NAME = 'Sri Srinivasa Canvassing';
export const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/logo.png`;
export const BUSINESS_ID = `${SITE_URL}/#business`;

const ROUTE_METADATA = {
    '/': {
        title: 'Rice Sourcing from Miryalaguda — Sri Srinivasa Canvassing',
        description: 'Rice sourcing, canvassing and export-logistics support from Miryalaguda, Telangana. View rice varieties, indicative rates and bulk quote information.',
    },
    '/about': {
        title: 'About Our Rice Canvassing Service — Sri Srinivasa Canvassing',
        description: 'Learn about our rice sourcing, mill relationships, inspection coordination and Miryalaguda market experience.',
    },
    '/products': {
        title: 'Bulk Rice Varieties — Sona Masuri, RNR and JSR',
        description: 'Browse Sona Masuri, RNR and JSR rice varieties sourced through selected Miryalaguda milling facilities and request a verified bulk quote.',
    },
    '/market-rates': {
        title: 'Miryalaguda Rice Market Rates — Indicative Wholesale Estimates',
        description: 'View dated indicative wholesale rice rates from Miryalaguda. Final prices depend on grade, quantity, packaging and delivery requirements.',
    },
    '/packaging': {
        title: 'Rice Packaging and Export Logistics — Sri Srinivasa Canvassing',
        description: 'View bulk rice packaging, custom branding and port-logistics support information from Telangana, India.',
    },
    '/certifications': {
        title: 'Export Credentials and Quality Standards — Sri Srinivasa Canvassing',
        description: 'View Sri Srinivasa Canvassing registration information and the quality standards used when coordinating bulk rice requirements.',
    },
    '/contact': {
        title: 'Request a Bulk Rice Quote — Sri Srinivasa Canvassing',
        description: 'Submit your required rice variety, quantity and packaging to request specifications and a verified commercial quotation.',
    },
    '/legal': {
        title: 'Privacy, Terms and Commodity Disclaimer — Sri Srinivasa Canvassing',
        description: 'Read the privacy policy, website terms and commodity-price disclaimer covering enquiries, data retention and indicative market rates.',
    },
};

const normalizePath = (value = '/') => {
    const pathname = value.split('?')[0].split('#')[0] || '/';
    return pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';
};

export const getRouteMetadata = (value = '/') => {
    const pathname = normalizePath(value);

    if (pathname.startsWith('/admin')) {
        return {
            title: `Admin Portal — ${SITE_NAME}`,
            description: 'Authorized administration portal.',
            canonical: `${SITE_URL}${pathname}`,
            ogType: 'website',
            ogImage: DEFAULT_SOCIAL_IMAGE,
            robots: 'noindex, nofollow, noarchive',
            pathname,
        };
    }

    const productMatch = pathname.match(/^\/products\/([^/]+)$/);
    if (productMatch) {
        const product = getCatalogProduct(productMatch[1]);
        const slug = product?.slug || canonicalProductSlug(productMatch[1]);
        const name = product?.variety_name || 'Rice Variety';
        return {
            title: `${name} Specifications and Bulk Quote — ${SITE_NAME}`,
            description: `View ${name} processing and moisture specifications, indicative Miryalaguda rate information and request a verified bulk quotation.`,
            canonical: `${SITE_URL}/products/${slug}`,
            ogType: 'product',
            ogImage: product?.image_url || DEFAULT_SOCIAL_IMAGE,
            robots: product ? 'index, follow' : 'noindex, follow',
            pathname,
        };
    }

    const route = ROUTE_METADATA[pathname];
    if (!route) {
        return {
            title: `Page Not Found — ${SITE_NAME}`,
            description: 'The requested page could not be found.',
            canonical: `${SITE_URL}${pathname}`,
            ogType: 'website',
            ogImage: DEFAULT_SOCIAL_IMAGE,
            robots: 'noindex, follow',
            pathname,
        };
    }

    return {
        ...route,
        canonical: pathname === '/' ? `${SITE_URL}/` : `${SITE_URL}${pathname}`,
        ogType: 'website',
        ogImage: DEFAULT_SOCIAL_IMAGE,
        robots: 'index, follow',
        pathname,
    };
};

const breadcrumbName = (segment) => segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const buildBreadcrumbSchema = (pathname, metadata) => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return null;

    const items = [{
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/`,
    }];

    let accumulatedPath = '';
    segments.forEach((segment, index) => {
        accumulatedPath += `/${segment}`;
        const isLast = index === segments.length - 1;
        const product = isLast && pathname.startsWith('/products/') ? getCatalogProduct(segment) : null;
        items.push({
            '@type': 'ListItem',
            position: index + 2,
            name: product?.variety_name || breadcrumbName(segment),
            item: isLast ? metadata.canonical : `${SITE_URL}${accumulatedPath}`,
        });
    });

    return {
        '@type': 'BreadcrumbList',
        '@id': `${metadata.canonical}#breadcrumb`,
        itemListElement: items,
    };
};

export const buildStructuredData = (value = '/') => {
    const metadata = getRouteMetadata(value);
    const pathname = metadata.pathname;
    if (metadata.robots.startsWith('noindex')) return null;

    const graph = [];

    if (pathname === '/') {
        graph.push(
            {
                '@type': 'Organization',
                '@id': BUSINESS_ID,
                name: SITE_NAME,
                url: `${SITE_URL}/`,
                logo: {
                    '@type': 'ImageObject',
                    url: `${SITE_URL}/logo-256.png`,
                    width: 256,
                    height: 256,
                },
                description: 'Rice sourcing, canvassing and export-logistics support from Miryalaguda, Telangana, India.',
                telephone: '+91-9866760028',
                email: 'srinivasulu@srinivascanvassing.com',
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Miryalaguda',
                    addressRegion: 'Telangana',
                    postalCode: '508207',
                    addressCountry: 'IN',
                },
                sameAs: ['https://www.linkedin.com/in/murarishetti-srinivasulu/'],
            },
            {
                '@type': 'WebSite',
                '@id': `${SITE_URL}/#website`,
                url: `${SITE_URL}/`,
                name: SITE_NAME,
                publisher: { '@id': BUSINESS_ID },
                inLanguage: 'en-IN',
            },
            {
                '@type': 'Service',
                '@id': `${SITE_URL}/#rice-sourcing-service`,
                name: 'Bulk Rice Sourcing and Canvassing',
                serviceType: 'Rice sourcing, canvassing and trade support',
                provider: { '@id': BUSINESS_ID },
                areaServed: [
                    { '@type': 'Country', name: 'India' },
                    { '@type': 'Place', name: 'International markets' },
                ],
                url: `${SITE_URL}/`,
            },
        );
    }

    const pageType = pathname === '/about'
        ? 'AboutPage'
        : pathname === '/contact'
            ? 'ContactPage'
            : pathname === '/products'
                ? 'CollectionPage'
                : 'WebPage';

    graph.push({
        '@type': pageType,
        '@id': `${metadata.canonical}#webpage`,
        url: metadata.canonical,
        name: metadata.title,
        description: metadata.description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': BUSINESS_ID },
        inLanguage: 'en-IN',
    });

    const breadcrumb = buildBreadcrumbSchema(pathname, metadata);
    if (breadcrumb) graph.push(breadcrumb);

    const productMatch = pathname.match(/^\/products\/([^/]+)$/);
    const product = productMatch ? getCatalogProduct(productMatch[1]) : null;
    if (product) {
        graph.push({
            '@type': 'Product',
            '@id': `${metadata.canonical}#product`,
            url: metadata.canonical,
            name: product.variety_name,
            description: metadata.description,
            image: [product.image_url],
            category: 'Rice',
            additionalProperty: [
                { '@type': 'PropertyValue', name: 'Processing', value: product.processing },
                { '@type': 'PropertyValue', name: 'Moisture', value: product.moisture },
                { '@type': 'PropertyValue', name: 'Origin', value: 'Miryalaguda, Telangana, India' },
            ],
        });
    }

    return {
        '@context': 'https://schema.org',
        '@graph': graph,
    };
};

export const PUBLIC_ROUTES = Object.freeze([
    ...Object.keys(ROUTE_METADATA),
    ...PRODUCT_CATALOG.map((product) => `/products/${product.slug}`),
]);
