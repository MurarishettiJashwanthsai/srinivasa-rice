/* global process */

const SITE_URL = 'https://www.srinivascanvassing.com';
const DEFAULT_PRODUCTS_API = 'https://srinivasa-rice.onrender.com/api/products';
const CANONICAL_PRODUCT_SLUGS = new Map([
    ['jsr-steem-rice', 'jsr-steam-rice'],
]);

const PUBLIC_ROUTES = [
    ['/', 'daily', '1.0'],
    ['/about', 'monthly', '0.8'],
    ['/products', 'daily', '0.9'],
    ['/market-rates', 'daily', '0.9'],
    ['/packaging', 'monthly', '0.7'],
    ['/certifications', 'monthly', '0.7'],
    ['/contact', 'monthly', '0.8'],
    ['/legal', 'yearly', '0.3'],
];

const escapeXml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const slugify = (value) => String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const sitemapEntry = ({ url, changefreq, priority, lastmod }) => {
    const lastModified = /^\d{4}-\d{2}-\d{2}$/.test(lastmod || '')
        ? `<lastmod>${lastmod}</lastmod>`
        : '';
    return `  <url><loc>${escapeXml(url)}</loc>${lastModified}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
};

export const buildSitemap = (products) => {
    const entries = PUBLIC_ROUTES.map(([path, changefreq, priority]) => sitemapEntry({
        url: path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`,
        changefreq,
        priority,
    }));
    const includedSlugs = new Set();

    for (const product of products) {
        const sourceSlug = slugify(product?.slug || product?.variety_name);
        const slug = CANONICAL_PRODUCT_SLUGS.get(sourceSlug) || sourceSlug;
        if (!slug || includedSlugs.has(slug)) continue;
        includedSlugs.add(slug);
        entries.push(sitemapEntry({
            url: `${SITE_URL}/products/${slug}`,
            lastmod: String(product?.last_updated || '').slice(0, 10),
            changefreq: 'weekly',
            priority: '0.8',
        }));
    }

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...entries,
        '</urlset>',
        '',
    ].join('\n');
};

export default async function handler(_request, response) {
    const productsApi = process.env.SITEMAP_PRODUCTS_API_URL || DEFAULT_PRODUCTS_API;

    try {
        const upstream = await fetch(productsApi, {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(8000),
        });
        if (!upstream.ok) throw new Error(`Product API returned ${upstream.status}`);

        const products = await upstream.json();
        if (!Array.isArray(products)) throw new Error('Product API did not return a list');

        response.setHeader('Content-Type', 'application/xml; charset=utf-8');
        response.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
        return response.status(200).send(buildSitemap(products));
    } catch (error) {
        console.error('Unable to generate sitemap', error);
        response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        response.setHeader('Cache-Control', 'no-store');
        response.setHeader('Retry-After', '300');
        return response.status(503).send('Sitemap temporarily unavailable');
    }
}
