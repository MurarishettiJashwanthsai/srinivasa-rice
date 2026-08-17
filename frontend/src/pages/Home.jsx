import { useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe2, ShieldCheck, Box, MessageCircle, Send, TrendingUp, TrendingDown, Minus, Truck, Users, Wheat, ChevronRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import GlassCard from '../components/GlassCard';
import OptimizedImage from '../components/OptimizedImage';
import { countries } from '../data/countries';
import { API_BASE_URL } from '../config/api';
import { PRODUCT_CATALOG } from '../data/productCatalog';
import { getRateUnitShortLabel } from '../utils/rateUnits';
import { trackEvent } from '../utils/analytics';
import TurnstileWidget from '../components/TurnstileWidget';
import { validateNationalPhoneNumber } from '../utils/phoneValidation';

const Home = () => {
    const [name, setName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [loading, setLoading] = useState(false);
    const [subscriptionReference, setSubscriptionReference] = useState('');
    const [alertConsent, setAlertConsent] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState('');
    const [products, setProducts] = useState(PRODUCT_CATALOG);
    const handleTurnstileToken = useCallback((token) => setTurnstileToken(token), []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/products`);
                if (res.ok) setProducts(await res.json());
            } catch (e) { console.error(e); }
        };
        fetchProducts();
        const interval = setInterval(fetchProducts, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const phoneValidation = validateNationalPhoneNumber(countryCode, whatsapp);
            if (!phoneValidation.valid) {
                toast.error(phoneValidation.message);
                trackEvent('price_alert_form_failure', { source_page: 'price-alert', error_type: 'phone_validation' });
                return;
            }
            const fullNumber = phoneValidation.fullNumber;
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name, 
                    company: "Price Alert Subscriber", 
                    whatsapp: fullNumber, 
                    inquiry: `Subscribed to Daily WhatsApp Price Alerts (Country: ${countryCode})`,
                    privacy_consent: alertConsent,
                    marketing_consent: true,
                    turnstile_token: turnstileToken || null,
                    source_page: 'price-alert'
                })
            });
            if (response.ok) {
                const data = await response.json();
                if (!data.request_id) throw new Error('Missing subscription reference');
                setSubscriptionReference(data.request_id);
                toast.success(`Subscribed successfully. Reference: ${data.request_id}`);
                trackEvent('price_alert_form_success', {
                    request_id: data.request_id,
                    notification_status: data.notification_status || 'unknown',
                    source_page: 'price-alert'
                });
                window.dispatchEvent(new CustomEvent('lead:submitted', {
                    detail: {
                        requestId: data.request_id,
                        notificationStatus: data.notification_status || 'unknown',
                        sourcePage: 'price-alert'
                    }
                }));
                setName('');
                setWhatsapp('');
            } else {
                trackEvent('price_alert_form_failure', { source_page: 'price-alert', error_type: `http_${response.status}` });
                toast.error('Failed to subscribe. Please try again.');
            }
        } catch {
            trackEvent('price_alert_form_failure', { source_page: 'price-alert', error_type: 'network' });
            toast.error('Network error. Please try again later.');
        }
        finally { setLoading(false); }
    };

    const defaultImages = [
        "https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1613589973273-fae710ae1ee7?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1568051243851-f9b18bc86134?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1569470984168-3069c9b5fdef?auto=format&fit=crop&q=80&w=400"
    ];

    const features = [
        { icon: ShieldCheck, title: 'Documented Quality', desc: 'IEC & GST registered. Inspection and quality documents are arranged according to the final order requirements.' },
        { icon: Globe2, title: 'Worldwide Export', desc: 'Krishnapatnam & Chennai ports with efficient global logistics network.' },
        { icon: Box, title: 'Custom Packaging', desc: '26kg, 50kg PP bags and customizable bulk packaging for importers.' },
        { icon: Truck, title: 'Fast Logistics', desc: 'Strategic location with direct port connectivity for rapid shipments.' },
    ];

    const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } };

    return (
        <div className="overflow-hidden bg-background">
            {/* ═══ HERO SECTION ═══ */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden font-display transition-colors duration-500" id="hero">
                {/* ═══ BACKGROUND ═══ */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=75&w=1920"
                        alt="Miryalaguda Rice Grains Processing" 
                        width="1920"
                        height="1280"
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover opacity-30 dark:opacity-40 grayscale-[0.5] dark:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-background/40 dark:bg-black/60" />
                </div>

                {/* ═══ CONTENT ═══ */}
                <div className="relative z-10 max-w-[95vw] lg:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center mt-[-5vh]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="mb-6 select-none">
                            <span className="block text-2xl md:text-3xl lg:text-4xl font-bold text-text-main mb-2">
                                Canvassing & Export Merchant Desk
                            </span>
                            <span className="block text-3xl md:text-5xl lg:text-[4.5rem] font-black text-text-main w-full mx-auto leading-tight tracking-tight uppercase">
                                Bulk Rice Sourcing <br className="hidden lg:block" /> from Miryalaguda, India
                            </span>
                        </h1>

                        <p className="text-sm md:text-base lg:text-lg text-text-muted max-w-3xl mx-auto mb-10 font-bold leading-relaxed">
                            Sona Masuri, RNR and JSR rice sourced from selected Telangana mills with quality inspection, custom packaging, and export-logistics support.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                            <Link to="/contact" className="button-primary w-full sm:w-auto">
                                Request Bulk Quote <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/products" className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-border bg-card text-text-main font-bold hover:border-primary transition-all">
                                View Rice Specifications
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══ WHATSAPP PRICE ALERT ═══ */}
            <section className="py-20 px-4">
                <motion.div {...fadeUp} className="max-w-6xl mx-auto relative overflow-hidden rounded-3xl premium-card !bg-primary/5 border-primary/10">
                    <div className="relative z-10 px-6 sm:px-10 py-16 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-black mb-6 uppercase tracking-widest">
                            <MessageCircle className="w-4 h-4" /> Live Market Intelligence
                        </div>
                        <h2 className="text-3xl md:text-5xl font-display font-black text-text-main mb-4 leading-tight uppercase">Daily Miryalaguda Market Rates</h2>
                        <p className="text-text-muted text-lg max-w-2xl mx-auto mb-10 font-bold">Receive the latest indicative market rates and availability updates directly to your WhatsApp.</p>
                        
                        <form onSubmit={handleSubscribe} method="POST" className="max-w-4xl mx-auto space-y-4">
                            <div className="flex flex-col lg:flex-row gap-3 justify-center items-stretch">
                            <div className="text-left space-y-1 lg:w-48">
                                <label htmlFor="alert-name" className="sr-only">Full Name</label>
                                <input 
                                    id="alert-name"
                                    name="name"
                                    type="text" 
                                    required 
                                    maxLength="100"
                                    autoComplete="name"
                                    placeholder="Your Name" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    className="input-premium w-full !bg-black/20" 
                                />
                            </div>
                            <div className="flex flex-row gap-2 lg:flex-grow text-left">
                                <div className="relative w-24 sm:w-32 shrink-0">
                                    <label htmlFor="alert-country" className="sr-only">Country Code</label>
                                    <select 
                                        id="alert-country"
                                        name="country_code"
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="input-premium h-full pl-4 pr-8 py-4 !bg-black/20 font-black cursor-pointer appearance-none text-sm"
                                        aria-label="Country Dial Code"
                                    >
                                        {countries.map((c) => (
                                            <option key={`${c.name}-${c.code}`} value={c.code} className="bg-secondary text-white">
                                                {c.flag} {c.code}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronRight className="w-4 h-4 text-primary rotate-90" />
                                    </div>
                                </div>
                                <div className="flex-grow min-w-[200px]">
                                    <label htmlFor="alert-whatsapp" className="sr-only">WhatsApp Number</label>
                                    <input 
                                        id="alert-whatsapp"
                                        name="whatsapp"
                                        type="tel" 
                                        required 
                                        maxLength="20"
                                        autoComplete="tel-national"
                                        placeholder="WhatsApp Number" 
                                        value={whatsapp} 
                                        onChange={(e) => setWhatsapp(e.target.value)} 
                                        className="input-premium w-full !bg-black/20" 
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="button-primary lg:w-48 shrink-0">
                                {loading ? '...' : <><span>Get Alerts</span><Send className="w-4 h-4" /></>}
                            </button>
                            </div>
                            <label className="flex items-start justify-center gap-2 text-left text-xs font-bold text-text-muted">
                                <input type="checkbox" required checked={alertConsent} onChange={(event) => setAlertConsent(event.target.checked)} className="mt-0.5" />
                                <span>I agree to the <Link to="/legal#privacy-policy" className="text-primary underline">Privacy Policy</Link> and request WhatsApp market-rate updates. I can opt out at any time.</span>
                            </label>
                            <div className="flex justify-center"><TurnstileWidget onToken={handleTurnstileToken} /></div>
                        </form>
                        {subscriptionReference && (
                            <p className="mt-4 text-sm font-bold text-primary" role="status" aria-live="polite">
                                Subscription reference: <span className="font-mono">{subscriptionReference}</span>
                            </p>
                        )}

                        {/* Live Market Intelligence Rates Grid */}
                        {products && products.length > 0 && (
                            <div className="mt-12 pt-10 border-t border-primary/10">
                                <div className="flex items-center justify-between mb-6 text-left">
                                    <div>
                                        <h3 className="text-xl font-display font-black text-text-main uppercase">Live Market Rates Overview</h3>
                                        <p className="text-xs font-bold text-text-muted">Updated dynamically from certified Miryalaguda mills</p>
                                    </div>
                                    <Link to="/market-rates" className="text-xs font-black uppercase text-primary hover:underline flex items-center gap-1">
                                        View Full Market Desk <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                                    {products.slice(0, 8).map((prod) => {
                                        const isUp = prod.trend === 'up';
                                        const isDown = prod.trend === 'down';
                                        const unitLabel = getRateUnitShortLabel(prod.unit);
                                        return (
                                            <div key={prod.id} className="p-4 rounded-2xl bg-surface/90 dark:bg-secondary-light/40 border border-border/50 backdrop-blur-md flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm">
                                                <div className="flex items-center justify-between gap-2 mb-3">
                                                    <span className="text-xs font-black text-text-main dark:text-white truncate" title={prod.variety_name}>
                                                        {prod.variety_name}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-0.5 shrink-0 ${
                                                        isUp ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                                                        isDown ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                                                        'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                                                    }`}>
                                                        {isUp && <TrendingUp className="w-3 h-3" />}
                                                        {isDown && <TrendingDown className="w-3 h-3" />}
                                                        {!isUp && !isDown && <Minus className="w-3 h-3" />}
                                                        {prod.percentage_change ? `${prod.percentage_change > 0 ? '+' : ''}${prod.percentage_change}%` : 'STABLE'}
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline justify-between pt-2 border-t border-border/30">
                                                    <span className="text-lg font-black text-primary font-display">
                                                        ₹{prod.current_price_mt?.toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] font-black text-text-muted uppercase">
                                                        /{unitLabel}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </section>

            {/* ═══ PRODUCT SHOWCASE ═══ */}
            <section className="py-20 px-4 bg-secondary-bg" id="product-showcase">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-display font-black text-text-main mb-4 uppercase">Export Variety Catalogue</h2>
                        <div className="w-20 h-1.5 bg-primary mx-auto rounded-full mb-6" />
                        <p className="text-text-muted text-lg max-w-2xl mx-auto font-bold">Sourced directly from certified millers in Miryalaguda. Available in bulk quantities for immediate export.</p>
                    </motion.div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {(products.length > 0 ? products.slice(0, 8) : []).map((product, i) => {
                            const pSlug = product.slug || product.variety_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            return (
                                <div key={product.id} className="premium-card group overflow-hidden flex flex-col">
                                    <div className="h-56 overflow-hidden relative">
                                        <OptimizedImage
                                            src={product.image_url ? (product.image_url.startsWith('http') ? product.image_url : `${API_BASE_URL}/${product.image_url}`) : defaultImages[i % defaultImages.length]} 
                                            alt={product.variety_name} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            width={800}
                                            height={600}
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        />
                                        <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-background/90 backdrop-blur-md text-primary text-sm font-black shadow-xl">
                                            ₹{product.current_price_mt}/{getRateUnitShortLabel(product.unit)}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-grow flex flex-col">
                                        <h3 className="font-display font-black text-xl text-text-main mb-3">{product.variety_name}</h3>
                                        <p className="text-text-muted text-sm mb-6 line-clamp-2 font-bold">Premium export quality with rigorous QC testing. Contact for technical specifications.</p>
                                        <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                                            <Link to={`/products/${pSlug}`} className="text-primary font-black text-sm hover:underline flex items-center gap-1">
                                                View Specs <ArrowRight className="w-4 h-4" />
                                            </Link>
                                            <span className="text-[10px] uppercase tracking-widest text-text-muted font-black">Export Grade</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {products.length > 8 && (
                        <div className="mt-12 text-center">
                            <Link to="/products" className="button-primary inline-flex items-center gap-2 text-base font-black px-8 py-4">
                                View Full Catalogue ({products.length} Varieties) <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ WHY CHOOSE US ═══ */}
            <section className="py-24 px-4 bg-background" id="why-choose-us">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeUp} className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-display font-black text-text-main mb-4">Industrial Excellence</h2>
                        <div className="w-20 h-1.5 bg-primary mx-auto rounded-full mb-6" />
                        <p className="text-text-muted text-lg max-w-2xl mx-auto font-bold">Decades of expertise in rice canvassing and global export logistics.</p>
                    </motion.div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f) => (
                            <div key={f.title} className="premium-card !p-8 group hover:border-primary transition-colors">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    <f.icon className="w-8 h-8 text-primary group-hover:text-white" />
                                </div>
                                <h3 className="font-display font-black text-xl text-text-main mb-4">{f.title}</h3>
                                <p className="text-text-muted font-bold leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ MARKET INTELLIGENCE PREVIEW ═══ */}
            <section className="py-24 px-4 bg-secondary-bg" id="market-preview">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-end justify-between gap-6 mb-16">
                        <motion.div {...fadeUp} className="text-left">
                            <h2 className="text-4xl md:text-5xl font-display font-black text-text-main mb-4">Market Intelligence</h2>
                            <div className="w-20 h-1.5 bg-primary rounded-full mb-6" />
                            <p className="text-text-muted text-lg max-w-2xl font-bold">Stay ahead with real-time pricing from Miryalaguda's rice market.</p>
                        </motion.div>
                        <Link to="/market-rates" className="button-primary !py-3 !px-6 text-sm">
                            View Full Dashboard
                        </Link>
                    </div>
                    
                    <motion.div {...fadeUp} className="premium-card overflow-hidden !p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left" aria-label="Miryalaguda Rice Market Intelligence Preview">
                                <caption>
                                    <span className="sr-only">Miryalaguda Wholesale Rice Indicative Market Rates</span>
                                </caption>
                                <thead>
                                    <tr className="bg-background text-text-main text-xs uppercase tracking-[0.2em]">
                                        <th scope="col" className="py-6 px-8 font-black">Rice Variety</th>
                                        <th scope="col" className="py-6 px-8 font-black">Indicative Price</th>
                                        <th scope="col" className="py-6 px-8 font-black text-center">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {products.slice(0, 5).map((item) => (
                                        <tr key={item.id} className="hover:bg-primary/5 transition-colors">
                                            <td className="py-6 px-8 font-black text-text-main">{item.variety_name}</td>
                                            <td className="py-6 px-8 font-black text-2xl text-primary">₹{item.current_price_mt.toFixed(0)} / {getRateUnitShortLabel(item.unit)}</td>
                                            <td className="py-6 px-8 text-center">
                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${item.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : item.trend === 'down' ? 'bg-red-500/10 text-red-500' : 'bg-text-muted/10 text-text-muted'}`}>
                                                    {item.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : item.trend === 'down' ? '▼' : '—'} {item.percentage_change}%
                                                    <span className="sr-only">({item.trend === 'up' ? 'Price increased' : item.trend === 'down' ? 'Price decreased' : 'Price unchanged'})</span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══ FINAL CTA ═══ */}
            <section className="py-24 px-4 bg-background">
                <motion.div {...fadeUp} className="max-w-6xl mx-auto text-center relative overflow-hidden rounded-[3rem] border border-border shadow-2xl">
                    <div className="absolute inset-0 bg-primary/5" />
                    <div className="relative z-10 py-20 px-6 sm:px-12">
                        <h2 className="text-4xl md:text-6xl font-display font-black text-text-main mb-6">Start Your Export <br /> Journey Today</h2>
                        <p className="text-text-muted text-xl max-w-2xl mx-auto mb-12 font-bold leading-relaxed">Connect with us for competitive pricing, certified quality rice, and hassle-free export logistics from India.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link to="/contact" className="button-primary !text-xl !px-12 !py-5">Get Started Now</Link>
                            <a href="https://wa.me/919866760028" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 px-12 py-5 rounded-xl border-2 border-primary text-primary font-black text-xl hover:bg-primary/10 transition-all">
                                <MessageCircle className="w-6 h-6" /> WhatsApp
                            </a>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
