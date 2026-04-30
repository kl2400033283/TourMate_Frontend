import { MapPin, ShieldCheck, HeartPulse, Globe, Users, Navigation } from "lucide-react";
import { Link } from "react-router-dom";

function AboutUs() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans pb-20">
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-0 right-0 p-32 bg-yellow-400/20 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-10 p-32 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <div className="relative pt-32 pb-20 px-6 sm:px-12 lg:px-24 mx-auto max-w-7xl flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold tracking-wider uppercase shadow-sm">
          <Globe size={16} /> Rediscover Travel
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 drop-shadow-sm">
          Seamless Journeys. <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Unforgettable Memories.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed mb-10">
          TourMate is an innovative platform dedicated to transforming how people explore the world. By connecting passionate local guides, authentic homestays, and eager tourists, we build bridges across cultures securely and affordably.
        </p>
        <Link 
           to="/explore" 
           className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition hover:-translate-y-1 shadow-xl hover:shadow-2xl flex items-center gap-3"
        >
          <Navigation size={22} fill="currentColor"/> Start Your Journey
        </Link>
      </div>

      {/* MISSION STRIP */}
      <div className="bg-white border-y border-slate-200 shadow-sm py-16 px-6 relative z-10">
         <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">
             <div className="flex-1 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Our Mission</h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                   We believe travel should be accessible, organized, and deeply personal. Our platform aims to empower local communities by allowing residents to act as hosts and guides, offering tourists an authentic, immersive, and verified gateway to the world's most beautiful destinations.
                </p>
             </div>
             <div className="flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-orange-400 blur-xl opacity-30 rounded-[2rem] -z-10 transform rotate-3" />
                <img 
                   src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" 
                   alt="Mission Team" 
                   className="rounded-[2rem] shadow-xl w-full h-auto object-cover transform transition duration-500 hover:scale-[1.02]"
                />
             </div>
         </div>
      </div>

      {/* CORE VALUES */}
      <div className="py-24 px-6 max-w-7xl mx-auto">
         <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose TourMate?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Our rigorous verification protocols paired with highly tailored itineraries provide everything you need for the perfect trip.</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard 
               icon={<ShieldCheck size={32} className="text-blue-600" />}
               bgColor="bg-blue-50"
               title="Secure & Verified"
               desc="Every host and local guide undergoes a rigorous verification process to ensure absolute safety and top-tier hospitality for all tourists."
            />
            <ValueCard 
               icon={<HeartPulse size={32} className="text-rose-600" />}
               bgColor="bg-rose-50"
               title="Authentic Experiences"
               desc="Skip the generic hotels. We map your stays with real local families and cultural native guides to fully immerse you in the local energy."
            />
            <ValueCard 
               icon={<Users size={32} className="text-emerald-600" />}
               bgColor="bg-emerald-50"
               title="Community Driven"
               desc="Your spending goes straight into the pockets of the local community, promoting sustainable tourism economies worldwide."
            />
         </div>
      </div>

      {/* FOOTER CALLOUT */}
      <div className="max-w-4xl mx-auto mt-10 px-6">
         <div className="bg-slate-900 rounded-3xl p-10 md:p-14 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500 rounded-full blur-[80px] opacity-40 z-0"/>
            <div className="relative z-10">
               <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to join the ecosystem?</h3>
               <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">Whether you're looking to explore new horizons, guide tourists through your hometown, or host travelers in your beautiful property.</p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/signup" className="px-8 py-3 bg-yellow-500 text-slate-900 font-bold rounded-xl hover:bg-yellow-400 transition shadow-lg">Become a Member</Link>
                  <Link to="/login" className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition backdrop-blur-md border border-white/20">Sign In Now</Link>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}

function ValueCard({ icon, title, desc, bgColor }) {
   return (
      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer relative overflow-hidden">
         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${bgColor} group-hover:scale-110 transition-transform`}>
            {icon}
         </div>
         <h4 className="text-xl font-bold text-slate-900 mb-3">{title}</h4>
         <p className="text-slate-600 leading-relaxed text-sm lg:text-base">{desc}</p>
         <div className="absolute -bottom-1 -right-1 opacity-5 mix-blend-multiply pointer-events-none transform scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700">
             {icon}
         </div>
      </div>
   )
}

export default AboutUs;