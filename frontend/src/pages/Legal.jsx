import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Legal = () => {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [hash]);

    return (
        <div className="bg-background pt-10 pb-20 font-sans">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-black text-text-main tracking-tight mb-4">Legal & Policies</h1>
                    <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-6"></div>
                    <p className="text-text-muted text-sm font-bold max-w-xl mx-auto">
                        Operational transparency, data protection practices, and commodity price disclaimers for Sri Srinivasa Canvassing.
                    </p>
                </div>

                <div className="p-4 mb-8 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold leading-relaxed">
                    <strong>Notice:</strong> The legal documents and terms presented on this website provide general operational guidelines for business inquiries with Sri Srinivasa Canvassing. Commercial transactions, binding quotations, quality specifications, and delivery terms are finalized exclusively under executed B2B proforma invoices and sales contracts, subject to legal verification.
                </div>

                <div className="premium-card p-8 sm:p-12 space-y-16">

                    <section id="privacy-policy" className="scroll-mt-24">
                        <h2 className="text-3xl font-display font-black text-text-main mb-6">Privacy Policy</h2>
                        <div className="prose text-text-muted max-w-none space-y-4 font-bold text-sm leading-relaxed">
                            <p>
                                Sri Srinivasa Canvassing ("we", "us", or "our") respects the privacy of our business partners, millers, and global importers. This Privacy Policy outlines how we collect, process, retain, and protect business contact information submitted through our portal.
                            </p>
                            <h3 className="text-lg font-black text-text-main mt-6 mb-3">1. Information We Collect</h3>
                            <p>
                                When you submit a bulk quote request or price alert subscription, we collect:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Full Name and Job/Company Designation</li>
                                <li>Registered Business Name</li>
                                <li>Business Email Address and WhatsApp / Telephone Number</li>
                                <li>Destination Country, Destination Port, and Incoterm preferences</li>
                                <li>Rice variety requirement, quantity in MT, and packaging specifications</li>
                            </ul>
                            <h3 className="text-lg font-black text-text-main mt-6 mb-3">2. Purpose of Collection & Consent</h3>
                            <p>
                                Necessary enquiry details are processed strictly to respond to your wholesale quote request. Optional marketing consent for daily WhatsApp market rate alerts requires an explicit, separate opt-in checkbox during form submission. You may withdraw your consent at any time by contacting us at <a href="mailto:srinivasulu@srinivascanvassing.com" className="text-primary hover:underline">srinivasulu@srinivascanvassing.com</a>.
                            </p>
                            <h3 className="text-lg font-black text-text-main mt-6 mb-3">3. Data Retention & Access Control</h3>
                            <p>
                                Inquiry records are securely stored in protected database systems with access restricted to authorized canvassing personnel. Records are retained for up to 3 years to support ongoing commercial relations, after which they are archived or securely purged upon written owner approval.
                            </p>
                            <h3 className="text-lg font-black text-text-main mt-6 mb-3">4. Cookies & Analytics</h3>
                            <p>
                                This website uses essential functional cookies and local storage exclusively to maintain user preferences (such as theme selection). We do not deploy third-party advertising cookies or trade personal contact details.
                            </p>
                        </div>
                    </section>

                    <hr className="border-border" />

                    <section id="terms" className="scroll-mt-24">
                        <h2 className="text-3xl font-display font-black text-text-main mb-6">Terms & Conditions</h2>
                        <div className="prose text-text-muted max-w-none space-y-4 font-bold text-sm leading-relaxed">
                            <p>
                                By accessing and navigating this website, you agree to comply with the following B2B terms of use:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>This website functions as an information portal for agricultural rice canvassing and wholesale sourcing from Miryalaguda, Telangana.</li>
                                <li>No binding financial transaction or binding sales agreement is concluded directly through website submission alone.</li>
                                <li>We reserve the right to verify commercial credentials before issuing proforma quotations or sample dispatches.</li>
                                <li>All trademarks, mill partner badges, text, and visual assets belong to Sri Srinivasa Canvassing or their respective owners.</li>
                            </ul>
                        </div>
                    </section>

                    <hr className="border-border" />

                    <section id="disclaimer" className="scroll-mt-24">
                        <h2 className="text-3xl font-display font-black text-text-main mb-6">Commodity & Pricing Disclaimer</h2>
                        <div className="prose text-text-muted max-w-none space-y-4 font-bold text-sm leading-relaxed">
                            <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 text-text-main italic font-bold">
                                "All wholesale rates displayed on this website or communicated via daily alerts are indicative market figures from Miryalaguda. Final firm prices depend on specific rice grade, moisture content, broken percentage, Sortex quality, packaging choice, loading port, Incoterm, and prevailing freight/currency rates at the time of contract issuance."
                            </div>
                            <p className="mt-4">
                                Agricultural commodities are subject to market fluctuations, monsoon crop yields, government export duty revisions, and port logistics constraints. Sri Srinivasa Canvassing acts as an experienced canvassing partner ensuring third-party inspection (SGS/Bureau Veritas/Geo-Chem) at port of loading prior to final dispatch.
                            </p>
                        </div>
                    </section>

                </div>

            </div>
        </div>
    );
};

export default Legal;
