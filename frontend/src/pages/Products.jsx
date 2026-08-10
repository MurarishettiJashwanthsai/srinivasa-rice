import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { SkeletonCard } from '../components/SkeletonLoader';
import useMeta from '../hooks/useMeta';

const Products = () => {
    useMeta({
        title: 'Bulk Rice Varieties for Export',
        description: 'View available Sona Masuri, RNR and JSR rice varieties, specifications and packaging options.',
    });

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://srinivasa-rice.onrender.com'}/api/products`);
                if (response.ok) setProducts(await response.json());
            } catch (error) { console.error('Failed to fetch products', error); }
            finally { setLoading(false); }
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
        <div className="bg-background dark:bg-secondary pt-6 pb-10 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div {...fadeUp} className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-display font-extrabold text-text-main dark:text-white tracking-tight mb-3">Our Premium Catalog</h1>
                    <div className="w-12 h-1 bg-primary mx-auto rounded-full mb-4" />
                    <p className="max-w-xl mx-auto text-base text-text-muted dark:text-gray-400">Sourced directly from certified millers in Miryalaguda. Available in bulk quantities for immediate export.</p>
                </motion.div>

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {products.map((product, index) => (
                            <GlassCard key={product.id} variant="premium" delay={index * 0.08} className="!p-0 overflow-hidden flex flex-col md:flex-row group">
                                <div className="md:w-2/5 h-48 md:h-auto overflow-hidden">
                                    <img
                                        src={product.image_url ? (product.image_url.startsWith('http') ? product.image_url : `${import.meta.env.VITE_API_URL || 'https://srinivasa-rice.onrender.com'}/${product.image_url}`) : defaultImages[index % defaultImages.length]}
                                        alt={product.variety_name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="md:w-3/5 p-6 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-2xl font-display font-bold text-text-main dark:text-white mb-2">{product.variety_name}</h3>
                                        <p className="text-text-muted dark:text-gray-400 mb-4 text-sm leading-relaxed">Premium quality {product.variety_name} rice ready for global export. Contact us for detailed COA and exact specifications.</p>
                                    </div>
                                    <div className="premium-card !p-4 rounded-xl mb-4 !transform-none !shadow-none">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Live Estimate</h4>
                                            <span className="text-sm font-bold text-emerald bg-emerald/10 px-3 py-1 rounded-lg border border-emerald/20">₹{product.current_price_mt.toFixed(2)} / MT</span>
                                        </div>
                                    </div>
                                    <Link to="/contact" className="block text-center w-full bg-secondary dark:bg-primary hover:bg-secondary-dark dark:hover:bg-primary-dark text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                                        Request Specs & Final Quote
                                    </Link>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
