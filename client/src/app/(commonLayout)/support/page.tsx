"use client";

import React, { useState } from "react";
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Globe, 
  LifeBuoy, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formValues, setFormValues] = useState({ name: "", email: "", subject: "", message: "" });

  const categories = [
    {
      icon: <LifeBuoy className="w-6 h-6 text-indigo-400" />,
      title: "Help Center",
      description: "Step-by-step guides and tutorials for waitlists, referrals, and more.",
      action: "Browse Docs",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-indigo-400" />,
      title: "Community",
      description: "Connect with thousands of owners launching their next big idea.",
      action: "Join Forum",
    },
    {
      icon: <FileText className="w-6 h-6 text-indigo-400" />,
      title: "System Status",
      description: "Real-time updates on our API and infrastructure performance.",
      action: "API Status",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset after some time
    setTimeout(() => {
      setIsSubmitted(false);
      setFormValues({ name: "", email: "", subject: "", message: "" });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-24 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6"
          >
            <LifeBuoy size={14} />
            Support Center
          </motion.div>
          <motion.h1 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
          >
            How can we help?
          </motion.h1>
          <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="max-w-xl mx-auto relative group"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search for articles, guides, or questions..." 
              className="w-full h-14 bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 border-transparent bg-zinc-900 transition-all"
            />
          </motion.div>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {categories.map((cat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
              className="p-8 rounded-3xl border border-zinc-800/50 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                {cat.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{cat.title}</h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                {cat.description}
              </p>
              <Button variant="ghost" className="p-0 h-auto text-indigo-400 hover:text-indigo-300 hover:bg-transparent flex items-center gap-1">
                {cat.action} <ArrowRight size={14} className="group-hover:ml-1 transition-all" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Main contact area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Talk to our experts</h2>
              <p className="text-zinc-500 leading-relaxed max-w-sm mb-10">
                Can't find what you need? LaunchForge support is available 24/7 to help you optimize your growth.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                 {[
                   { icon: <Mail size={18} />, label: "Email Support", value: "help@launchforge.dev" },
                   { icon: <Phone size={18} />, label: "Call Experts", value: "+1 (800) LAUNCH-0" },
                   { icon: <Globe size={18} />, label: "HQ Global", value: "San Francisco, CA" }
                 ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-medium">{item.value}</p>
                      </div>
                    </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800 p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden">
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-10 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-6 border border-green-500/20">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Ticket Received!</h3>
                  <p className="text-zinc-400 text-sm max-w-[280px]">
                    Thanks {formValues.name}! We've received your request and our team will get back to you within 4 hours.
                  </p>
                  <Button variant="outline" onClick={() => setIsSubmitted(false)} className="mt-8 border-zinc-700 hover:bg-zinc-800 rounded-xl">
                    Send another message
                  </Button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="relative z-10 space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 ml-1">Your Name</label>
                      <input 
                        required
                        value={formValues.name}
                        onChange={(e) => setFormValues({...formValues, name: e.target.value})}
                        type="text" 
                        placeholder="John Doe"
                        className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-zinc-500 ml-1">Your Email</label>
                       <input 
                        required
                        value={formValues.email}
                        onChange={(e) => setFormValues({...formValues, email: e.target.value})}
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 ml-1">Subject</label>
                    <input 
                      required
                      value={formValues.subject}
                      onChange={(e) => setFormValues({...formValues, subject: e.target.value})}
                      type="text" 
                      placeholder="Pricing inquiry"
                      className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 ml-1">Message</label>
                    <textarea 
                      required
                      value={formValues.message}
                      onChange={(e) => setFormValues({...formValues, message: e.target.value})}
                      rows={5} 
                      placeholder="Tell us how we can help..."
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                    ></textarea>
                  </div>
                  
                  <Button 
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 h-14 text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-500/20 group relative overflow-hidden"
                  >
                    <span className={cn("flex items-center gap-2", isSubmitting && "opacity-0")}>
                      Submit Ticket <ArrowRight size={20} className="group-hover:ml-1 transition-all" />
                    </span>
                    {isSubmitting && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin" size={24} />
                      </div>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Background blob */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
