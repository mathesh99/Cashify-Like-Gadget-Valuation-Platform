const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    get: async (endpoint) => {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers: getHeaders() });
        if (!res.ok) throw await res.json();
        return res.json();
    },
    post: async (endpoint, data) => {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw await res.json();
        return res.json();
    }
};
