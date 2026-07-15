import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig'; 
import { AuthContext } from '../context/AuthContext'; 

export default function StrategiesPage() {
  // <-- CAMBIO 1: Ahora usamos portfolioId
  const { portfolioId } = useContext(AuthContext);

  const [strategies, setStrategies] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Estados para el formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [guardando, setGuardando] = useState(false);

  const fetchStrategies = async () => {
    // <-- CAMBIO 2: Validamos portfolioId
    if (!portfolioId) return;
    setCargando(true);
    try {
      // <-- CAMBIO 3: Nueva ruta apuntando a /portfolio/
      const response = await api.get(`/strategies/portfolio/${portfolioId}`);
      // Ordenamos para que las más nuevas salgan arriba
      const ordenadas = response.data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setStrategies(ordenadas);
      setError('');
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los playbooks desde la bóveda.');
    } finally {
      setCargando(false);
    }
  };

  // Se ejecuta al entrar a la pantalla
  useEffect(() => {
    fetchStrategies();
  // <-- CAMBIO 4: Reactionamos a cambios en el portfolioId
  }, [portfolioId]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      await api.post('/strategies', {
        // <-- CAMBIO 5: Enviamos portfolioId a Spring Boot
        portfolioId: portfolioId,
        name: name,
        description: description,
        rules: rules
      });

      // Limpiamos el formulario
      setName('');
      setDescription('');
      setRules('');
      
      // Volvemos a pedir la lista a Java para ver la nueva estrategia aparecer
      fetchStrategies(); 
    } catch (err) {
      console.error(err);
      alert('Error al guardar la estrategia en la base de datos.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#0f172a' }}>🧠 Centro de Estrategias</h1>
        <p style={{ margin: 0, color: '#64748b' }}>Define tus playbooks institucionales para mantener la disciplina operativa.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        
        {/* PANEL IZQUIERDO: Formulario de Creación */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>+ Nuevo Playbook</h3>
          <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Nombre de la Estrategia</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ej. Smart Money Reversal" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Descripción Breve</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows="2" placeholder="¿En qué consiste el setup?" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}></textarea>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Reglas Operativas (Checklist)</label>
              <textarea value={rules} onChange={(e) => setRules(e.target.value)} required rows="5" placeholder="1. Condición A...&#10;2. Condición B..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}></textarea>
            </div>
            <button type="submit" disabled={guardando} style={{ padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: guardando ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
              {guardando ? 'Guardando en Bóveda...' : 'Registrar Estrategia'}
            </button>
          </form>
        </div>

        {/* PANEL DERECHO: Tarjetas de Estrategias Reales */}
        <div>
          {cargando ? (
            <p style={{ color: '#3b82f6', fontWeight: 'bold' }}>Sincronizando playbooks con PostgreSQL...</p>
          ) : error ? (
            <p style={{ color: '#ef4444', fontWeight: 'bold' }}>{error}</p>
          ) : strategies.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '1.1em' }}>No tienes estrategias registradas. Crea tu primer playbook a la izquierda.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {strategies.map((strat) => (
                <div key={strat.id} style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '5px solid #3b82f6', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '1.4em' }}>{strat.name}</h3>
                  <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '1.05em' }}>{strat.description}</p>
                  
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#475569', fontSize: '0.9em', textTransform: 'uppercase' }}>Checklist de Confirmación</h4>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#334155', lineHeight: '1.6' }}>
                      {strat.rules}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}