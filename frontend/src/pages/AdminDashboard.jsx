import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2, Plus, Edit2, Check, X, ImagePlus, Users, MessageSquareShare, MessageCircle, CreditCard, Search, Building2, Phone, Calendar, MessageSquare, ChevronDown, ChevronUp, Bell, BellRing, ShieldCheck, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import useInquiryNotifications from '../hooks/useInquiryNotifications';
import { RATE_UNIT_OPTIONS, getRateUnitShortLabel } from '../utils/rateUnits';
import { adminFetch, signOutAdmin } from '../utils/adminApi';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('inventory');
    const [leads, setLeads] = useState([]);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [products, setProducts] = useState([]);
    const [newVariety, setNewVariety] = useState({ name: '', initial_price: '', unit: 'MT' });
    const [newImage, setNewImage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editPrice, setEditPrice] = useState('');
    const [editName, setEditName] = useState('');
    const [editUnit, setEditUnit] = useState('MT');
    const [inquirySearch, setInquirySearch] = useState('');
    const [expandedInquiry, setExpandedInquiry] = useState(null);
    const [adminSessions, setAdminSessions] = useState([]);
    const [loginHistory, setLoginHistory] = useState([]);
    const [integrationStatus, setIntegrationStatus] = useState(null);
    const [securityLoading, setSecurityLoading] = useState(false);

    const navigate = useNavigate();
    const API = API_BASE_URL;
    const {
        browserNotificationPermission,
        clearUnreadInquiries,
        enableBrowserNotifications,
        processLeadUpdate,
        unreadInquiryCount,
    } = useInquiryNotifications();

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
            const res = await adminFetch(`/api/leads?t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                processLeadUpdate(data);
                setLeads(Array.isArray(data) ? data : []);
            } else if (res.status === 401) {
                navigate('/admin/login');
            }
        } catch (error) {
            console.error('Failed to load genuine inquiry records', error);
        }
    }, [processLeadUpdate, navigate]);

    useEffect(() => {
        const initialProductFetch = window.setTimeout(fetchProducts, 0);
        return () => window.clearTimeout(initialProductFetch);
    }, [fetchProducts]);

    useEffect(() => {
        const initialLeadFetch = window.setTimeout(fetchLeads, 0);
        const leadPollingInterval = window.setInterval(fetchLeads, 30000);
        return () => {
            window.clearTimeout(initialLeadFetch);
            window.clearInterval(leadPollingInterval);
        };
    }, [fetchLeads]);

    const fetchSecurityActivity = useCallback(async () => {
        setSecurityLoading(true);
        try {
            const [sessionsResponse, historyResponse, integrationsResponse] = await Promise.all([
                adminFetch('/api/admin/sessions'),
                adminFetch('/api/admin/login-history'),
                adminFetch('/api/admin/integrations'),
            ]);
            if ([sessionsResponse, historyResponse, integrationsResponse].some((response) => response.status === 401)) {
                navigate('/admin/login');
                return;
            }
            if (sessionsResponse.ok) setAdminSessions(await sessionsResponse.json());
            if (historyResponse.ok) setLoginHistory(await historyResponse.json());
            if (integrationsResponse.ok) setIntegrationStatus(await integrationsResponse.json());
        } catch {
            toast.error('Unable to load admin security activity');
        } finally {
            setSecurityLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (activeTab !== 'security') return undefined;
        const securityFetch = window.setTimeout(fetchSecurityActivity, 0);
        return () => window.clearTimeout(securityFetch);
    }, [activeTab, fetchSecurityActivity]);

    const revokeSession = async (sessionId, isCurrent) => {
        if (!window.confirm(isCurrent ? 'Revoke this session and sign out now?' : 'Revoke this admin session?')) return;
        const response = await adminFetch(`/api/admin/sessions/${encodeURIComponent(sessionId)}/revoke`, { method: 'POST' });
        if (response.ok) {
            toast.success('Admin session revoked');
            if (isCurrent) navigate('/admin/login');
            else fetchSecurityActivity();
        } else {
            toast.error('Unable to revoke session');
        }
    };

    const revokeAllSessions = async () => {
        if (!window.confirm('Sign out every admin device, including this one? You will need to log in again.')) return;
        const response = await adminFetch('/api/admin/sessions/revoke-all', { method: 'POST' });
        if (response.ok) {
            toast.success('All admin sessions revoked');
            navigate('/admin/login');
        } else {
            toast.error('Unable to revoke all sessions');
        }
    };

    const updateLeadStatus = async (leadId, nextStatus) => {
        const response = await adminFetch(`/api/leads/${leadId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus }),
        });
        if (response.ok) {
            const updatedLead = await response.json();
            setLeads((current) => current.map((lead) => lead.id === leadId ? updatedLead : lead));
            toast.success('Inquiry status updated');
        } else if (response.status === 401) {
            navigate('/admin/login');
        } else {
            toast.error('Unable to update inquiry status');
        }
    };

    const generateBroadcast = () => {
        const date = new Date().toLocaleDateString('en-IN');
        let msg = `🚨 *Sri Srinivasa Canvassing* 🚨\n📍 Miryalaguda Live Market Rates\n📅 Date: ${date}\n\n`;
        products.forEach(p => { msg += `🌾 *${p.variety_name}*: ₹${p.current_price_mt}/${getRateUnitShortLabel(p.unit)}\n`; });
        msg += `\nPrices are indicative & subject to immediate change based on mill availability.\n\nReply to lock your indent!`;
        setBroadcastMessage(msg);
    };

    const handleLogout = async () => {
        await signOutAdmin().catch(() => null);
        navigate('/admin/login');
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newVariety.name || !newVariety.initial_price) return;
        const formData = new FormData();
        formData.append('name', newVariety.name);
        formData.append('initial_price', parseFloat(newVariety.initial_price));
        formData.append('unit', newVariety.unit);
        if (newImage) formData.append('image', newImage);
        try {
            const res = await adminFetch('/api/products/add', { method: 'POST', body: formData });
            if (res.ok) { 
                const added = await res.json();
                toast.success(`${newVariety.name} added`); 
                setNewVariety({ name: '', initial_price: '', unit: 'MT' });
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

    const handleSaveUpdate = async (id, confirmUnusual = false) => {
        try {
            const res = await adminFetch(`/api/products/update/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: editName, 
                    new_price_mt: parseFloat(editPrice),
                    unit: editUnit,
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
            const res = await adminFetch(`/api/products/delete/${id}`, { method: 'DELETE' });
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
            const res = await adminFetch(`/api/products/${id}/image`, { method: 'POST', body: formData });
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
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={enableBrowserNotifications}
                            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold text-sm border border-primary/20 hover:bg-primary/20 transition-all"
                            title="Enable browser alerts for newly received inquiries"
                        >
                            {browserNotificationPermission === 'granted' ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                            {browserNotificationPermission === 'granted' ? 'Notifications On' : 'Enable Notifications'}
                            {unreadInquiryCount > 0 && (
                                <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                                    {unreadInquiryCount}
                                </span>
                            )}
                        </button>
                        <Link to="/admin/crm" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald/10 text-emerald font-semibold text-sm border border-emerald/20 hover:bg-emerald/20 transition-all">
                            <MessageCircle className="w-4 h-4" /> WhatsApp CRM
                        </Link>
                        <Link to="/admin/cards" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold text-sm border border-primary/20 hover:bg-primary/20 transition-all">
                            <CreditCard className="w-4 h-4" /> Digital Cards
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-surface dark:bg-secondary-light/30 rounded-2xl mb-8 border border-border dark:border-white/10">
                    {[{ id: 'inventory', label: 'Live Inventory', icon: Plus }, { id: 'leads', label: `Inquiries & CRM (${leads.length})`, icon: Users }, { id: 'security', label: 'Security', icon: ShieldCheck }].map(tab => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id === 'leads') clearUnreadInquiries(); }} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-text-muted dark:text-gray-400 hover:bg-surface-hover dark:hover:bg-white/5'}`}>
                            <tab.icon className="w-4 h-4" />{tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'inventory' && (
                    <>
                        {products.some((product) => !product.image_url) && (
                            <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-800 dark:text-amber-200">
                                <div className="flex items-start gap-3">
                                    <ImagePlus className="mt-0.5 h-5 w-5 flex-none" />
                                    <div>
                                        <h2 className="font-display font-bold">Product images required</h2>
                                        <p className="mt-1 text-sm font-medium">
                                            {products.filter((product) => !product.image_url).map((product) => product.variety_name.trim()).join(', ')}
                                        </p>
                                        <p className="mt-2 text-xs font-semibold opacity-80">Use the Upload control in each product’s Image column. Existing product and rate data will remain unchanged.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add Product */}
                        <div className="premium-card rounded-2xl p-6 mb-8">
                            <h2 className="text-lg font-display font-bold text-text-main dark:text-white mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />Add New Variety</h2>
                            <form onSubmit={handleAddProduct} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium text-text-muted dark:text-gray-400 mb-1">Product / Variety Name</label>
                                    <input type="text" required value={newVariety.name} onChange={e => setNewVariety({ ...newVariety, name: e.target.value })} placeholder="e.g. Sona Masuri" className={inputClass} />
                                </div>
                                <div className="flex-1 w-full md:max-w-xs">
                                    <label className="block text-sm font-medium text-text-muted dark:text-gray-400 mb-1">Indicative Price (₹)</label>
                                    <input type="number" step="0.01" required value={newVariety.initial_price} onChange={e => setNewVariety({ ...newVariety, initial_price: e.target.value })} placeholder="0.00" className={inputClass} />
                                </div>
                                <div className="flex-1 w-full md:max-w-xs">
                                    <label className="block text-sm font-medium text-text-muted dark:text-gray-400 mb-1">Quantity Unit</label>
                                    <select value={newVariety.unit} onChange={e => setNewVariety({ ...newVariety, unit: e.target.value })} className={inputClass}>
                                        {RATE_UNIT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                    </select>
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
                                            <th className="py-4 px-6">Image</th><th className="py-4 px-6">ID</th><th className="py-4 px-6">Variety</th><th className="py-4 px-6">Price (₹)</th><th className="py-4 px-6">Quantity Unit</th><th className="py-4 px-6">Updated</th><th className="py-4 px-6 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border dark:divide-white/5">
                                        {products.map((item, i) => (
                                            <tr key={item.id} className="hover:bg-surface-hover dark:hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-6 w-20">
                                                    <div className="relative group w-14 h-14 bg-surface-hover dark:bg-white/5 rounded-xl overflow-hidden flex items-center justify-center border border-border dark:border-white/10 mx-auto">
                                                        {item.image_url ? <img src={item.image_url.startsWith('http') ? item.image_url : `${API}${item.image_url.startsWith('/') ? '' : '/'}${item.image_url}`} alt={item.variety_name} className="w-full h-full object-cover" /> : <span className="text-text-subtle text-xs">No img</span>}
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
                                                <td className="py-4 px-6 text-sm">
                                                    {editingId === item.id ? (
                                                        <select value={editUnit} onChange={e => setEditUnit(e.target.value)} className={`${inputClass} min-w-[190px]`}>
                                                            {RATE_UNIT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                                        </select>
                                                    ) : <span className="font-bold text-text-main">{getRateUnitShortLabel(item.unit)}</span>}
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
                                                            <button onClick={() => { setEditingId(item.id); setEditPrice(item.current_price_mt.toString()); setEditName(item.variety_name); setEditUnit(item.unit || 'MT'); }} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                                        )}
                                                        <button onClick={() => handleDelete(item.id, item.variety_name)} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {products.length === 0 && <tr><td colSpan="7" className="py-12 text-center text-text-muted">No products found.</td></tr>}
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
                                <button onClick={() => { const nums = leads.filter(l => l.marketing_consent === true).map(l => l.whatsapp).filter(Boolean).join(', '); if (nums) { navigator.clipboard.writeText(nums); toast.success("Opted-in numbers copied"); } else toast.error("No customers have opted in to WhatsApp marketing"); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald/10 text-emerald border border-emerald/20 text-sm font-semibold hover:bg-emerald/20 transition-all">
                                    <MessageSquareShare className="w-4 h-4" />Copy Opted-In WhatsApp Numbers
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
                                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                                                        Privacy consent: {lead.privacy_consent ? 'Recorded' : 'Legacy record'}
                                                    </span>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${lead.marketing_consent ? 'bg-emerald/10 text-emerald' : 'bg-gray-500/10 text-text-muted'}`}>
                                                        WhatsApp alerts: {lead.marketing_consent ? 'Opted in' : 'Not opted in'}
                                                    </span>
                                                    <label className="inline-flex items-center gap-2 text-xs font-bold text-text-muted">
                                                        CRM status
                                                        <select
                                                            value={lead.status || 'new'}
                                                            onChange={(event) => updateLeadStatus(lead.id, event.target.value)}
                                                            className="rounded-lg border border-border dark:border-white/10 bg-surface dark:bg-secondary-light/30 px-2.5 py-1.5 text-xs font-bold text-text-main dark:text-white"
                                                        >
                                                            <option value="new">New</option>
                                                            <option value="contacted">Contacted</option>
                                                            <option value="qualified">Qualified</option>
                                                            <option value="quoted">Quoted</option>
                                                            <option value="won">Won</option>
                                                            <option value="closed">Closed</option>
                                                        </select>
                                                    </label>
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

                {activeTab === 'security' && (
                    <div className="space-y-8">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-display font-black text-text-main dark:text-white">Admin Security</h2>
                                <p className="text-sm text-text-muted dark:text-gray-400 mt-1">Review active sessions and recent sign-in activity. IP addresses are stored only as irreversible fingerprints.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={revokeAllSessions} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-bold">
                                    Sign Out All Devices
                                </button>
                                <button type="button" onClick={fetchSecurityActivity} disabled={securityLoading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-60">
                                    <RefreshCw className={`w-4 h-4 ${securityLoading ? 'animate-spin' : ''}`} /> Refresh
                                </button>
                            </div>
                        </div>

                        <div className="premium-card rounded-2xl overflow-hidden">
                            <div className="p-5 border-b border-border dark:border-white/10">
                                <h3 className="font-display font-bold text-text-main dark:text-white">Production Integration Readiness</h3>
                                <p className="text-xs text-text-muted mt-1">Configuration status only. Secret values are never returned to the browser.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 p-5">
                                {[
                                    ['Staff enquiry alerts', integrationStatus?.lead_notifications],
                                    ['Customer confirmations', integrationStatus?.customer_confirmations],
                                    ['Turnstile protection', integrationStatus?.turnstile],
                                    ['Cloudinary images', integrationStatus?.cloudinary],
                                    ['Hashed admin password', integrationStatus?.admin_password_hash],
                                ].map(([label, integration]) => (
                                    <div key={label} className="rounded-xl border border-border dark:border-white/10 bg-surface-hover/30 p-4">
                                        <div className={`mb-2 h-2.5 w-2.5 rounded-full ${integration?.configured ? 'bg-emerald' : 'bg-amber-500'}`} />
                                        <p className="text-sm font-bold text-text-main dark:text-white">{label}</p>
                                        <p className={`mt-1 text-xs font-bold ${integration?.configured ? 'text-emerald' : 'text-amber-600 dark:text-amber-300'}`}>
                                            {integration ? (integration.configured ? 'Ready' : 'Action required') : 'Checking…'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="premium-card rounded-2xl overflow-hidden">
                            <div className="p-5 border-b border-border dark:border-white/10"><h3 className="font-display font-bold text-text-main dark:text-white">Recent Sessions</h3></div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead><tr className="text-xs uppercase tracking-wider text-text-muted border-b border-border dark:border-white/10"><th className="p-4">Issued</th><th className="p-4">Last Seen</th><th className="p-4">Device</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr></thead>
                                    <tbody className="divide-y divide-border dark:divide-white/5">
                                        {adminSessions.map((session) => (
                                            <tr key={session.session_id}>
                                                <td className="p-4 whitespace-nowrap">{new Date(session.issued_at).toLocaleString('en-IN')}</td>
                                                <td className="p-4 whitespace-nowrap">{session.last_seen_at ? new Date(session.last_seen_at).toLocaleString('en-IN') : '—'}</td>
                                                <td className="p-4 max-w-xs truncate" title={session.user_agent}>{session.user_agent || 'Unknown'}<div className="text-xs text-text-muted mt-1">IP fingerprint: {session.ip_fingerprint || '—'}</div></td>
                                                <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${session.revoked_at ? 'bg-red-500/10 text-red-500' : 'bg-emerald/10 text-emerald'}`}>{session.revoked_at ? 'Revoked' : session.current ? 'Current' : 'Active'}</span></td>
                                                <td className="p-4 text-right"><button type="button" disabled={Boolean(session.revoked_at)} onClick={() => revokeSession(session.session_id, session.current)} className="text-xs font-bold text-red-500 disabled:opacity-40">Revoke</button></td>
                                            </tr>
                                        ))}
                                        {adminSessions.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-text-muted">No session records found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="premium-card rounded-2xl overflow-hidden">
                            <div className="p-5 border-b border-border dark:border-white/10"><h3 className="font-display font-bold text-text-main dark:text-white">Login History</h3></div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead><tr className="text-xs uppercase tracking-wider text-text-muted border-b border-border dark:border-white/10"><th className="p-4">Time</th><th className="p-4">Username</th><th className="p-4">Outcome</th><th className="p-4">Reason</th><th className="p-4">IP Fingerprint</th></tr></thead>
                                    <tbody className="divide-y divide-border dark:divide-white/5">
                                        {loginHistory.map((event) => (
                                            <tr key={event.id}><td className="p-4 whitespace-nowrap">{new Date(event.created_at).toLocaleString('en-IN')}</td><td className="p-4">{event.username}</td><td className="p-4 font-bold capitalize">{event.outcome}</td><td className="p-4">{event.reason || '—'}</td><td className="p-4 font-mono text-xs">{event.ip_fingerprint || '—'}</td></tr>
                                        ))}
                                        {loginHistory.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-text-muted">No login events found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
