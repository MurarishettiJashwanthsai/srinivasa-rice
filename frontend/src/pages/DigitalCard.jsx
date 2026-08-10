import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Globe, Download, Share2, MessageCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';

/* ─── Inline SVG icons ─────────────────────────────────────────── */
const Smartphone = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        strokeLinejoin="round" className={className}>
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <path d="M12 18h.01" />
    </svg>
);

const WhatsAppIcon = ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor">
        <path d="M16 3C9.37 3 4 8.37 4 15c0 2.39.68 4.63 1.86 6.54L4 29l7.7-1.83A12.93 12.93 0 0016 28c6.63 0 12-5.37 12-12S22.63 3 16 3zm6.15 17.15c-.26.73-1.52 1.39-2.1 1.47-.55.08-1.24.11-2-.13a18.2 18.2 0 01-1.81-.67C13.18 19.57 11 16.77 10.83 16.54c-.17-.23-1.38-1.84-1.38-3.51 0-1.67.87-2.49 1.18-2.83.31-.34.67-.43.9-.43.22 0 .45.01.64.01.21 0 .49-.08.77.59.28.67.95 2.31.1.52 2.31-.28.67-.45 1.2-.89 1.56-.44.36-.9.8-.39 1.57.52.77 2.3 3.8 4.97 5.18.7.35 1.24.56 1.66.72.7.26 1.33.22 1.83.13.56-.1 1.72-.7 1.96-1.38.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.33z" />
    </svg>
);

