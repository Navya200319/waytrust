
import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-5xl font-black font-orbitron uppercase tracking-tighter">Get In <span className="neon-text-cyan">Touch</span></h1>
        <p className="text-slate-400 max-w-2xl mx-auto">Have a specific request? Our team of smart-travel experts is ready to assist you.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Form */}
        <div className="glass p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-4xl text-emerald-400 animate-bounce">
                <i className="fas fa-check"></i>
              </div>
              <h2 className="text-2xl font-bold font-orbitron">Transmission Received!</h2>
              <p className="text-slate-400">Our agents will contact you within the next standard Earth cycle (24 hours).</p>
              <button onClick={() => setSubmitted(false)} className="text-cyan-400 font-bold underline">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Name</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 focus:outline-none focus:border-cyan-400 text-white" placeholder="Arjun Singh" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                  <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 focus:outline-none focus:border-cyan-400 text-white" placeholder="arjun@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Subject</label>
                <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 focus:outline-none focus:border-cyan-400 text-white" placeholder="Custom Corporate Tour Request" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Message</label>
                <textarea required rows={5} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 focus:outline-none focus:border-cyan-400 text-white" placeholder="Tell us about your dream trip..."></textarea>
              </div>
              <button type="submit" className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_35px_rgba(0,243,255,0.6)] transform hover:scale-[1.01] transition-all">
                Send Transmission
              </button>
            </form>
          )}
        </div>

        {/* Info & Map Placeholder */}
        <div className="space-y-8">
          <div className="glass p-8 rounded-[2.5rem] border border-white/10 space-y-8">
            <h3 className="text-2xl font-bold font-orbitron">Base Operations</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-400/20">
                  <i className="fas fa-map-marked-alt text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-white">Headquarters</h4>
                  <p className="text-slate-400 text-sm">Kakinada, Andhra Pradesh, India</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-purple-400 border border-purple-400/20">
                  <i className="fas fa-phone-alt text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-white">Comms Channel</h4>
                  <p className="text-slate-400 text-sm">+91 8247484838</p>
                  <p className="text-slate-400 text-sm">waytrusttravels@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass h-64 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-slate-600">
              <div className="text-center space-y-2">
                <i className="fas fa-map-marker-alt text-4xl mb-2 text-cyan-500/50"></i>
                <p className="text-xs uppercase font-bold tracking-widest">Neural Mapping Service Offline</p>
                <p className="text-[10px] text-slate-700">Interactive map requires Geolocation API permission</p>
              </div>
            </div>
            {/* Map UI Overlay */}
            <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none group-hover:bg-cyan-500/0 transition-colors"></div>
            <div className="absolute top-4 right-4 flex space-x-2">
              <div className="w-8 h-8 glass rounded-lg flex items-center justify-center text-xs text-white">+</div>
              <div className="w-8 h-8 glass rounded-lg flex items-center justify-center text-xs text-white">-</div>
            </div>
          </div>

          <div className="flex justify-center space-x-6">
            <a href="#" className="text-slate-500 hover:text-cyan-400 text-2xl transition-colors"><i className="fab fa-linkedin"></i></a>
            <a href="#" className="text-slate-500 hover:text-purple-400 text-2xl transition-colors"><i className="fab fa-github"></i></a>
            <a href="#" className="text-slate-500 hover:text-cyan-400 text-2xl transition-colors"><i className="fab fa-discord"></i></a>
            <a href="#" className="text-slate-500 hover:text-purple-400 text-2xl transition-colors"><i className="fab fa-twitter"></i></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
