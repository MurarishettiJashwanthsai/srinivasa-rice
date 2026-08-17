import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { SkeletonCard } from '../components/SkeletonLoader';
import { OptimizedImage } from '../components/OptimizedImage';
import { API_BASE_URL } from '../config/api';
import { PRODUCT_CATALOG } from '../data/productCatalog';
import { getRateUnitShortLabel } from '../utils/rateUnits';
import { trackEvent } from '../utils/analytics';

const Products = () => {
    const [products, setProducts] = useState(PRODUCT_CATALOG);
    const [loading, setLoading] = useState(false);
    const [fetchFailed, setFetchFailed] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/products`);
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                } else {
                    setFetchFailed(true);
                }
            } catch (error) { 
                console.error('Failed to fetch products', error); 
                setFetchFailed(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const defaultImages = [
        "https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1613589973273-fae710ae1ee7?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1568051243851-f9b18bc86134?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1569470984168-3069c9b5fdef?auto=format&fit=crop&q=80&w=600"
    ];

    const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

    return (
        <div className="bg-background dark:bg-secondary pt-6 pb-16 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div {...fadeUp} className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-display font-black text-text-main dark:text-white tracking-tight mb-3 uppercase">Export Variety Catalogue</h1>
                    <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-4" />
                    <p className="max-w-2xl mx-auto text-base text-text-muted dark:text-gray-400 font-bold leading-relaxed">
                        Sourced directly from selected milling facilities in Miryalaguda. Tested for moisture, admixture, and grain purity. Available in bulk containers.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : fetchFailed ? (
                    <div className="p-8 rounded-3xl bg-surface-hover/30 border border-border text-center space-y-4 max-w-xl mx-auto">
                        <p className="text-text-muted font-bold text-base">Current product information is temporarily unavailable. Please contact us for direct availability.</p>
                        <Link to="/contact" className="button-primary inline-flex !py-3 !px-6 text-sm">Contact Canvassing Desk</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {products.map((product, index) => {
                            const pSlug = product.slug || product.variety_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            const imgSrc = product.image_url ? (product.image_url.startsWith('http') ? product.image_url : `${API_BASE_URL}/${product.image_url}`) : defaultImages[index % defaultImages.length];

                            return (
                                <GlassCard key={product.id} variant="premium" delay={index * 0.06} className="!p-0 overflow-hidden flex flex-col md:flex-row group">
                                    <div className="md:w-2/5 h-52 md:h-auto overflow-hidden relative">
                                        <OptimizedImage
                                            src={imgSrc}
                                            alt={product.variety_name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="md:w-3/5 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-xl font-display font-black text-text-main dark:text-white uppercase tracking-tight">{product.variety_name}</h3>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                                                    Export Grade
                                                </span>
                                            </div>
                                            <p className="text-text-muted dark:text-gray-400 mb-4 text-xs font-bold leading-relaxed">
                                                Miryalaguda sourced {product.variety_name} rice. 100% sortexed with verified moisture and grain specifications.
                                            </p>
                                        </div>

                                        <div className="premium-card !p-3.5 rounded-xl mb-4 !transform-none !shadow-none bg-surface-hover/30">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-text-muted dark:text-gray-400 uppercase tracking-wider">Indicative Rate (Ex-Mill)</span>
                                                <span className="text-sm font-black text-emerald bg-emerald/10 px-3 py-1 rounded-lg border border-emerald/20">
                                                    ₹{product.current_price_mt ? product.current_price_mt.toLocaleString() : 'N/A'} / {getRateUnitShortLabel(product.unit)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <Link 
                                                to={`/products/${pSlug}`} 
                                                className="w-full py-2.5 px-3 rounded-xl border border-border text-text-main dark:text-white font-bold text-xs hover:border-primary text-center flex items-center justify-center gap-1 transition-all"
                                            >
                                                <FileText className="w-3.5 h-3.5 text-primary" /> View Specs
                                            </Link>
                                            <Link 
                                                to={`/contact?product=${encodeURIComponent(product.variety_name)}`} 
                                                onClick={() => trackEvent('product_quote_click', { source_page: 'products', product_requested: product.variety_name })}
                                                className="w-full py-2.5 px-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs text-center flex items-center justify-center gap-1 transition-all"
                                            >
                                                Quote <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
