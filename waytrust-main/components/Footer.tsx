
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/10 py-12 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_10px_rgba(0,243,255,0.5)]">
              <i className="fas fa-paper-plane text-white text-sm"></i>
            </div>
            <span className="text-xl font-black font-orbitron tracking-tighter text-cyan-400">
              WayTrust
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            WayTrust Travels – Smart, Sustainable, and Personalized Travel Across India.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center text-cyan-400 hover:neon-border transition-all">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center text-cyan-400 hover:neon-border transition-all">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center text-cyan-400 hover:neon-border transition-all">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-white mb-6 font-orbitron">Quick Links</h4>
          <ul className="space-y-3 text-slate-400">
            <li><Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
            <li><Link to="/specifications" className="hover:text-cyan-400 transition-colors">System Specs</Link></li>
            <li><Link to="/about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
            <li><Link to="/destinations" className="hover:text-cyan-400 transition-colors">Destinations</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold text-white mb-6 font-orbitron">Contact Us</h4>
          <ul className="space-y-3 text-slate-400">
            <li className="flex items-center space-x-3">
              <i className="fas fa-map-marker-alt text-cyan-400"></i>
              <span>Kakinada, Andhra Pradesh, India</span>
            </li>
            <li className="flex items-center space-x-3">
              <i className="fas fa-phone-alt text-cyan-400"></i>
              <span>+91 8247484838</span>
            </li>
            <li className="flex items-center space-x-3">
              <i className="fas fa-envelope text-cyan-400"></i>
              <span>waytrusttravels@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-white/10 mt-12 pt-8 text-center text-slate-500">
        <p>&copy; 2025 WayTrust Travels. All rights reserved. Designed with ❤️ in India.</p>
      </div>
    </footer>
  );
};

export default Footer;
