import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { portfolioId, setPortfolioId, token } = useContext(AuthContext);
  const [portfolios, setPortfolios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Modificamos el estado inicial para que acepte la nueva variable 'targetBalance'
  const [newPortData, setNewPortData] = useState({ 
    name: '', 
    initialBalance: 10000, 
    targetBalance: 20000, 
    currency: 'USD' 
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        // CORRECCIÓN PRINCIPAL: La ruta es /portfolios, NO /portfolios/me
        const res = await api.get('/portfolios');
        setPortfolios(res.data);
        
        // Autoselección de cuenta preventiva si entras y no hay ninguna seleccionada
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

  const handleSwitchPortfolio = (e) => {
    const newId = e.target.value;
    
    // Si eligen "Crear Nueva", abrimos el modal y evitamos cambiar la cuenta
    if (newId === "NEW") {
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

  // No renderizar Navbar si no hay sesión
  if (!token || location.pathname === '/') return null;

  return (
    <nav style={{ background: '#0f172a', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '1.2em', fontWeight: 'bold' }}>
          ⚡ Gomez Capital
        </Link>
        <div style={{ background: '#1e293b', padding: '5px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85em', color: '#94a3b8', fontWeight: 'bold' }}>CUENTA:</span>
          <select 
            value={portfolioId || ''} 
            onChange={handleSwitchPortfolio} 
            style={{ background: 'transparent', color: 'white', border: 'none', fontWeight: 'bold', outline: 'none', cursor: 'pointer', fontSize: '1em' }}
          >
            {portfolios.map(p => (
              <option key={p.id} value={p.id} style={{ color: '#0f172a' }}>{p.name}</option>
            ))}
            <option value="NEW" style={{ color: '#3b82f6', fontWeight: 'bold' }}>+ Crear Nueva Cuenta</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/dashboard" style={{ color: '#f8fafc', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</Link>
        <Link to="/strategies" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 'bold' }}>Estrategias</Link>
        <Link to="/statistics" style={{ color: location.pathname === '/statistics' ? '#f8fafc' : '#94a3b8', textDecoration: 'none', fontWeight: 'bold' }}>Estadísticas</Link>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px', color: '#0f172a' }}>
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