import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:5001/api',
});

// Interceptor to handle Token sync and injection
api.interceptors.request.use((config) => {
    // 1. Check for token in URL (incoming from main platform)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
        localStorage.setItem('hiredUpToken', urlToken);
        // Optional: Clean up URL for professional look
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, '', newUrl);
    }

    // 2. Attach token from localStorage to Header
    const token = localStorage.getItem('hiredUpToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
