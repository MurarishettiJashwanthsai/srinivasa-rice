import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Clock, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { SkeletonTableRow, SkeletonStat } from '../components/SkeletonLoader';
import { API_BASE_URL } from '../config/api';
import { getRateUnitShortLabel } from '../utils/rateUnits';

const MarketDashboard = () => {
    const [prices, setPrices] = useState([]);
    const [lastFetchTime, setLastFetchTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchFailed, setFetchFailed] = useState(false);
    const [sortField, setSortField] = useState(null);
    const [sortDir, setSortDir] = useState('asc');

    const fetchPrices = async () => {
        setLoading(true);
        setFetchFailed(false);
        try {
            const response = await fetch(`${API_BASE_URL}/api/products`);
            if (response.ok) {
                const data = await response.json();
                setPrices(data);
                setLastFetchTime(new Date());
            } else {
                setFetchFailed(true);
            }
        } catch (error) { 
            console.error('Failed to fetch market rates', error); 
            setFetchFailed(true);
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const sortedPrices = [...prices].sort((a, b) => {
        if (!sortField) return 0;
        const aVal = a[sortField], bVal = b[sortField];
        if (typeof aVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });

    const exportCSV = () => {
        const header = 'Variety,Current Price (MT),Previous Price (MT),Change (%),Price Basis,Trend\n';
        const rows = prices.map(p => `${p.variety_name},${p.current_price_mt},${p.previous_price_mt},${p.percentage_change},${p.price_basis || 'EX_MILL'},${p.trend}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `miryalaguda-rice-rates-${new Date().toISOString().split('T')[0]}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    const avgPrice = prices.length > 0 ? (prices.reduce((s, p) => s + p.current_price_mt, 0) / prices.length).toFixed(0) : 0;
    const upCount = prices.filter(p => p.trend === 'up').length;
    const downCount = prices.filter(p => p.trend === 'down').length;

    const trendColor = (trend) => trend === 'up' ? 'text-primary' : trend === 'down' ? 'text-red-500' : 'text-text-muted';
    const trendBg = (trend) => trend === 'up' ? 'bg-primary/10 border-primary/20' : trend === 'down' ? 'bg-red-500/10 border-red-500/20' : 'bg-text-muted/10 border-border';

    return (
        <div className="bg-background min-h-screen py-8 transition-colors duration-500 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <h1 className="text-2xl md:text-4xl font-display font-black text-text-main tracking-tight mb-3 uppercase">Miryalaguda Market Rates</h1>
                    <div className="w-14 h-1 bg-primary mx-auto rounded-full mb-4" />
                    <p className="max-w-xl mx-auto text-base text-text-muted font-bold">Dated indicative wholesale market estimates from the Miryalaguda rice hub.</p>
                    
                    {lastFetchTime && (
                        <div className="inline-flex items-center gap-3 mt-4 px-5 py-2 rounded-full bg-card border border-border text-xs font-black text-text-muted shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            LAST FETCHED: {lastFetchTime.toLocaleTimeString()} IST
                            <button onClick={fetchPrices} className="ml-2 p-1 hover:bg-primary/10 rounded-lg transition-all active:scale-90" title="Refresh Rates">
                                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Rates Failure State */}
                {fetchFailed && (
                    <div className="mb-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3">
                        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                        <h3 className="text-lg font-black text-text-main uppercase">Rates Temporarily Unavailable</h3>
                        <p className="text-text-muted font-bold text-sm max-w-md mx-auto">
                            Current market rates are temporarily unavailable. Contact us directly for the latest indicative quotation from Miryalaguda.
                        </p>
                    </div>
                )}

                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonStat key={i} />) : (
                        <>
                            <div className="premium-card !p-5 text-center flex flex-col items-center">
                                <p className="text-xs uppercase tracking-[0.2em] text-text-muted font-black mb-2">Average Rate</p>
                                <p className="text-3xl font-display font-black text-text-main">₹{avgPrice}</p>
                                <p className="text-xs text-text-muted mt-1 font-bold uppercase tracking-widest">per metric ton (Ex-Mill)</p>
                            </div>
                            <div className="premium-card !p-5 text-center flex flex-col items-center">
                                <p className="text-xs uppercase tracking-[0.2em] text-text-muted font-black mb-2">Trending Up</p>
                                <p className="text-3xl font-display font-black text-primary">{upCount}</p>
                                <p className="text-xs text-text-muted mt-1 font-bold uppercase tracking-widest">varieties</p>
                            </div>
                            <div className="premium-card !p-5 text-center flex flex-col items-center">
                                <p className="text-xs uppercase tracking-[0.2em] text-text-muted font-black mb-2">Trending Down</p>
                                <p className="text-3xl font-display font-black text-red-500">{downCount}</p>
                                <p className="text-xs text-text-muted mt-1 font-bold uppercase tracking-widest">varieties</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Price Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    {sortedPrices.map((item, i) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            key={item.id} 
                            className="premium-card !p-6 text-center border-l-4 border-l-primary/30"
                        >
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-2 truncate">{item.variety_name}</p>
                            <p className="text-2xl font-display font-black text-text-main mb-1">₹{item.current_price_mt.toFixed(0)}</p>
                            <span className="text-[9px] font-black uppercase text-text-subtle block mb-3">Ex-Mill / {getRateUnitShortLabel(item.unit)}</span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest border ${trendBg(item.trend)} ${trendColor(item.trend)}`}>
                                {item.trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                                {item.trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                                {item.trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                                {item.percentage_change}%
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Detailed Table */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="premium-card overflow-hidden !p-0 mb-10">
                    <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-b border-border bg-secondary-bg/50">
                        <h2 className="font-display font-black text-xl text-text-main uppercase tracking-tight">Market Analysis Ledger</h2>
                        <button onClick={exportCSV} className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black text-primary border-2 border-primary/20 hover:bg-primary/10 transition-all uppercase tracking-widest"><Download className="w-4 h-4" /> Export Ledger</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-background text-text-main text-[10px] uppercase tracking-[0.25em]">
                                    <th className="py-6 px-8 font-black cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('variety_name')}>Variety {sortField === 'variety_name' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                                    <th className="py-6 px-8 font-black cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('current_price_mt')}>Indicative Price {sortField === 'current_price_mt' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                                    <th className="py-6 px-8 font-black">Previous Rate</th>
                                    <th className="py-6 px-8 font-black">Basis & Unit</th>
                                    <th className="py-6 px-8 font-black text-center cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('percentage_change')}>Trend Analysis {sortField === 'percentage_change' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />) : sortedPrices.map((item) => (
                                    <tr key={item.id} className="hover:bg-primary/5 transition-colors">
                                        <td className="py-4 px-8 font-black text-text-main">{item.variety_name}</td>
                                        <td className="py-4 px-8 font-black text-xl text-primary">₹{item.current_price_mt.toFixed(0)} / {getRateUnitShortLabel(item.unit)}</td>
                                        <td className="py-4 px-8 font-bold text-text-muted">₹{item.previous_price_mt.toFixed(0)} / {getRateUnitShortLabel(item.unit)}</td>
                                        <td className="py-4 px-8 font-bold text-xs text-text-muted">{item.price_basis || 'EX_MILL'} · {getRateUnitShortLabel(item.unit)} ({item.currency || 'INR'})</td>
                                        <td className="py-4 px-8 text-center">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.1em] border ${trendBg(item.trend)} ${trendColor(item.trend)}`}>
                                                {item.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                                                {item.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                                                {item.trend === 'neutral' && <Minus className="h-4 w-4" />}
                                                {item.percentage_change}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Section 2.8: Mandatory Rate Disclaimer */}
                <div className="p-6 rounded-2xl bg-surface-hover/30 border border-border/40 text-center max-w-4xl mx-auto space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary block">Official Rate Disclaimer</span>
                    <p className="text-xs text-text-muted font-bold leading-relaxed">
                        Published rates are indicative and are not binding quotations. Final pricing depends on grade, specification, quantity, packaging, availability, payment terms, Incoterm, destination, freight, insurance and exchange rates.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MarketDashboard;
