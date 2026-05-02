import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import IncidentDetail from './pages/IncidentDetail';
import RCAForm from './pages/RCAForm';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/incident/:id" element={<IncidentDetail />} />
        <Route path="/incident/:id/rca" element={<RCAForm />} />
      </Routes>
    </Router>
  );
}

export default App;