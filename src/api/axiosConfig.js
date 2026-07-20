import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true 
});



api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Sesión expirada o inválida.");
            // Ya no borramos el token de localstorage, solo el portfolio
            localStorage.removeItem('portfolioId');
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;