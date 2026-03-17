import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const features = [
  {
    icon: '🤖',
    title: 'AI Trip Planner',
    desc: 'Generate personalized day-by-day itineraries in seconds using Google Gemini AI.',
    color: 'from-primary-500/20 to-primary-600/10',
    border: 'border-primary-500/20',
  },
  {
    icon: '🧑‍💼',
    title: 'Local Guide Booking',
    desc: 'Connect with verified local experts who know every hidden gem at your destination.',
    color: 'from-secondary-500/20 to-secondary-600/10',
    border: 'border-secondary-500/20',
  },
  {
    icon: '💬',
    title: 'Smart AI Chat',
    desc: 'Ask our travel AI anything — cuisine, safety, culture, packing tips and more.',
    color: 'from-accent-500/20 to-accent-600/10',
    border: 'border-accent-500/20',
  },
  {
    icon: '🎬',
    title: 'Travel Video Explorer',
    desc: 'Browse curated travel videos to get inspired for your next dream destination.',
    color: 'from-green-500/20 to-green-600/10',
    border: 'border-green-500/20',
  },
];

const destinations = [
  { name: 'Paris', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80', tag: 'Europe', trips: '2.4k trips' },
  { name: 'Bali', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', tag: 'Asia', trips: '3.1k trips' },
  { name: 'New York', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80', tag: 'Americas', trips: '1.8k trips' },
  { name: 'Tokyo', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', tag: 'Asia', trips: '2.0k trips' },
  { name: 'Santorini', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80', tag: 'Europe', trips: '1.5k trips' },
  { name: 'Dubai', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', tag: 'Middle East', trips: '1.2k trips' },
];

const guides = [
  { name: 'Arjun Sharma', city: 'Bali, Indonesia', specialty: 'Adventure & Culture', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', rating: 4.9, price: 80 },
  { name: 'Sophia Laurent', city: 'Paris, France', specialty: 'Art & Gastronomy', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', rating: 4.8, price: 120 },
  { name: 'Kenji Tanaka', city: 'Tokyo, Japan', specialty: 'History & Anime', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', rating: 5.0, price: 95 },
];

const stats = [
  { value: '10K+', label: 'Trips Generated' },
  { value: '500+', label: 'Local Guides' },
  { value: '150+', label: 'Destinations' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-950 grid-bg overflow-x-hidden">
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center pt-20 pb-32 px-4 md:px-12 lg:px-24">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85"
              alt="Hero Background"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-slate-950 to-transparent" />
        </div>

        {/* Floating Technical Decor */}
        <div className="absolute top-1/4 right-10 w-64 h-64 border border-white/5 rounded-none rotate-45 pointer-events-none opacity-20">
          <div className="absolute inset-0 border-t border-primary-500/50 animate-pulse" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-start text-left">
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="flex items-center gap-4 mb-10 overflow-hidden"
          >
            {/* <div className="h-[1px] w-12 bg-primary-500" /> */}
            {/* <span className="text-[10px] md:text-xs font-black tracking-[0.4em] uppercase text-primary-400">Mission: Reinvent Travel</span> */}
          </motion.div>

          <motion.h1
            className="text-6xl sm:text-8xl lg:text-[10rem] font-black mb-10 leading-[0.8] tracking-tighter uppercase italic"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            DISCOVER <br />
            <span className="gradient-text">THE UNKNOWN.</span>
          </motion.h1>

          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-12 w-full">
            <motion.p
              className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed font-bold uppercase tracking-wide"
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
            >
              The world's first AI-powered tourism engine built for the next generation of explorers. Optimized protocols, neural-mapped itineraries, and local expertise synchronisation.
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-6" 
              initial="hidden" animate="visible" variants={fadeUp} custom={3}
            >
              <Link to="/signup" className="btn-primary min-w-[240px]">
                Try it now!
              </Link>
              <Link to="/explore" className="btn-secondary min-w-[240px]">
                Explore Now!
              </Link>
            </motion.div>
          </div>

          {/* Tactical Stats */}
          <motion.div 
            className="mt-32 grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24"
            initial="hidden" animate="visible" variants={fadeUp} custom={4}
          >
            {stats.map((s) => (
              <div key={s.label} className="relative group">
                <div className="text-3xl font-black text-white italic tracking-tighter mb-2">{s.value}</div>
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 group-hover:text-primary-500 transition-colors">{s.label}</div>
                <div className="absolute -bottom-2 left-0 w-0 h-[1px] bg-primary-500 group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="py-40 px-4 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-5">
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="sticky top-40"
              >
                {/* <div className="inline-block px-4 py-1 border border-primary-500/20 text-[9px] font-black text-primary-400 uppercase tracking-[0.3em] mb-8">System Capabilities</div> */}
                <h2 className="text-5xl md:text-7xl font-black text-white leading-none italic uppercase tracking-tighter mb-10">Core <br /><span className="gradient-text">Features.</span></h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed mb-12 max-w-sm">Our platform leverages high-frequency AI models to optimize your travel logistics in real-time.</p>
                <div className="w-16 h-1 bg-white/5" />
              </motion.div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="card group hover:border-primary-500/30 transition-all duration-500 p-10"
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                >
                  <div className="w-12 h-12 glass border border-white/10 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">{f.icon}</div>
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">{f.title}</h3>
                  <p className="text-slate-500 text-xs font-bold leading-relaxed uppercase tracking-wide">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── DESTINATIONS ─── */}
      <section id="destinations" className="py-30 px-4">
        <div className="max-w-[1600px] mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10 px-4"
          >
            <div className="max-w-3xl">
              <h2 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-[0.8]">Destinations <br /><span className="gradient-text">OVERVIEW.</span></h2>
            </div>
            {/* <Link to="/explore" className="btn-secondary">Access All Sectors</Link> */}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((d, i) => (
              <motion.div
                key={d.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i % 3}
                className="group relative h-[500px] overflow-hidden rounded-[2.5rem] border border-white/5"
              >
                <img 
                  src={d.img} 
                  alt={d.name} 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-transparent transition-colors duration-500" />
                
                <div className="absolute inset-0 p-12 flex flex-col justify-end rounded-[2.5rem] backdrop-blur-[1px] group-hover:backdrop-blur-none transition-all">
                  <div className="flex justify-between items-end">      
                    <div>
                      <div className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mb-4">{d.tag}</div>
                      <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4">{d.name}</h3>
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{d.trips} Successful Missions</div>
                    </div>
                    <Link to="/signup" className="w-12 h-12 bg-white text-slate-950 flex items-center justify-center font-black group-hover:bg-primary-500 group-hover:text-white transition-all">
                      →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
{/* ─── LOCAL GUIDES SECTOR ─── */}
      <section id="guides" className="py-40 px-4 relative overflow-hidden">
        {/* Subtle background text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-black text-white/[0.02] pointer-events-none uppercase italic tracking-tighter select-none">
          HUMAN_INTEL
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Left Side: Content */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="space-y-10"
            >
              <div>
                <div className="inline-block px-4 py-1 border border-secondary-500/20 text-[9px] font-black text-secondary-400 uppercase tracking-[0.3em] mb-8">
                  Personnel Protocol: Local Experts
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.8] italic uppercase tracking-tighter mb-10">
                  GUIDE <br /><span className="gradient-text">OVERRIDE.</span>
                </h2>
                <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed uppercase tracking-wide max-w-lg">
                  AI handles the synchronization. Our guides handle the soul. Access unmapped experiences through verified local intelligence.
                </p>
              </div>

              <div className="space-y-8">
                {[
                  { title: "UNMAPPED KNOWLEDGE", desc: "Access spots that don't exist on public algorithms or tourist maps." },
                  { title: "CULTURAL SYNC", desc: "Break the barrier. Our guides provide real-time cultural translation and etiquette." },
                  { title: "VETTED OPERATIVES", desc: "Every guide undergoes a 12-point verification protocol for safety and expertise." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-1 h-12 bg-white/10 group-hover:bg-primary-500 transition-colors duration-500" />
                    <div>
                      <h4 className="text-white font-black text-xs uppercase tracking-widest mb-2">{item.title}</h4>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* <div className="pt-6">
                <Link to="/signup" className="btn-primary">
                  Meet the Vanguard
                </Link>
              </div> */}
            </motion.div>

            {/* Right Side: Visual Element (Personnel Cards) */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Stacked "Personnel Files" Effect */}
              <div className="relative z-20 translate-x-4 translate-y-4">
                <div className="card p-0 border-white/10 overflow-hidden bg-slate-900 shadow-2xl rounded-[2.5rem]">
                  <div className="h-[650px] relative">
                    <img 
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                      alt="Professional Travel Guide" 
                    />
                    {/* Subtle overlay to keep it feeling like part of the dark UI */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
                  </div>
                  <div className="p-6 bg-white/5 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Guide_Protocol : Active</span>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Decorative Ghost Card behind */}
              <div className="absolute top-0 left-0 w-full h-full border border-white/5 -translate-x-8 -translate-y-8 z-10 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-full border border-primary-500/10 -translate-x-16 -translate-y-16 z-0 pointer-events-none" />
            </motion.div>



          </div>
        </div>
      </section>
      
      
      {/* ─── FOOTER ─── */}
      <footer className="py-20 border-t border-white/5 bg-slate-950 px-6">
  <div className="max-w-7xl mx-auto">
    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
      
      {/* Brand Column */}
      <div className="flex flex-col items-center md:items-start gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white text-slate-950 flex items-center justify-center font-black rounded-sm">
            ✈
          </div>
          <span className="font-display font-black text-2xl text-white uppercase italic tracking-tighter">
            TRAVELX
          </span>
        </div>
      </div>

      {/* Navigation Column - Using actual section IDs */}
      <div className="flex gap-8 lg:gap-12">
        {[
          { name: 'Features', href: '#features' },
          { name: 'Sectors', href: '#destinations' },
          { name: 'Guides', href: '#guides' }, // Add id="cta" to your CTA section
        ].map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="text-[10px] font-black text-slate-500 hover:text-primary-400 uppercase tracking-widest transition-all hover:translate-y-[-2px]"
          >
            {link.name}
          </a>
        ))}
        
      </div>
      {/* Utility/Social Column */}
      <div className="flex flex-col items-center md:items-end gap-4">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-[9px] font-black text-white bg-white/5 border border-white/10 px-4 py-2 hover:bg-white hover:text-slate-950 transition-all uppercase tracking-widest"
        >
          Back To ↑
        </button>
        <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest">
          © 2026 TRAVELX // GLOBAL OPS
        </p>

      </div>

    </div>
  </div>
</footer>
    </div>
  );
};

export default HomePage;
