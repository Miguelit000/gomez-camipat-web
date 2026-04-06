import axios from 'axios';

// 1. Creamos una instancia base apuntando a tu variable de entorno o a localhost como respaldo
const api = axios.create({
    // VITE_API_URL será la dirección de Railway. Si no existe, usa localhost para desarrollo.
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

// 2. INTERCEPTOR DE SALIDA (Request)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. INTERCEPTOR DE ENTRADA (Response)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Sesión expirada o inválida. Limpiando credenciales...");
            localStorage.removeItem('token');
            localStorage.removeItem('portfolioId');
            window.location.href = '/'; 
        }
        return Promise.reject(error);
    }
);

export default api;