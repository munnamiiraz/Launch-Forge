import React from "react";
import { ShieldCheck, Lock, FileText, Scale, Eye, Info } from "lucide-react";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: <Eye className="w-5 h-5 text-indigo-400" />,
      title: "Data We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, create a waitlist, or communicate with us. This includes name, email, and workspace data."
    },
    {
      icon: <Lock className="w-5 h-5 text-indigo-400" />,
      title: "How We Use Data",
      content: "Data is used to provide and improve our services, including personalization of AI insights, processing payments, and sending administrative notifications regarding your account."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-indigo-400" />,
      title: "Data Protection",
      content: "We implement industry-standard security measures to safeguard your information. We do not sell or trade your personal data to outside parties without your consent."
    },
    {
      icon: <Scale className="w-5 h-5 text-indigo-400" />,
      title: "Your Rights",
      content: "You have the right to access, update, or delete your personal data at any time. You can also request a copy of the data we have stored about your workspace."
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-6">
            <ShieldCheck size={14} />
            Updated April 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Transparency is at the heart of LaunchForge. Learn how we handle your data with respect and precision.
          </p>
        </div>

        <div className="space-y-8">
           {sections.map((section, i) => (
             <div key={i} className="p-8 rounded-3xl border border-zinc-800/50 bg-zinc-900/10 hover:border-zinc-700 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-3">{section.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed antialiased">
                      {section.content}
                    </p>
                  </div>
                </div>
             </div>
           ))}
        </div>

        <div className="mt-20 p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-md">
                <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Info size={18} className="text-indigo-400" />
                  Have Questions?
                </h4>
                <p className="text-sm text-zinc-400">
                  If you have any questions regarding this policy or our data practices, please reach out directly to our privacy officer.
                </p>
              </div>
              <a href="/support" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm transition-all whitespace-nowrap">
                Contact Privacy Team
              </a>
           </div>
           
           {/* Blob */}
           <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="mt-16 text-center">
           <p className="text-xs text-zinc-600 font-medium">
             © 2026 LaunchForge · Built for privacy-first developers
           </p>
        </div>
      </div>
    </div>
  );
}
