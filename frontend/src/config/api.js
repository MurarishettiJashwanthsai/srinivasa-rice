// Centralized API Base URL helper for Sri Srinivasa Canvassing
const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocal) return '';
        return import.meta.env.VITE_API_URL || 'http://localhost:5001';
    }
    return import.meta.env.VITE_API_URL || 'https://srinivasa-rice.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();
