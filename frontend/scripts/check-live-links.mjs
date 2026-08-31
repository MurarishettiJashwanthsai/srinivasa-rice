const siteUrl = (process.env.SITE_URL || 'https://www.srinivascanvassing.com').replace(/\/$/, '');
const canonicalProductSlugs = new Map([
    ['jsr-steem-rice', 'jsr-steam-rice'],
]);

const canonicalProductUrl = (product) => {
    const slug = String(product?.slug || '').trim().toLowerCase();
    const canonicalSlug = canonicalProductSlugs.get(slug) || slug;
    return `${siteUrl}/products/${canonicalSlug}`;
};

const fetchChecked = async (url, options = {}) => {
    const response = await fetch(url, { redirect: 'follow', ...options });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
    return response;
};

const sitemapResponse = await fetchChecked(`${siteUrl}/sitemap.xml`);
const sitemapXml = await sitemapResponse.text();
const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

if (urls.length === 0) throw new Error('The sitemap contains no URLs');
if (!urls.some((url) => url.includes('/products/'))) throw new Error('The sitemap contains no product-detail URLs');

const productsResponse = await fetchChecked(`${siteUrl}/api/products`);
const products = await productsResponse.json();
if (!Array.isArray(products)) throw new Error('The products API did not return a list');
for (const product of products) {
    const productUrl = canonicalProductUrl(product);
    if (!urls.includes(productUrl)) throw new Error(`Published product is missing from sitemap: ${productUrl}`);
}

const failures = [];
for (let index = 0; index < urls.length; index += 6) {
    const batch = urls.slice(index, index + 6);
    await Promise.all(batch.map(async (url) => {
        try {
            const response = await fetch(url, { redirect: 'follow' });
            if (!response.ok) failures.push(`${response.status}: ${url}`);
            if (response.url.startsWith(siteUrl) && response.url !== url && ![301, 308].includes(response.status)) {
                failures.push(`Unexpected final URL ${response.url}: ${url}`);
            }
        } catch (error) {
            failures.push(`${error.message}: ${url}`);
        }
    }));
}

const robotsResponse = await fetchChecked(`${siteUrl}/robots.txt`);
const robotsText = await robotsResponse.text();
if (!robotsText.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) failures.push('robots.txt does not reference the canonical sitemap');

const adminResponse = await fetchChecked(`${siteUrl}/admin`, { method: 'HEAD' });
if (!adminResponse.headers.get('x-robots-tag')?.includes('noindex')) failures.push('/admin is missing the noindex X-Robots-Tag header');

if (failures.length > 0) {
    throw new Error(`Live-site validation failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
}

console.log(`Validated ${urls.length} sitemap URLs, robots.txt, and admin noindex headers.`);
