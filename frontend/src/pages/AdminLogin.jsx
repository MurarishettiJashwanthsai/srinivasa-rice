import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import useMeta from '../hooks/useMeta';
import { adminFetch } from '../utils/adminApi';

const AdminLogin = () => {
    useMeta({
        title: 'Administration Sign-in — Sri Srinivasa Canvassing',
        description: 'Authorized administrative sign-in portal for Sri Srinivasa Canvassing inventory and market rate management.',
        noindex: true,
    });

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
            const response = await adminFetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            if (response.ok) {
                toast.success('Sign-in successful!');
                navigate('/admin');
            } else {
                const data = await response.json().catch(() => ({}));
                toast.error(data.detail || 'Invalid username or password credentials');
            }
        } catch {
            toast.error('Unable to connect to administrative server');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3.5 rounded-xl border border-border dark:border-white/10 bg-surface dark:bg-secondary-light/30 text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm font-bold";

    return (
        <div className="py-16 md:py-24 bg-background dark:bg-secondary min-h-[75vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 font-sans">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                    <Lock className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-display font-black uppercase tracking-tight text-text-main dark:text-white mb-2">Administration Sign-in</h1>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-text-muted dark:text-gray-400">Sri Srinivasa Canvassing · Internal Terminal</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="premium-card rounded-3xl py-8 px-6 sm:px-10 border border-border dark:border-white/10 shadow-2xl">
                    <form className="space-y-6" onSubmit={handleLogin} method="POST">
                        <div>
                            <label htmlFor="admin-username" className="block text-xs font-black text-text-main dark:text-white/80 uppercase tracking-widest mb-2">Username or Email</label>
                            <input
                                id="admin-username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={inputClass}
                                placeholder="Username or Email id"
                            />
                        </div>
                        <div>
                            <label htmlFor="admin-password" className="block text-xs font-black text-text-main dark:text-white/80 uppercase tracking-widest mb-2">Password</label>
                            <input
                                id="admin-password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClass}
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-4 rounded-xl font-black uppercase tracking-widest text-sm text-white bg-primary hover:bg-primary-dark transition-all hover:scale-[1.02] shadow-lg shadow-primary/20 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Authenticating...' : 'Sign in to Terminal'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
