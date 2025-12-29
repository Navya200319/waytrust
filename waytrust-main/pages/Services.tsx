import React from 'react';

const Services: React.FC = () => {
  const services = [
    {
      title: 'AI Trip Planning',
      desc: 'Let our proprietary neural engine craft the perfect itinerary tailored to your personality and budget.',
      icon: 'fa-microchip',
      color: 'cyan'
    },
    {
      title: 'Global Connectivity',
      desc: 'Seamless booking for flights, high-speed rail, and private transport across the Indian subcontinent.',
      icon: 'fa-globe',
      color: 'purple'
    },
    {
      title: 'Eco-Smart Travel',
      desc: 'Offset your carbon footprint with our verified green travel routes and sustainable stay partners.',
      icon: 'fa-leaf',
      color: 'emerald'
    },
    {
      title: 'Real-time Analytics',
      desc: 'Stay ahead with live pricing updates and crowd-density monitoring at major tourist spots.',
      icon: 'fa-chart-network',
      color: 'blue'
    },
    {
      title: '24/7 Virtual Guide',
      desc: 'Instant support and local recommendations via our augmented travel companion app.',
      icon: 'fa-headset',
      color: 'pink'
    },
    {
      title: 'Student/Budget Mode',
      desc: 'Optimized travel for students and budget-conscious explorers without compromising on safety.',
      icon: 'fa-user-graduate',
      color: 'yellow'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
      <div className="text-center mb-20">
        <h1 className="text-5xl font-black font-orbitron mb-4 uppercase">Next-Gen <span className="neon-text-cyan">Services</span></h1>
        <p className="text-slate-400 max-w-2xl mx-auto">We don't just book trips; we engineer experiences using the latest in travel technology.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((s, idx) => (
          <div key={idx} className="group glass p-10 rounded-3xl border border-white/5 hover:neon-border transition-all duration-500 flex flex-col items-center text-center space-y-6">
            <div className={`w-20 h-20 bg-${s.color}-500/10 rounded-full flex items-center justify-center text-3xl text-${s.color}-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.05)]`}>
              <i className={`fas ${s.icon}`}></i>
            </div>
            <h3 className="text-2xl font-bold font-orbitron">{s.title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm">{s.desc}</p>
            <div className={`w-10 h-1 bg-${s.color}-500/50 rounded-full group-hover:w-full transition-all duration-500`}></div>
          </div>
        ))}
      </div>

      {/* Corporate Section */}
      <div className="mt-24 glass rounded-[3rem] p-12 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <i className="fas fa-building text-9xl"></i>
        </div>
        <div className="max-w-2xl relative z-10">
          <h2 className="text-3xl font-bold font-orbitron mb-6">Corporate & Group Expeditions</h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Scalable travel solutions for organizations. From MICE events to team retreats, we handle the logistics with enterprise-grade precision and smart cost-optimization.
          </p>
          <button className="px-10 py-4 bg-white text-slate-900 font-black rounded-xl hover:bg-cyan-400 transition-colors uppercase tracking-widest text-sm">
            Contact Enterprise Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default Services;