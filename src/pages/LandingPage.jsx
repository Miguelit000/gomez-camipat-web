import { Link } from 'react-router-dom';
import logoAstro from "../assets/AstroTrade-Logo.png";

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* NAVEGACIÓN PÚBLICA */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
        <div style={{ fontSize: '1.5em', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logoAstro} alt="AstroTrade Logo" style={{ height: '45px', borderRadius: '50%' }} />
          AstroTrade
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link to="/login" style={{ padding: '10px 20px', color: '#f8fafc', textDecoration: 'none', fontWeight: 'bold' }}>
            Iniciar Sesión
          </Link>
          <Link to="/login" style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)' }}>
            Comenzar Gratis
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header style={{ textAlign: 'center', padding: '100px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3.5em', margin: '0 0 20px 0', lineHeight: '1.1' }}>
          Domina tu Psicología. <br/>
          <span style={{ color: '#3b82f6' }}>Protege tu Capital.</span>
        </h1>
        <p style={{ fontSize: '1.2em', color: '#94a3b8', marginBottom: '40px', lineHeight: '1.6' }}>
          El Trading Journal definitivo con calculadora de riesgo integrada, analítica institucional (SQN, MAE/MFE) y un Centro de Operaciones de Seguridad. Vigila tu rendimiento con una precisión y lealtad inquebrantables.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link to="/login" style={{ padding: '15px 30px', backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '1.1em', fontWeight: 'bold' }}>
            Crear mi Bóveda
          </Link>
          <a href="#precios" style={{ padding: '15px 30px', backgroundColor: '#1e293b', color: '#f8fafc', textDecoration: 'none', borderRadius: '8px', fontSize: '1.1em', fontWeight: 'bold', border: '1px solid #334155' }}>
            Ver Planes
          </a>
        </div>
      </header>

      {/* CARACTERÍSTICAS (FEATURES) */}
      <section style={{ padding: '60px 20px', backgroundColor: '#0b1120' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '2em', marginBottom: '15px' }}>🧮</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3em' }}>Gestión de Riesgo Automática</h3>
            <p style={{ color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
              Olvídate de calcular lotajes. Ingresa tu Stop Loss y AstroTrade te dirá el tamaño exacto de la posición para respetar tu plan.
            </p>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '2em', marginBottom: '15px' }}>🧠</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3em' }}>Playbooks Estratégicos</h3>
            <p style={{ color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
              Define las reglas de tus setups institucionales. Etiqueta cada operación y descubre qué modelo te genera mayor Esperanza Matemática.
            </p>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '2em', marginBottom: '15px' }}>🛡️</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3em' }}>Arquitectura Blindada</h3>
            <p style={{ color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
              Tus datos financieros están protegidos tras un escudo perimetral (SOC) y un motor criptográfico avanzado. Seguridad de nivel empresarial.
            </p>
          </div>

        </div>
      </section>

      {/* SECCIÓN DE PRECIOS */}
      <section id="precios" style={{ padding: '80px 20px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5em', marginBottom: '10px' }}>Elige tu arsenal</h2>
        <p style={{ color: '#94a3b8', marginBottom: '50px' }}>Comienza gratis, mejora cuando estés listo para dominar el mercado.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', textAlign: 'left' }}>
          
          {/* PLAN FREE */}
          <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.9em' }}>Plan Base</h3>
            <div style={{ fontSize: '3em', fontWeight: 'bold', marginBottom: '20px' }}>$0<span style={{ fontSize: '0.3em', color: '#64748b', fontWeight: 'normal' }}>/mes</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', color: '#cbd5e1', lineHeight: '2' }}>
              <li>✔️ 1 Portafolio activo</li>
              <li>✔️ Hasta 50 operaciones (Límite)</li>
              <li>✔️ Calculadora de Riesgo Básica</li>
              <li>✔️ Bitácora Notion-Style</li>
            </ul>
            <Link to="/login" style={{ display: 'block', textAlign: 'center', padding: '12px', backgroundColor: '#334155', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
              Crear Cuenta Gratis
            </Link>
          </div>

          {/* PLAN PRO */}
          <div style={{ backgroundColor: '#0f172a', padding: '40px', borderRadius: '12px', border: '2px solid #fbbf24', position: 'relative', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.1)' }}>
            <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fbbf24', color: '#0f172a', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8em', textTransform: 'uppercase' }}>
              Más Popular
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', textTransform: 'uppercase', fontSize: '0.9em' }}>Plan Institucional</h3>
            <div style={{ fontSize: '3em', fontWeight: 'bold', marginBottom: '20px' }}>$12<span style={{ fontSize: '0.3em', color: '#64748b', fontWeight: 'normal' }}>.50/mes</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', color: '#cbd5e1', lineHeight: '2' }}>
              <li>✨ Portafolios Ilimitados</li>
              <li>✨ Operaciones Ilimitadas</li>
              <li>✨ Analítica Avanzada (SQN, Drawdowns)</li>
              <li>✨ Importación automática desde MT5</li>
              <li>✨ Mapa de Calor Operativo</li>
            </ul>
            <Link to="/login" style={{ display: 'block', textAlign: 'center', padding: '12px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#0f172a', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
              Mejorar a PRO
            </Link>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '30px', borderTop: '1px solid #1e293b', color: '#64748b', fontSize: '0.9em' }}>
        © {new Date().getFullYear()} AstroTrade by Gómez Capital. Todos los derechos reservados.
      </footer>
    </div>
  );
}