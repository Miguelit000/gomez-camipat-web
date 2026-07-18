import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { GoogleLogin } from '@react-oauth/google'; 
import bgImage from '../assets/AstroTrade-Logo.png'; 

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { token: credentialResponse.credential });
      login(res.data.token, res.data.portfolioId);
      navigate('/dashboard');
    } catch (err) {
      console.error("Error en Google Login:", err);
      setError('No se pudo iniciar sesión con Google. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const res = await api.post(endpoint, formData);
      login(res.data.token, res.data.portfolioId);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    // <-- Color de fondo oscuro y contenedor relativo para alojar la imagen -->
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* CAPA DE FONDO GIGANTE Y TRASLÚCIDA */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.1, // Un toque más de opacidad en el Login
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '400px', background: 'rgba(255, 255, 255, 0.95)', padding: '40px', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ textAlign: 'center', color: '#0f172a', marginBottom: '10px' }}>
            {isRegister ? 'Crear Cuenta' : 'Bienvenido de nuevo'}
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px' }}>
            AstroTrade
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('El inicio de sesión con Google fue cancelado o falló.')}
              useOneTap
              shape="rectangular"
              theme="outline"
              size="large"
              text={isRegister ? "signup_with" : "signin_with"}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e2e8f0' }} />
            <span style={{ padding: '0 10px', color: '#94a3b8', fontSize: '0.85em', fontWeight: 'bold' }}>O CONTINÚA CON EMAIL</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e2e8f0' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#475569', fontWeight: 'bold', fontSize: '0.9em' }}>Correo Electrónico</label>
              <input 
                type="email" name="email" value={formData.email} onChange={handleChange} required 
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#475569', fontWeight: 'bold', fontSize: '0.9em' }}>Contraseña</label>
              <input 
                type="password" name="password" value={formData.password} onChange={handleChange} required 
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
            
            {error && <div style={{ color: '#ef4444', fontSize: '0.9em', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}

            <button type="submit" disabled={loading} style={{ padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1em', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {loading ? 'Procesando...' : (isRegister ? 'Registrarse' : 'Iniciar Sesión')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '25px', color: '#64748b', fontSize: '0.9em' }}>
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'} 
            <span 
              onClick={() => setIsRegister(!isRegister)} 
              style={{ color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}>
              {isRegister ? 'Inicia sesión' : 'Regístrate'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}