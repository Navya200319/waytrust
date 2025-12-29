
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Customization from './pages/Customization';
import Destinations from './pages/Destinations';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import Specifications from './pages/Specifications';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TravelBuddy from './components/TravelBuddy';
import { User } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const AppLayout: React.FC<{ user: User | null; onLogout: () => void; onLogin: (u: User) => void; onUpdateUser: (u: User) => void }> = ({ user, onLogout, onLogin, onUpdateUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-grow pt-20">
        {!isHomePage && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 relative z-30">
            <button
              onClick={() => navigate(-1)}
              className="group glass px-5 py-2.5 rounded-xl text-cyan-400 border border-cyan-400/20 hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all flex items-center space-x-3 font-bold uppercase text-[10px] tracking-[0.3em] shadow-lg"
            >
              <i className="fas fa-chevron-left transition-transform group-hover:-translate-x-1"></i>
              <span>{t('common.back')}</span>
            </button>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login onLogin={onLogin} />} />
          <Route path="/customize" element={<Customization user={user} onUpdateUser={onUpdateUser} />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/specifications" element={<Specifications />} />
          <Route path="/profile" element={<Profile user={user} onUpdateUser={onUpdateUser} />} />
        </Routes>
      </main>
      <TravelBuddy />
      <Footer />
    </div>
  );
};

const AppRefined: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('waytrust_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('waytrust_user', JSON.stringify(userData));
  };

  const handleUpdateUser = (updatedData: User) => {
    setUser(updatedData);
    localStorage.setItem('waytrust_user', JSON.stringify(updatedData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('waytrust_user');
  };

  return (
    <LanguageProvider>
      <HashRouter>
        <AppLayout user={user} onLogout={handleLogout} onLogin={handleLogin} onUpdateUser={handleUpdateUser} />
      </HashRouter>
    </LanguageProvider>
  );
};

export default AppRefined;
