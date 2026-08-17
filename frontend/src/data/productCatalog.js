import { GENERATED_PRODUCT_CATALOG } from './generatedProductCatalog';

const FALLBACK_CATALOG_PRODUCTS = [
    {
        id: 'catalog-sona-masuri-steam-bpt',
        slug: 'sona-masuri-steam-bpt',
        variety_name: 'Sona Masuri Steam (BPT)',
        current_price_mt: 5500,
        price_basis: 'EX_MILL',
        currency: 'INR',
        unit: 'MT',
        processing: '100% Sortexed',
        moisture: '12-14% Max',
        status: 'published',
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'catalog-sona-masuri-raw-bpt',
        slug: 'sona-masuri-raw-bpt',
        variety_name: 'Sona Masuri Raw (BPT)',
        current_price_mt: 5600,
        price_basis: 'EX_MILL',
        currency: 'INR',
        unit: 'MT',
        processing: '100% Sortexed',
        moisture: '12-14% Max',
        status: 'published',
        image_url: 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'catalog-lachikari-raw-rice-jsr',
        slug: 'lachikari-raw-rice-jsr',
        variety_name: 'Lachikari Raw Rice (JSR)',
        current_price_mt: 7900,
        price_basis: 'EX_MILL',
        currency: 'INR',
        unit: 'MT',
        processing: '100% Sortexed',
        moisture: '12-14% Max',
        status: 'published',
        image_url: 'https://images.unsplash.com/photo-1613589973273-fae710ae1ee7?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'catalog-rnr-steam',
        slug: 'rnr-steam',
        variety_name: 'RNR Steam Rice',
        current_price_mt: 5950,
        price_basis: 'EX_MILL',
        currency: 'INR',
        unit: 'MT',
        processing: '100% Sortexed',
        moisture: '12-14% Max',
        status: 'published',
        image_url: 'https://images.unsplash.com/photo-1568051243851-f9b18bc86134?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'catalog-jsr-steam-rice',
        slug: 'jsr-steam-rice',
        variety_name: 'JSR Steam Rice',
        current_price_mt: 6470,
        price_basis: 'EX_MILL',
        currency: 'INR',
        unit: 'MT',
        processing: '100% Sortexed',
        moisture: '12-14% Max',
        status: 'published',
        image_url: 'https://images.unsplash.com/photo-1569470984168-3069c9b5fdef?auto=format&fit=crop&q=80&w=800',
    },
];

const CATALOG_PRODUCTS = GENERATED_PRODUCT_CATALOG.length > 0
    ? GENERATED_PRODUCT_CATALOG
    : FALLBACK_CATALOG_PRODUCTS;

export const PRODUCT_CATALOG = Object.freeze(CATALOG_PRODUCTS.map((product) => Object.freeze(product)));

export const PRODUCT_ALIASES = Object.freeze({
    'jsr-steem-rice': 'jsr-steam-rice',
    'sona-masuri-steam': 'sona-masuri-steam-bpt',
    'sona-masuri-raw': 'sona-masuri-raw-bpt',
});

export const slugifyProductName = (text = '') => text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

export const canonicalProductSlug = (slug = '') => {
    const normalized = slug.toLowerCase().trim();
    return PRODUCT_ALIASES[normalized] || normalized;
};

export const getCatalogProduct = (slug = '') => {
    const canonicalSlug = canonicalProductSlug(slug);
    return PRODUCT_CATALOG.find((product) => product.slug === canonicalSlug) || null;
};
