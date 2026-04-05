import { useEffect, useState, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

export default function DashboardMetrics({ refreshTrigger }) {
  const { accountId } = useContext(AuthContext);
  const [metrics, setMetrics] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    profitFactor: 0,
    totalPnl: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!accountId) return;
      
      try {
        // Apuntamos al AnalyticsController de tu Spring Boot
        const response = await api.get(`/analytics/account/${accountId}`);
        setMetrics(response.data);
      } catch (error) {
        console.error("Error al cargar las métricas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  // El useEffect se volverá a ejecutar si accountId cambia, o si refreshTrigger cambia
  }, [accountId, refreshTrigger]);

  if (loading) return <div style={{ marginBottom: '20px', color: '#64748b' }}>Calculando estadísticas financieras...</div>;

  // Función auxiliar para dar color verde o rojo según las ganancias
  const colorPnL = metrics.totalPnl > 0 ? '#10b981' : (metrics.totalPnl < 0 ? '#ef4444' : '#1e293b');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
      
      {/* Tarjeta 1: PnL Total */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: `4px solid ${colorPnL}` }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9em', fontWeight: 'bold', textTransform: 'uppercase' }}>PnL Neto Total</p>
        <h2 style={{ margin: '10px 0 0 0', color: colorPnL, fontSize: '2em' }}>
          ${metrics.totalPnl !== null ? metrics.totalPnl : '0.00'}
        </h2>
      </div>

      {/* Tarjeta 2: Win Rate */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #3b82f6' }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9em', fontWeight: 'bold', textTransform: 'uppercase' }}>Win Rate</p>
        <h2 style={{ margin: '10px 0 0 0', color: '#1e293b', fontSize: '2em' }}>
          {metrics.winRate}%
        </h2>
        <p style={{ margin: '5px 0 0 0', fontSize: '0.85em', color: '#94a3b8' }}>{metrics.winningTrades} Ganadas / {metrics.losingTrades} Perdidas</p>
      </div>

      {/* Tarjeta 3: Profit Factor */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #8b5cf6' }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9em', fontWeight: 'bold', textTransform: 'uppercase' }}>Profit Factor</p>
        <h2 style={{ margin: '10px 0 0 0', color: '#1e293b', fontSize: '2em' }}>
          {metrics.profitFactor}
        </h2>
      </div>

      {/* Tarjeta 4: Total Trades */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #f59e0b' }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9em', fontWeight: 'bold', textTransform: 'uppercase' }}>Trades Finalizados</p>
        <h2 style={{ margin: '10px 0 0 0', color: '#1e293b', fontSize: '2em' }}>
          {metrics.totalTrades}
        </h2>
      </div>

    </div>
  );
}