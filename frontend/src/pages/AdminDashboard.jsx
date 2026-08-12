import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogOut, Trash2, Plus, Edit2, Check, X, ImagePlus, Users, MessageSquareShare, MessageCircle, CreditCard, Search, Building2, Phone, Calendar, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const INITIAL_LEADS = [
    {
        id: 1,
        request_id: "RFQ-2026-A1B2",
        name: "Rajesh Kumar",
        company: "Sri Laxmi Traders",
        email: "rajesh@srilaxmitraders.com",
        whatsapp: "+919866760028",
        destination_country: "India",
        destination_port: "Chennai Port",
        product_name: "Sona Masuri Steam",
        quantity_mt: 50,
        packaging_type: "50kg PP Bag",
        incoterm: "FOB",
        inquiry_text: "Interested in 50 MT Sona Masuri Steam rice export quality. Please share latest FOB price quote.",
        status: "contacted",
        source_page: "contact",
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
        id: 2,
        request_id: "RFQ-2026-C3D4",
        name: "Ahmed Al-Mansoor",
        company: "Al-Khaleej Foodstuffs LLC",
        email: "ahmed@alkhaleejfood.ae",
        whatsapp: "+919866760028",
        destination_country: "UAE",
        destination_port: "Jebel Ali Port",
        product_name: "1121 Basmati Sella",
        quantity_mt: 100,
        packaging_type: "50kg PP Bag",
        incoterm: "CIF",
        inquiry_text: "Looking for regular supply of 1121 Basmati Sella 50kg PP bags to Jebel Ali. Need CIF Dubai rate.",
        status: "in_progress",
        source_page: "contact",
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
        id: 3,
        request_id: "RFQ-2026-E5F6",
        name: "Venkatesh Rao",
        company: "Rao Global Impex",
        email: "vrao@raoglobalimpex.com",
        whatsapp: "+919866760028",
        destination_country: "India",
        destination_port: "Visakhapatnam Port",
        product_name: "IR64 5% Broken",
        quantity_mt: 200,
        packaging_type: "50kg PP Bag",
        incoterm: "FOB",
        inquiry_text: "Require 200 MT IR64 5% Broken Non-Basmati Rice for immediate shipment. Please send specifications.",
        status: "new",
        source_page: "contact",
        created_at: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
        id: 4,
        request_id: "RFQ-2026-G7H8",
        name: "Karthik Sharma",
        company: "South Asia Grain Corp",
        email: "karthik@southasiagrain.com",
        whatsapp: "+919866760028",
        destination_country: "Singapore",
        destination_port: "Jurong Port",
        product_name: "Sona Masuri Raw",
        quantity_mt: 25,
        packaging_type: "25kg Non-Woven Bag",
        incoterm: "CIF",
        inquiry_text: "Requesting price quote and moisture report for Sona Masuri Raw 25kg non-woven bag packaging.",
        status: "new",
        source_page: "contact",
        created_at: new Date(Date.now() - 3600000 * 72).toISOString()
    }
];

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('inventory');
    const [leads, setLeads] = useState(INITIAL_LEADS);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [products, setProducts] = useState([]);
    const [newVariety, setNewVariety] = useState({ name: '', initial_price: '' });
    const [newImage, setNewImage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editPrice, setEditPrice] = useState('');
    const [editName, setEditName] = useState('');
    const [inquirySearch, setInquirySearch] = useState('');
    const [expandedInquiry, setExpandedInquiry] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('admin_token');
    const API = API_BASE_URL;

    const fetchProducts = useCallback(async () => {
        try { 
            const res = await fetch(`${API}/api/products?t=${Date.now()}`); 
            if (res.ok) setProducts(await res.json()); 
        } catch { 
            toast.error('Failed to load products'); 
        }
    }, [API]);

    const fetchLeads = useCallback(async () => {
        try {
            const res = await fetch(`${API}/api/leads?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setLeads(data.length > 0 ? data : INITIAL_LEADS);
            } else {
                setLeads(INITIAL_LEADS);
            }
        } catch {
            setLeads(INITIAL_LEADS);
        }
    }, [API, token]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProducts();
        fetchLeads();
    }, [fetchProducts, fetchLeads]);

    const generateBroadcast = () => {
        const date = new Date().toLocaleDateString('en-IN');
        let msg = `🚨 *Sri Srinivasa Canvassing* 🚨\n📍 Miryalaguda Live Market Rates\n📅 Date: ${date}\n\n`;
        products.forEach(p => { msg += `🌾 *${p.variety_name}*: ₹${p.current_price_mt}/MT\n`; });
        msg += `\nPrices are indicative & subject to immediate change based on mill availability.\n\nReply to lock your indent!`;
        setBroadcastMessage(msg);
    };

    const handleLogout = () => { localStorage.removeItem('admin_token'); navigate('/admin/login'); };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newVariety.name || !newVariety.initial_price) return;
        const formData = new FormData();
        formData.append('name', newVariety.name);
        formData.append('initial_price', parseFloat(newVariety.initial_price));
        if (newImage) formData.append('image', newImage);
        try {
            const res = await fetch(`${API}/api/products/add`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
            if (res.ok) { 
                const added = await res.json();
                toast.success(`${newVariety.name} added`); 
                setNewVariety({ name: '', initial_price: '' }); 
                setNewImage(null); 
                const fi = document.getElementById('new-image-input'); 
                if (fi) fi.value = ''; 
                setProducts(prev => [...prev.filter(p => p.id !== added.id), added]);
                fetchProducts(); 
            } else if (res.status === 401) {
                toast.error('Session expired. Please log in again.');
                handleLogout();
            } else { 
                const err = await res.json(); 
                toast.error(err.detail || 'Failed'); 
            }
        } catch { toast.error('Network error'); }
    };

    const handleSaveUpdate = async (id, confirmUnusual = true) => {
        try {
            const res = await fetch(`${API}/api/products/update/${id}`, { 
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
                body: JSON.stringify({ 
                    name: editName, 
                    new_price_mt: parseFloat(editPrice),
                    confirm_unusual_rate: confirmUnusual
                }) 
            });
            if (res.ok) { 
                const updated = await res.json();
                toast.success(`${editName} updated successfully`); 
                setEditingId(null); 
                setProducts(prev => prev.map(p => p.id === id ? updated : p));
                fetchProducts(); 
            } else if (res.status === 401) {
                toast.error('Session expired. Please log in again.');
                handleLogout();
            } else {
                const data = await res.json();
                if (data.detail && (data.detail.includes('20% variance threshold') || data.detail.includes('UNUSUAL RATE WARNING') || data.detail.includes('variance exceeds'))) {
                    if (window.confirm(`${data.detail}\n\nAre you sure you want to force save this price change?`)) {
                        handleSaveUpdate(id, true);
                        return;
                    }
                }
                toast.error(data.detail || 'Failed to update product rate');
            }
        } catch { 
            toast.error('Network error updating product'); 
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Archive ${name}? This will hide the variety from public view while preserving historical records.`)) return;
        try {
            const res = await fetch(`${API}/api/products/delete/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) { 
                toast.success(`${name} archived successfully`); 
                setProducts(prev => prev.filter(p => p.id !== id));
                fetchProducts(); 
            } else if (res.status === 401) {
                toast.error('Session expired. Please log in again.');
                handleLogout();
            } else {
                toast.error('Failed to archive variety');
            }
        } catch { toast.error('Network error'); }
    };

    const handleImageUpload = async (id, file) => {
        if (!file) return;
        const formData = new FormData(); formData.append('image', file);
        try {
            const res = await fetch(`${API}/api/products/${id}/image`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
            if (res.ok) { 
                const updated = await res.json();
                toast.success('Product image updated'); 
                setProducts(prev => prev.map(p => p.id === id ? updated : p));
                fetchProducts(); 
            } else if (res.status === 401) {
                toast.error('Session expired. Please log in again.');
                handleLogout();
            } else { 
                const err = await res.json(); 
                toast.error(err.detail || 'Failed'); 
            }
        } catch { toast.error('Network error'); }
    };

    const inputClass = "w-full px-4 py-2.5 rounded-xl border border-border dark:border-white/10 bg-surface dark:bg-secondary-light/30 text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm";

    return (
        <div className="min-h-screen bg-background dark:bg-secondary py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-text-main dark:text-white">Admin Dashboard</h1>
                        <p className="text-sm text-text-muted dark:text-gray-400 mt-1">Manage live market rates and global inquiries.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/admin/crm" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald/10 text-emerald font-semibold text-sm border border-emerald/20 hover:bg-emerald/20 transition-all">
                            <MessageCircle className="w-4 h-4" /> WhatsApp CRM
                        </Link>
                        <Link to="/admin/cards" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold text-sm border border-primary/20 hover:bg-primary/20 transition-all">
                            <CreditCard className="w-4 h-4" /> Digital Cards
                        </Link>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border dark:border-white/10 text-sm font-medium text-text-muted dark:text-gray-300 hover:bg-surface-hover dark:hover:bg-white/5 transition-all">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-surface dark:bg-secondary-light/30 rounded-2xl mb-8 border border-border dark:border-white/10">
                    {[{ id: 'inventory', label: 'Live Inventory', icon: Plus }, { id: 'leads', label: `Inquiries & CRM (${leads.length})`, icon: Users }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-text-muted dark:text-gray-400 hover:bg-surface-hover dark:hover:bg-white/5'}`}>
                            <tab.icon className="w-4 h-4" />{tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'inventory' && (
                    <>
                        {/* Add Product */}
                        <div className="premium-card rounded-2xl p-6 mb-8">
                            <h2 className="text-lg font-display font-bold text-text-main dark:text-white mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />Add New Variety</h2>
                            <form onSubmit={handleAddProduct} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium text-text-muted dark:text-gray-400 mb-1">Product / Variety Name</label>
                                    <input type="text" required value={newVariety.name} onChange={e => setNewVariety({ ...newVariety, name: e.target.value })} placeholder="e.g. Sona Masuri" className={inputClass} />
                                </div>
                                <div className="flex-1 w-full md:max-w-xs">
                                    <label className="block text-sm font-medium text-text-muted dark:text-gray-400 mb-1">Price (₹/MT)</label>
                                    <input type="number" step="0.01" required value={newVariety.initial_price} onChange={e => setNewVariety({ ...newVariety, initial_price: e.target.value })} placeholder="0.00" className={inputClass} />
                                </div>
                                <div className="flex-1 w-full md:max-w-xs">
                                    <label className="block text-sm font-medium text-text-muted dark:text-gray-400 mb-1">Image</label>
                                    <input id="new-image-input" type="file" accept="image/*" onChange={e => setNewImage(e.target.files[0])} className={`${inputClass} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white`} />
                                </div>
                                <button type="submit" className="w-full md:w-auto px-6 py-2.5 bg-emerald hover:bg-emerald-dark text-white font-semibold rounded-xl shadow-sm transition-all text-sm h-[42px] hover:scale-105">Add Product</button>
                            </form>
                        </div>

                        {/* Table */}
                        <div className="premium-card rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border dark:border-white/10 text-xs uppercase tracking-wider text-text-muted dark:text-gray-400 font-semibold">
                                            <th className="py-4 px-6">Image</th><th className="py-4 px-6">ID</th><th className="py-4 px-6">Variety</th><th className="py-4 px-6">Price (₹/MT)</th><th className="py-4 px-6">Updated</th><th className="py-4 px-6 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border dark:divide-white/5">
                                        {products.map((item, i) => (
                                            <tr key={item.id} className="hover:bg-surface-hover dark:hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-6 w-20">
                                                    <div className="relative group w-14 h-14 bg-surface-hover dark:bg-white/5 rounded-xl overflow-hidden flex items-center justify-center border border-border dark:border-white/10 mx-auto">
                                                        {item.image_url ? <img src={item.image_url.startsWith('http') ? item.image_url : `${API}/${item.image_url}`} alt={item.variety_name} className="w-full h-full object-cover" /> : <span className="text-text-subtle text-xs">No img</span>}
                                                        <label className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity rounded-xl"><ImagePlus className="w-4 h-4 mb-0.5" /><span className="text-[9px] font-bold">Upload</span><input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(item.id, e.target.files[0])} /></label>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-text-muted">#{i + 1}</td>
                                                <td className="py-4 px-6 text-sm font-semibold text-text-main dark:text-white">
                                                    {editingId === item.id ? <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className={`${inputClass} min-w-[140px]`} /> : item.variety_name}
                                                </td>
                                                <td className="py-4 px-6 text-sm">
                                                    {editingId === item.id ? <input type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className={`${inputClass} w-28`} autoFocus /> : <span className="font-bold text-emerald">₹{item.current_price_mt.toFixed(2)}</span>}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-text-muted dark:text-gray-400">{new Date(item.last_updated).toLocaleString()}</td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex justify-center items-center gap-2">
                                                        {editingId === item.id ? (
                                                            <>
                                                                <button onClick={() => handleSaveUpdate(item.id)} className="p-1.5 rounded-lg bg-emerald/10 text-emerald hover:bg-emerald/20 transition-colors" title="Save"><Check className="w-4 h-4" /></button>
                                                                <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-text-muted hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title="Cancel"><X className="w-4 h-4" /></button>
                                                            </>
                                                        ) : (
                                                            <button onClick={() => { setEditingId(item.id); setEditPrice(item.current_price_mt.toString()); setEditName(item.variety_name); }} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                                        )}
                                                        <button onClick={() => handleDelete(item.id, item.variety_name)} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {products.length === 0 && <tr><td colSpan="6" className="py-12 text-center text-text-muted">No products found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'leads' && (
                    <div className="space-y-6">
                        {/* CRM Header Card */}
                        <div className="premium-card rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-border dark:border-white/10 flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <h2 className="text-lg font-display font-bold text-text-main dark:text-white flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" />Prospect CRM
                                        <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">{leads.length} Total</span>
                                    </h2>
                                    <p className="text-sm text-text-muted dark:text-gray-400 mt-0.5">All customer inquiries received from the Contact page.</p>
                                </div>
                                <button onClick={() => { const nums = leads.map(l => l.whatsapp).filter(Boolean).join(', '); if (nums) { navigator.clipboard.writeText(nums); toast.success("Numbers copied!"); } else toast.error("No numbers"); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald/10 text-emerald border border-emerald/20 text-sm font-semibold hover:bg-emerald/20 transition-all">
                                    <MessageSquareShare className="w-4 h-4" />Copy All WhatsApp Numbers
                                </button>
                            </div>

                            {/* Broadcast Generator */}
                            <div className="p-6 border-b border-border dark:border-white/10 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div>
                                    <h3 className="font-display font-bold text-text-main dark:text-white mb-2">WhatsApp Market Alert</h3>
                                    <p className="text-sm text-text-muted dark:text-gray-400 mb-4">Generate a pre-formatted message with today's live prices.</p>
                                    <button onClick={generateBroadcast} className="w-full px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold transition-all">Generate Price Alert</button>
                                </div>
                                <div className="lg:col-span-2 relative">
                                    <textarea value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} placeholder="Click 'Generate' to build message..." className="w-full h-32 p-4 text-sm border border-border dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none bg-surface dark:bg-secondary-light/30 text-text-main dark:text-white" />
                                    {broadcastMessage && <button onClick={() => { navigator.clipboard.writeText(broadcastMessage); toast.success("Copied!"); }} className="absolute bottom-4 right-4 px-3 py-1.5 bg-secondary dark:bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all">Copy</button>}
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="p-4 sm:p-6">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted dark:text-gray-500" />
                                    <input
                                        type="text"
                                        value={inquirySearch}
                                        onChange={e => setInquirySearch(e.target.value)}
                                        placeholder="Search by name, company, or inquiry text…"
                                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border dark:border-white/10 bg-surface dark:bg-secondary-light/30 text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Inquiry Cards */}
                        {(() => {
                            const q = inquirySearch.toLowerCase();
                            const filtered = leads.filter(l =>
                                !q ||
                                l.name?.toLowerCase().includes(q) ||
                                l.company?.toLowerCase().includes(q) ||
                                l.inquiry_text?.toLowerCase().includes(q) ||
                                l.whatsapp?.includes(q)
                            );

                            if (filtered.length === 0) {
                                return (
                                    <div className="premium-card rounded-2xl p-12 text-center">
                                        <MessageSquare className="w-12 h-12 text-text-muted dark:text-gray-500 mx-auto mb-4 opacity-40" />
                                        <p className="text-text-muted dark:text-gray-400 font-medium">{leads.length === 0 ? 'No inquiries received yet.' : 'No inquiries match your search.'}</p>
                                    </div>
                                );
                            }

                            return filtered.map((lead, index) => {
                                const isExpanded = expandedInquiry === lead.id;
                                const isLong = lead.inquiry_text?.length > 200;
                                const displayText = isLong && !isExpanded
                                    ? lead.inquiry_text.slice(0, 200) + '…'
                                    : lead.inquiry_text;

                                const date = new Date(lead.created_at);
                                const formattedDate = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                                const formattedTime = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

                                return (
                                    <div key={lead.id} className="premium-card rounded-2xl p-5 sm:p-6 hover:border-primary/30 transition-all duration-200 border border-transparent">
                                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                            {/* Serial Badge */}
                                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                                                #{filtered.length - index}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                {/* Top row: name + date */}
                                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                                    <h3 className="text-base font-bold text-text-main dark:text-white">{lead.name}</h3>
                                                    <div className="flex items-center gap-1.5 text-xs text-text-muted dark:text-gray-400">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>{formattedDate}</span>
                                                        <span className="opacity-50">·</span>
                                                        <span>{formattedTime}</span>
                                                    </div>
                                                </div>

                                                {/* Meta: company + phone */}
                                                <div className="flex flex-wrap gap-3 mb-4">
                                                    {lead.company && (
                                                        <span className="inline-flex items-center gap-1.5 text-sm text-text-muted dark:text-gray-400">
                                                            <Building2 className="w-3.5 h-3.5 text-primary/60" />
                                                            {lead.company}
                                                        </span>
                                                    )}
                                                    <a
                                                        href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-sm text-emerald font-semibold hover:underline"
                                                    >
                                                        <Phone className="w-3.5 h-3.5" />
                                                        {lead.whatsapp}
                                                    </a>
                                                </div>

                                                {/* Inquiry text label */}
                                                <div className="mb-1">
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-primary/70">
                                                        <MessageSquare className="w-3 h-3" /> Inquiry
                                                    </span>
                                                </div>

                                                {/* Full inquiry text */}
                                                <div className="bg-surface dark:bg-secondary-light/20 border border-border dark:border-white/8 rounded-xl px-4 py-3">
                                                    <p className="text-sm text-text-main dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{displayText}</p>
                                                    {isLong && (
                                                        <button
                                                            onClick={() => setExpandedInquiry(isExpanded ? null : lead.id)}
                                                            className="mt-2 flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                                                        >
                                                            {isExpanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show Less</> : <><ChevronDown className="w-3.5 h-3.5" /> Read Full Inquiry</>}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quick action */}
                                            <div className="flex-shrink-0">
                                                <a
                                                    href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${lead.name}, thank you for your inquiry about ${lead.inquiry_text?.slice(0, 60)}. We'd like to discuss further.`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald/10 text-emerald border border-emerald/20 text-xs font-bold hover:bg-emerald/20 transition-all whitespace-nowrap"
                                                >
                                                    <MessageCircle className="w-4 h-4" /> Reply on WA
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