/* ─── Fade / slide animation variants ─────────────────────────── */
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ═══════════════════════════════════════════════════════════════ */
const DigitalCard = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCard = () => {
            try {
                const savedCards = localStorage.getItem('digital_cards');
                const defaultCard = {
                    name: 'Srinivasulu',
                    designation: 'Managing Director',
                    company: 'Sri Srinivasa Canvassing',
                    phone: '+91 9866760028',
                    whatsapp: '919866760028',
                    email: 'srinivasulu@srinivascanvassing.com',
                    photo: '/logo.png',
                    specialization: 'Sona Masuri, Basmati, IR64 — Bulk Export',
                    location: 'Miryalaguda, Telangana, India',
                    website: 'https://www.srinivascanvassing.com',
                    slug: 'srinivasulu',
                };

                const currentSlug = slug?.toLowerCase().trim();

                if (savedCards) {
                    const cards = JSON.parse(savedCards);
                    const found = cards.find(c => c.slug?.toLowerCase().trim() === currentSlug);
                    if (found) { setCard(found); setLoading(false); return; }
                }

                if (currentSlug === 'srinivasulu' || !currentSlug) {
                    setCard(defaultCard);
                } else {
                    setCard(null);
                }
            } catch {
                setCard(null);
            } finally {
                setLoading(false);
            }
        };
        fetchCard();
    }, [slug]);

    const handleDownloadVCard = () => {
        if (!card) return;
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${card.name}\nORG:${card.company || 'Sri Srinivasa Canvassing'}\nTITLE:${card.designation}\nTEL;TYPE=CELL,VOICE:${card.phone}\nTEL;TYPE=WORK,MSG:${card.whatsapp || card.phone}\nEMAIL;TYPE=INTERNET:${card.email}\nADR;TYPE=WORK:;;${card.location};;;;\nURL:${card.website || 'https://srinivascanvassing.com'}\nEND:VCARD`;
        const blob = new Blob([vcard], { type: 'text/vcard' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${card.name.replace(/\s/g, '_')}.vcf`; a.click();
        URL.revokeObjectURL(url);
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({ title: `${card.name} — Sri Srinivasa Canvassing`, text: `Contact card for ${card.name}`, url });
        } else {
            navigator.clipboard.writeText(url);
            alert('Link copied!');
        }
    };

    /* ── Loading ─────────────────────────────────────────────── */
    if (loading) return (
        <div className="min-h-screen bg-[#06091a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.35em]">Loading Card…</p>
            </div>
        </div>
    );

    /* ── Not found ───────────────────────────────────────────── */
    if (!card) return (
        <div className="min-h-screen bg-[#06091a] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20">
                <Smartphone className="w-9 h-9 text-red-500" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase mb-3 tracking-tight">Card Not Found</h1>
            <p className="text-white/40 font-bold text-xs mb-8 max-w-xs leading-relaxed uppercase tracking-widest">
                The link <span className="text-amber-400">/card/{slug}</span> does not exist in the registry.
            </p>
            <button onClick={() => navigate('/admin/cards')} className="button-primary !py-4 !px-8">
                Go to Card Forge
            </button>
        </div>
    );

    // vCard QR — scanning on phone shows "Save to Contacts" prompt directly
    const vCardData = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${card.name}`,
        `N:${card.name};;;;`,
        `ORG:${card.company || 'Sri Srinivasa Canvassing'}`,
        `TITLE:${card.designation || 'Managing Director'}`,
        `TEL;TYPE=CELL,VOICE:${card.phone}`,
        `TEL;TYPE=WORK,MSG:${(card.whatsapp || card.phone).replace(/\D/g, '')}`,
        `EMAIL;TYPE=INTERNET:${card.email}`,
        `ADR;TYPE=WORK:;;${card.location || 'Miryalaguda, Telangana, India'};;;;`,
        `URL:${card.website || 'https://www.srinivascanvassing.com/'}`,
        'END:VCARD',
    ].join('\n');

    /* ── Render ──────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-[#06091a] flex items-center justify-center p-4 py-14 relative overflow-hidden">
            {/* Ambient blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-amber-500/6 rounded-full blur-[140px]" />
                <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/4 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[400px] relative z-10"
            >
                {/* ══ CARD SHELL ══════════════════════════════════════════ */}
                <div className="rounded-[2.5rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7)] border border-white/[0.07]"
                    style={{ background: 'linear-gradient(160deg, #0d1530 0%, #080d1e 100%)' }}>

                    {/* ── HEADER BAND ─────────────────────────────────── */}
                    <div className="relative h-44 overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)' }}>
                        {/* Diagonal stripe texture */}
                        <div className="absolute inset-0 opacity-[0.07]"
                            style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '14px 14px' }} />
                        {/* Dark vignette at bottom */}
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#080d1e] to-transparent" />
                        {/* Company watermark */}
                        <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/30 text-[9px] font-black uppercase tracking-[0.45em] whitespace-nowrap">
                            Sri Srinivasa Canvassing
                        </p>
                        {/* Gold accent line */}
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-amber-400/60 rounded-full" />
                    </div>

                    {/* ── LOGO AVATAR — outside overflow-hidden so it's never clipped ── */}
                    <div className="flex justify-center -mt-14 relative z-10">
                        <div className="relative">
                            {/* Gold outer ring */}
                            <div className="absolute -inset-1.5 rounded-[2rem] border border-amber-400/40 pointer-events-none" />
                            {/* Logo box */}
                            <div className="w-28 h-28 rounded-[1.75rem] border-4 border-[#080d1e] overflow-hidden bg-white shadow-[0_12px_48px_rgba(0,0,0,0.6)]">
                                <img
                                    src="/logo.png"
                                    alt="Sri Srinivasa Canvassing Logo"
                                    className="w-full h-full object-contain p-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── IDENTITY BLOCK ──────────────────────────────── */}
                    <motion.div {...fadeUp(0.15)} className="pt-4 pb-6 px-8 text-center">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-1">
                            {card.name}
                        </h1>
                        <p className="text-amber-400 font-black text-xs uppercase tracking-[0.3em] mb-1">
                            {card.designation}
                        </p>
                        <p className="text-white/35 font-bold text-[10px] uppercase tracking-widest mb-6">
                            {card.company || 'Sri Srinivasa Canvassing'}
                        </p>

                        {/* Specialty tags */}
                        {card.specialization && (
                            <div className="flex flex-wrap justify-center gap-2">
                                {card.specialization.split(',').slice(0, 3).map((s, i) => (
                                    <span key={i}
                                        className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest"
                                        style={{
                                            background: i === 0 ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${i === 0 ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.07)'}`,
                                            color: i === 0 ? '#fbbf24' : 'rgba(255,255,255,0.4)',
                                        }}>
                                        {s.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Thin gold divider */}
                    <div className="mx-8 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />

                    {/* ── QUICK ACTIONS ───────────────────────────────── */}
                    <motion.div {...fadeUp(0.25)} className="px-6 py-6 grid grid-cols-3 gap-3">
                        {[
                            { icon: Phone, label: 'Call', href: `tel:${card.phone}`, bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', color: '#10b981' },
                            { icon: WhatsAppIcon, label: 'WhatsApp', href: `https://wa.me/${(card.whatsapp || card.phone).replace(/\D/g, '')}`, bg: 'rgba(37,211,102,0.08)', border: 'rgba(37,211,102,0.2)', color: '#25D366' },
                            { icon: Mail, label: 'Email', href: `mailto:${card.email}`, bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', color: '#6366f1' },
                        ].map((act) => (
                            <a key={act.label} href={act.href}
                                className="flex flex-col items-center gap-2.5 py-5 rounded-2xl transition-all hover:scale-105 active:scale-95 group"
                                style={{ background: act.bg, border: `1px solid ${act.border}` }}>
                                <act.icon className="w-6 h-6 transition-transform group-hover:scale-110" style={{ color: act.color }} />
                                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: act.color }}>{act.label}</span>
                            </a>
                        ))}
                    </motion.div>

                    {/* ── CONTACT DETAILS ─────────────────────────────── */}
                    <motion.div {...fadeUp(0.35)} className="px-6 pb-6 space-y-3">
                        {[
                            { icon: Phone, value: card.phone, href: `tel:${card.phone}` },
                            { icon: Mail, value: card.email, href: `mailto:${card.email}` },
                            { icon: MapPin, value: card.location || 'Miryalaguda, Telangana, India', href: null },
                            ...(card.website ? [{ icon: Globe, value: card.website.replace(/https?:\/\//, ''), href: card.website }] : []),
                        ].map((item) => (
                            <div key={item.value}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
                                    <item.icon className="w-4 h-4 text-amber-400" />
                                </div>
                                {item.href ? (
                                    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
                                        rel="noopener noreferrer"
                                        className="text-sm font-bold text-white/70 hover:text-amber-400 transition-colors truncate">
                                        {item.value}
                                    </a>
                                ) : (
                                    <span className="text-sm font-bold text-white/70 truncate">{item.value}</span>
                                )}
                            </div>
                        ))}
                    </motion.div>

                    {/* Thin gold divider */}
                    <div className="mx-6 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                    {/* ── QR CODE SECTION ─────────────────────────────── */}
                    <motion.div {...fadeUp(0.45)} className="px-6 py-8 flex flex-col items-center">
                        <p className="text-[9px] font-black uppercase tracking-[0.45em] text-amber-400/70 mb-5">
                            Scan to Save Contact
                        </p>

                        {/* QR frame with corner brackets */}
                        <div className="relative p-1">
                            {/* Corner marks */}
                            {[
                                'top-0 left-0 border-t-2 border-l-2 rounded-tl-lg',
                                'top-0 right-0 border-t-2 border-r-2 rounded-tr-lg',
                                'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg',
                                'bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg',
                            ].map((cls, i) => (
                                <div key={i} className={`absolute w-6 h-6 border-amber-400/70 ${cls}`} />
                            ))}

                            {/* White QR background — quiet zone handled by marginSize */}
                            <div className="bg-white rounded-2xl p-3 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
                                <QRCodeSVG
                                    value={vCardData}
                                    size={180}
                                    level="H"
                                    fgColor="#000000"
                                    bgColor="#ffffff"
                                    marginSize={4}
                                    imageSettings={{
                                        src: '/logo.png',
                                        width: 38,
                                        height: 38,
                                        excavate: true,
                                    }}
                                />
                            </div>
                        </div>

                        <p className="mt-5 text-white/25 font-bold text-[10px] uppercase tracking-[0.3em]">
                            vCard · Contact Card · Tap to Save
                        </p>
                    </motion.div>

                    {/* Thin gold divider */}
                    <div className="mx-6 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                    {/* ── ACTION BUTTONS ──────────────────────────────── */}
                    <motion.div {...fadeUp(0.55)} className="px-6 py-6 flex flex-col gap-3">
                        <button onClick={handleDownloadVCard}
                            className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #fdbb2d, #f59e0b)', color: '#0d1530', boxShadow: '0 8px 24px rgba(251,191,36,0.25)' }}>
                            <Download className="w-5 h-5" />
                            Save Contact
                        </button>
                        <button onClick={handleShare}
                            className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-white/5 active:scale-95"
                            style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
                            <Share2 className="w-5 h-5" />
                            Share Digital Card
                        </button>
                    </motion.div>

                    {/* ── FOOTER ──────────────────────────────────────── */}
                    <div className="px-6 pb-8 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400/30" />
                            <img src="/logo.png" alt="" className="w-5 h-5 object-contain opacity-30" />
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400/30" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/15">
                            Sri Srinivasa Canvassing · Miryalaguda
                        </p>
                    </div>
                </div>

                {/* Bottom caption */}
                <p className="text-center text-white/10 text-[9px] font-black uppercase tracking-[0.5em] mt-8">
                    Premium Digital Identity
                </p>
            </motion.div>
        </div>
    );
};

export default DigitalCard;
