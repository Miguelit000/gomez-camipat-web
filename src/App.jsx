import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';

import LandingPage from './pages/LandingPage'; 
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StrategiesPage from './pages/StrategiesPage';
import StatisticsPage from './pages/StatisticsPage'; 
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar'; 

function App() {
  return (
    <BrowserRouter>
      {/* El Navbar interno solo debe aparecer en las rutas protegidas, no en la Landing ni en el Login */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* RUTAS PROTEGIDAS CON EL NAVBAR INTERNO */}
        <Route 
          path="/*" 
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/strategies" element={<ProtectedRoute><StrategiesPage /></ProtectedRoute>} />
                <Route path="/statistics" element={<ProtectedRoute><StatisticsPage /></ProtectedRoute>} />
              </Routes>
            </>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;