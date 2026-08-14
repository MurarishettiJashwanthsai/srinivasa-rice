import { Wheat, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';

const About = () => {
    const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } };

    const values = [
        { icon: Wheat, title: 'Unmatched Quality', desc: 'Direct oversight during milling and sortex ensures consistent grain length, color, and minimal broken percentage.' },
        { icon: CheckCircle2, title: 'Quality Assurance', desc: 'Rigorous testing at independent labs for moisture, admixture, and pesticide residue before any consignment.' },
        { icon: TrendingUp, title: 'Market Expertise', desc: 'Real-time market intelligence helping buyers time their bulk purchases against daily market fluctuations.' },
    ];

    return (
        <div className="bg-background dark:bg-secondary pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div {...fadeUp} className="text-center mb-16">
                    <h1 className="text-4xl font-display font-extrabold text-text-main dark:text-white tracking-tight mb-4">Deep Roots in the Miryalaguda Ecosystem</h1>
                    <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-6" />
                    <p className="max-w-3xl mx-auto text-xl text-text-muted dark:text-gray-400 leading-relaxed">Decades of canvassing expertise, connecting the finest local millers with global merchants.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                    <motion.div {...fadeUp} className="flex flex-col gap-6 w-full">
                        <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
                            <img 
                                src="/about-mill-1200.jpg"
                                alt="Advanced Rice Milling Facility" 
                                width="1200"
                                height="1200"
                                className="w-full h-auto transition-transform duration-700 group-hover:scale-110" 
                                loading="lazy" 
                                decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <p className="absolute bottom-4 left-4 text-white font-bold">Industrial Milling Infrastructure</p>
                        </div>
                    </motion.div>
                    <motion.div {...fadeUp} className="space-y-6 text-lg text-text-muted dark:text-gray-300 leading-relaxed">
                        <h2 className="text-3xl font-display font-bold text-text-main dark:text-white mb-4">Our Legacy in Rice Trade</h2>
                        <p>Located in Miryalaguda, Telangana—the renowned industrial hub of paddy cultivation and milling in India—<span className="font-bold text-text-main dark:text-white text-primary">Sri Srinivasa Canvassing</span> operates at the very center of the rice trade ecosystem. With over two decades of on-ground experience, we have witnessed the evolution of the industry from traditional methods to modern, high-precision milling.</p>
                        <p>As experienced canvassers, we possess deep-rooted, multi-generational relationships with over 100+ state-of-the-art rice mills in the Nalgonda region. We act as a critical bridge between local expertise and global demand, ensuring that international merchants receive exactly what they specify—nothing less.</p>
                        <p>Our localized presence allows us to closely monitor every stage of the lifecycle: from paddy procurement in the lush Krishna River basin to high-tech Sortex milling and final pre-shipment quality checks. This end-to-end oversight is what allows our global clients to trade with absolute confidence.</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                    <motion.div {...fadeUp} className="order-2 md:order-1 space-y-6 text-lg text-text-muted dark:text-gray-300 leading-relaxed">
                        <h2 className="text-3xl font-display font-bold text-text-main dark:text-white mb-4">Why Miryalaguda Rice?</h2>
                        <p>Miryalaguda rice owes its legendary reputation to a perfect convergence of natural geography, massive industrial scale, and cutting-edge technology. Situated in the fertile Krishna River basin, the region benefits from nutrient-rich soils and a reliable network of irrigation canals stemming from the Nagarjuna Sagar Dam, allowing local farmers to cultivate exceptionally high-quality paddy across multiple seasons.</p>
                        <p>What truly sets Miryalaguda apart, however, is its status as one of India's largest rice processing clusters, housing hundreds of highly automated mills. By utilizing advanced <span className="text-text-main dark:text-white font-bold">Swiss Bühler technology</span> and precision color sorters, these mills achieve a remarkably low broken-grain rate and superior quality control. The region has specialized heavily in premium parboiled rice, creating a massive export and domestic supply chain that serves as a vital food lifeline for states like Kerala, while its robust logistics infrastructure and massive byproduct ecosystem power hundreds of ancillary industries.</p>
                    </motion.div>

                    <motion.div {...fadeUp} className="order-1 md:order-2 flex flex-col gap-6 w-full">
                        <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
                            <img 
                                src="/about-canvassing-1200.jpg"
                                alt="Rice Canvassing and Quality Inspection" 
                                width="1200"
                                height="1200"
                                className="w-full h-auto transition-transform duration-700 group-hover:scale-110" 
                                loading="lazy" 
                                decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <p className="absolute bottom-4 left-4 text-white font-bold">Expert Canvassing & Inspection</p>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {values.map((v, i) => (
                        <GlassCard key={v.title} variant="premium" delay={i * 0.12}>
                            <v.icon className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-xl font-display font-bold text-text-main dark:text-white mb-3">{v.title}</h3>
                            <p className="text-text-muted dark:text-gray-400">{v.desc}</p>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;
