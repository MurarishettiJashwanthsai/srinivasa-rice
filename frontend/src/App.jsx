import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LiveTicker from './components/LiveTicker';
import Home from './pages/Home';
import MobileNav from './components/MobileNav';

import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import WhatsAppWidget from './components/WhatsAppWidget';
import ScrollToTop from './components/ScrollToTop';
import SkipLink from './components/SkipLink';
import StructuredData from './components/StructuredData';
import ErrorBoundary from './components/ErrorBoundary';
import { API_BASE_URL } from './config/api';

// Lazy loaded pages for code splitting
const About = lazy(() => import('./pages/About'));
const Products = lazy(() => import('./pages/Products'));
const Packaging = lazy(() => import('./pages/Packaging'));
const Certifications = lazy(() => import('./pages/Certifications'));
const Contact = lazy(() => import('./pages/Contact'));
const Legal = lazy(() => import('./pages/Legal'));
const MarketDashboard = lazy(() => import('./pages/MarketDashboard'));
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

function App() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/products`)
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => setProducts(data))
            .catch(() => {});
    }, []);

    return (
        <Router>
            <SkipLink />
            <ScrollToTop />
            <StructuredData products={products} />
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
                {/* ── Standalone: Digital Card (no Navbar/Footer) ── */}
                <Route path="/card/:slug" element={
                    <Suspense fallback={<PageLoader />}>
                        <DigitalCard />
                    </Suspense>
                } />

                {/* ── Full layout: all other pages ── */}
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
                                        <Route path="/packaging" element={<Packaging />} />
                                        <Route path="/certifications" element={<Certifications />} />
                                        <Route path="/market-rates" element={<MarketDashboard />} />
                                        <Route path="/contact" element={<Contact />} />
                                        <Route path="/legal" element={<Legal />} />
                                        <Route path="/admin/login" element={<AdminLogin />} />
                                        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                                        <Route path="/admin/crm" element={<ProtectedRoute><WhatsAppCRM /></ProtectedRoute>} />
                                        <Route path="/admin/cards" element={<ProtectedRoute><CardEditor /></ProtectedRoute>} />
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
        </Router>
    );
}

export default App;
