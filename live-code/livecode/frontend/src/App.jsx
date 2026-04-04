import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProblemSolve from './pages/ProblemSolve';
import AptitudeTest from './pages/AptitudeTest';
import AptitudeCategories from './pages/AptitudeCategories';
import TopicsPage from './pages/TopicsPage';
import Certificates from './pages/Certificates';
import './App.css';

function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem('hiredUpTheme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hiredUpTheme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '2rem',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: theme === 'light' ? '#ffffff' : '#282828',
        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#3e3e3e'}`,
        color: theme === 'light' ? '#000000' : '#ffffff',
        fontSize: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 9999,
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}
      title="Toggle Theme"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

function App() {
  return (
    <Router>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/problems" element={<Dashboard />} />
        <Route path="/topics" element={<TopicsPage />} />
        <Route path="/solve/:id" element={<ProblemSolve />} />
        <Route path="/aptitude-test" element={<AptitudeTest />} />
        <Route path="/aptitude-selection" element={<AptitudeCategories />} />
        <Route path="/certificates" element={<Certificates />} />
      </Routes>
    </Router>
  );
}

export default App;
