import React from 'react';
import { Play, Heart } from 'lucide-react';

const ExplorePage = () => {
  const reels = [
    { id: 1, title: 'Bali Vibes', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600' },
    { id: 2, title: 'Swiss Alps', url: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&q=80&w=600' },
    { id: 3, title: 'Tokyo Nights', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=600' },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-4xl font-black uppercase italic mb-10">Explore the World</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {reels.map((reel) => (
          <div key={reel.id} className="relative aspect-[9/16] rounded-3xl overflow-hidden group cursor-pointer shadow-2xl">
            <img src={reel.url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="font-bold text-sm mb-2">{reel.title}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter">
                  <Play size={12} fill="white" /> 12k views
                </div>
                <Heart size={16} className="text-gray-400 hover:text-red-500 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;