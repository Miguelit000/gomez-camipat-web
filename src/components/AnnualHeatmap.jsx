import React, { useState, useMemo } from 'react';

export default function AnnualHeatmap({ data }) {
  // 1. Extraemos dinámicamente todos los años en los que hay operaciones
  const availableYears = useMemo(() => {
    if (!data || data.length === 0) return [new Date().getFullYear()];
    const years = new Set(data.map(day => parseInt(day.date.split('-')[0], 10)));
    return Array.from(years).sort((a, b) => b - a); // Ordenamos de más reciente a más antiguo
  }, [data]);

  // 2. Estado para controlar qué año estamos viendo (por defecto, el más reciente)
  const [selectedYear, setSelectedYear] = useState(availableYears[0]);

  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  // Convertimos el arreglo en Diccionario para velocidad
  const dataMap = useMemo(() => {
    const map = {};
    if (data && data.length > 0) {
      data.forEach(day => {
        map[day.date] = day;
      });
    }
    return map;
  }, [data]);

  const getDaysInMonth = (monthIndex, year) => new Date(year, monthIndex + 1, 0).getDate();

  const getSquareColor = (dateStr) => {
    const dayData = dataMap[dateStr];
    if (!dayData) return '#e2e8f0'; 
    return dayData.isProfitable ? '#22c55e' : '#ef4444'; 
  };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
      
      {/* CABECERA CON EL SELECTOR DE AÑO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#1e293b' }}>📅 Mapa de Calor Operativo</h3>
        
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer', background: '#f8fafc', fontSize: '1em' }}
        >
          {availableYears.map(year => (
            <option key={year} value={year}>Año {year}</option>
          ))}
        </select>
      </div>

      {/* REJILLA DE LOS 12 MESES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {months.map((monthName, monthIndex) => {
          // Usamos 'selectedYear' en lugar del año actual
          const daysInMonth = getDaysInMonth(monthIndex, selectedYear);
          const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

          return (
            <div key={monthName} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase' }}>{monthName}</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {daysArray.map(day => {
                  const monthStr = String(monthIndex + 1).padStart(2, '0');
                  const dayStr = String(day).padStart(2, '0');
                  const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;

                  const color = getSquareColor(dateStr);
                  const dayData = dataMap[dateStr];
                  
                  const tooltip = dayData
                    ? `${dateStr} | ${dayData.tradeCount} Operaciones | PnL: $${dayData.netPnl}`
                    : `${dateStr} | Sin operaciones`;

                  return (
                    <div
                      key={day}
                      title={tooltip}
                      style={{
                        width: '14px',
                        height: '14px',
                        backgroundColor: color,
                        borderRadius: '3px',
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease-in-out'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.3)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '25px', fontSize: '0.85em', color: '#64748b', justifyContent: 'flex-end', fontWeight: 'bold' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '14px', height: '14px', background: '#22c55e', borderRadius: '3px' }}></div> Día Ganador</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '14px', height: '14px', background: '#ef4444', borderRadius: '3px' }}></div> Día Perdedor</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '14px', height: '14px', background: '#e2e8f0', borderRadius: '3px' }}></div> Sin Operar</div>
      </div>
    </div>
  );
}