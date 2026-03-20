"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

const FAQ_ITEMS = [
  {
    q: "Can I change plans later?",
    a: "Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period.",
  },
  {
    q: "Is there really a free plan?",
    a: "Absolutely. The Starter plan is free forever — no trial period, no credit card required. You can run one waitlist with up to 500 subscribers at no cost.",
  },
  {
    q: "What happens when I hit the subscriber limit on Starter?",
    a: "New signups are queued and you'll receive an email notification. Your existing subscribers remain unaffected. Upgrade to Pro for unlimited subscribers.",
  },
  {
    q: "Do you offer a refund?",
    a: "Yes. We offer a 14-day money-back guarantee on all paid plans, no questions asked.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, Mastercard, Amex) and Stripe-supported payment methods including Apple Pay and Google Pay.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. All data is encrypted in transit and at rest. We're GDPR compliant and never sell your data to third parties. You can export or delete your data at any time.",
  },
];

export function PricingFAQ() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-8"
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <h3 className="text-2xl font-bold tracking-tight text-zinc-100">
          Frequently asked questions
        </h3>
        <p className="text-sm text-zinc-500">
          Still have questions?{" "}
          <a href="/contact" className="text-indigo-400 underline-offset-2 hover:underline">
            Contact us
          </a>
        </p>
      </div>

      {/* Accordion */}
      <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
        {FAQ_ITEMS.map((item, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="border-zinc-800/60"
          >
            <AccordionTrigger className="py-4 text-left text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:no-underline [&[data-state=open]]:text-zinc-100">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-relaxed text-zinc-500">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
}
