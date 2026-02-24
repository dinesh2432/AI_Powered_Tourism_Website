import React from 'react';
import { Camera, User, Mail, Shield } from 'lucide-react';

const Profile = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-black uppercase mb-10 italic">Account Profile</h1>
      
      <div className="bg-[#0c0f14] rounded-[2.5rem] p-8 border border-white/5 shadow-xl">
        <div className="relative w-32 h-32 mx-auto mb-10">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 p-1">
            <div className="w-full h-full rounded-full bg-[#0c0f14] flex items-center justify-center overflow-hidden">
              <User size={48} className="text-gray-600" />
            </div>
          </div>
          <button className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full hover:bg-cyan-400 transition-all">
            <Camera size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-[#161a21] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
            <User className="text-cyan-500" size={20} />
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Full Name</p>
              <p className="font-bold">User Name</p>
            </div>
          </div>

          <div className="bg-[#161a21] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
            <Mail className="text-cyan-500" size={20} />
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Email Address</p>
              <p className="font-bold">user@example.com</p>
            </div>
          </div>
        </div>
        
        <button className="w-full mt-8 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all border border-white/5">
          Edit Profile Details
        </button>
      </div>
    </div>
  );
};

export default Profile;