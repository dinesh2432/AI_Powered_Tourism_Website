// import React from 'react';
// import { Plus, Sparkles, Map, Compass, Globe, ArrowRight, Play } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const HomeContent = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="space-y-16 pb-20 animate-in fade-in duration-1000">
      
//       {/* --- CINEMATIC HERO SECTION --- */}
//       <section className="relative h-[70vh] w-full rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
//         {/* Background Video/Image Overlay */}
//         <img 
//           src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2070" 
//           className="absolute inset-0 w-full h-full object-cover scale-105"
//           alt="Travel Background"
//         />
//         {/* Dark Gradient Overlay for Readability */}
//         <div className="absolute inset-0 bg-gradient-to-r from-[#05070a] via-[#05070a]/60 to-transparent" />
        
//         {/* Content */}
//         <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-3xl">
//           <div className="flex items-center gap-2 text-cyan-400 mb-6 bg-cyan-400/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-cyan-400/20">
//             <Sparkles size={16} />
//             <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI-Powered Travel Agent</span>
//           </div>
          
//           <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] mb-6 tracking-tighter">
//             DREAM <br /> 
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">BIGGER.</span>
//           </h1>
          
//           <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-lg leading-relaxed font-light">
//             Stop scrolling and start exploring. Our AI crafts the perfect itinerary based on your soul's desire.
//           </p>

//           <div className="flex flex-col sm:flex-row gap-4">
//             <button 
//               onClick={() => navigate('/dashboard/trips')}
//               className="flex items-center justify-center gap-3 bg-white text-black px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] active:scale-95 group"
//             >
//               <Plus size={20} />
//               Start New Journey
//             </button>
//             <button className="flex items-center justify-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
//               <Play size={18} fill="white" />
//               Watch Demo
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* --- FEATURE GRID --- */}
//       <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
//         {[
//           { 
//             icon: <Globe className="text-cyan-400" />, 
//             title: "Global Reach", 
//             desc: "Access hidden spots in over 150+ countries with local insights." 
//           },
//           { 
//             icon: <Compass className="text-blue-400" />, 
//             title: "Tailored Vibe", 
//             desc: "From budget backpacking to luxury retreats, we adapt to you." 
//           },
//           { 
//             icon: <Map className="text-purple-400" />, 
//             title: "Smart Sync", 
//             desc: "Offline maps and real-time flight tracking in one dashboard." 
//           }
//         ].map((feature, idx) => (
//           <div key={idx} className="group bg-[#0c0f14] border border-white/5 p-10 rounded-[2.5rem] hover:border-cyan-500/30 transition-all duration-500">
//             <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
//               {feature.icon}
//             </div>
//             <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">{feature.title}</h3>
//             <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
//           </div>
//         ))}
//       </section>

//       {/* --- DESTINATION PREVIEW --- */}
//       <section className="space-y-8">
//         <div className="flex items-end justify-between">
//           <div>
//             <h2 className="text-3xl font-black uppercase italic">Top Destinations</h2>
//             <p className="text-gray-500 text-sm mt-1">Hand-picked by our AI community.</p>
//           </div>
//           <button className="text-cyan-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
//             View All <ArrowRight size={16} />
//           </button>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           <DestinationCard 
//             img="https://images.unsplash.com/photo-1506929113675-3459960bd739?auto=format&fit=crop&q=80&w=800"
//             city="Maldives"
//             price="From $1,200"
//           />
//           <DestinationCard 
//             img="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800"
//             city="Kyoto"
//             price="From $850"
//           />
//           <DestinationCard 
//             img="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800"
//             city="Santorini"
//             price="From $980"
//           />
//         </div>
//       </section>
//     </div>
//   );
// };

// // Sub-component for Destination Cards
// const DestinationCard = ({ img, city, price }) => (
//   <div className="relative h-80 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl">
//     <img src={img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={city} />
//     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
//     <div className="absolute bottom-6 left-6 right-6">
//       <h4 className="text-2xl font-bold text-white mb-1">{city}</h4>
//       <p className="text-cyan-400 text-sm font-medium">{price}</p>
//     </div>
//   </div>
// );

// export default HomeContent;

import React from 'react';
import { Plus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";

const HomeContent = () => {
  const navigate = useNavigate();



  return (
    /* h-screen and overflow-hidden prevent the page from ever scrolling */
    <div >
      
      {/* --- BACKGROUND IMAGE --- */}
      <img 
        src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=2000" 
        alt="tourist image"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* --- OVERLAYS --- */}
      <div className="absolute inset-0 bg-black/40 z-1" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/20 to-transparent z-1" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-1" />

      {/* --- MAIN CONTENT CONTAINER --- */}
      {/* items-center centers the content vertically within the h-screen */}
      <div className="relative z-10 h-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between px-8 md:px-12 lg:px-20 gap-8">
        
        {/* LEFT SIDE: TEXT ALIGNMENT */}
        <div className="w-full lg:w-3/5 space-y-6 md:space-y-8 text-left">
          <div className="space-y-2">
             <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.8] uppercase drop-shadow-2xl">
                Travel <br />
                <span className="text-white/90">Discover</span>
             </h1>
          </div>
          
          <p className="text-gray-200 text-sm md:text-lg max-w-lg leading-relaxed font-medium drop-shadow-md">
            If you're looking for an inspirational and authentic holiday experience 
            that's tailored to your needs, you've come to the right place. We've been 
            at the forefront of tourism for over 25 years.
          </p>

          <div className="pt-2">
            <button 
                onClick={() => navigate('/dashboard/trips')}
                className="bg-white text-black px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all duration-300 active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
                Make My Trip
            </button>
          </div>

          {/* Ratings section to anchor the bottom-left */}
          
        </div>

        {/* RIGHT SIDE: FEATURED IMAGE CARDS */}
        <div className="hidden lg:flex w-full lg:w-2/5 flex-col items-center lg:items-end justify-center">
          <div className="relative w-full max-w-sm aspect-[4/5] rounded-[2.5rem] overflow-hidden border-[6px] border-white/10 shadow-2xl group transition-transform duration-500 hover:rotate-1">
            <img 
              src="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=800" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              alt="Featured"
            />
            {/* L-Frames */}
            <div className="absolute top-6 left-6 w-12 h-12 border-t-[3px] border-l-[3px] border-white/90" />
            <div className="absolute bottom-6 right-6 w-12 h-12 border-b-[3px] border-r-[3px] border-white/90" />
          </div>

          {/* Thumbnails row - positioned relative to the main card */}
          <div className="flex gap-4 mt-8">
            <Thumbnail img="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200" />
            <Thumbnail img="https://images.unsplash.com/photo-1519046904884-53103b34b206?w=200" />
            <Thumbnail active img="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=200" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Thumbnail = ({ img, active }) => (
  <div className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${active ? 'border-white scale-110 shadow-xl' : 'border-white/20 opacity-60 hover:opacity-100'}`}>
    <img src={img} className="w-full h-full object-cover" alt="trip" />
  </div>
);

export default HomeContent;