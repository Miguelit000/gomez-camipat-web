import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

export default function CalendarWidget({ refreshTrigger }) {
  const { portfolioId } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // JS los meses van de 0 a 11

  useEffect(() => {
    const fetchCalendar = async () => {
      if (!portfolioId) return;
      setLoading(true);
      try {
        const response = await api.get(`/trades/portfolio/${portfolioId}/calendar`, {
          params: { year, month }
        });
        setCalendarData(response.data);
      } catch (error) {
        console.error("Error al cargar el calendario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [portfolioId, year, month, refreshTrigger]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  // Matemáticas del calendario
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 (Dom) a 6 (Sab)
  
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  // Helper para cruzar el día pintado con el JSON del backend
  const getDataForDay = (day) => {
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    return calendarData.find(d => d.date === dateStr);
  };

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
      
      {/* Cabecera del Calendario */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#1e293b' }}>Rendimiento Diario</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1 1 auto', justifyContent: 'flex-end' }}>
          <button onClick={handlePrevMonth} style={{ cursor: 'pointer', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '5px 15px', borderRadius: '6px', fontWeight: 'bold' }}>&larr;</button>
          <span style={{ fontWeight: 'bold', minWidth: '120px', textAlign: 'center', fontSize: '0.95em' }}>{monthNames[month - 1]} {year}</span>
          <button onClick={handleNextMonth} style={{ cursor: 'pointer', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '5px 15px', borderRadius: '6px', fontWeight: 'bold' }}>&rarr;</button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>Cargando datos del mes...</div>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '10px' }}>
          {/* El minWidth asegura que el calendario no se aplaste más de lo legible */}
          <div style={{ minWidth: '320px' }}>
            
            {/* Grilla: Días de la semana */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', fontSize: '0.75em', textTransform: 'uppercase' }}>
              <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
            </div>

            {/* Grilla: Casillas numéricas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {blanks.map((_, i) => (
                <div key={`blank-${i}`} style={{ padding: '5px', borderRadius: '6px', background: '#f8fafc' }}></div>
              ))}
              
              {days.map(day => {
                const dayData = getDataForDay(day);
                let bgColor = '#f1f5f9'; // Gris (Sin operaciones)
                let fontColor = '#64748b';
                let borderColor = 'transparent';

                if (dayData) {
                  if (dayData.isProfitable) {
                    bgColor = '#dcfce7'; // Verde claro
                    fontColor = '#166534';
                    borderColor = '#bbf7d0';
                  } else {
                    bgColor = '#fee2e2'; // Rojo claro
                    fontColor = '#991b1b';
                    borderColor = '#fecaca';
                  }
                }

                return (
                  <div key={day} style={{ 
                    background: bgColor, 
                    border: `1px solid ${borderColor}`,
                    padding: '5px', 
                    borderRadius: '6px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '55px',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}>
                    {/* Usamos clamp() para que el número del día sea responsivo */}
                    <span style={{ fontWeight: 'bold', color: fontColor, fontSize: 'clamp(0.9em, 2.5vw, 1.1em)' }}>{day}</span>
                    
                    {dayData && (
                      <span style={{ 
                        fontSize: 'clamp(0.6em, 2vw, 0.75em)', 
                        color: fontColor, 
                        marginTop: 'auto', 
                        fontWeight: '800',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        width: '100%',
                        textAlign: 'center'
                      }}>
                        {dayData.netPnl > 0 ? '+' : ''}${dayData.netPnl}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}