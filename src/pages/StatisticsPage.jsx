import { useEffect, useState, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import AnnualHeatmap from '../components/AnnualHeatmap';
import PremiumBanner from '../components/PremiumBanner'; // Importamos el banner

export default function StatisticsPage() {
  const { portfolioId, userRole } = useContext(AuthContext); // Extraemos userRole
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // BLOQUEO VISUAL: Si no es PRO, detenemos todo aquí y mostramos el diseño limpio
  if (userRole !== 'ROLE_PRO' && userRole !== 'ROLE_ADMIN') {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <PremiumBanner 
          title="Analítica Avanzada Institucional" 
          description="Descubre métricas profundas como la Esperanza Matemática, el factor SQN, la Excursión Adversa (MAE) y tu Mapa de Calor Anual." 
        />
      </div>
    );
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!portfolioId) return;
      try {
        setLoading(true);
        // Llamada al endpoint avanzado que creamos en Java
        const response = await api.get(`/analytics/portfolio/${portfolioId}/advanced`);
        setStats(response.data);
      } catch (err) {
        console.error("Error al cargar analíticas avanzadas:", err);
        setError('Error al conectar con el servidor analítico.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [portfolioId]);

  if (loading) return <div style={{ padding: '40px', color: '#64748b', fontWeight: 'bold', textAlign: 'center' }}>Calculando métricas institucionales...</div>;
  if (error) return <div style={{ padding: '40px', color: '#ef4444', fontWeight: 'bold', textAlign: 'center' }}>{error}</div>;
  if (!stats) return null;

  // Componente interno para reutilizar el diseño de las mini-tarjetas
  const StatCard = ({ title, value, subtitle, valueColor = '#1e293b' }) => (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85em', fontWeight: 'bold', textTransform: 'uppercase' }}>{title}</p>
      <h2 style={{ margin: '8px 0 4px 0', color: valueColor, fontSize: '1.8em' }}>{value}</h2>
      {subtitle && <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8em' }}>{subtitle}</p>}
    </div>
  );

  const getSqnColor = (sqn) => {
    if (sqn >= 3) return '#10b981'; // Excelente (Verde)
    if (sqn >= 2) return '#3b82f6'; // Bueno (Azul)
    if (sqn >= 1) return '#f59e0b'; // Regular (Naranja)
    return '#ef4444'; // Pobre (Rojo)
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#0f172a' }}>📊 Analítica Avanzada</h1>
        <p style={{ margin: 0, color: '#64748b' }}>Basado en {stats.totalTrades} operaciones cerradas</p>
      </div>

      {/* REJILLA DE MÉTRICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        <StatCard title="Win Rate" value={`${stats.winRate}%`} subtitle="Porcentaje de acierto" />
        
        <StatCard title="Profit Factor" value={stats.profitFactor} subtitle="Beneficio bruto / Pérdida bruta" valueColor={stats.profitFactor >= 1 ? '#10b981' : '#ef4444'} />
        
        <StatCard title="Expectancy ($)" value={`$${stats.expectancyUsd}`} subtitle="Esperanza matemática promedio" valueColor={stats.expectancyUsd > 0 ? '#10b981' : '#ef4444'} />
        
        <StatCard title="Risk / Reward ($)" value={`1 : ${stats.averageRewardToRiskUsd}`} subtitle="Ratio de Riesgo/Beneficio real" />

        <StatCard title="Max Drawdown" value={`-$${stats.maxDrawdownUsd}`} subtitle={`${stats.maxDrawdownPct}% de caída máxima`} valueColor="#ef4444" />
        
        <StatCard title="Average Drawdown" value={`-$${stats.averageDrawdownUsd}`} subtitle="Promedio de caídas" valueColor="#f97316" />

        <StatCard title="Mejor Racha Ganadora" value={`${stats.maxConsecutiveWins} Wins`} subtitle="Operaciones seguidas" valueColor="#10b981" />
        
        <StatCard title="Peor Racha Perdedora" value={`${stats.maxConsecutiveLosses} Loss`} subtitle="Operaciones seguidas" valueColor="#ef4444" />

        <StatCard title="SQN (System Quality)" value={stats.sqn} subtitle="Puntuación del sistema (Van Tharp)" valueColor={getSqnColor(stats.sqn)} />
        
        <StatCard title="Holding Period" value={`${stats.avgHoldingPeriodHours} hrs`} subtitle="Tiempo promedio en operación" />

        <StatCard title="MFE (Promedio)" value={`$${stats.averageMfe}`} subtitle="Maximum Favorable Excursion" valueColor="#3b82f6" />
        
        <StatCard title="MAE (Promedio)" value={`-$${stats.averageMae}`} subtitle="Maximum Adverse Excursion" valueColor="#f43f5e" />

      </div>

      {/* MAPA DE CALOR ANUAL */}
      <div style={{ marginBottom: '40px' }}>
        <AnnualHeatmap data={stats.heatmapData} />
      </div>

    </div>
  );
}