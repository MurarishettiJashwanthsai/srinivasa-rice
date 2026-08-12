import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Eye, Save, Trash2, Smartphone, Download, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import GlassCard from '../components/GlassCard';

const CardEditor = () => {
    const navigate = useNavigate();
    
    // Load cards from localStorage or use default
    const [cards, setCards] = useState(() => {
        const saved = localStorage.getItem('digital_cards');
        if (saved) return JSON.parse(saved);
        return [
            { id: 1, name: 'Srinivasulu', designation: 'Managing Director', phone: '+91 9866760028', email: 'srinivasulu@srinivascanvassing.com', specialization: 'Sona Masuri, Basmati, IR64', linkedin: 'https://www.linkedin.com/in/murarishetti-srinivasulu/', slug: 'srinivasulu' }
        ];
    });

    useEffect(() => {
        localStorage.setItem('digital_cards', JSON.stringify(cards));
    }, [cards]);

    const [editingCard, setEditingCard] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', 
        designation: '', 
        phone: '', 
        email: '', 
        specialization: '', 
        linkedin: '',
        slug: '' 
    });

    const handleEdit = (card) => {
        setEditingCard(card.id);
        setFormData({ 
            name: card.name, 
            designation: card.designation, 
            phone: card.phone, 
            email: card.email, 
            specialization: card.specialization, 
            linkedin: card.linkedin || '',
            slug: card.slug || '' 
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            toast.error('Name and Phone Number are required!');
            return;
        }

        const slug = formData.slug.trim() || formData.name.toLowerCase().trim().replace(/\s+/g, '-');
        
        // Check if slug is unique (excluding the current card being edited)
        const isSlugTaken = cards.some(c => c.slug === slug && c.id !== editingCard);
        if (isSlugTaken) {
            toast.error('This URL Slug is already taken. Please choose another.');
            return;
        }

        const newCardData = {
            id: editingCard || Date.now(),
            ...formData,
            slug
        };

        if (editingCard) {
            setCards(cards.map(c => c.id === editingCard ? newCardData : c));
            toast.success('Digital Card updated successfully!');
        } else {
            setCards([...cards, newCardData]);
            toast.success('New Digital Card created!');
        }

        // Reset form
        setEditingCard(null);
        setFormData({ name: '', designation: '', phone: '', email: '', specialization: '', slug: '' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this digital card? This action cannot be undone.')) {
            setCards(cards.filter(c => c.id !== id));
            toast.success('Card removed.');
        }
    };

    const getBaseUrl = () => {
        // Use the current origin or default to production
        return window.location.origin === 'http://localhost:5173' 
            ? 'https://srinivascanvassing.com' 
            : window.location.origin;
    };

    return (
        <div className="min-h-screen bg-background pt-10 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button & Title */}
                <button onClick={() => navigate('/admin')} className="group text-sm font-black text-text-muted hover:text-primary flex items-center gap-2 mb-8 uppercase tracking-widest transition-all">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Terminal
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tight mb-2">Card Forge</h1>
                        <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-xs">Generate Industrial-Grade Digital Identity Cards</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: Form */}
                    <div className="lg:col-span-2">
                        <div className="premium-card !p-8 rounded-3xl border-primary/10">
                            <h2 className="text-xl font-display font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                                <Plus className="w-5 h-5 text-primary" />
                                {editingCard ? 'Refactor Identity' : 'Initialize New Identity'}
                            </h2>
                            
                            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Full Name *</label>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                        placeholder="Agent Name" 
                                        className="input-premium !bg-black/20 !py-3 !text-base" 
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Designation</label>
                                    <input 
                                        type="text" 
                                        value={formData.designation} 
                                        onChange={e => setFormData({ ...formData, designation: e.target.value })} 
                                        placeholder="Sales Manager" 
                                        className="input-premium !bg-black/20 !py-3 !text-base" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Phone Number *</label>
                                    <input 
                                        type="text" 
                                        value={formData.phone} 
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                                        placeholder="+91 98667..." 
                                        className="input-premium !bg-black/20 !py-3 !text-base" 
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Official Email</label>
                                    <input 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={e => setFormData({ ...formData, email: e.target.value })} 
                                        placeholder="agent@srinivascanvassing.com" 
                                        className="input-premium !bg-black/20 !py-3 !text-base" 
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Specialization (Variety Expertise)</label>
                                    <input 
                                        type="text" 
                                        value={formData.specialization} 
                                        onChange={e => setFormData({ ...formData, specialization: e.target.value })} 
                                        placeholder="Sona Masuri, IR64, Broken Rice" 
                                        className="input-premium !bg-black/20 !py-3 !text-base" 
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">LinkedIn Profile URL</label>
                                    <input 
                                        type="url" 
                                        value={formData.linkedin} 
                                        onChange={e => setFormData({ ...formData, linkedin: e.target.value })} 
                                        placeholder="https://www.linkedin.com/in/murarishetti-srinivasulu/" 
                                        className="input-premium !bg-black/20 !py-3 !text-base" 
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">URL Slug (Personalized Link)</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/20 font-bold text-sm select-none">/card/</span>
                                        <input 
                                            type="text" 
                                            value={formData.slug} 
                                            onChange={e => setFormData({ ...formData, slug: e.target.value })} 
                                            placeholder="agent-name" 
                                            className="input-premium !bg-black/20 !py-3 !text-base flex-grow" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="md:col-span-2 pt-4">
                                    <button type="submit" className="button-primary w-full !py-4 !rounded-2xl">
                                        <Save className="w-5 h-5" />
                                        {editingCard ? 'Commit Updates' : 'Deploy Digital Card'}
                                    </button>
                                    {editingCard && (
                                        <button 
                                            type="button"
                                            onClick={() => { setEditingCard(null); setFormData({ name: '', designation: '', phone: '', email: '', specialization: '', linkedin: '', slug: '' }); }}
                                            className="w-full mt-3 py-3 border-2 border-white/5 rounded-2xl text-white/40 font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
                                        >
                                            Abort Refactor
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right: Card Management List */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-display font-black text-white uppercase tracking-tight mb-4 flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-primary" />
                            Deployed Units
                        </h2>
                        
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {cards.map((card) => (
                                <div key={card.id} className="premium-card !p-5 rounded-2xl border-white/5 hover:border-primary/30 transition-all group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="overflow-hidden">
                                            <h3 className="font-black text-white uppercase tracking-tight truncate">{card.name}</h3>
                                            <p className="text-[10px] text-primary font-black uppercase tracking-widest">{card.designation}</p>
                                        </div>
                                        <div className="bg-white p-2 rounded-xl shrink-0 shadow-lg">
                                            <QRCodeSVG 
                                                value={`${getBaseUrl()}/card/${card.slug}`} 
                                                size={64} 
                                                level="M" 
                                                fgColor="#000000" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                                        <a href={`/card/${card.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-emerald/10 text-emerald hover:bg-emerald/20 transition-all" title="Preview">
                                            <Eye className="w-4 h-4" />
                                        </a>
                                        <button onClick={() => handleEdit(card)} className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all" title="Edit">
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(card.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => { 
                                                navigator.clipboard.writeText(`${getBaseUrl()}/card/${card.slug}`); 
                                                toast.success('Intelligence Link Copied!'); 
                                            }} 
                                            className="ml-auto p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all" 
                                            title="Copy Link"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardEditor;
