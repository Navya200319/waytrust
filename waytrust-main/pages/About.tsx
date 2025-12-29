import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 space-y-12">
      <div className="space-y-32">
        {/* Intro */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl font-black font-orbitron uppercase tracking-tighter leading-none">
              Our <span className="neon-text-purple">Mission</span> Is To Decode India.
            </h1>
            <div className="space-y-4 text-slate-400 text-lg leading-relaxed">
              <p>
                WayTrust Travels was founded on a simple belief: Travel should be as smart as the people taking it. In a country as vast and diverse as India, planning the perfect trip can be overwhelming.
              </p>
              <p>
                We leverage data-driven insights and AI to strip away the complexity, leaving you with seamless, sustainable, and soulful experiences.
              </p>
            </div>
            <div className="flex space-x-8 pt-4">
              <div>
                <p className="text-4xl font-bold text-white font-orbitron">2025</p>
                <p className="text-xs uppercase text-slate-500 font-bold tracking-widest">Founded</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white font-orbitron">150+</p>
                <p className="text-xs uppercase text-slate-500 font-bold tracking-widest">Experts</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-[80px] rounded-full"></div>
            <img src="https://picsum.photos/id/1025/800/800" alt="About" className="rounded-[3rem] shadow-2xl relative z-10 border border-white/10" />
          </div>
        </div>

        {/* Values */}
        <div className="space-y-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold font-orbitron">The WayTrust Protocol</h2>
            <p className="text-slate-500">The core values that drive our agency.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-10 rounded-3xl space-y-4 border-l-4 border-cyan-400">
              <h4 className="text-xl font-bold font-orbitron">Smart First</h4>
              <p className="text-slate-400 text-sm">Every recommendation is backed by real-time data and logistical optimization.</p>
            </div>
            <div className="glass p-10 rounded-3xl space-y-4 border-l-4 border-purple-400">
              <h4 className="text-xl font-bold font-orbitron">Human Centered</h4>
              <p className="text-slate-400 text-sm">Technology serves the traveler, ensuring comfort, safety, and cultural respect.</p>
            </div>
            <div className="glass p-10 rounded-3xl space-y-4 border-l-4 border-emerald-400">
              <h4 className="text-xl font-bold font-orbitron">Radically Green</h4>
              <p className="text-slate-400 text-sm">Sustainability isn't an option; it's the foundation of how we build itineraries.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;