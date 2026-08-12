// Centralized API Base URL helper for Sri Srinivasa Canvassing
const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:5001';
    }
    return 'https://srinivasa-rice.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();
