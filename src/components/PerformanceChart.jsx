import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PerformanceChart({ trades }) {
  // useMemo hace que este cálculo matemático solo se repita si la lista de trades cambia (Optimización Enterprise)
  const data = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    // 1. Filtramos solo los cerrados y los ordenamos del más viejo al más nuevo cronológicamente
    const closedTrades = trades
      .filter(t => t.status === 'CLOSED')
      .sort((a, b) => new Date(a.exitDate || a.entryDate) - new Date(b.exitDate || b.entryDate));

    let cumulativePnL = 0;
    
    // 2. Mapeamos los datos para la librería Recharts
    const chartData = closedTrades.map(trade => {
      cumulativePnL += trade.pnlNet;
      return {
        name: new Date(trade.exitDate || trade.entryDate).toLocaleDateString(), // Fecha para el eje X
        PnL: cumulativePnL, // Valor para el eje Y
        tradeAsset: trade.asset, // Info extra para el recuadro flotante
        tradePnL: trade.pnlNet
      };
    });

    // 3. Agregamos un punto de inicio en $0 para que la gráfica nazca desde cero
    return [{ name: 'Inicio', PnL: 0, tradeAsset: '-', tradePnL: 0 }, ...chartData];
  }, [trades]);

  // Diseño de la ventanita negra flotante cuando pasas el mouse por encima de la línea
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pointData = payload[0].payload;
      return (
        <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9em', color: '#94a3b8' }}>{pointData.name}</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '1.1em', fontWeight: 'bold', color: pointData.PnL >= 0 ? '#10b981' : '#ef4444' }}>
            Neto Acumulado: ${pointData.PnL.toFixed(2)}
          </p>
          {pointData.tradeAsset !== '-' && (
            <p style={{ margin: '5px 0 0 0', fontSize: '0.85em', color: '#cbd5e1' }}>
              Última op: {pointData.tradeAsset} (${pointData.tradePnL})
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Si no hay operaciones cerradas, mostramos un mensaje bonito en lugar de un gráfico vacío
  if (data.length <= 1) {
    return (
      <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
        <p style={{ color: '#64748b' }}>Cierra al menos una operación para ver tu curva de rendimiento.</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
      <h3 style={{ marginTop: 0, color: '#1e293b', marginBottom: '20px' }}>Curva de Rendimiento (Equity Curve)</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="PnL" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2, fill: 'white', stroke: '#3b82f6' }} 
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}