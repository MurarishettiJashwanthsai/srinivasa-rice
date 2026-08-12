import { Award, ShieldCheck, CheckCircle, Building2, Factory, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import useMeta from '../hooks/useMeta';

const Certifications = () => {
    useMeta({
        title: 'Export Credentials & Mill Quality Standards',
        description: 'View Sri Srinivasa Canvassing IEC and GST registration information alongside stated partner milling facility quality standards.',
    });

    const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

    const companyCredentials = [
        { icon: FileCheck, title: 'IEC & GST Registered', entity: 'Sri Srinivasa Canvassing', desc: 'Authorized Import Export Code (IEC) holder registered with DGFT, India for official cross-border trade transactions.' },
    ];

    const MillCredentials = [
        { icon: Factory, title: 'ISO 9001:2015 Facilities', entity: 'Partner Millers', desc: 'Our canvassed milling partners in Miryalaguda maintain certified Quality Management Systems for raw paddy processing and sortex milling.' },
        { icon: CheckCircle, title: 'HACCP & ISO 22000', entity: 'Partner Millers', desc: 'Partner mills follow Hazard Analysis Critical Control Point (HACCP) systems ensuring clean processing, destoning, and moisture control.' },
        { icon: Building2, title: 'Bühler Sortex Facilities', entity: 'Partner Millers', desc: 'High-precision color sorting technology utilized at partner facilities to eliminate discolored grains and chalky kernels.' },
    ];

    return (
        <div className="bg-background dark:bg-secondary pt-10 pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div {...fadeUp} className="text-center mb-16">
                    <h1 className="text-3xl md:text-5xl font-display font-black text-text-main dark:text-white tracking-tight mb-4 uppercase">Quality & Credentials</h1>
                    <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-6" />
                    <p className="max-w-2xl mx-auto text-base text-text-muted dark:text-gray-400 font-bold leading-relaxed">
                        Complete transparency between our merchant export registrations and our network of certified partner milling facilities in Miryalaguda.
                    </p>
                </motion.div>

                {/* Section 1: Direct Company Credentials */}
                <div className="mb-16">
                    <motion.div {...fadeUp} className="mb-8">
                        <span className="text-xs font-black uppercase tracking-[0.25em] text-primary block mb-1">Entity Registrations</span>
                        <h2 className="text-2xl font-display font-black text-text-main dark:text-white uppercase tracking-tight">Company Export Credentials</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {companyCredentials.map((cert, i) => (
                            <GlassCard key={cert.title} variant="premium" delay={i * 0.1} className="flex flex-col">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                                    <cert.icon className="h-7 w-7 text-primary" />
                                </div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{cert.entity}</span>
                                <h3 className="text-xl font-display font-bold text-text-main dark:text-white mb-3">{cert.title}</h3>
                                <p className="text-text-muted dark:text-gray-400 text-xs font-bold leading-relaxed">{cert.desc}</p>
                            </GlassCard>
                        ))}
                    </div>
                </div>

                {/* Section 2: Partner Mill Credentials */}
                <div>
                    <motion.div {...fadeUp} className="mb-8">
                        <span className="text-xs font-black uppercase tracking-[0.25em] text-primary block mb-1">Industrial Processing Network</span>
                        <h2 className="text-2xl font-display font-black text-text-main dark:text-white uppercase tracking-tight">Mill Infrastructure Standards</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {MillCredentials.map((cert, i) => (
                            <GlassCard key={cert.title} variant="premium" delay={i * 0.1 + 0.3} className="flex flex-col">
                                <div className="h-14 w-14 rounded-2xl bg-emerald/10 flex items-center justify-center mb-6 border border-emerald/20">
                                    <cert.icon className="h-7 w-7 text-emerald" />
                                </div>
                                <span className="text-[10px] font-black text-emerald uppercase tracking-widest mb-1">{cert.entity}</span>
                                <h3 className="text-xl font-display font-bold text-text-main dark:text-white mb-3">{cert.title}</h3>
                                <p className="text-text-muted dark:text-gray-400 text-xs font-bold leading-relaxed">{cert.desc}</p>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certifications;
