import React from "react";
import { FileText, Gavel, AlertCircle, Calendar, RefreshCcw, Info } from "lucide-react";

export default function TermsOfServicePage() {
  const terms = [
    {
      icon: <FileText className="w-5 h-5 text-indigo-400" />,
      title: "1. Acceptance of Terms",
      content: "By accessing or using LaunchForge, you agree to be bound by these Terms of Service. If you do not agree to all of the terms and conditions, you may not use the service."
    },
    {
      icon: <RefreshCcw className="w-5 h-5 text-indigo-400" />,
      title: "2. Service Modifications",
      content: "We reserve the right to modify or discontinue any part of the service at our sole discretion. We will communicate major changes through your account dashboard or email."
    },
    {
      icon: <Calendar className="w-5 h-5 text-indigo-400" />,
      title: "3. Subscription & Billing",
      content: "Payments are processed through Stripe. Subscriptions renew automatically until cancelled. Pro and Growth features are only available under an active paid plan."
    },
    {
       icon: <Gavel className="w-5 h-5 text-indigo-400" />,
       title: "4. Account Responsibilities",
       content: "You are responsible for maintaining the security of your account and any activities that occur under your credentials. Notify us immediately of any unauthorized access."
    },
    {
      icon: <AlertCircle className="w-5 h-5 text-indigo-400" />,
      title: "5. Termination",
      content: "We may terminate or suspend your access to the service immediately, without prior notice, if you breach our Terms or use the service for illegal purposes."
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-6">
            <Gavel size={14} />
            Version 2.1
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Please read these terms carefully before using LaunchForge to grow your audience.
          </p>
        </div>

        <div className="space-y-6">
           {terms.map((term, i) => (
             <div key={i} className="p-8 rounded-3xl border border-zinc-800/50 bg-zinc-900/10 hover:border-zinc-700 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800">
                    {term.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-3 tracking-wide">{term.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed antialiased">
                       {term.content}
                    </p>
                  </div>
                </div>
             </div>
           ))}
        </div>

        <div className="mt-20 p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden text-center md:text-left">
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-md">
                <h4 className="text-xl font-bold mb-2 flex items-center gap-2 justify-center md:justify-start">
                  <Info size={18} className="text-indigo-400" />
                  Legal Support
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  If you have any questions or require professional clarification on these terms, our legal support channel is always available for you.
                </p>
              </div>
              <a href="/support" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-500/20 transition-all whitespace-nowrap">
                Contact Legal
              </a>
           </div>
           
           {/* Blob */}
           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="mt-16 text-center border-t border-zinc-800 pt-10">
           <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
             LaunchForge © 2026 · Committed to ethical growth
           </p>
        </div>
      </div>
    </div>
  );
}
