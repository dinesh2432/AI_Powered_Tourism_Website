import React from 'react';
import { User, Mail, Shield, Camera } from 'lucide-react';

const ProfilePage = () => {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-4xl font-black uppercase italic mb-10 text-center">Your Profile</h1>
      
      <div className="bg-[#0c0f14] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px]" />
        
        <div className="relative flex flex-col items-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full bg-[#161a21] border-2 border-white/10 flex items-center justify-center overflow-hidden">
               <User size={60} className="text-gray-700" />
            </div>
            <button className="absolute bottom-0 right-0 bg-cyan-500 text-black p-2 rounded-full hover:scale-110 transition-transform">
              <Camera size={16} />
            </button>
          </div>

          <div className="w-full space-y-4">
            <div className="bg-[#161a21] p-5 rounded-2xl border border-white/5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Full Name</label>
              <p className="font-bold text-lg">Alex Traveler</p>
            </div>
            <div className="bg-[#161a21] p-5 rounded-2xl border border-white/5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Email Address</label>
              <p className="font-bold text-lg">alex@travelx.com</p>
            </div>
            <button className="w-full bg-white text-black font-black py-4 rounded-2xl mt-4 hover:bg-cyan-400 transition-all">
              UPDATE SETTINGS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;