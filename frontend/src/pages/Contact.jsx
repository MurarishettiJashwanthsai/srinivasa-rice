import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle2, ChevronRight, FileText, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { countries } from '../data/countries';
import useMeta from '../hooks/useMeta';
import { API_BASE_URL } from '../config/api';

const Contact = () => {
    useMeta({
        title: 'Request a Bulk Rice Quote — Sri Srinivasa Canvassing',
        description: 'Submit your required rice variety, quantity, packaging and destination to request specifications and an official quotation.',
    });

    const [searchParams] = useSearchParams();
    const initialProduct = searchParams.get('product') || 'Sona Masuri Steam';

    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        whatsapp: '',
        destination_country: '',
        destination_port: '',
        product_name: initialProduct,
        quantity_mt: '',
        packaging_type: '50kg PP Bag',
        incoterm: 'FOB',
        inquiry: '',
        honeypot: '',
        agree_privacy: false,
        subscribe_alerts: false,
    });

    useEffect(() => {
        const prodParam = searchParams.get('product');
        if (prodParam) {
            setFormData(prev => ({ ...prev, product_name: prodParam }));
        }
    }, [searchParams]);

    const [countryCode, setCountryCode] = useState('+91');
    const [status, setStatus] = useState(null);
    const [rfqId, setRfqId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.agree_privacy) {
            setErrorMessage('Please acknowledge the privacy policy agreement.');
            setStatus('error');
            return;
        }

        setStatus('submitting');
        setErrorMessage('');

        try {
            const fullNumber = `${countryCode}${formData.whatsapp}`;
            const payload = {
                name: formData.name,
                company: formData.company,
                email: formData.email,
                whatsapp: fullNumber,
                destination_country: formData.destination_country,
                destination_port: formData.destination_port,
                product_name: formData.product_name,
                quantity_mt: formData.quantity_mt ? parseFloat(formData.quantity_mt) : null,
                packaging_type: formData.packaging_type,
                incoterm: formData.incoterm,
                inquiry: `${formData.inquiry}${formData.subscribe_alerts ? ' | Opted in for Daily Price Alerts' : ''}`,
                honeypot: formData.honeypot
            };

            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                setRfqId(data.request_id || 'RFQ-2026-CONFIRMED');
                setStatus('success');
            } else {
                const errData = await response.json();
                setErrorMessage(errData.detail || 'Failed to submit quote request. Please try again.');
                setStatus('error');
            }
        } catch {
            setErrorMessage('Network connection error. Please try again later.');
            setStatus('error');
        }
    };

    const fadeUp = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-50px' },
        transition: { duration: 0.6 }
    };

    const inputClass = "w-full px-5 py-4 rounded-xl border-2 border-border/20 bg-black/20 text-text-main dark:text-white placeholder-text-subtle focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all font-bold text-base";

    const contactInfo = [
        { icon: MapPin, title: 'Miryalaguda Head Office', detail: 'Miryalaguda, Nalgonda District, Telangana, India - 508207' },
        { icon: Phone, title: 'Telephone & WhatsApp', detail: '+91 9866760028', link: 'https://wa.me/919866760028', linkText: 'Chat on WhatsApp' },
        { icon: Mail, title: 'Business Email', detail: 'srinivasulu@srinivascanvassing.com', link: 'mailto:srinivasulu@srinivascanvassing.com', linkText: 'Send Email' },
        { icon: Linkedin, title: 'LinkedIn Profile', detail: 'Murarishetti Srinivasulu', link: 'https://www.linkedin.com/in/murarishetti-srinivasulu/', linkText: 'Connect on LinkedIn' },
        { icon: Clock, title: 'Operating Hours', detail: 'Monday – Saturday: 9:00 AM – 8:00 PM IST' }
    ];

    return (
        <div className="min-h-screen bg-background py-12 md:py-20 transition-colors duration-500 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div {...fadeUp} className="text-center mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-5xl font-display font-black text-text-main tracking-tight mb-3 uppercase">Request Bulk Quote</h1>
                    <div className="w-16 md:w-20 h-1.5 bg-primary mx-auto rounded-full mb-4 md:mb-5" />
                    <p className="max-w-2xl mx-auto text-base md:text-lg text-text-muted font-bold leading-relaxed px-2">Request official rice specifications, proforma quotations, and global port logistics information directly from our canvassing team.</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
                    {/* Left Side: Contact Info */}
                    <motion.div {...fadeUp} className="space-y-8 md:space-y-12">
                        <h2 className="text-2xl md:text-3xl font-display font-black text-text-main uppercase tracking-tight mb-6 md:mb-10">Canvassing Hub</h2>
                        <div className="space-y-6 md:space-y-10">
                            {contactInfo.map(c => (
                                <div key={c.title} className="flex items-start gap-4 md:gap-6 group">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <c.icon className="h-6 w-6 md:h-8 md:w-8 text-primary group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg md:text-xl text-text-main mb-1 md:mb-2 uppercase tracking-wide">{c.title}</h3>
                                        <p className="text-base md:text-lg text-text-muted font-bold leading-relaxed">{c.detail}</p>
                                        {c.link && (
                                            <a href={c.link} target="_blank" rel="noopener noreferrer" className="mt-2 md:mt-4 inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs md:text-sm hover:underline">
                                                {c.linkText}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Side: Form */}
                    <motion.div {...fadeUp}>
                        <div className="premium-card !p-6 sm:!p-10 md:!p-12 rounded-[2rem] md:rounded-[2.5rem] border-primary/10 relative overflow-hidden shadow-2xl">
                            {status === 'success' ? (
                                <div className="text-center py-10 space-y-6" aria-live="polite">
                                    <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/20">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-display font-black text-text-main">Quote Request Received</h3>
                                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 inline-block font-mono text-sm font-black text-primary">
                                        Reference ID: {rfqId}
                                    </div>
                                    <p className="text-text-muted font-bold text-base max-w-md mx-auto">
                                        Thank you, {formData.name}. Our export desk in Miryalaguda will review your requirements and contact you shortly via WhatsApp at {countryCode}{formData.whatsapp}.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setStatus(null);
                                            setFormData(prev => ({ ...prev, inquiry: '' }));
                                        }}
                                        className="button-primary !py-3 !px-8 text-sm"
                                    >
                                        Submit Another Request
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Honeypot Spam Trap */}
                                    <input
                                        type="text"
                                        name="honeypot"
                                        value={formData.honeypot}
                                        onChange={handleChange}
                                        className="hidden"
                                        tabIndex="-1"
                                        autoComplete="off"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="block text-xs font-black text-text-main uppercase tracking-widest">Full Name <span className="text-red-500">*</span></label>
                                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="company" className="block text-xs font-black text-text-main uppercase tracking-widest">Company Name <span className="text-red-500">*</span></label>
                                            <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} required className={inputClass} placeholder="Global Imports Ltd" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="block text-xs font-black text-text-main uppercase tracking-widest">Business Email</label>
                                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="buyer@company.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="whatsapp" className="block text-xs font-black text-text-main uppercase tracking-widest">WhatsApp Number <span className="text-red-500">*</span></label>
                                            <div className="flex gap-2">
                                                <div className="relative shrink-0">
                                                    <select
                                                        value={countryCode}
                                                        onChange={(e) => setCountryCode(e.target.value)}
                                                        className="appearance-none w-24 h-full pl-4 pr-8 py-3.5 rounded-xl border-2 border-border/20 bg-black/20 text-text-main dark:text-white font-black text-sm cursor-pointer"
                                                        aria-label="Country Code"
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
                                                <input type="tel" id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} required className={inputClass} placeholder="Number" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="destination_country" className="block text-xs font-black text-text-main uppercase tracking-widest">Destination Country</label>
                                            <input type="text" id="destination_country" name="destination_country" value={formData.destination_country} onChange={handleChange} className={inputClass} placeholder="e.g. UAE, Benin" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="product_name" className="block text-xs font-black text-text-main uppercase tracking-widest">Rice Variety</label>
                                            <select id="product_name" name="product_name" value={formData.product_name} onChange={handleChange} className={inputClass}>
                                                <option value="Sona Masuri Steam(BPT)">Sona Masuri Steam(BPT)</option>
                                                <option value="Sona Masuri Raw(BPT)">Sona Masuri Raw(BPT)</option>
                                                <option value="lachikari raw rice(JSR)">lachikari raw rice(JSR)</option>
                                                <option value="RNR Steam">RNR Steam</option>
                                                <option value="Jsr Steem Rice">Jsr Steem Rice</option>
                                                <option value="Other / Multiple">Other / Multiple</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="quantity_mt" className="block text-xs font-black text-text-main uppercase tracking-widest">Quantity (MT)</label>
                                            <input type="number" min="1" id="quantity_mt" name="quantity_mt" value={formData.quantity_mt} onChange={handleChange} className={inputClass} placeholder="e.g. 50" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="inquiry" className="block text-xs font-black text-text-main uppercase tracking-widest">Requirement Details <span className="text-red-500">*</span></label>
                                        <textarea id="inquiry" name="inquiry" value={formData.inquiry} onChange={handleChange} required rows="4" className={`${inputClass} resize-none`} placeholder="Describe broken percentage, moisture preference, port of discharge..." />
                                    </div>

                                    {/* Consent Checkboxes */}
                                    <div className="space-y-3 pt-2">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input type="checkbox" name="agree_privacy" checked={formData.agree_privacy} onChange={handleChange} required className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary" />
                                            <span className="text-xs text-text-muted font-bold leading-relaxed">
                                                I agree that Sri Srinivasa Canvassing may use these details to process and respond to my wholesale enquiry. <span className="text-red-500">*</span>
                                            </span>
                                        </label>
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input type="checkbox" name="subscribe_alerts" checked={formData.subscribe_alerts} onChange={handleChange} className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary" />
                                            <span className="text-xs text-text-muted font-bold leading-relaxed">
                                                (Optional) I would also like to receive daily WhatsApp market-rate updates from Miryalaguda.
                                            </span>
                                        </label>
                                    </div>

                                    <button type="submit" disabled={status === 'submitting'} className="button-primary w-full !py-4 !text-lg !rounded-xl shadow-xl shadow-primary/20">
                                        {status === 'submitting' ? 'Processing...' : 'Submit Quote Request'}
                                    </button>

                                    {status === 'error' && (
                                        <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold text-center border border-red-500/20" role="alert">
                                            {errorMessage || 'Submission failed. Please check inputs.'}
                                        </div>
                                    )}
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
