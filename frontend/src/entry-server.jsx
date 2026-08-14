import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppContent } from './App';
import { PUBLIC_ROUTES, getRouteMetadata } from './seo/siteSeo';

export const getPrerenderRoutes = () => PUBLIC_ROUTES;

export const render = (url) => ({
    appHtml: renderToString(
        <ThemeProvider>
            <StaticRouter location={url}>
                <AppContent />
            </StaticRouter>
        </ThemeProvider>,
    ),
    metadata: getRouteMetadata(url),
});
