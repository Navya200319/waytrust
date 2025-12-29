
import React from 'react';
import { Link } from 'react-router-dom';
import { DESTINATIONS } from '../constants';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeProps {
  user: User | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const { t } = useLanguage();

  return (
    <div className="relative">
      {/* Background Heritage Image with Overlays - Brighter & Grand Version */}
      <div className="absolute inset-0 z-0 h-[90vh] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=2071&auto=format&fit=crop" 
          alt="Indian Heritage - Taj Mahal" 
          className="w-full h-full object-cover opacity-85"
        />
        {/* Gradients to blend the heritage site into the dark theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/40 to-slate-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_80%)] opacity-40"></div>
      </div>

      {/* Background Glows for Depth */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/15 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/15 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Hero Section */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 md:px-8 relative overflow-hidden">
        <div className="max-w-4xl space-y-6 z-10">
          <div className="inline-block px-6 py-2 glass border border-cyan-400/30 rounded-full mb-4 animate-pulse">
            <span className="text-xs font-bold tracking-[0.4em] text-cyan-400 opacity-100 uppercase">{t('home.hero_tag')}</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black font-orbitron tracking-tight text-white drop-shadow-[0_0_30px_rgba(0,243,255,0.5)]">
            {t('home.hero_title_1')}<span className="neon-text-cyan">{t('home.hero_title_2')}</span> TRAVELS
          </h1>
          <p className="text-xl md:text-3xl font-medium text-white tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {t('home.hero_subtitle').split(' ')[0]} <span className="text-cyan-400">{t('home.hero_subtitle').split(' ').slice(1).join(' ')}</span>
          </p>
          <div className="pt-10 flex flex-col md:flex-row items-center justify-center gap-6">
            <Link
              to={user ? "/customize" : "/login?redirect=customize"}
              className="group relative px-12 py-5 bg-slate-950/40 backdrop-blur-md border-2 border-cyan-400/60 text-cyan-400 font-bold text-xl rounded-full overflow-hidden transition-all glow-button"
            >
              <span className="relative z-10 uppercase">{t('home.cta')}</span>
              <div className="absolute inset-0 bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              <span className="absolute inset-0 flex items-center justify-center text-slate-950 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 font-black text-xl">
                {user ? t('home.launch') : t('nav.login')} <i className="fas fa-microchip ml-2"></i>
              </span>
            </Link>
          </div>
        </div>

        {/* Floating Interactive Elements */}
        <div className="absolute top-1/4 left-10 md:left-20 animate-float opacity-70">
          <div className="glass p-5 rounded-2xl border-cyan-400/50 shadow-[0_0_20px_rgba(0,243,255,0.3)]">
            <i className="fas fa-landmark text-3xl text-cyan-400"></i>
          </div>
        </div>
        <div className="absolute bottom-1/4 right-10 md:right-20 animate-float opacity-70" style={{ animationDelay: '2s' }}>
          <div className="glass p-5 rounded-2xl border-purple-400/50 shadow-[0_0_20px_rgba(188,19,254,0.3)]">
            <i className="fas fa-om text-3xl text-purple-400"></i>
          </div>
        </div>
      </section>

      {/* Stats Section with Clearer Readability */}
      <section className="py-20 glass border-y border-white/10 relative z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 text-center">
          <div className="space-y-2 group">
            <h3 className="text-5xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(0,243,255,0.6)] group-hover:scale-110 transition-transform">500+</h3>
            <p className="text-slate-200 uppercase tracking-widest text-sm font-bold opacity-80">{t('home.stats_heritage')}</p>
          </div>
          <div className="space-y-2 group">
            <h3 className="text-5xl font-black text-purple-400 drop-shadow-[0_0_15px_rgba(188,19,254,0.6)] group-hover:scale-110 transition-transform">AI</h3>
            <p className="text-slate-200 uppercase tracking-widest text-sm font-bold opacity-80">{t('home.stats_ai')}</p>
          </div>
        </div>
      </section>

      {/* Featured Destinations Section */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black mb-2 font-orbitron">{t('home.featured_title')}</h2>
            <p className="text-slate-400">{t('home.featured_sub')}</p>
          </div>
          <Link to="/destinations" className="px-6 py-2 glass border border-cyan-400/40 text-cyan-400 font-bold rounded-xl hover:bg-cyan-400/10 transition-all uppercase text-sm tracking-widest">
            {t('home.access_db')} <i className="fas fa-chevron-right ml-2 text-[10px]"></i>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {DESTINATIONS.slice(0, 3).map((dest) => (
            <div key={dest.id} className="group glass rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-cyan-400/40 transition-all transform hover:-translate-y-3 shadow-2xl bg-slate-900/60 backdrop-blur-xl">
              <Link to={user ? `/customize?to=${dest.name}` : `/login?redirect=customize&to=${dest.name}`} className="block h-72 relative overflow-hidden">
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute top-6 right-6 bg-slate-950/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-cyan-400 border border-cyan-400/30 uppercase tracking-widest">
                  {dest.type}
                </div>
                <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-colors duration-300"></div>
              </Link>
              <div className="p-8 space-y-5">
                <h3 className="text-3xl font-black font-orbitron text-white">{dest.name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{dest.description}</p>
                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Base Protocol</span>
                    <span className="text-2xl font-black text-white">₹{dest.baseCost.toLocaleString()}</span>
                  </div>
                  <Link to={user ? `/customize?to=${dest.name}` : `/login?redirect=customize&to=${dest.name}`} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-lg border border-cyan-400/20">
                    <i className="fas fa-bolt"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
