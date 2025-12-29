
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirect = searchParams.get('redirect');
  const toDest = searchParams.get('to');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Invalid email';
    if (!formData.phone.match(/^\d{10}$/)) newErrors.phone = 'Enter a valid 10-digit number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onLogin(formData);
      
      if (redirect === 'customize') {
        navigate(toDest ? `/customize?to=${toDest}` : '/customize');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative overflow-hidden py-12">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
              <i className="fas fa-user text-3xl text-white"></i>
            </div>
            <h2 className="text-3xl font-black font-orbitron text-white">Traveler Login</h2>
            <p className="text-slate-400 mt-2">Access your travel dashboard.</p>
            {redirect && (
              <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mt-4 animate-pulse">
                Authentication required
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 ml-1 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                placeholder=""
                className={`w-full bg-white/5 border ${errors.fullName ? 'border-red-500' : 'border-white/10'} rounded-xl py-4 px-5 focus:outline-none focus:border-cyan-400 transition-colors text-white`}
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
              {errors.fullName && <p className="text-red-500 text-xs ml-1">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 ml-1 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                placeholder=""
                className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl py-4 px-5 focus:outline-none focus:border-cyan-400 transition-colors text-white`}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 ml-1 uppercase tracking-widest">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-slate-500 font-bold">+91</span>
                <input
                  type="tel"
                  placeholder=""
                  className={`w-full bg-white/5 border ${errors.phone ? 'border-red-500' : 'border-white/10'} rounded-xl py-4 px-14 focus:outline-none focus:border-cyan-400 transition-colors text-white`}
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                  maxLength={10}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs ml-1">{errors.phone}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold text-lg shadow-[0_0_15px_rgba(0,243,255,0.2)] hover:shadow-[0_0_25px_rgba(0,243,255,0.4)] transform hover:scale-[1.01] transition-all uppercase tracking-widest font-orbitron"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-slate-500 text-[10px] mt-8 uppercase tracking-widest">
            By continuing, you agree to our <br />
            <span className="text-cyan-400 hover:underline cursor-pointer">Terms of Service</span> & <span className="text-cyan-400 hover:underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
