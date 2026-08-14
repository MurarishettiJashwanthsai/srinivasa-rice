import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const frontendDirectory = resolve(scriptDirectory, '..');
const distDirectory = resolve(frontendDirectory, process.env.PRERENDER_DIST_DIR || 'dist');
const template = await readFile(resolve(distDirectory, 'index.html'), 'utf8');
const serverEntryUrl = pathToFileURL(resolve(
    frontendDirectory,
    process.env.PRERENDER_SSR_DIR || 'dist-ssr',
    'entry-server.js',
)).href;
const { getPrerenderRoutes, render } = await import(serverEntryUrl);

const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const renderSeoHead = (metadata) => `
    <title>${escapeHtml(metadata.title)}</title>
    <meta name="description" content="${escapeHtml(metadata.description)}" />
    <meta name="robots" content="${escapeHtml(metadata.robots)}" />
    <link rel="canonical" href="${escapeHtml(metadata.canonical)}" />

    <meta property="og:type" content="${escapeHtml(metadata.ogType)}" />
    <meta property="og:url" content="${escapeHtml(metadata.canonical)}" />
    <meta property="og:title" content="${escapeHtml(metadata.title)}" />
    <meta property="og:description" content="${escapeHtml(metadata.description)}" />
    <meta property="og:image" content="${escapeHtml(metadata.ogImage)}" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:site_name" content="Sri Srinivasa Canvassing" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(metadata.title)}" />
    <meta name="twitter:description" content="${escapeHtml(metadata.description)}" />
    <meta name="twitter:image" content="${escapeHtml(metadata.ogImage)}" />`;

const routes = getPrerenderRoutes();

for (const route of routes) {
    const { appHtml, metadata } = render(route);
    // React 19 emits image preload links as part of renderToString. When raw HTML is
    // inserted into the Vite shell, browsers move those resource hints out of the
    // root before hydration, so keep the hydrated tree deterministic instead.
    const hydratableAppHtml = appHtml.replace(/<link rel="preload"[^>]*\/>/g, '');
    const seoHead = renderSeoHead(metadata);
    const pageHtml = template
        .replace(
            /<!-- route-seo:start -->[\s\S]*?<!-- route-seo:end -->/,
            `<!-- route-seo:start -->${seoHead}\n    <!-- route-seo:end -->`,
        )
        .replace('<div id="root"></div>', `<div id="root">${hydratableAppHtml}</div>`);

    const outputFile = route === '/'
        ? resolve(distDirectory, 'index.html')
        : resolve(distDirectory, route.slice(1), 'index.html');

    await mkdir(dirname(outputFile), { recursive: true });
    await writeFile(outputFile, pageHtml, 'utf8');
}

console.log(`Pre-rendered ${routes.length} public routes.`);
