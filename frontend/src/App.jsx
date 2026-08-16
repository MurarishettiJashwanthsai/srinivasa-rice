import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import AdminHeader from './components/AdminHeader';
import Footer from './components/Footer';
import LiveTicker from './components/LiveTicker';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Packaging from './pages/Packaging';
import Certifications from './pages/Certifications';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import MarketDashboard from './pages/MarketDashboard';
import MobileNav from './components/MobileNav';

import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import WhatsAppWidget from './components/WhatsAppWidget';
import ScrollToTop from './components/ScrollToTop';
import SkipLink from './components/SkipLink';
import StructuredData from './components/StructuredData';
import ErrorBoundary from './components/ErrorBoundary';
import Analytics from './components/Analytics';

// Admin-only pages remain code split; public pages are synchronously renderable at build time.
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const WhatsAppCRM = lazy(() => import('./pages/WhatsAppCRM'));
const DigitalCard = lazy(() => import('./pages/DigitalCard'));
const CardEditor = lazy(() => import('./pages/CardEditor'));

// Loading fallback
const PageLoader = () => (
    <div className="min-h-[60vh] flex items-center justify-center" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-text-muted font-medium">Retrieving page content...</p>
        </div>
    </div>
);

const AdminPage = ({ children }) => (
    <div className="min-h-screen bg-background font-sans">
        <AdminHeader />
        <main id="main-content" tabIndex="-1">
            <ErrorBoundary fallbackTitle="Administrative Page Unavailable">
                <Suspense fallback={<PageLoader />}>{children}</Suspense>
            </ErrorBoundary>
        </main>
    </div>
);

export function AppContent() {
    return (
        <>
            <SkipLink />
            <ScrollToTop />
            <StructuredData />
            <Analytics />
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        borderRadius: '12px',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(16px)',
                        color: 'inherit',
                        border: '1px solid var(--glass-border)',
                    },
                }}
            />
            <Routes>
                {/* ── Standalone: Digital Business Card (no Navbar/Footer) ── */}
                <Route path="/card/:slug" element={
                    <Suspense fallback={<PageLoader />}>
                        <DigitalCard />
                    </Suspense>
                } />

                {/* ── Standalone admin portal: intentionally excludes public navigation and widgets ── */}
                <Route path="/admin/login" element={<AdminPage><AdminLogin /></AdminPage>} />
                <Route path="/admin" element={<AdminPage><ProtectedRoute><AdminDashboard /></ProtectedRoute></AdminPage>} />
                <Route path="/admin/crm" element={<AdminPage><ProtectedRoute><WhatsAppCRM /></ProtectedRoute></AdminPage>} />
                <Route path="/admin/cards" element={<AdminPage><ProtectedRoute><CardEditor /></ProtectedRoute></AdminPage>} />

                {/* ── Public website layout ── */}
                <Route path="*" element={
                    <div className="min-h-screen flex flex-col font-sans relative">
                        <LiveTicker />
                        <Navbar />
                        <main id="main-content" className="flex-grow pb-16 lg:pb-0" tabIndex="-1">
                            <ErrorBoundary fallbackTitle="Page Section Unavailable">
                                <Suspense fallback={<PageLoader />}>
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/about" element={<About />} />
                                        <Route path="/products" element={<Products />} />
                                        <Route path="/products/:slug" element={<ProductDetail />} />
                                        <Route path="/packaging" element={<Packaging />} />
                                        <Route path="/certifications" element={<Certifications />} />
                                        <Route path="/market-rates" element={<MarketDashboard />} />
                                        <Route path="/contact" element={<Contact />} />
                                        <Route path="/legal" element={<Legal />} />
                                    </Routes>
                                </Suspense>
                            </ErrorBoundary>
                        </main>
                        <WhatsAppWidget />
                        <MobileNav />
                        <Footer />
                    </div>
                } />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;
