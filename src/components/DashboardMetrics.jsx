import { useEffect, useState, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

export default function DashboardMetrics({ refreshTrigger }) {
  const { portfolioId } = useContext(AuthContext);
  
  const [metrics, setMetrics] = useState({
    totalTrades: 0, winningTrades: 0, losingTrades: 0, winRate: 0, profitFactor: 0, totalPnl: 0
  });
  
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  // <-- ESTADOS PARA EL MODAL DE CAPITAL -->
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [capitalForm, setCapitalForm] = useState({ initial: 0, current: 0, target: 0 });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!portfolioId) return;
      try {
        const [metricsResponse, portfoliosResponse] = await Promise.all([
          api.get(`/analytics/portfolio/${portfolioId}`),
          api.get('/portfolios')
        ]);
        
        setMetrics(metricsResponse.data);
        const currentPortfolio = portfoliosResponse.data.find(p => p.id === portfolioId);
        setPortfolio(currentPortfolio);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [portfolioId, refreshTrigger]);

  const handleOpenCapitalModal = () => {
    setCapitalForm({
      initial: portfolio.initialBalance,
      current: portfolio.currentBalance,
      target: portfolio.targetBalance
    });
    setShowCapitalModal(true);
  };

  const handleSaveCapital = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        initialBalance: parseFloat(capitalForm.initial),
        currentBalance: parseFloat(capitalForm.current),
        targetBalance: parseFloat(capitalForm.target)
      };
      
      await api.patch(`/portfolios/${portfolio.id}/balances`, payload);
      
      // Actualizamos UI al instante
      setPortfolio({ ...portfolio, ...payload });
      setShowCapitalModal(false);
    } catch (error) {
      console.error("Error al actualizar capital", error);
      alert("Hubo un error al guardar los ajustes de capital.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div style={{ marginBottom: '20px', color: '#64748b', fontWeight: 'bold' }}>Calculando estadísticas financieras...</div>;

  const colorPnL = metrics.totalPnl >= 0 ? '#22c55e' : '#ef4444';

  let progress = 0;
  if (portfolio && portfolio.targetBalance > portfolio.initialBalance) {
    progress = ((portfolio.currentBalance - portfolio.initialBalance) / 
                (portfolio.targetBalance - portfolio.initialBalance)) * 100;
    progress = Math.max(0, Math.min(progress, 100));
  }

  return (
    <div style={{ marginBottom: '30px' }}>
      
      {/* FILA SUPERIOR: BÓVEDA (Balance y Objetivo) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
        
        {/* Tarjeta 1: Balance Oscuro */}
        {portfolio && (
          <div style={{ flex: '1 1 300px', background: '#0f172a', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9em', fontWeight: 'bold', textTransform: 'uppercase' }}>Balance Total Cuenta</p>
              
              {/* <-- NUEVO BOTÓN DE AJUSTES --> */}
              <button onClick={handleOpenCapitalModal} style={{ background: '#334155', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8em', fontWeight: 'bold' }}>
                ⚙️ Ajustar Capital
              </button>
            </div>
            <h2 style={{ margin: '10px 0 0 0', color: '#f8fafc', fontSize: '2.5em' }}>
              ${portfolio.currentBalance?.toFixed(2)}
            </h2>
          </div>
        )}

        {/* Tarjeta 2: Objetivo Visual */}
        {portfolio && (
          <div style={{ flex: '2 1 400px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9em', fontWeight: 'bold', textTransform: 'uppercase' }}>Objetivo Financiero</p>
                <h2 style={{ margin: '10px 0 0 0', color: '#1e293b', fontSize: '2em' }}>
                  ${portfolio.targetBalance?.toFixed(2)}
                </h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#f59e0b' }}>{progress.toFixed(1)}%</span>
              </div>
            </div>
            <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)', transition: 'width 1s ease-in-out' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* FILA INFERIOR: MÉTRICAS TÉCNICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: `4px solid ${colorPnL}` }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9em', fontWeight: 'bold', textTransform: 'uppercase' }}>PnL Neto Total</p>
          <h2 style={{ margin: '10px 0 0 0', color: colorPnL, fontSize: '2em' }}>{metrics.totalPnl >= 0 ? '+' : ''}${metrics.totalPnl}</h2>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #3b82f6' }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9em', fontWeight: 'bold', textTransform: 'uppercase' }}>Win Rate</p>
          <h2 style={{ margin: '10px 0 0 0', color: '#1e293b', fontSize: '2em' }}>{metrics.winRate}%</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.85em', color: '#94a3b8' }}>{metrics.winningTrades} G / {metrics.losingTrades} P</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #8b5cf6' }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9em', fontWeight: 'bold', textTransform: 'uppercase' }}>Profit Factor</p>
          <h2 style={{ margin: '10px 0 0 0', color: '#1e293b', fontSize: '2em' }}>{metrics.profitFactor}</h2>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #10b981' }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9em', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Operaciones</p>
          <h2 style={{ margin: '10px 0 0 0', color: '#1e293b', fontSize: '2em' }}>{metrics.totalTrades}</h2>
        </div>
      </div>

      {/* <-- MODAL DE GESTIÓN DE CAPITAL --> */}
      {showCapitalModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>⚙️ Gestión de Capital</h3>
            
            <form onSubmit={handleSaveCapital}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>
                  Balance Actual (Depósitos/Retiros)
                </label>
                <input type="number" step="0.01" value={capitalForm.current} onChange={(e) => setCapitalForm({...capitalForm, current: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '1.1em', fontWeight: 'bold', color: '#0f172a' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>
                  Nuevo Objetivo / Meta
                </label>
                <input type="number" step="0.01" value={capitalForm.target} onChange={(e) => setCapitalForm({...capitalForm, target: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '1.1em', fontWeight: 'bold', color: '#0f172a' }} />
              </div>

              <div style={{ marginBottom: '25px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>
                  Balance Inicial (Base del 0%)
                </label>
                <input type="number" step="0.01" value={capitalForm.initial} onChange={(e) => setCapitalForm({...capitalForm, initial: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', color: '#475569' }} />
                <p style={{ margin: '5px 0 0 0', fontSize: '0.75em', color: '#94a3b8' }}>*Cámbialo igual a tu Balance Actual si quieres reiniciar el progreso de la meta a 0%.</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowCapitalModal(false)} style={{ padding: '10px 15px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                <button type="submit" disabled={isSaving} style={{ padding: '10px 15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {isSaving ? 'Guardando...' : 'Aplicar Cambios'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}