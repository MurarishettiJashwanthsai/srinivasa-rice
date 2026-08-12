import { Box, Ship, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import useMeta from '../hooks/useMeta';

const Packaging = () => {
    useMeta({
        title: 'Rice Packaging and Export Logistics',
        description: 'View bulk and retail rice packaging, custom branding and port-logistics information from Telangana, India.',
    });

    const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

    return (
        <div className="bg-background dark:bg-secondary pt-6 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div {...fadeUp} className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-display font-extrabold text-text-main dark:text-white tracking-tight mb-3">Packaging & Logistics</h1>
                    <div className="w-12 h-1 bg-primary mx-auto rounded-full mb-4" />
                    <p className="max-w-xl mx-auto text-base text-text-muted dark:text-gray-400">End-to-end export solutions from mill floor to seaports.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <motion.div {...fadeUp} className="space-y-8">
                        <h2 className="text-3xl font-display font-bold text-text-main dark:text-white flex items-center gap-3">
                            <Box className="h-8 w-8 text-primary" /> Standard Packaging
                        </h2>
                        <GlassCard variant="premium" hover={false} animate={false} className="space-y-6 text-text-muted dark:text-gray-300">
                            <p className="leading-relaxed">We understand that proper packaging is crucial for preserving the aroma, texture, and quality of rice during long-haul transit. We offer standardized export-grade packaging as well as custom buyer-branded bags.</p>
                            <ul className="space-y-4">
                                {[
                                    { name: 'PP Bags (Polypropylene)', desc: '26kg and 50kg standard bulk bags. Highly durable and moisture resistant.' },
                                    { name: 'Non-Woven Bags', desc: '5kg, 10kg, 20kg premium bags suitable for direct retail distribution.' },
                                    { name: 'Jute Bags', desc: 'Eco-friendly traditional packaging available upon special request.' },
                                ].map(item => (
                                    <li key={item.name} className="flex items-start gap-3">
                                        <div className="h-2 w-2 rounded-full bg-primary mt-2.5 shrink-0" />
                                        <div>
                                            <strong className="block text-text-main dark:text-white">{item.name}</strong>
                                            <span className="text-sm">{item.desc}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>
                    </motion.div>

                    <motion.div {...fadeUp} className="space-y-8">
                        <h2 className="text-3xl font-display font-bold text-text-main dark:text-white flex items-center gap-3">
                            <Ship className="h-8 w-8 text-primary" /> Port Connectivity
                        </h2>
                        <GlassCard variant="premium" hover={false} animate={false} className="space-y-6 text-text-muted dark:text-gray-300">
                            <img src="/packaging-image-1000.jpg" alt="Packaging and Logistics" width="562" height="1000" className="w-full h-56 object-cover object-center rounded-xl shadow-sm" loading="lazy" decoding="async" />
                            <p className="leading-relaxed">Miryalaguda's strategic location in Telangana provides excellent rail and road connectivity to major eastern coastal ports.</p>
                            <div className="space-y-3">
                                {[
                                    { name: 'Krishnapatnam Port', desc: 'Primary export hub for bulk break and containerized cargo.' },
                                    { name: 'Chennai Port', desc: 'Alternative hub ensuring flexible and guaranteed shipping schedules.' },
                                ].map(port => (
                                    <div key={port.name} className="flex items-center gap-4 bg-surface-hover dark:bg-white/5 p-4 rounded-xl border border-border dark:border-white/10 hover:border-primary dark:hover:border-primary transition-colors">
                                        <Truck className="h-6 w-6 text-primary shrink-0" />
                                        <div>
                                            <strong className="block text-text-main dark:text-white">{port.name}</strong>
                                            <span className="text-sm">{port.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Packaging;
