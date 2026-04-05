import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StrategiesPage from './pages/StrategiesPage'; // <-- NUEVA PÁGINA
import Navbar from './components/Navbar'; // <-- NUEVO MENÚ

function App() {
  return (
    <BrowserRouter>
      {/* El Navbar va aquí para que esté disponible en toda la app */}
      <Navbar /> 
      
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        {/* <-- NUEVA RUTA PROTEGIDA --> */}
        <Route 
          path="/estrategias" 
          element={
            <ProtectedRoute>
              <StrategiesPage />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;