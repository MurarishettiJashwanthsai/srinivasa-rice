import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle } from 'lucide-react';

const WhatsAppWidget = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const phoneNumber = "919866760028";

    const templates = [
        { label: "Today's Prices", message: "Hi Sri Srinivasa Canvassing, I'm interested in today's live rice pricing. Can you share the latest rates?" },
        { label: 'Bulk Quote', message: "Hello, I'd like to request a bulk quote for rice export. Please share your current FOB pricing." },
        { label: 'Product Specs', message: "Hi, I need detailed product specifications and COA for your rice varieties. Can you help?" },
    ];

    const handleSend = (msg) => {
        if (!msg) return;
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
        setIsExpanded(false);
    };

    return (
        <div className="fixed bottom-24 md:bottom-6 right-6 z-50 flex flex-col items-end gap-3" id="whatsapp-widget">
            {/* Expanded Quick Inquiry Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                        className="w-80 sm:w-96 glass-card-strong rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10"
                    >
                        {/* Header */}
                        <div className="bg-[#075E54] px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <img src="/logo-256.png" alt="Sri Srinivasa Canvassing" width="32" height="32" className="w-8 h-8 rounded-full object-cover" loading="lazy" decoding="async" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">Sri Srinivasa Canvassing</h4>
                                    <p className="text-green-200 text-xs">Typically replies within an hour</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="text-white/70 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="p-4 bg-[#ECE5DD] dark:bg-secondary-dark/90 min-h-[100px]">
                            <div className="bg-white dark:bg-secondary-light rounded-xl p-3 shadow-sm max-w-[85%] mb-3">
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                    👋 Hello! How can we help you today? Select a quick inquiry below or type your own.
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1 text-right">now</p>
                            </div>
                        </div>

                        {/* Quick Templates */}
                        <div className="p-4 bg-surface dark:bg-secondary space-y-2">
                            <p className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider mb-2">Quick Inquiry</p>
                            <div className="grid grid-cols-2 gap-2">
                                {templates.slice(0, 3).map((t) => (
                                    <button
                                        key={t.label}
                                        onClick={() => handleSend(t.message)}
                                        className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-emerald/10 text-emerald-dark dark:text-emerald-light border border-emerald/20 hover:bg-emerald/20 transition-all text-left"
                                    >
                                        {t.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        const url = `https://wa.me/${phoneNumber}`;
                                        window.open(url, '_blank');
                                        setIsExpanded(false);
                                    }}
                                    className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-primary/10 text-primary-dark dark:text-primary-light border border-primary/20 hover:bg-primary/20 transition-all text-left flex items-center gap-1"
                                >
                                    Custom <Send className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#1EBE5D] transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 group"
                aria-label="Chat with us on WhatsApp"
                id="whatsapp-fab"
            >
                <AnimatePresence mode="wait">
                    {isExpanded ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="wa"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tooltip */}
                {!isExpanded && (
                    <span className="absolute right-16 bg-gray-900 dark:bg-gray-700 text-white text-xs font-semibold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                        Chat with us!
                    </span>
                )}

                {/* Pulsing ring */}
                {!isExpanded && (
                    <span className="absolute inline-flex w-full h-full rounded-full bg-[#25D366] opacity-25 animate-ping -z-10" />
                )}
            </button>
        </div>
    );
};

export default WhatsAppWidget;
