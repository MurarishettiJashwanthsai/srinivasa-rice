import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, MapPin, Package, Truck, Calendar, DollarSign, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { OptimizedImage } from '../components/OptimizedImage';
import useMeta from '../hooks/useMeta';
import { API_BASE_URL } from '../config/api';

const SEEDED_VARIETIES_CATALOG = {
    'sona-masuri-steam-bpt': { variety_name: 'Sona Masuri Steam(BPT)', current_price_mt: 5500.0, price_basis: 'EX_MILL', currency: 'INR', unit: 'MT', processing: '100% Sortexed', moisture: '12-14% Max', status: 'published', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800' },
    'sona-masuri-raw-bpt': { variety_name: 'Sona Masuri Raw(BPT)', current_price_mt: 5600.0, price_basis: 'EX_MILL', currency: 'INR', unit: 'MT', processing: '100% Sortexed', moisture: '12-14% Max', status: 'published', image_url: 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&q=80&w=800' },
    'lachikari-raw-rice-jsr': { variety_name: 'Lachikari Raw Rice(JSR)', current_price_mt: 7900.0, price_basis: 'EX_MILL', currency: 'INR', unit: 'MT', processing: '100% Sortexed', moisture: '12-14% Max', status: 'published', image_url: 'https://images.unsplash.com/photo-1613589973273-fae710ae1ee7?auto=format&fit=crop&q=80&w=800' },
    'rnr-steam': { variety_name: 'RNR Steam', current_price_mt: 5950.0, price_basis: 'EX_MILL', currency: 'INR', unit: 'MT', processing: '100% Sortexed', moisture: '12-14% Max', status: 'published', image_url: 'https://images.unsplash.com/photo-1568051243851-f9b18bc86134?auto=format&fit=crop&q=80&w=800' },
    'jsr-steam-rice': { variety_name: 'JSR Steam Rice', current_price_mt: 6470.0, price_basis: 'EX_MILL', currency: 'INR', unit: 'MT', processing: '100% Sortexed', moisture: '12-14% Max', status: 'published', image_url: 'https://images.unsplash.com/photo-1569470984168-3069c9b5fdef?auto=format&fit=crop&q=80&w=800' },
    'jsr-steem-rice': { variety_name: 'JSR Steam Rice', current_price_mt: 6470.0, price_basis: 'EX_MILL', currency: 'INR', unit: 'MT', processing: '100% Sortexed', moisture: '12-14% Max', status: 'published', image_url: 'https://images.unsplash.com/photo-1569470984168-3069c9b5fdef?auto=format&fit=crop&q=80&w=800' },
    'sona-masuri-steam': { variety_name: 'Sona Masuri Steam(BPT)', current_price_mt: 5500.0, price_basis: 'EX_MILL', currency: 'INR', unit: 'MT', processing: '100% Sortexed', moisture: '12-14% Max', status: 'published', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800' },
    'sona-masuri-raw': { variety_name: 'Sona Masuri Raw(BPT)', current_price_mt: 5600.0, price_basis: 'EX_MILL', currency: 'INR', unit: 'MT', processing: '100% Sortexed', moisture: '12-14% Max', status: 'published', image_url: 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&q=80&w=800' },
};

const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

const ProductDetail = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useMeta({
        title: product ? `${product.variety_name} Rice Specifications — Export Quality` : 'Rice Variety Specifications',
        description: product ? `Technical specifications, moisture content, sortexing and bulk export quote for ${product.variety_name} rice from Miryalaguda.` : 'View bulk export specifications for Indian rice varieties.',
    });

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError(false);
            const normSlug = slug ? slug.toLowerCase().trim() : '';

            // Tier 1: Try direct API slug endpoint
            try {
                const response = await fetch(`${API_BASE_URL}/api/products/slug/${normSlug}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.warn('Direct slug API call failed, trying product list fallback...', err);
            }

            // Tier 2: Try fetching full product list and matching slug locally
            try {
                const listResponse = await fetch(`${API_BASE_URL}/api/products`);
                if (listResponse.ok) {
                    const productsList = await listResponse.json();
                    const matched = productsList.find(p => p.slug === normSlug || slugify(p.variety_name) === normSlug);
                    if (matched) {
                        setProduct(matched);
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.warn('Product list API call failed, trying static catalog fallback...', err);
            }

            // Tier 3: Check static fallback catalog for standard varieties
            if (SEEDED_VARIETIES_CATALOG[normSlug]) {
                setProduct(SEEDED_VARIETIES_CATALOG[normSlug]);
                setError(false);
            } else {
                setError(true);
            }
            setLoading(false);
        };

        if (slug) fetchProduct();
    }, [slug]);

    const fadeUp = {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-background" aria-live="polite">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm font-bold text-text-muted">Retrieving current product specification…</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-background px-4 text-center">
                <div className="max-w-md space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 font-bold">
                        !
                    </div>
                    <h1 className="text-2xl font-display font-bold text-text-main uppercase">Specification Unavailable</h1>
                    <p className="text-text-muted font-bold text-sm leading-relaxed">
                        Current product information is temporarily unavailable or requires custom verification. Please contact our Miryalaguda desk for immediate assistance.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/products" className="button-primary !py-3 !px-6 text-sm">
                            Back to Product Catalogue
                        </Link>
                        <Link to="/contact" className="px-6 py-3 rounded-xl border border-border text-text-main font-bold text-sm hover:border-primary transition-all">
                            Contact Canvassing Desk
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const varietyName = product?.variety_name || 'Rice Variety';

    const specs = [
        { label: 'Process Type', value: product?.processing || '100% Sortexed Steam / Raw' },
        { label: 'Moisture Content', value: product?.moisture || '12-14% Max' },
        { label: 'Broken Percentage', value: varietyName.includes('Broken') ? (varietyName.includes('25%') ? '25% Broken' : '5% Broken') : '5% Max (Export Grade)' },
        { label: 'Foreign Matter / Admixture', value: '0.1% Max' },
        { label: 'Crop Year', value: 'Current Season Crop' },
        { label: 'Origin', value: 'Miryalaguda, Telangana, India' },
        { label: 'Minimum Order Quantity', value: '25 Metric Tons (1 x 20ft Container)' },
        { label: 'Packaging Options', value: '26kg, 50kg PP Bags / Non-Woven / Jute' },
        { label: 'Pre-shipment Inspection', value: 'SGS / Geo-Chem / Intertek COA' },
        { label: 'Loading Ports', value: 'Krishnapatnam Port / Kakinada / Chennai' },
    ];

    return (
        <div className="bg-background py-10 md:py-16 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation Breadcrumb */}
                <motion.div {...fadeUp} className="mb-8">
                    <Link to="/products" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Products
                    </Link>
                </motion.div>

                {/* Hero Product Header Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-16">
                    {/* Left: Product Image */}
                    <motion.div {...fadeUp} className="lg:col-span-5">
                        <div className="rounded-3xl overflow-hidden shadow-2xl border border-border/40 relative">
                            <OptimizedImage
                                src={product?.image_url}
                                alt={varietyName}
                                className="w-full h-80 sm:h-96 object-cover"
                                priority={true}
                                aspectRatio="4/3"
                            />
                            <div className="absolute top-4 left-4 px-4 py-1.5 rounded-xl bg-background/90 backdrop-blur-md border border-border text-primary text-xs font-black tracking-wider uppercase shadow-md">
                                {product?.status === 'published' ? 'Active Export Stock' : 'Indicative Grade'}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Info & Pricing */}
                    <motion.div {...fadeUp} className="lg:col-span-7 space-y-6">
                        <div>
                            <span className="text-xs font-black text-primary uppercase tracking-[0.25em] block mb-2">
                                Miryalaguda Canvassed Variety
                            </span>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-text-main tracking-tight uppercase">
                                {varietyName}
                            </h1>
                        </div>

                        <p className="text-text-muted font-bold text-base md:text-lg leading-relaxed">
                            Premium export quality {varietyName} sourced directly through deep mill relationships in Nalgonda district. Tested for consistent grain length, optimal moisture, and zero discoloration.
                        </p>

                        {/* Price Card */}
                        <div className="premium-card !p-6 rounded-2xl border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-black text-text-muted uppercase tracking-wider block mb-1">
                                    Indicative Market Rate ({product?.price_basis || 'EX_MILL'} Miryalaguda)
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-display font-black text-emerald">
                                        ₹{product?.current_price_mt ? Number(product.current_price_mt).toLocaleString() : 'N/A'}
                                    </span>
                                    <span className="text-xs font-black text-text-muted">/ {product?.unit || 'MT'} ({product?.currency || 'INR'})</span>
                                </div>
                                <p className="text-[10px] font-black text-text-subtle uppercase tracking-widest mt-1">
                                    Rates subject to daily market fluctuations. Contact for binding quotation.
                                </p>
                            </div>

                            <Link
                                to={`/contact?product=${encodeURIComponent(varietyName)}`}
                                className="button-primary !py-3.5 !px-6 text-sm whitespace-nowrap text-center"
                            >
                                Request Proforma Quote
                            </Link>
                        </div>

                        {/* Quick Trust Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                            <div className="p-3.5 rounded-xl bg-surface-hover/30 border border-border/30 flex items-center gap-2.5">
                                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                                <span className="text-xs font-black text-text-main">IEC & GST Registered Trade</span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-surface-hover/30 border border-border/30 flex items-center gap-2.5">
                                <Package className="w-5 h-5 text-primary shrink-0" />
                                <span className="text-xs font-black text-text-main">Custom Bag Printing</span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-surface-hover/30 border border-border/30 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                                <Truck className="w-5 h-5 text-primary shrink-0" />
                                <span className="text-xs font-black text-text-main">Port Logistics Support</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Technical Specifications Section */}
                <motion.div {...fadeUp} className="mb-16">
                    <h2 className="text-2xl font-display font-black text-text-main uppercase tracking-tight mb-6 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary" /> Technical Grain Specifications
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specs.map((spec) => (
                            <div key={spec.label} className="p-4 rounded-xl bg-surface dark:bg-secondary-light/20 border border-border/30 flex justify-between items-center gap-4">
                                <span className="text-xs font-black text-text-muted uppercase tracking-wider">{spec.label}</span>
                                <span className="text-sm font-black text-text-main text-right">{spec.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400">
                        Notice: Technical specs can be customized according to buyer contract specifications (moisture levels, broken %, sortex degree). Contact us for verified COA.
                    </div>
                </motion.div>

                {/* Action CTA */}
                <motion.div {...fadeUp} className="text-center py-10 border-t border-border/40">
                    <h3 className="text-xl font-display font-black text-text-main uppercase mb-3">Ready to Place a Bulk Order?</h3>
                    <p className="text-text-muted font-bold text-sm max-w-lg mx-auto mb-6">
                        Specify destination port, packaging requirement, and target tonnage to get an official proforma invoice.
                    </p>
                    <Link to={`/contact?product=${encodeURIComponent(varietyName)}`} className="button-primary !py-4 !px-10 text-base">
                        Get Instant Quotation
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default ProductDetail;
