import { API_BASE_URL } from '../config/api';

export const adminFetch = (path, options = {}) => fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
        ...(options.headers || {}),
    },
});

export const signOutAdmin = () => adminFetch('/api/admin/logout', { method: 'POST' });
