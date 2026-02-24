import React, { useState } from 'react';
import { Plus, Map } from 'lucide-react';

const MyTrips = () => {
  // Mock data - replace with your actual API call state
  const [trips, setTrips] = useState([]); 

  if (trips.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="bg-[#0c0f14] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
          <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Map className="text-gray-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2">No trips found</h2>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">
            You haven't planned any adventures yet. Ready to start your journey?
          </p>
          <button className="bg-white text-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-cyan-400 transition-all mx-auto active:scale-95">
            <Plus size={20} />
            CREATE NEW TRIP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black uppercase italic">My Adventures</h1>
        <button className="bg-cyan-500 text-black p-3 rounded-xl hover:bg-cyan-400 transition-all">
          <Plus size={24} />
        </button>
      </div>
      {/* Map through trips here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trip Card Example */}
      </div>
    </div>
  );
};

export default MyTrips;