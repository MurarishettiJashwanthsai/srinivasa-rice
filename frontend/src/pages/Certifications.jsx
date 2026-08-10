import { Award, ShieldCheck, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import useMeta from '../hooks/useMeta';

const Certifications = () => {
    useMeta({
        title: 'Export Credentials and Quality Assurance',
        description: 'View company registrations, partner-mill credentials, inspection options and quality-assurance information.',
    });

    const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

    const certs = [
        { icon: Award, title: 'APEDA', desc: 'Registered with the Agricultural and Processed Food Products Export Development Authority (APEDA), ensuring adherence to the highest Indian export standards.' },
        { icon: ShieldCheck, title: 'FSSAI', desc: 'Compliant with the Food Safety and Standards Authority of India, verifying that our products meet stringent safety and hygiene criteria before export.' },
        { icon: CheckCircle, title: 'ISO 9001:2015', desc: 'Our partner mills hold ISO certifications for quality management systems to guarantee continuous improvement and structural integrity in crop handling.' },
    ];

    return (
        <div className="bg-background dark:bg-secondary pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div {...fadeUp} className="text-center mb-16">
                    <h1 className="text-4xl font-display font-extrabold text-text-main dark:text-white tracking-tight mb-4">Our Credentials</h1>
                    <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-6" />
                    <p className="max-w-2xl mx-auto text-xl text-text-muted dark:text-gray-400">Certified quality trusted by global importers.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {certs.map((cert, i) => (
                        <GlassCard key={cert.title} variant="premium" delay={i * 0.15} className="flex flex-col items-center text-center">
                            <div className="h-20 w-20 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6">
                                <cert.icon className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-text-main dark:text-white mb-4">{cert.title}</h3>
                            <p className="text-text-muted dark:text-gray-400 leading-relaxed">{cert.desc}</p>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Certifications;
