
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Language } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.destinations'), path: '/destinations' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'bn', label: 'বাংলা' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed w-full z-50 glass border-b border-white/10 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.5)] group-hover:rotate-12 transition-transform">
            <i className="fas fa-paper-plane text-white text-xl"></i>
          </div>
          <span className="text-2xl font-black font-orbitron tracking-tighter neon-text-cyan">
            WayTrust
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-semibold text-base transition-all hover:text-cyan-400 ${
                isActive(link.path) ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-300'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center space-x-2 glass px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold text-slate-300 hover:border-cyan-400 transition-all"
            >
              <i className="fas fa-globe text-cyan-400"></i>
              <span>{languages.find(l => l.code === language)?.label}</span>
              <i className={`fas fa-chevron-down transition-transform ${isLangOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isLangOpen && (
              <div className="absolute top-full right-0 mt-2 w-32 glass border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-cyan-400/20 transition-colors ${language === lang.code ? 'text-cyan-400' : 'text-slate-300'}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link 
                to="/profile"
                className="flex items-center space-x-2 hover:text-cyan-400 transition-all group/hi"
              >
                <i className="fas fa-user-circle text-cyan-400 group-hover/hi:scale-110 transition-transform"></i>
                <span className="text-slate-300 font-bold text-sm group-hover/hi:text-cyan-400">
                  {t('common.hi')}, {user.fullName.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={onLogout}
                className="px-4 py-2 border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all text-xs font-bold"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-sm font-bold shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] transition-all transform hover:-translate-y-1"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center space-x-4">
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="text-cyan-400 text-lg"
          >
            <i className="fas fa-globe"></i>
          </button>
          <button
            className="text-cyan-400 text-2xl"
            onClick={() => setIsOpen(!isOpen)}
          >
            <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menus */}
      {isLangOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass border-b border-white/10 grid grid-cols-3 p-4 gap-2 animate-in slide-in-from-top duration-300">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }}
              className={`p-2 rounded-lg text-center text-xs font-bold border ${language === lang.code ? 'border-cyan-400 text-cyan-400' : 'border-white/10 text-slate-300'}`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass border-b border-white/10 flex flex-col p-4 space-y-4 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`text-xl font-bold ${
                isActive(link.path) ? 'text-cyan-400' : 'text-slate-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="text-xl font-bold text-slate-300 flex items-center space-x-2"
            >
              <i className="fas fa-user-circle text-cyan-400"></i>
              <span>Profile Settings</span>
            </Link>
          )}
          {user ? (
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full py-3 border border-red-500 text-red-500 rounded-lg font-bold"
            >
              {t('nav.logout')}
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 bg-cyan-500 text-white text-center rounded-lg font-bold"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
