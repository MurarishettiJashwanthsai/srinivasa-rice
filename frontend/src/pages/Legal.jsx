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
                    <p className="text-text-muted text-xs font-bold mt-3">Effective date: 16 August 2026</p>
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
                            <h3 className="text-lg font-black text-text-main mt-6 mb-3">Data Controller</h3>
                            <p>
                                Sri Srinivasa Canvassing, Miryalaguda, Nalgonda District, Telangana 508207, India is the data controller for website enquiries. Privacy questions and data requests may be sent to <a href="mailto:srinivasulu@srinivascanvassing.com" className="text-primary hover:underline">srinivasulu@srinivascanvassing.com</a>.
                            </p>
                            <h3 className="text-lg font-black text-text-main mt-6 mb-3">1. Information We Collect</h3>
                            <p>
                                When you submit a bulk quote request or price alert subscription, we collect:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Full Name and Job/Company Designation</li>
                                <li>Registered Business Name</li>
                                <li>Business Email Address and WhatsApp / Telephone Number</li>
                                <li>Selected rice variety, quantity, quantity unit, packaging choice, and requirement details</li>
                                <li>Separate records of enquiry-processing consent and optional WhatsApp marketing consent</li>
                                <li>Technical anti-spam and security information, including an irreversible IP fingerprint for admin login protection</li>
                            </ul>
                            <h3 className="text-lg font-black text-text-main mt-6 mb-3">2. Purpose of Collection & Consent</h3>
                            <p>
                                Necessary enquiry details are processed strictly to respond to your wholesale quote request. Optional marketing consent for daily WhatsApp market rate alerts requires an explicit, separate opt-in checkbox during form submission. You may withdraw your consent at any time by contacting us at <a href="mailto:srinivasulu@srinivascanvassing.com" className="text-primary hover:underline">srinivasulu@srinivascanvassing.com</a>.
                            </p>
                            <h3 className="text-lg font-black text-text-main mt-6 mb-3">3. Service Providers</h3>
                            <p>
                                The website frontend is hosted by Vercel, the application backend and configured database infrastructure operate through Render, and product images may be processed by Cloudinary. When enabled, Cloudflare Turnstile performs anti-spam verification, Google Tag Manager loads privacy-limited analytics tags, and configured notification providers deliver internal enquiry alerts or customer reference confirmations. Each provider receives only the information necessary for its function.
                            </p>
                            <h3 className="text-lg font-black text-text-main mt-6 mb-3">4. Data Retention & Access Control</h3>
                            <p>
                                Inquiry records remain in the protected CRM while they are required to answer the request, maintain the business relationship, resolve disputes, or meet legal and accounting obligations. Records are not automatically deleted by the website. Authorized personnel periodically review records and archive or delete them only under an approved retention decision, preserving genuine enquiries unless removal is authorized.
                            </p>
                            <h3 className="text-lg font-black text-text-main mt-6 mb-3">5. Access, Correction, and Deletion Requests</h3>
                            <p>
                                You may request a copy of your submitted information, correction of inaccurate details, withdrawal of optional marketing consent, or deletion where no legal or contractual retention requirement applies. Send the request from the relevant business email address and include the enquiry reference number when available. We may verify identity before acting on a request.
                            </p>
                            <h3 className="text-lg font-black text-text-main mt-6 mb-3">6. Cookies, Security, and Analytics</h3>
                            <p>
                                Essential storage maintains preferences and secure admin sessions. When configured, Google Tag Manager measures page views, quote-form progress, successful or failed submissions, product quote selections, and WhatsApp button clicks. Analytics events exclude names, email addresses, telephone numbers, and free-text enquiries. Cloudflare Turnstile may process technical browser and network information to prevent automated submissions. We do not sell personal contact details or use third-party advertising cookies.
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
                                Agricultural commodities are subject to market fluctuations, monsoon crop yields, government export duty revisions, and port logistics constraints. Any third-party inspection, laboratory certificate, or port-of-loading verification is arranged only when included in the final buyer and supplier agreement.
                            </p>
                        </div>
                    </section>

                </div>

            </div>
        </div>
    );
};

export default Legal;
