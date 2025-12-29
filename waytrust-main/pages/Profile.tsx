
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User, GeneratedPlan, BookedAccommodation } from '../types';

interface ProfileProps {
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

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
      onUpdateUser({ 
        ...user, 
        ...formData 
      });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }
  };

  const handleDeleteTrip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedTrips = (user.savedTrips || []).filter(t => t.id !== id);
    onUpdateUser({ ...user, savedTrips: updatedTrips });
  };

  const handleDeleteBooking = (id: string) => {
    const updatedBookings = (user.bookedAccommodations || []).filter(b => b.id !== id);
    onUpdateUser({ ...user, bookedAccommodations: updatedBookings });
  };

  const handleDownloadTrip = (e: React.MouseEvent, trip: GeneratedPlan) => {
    e.stopPropagation();
    const dataStr = JSON.stringify(trip, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `WayTrust_${trip.destination}_Plan.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const toggleTrip = (id: string) => {
    setExpandedTripId(prev => prev === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black font-orbitron mb-2 tracking-tighter">Traveler <span className="neon-text-purple">Profile</span></h1>
        <p className="text-slate-400 uppercase text-[10px] tracking-[0.4em] font-bold">Manage Your Identity Vectors & Missions</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Profile Details (Form) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass p-8 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-50"></div>
            <div className="relative z-10">
              <div className="w-32 h-32 mx-auto rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-purple-500 shadow-[0_0_30px_rgba(188,19,254,0.3)] mb-6">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center overflow-hidden">
                  <i className="fas fa-user-astronaut text-5xl text-white group-hover:scale-110 transition-transform duration-500"></i>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Name</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs focus:border-cyan-400 outline-none"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Node</label>
                  <input
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs focus:border-cyan-400 outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Link</label>
                  <input
                    type="tel"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs focus:border-cyan-400 outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest mt-4 shadow-lg hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all"
                >
                  Synchronize Data
                </button>
              </form>
            </div>
            {isSuccess && (
               <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                  <div className="text-center">
                    <i className="fas fa-check-circle text-emerald-400 text-3xl mb-2"></i>
                    <p className="text-xs font-black text-white uppercase tracking-widest">Update Complete</p>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* Saved Content Section */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Booked Accommodations Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
               <h2 className="text-2xl font-black font-orbitron uppercase text-white tracking-widest flex items-center">
                 <span className="w-10 h-10 glass rounded-xl flex items-center justify-center text-purple-400 mr-4 border border-purple-400/20"><i className="fas fa-hotel text-sm"></i></span>
                 Booked Accommodations
               </h2>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user.bookedAccommodations?.length || 0} Assets</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
               {user.bookedAccommodations && user.bookedAccommodations.length > 0 ? (
                 user.bookedAccommodations.map((booking) => (
                   <div key={booking.id} className="glass p-6 rounded-[2rem] border border-white/10 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><i className="fas fa-check-circle text-4xl text-emerald-400"></i></div>
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-white font-black text-sm uppercase">{booking.name}</h4>
                          <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">{booking.destination}</p>
                        </div>
                        <span className="text-[7px] font-black px-2 py-0.5 rounded bg-white/5 text-slate-500 border border-white/10 uppercase">{booking.type}</span>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 mb-4">{booking.description}</p>
                      
                      <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-slate-600 uppercase">Tariff Node</p>
                          <p className="text-sm font-black text-white">₹{booking.pricePerNight.toLocaleString()}</p>
                        </div>
                        <div className="flex space-x-2">
                           <a 
                             href={booking.contactInfo.startsWith('http') ? booking.contactInfo : `tel:${booking.contactInfo}`}
                             target={booking.contactInfo.startsWith('http') ? "_blank" : undefined}
                             rel="noopener noreferrer"
                             className="w-8 h-8 glass rounded-lg flex items-center justify-center text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 transition-all border border-cyan-400/20"
                           >
                             <i className="fas fa-phone-alt text-[9px]"></i>
                           </a>
                           <button 
                             onClick={() => handleDeleteBooking(booking.id)}
                             className="w-8 h-8 glass rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 transition-all border border-white/5"
                           >
                             <i className="fas fa-trash-alt text-[9px]"></i>
                           </button>
                        </div>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="col-span-full glass p-10 rounded-[2.5rem] border-dashed border-white/10 text-center opacity-30">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No booked assets in profile memory</p>
                 </div>
               )}
            </div>
          </div>

          {/* Saved Missions Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
               <h2 className="text-2xl font-black font-orbitron uppercase text-white tracking-widest flex items-center">
                 <span className="w-10 h-10 glass rounded-xl flex items-center justify-center text-cyan-400 mr-4 border border-cyan-400/20"><i className="fas fa-bookmark text-sm"></i></span>
                 Saved Missions
               </h2>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user.savedTrips?.length || 0} Records</span>
            </div>

            <div className="space-y-4">
              {user.savedTrips && user.savedTrips.length > 0 ? (
                user.savedTrips.map((trip) => (
                  <div key={trip.id} className="glass rounded-[2rem] border border-white/10 overflow-hidden shadow-xl transition-all hover:border-cyan-400/30">
                    <div 
                      onClick={() => toggleTrip(trip.id)}
                      className="p-6 cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-6">
                         <div className="w-16 h-16 rounded-2xl overflow-hidden glass border border-white/10 flex-shrink-0">
                            <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                              <i className="fas fa-plane-arrival text-cyan-400"></i>
                            </div>
                         </div>
                         <div>
                            <h3 className="text-xl font-black font-orbitron text-white uppercase group-hover:neon-text-cyan transition-colors">{trip.destination}</h3>
                            <div className="flex items-center space-x-4 mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                               <span className="flex items-center"><i className="fas fa-wallet mr-1.5 text-cyan-500/50"></i> ₹{trip.totalEstimatedCost.toLocaleString()}</span>
                               <span className="flex items-center"><i className="fas fa-calendar-day mr-1.5 text-purple-500/50"></i> {trip.itinerary.length} Days</span>
                               <span className="flex items-center"><i className="fas fa-history mr-1.5 text-slate-600"></i> {new Date(trip.timestamp).toLocaleDateString()}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center space-x-3">
                         <button 
                           onClick={(e) => handleDownloadTrip(e, trip)}
                           className="w-10 h-10 glass rounded-xl border border-white/5 text-cyan-400 hover:text-white hover:bg-cyan-400 transition-all flex items-center justify-center"
                           title="Download Mission Plan"
                         >
                           <i className="fas fa-download text-[10px]"></i>
                         </button>
                         <button 
                           onClick={(e) => handleDeleteTrip(e, trip.id)}
                           className="w-10 h-10 glass rounded-xl border border-white/5 text-slate-600 hover:text-red-400 hover:border-red-400/50 transition-all flex items-center justify-center"
                           title="Delete Mission"
                         >
                           <i className="fas fa-trash-alt text-[10px]"></i>
                         </button>
                         <div className={`w-10 h-10 glass rounded-xl border border-white/5 flex items-center justify-center text-cyan-400 transition-transform ${expandedTripId === trip.id ? 'rotate-180' : ''}`}>
                           <i className="fas fa-chevron-down text-[10px]"></i>
                         </div>
                      </div>
                    </div>

                    {expandedTripId === trip.id && (
                      <div className="px-6 pb-6 pt-2 space-y-6 animate-in slide-in-from-top-4 duration-300">
                         
                         {trip.inputs && (
                           <div className="p-4 glass rounded-2xl border border-cyan-400/20 bg-cyan-400/5 space-y-3">
                              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Original Mission Parameters</p>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                 <div className="space-y-0.5"><p className="text-[8px] font-bold text-slate-500 uppercase">Budget</p><p className="text-[11px] text-white font-bold">₹{Number(trip.inputs.budget).toLocaleString()}</p></div>
                                 <div className="space-y-0.5"><p className="text-[8px] font-bold text-slate-500 uppercase">People</p><p className="text-[11px] text-white font-bold">{trip.inputs.persons}</p></div>
                                 <div className="space-y-0.5"><p className="text-[8px] font-bold text-slate-500 uppercase">Transport</p><p className="text-[11px] text-white font-bold">{trip.inputs.transport}</p></div>
                                 <div className="space-y-0.5"><p className="text-[8px] font-bold text-slate-500 uppercase">Mood</p><p className="text-[11px] text-cyan-400 font-bold">{trip.inputs.mood}</p></div>
                                 <div className="space-y-0.5"><p className="text-[8px] font-bold text-slate-500 uppercase">Departure</p><p className="text-[11px] text-white font-bold">{trip.inputs.departureDate}</p></div>
                              </div>
                           </div>
                         )}

                         <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 glass rounded-2xl border-white/5 space-y-2">
                               <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Climate Summary</p>
                               <p className="text-sm font-bold text-white">{trip.weather.temperature} • {trip.weather.condition}</p>
                               <p className="text-[10px] text-slate-400 leading-relaxed">{trip.weather.suggestion}</p>
                            </div>
                            <div className="p-4 glass rounded-2xl border-white/5 space-y-2">
                               <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Transit Vector</p>
                               <p className="text-[11px] text-slate-300 leading-relaxed">{trip.transitSummary}</p>
                            </div>
                         </div>
                         
                         <div className="space-y-3">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Mission Milestones</p>
                            <div className="space-y-2">
                              {trip.itinerary.map((day, idx) => (
                                <div key={idx} className="flex items-start space-x-3 p-3 glass rounded-xl border-white/5 hover:border-cyan-400/20 transition-all">
                                  <span className="text-[10px] font-black font-orbitron text-cyan-400">0{day.day}</span>
                                  <div className="space-y-1">
                                    <p className="text-[11px] text-white font-bold">{day.theme}</p>
                                    <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{day.morning}, {day.afternoon}, {day.evening}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                         </div>

                         <div className="pt-2 flex justify-center">
                            <button 
                              onClick={(e) => handleDownloadTrip(e, trip)}
                              className="px-6 py-2 glass rounded-full border border-cyan-400/30 text-cyan-400 text-[9px] font-black uppercase tracking-widest hover:bg-cyan-400 hover:text-slate-950 transition-all"
                            >
                              <i className="fas fa-file-download mr-2"></i> Export Data Package
                            </button>
                         </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="glass p-20 rounded-[3rem] border border-dashed border-white/10 text-center opacity-40">
                  <i className="fas fa-satellite-dish text-4xl text-slate-700 mb-6"></i>
                  <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em]">No Saved Missions Detected</p>
                  <p className="text-[10px] text-slate-600 mt-2 uppercase">Your intelligence gathering begins in the AI Plan Synthesis protocol.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
