import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage() {
  // Estado para alternar entre Login y Registro
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Si isLogin es true, llamamos a /login. Si es false, llamamos a /register
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      
      const response = await api.post(endpoint, { email, password });

      // <-- CORRECCIÓN APLICADA AQUÍ: Extraemos el portfolioId
      const { token, portfolioId } = response.data;
      
      // Inyectamos los datos en el cerebro central
      login(token, portfolioId);
      
      // Teletransporte al Dashboard
      setTimeout(() => navigate('/dashboard'), 500);

    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Error en la autenticación');
      } else {
        setError('Error al conectar con los servidores de Gomez Capital.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Contenedor Principal: Flexbox que ocupa toda la pantalla (100vh)
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', margin: '-8px' }}>
      
      {/* PANEL IZQUIERDO: Branding y Textos (Oculto en celulares pequeños) */}
      <div style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '50px',
        borderRight: '1px solid #334155'
      }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3em', margin: '0 0 10px 0', letterSpacing: '-1px' }}>
            Gomez Capital<span style={{ color: '#3b82f6' }}>.</span>
          </h1>
          <p style={{ fontSize: '1.2em', color: '#94a3b8', lineHeight: '1.6', marginBottom: '40px' }}>
            La bóveda institucional diseñada para traders de alto rendimiento. Registra, analiza y escala tu operativa con precisión matemática.
          </p>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <li style={{ display: 'flex', alignItems: 'center', fontSize: '1.1em' }}>
              <span style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', marginRight: '15px' }}>📈</span>
              Análisis de Curva de Rendimiento en Tiempo Real
            </li>
            <li style={{ display: 'flex', alignItems: 'center', fontSize: '1.1em' }}>
              <span style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', marginRight: '15px' }}>📸</span>
              Galería Segura de Setups y Estrategias
            </li>
            <li style={{ display: 'flex', alignItems: 'center', fontSize: '1.1em' }}>
              <span style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', marginRight: '15px' }}>⚡</span>
              Arquitectura de Auto-sanación de Datos
            </li>
          </ul>
        </div>
      </div>

      {/* PANEL DERECHO: Formulario Dinámico */}
      <div style={{ 
        flex: 1, 
        background: '#ffffff', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2em', color: '#0f172a', margin: '0 0 10px 0' }}>
              {isLogin ? 'Bienvenido de vuelta' : 'Solicitar Acceso'}
            </h2>
            <p style={{ color: '#64748b', margin: 0 }}>
              {isLogin ? 'Ingresa tus credenciales para acceder a la bóveda.' : 'Crea tu cuenta y recibe $10,000 en tu bóveda de prueba.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px', fontSize: '0.9em' }}>
                Correo Electrónico
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="trader@ejemplo.com"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1em', boxSizing: 'border-box' }} 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px', fontSize: '0.9em' }}>
                Contraseña Criptográfica
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1em', boxSizing: 'border-box' }} 
              />
            </div>

            {error && (
              <div style={{ padding: '10px', background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', fontSize: '0.9em', fontWeight: 'bold' }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.05em', marginTop: '10px', transition: 'background 0.3s' }}
            >
              {loading ? 'Procesando Autorización...' : (isLogin ? 'Acceder a la Bóveda' : 'Crear mi Bóveda Institucional')}
            </button>
          </form>

          {/* El Botón Mágico para alternar estados */}
          <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <p style={{ color: '#64748b', fontSize: '0.95em' }}>
              {isLogin ? "¿No tienes acceso aún?" : "¿Ya tienes una bóveda?"}
            </p>
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(''); // Limpiamos errores al cambiar de vista
                setEmail('');
                setPassword('');
              }}
              style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', fontSize: '1em', padding: '5px 10px' }}
            >
              {isLogin ? "Crear cuenta nueva" : "Iniciar Sesión"}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}