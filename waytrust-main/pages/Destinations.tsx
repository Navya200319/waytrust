
import React, { useState } from 'react';
import { DESTINATIONS } from '../constants';
import { Link } from 'react-router-dom';

const Destinations: React.FC = () => {
  const [selectedDates, setSelectedDates] = useState<Record<string, string>>({});
  
  const handleDateChange = (destId: string, date: string) => {
    setSelectedDates(prev => ({ ...prev, [destId]: date }));
  };

  const getCustomUrl = (destName: string, destId: string) => {
    const date = selectedDates[destId] || new Date().toISOString().split('T')[0];
    return `/customize?to=${encodeURIComponent(destName)}&date=${date}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-6xl font-black font-orbitron uppercase tracking-tighter">
          Explore <span className="neon-text-cyan">India</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          From the mist-covered mountains of the North to the sun-kissed shores of the South, discover the vibrant soul of India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {DESTINATIONS.map(dest => (
          <div key={dest.id} className="group relative glass rounded-[3rem] overflow-hidden border border-white/10 transition-all hover:neon-border hover:shadow-2xl bg-slate-900/40">
            {/* Image Link Area */}
            <Link to={getCustomUrl(dest.name, dest.id)} className="block h-80 relative overflow-hidden">
              <img 
                src={dest.image} 
                alt={dest.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90"></div>
              
              {/* Hover Indicator Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-cyan-500/10">
                 <div className="glass px-6 py-2 rounded-full border border-cyan-400/40 text-cyan-400 font-black text-xs uppercase tracking-[0.3em] backdrop-blur-md">
                    Initialize Plan <i className="fas fa-bolt ml-2"></i>
                 </div>
              </div>

              <div className="absolute bottom-6 left-8 right-8">
                <span className="bg-cyan-500/20 text-cyan-400 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold border border-cyan-400/30 uppercase tracking-widest mb-3 inline-block">
                  {dest.type}
                </span>
                <h3 className="text-3xl font-black font-orbitron text-white leading-tight">{dest.name}</h3>
              </div>
            </Link>

            <div className="p-8 space-y-6">
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{dest.description}</p>
              
              {/* Departure Date Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Arrival Date Selection</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-400 transition-colors text-white font-bold text-xs appearance-none" 
                    value={selectedDates[dest.id] || new Date().toISOString().split('T')[0]} 
                    onChange={(e) => handleDateChange(dest.id, e.target.value)}
                  />
                  <i className="fas fa-calendar-alt absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400/30 text-xs pointer-events-none"></i>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {dest.tags.map(tag => (
                  <span key={tag} className="text-[9px] text-slate-500 border border-white/5 bg-white/5 px-2 py-0.5 rounded uppercase font-bold tracking-tighter">#{tag}</span>
                ))}
              </div>

              <div className="flex justify-between items-end pt-6 border-t border-white/5">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Base Protocol Price</p>
                  <span className="text-3xl font-black text-white">₹{dest.baseCost.toLocaleString()}</span>
                </div>
                {/* Replaced old bolt button with a subtle descriptive link */}
                <Link 
                  to={getCustomUrl(dest.name, dest.id)}
                  className="text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center group/link"
                >
                  Configure <i className="fas fa-arrow-right ml-2 group-hover/link:translate-x-1 transition-transform"></i>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Destinations;
