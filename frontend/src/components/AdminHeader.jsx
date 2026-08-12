import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, ExternalLink, LayoutDashboard, LogOut, MessageCircle, ShieldCheck } from 'lucide-react';

const AdminHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAuthenticated = Boolean(localStorage.getItem('admin_token'));

    const adminLinks = [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'CRM', path: '/admin/crm', icon: MessageCircle },
        { label: 'Digital Cards', path: '/admin/cards', icon: CreditCard },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0F172A] shadow-xl shadow-black/10">
            <nav aria-label="Admin portal navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex min-h-20 items-center justify-between gap-4">
                    <Link
                        to={isAuthenticated ? '/admin' : '/'}
                        className="flex min-w-0 items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <img
                            src="/logo-256.png"
                            alt="Sri Srinivasa Canvassing Logo"
                            width="56"
                            height="56"
                            className="h-14 w-auto shrink-0 object-contain transition-transform duration-300 hover:scale-105"
                        />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="truncate font-display text-lg font-bold leading-tight tracking-tight text-white sm:text-xl">
                                    Sri Srinivasa
                                </span>
                                <span className="hidden items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-primary sm:inline-flex">
                                    <ShieldCheck className="h-3 w-3" /> Admin Portal
                                </span>
                            </div>
                            <span className="block text-[10px] font-bold uppercase leading-tight tracking-[0.2em] text-primary sm:text-xs">
                                Canvassing
                            </span>
                        </div>
                    </Link>

                    <div className="flex shrink-0 items-center gap-2">
                        <Link
                            to="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-gray-300 transition-colors hover:border-primary/40 hover:bg-white/5 hover:text-white sm:px-4"
                            aria-label="View public website"
                        >
                            <ExternalLink className="h-4 w-4" />
                            <span className="hidden sm:inline">View Website</span>
                        </Link>
                        {isAuthenticated && (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-gray-300 transition-colors hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 sm:px-4"
                                aria-label="Sign out of admin portal"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        )}
                    </div>
                </div>

                {isAuthenticated && (
                    <div className="flex gap-1 overflow-x-auto border-t border-white/5 py-2 lg:hidden">
                        {adminLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                aria-current={isActive(link.path) ? 'page' : undefined}
                                className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                                    isActive(link.path)
                                        ? 'bg-primary text-white'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <link.icon className="h-4 w-4" /> {link.label}
                            </Link>
                        ))}
                    </div>
                )}

                {isAuthenticated && (
                    <div className="absolute left-1/2 top-0 hidden h-20 -translate-x-1/2 items-center gap-1 lg:flex">
                        {adminLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                aria-current={isActive(link.path) ? 'page' : undefined}
                                className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors lg:px-4 ${
                                    isActive(link.path)
                                        ? 'bg-primary/15 text-primary'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <link.icon className="h-4 w-4" /> {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </nav>
        </header>
    );
};

export default AdminHeader;
