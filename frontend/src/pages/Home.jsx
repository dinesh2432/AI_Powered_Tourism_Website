import React from 'react';
import { Sparkles, Map, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate()
    const handleLogin = (e) =>{
        e.preventDefault()
        navigate("/login")
    }


    const handleSignup = (e) =>{
      e.preventDefault()
      navigate("/signup")
    }
    
  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 px-6 py-5 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="bg-cyan-500 p-1.5 rounded-lg">
            <Map size={24} className="text-black" />
          </div>
          <span className="text-2xl font-black tracking-tighter">TRAVELX</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-cyan-400 transition-all active:scale-95 shadow-lg shadow-white/5"  onClick={handleLogin}>
            Login
          </button>
          <button className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-cyan-400 transition-all active:scale-95 shadow-lg shadow-white/5"  onClick={handleSignup}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen w-full flex items-center justify-center pt-20">
        
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000" 
            alt="Breathtaking Landscape" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#05070a]/60 to-[#05070a]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-6 backdrop-blur-md">
            <Sparkles size={16} className="text-cyan-400" />
            <span className="text-xs font-bold tracking-widest uppercase">The Future of Travel is Here</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Stop Searching. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Start Wandering.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Our AI understands your vibe, manages your budget, and crafts 100% personalized itineraries in seconds. Your dream trip, curated by intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] flex items-center justify-center gap-2 group" onClick={handleLogin}>
              GET STARTED NOW
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>



    </div>
  );
};

export default Home;