import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight, Send } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const Footer = () => {
    const [email, setEmail] = useState('');

    const handleNewsletter = (e) => {
        e.preventDefault();
        if (email) {
            toast.success('Thank you for subscribing!');
            setEmail('');
        }
    };

    const socialLinks = [
        {
            name: 'LinkedIn',
            url: 'https://www.linkedin.com/in/murarishetti-srinivasulu/',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
        },
        {
            name: 'Instagram',
            url: '#',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
            ),
        },
        {
            name: 'YouTube',
            url: '#',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            ),
        },
        {
            name: 'WhatsApp',
            url: 'https://wa.me/919866760028',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            ),
        },
    ];

    const certBadges = ['APEDA', 'FSSAI', 'ISO 9001'];

    return (
        <footer className="relative bg-white dark:bg-[#050A14] text-text-main dark:text-white overflow-hidden transition-colors duration-500 border-t border-border dark:border-white/5" id="site-footer">
            {/* Decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald to-primary" />

            {/* Newsletter Section */}
            <div className="border-b border-border dark:border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold font-display mb-1">Stay Updated with Market Rates</h3>
                            <p className="text-text-muted dark:text-gray-400 text-sm font-bold">Get daily price alerts and export intelligence directly to your inbox.</p>
                        </div>
                        <form onSubmit={handleNewsletter} className="flex w-full md:w-auto gap-2">
                            <input
                                type="email"
                                required
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 md:w-72 px-4 py-3 rounded-xl bg-surface-hover dark:bg-white/10 border border-border dark:border-white/10 text-text-main dark:text-white placeholder-text-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-bold"
                            />
                            <button
                                type="submit"
                                className="px-5 py-3 bg-primary hover:bg-primary-dark rounded-xl font-bold text-sm transition-all hover:scale-105 flex items-center gap-2 text-white"
                            >
                                <Send className="w-4 h-4" />
                                <span className="hidden sm:inline">Subscribe</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand Info */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                            <img src="/logo.png" alt="Sri Srinivasa Canvassing Logo" className="h-12 w-auto object-contain rounded-lg bg-white p-1 transition-transform group-hover:scale-105 border border-border" />
                            <div className="flex flex-col">
                                <span className="font-display font-bold text-lg leading-tight text-text-main dark:text-white">Sri Srinivasa</span>
                                <span className="text-xs font-bold text-primary tracking-[0.15em] leading-tight">CANVASSING</span>
                            </div>
                        </Link>
                        <p className="text-text-muted dark:text-gray-400 text-sm mb-6 leading-relaxed max-w-xs font-bold">
                            Premium rice sourcing & export from Miryalaguda, Telangana. Trusted bridge between quality Indian rice and global markets.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-xl bg-surface-hover dark:bg-white/5 hover:bg-primary/20 border border-border dark:border-white/10 hover:border-primary/30 flex items-center justify-center text-text-muted dark:text-gray-400 hover:text-primary transition-all duration-300 hover:scale-110"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-bold font-display uppercase tracking-wider text-primary mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'About Us', path: '/about' },
                                { name: 'Products', path: '/products' },
                                { name: 'Market Rates', path: '/market-rates' },
                                { name: 'Packaging & Logistics', path: '/packaging' },
                                { name: 'Certifications', path: '/certifications' },
                                { name: 'Contact Us', path: '/contact' },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-white text-sm font-bold transition-colors duration-300 flex items-center gap-1 group"
                                    >
                                        {link.name}
                                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-sm font-bold font-display uppercase tracking-wider text-primary mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-text-muted dark:text-gray-400 text-sm leading-relaxed font-bold">Miryalaguda, Nalgonda District, Telangana, India - 508207</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Phone className="h-4 w-4 text-primary" />
                                </div>
                                <a href="tel:+919866760028" className="text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-white text-sm transition-colors font-bold">+91 9866760028</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Mail className="h-4 w-4 text-primary" />
                                </div>
                                <a href="mailto:srinivasulu@srinivascanvassing.com" className="text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-white text-sm transition-colors break-all font-bold">srinivasulu@srinivascanvassing.com</a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Certifications */}
                    <div>
                        <h3 className="text-sm font-bold font-display uppercase tracking-wider text-primary mb-6">Legal Info</h3>
                        <ul className="space-y-3 mb-8">
                            {[
                                { name: 'Privacy Policy', path: '/legal#privacy-policy' },
                                { name: 'Terms & Conditions', path: '/legal#terms' },
                                { name: 'Commodity Disclaimer', path: '/legal#disclaimer' },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link to={link.path} className="text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-white text-sm font-bold transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* Certification Badges */}
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-subtle dark:text-gray-500 mb-3">Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                            {certBadges.map((badge) => (
                                <span
                                    key={badge}
                                    className="px-3 py-1.5 rounded-lg bg-emerald/10 border border-emerald/20 text-emerald text-xs font-bold tracking-wider"
                                >
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border dark:border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-text-subtle dark:text-gray-500 text-xs text-center md:text-left font-bold">
                            &copy; {new Date().getFullYear()} Sri Srinivasa Canvassing. All rights reserved.
                        </p>
                        <p className="text-text-subtle dark:text-gray-600 text-xs text-center max-w-lg font-bold">
                            Pricing is indicative and subject to daily market fluctuations. Final quality verified by third-party inspection.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
