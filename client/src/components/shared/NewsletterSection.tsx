"use client";

import { FooterNewsletter } from "./footer/_components/FooterNewsletter";

export function NewsletterSection() {
  return (
    <section className="relative w-full py-24 overflow-hidden">
      {/* Background decoration to make it feel distinct */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-12">
          <p className="text-muted-foreground/80 max-w-2xl px-4 text-base md:text-lg">
            Master the art of the viral launch. Join 2,000+ founders getting elite growth strategies and early feature reveals.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-2xl lg:max-w-3xl">
             {/* We reuse the logic but style it as a major section */}
             <div className="bg-card/50 border border-border/60 rounded-[2.5rem] p-2 sm:p-4 backdrop-blur-sm shadow-xl shadow-indigo-500/5">
                <FooterNewsletter />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
