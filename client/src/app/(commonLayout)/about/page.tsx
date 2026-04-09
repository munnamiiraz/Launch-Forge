import React from "react";
import { Zap, Rocket, LineChart, Users, Star, ArrowRight, Shield, Globe, Cpu } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function AboutPage() {
  const values = [
    {
      icon: <Cpu className="w-6 h-6 text-indigo-400" />,
      title: "Informed by AI",
      description: "We leverage cutting-edge Gemini 2.0 models to provide insights that actually grow your project."
    },
    {
      icon: <Users className="w-6 h-6 text-indigo-400" />,
      title: "Built for Community",
      description: "LaunchForge turns every signup into a meaningful connection with your community."
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-400" />,
      title: "Trust & Transparency",
      description: "From our data practices to our roadmap, we believe in building in the open."
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-32 pb-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative mb-32 text-center lg:text-left grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-6">
              <Star size={12} className="fill-indigo-400" />
              Our Story
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent">
              Empowering the next <br /> generation of makers.
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-xl mb-10">
              LaunchForge was born out of a simple observation: launching is hard, but growing is harder. 
              We built a platform that simplifies the waitlist process while adding the viral mechanics 
              and AI insights usually reserved for big tech.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
               <a href="/register">
                 <Button className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl shadow-lg shadow-indigo-500/20">
                   Join the Forge
                 </Button>
               </a>
               <a href="/support">
                 <Button variant="outline" className="h-12 px-8 border-zinc-800 hover:bg-zinc-900 rounded-xl font-bold">
                   Contact Us
                 </Button>
               </a>
            </div>
          </div>
          <div className="relative">
             <div className="aspect-square bg-indigo-600/10 rounded-3xl border border-indigo-500/20 flex items-center justify-center p-12 relative group overflow-hidden">
                <Rocket size={120} className="text-indigo-500 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700" />
                {/* Background glow */}
                <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full" />
             </div>
             {/* Decor */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>

        {/* Mission / Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
           {values.map((v, i) => (
             <div key={i} className="p-10 rounded-[2rem] border border-zinc-800/50 bg-zinc-900/10 hover:border-zinc-700 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                  {v.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{v.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {v.description}
                </p>
             </div>
           ))}
        </div>

        {/* Closing CTA */}
        <div className="relative py-24 rounded-[3rem] bg-indigo-600 overflow-hidden text-center px-6">
           <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">Ready to build something legendary?</h2>
              <p className="text-indigo-100/80 mb-10 text-lg">
                Stop guessing and start growing. Thousands of makers already trust LaunchForge to power their vision.
              </p>
              <a href="/register">
                <Button className="h-14 px-10 bg-white text-indigo-600 hover:bg-zinc-100 font-bold rounded-2xl text-lg shadow-2xl">
                  Get Started for Free <ArrowRight className="ml-2" size={20} />
                </Button>
              </a>
           </div>

           {/* Floating elements */}
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <Zap className="absolute top-10 left-10 rotate-12" size={40} />
              <Globe className="absolute bottom-10 right-20 -rotate-12" size={60} />
              <Star className="absolute top-1/2 right-10" size={30} />
           </div>
        </div>
      </div>
    </div>
  );
}
