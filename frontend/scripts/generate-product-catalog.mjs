import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const frontendDirectory = resolve(scriptDirectory, '..');
const outputFile = resolve(frontendDirectory, 'src/data/generatedProductCatalog.js');
const productsApi = process.env.PRODUCTS_API_URL || 'https://srinivasa-rice.onrender.com/api/products';
const allowFallback = process.env.ALLOW_STATIC_PRODUCT_FALLBACK === 'true';

const slugify = (value) => String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const allowedFields = [
    'id', 'variety_name', 'slug', 'grade', 'current_price_mt', 'previous_price_mt',
    'percentage_change', 'trend', 'currency', 'unit', 'price_basis', 'market_location',
    'public_note', 'last_updated', 'image_url', 'moisture', 'processing', 'status',
];

try {
    const response = await fetch(productsApi, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) throw new Error(`Product API returned ${response.status}`);

    const products = await response.json();
    if (!Array.isArray(products) || products.length === 0) {
        throw new Error('Product API returned no published products');
    }

    const normalizedProducts = products
        .filter((product) => product && product.status !== 'archived')
        .map((product) => {
            const safeProduct = {};
            for (const key of allowedFields) {
                if (product[key] !== undefined && product[key] !== null) safeProduct[key] = product[key];
            }
            safeProduct.slug = slugify(safeProduct.slug || safeProduct.variety_name);
            safeProduct.status = 'published';
            return safeProduct;
        })
        .filter((product) => product.slug && product.variety_name)
        .sort((first, second) => first.slug.localeCompare(second.slug));

    if (normalizedProducts.length === 0) throw new Error('No valid published products were returned');

    const content = [
        '// Generated during the build from the published product API. Do not edit manually.',
        `export const GENERATED_PRODUCT_CATALOG = Object.freeze(${JSON.stringify(normalizedProducts, null, 4)});`,
        '',
    ].join('\n');
    await writeFile(outputFile, content, 'utf8');
    console.log(`Generated product catalogue with ${normalizedProducts.length} published products.`);
} catch (error) {
    if (allowFallback) {
        console.warn(`Product catalogue generation skipped: ${error.message}`);
    } else {
        throw new Error(`Cannot generate all public product pages: ${error.message}`);
    }
}
