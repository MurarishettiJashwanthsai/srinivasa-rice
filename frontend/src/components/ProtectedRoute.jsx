import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { adminFetch } from '../utils/adminApi';

const ProtectedRoute = ({ children }) => {
    const [sessionState, setSessionState] = useState('checking');

    useEffect(() => {
        let active = true;
        adminFetch('/api/admin/session')
            .then((response) => {
                if (active) setSessionState(response.ok ? 'authenticated' : 'unauthenticated');
            })
            .catch(() => {
                if (active) setSessionState('unauthenticated');
            });
        return () => { active = false; };
    }, []);

    if (sessionState === 'checking') {
        return <div className="min-h-[60vh] flex items-center justify-center text-sm font-bold text-text-muted" aria-live="polite">Checking secure admin session…</div>;
    }

    if (sessionState === 'unauthenticated') {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
