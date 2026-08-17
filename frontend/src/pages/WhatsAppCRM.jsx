import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, FileText, Megaphone, BarChart3, Search, Send, Tag, Phone, ArrowLeft, Users, Clock, ChevronRight, Copy, Bell, BellRing } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import useInquiryNotifications from '../hooks/useInquiryNotifications';
import { getRateUnitShortLabel } from '../utils/rateUnits';
import { adminFetch } from '../utils/adminApi';

const API = API_BASE_URL;

const WhatsAppCRM = () => {
    const [activeTab, setActiveTab] = useState('conversations');
    const [leads, setLeads] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const navigate = useNavigate();
    const {
        browserNotificationPermission,
        clearUnreadInquiries,
        enableBrowserNotifications,
        processLeadUpdate,
        unreadInquiryCount,
    } = useInquiryNotifications();

    const tabs = [
        { id: 'conversations', label: 'Conversations', icon: MessageSquare },
        { id: 'templates', label: 'Templates', icon: FileText },
        { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ];

    const templates = [
        { id: 1, name: 'Daily Price Alert', category: 'pricing', content: '🚨 *Sri Srinivasa Canvassing* 🚨\n📍 Miryalaguda Live Market Rates\n📅 Date: {date}\n\n{prices}\n\nReply to lock your indent!' },
        { id: 2, name: 'Welcome Message', category: 'onboarding', content: "👋 Welcome to Sri Srinivasa Canvassing!\n\nWe're India's premium rice sourcing & export partner.\n\nHow can we help you today?" },
        { id: 3, name: 'Follow-up', category: 'sales', content: "Hi {buyer_name},\n\nHope you're doing well! Just checking in on your rice requirement." },
        { id: 4, name: 'Quote Confirmation', category: 'sales', content: "Dear {buyer_name},\n\nThank you for your interest!\n\n📋 *Quote Details*\nVariety: {variety}\nQuantity: {quantity}\nPrice: {price}/{unit} FOB" },
    ];

    const fetchLeads = useCallback(async () => {
        try {
            const res = await adminFetch('/api/leads');
            if (res.ok) {
                const data = await res.json();
                processLeadUpdate(data);
                setLeads(Array.isArray(data) ? data : []);
            } else if (res.status === 401) {
                navigate('/admin/login');
            }
        } catch (e) {
            console.error('Failed to load genuine inquiry records', e);
        }
    }, [processLeadUpdate, navigate]);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await fetch(`${API}/api/products`);
            if (res.ok) setProducts(await res.json());
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        fetchLeads();
        fetchProducts();
        const leadPollingInterval = window.setInterval(fetchLeads, 30000);
        return () => window.clearInterval(leadPollingInterval);
    }, [fetchLeads, fetchProducts]);

    const generatePriceList = () => {
        const date = new Date().toLocaleDateString('en-IN');
        let msg = `🚨 *Sri Srinivasa Canvassing* 🚨\n📍 Miryalaguda Live Market Rates\n📅 Date: ${date}\n\n`;
        products.forEach(p => { msg += `🌾 *${p.variety_name}*: ₹${p.current_price_mt}/${getRateUnitShortLabel(p.unit)}\n`; });
        msg += `\nPrices are indicative & subject to change.\nReply to lock your indent!`;
        setBroadcastMessage(msg);
    };

    const filteredLeads = leads.filter(l => {
        const matchesSearch = !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.company?.toLowerCase().includes(searchQuery.toLowerCase()) || l.whatsapp.includes(searchQuery);
        return matchesSearch;
    });

    const stats = useMemo(() => {
        // eslint-disable-next-line react-hooks/purity
        const monthAgoTimestamp = new Date(Date.now() - 30 * 86400000);
        return [
            { label: 'Total Contacts', value: leads.length, icon: Users, color: 'text-primary' },
            { label: 'This Month', value: leads.filter(l => new Date(l.created_at) > monthAgoTimestamp).length, icon: Clock, color: 'text-emerald-500' },
            { label: 'Subscribers', value: leads.filter(l => l.inquiry_text?.includes('Price Alert')).length, icon: Tag, color: 'text-primary' },
            { label: 'Notifications Sent', value: leads.filter(l => l.notification_status === 'delivered').length, icon: Send, color: 'text-emerald-500' },
        ];
    }, [leads]);

    return (
        <div className="min-h-screen bg-background py-10 transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <button onClick={() => navigate('/admin')} className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-primary flex items-center gap-2 mb-4 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Intelligence
                        </button>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-text-main uppercase tracking-tight">WhatsApp CRM</h1>
                        <p className="text-lg text-text-muted mt-2 font-bold">Manage buyer relationships & automated campaigns</p>
                    </div>
                    <button
                        type="button"
                        onClick={enableBrowserNotifications}
                        className="relative flex items-center gap-2 px-5 py-3 rounded-xl bg-primary/10 text-primary font-black text-xs uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all"
                        title="Enable browser alerts for newly received inquiries"
                    >
                        {browserNotificationPermission === 'granted' ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                        {browserNotificationPermission === 'granted' ? 'Notifications On' : 'Enable Notifications'}
                        {unreadInquiryCount > 0 && (
                            <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                                {unreadInquiryCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                    {stats.map((s) => (
                        <div key={s.label} className="premium-card !p-8 flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center ${s.color}`}>
                                <s.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-3xl font-display font-black text-text-main">{s.value}</p>
                                <p className="text-xs text-text-muted font-black uppercase tracking-widest mt-1">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-2 bg-secondary-bg/50 rounded-2xl mb-12 overflow-x-auto border border-border shadow-inner">
                    {tabs.map((tab) => (
                        <button 
                            key={tab.id} 
                            onClick={() => { setActiveTab(tab.id); if (tab.id === 'conversations') clearUnreadInquiries(); }}
                            className={`flex items-center gap-3 px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeTab === tab.id 
                                    ? 'bg-primary text-white shadow-xl shadow-primary/25' 
                                    : 'text-text-muted hover:bg-primary/10 hover:text-primary'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />{tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'conversations' && (
                            <div className="space-y-8">
                                <div className="relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                    <input 
                                        type="text" 
                                        placeholder="Search contacts by name, company, or WhatsApp..." 
                                        value={searchQuery} 
                                        onChange={e => setSearchQuery(e.target.value)} 
                                        className="input-premium !pl-16 !py-5 !text-lg font-bold" 
                                    />
                                </div>

                                <div className="premium-card rounded-3xl overflow-hidden !p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-background text-[10px] uppercase tracking-[0.25em] text-text-muted font-black">
                                                    <th className="py-6 px-8">Contact Identity</th>
                                                    <th className="py-6 px-8">Organization</th>
                                                    <th className="py-6 px-8">Direct Access</th>
                                                    <th className="py-6 px-8">Interaction Date</th>
                                                    <th className="py-6 px-8">Notification</th>
                                                    <th className="py-6 px-8 text-center">Protocol</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {filteredLeads.length === 0 && (
                                                    <tr>
                                                        <td colSpan="6" className="px-8 py-12 text-center text-sm font-bold text-text-muted">
                                                            No genuine inquiries have been received yet.
                                                        </td>
                                                    </tr>
                                                )}
                                                {filteredLeads.map((lead) => (
                                                    <tr key={lead.id} className="hover:bg-primary/5 transition-colors group">
                                                        <td className="py-6 px-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl uppercase">{lead.name.charAt(0)}</div>
                                                                <span className="font-black text-text-main group-hover:text-primary transition-colors">{lead.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-8 text-sm text-text-muted font-bold">{lead.company || 'Private Buyer'}</td>
                                                        <td className="py-6 px-8">
                                                            <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-500 font-black text-sm hover:underline transition-all">
                                                                <Phone className="w-4 h-4" />{lead.whatsapp}
                                                            </a>
                                                        </td>
                                                        <td className="py-6 px-8 text-sm text-text-muted font-bold whitespace-nowrap">{new Date(lead.created_at).toLocaleDateString()}</td>
                                                        <td className="py-6 px-8">
                                                            <span className={`inline-flex rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                                                                lead.notification_status === 'delivered'
                                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                                    : lead.notification_status === 'failed'
                                                                        ? 'bg-red-500/10 text-red-500'
                                                                        : 'bg-primary/10 text-primary'
                                                            }`}>
                                                                {lead.notification_status || 'legacy'}
                                                            </span>
                                                        </td>
                                                        <td className="py-6 px-8 text-center">
                                                            <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
                                                                <Send className="w-3.5 h-3.5" /> Message
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'templates' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {templates.map((t) => (
                                    <div key={t.id} className="premium-card !p-8 group">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><FileText className="w-5 h-5" /></div>
                                                <h3 className="font-display font-black text-xl text-text-main group-hover:text-primary transition-colors">{t.name}</h3>
                                            </div>
                                            <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">{t.category}</span>
                                        </div>
                                        <div className="text-sm text-text-muted font-bold leading-relaxed bg-secondary-bg/50 rounded-2xl p-6 mb-8 border border-border/50 font-mono italic">
                                            {t.content}
                                        </div>
                                        <button onClick={() => { navigator.clipboard.writeText(t.content); toast.success('Protocol Copied'); }} className="w-full py-4 rounded-xl border-2 border-primary/20 text-primary font-black text-xs uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3">
                                            <Copy className="w-4 h-4" /> Copy Intelligence
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'campaigns' && (
                            <div className="space-y-8">
                                <div className="premium-card !p-10 flex flex-col lg:flex-row gap-12">
                                    <div className="lg:w-1/3">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6"><Megaphone className="w-7 h-7" /></div>
                                        <h3 className="font-display font-black text-2xl text-text-main mb-4 uppercase">Market Pulse Broadcast</h3>
                                        <p className="text-text-muted font-bold mb-8 leading-relaxed">Generate real-time pricing intelligence and dispatch to your entire global buyer network instantly.</p>
                                        <button onClick={generatePriceList} className="button-primary w-full !py-4 mb-4">Generate Market Feed</button>
                                        <button onClick={() => { const nums = leads.map(l => l.whatsapp).filter(Boolean).join(', '); if (nums) { navigator.clipboard.writeText(nums); toast.success('Recipient List Copied'); } }} className="w-full py-4 rounded-xl border-2 border-primary/20 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                                            <Users className="w-4 h-4" /> Export Contacts
                                        </button>
                                    </div>
                                    <div className="lg:w-2/3 relative">
                                        <textarea 
                                            value={broadcastMessage} 
                                            onChange={e => setBroadcastMessage(e.target.value)} 
                                            placeholder="System waiting for pulse generation..." 
                                            className="w-full h-80 p-8 text-lg font-bold border-2 border-border rounded-3xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none resize-none bg-background text-text-main transition-all italic shadow-inner" 
                                        />
                                        {broadcastMessage && (
                                            <button onClick={() => { navigator.clipboard.writeText(broadcastMessage); toast.success('Pulse Copied'); }} className="absolute bottom-6 right-6 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl">
                                                Copy Broadcast
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'analytics' && (() => {
                            // ── Derived analytics ──────────────────────────────
                            const now = new Date();

                            // Monthly buckets – last 6 months
                            const monthLabels = Array.from({ length: 6 }, (_, i) => {
                                const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
                                return { label: d.toLocaleString('en-IN', { month: 'short', year: '2-digit' }), year: d.getFullYear(), month: d.getMonth() };
                            });
                            const monthlyCounts = monthLabels.map(m =>
                                leads.filter(l => {
                                    const d = new Date(l.created_at);
                                    return d.getFullYear() === m.year && d.getMonth() === m.month;
                                }).length
                            );
                            const maxMonthly = Math.max(...monthlyCounts, 1);

                            // Top companies
                            const companyCounts = {};
                            leads.forEach(l => { const c = l.company?.trim() || 'Private Buyer'; companyCounts[c] = (companyCounts[c] || 0) + 1; });
                            const topCompanies = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
                            const maxCompany = Math.max(...topCompanies.map(c => c[1]), 1);

                            // Day-of-week distribution
                            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            const dayCounts = Array(7).fill(0);
                            leads.forEach(l => { const d = new Date(l.created_at); dayCounts[d.getDay()]++; });
                            const maxDay = Math.max(...dayCounts, 1);
                            const busiestDay = dayNames[dayCounts.indexOf(Math.max(...dayCounts))];

                            // This week
                            const thisWeek = leads.filter(l => new Date(l.created_at) > new Date(Date.now() - 7 * 86400000)).length;
                            const thisMonth = leads.filter(l => new Date(l.created_at) > new Date(Date.now() - 30 * 86400000)).length;

                            // Recent 5 leads
                            const recent = [...leads].slice(0, 5);

                            const kpis = [
                                { label: 'Total Contacts', value: leads.length, sub: 'All time', color: 'bg-primary/10 text-primary', icon: Users },
                                { label: 'This Month', value: thisMonth, sub: 'Last 30 days', color: 'bg-emerald-500/10 text-emerald-500', icon: Clock },
                                { label: 'This Week', value: thisWeek, sub: 'Last 7 days', color: 'bg-blue-500/10 text-blue-500', icon: BarChart3 },
                                { label: 'Busiest Day', value: busiestDay, sub: 'Most inquiries', color: 'bg-amber-500/10 text-amber-500', icon: Tag },
                            ];

                            return (
                                <div className="space-y-8">
                                    {/* KPI Cards */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                                        {kpis.map(k => (
                                            <div key={k.label} className="premium-card !p-6 flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${k.color}`}>
                                                    <k.icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-display font-black text-text-main">{k.value}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-0.5">{k.label}</p>
                                                    <p className="text-[10px] text-text-muted/60 font-bold">{k.sub}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Monthly Trend Bar Chart */}
                                        <div className="premium-card !p-8">
                                            <h3 className="font-display font-black text-lg text-text-main mb-1 flex items-center gap-2">
                                                <BarChart3 className="w-5 h-5 text-primary" /> Monthly Inquiry Trend
                                            </h3>
                                            <p className="text-xs text-text-muted font-bold mb-6 uppercase tracking-widest">Last 6 Months</p>
                                            <div className="flex items-end gap-3 h-40">
                                                {monthlyCounts.map((count, i) => (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                        <span className="text-xs font-black text-primary">{count > 0 ? count : ''}</span>
                                                        <div className="w-full rounded-t-lg transition-all duration-700 relative group"
                                                            style={{ height: `${Math.max((count / maxMonthly) * 100, count > 0 ? 8 : 2)}%`, background: count > 0 ? 'linear-gradient(to top, var(--color-primary, #6366f1), #818cf8)' : 'rgba(99,102,241,0.12)' }}>
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold pointer-events-none">
                                                                {count} inquiri{count !== 1 ? 'es' : 'y'}
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] font-black text-text-muted uppercase">{monthLabels[i].label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Day-of-Week Distribution */}
                                        <div className="premium-card !p-8">
                                            <h3 className="font-display font-black text-lg text-text-main mb-1 flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-emerald-500" /> Weekly Activity Pattern
                                            </h3>
                                            <p className="text-xs text-text-muted font-bold mb-6 uppercase tracking-widest">Inquiries by Day of Week</p>
                                            <div className="flex items-end gap-2 h-40">
                                                {dayNames.map((day, i) => (
                                                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                                        <span className="text-xs font-black text-emerald-500">{dayCounts[i] > 0 ? dayCounts[i] : ''}</span>
                                                        <div className="w-full rounded-t-lg transition-all duration-700 relative group"
                                                            style={{ height: `${Math.max((dayCounts[i] / maxDay) * 100, dayCounts[i] > 0 ? 8 : 2)}%`, background: dayCounts[i] > 0 ? 'linear-gradient(to top, #10b981, #34d399)' : 'rgba(16,185,129,0.12)' }}>
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold pointer-events-none">
                                                                {dayCounts[i]} on {day}
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] font-black text-text-muted uppercase">{day}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Top Companies */}
                                        <div className="premium-card !p-8">
                                            <h3 className="font-display font-black text-lg text-text-main mb-1 flex items-center gap-2">
                                                <Tag className="w-5 h-5 text-primary" /> Top Inquiring Companies
                                            </h3>
                                            <p className="text-xs text-text-muted font-bold mb-6 uppercase tracking-widest">By Inquiry Volume</p>
                                            {topCompanies.length === 0 ? (
                                                <p className="text-sm text-text-muted text-center py-8">No data yet.</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {topCompanies.map(([company, count]) => (
                                                        <div key={company}>
                                                            <div className="flex justify-between items-center mb-1.5">
                                                                <span className="text-sm font-bold text-text-main truncate max-w-[60%]">{company}</span>
                                                                <span className="text-xs font-black text-primary">{count} {count === 1 ? 'inquiry' : 'inquiries'}</span>
                                                            </div>
                                                            <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                                                                <div className="h-full rounded-full transition-all duration-700"
                                                                    style={{ width: `${(count / maxCompany) * 100}%`, background: `linear-gradient(to right, var(--color-primary, #6366f1), #818cf8)` }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Recent Activity Feed */}
                                        <div className="premium-card !p-8">
                                            <h3 className="font-display font-black text-lg text-text-main mb-1 flex items-center gap-2">
                                                <MessageSquare className="w-5 h-5 text-blue-500" /> Recent Inquiries
                                            </h3>
                                            <p className="text-xs text-text-muted font-bold mb-6 uppercase tracking-widest">Latest 5 Contacts</p>
                                            {recent.length === 0 ? (
                                                <p className="text-sm text-text-muted text-center py-8">No inquiries yet.</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {recent.map((lead) => (
                                                        <div key={lead.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface dark:bg-secondary-light/20 border border-border dark:border-white/8">
                                                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0 uppercase">
                                                                {lead.name?.charAt(0)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <span className="text-sm font-bold text-text-main truncate">{lead.name}</span>
                                                                    <span className="text-[10px] text-text-muted whitespace-nowrap">{new Date(lead.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                                                </div>
                                                                <p className="text-xs text-text-muted mt-0.5 truncate">{lead.inquiry_text || 'No message'}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WhatsAppCRM;
