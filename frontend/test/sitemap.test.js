import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSitemap } from '../api/sitemap.js';

test('sitemap includes public routes and canonical product URLs', () => {
    const xml = buildSitemap([
        {
            slug: 'jsr-steem-rice',
            variety_name: 'JSR Steam Rice',
            last_updated: '2026-08-22T04:22:39.213749',
        },
        {
            slug: 'sona-masuri-steam-bpt',
            variety_name: 'Sona Masuri Steam BPT',
            last_updated: '2026-08-16T01:20:15.831928',
        },
    ]);

    assert.match(xml, /<loc>https:\/\/www\.srinivascanvassing\.com\/<\/loc>/);
    assert.match(xml, /<loc>https:\/\/www\.srinivascanvassing\.com\/products\/jsr-steam-rice<\/loc>/);
    assert.doesNotMatch(xml, /products\/jsr-steem-rice/);
    assert.match(xml, /<lastmod>2026-08-22<\/lastmod>/);
});

test('sitemap de-duplicates canonical products and escapes unsafe text', () => {
    const xml = buildSitemap([
        { slug: 'jsr-steem-rice' },
        { slug: 'jsr-steam-rice' },
        { slug: 'special-&-rice' },
    ]);

    assert.equal((xml.match(/products\/jsr-steam-rice/g) || []).length, 1);
    assert.match(xml, /products\/special-rice/);
});
