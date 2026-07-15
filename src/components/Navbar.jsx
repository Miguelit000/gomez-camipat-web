import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { portfolioId, setPortfolioId, token, userRole } = useContext(AuthContext);
  const [portfolios, setPortfolios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // <-- Estado para nuestro nuevo menú
  
  const [newPortData, setNewPortData] = useState({ 
    name: '', 
    initialBalance: 10000, 
    targetBalance: 20000, 
    currency: 'USD' 
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await api.get('/portfolios');
        setPortfolios(res.data);
        
        if (res.data.length > 0 && !portfolioId) {
          setPortfolioId(res.data[0].id);
          localStorage.setItem('portfolioId', res.data[0].id);
        }
      } catch (error) {
        console.error('Error cargando portafolios', error);
      }
    };
    
    if (token && location.pathname !== '/') fetchPortfolios();
  }, [token, location.pathname, portfolioId, setPortfolioId]);

  // Cierra el menú si tocas fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPortfolio = (newId) => {
    setDropdownOpen(false);
    
    // DEBUG: Verifiquemos qué rol tiene realmente el usuario en este momento
    console.log("Rol actual del usuario:", userRole);
    console.log("Total de portafolios:", portfolios.length);

    if (newId === "NEW") {
        // Bloqueo estricto: Si no es PRO y ya tiene al menos 1 portafolio, prohibir
        if (userRole !== 'ROLE_PRO' && portfolios.length >= 1) {
            alert("Límite alcanzado: Las cuentas gratuitas solo pueden tener 1 portafolio. ¡Mejora a PRO para crear cuentas ilimitadas!");
            return; // Detenemos la ejecución aquí
        }
        
        setShowModal(true);
        return;
    }
    
    setPortfolioId(newId);
    localStorage.setItem('portfolioId', newId);
    navigate('/dashboard');
    window.location.reload(); 
  };

  const handleCreatePortfolio = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/portfolios', newPortData);
      setPortfolios([...portfolios, res.data]);
      setPortfolioId(res.data.id);
      localStorage.setItem('portfolioId', res.data.id);
      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error al crear portafolio", error);
      alert("Error al crear la cuenta. Revisa tu conexión.");
    }
  };

  if (!token || location.pathname === '/') return null;

  const currentPortfolio = portfolios.find(p => p.id === portfolioId);

  return (
    <nav style={{ background: '#0f172a', padding: '15px', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      
      {/* SECCIÓN IZQUIERDA: Logo y Selector de Cuenta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px', flex: '1 1 auto' }}>
        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '1.2em', fontWeight: 'bold', minWidth: 'max-content' }}>
          ⚡ AstroTrade
        </Link>
        
        {/* NUEVO MENÚ DESPLEGABLE PERSONALIZADO */}
        <div ref={dropdownRef} style={{ position: 'relative', background: '#1e293b', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 auto', maxWidth: 'fit-content' }}>
          <span style={{ fontSize: '0.8em', color: '#94a3b8', fontWeight: 'bold' }}>CUENTA:</span>
          
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95em', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <span style={{ maxWidth: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentPortfolio ? currentPortfolio.name : 'Cargando...'}
            </span>
            <span style={{ fontSize: '0.8em' }}>▼</span>
          </div>

          {dropdownOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', overflow: 'hidden', minWidth: '220px', zIndex: 4000 }}>
              {portfolios.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => handleSelectPortfolio(p.id)}
                  style={{ padding: '12px 15px', color: '#0f172a', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontWeight: p.id === portfolioId ? 'bold' : 'normal', background: p.id === portfolioId ? '#f8fafc' : 'white' }}
                >
                  {p.name} {p.id === portfolioId && '✓'}
                </div>
              ))}
              <div 
                onClick={() => handleSelectPortfolio('NEW')}
                style={{ padding: '12px 15px', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', background: '#eff6ff' }}
              >
                + Crear Nueva Cuenta
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DERECHA: Enlaces tipo Pestaña */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', flex: '1 1 auto', justifyContent: 'flex-end' }}>
        <Link to="/dashboard" style={{ color: location.pathname === '/dashboard' ? '#ffffff' : '#94a3b8', background: location.pathname === '/dashboard' ? '#1e293b' : 'transparent', textDecoration: 'none', fontWeight: 'bold', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9em', transition: 'background 0.2s' }}>
          Dashboard
        </Link>
        <Link to="/strategies" style={{ color: location.pathname === '/strategies' ? '#ffffff' : '#94a3b8', background: location.pathname === '/strategies' ? '#1e293b' : 'transparent', textDecoration: 'none', fontWeight: 'bold', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9em', transition: 'background 0.2s' }}>
          Estrategias
        </Link>
        <Link to="/statistics" style={{ color: location.pathname === '/statistics' ? '#ffffff' : '#94a3b8', background: location.pathname === '/statistics' ? '#1e293b' : 'transparent', textDecoration: 'none', fontWeight: 'bold', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9em', transition: 'background 0.2s' }}>
          Estadísticas
        </Link>
      </div>

      {/* MODAL DE CREACIÓN DE CUENTA */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000, padding: '20px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', color: '#0f172a', boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0 }}>Crear Nueva Cuenta</h3>
            <form onSubmit={handleCreatePortfolio}>
              <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', marginBottom: '5px' }}>Nombre de la Cuenta</label>
              <input type="text" placeholder="Ej. Reto FTMO 100k" required onChange={e => setNewPortData({...newPortData, name: e.target.value})} style={{ width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              
              <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', marginBottom: '5px' }}>Capital Inicial (Balance)</label>
              <input type="number" placeholder="10000" required onChange={e => setNewPortData({...newPortData, initialBalance: parseFloat(e.target.value)})} style={{ width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              
              <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', marginBottom: '5px' }}>Objetivo Financiero (Meta)</label>
              <input type="number" placeholder="20000" required onChange={e => setNewPortData({...newPortData, targetBalance: parseFloat(e.target.value)})} style={{ width: '100%', marginBottom: '25px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />

              <div style={{ display:'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 15px', border: 'none', background: '#f1f5f9', color: '#475569', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                <button type="submit" style={{ padding: '10px 15px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Crear Cuenta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}