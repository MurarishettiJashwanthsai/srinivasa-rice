import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle Escape key to close mobile menu
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
                document.getElementById('mobile-menu-toggle')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' },
        { name: 'Products', path: '/products' },
        { name: 'Market Rates', path: '/market-rates' },
        { name: 'Packaging', path: '/packaging' },
        { name: 'Certifications', path: '/certifications' },
        { name: 'Contact', path: '/contact' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50">
            <nav
                className={`transition-all duration-500 ${
                    scrolled
                        ? 'glass-nav shadow-2xl'
                        : 'bg-[#0F172A] border-b border-white/5'
                }`}
                id="main-navbar"
                aria-label="Main Navigation"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center -ml-2 lg:-ml-6">
                            <Link to="/" className="flex items-center gap-3 group min-h-[44px] min-w-[44px]">
                                <img
                                    src="/logo.png"
                                    alt="Sri Srinivasa Canvassing Logo"
                                    width="56"
                                    height="56"
                                    className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="flex flex-col">
                                    <span className="font-display font-bold text-xl text-white leading-tight tracking-tight">
                                        Sri Srinivasa
                                    </span>
                                    <span className="text-xs font-bold text-primary tracking-[0.2em] leading-tight uppercase">
                                        Canvassing
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    aria-current={isActive(link.path) ? 'page' : undefined}
                                    className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg min-h-[44px] inline-flex items-center ${
                                        isActive(link.path)
                                            ? 'text-primary font-bold'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {link.name}
                                    {isActive(link.path) && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                                        />
                                    )}
                                </Link>
                            ))}

                            {/* CTA Button */}
                            <Link
                                to="/contact"
                                className="ml-3 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 min-h-[44px] inline-flex items-center"
                            >
                                Get Bulk Quote
                            </Link>
                        </div>

                        {/* Mobile Controls */}
                        <div className="flex lg:hidden items-center gap-2">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-3 rounded-lg text-gray-300 hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                                aria-expanded={isOpen}
                                aria-controls="mobile-menu-drawer"
                                id="mobile-menu-toggle"
                            >
                                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Drawer */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            id="mobile-menu-drawer"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="lg:hidden overflow-hidden border-t border-white/10"
                        >
                            <div className="px-4 py-4 space-y-1 bg-[#0F172A]">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Link
                                            to={link.path}
                                            aria-current={isActive(link.path) ? 'page' : undefined}
                                            className={`block px-4 py-3 rounded-xl text-base font-medium transition-all min-h-[44px] flex items-center ${
                                                isActive(link.path)
                                                    ? 'bg-primary/10 text-primary font-bold'
                                                    : 'text-gray-300 hover:bg-white/5'
                                            }`}
                                            onClick={() => {
                                                setIsOpen(false);
                                                document.getElementById('mobile-menu-toggle')?.focus();
                                            }}
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.div>
                                ))}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: navLinks.length * 0.05 }}
                                >
                                    <Link
                                        to="/contact"
                                        className="block mt-3 px-4 py-3 text-center rounded-xl font-bold bg-primary hover:bg-primary-dark text-white transition-colors min-h-[44px] flex items-center justify-center"
                                        onClick={() => {
                                            setIsOpen(false);
                                            document.getElementById('mobile-menu-toggle')?.focus();
                                        }}
                                    >
                                        Get Bulk Quote
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
};

export default Navbar;
