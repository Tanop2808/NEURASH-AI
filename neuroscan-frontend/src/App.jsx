import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PatientPage from './pages/PatientPage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import ReportPage from './pages/ReportPage';
import ChatPage from './pages/ChatPage';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <Navbar />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/patient" element={<PrivateRoute><PatientPage /></PrivateRoute>} />
        <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
        <Route path="/results" element={<PrivateRoute><ResultsPage /></PrivateRoute>} />
        <Route path="/report" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}