import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const LiveTicker = () => {
    const [prices, setPrices] = useState([]);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/products`);
                if (response.ok) {
                    const data = await response.json();
                    setPrices(data);
                }
            } catch (error) {
                console.error('Failed to fetch prices', error);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 120000); // 2 min refresh
        return () => clearInterval(interval);
    }, []);

    if (prices.length === 0) return null;

    const TrendIcon = ({ trend }) => {
        if (trend === 'up') return <TrendingUp className="h-3 w-3" />;
        if (trend === 'down') return <TrendingDown className="h-3 w-3" />;
        return <Minus className="h-3 w-3" />;
    };

    const trendColor = (trend) => {
        if (trend === 'up') return 'text-emerald';
        if (trend === 'down') return 'text-red-400';
        return 'text-gray-400';
    };

    const PriceItem = ({ item, keyPrefix = '' }) => (
        <div key={`${keyPrefix}${item.id}`} className="flex items-center gap-2.5 mx-6 text-sm font-medium shrink-0">
            <span className="text-gray-400 font-medium">{item.variety_name}</span>
            <span className="text-white font-bold">₹{item.current_price_mt}/MT</span>
            <span className={`flex items-center gap-0.5 text-xs font-bold ${trendColor(item.trend)}`}>
                <TrendIcon trend={item.trend} />
                {item.trend === 'up' ? '+' : ''}{item.percentage_change}%
            </span>
            <span className="text-gray-700 mx-2">•</span>
        </div>
    );

    return (
        <div className="bg-gradient-to-r from-[#0B1426] via-[#111C32] to-[#0B1426] text-white overflow-hidden py-2.5 border-b border-white/5 flex items-center relative z-50" id="live-ticker">
            {/* Label */}
            <div className="absolute left-0 z-10 px-4 h-full flex items-center bg-gradient-to-r from-[#0B1426] via-[#0B1426] to-transparent pr-8">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald"></span>
                    </span>
                    <span className="font-bold text-xs text-primary uppercase tracking-[0.15em]">Live Rates</span>
                </div>
            </div>

            {/* Spacer */}
            <div className="w-32 shrink-0"></div>

            {/* Marquee */}
            <div className="flex animate-marquee whitespace-nowrap">
                {prices.map((item) => <PriceItem key={item.id} item={item} />)}
                {prices.map((item) => <PriceItem key={`c1-${item.id}`} item={item} keyPrefix="c1-" />)}
                {prices.map((item) => <PriceItem key={`c2-${item.id}`} item={item} keyPrefix="c2-" />)}
            </div>

            {/* Right fade */}
            <div className="absolute right-0 z-10 h-full w-16 bg-gradient-to-l from-[#0B1426] to-transparent pointer-events-none" />
        </div>
    );
};

export default LiveTicker;
