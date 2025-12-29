
import React from 'react';

interface Feature {
  name: string;
  purpose: string;
  value: string;
  tier: 'MVP' | 'Advanced' | 'Premium';
}

interface Module {
  title: string;
  icon: string;
  features: Feature[];
}

const Specifications: React.FC = () => {
  const modules: Module[] = [
    {
      title: 'Trip Planning & Itinerary',
      icon: 'fa-brain',
      features: [
        { name: 'Neural Synthesizer', purpose: 'AI-generated 3-10 day plans.', value: 'Eliminates research fatigue.', tier: 'MVP' },
        { name: 'Multi-City Mesh', purpose: 'Optimized routing for 3+ cities.', value: 'Reduces transit fatigue.', tier: 'Advanced' },
        { name: 'Real-time Event Injector', purpose: 'Live festival/event syncing.', value: 'Ensures zero missed experiences.', tier: 'Premium' }
      ]
    },
    {
      title: 'Flight Booking',
      icon: 'fa-plane',
      features: [
        { name: 'Smart Aggregator', purpose: 'Real-time domestic carrier search.', value: 'Cheapest/fastest aerial truth.', tier: 'MVP' },
        { name: 'Fare Volatility Predictor', purpose: 'AI "Buy/Wait" signals.', value: 'Saves 15-20% on booking.', tier: 'Advanced' },
        { name: 'Carbon-Neutral Booking', purpose: 'Integrated offset purchasing.', value: 'Eco-conscious travel.', tier: 'Premium' }
      ]
    },
    {
      title: 'Transportation (India Specific)',
      icon: 'fa-train',
      features: [
        { name: 'Rail-Trust Protocol', purpose: 'Direct IRCTC/PNR integration.', value: 'Essential domestic reliability.', tier: 'MVP' },
        { name: 'EV Rental Hub', purpose: 'Electric vehicle booking platform.', value: 'Sustainable local mobility.', tier: 'Advanced' },
        { name: 'Hyper-Local Sync', purpose: 'Transfer coordination with landings.', value: 'Zero-wait airport transitions.', tier: 'Premium' }
      ]
    },
    {
      title: 'Payments & Security',
      icon: 'fa-shield-check',
      features: [
        { name: 'UPI Native Gateway', purpose: 'Unified local payment support.', value: 'High-trust domestic conversion.', tier: 'MVP' },
        { name: 'Smart Delay Insurance', purpose: 'Parametric refund triggers.', value: 'Security against transit delays.', tier: 'Advanced' },
        { name: 'Biometric Secure-Pass', purpose: 'DigiYatra airport integration.', value: 'Seamless paperless transit.', tier: 'Premium' }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
      <div className="text-center mb-20">
        <h1 className="text-5xl font-black font-orbitron mb-4 uppercase">System <span className="neon-text-cyan">Specifications</span></h1>
        <p className="text-slate-400 max-w-2xl mx-auto">WayTrust is engineered with a modular neural architecture, prioritizing scalability and high-fidelity travel data.</p>
      </div>

      <div className="space-y-16">
        {modules.map((mod, idx) => (
          <div key={idx} className="space-y-6">
            <div className="flex items-center space-x-4 border-b border-white/10 pb-4">
              <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-cyan-400">
                <i className={`fas ${mod.icon} text-xl`}></i>
              </div>
              <h2 className="text-2xl font-black font-orbitron uppercase tracking-widest text-white">{mod.title}</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {mod.features.map((feat, fIdx) => (
                <div key={fIdx} className="glass p-8 rounded-3xl border border-white/5 hover:border-cyan-400/30 transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-bold text-white">{feat.name}</h3>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                      feat.tier === 'MVP' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30' :
                      feat.tier === 'Advanced' ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                    }`}>
                      {feat.tier}
                    </span>
                  </div>
                  <div className="space-y-4 flex-grow">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Business Purpose</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{feat.purpose}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">User Value</p>
                      <p className="text-sm text-slate-400 italic">"{feat.value}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 glass p-12 rounded-[3rem] border border-dashed border-white/10 text-center">
        <h3 className="text-2xl font-bold font-orbitron mb-4">Neural Architecture Scalability</h3>
        <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed">
          The WayTrust protocol is designed to transition from <span className="text-cyan-400">Generative Planning</span> to <span className="text-purple-400">Predictive Optimization</span>. By 2026, the mesh will anticipate user needs before input, syncing logistics across the Indian sub-continent autonomously.
        </p>
      </div>
    </div>
  );
};

export default Specifications;
