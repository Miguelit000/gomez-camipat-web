import axios from 'axios';

// 1. Creamos una instancia base apuntando a tu Spring Boot
const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

// 2. INTERCEPTOR DE SALIDA (Request)
// Antes de que cualquier petición salga hacia Java, este código la intercepta
api.interceptors.request.use(
    (config) => {
        // Buscamos el token en la caja fuerte
        const token = localStorage.getItem('jwt_token');
        
        // Si hay token, se lo pegamos a la cabecera automáticamente
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
// Evalúa las respuestas de Java ANTES de que lleguen a tus pantallas
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si Java responde 401 (No Autorizado) o 403 (Prohibido), el token expiró o es inválido
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Sesión expirada o inválida. Limpiando credenciales...");
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('account_id');
            // Redirigimos silenciosamente al login
            window.location.href = '/'; 
        }
        return Promise.reject(error);
    }
);

export default api;