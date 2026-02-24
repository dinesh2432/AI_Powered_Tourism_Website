import React, { useState } from 'react';
import { Plus, FolderOpen } from 'lucide-react';

const MyTripPage = () => {
  const [trips, setTrips] = useState([]); // Empty array to test "No Trips" state

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black uppercase italic">My Adventures</h1>
          <p className="text-gray-500 text-sm">Manage and view your generated itineraries.</p>
        </div>
        <button className="bg-white text-black p-4 rounded-2xl hover:bg-cyan-400 transition-all shadow-xl active:scale-95">
          <Plus size={24} />
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="bg-[#0c0f14] border border-white/5 rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center">
          <div className="bg-white/5 p-6 rounded-full mb-6">
            <FolderOpen size={48} className="text-gray-700" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No trips available</h2>
          <p className="text-gray-500 max-w-xs mb-8">You haven't generated any trips yet. Click the plus button to start planning.</p>
          <button className="text-cyan-500 font-bold uppercase tracking-widest text-xs hover:underline">
            Generate your first trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Map through your real trip data here */}
        </div>
      )}
    </div>
  );
};

export default MyTripPage;