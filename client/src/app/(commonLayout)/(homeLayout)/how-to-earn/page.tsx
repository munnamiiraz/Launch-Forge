"use client"

import { useState, useEffect } from "react";
import { type Metadata } from "next";
import Link from "next/link";
import {
  Zap, ArrowRight, Share2, Trophy, Users, DollarSign,
  CheckCircle2, ChevronDown, Star, TrendingUp, Gift,
  Link2, Mail, Twitter, Smartphone, Globe, Clock,
  ArrowUpRight, Flame, Shield, HelpCircle, Sparkles,
  Target, Medal, Layers, BarChart2, Lock,
} from "lucide-react";

import { Badge }     from "@/src/components/ui/badge";
import { Button }    from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { cn } from "@/src/lib/utils";

/* ─────────────────────────────────────────────────────────────────
   Small reusable layout atoms
   ──────────────────────────────────────────────────────────────── */

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
      {children}
    </span>
  );
}

function SectionHeading({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">{children}</h2>
      {sub && <p className="max-w-2xl text-base leading-relaxed text-muted-foreground/80">{sub}</p>}
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "rounded-2xl border border-zinc-800/70 bg-card/40 p-6",
      className,
    )}>
      {children}
    </div>
  );
}

function GlowCard({ children, color = "indigo", className }: {
  children: React.ReactNode; color?: "indigo" | "amber" | "emerald" | "violet" | "rose"; className?: string;
}) {
  const glows = {
    indigo:  "bg-indigo-500/6",
    amber:   "bg-amber-500/6",
    emerald: "bg-emerald-500/6",
    violet:  "bg-violet-500/6",
    rose:    "bg-rose-500/6",
  };
  const borders = {
    indigo:  "border-indigo-500/20",
    amber:   "border-amber-500/20",
    emerald: "border-emerald-500/20",
    violet:  "border-violet-500/20",
    rose:    "border-rose-500/20",
  };
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border p-6",
      glows[color], borders[color], className,
    )}>
      <div className={cn("pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl", glows[color])} />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────────── */

export default function HowToEarnPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Background grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.011)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.011)_1px,transparent_1px)] bg-[size:52px_52px]"
      />
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none fixed left-0 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/6 blur-[120px]" />
      <div aria-hidden className="pointer-events-none fixed bottom-0 right-0 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-violet-500/5 blur-[100px]" />


      <section className="relative overflow-hidden border-b border-border/50">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 text-center">

            <Badge className="gap-1.5 border-amber-500/25 bg-amber-500/8 px-4 py-1.5 text-sm text-amber-400">
              <Flame size={13} /> Real money. Real prizes. Zero investment.
            </Badge>

            <div className="flex flex-col gap-4">
              <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Refer friends.{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  Win prizes.
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground/80">
                LaunchForge is where product launches happen. Join waitlists for exciting new products,
                share your referral link, climb the leaderboard, and earn real cash, gift cards, and
                lifetime access — just by telling friends about products you believe in.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
              {[
                { value: "$50k+",   label: "paid out in prizes",      color: "text-emerald-400" },
                { value: "12+",     label: "products live",           color: "text-indigo-400"  },
                { value: "124k+",   label: "people earning",          color: "text-violet-400"  },
                { value: "100% free", label: "no fees ever",          color: "text-amber-400"   },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-0.5">
                  <span className={cn("text-2xl font-black tabular-nums", s.color)}>{s.value}</span>
                  <span className="text-muted-foreground/60">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/explore">
                <Button className="gap-2 bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-500">
                  Browse open waitlists <ArrowRight size={14} />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" className="gap-2 border-zinc-700/80 bg-transparent px-6 py-3 text-sm text-muted-foreground hover:border-zinc-600 hover:bg-muted/60 hover:text-foreground/90">
                  See how it works <ChevronDown size={14} />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-24 px-4 py-20 sm:px-6 lg:px-8">

        {/* ═══════════════════════════════════════════════════════════
            WHAT IS LAUNCHFORGE
            ═══════════════════════════════════════════════════════════ */}
        <section id="what-is">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <SectionBadge><Sparkles size={11} /> The basics</SectionBadge>
              <SectionHeading sub="LaunchForge is a platform that connects people launching products with early believers — people like you — who help spread the word.">
                What is LaunchForge?
              </SectionHeading>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {[
                {
                  icon: <Globe size={18} className="text-indigo-400" />,
                  accent: "border-indigo-500/20 bg-indigo-500/8",
                  title: "Products list here",
                  body: "Founders and makers launch their products on LaunchForge by creating a waitlist. They set up prizes to reward the people who help them grow.",
                },
                {
                  icon: <Share2 size={18} className="text-violet-400" />,
                  accent: "border-violet-500/20 bg-violet-500/8",
                  title: "You spread the word",
                  body: "You join waitlists you're excited about and share your unique referral link. Every person who joins through your link counts as one referral.",
                },
                {
                  icon: <Trophy size={18} className="text-amber-400" />,
                  accent: "border-amber-500/20 bg-amber-500/8",
                  title: "You earn prizes",
                  body: "The more people you refer, the higher you rank on the leaderboard. When the waitlist closes, the top referrers win cash, gift cards, or lifetime access.",
                },
              ].map((c) => (
                <div key={c.title} className={cn("flex flex-col gap-4 rounded-2xl border p-5", c.accent)}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card/60">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground/90">{c.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/80">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Honest note */}
            <GlowCard color="emerald">
              <div className="flex items-start gap-3">
                <Shield size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">100% free to participate. Always.</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground/80">
                    LaunchForge is completely free for users. You will never be asked to pay anything, buy anything, or provide payment details to earn prizes. The product owners fund the prizes — your job is just to share.
                  </p>
                </div>
              </div>
            </GlowCard>
          </div>
        </section>

        <Separator className="bg-muted/60" />

        {/* ═══════════════════════════════════════════════════════════
            HOW IT WORKS — STEP BY STEP
            ═══════════════════════════════════════════════════════════ */}
        <section id="how-it-works">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <SectionBadge><Target size={11} /> Step by step</SectionBadge>
              <SectionHeading sub="From finding a product to collecting your prize — here's exactly what happens.">
                How it works, step by step
              </SectionHeading>
            </div>

            <div className="flex flex-col gap-0">
              {[
                {
                  step: "01",
                  icon: <Globe    size={20} />,
                  color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
                  title: "Find a product you love",
                  body: "Browse the LaunchForge explore page and find a product that genuinely excites you — an AI tool, a new app, a SaaS product, or anything else that's launching soon. The more you believe in it, the easier it is to share.",
                  tip: "Tip: Products with prizes listed are the ones worth focusing on. Look for the 🏆 badge.",
                },
                {
                  step: "02",
                  icon: <ArrowRight size={20} />,
                  color: "border-violet-500/30 bg-violet-500/10 text-violet-400",
                  title: "Join the waitlist",
                  body: "Click \"Join waitlist\" and enter your name and email. That's it. You're now in the queue. You'll receive a confirmation email and your unique referral link within seconds.",
                  tip: "Tip: Join early — the same number of referrals earns a higher position if you joined before others.",
                },
                {
                  step: "03",
                  icon: <Link2    size={20} />,
                  color: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
                  title: "Get your referral link",
                  body: "After joining, you'll see your personal referral link. It looks like: launchforge.app/ref/ABC12345. This link is yours — it tracks every person who signs up through it. Share it anywhere you have an audience.",
                  tip: "Tip: Your link never expires during the waitlist period. Share it in multiple places and keep sharing.",
                },
                {
                  step: "04",
                  icon: <Share2   size={20} />,
                  color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                  title: "Share everywhere",
                  body: "Post your referral link on Twitter/X, Instagram, TikTok, LinkedIn, Discord, WhatsApp groups, Slack workspaces, Reddit threads, newsletters, YouTube descriptions, or anywhere your audience lives. Every platform counts.",
                  tip: "Tip: Don't just post the link — explain WHY you're excited about the product. Authentic recommendations convert 3× better.",
                },
                {
                  step: "05",
                  icon: <TrendingUp size={20} />,
                  color: "border-amber-500/30 bg-amber-500/10 text-amber-400",
                  title: "Watch your rank climb",
                  body: "Every time someone joins through your link, your referral count goes up and your leaderboard position improves. You can check the public leaderboard at any time to see where you stand against other referrers.",
                  tip: "Tip: Check the leaderboard to understand how far behind the next prize tier you are. Sometimes 2–3 more referrals puts you in a higher reward bracket.",
                },
                {
                  step: "06",
                  icon: <Trophy   size={20} />,
                  color: "border-rose-500/30 bg-rose-500/10 text-rose-400",
                  title: "Win when the waitlist closes",
                  body: "When the product launches or the waitlist deadline passes, the owner locks the leaderboard and awards prizes to the top referrers. Prizes are delivered by the product owner — usually within 48–72 hours of the waitlist closing.",
                  tip: "Tip: Keep an eye on the expiry date shown on the waitlist page. A final push in the last 48 hours can move you up significantly.",
                },
              ].map((s, i) => (
                <div key={s.step} className="flex gap-5">
                  {/* Connector */}
                  <div className="flex flex-col items-center gap-0">
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border", s.color)}>
                      {s.icon}
                    </div>
                    {i < 5 && <div className="my-2 w-px flex-1 bg-muted/60" />}
                  </div>

                  {/* Content */}
                  <div className={cn("flex flex-col gap-2 pb-8", i === 5 && "pb-0")}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">Step {s.step}</span>
                    </div>
                    <h3 className="text-base font-bold text-foreground">{s.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground/80">{s.body}</p>
                    <div className="mt-1 flex items-start gap-2 rounded-xl border border-border/40 bg-card/30 px-3 py-2">
                      <Star size={11} className="mt-0.5 shrink-0 text-amber-500" />
                      <p className="text-[11px] text-muted-foreground/60">{s.tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator className="bg-muted/60" />

        {/* ═══════════════════════════════════════════════════════════
            THE REFERRAL MECHANIC EXPLAINED
            ═══════════════════════════════════════════════════════════ */}
        <section id="referral-mechanic">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <SectionBadge><Link2 size={11} /> The mechanics</SectionBadge>
              <SectionHeading sub="Understanding exactly how referrals are counted and how queue positions work.">
                How referrals and queue positions work
              </SectionHeading>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <h3 className="mb-4 text-sm font-bold text-foreground/90">How referrals are counted</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { q: "What counts as a referral?", a: "Someone clicks your link AND completes the signup form with their name and email. Just clicking the link doesn't count." },
                    { q: "Can someone use multiple links?", a: "No. Each email address can only join a waitlist once. If someone joins through your link, they can't be claimed by anyone else." },
                    { q: "Do I earn referrals from their referrals?", a: "Yes — LaunchForge tracks chains up to 4 hops deep. If your referral refers someone, that also contributes to your chain score." },
                    { q: "When does my count update?", a: "Referral counts update in real-time. The leaderboard refreshes every 5 minutes to keep things fair." },
                  ].map((item) => (
                    <div key={item.q} className="flex flex-col gap-1 border-t border-border/40 pt-3 first:border-0 first:pt-0">
                      <p className="text-xs font-semibold text-foreground/80">{item.q}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground/60">{item.a}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="mb-4 text-sm font-bold text-foreground/90">Queue position explained</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { q: "How is my queue position calculated?", a: "Positions are ranked by referral count (most referrals = #1). Ties are broken by who joined earlier — so joining fast gives you a permanent tiebreaker advantage." },
                    { q: "Does my position change after I join?", a: "Yes, constantly. Your position moves up when you get more referrals, and moves down when others get more referrals than you. Staying active matters." },
                    { q: "What's the difference between queue position and leaderboard rank?", a: "Queue position is your spot in the overall signup list. Leaderboard rank is how you compare specifically among people who have referred others." },
                    { q: "Can I check my position anytime?", a: "Yes. Use the 'Find my rank' tool on the leaderboard page — enter your email to see your current position and referral count instantly." },
                  ].map((item) => (
                    <div key={item.q} className="flex flex-col gap-1 border-t border-border/40 pt-3 first:border-0 first:pt-0">
                      <p className="text-xs font-semibold text-foreground/80">{item.q}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground/60">{item.a}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Visual example */}
            <GlowCard color="indigo">
              <h3 className="mb-5 text-sm font-bold text-foreground/90">A real example: how 5 referrals can win $1,000</h3>
              <div className="grid gap-4 sm:grid-cols-5">
                {[
                  { label: "You join", icon: "👤", desc: "Position: #1,247" },
                  { label: "You share", icon: "🔗", desc: "Your link goes out" },
                  { label: "3 friends join", icon: "👥", desc: "Rank jumps to #48" },
                  { label: "5 total refs", icon: "🚀", desc: "You're now #12" },
                  { label: "Waitlist closes", icon: "🏆", desc: "You win $300!" },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-card/60 text-2xl">
                      {step.icon}
                    </div>
                    <p className="text-xs font-semibold text-foreground/80">{step.label}</p>
                    <p className="text-[10px] text-muted-foreground/60">{step.desc}</p>
                    {i < 4 && <ArrowRight size={14} className="hidden text-muted-foreground/40 sm:block absolute" />}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
                This is a simplified example. Actual results depend on the product's prize structure and how many other people are referring.
              </p>
            </GlowCard>
          </div>
        </section>

        <Separator className="bg-muted/60" />

        {/* ═══════════════════════════════════════════════════════════
            PRIZE TYPES
            ═══════════════════════════════════════════════════════════ */}
        <section id="prizes">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <SectionBadge><Trophy size={11} /> Prizes</SectionBadge>
              <SectionHeading sub="Every waitlist is different. Here are all the prize types you can earn on LaunchForge.">
                What prizes can you win?
              </SectionHeading>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  emoji: "💵",
                  type: "Cash",
                  color: "border-emerald-500/20 bg-emerald-500/6",
                  badge: "text-emerald-400 border-emerald-500/25 bg-emerald-500/10",
                  title: "Direct money",
                  body: "The most common prize type. Paid via bank transfer, PayPal, or Wise. Values typically range from $50 to $5,000 for the top referrer. Some products offer tiered cash prizes (e.g. $1,000 for #1, $300 for #2–#3).",
                  example: "Example: \"$1,000 for #1 referrer, $300 gift card for #2–#3\"",
                },
                {
                  emoji: "🎁",
                  type: "Gift Cards",
                  color: "border-amber-500/20 bg-amber-500/6",
                  badge: "text-amber-400 border-amber-500/25 bg-amber-500/10",
                  title: "Digital gift cards",
                  body: "Amazon, Apple, Google Play, Steam, and other popular gift cards. Delivered digitally to your email within 48 hours of the waitlist closing. Can usually be redeemed globally.",
                  example: "Example: \"$100 Amazon gift card for top 5 referrers\"",
                },
                {
                  emoji: "♾️",
                  type: "Lifetime Access",
                  color: "border-violet-500/20 bg-violet-500/6",
                  badge: "text-violet-400 border-violet-500/25 bg-violet-500/10",
                  title: "Free forever access",
                  body: "Lifetime access to the product being launched — Pro plan, all features, no recurring charges. This can be worth hundreds or thousands of dollars over time, especially for SaaS products.",
                  example: "Example: \"Lifetime Pro access (normally $19/mo) for #4–#10\"",
                },
                {
                  emoji: "🏷️",
                  type: "Discounts",
                  color: "border-rose-500/20 bg-rose-500/6",
                  badge: "text-rose-400 border-rose-500/25 bg-rose-500/10",
                  title: "Percentage off",
                  body: "Significant discounts on the product's paid plans, usually 30–70% off. Applied as a coupon code at signup. Typically given to referrers who reach a mid-tier position on the leaderboard.",
                  example: "Example: \"50% off for 1 year for #11–#25 referrers\"",
                },
                {
                  emoji: "📦",
                  type: "Physical Products",
                  color: "border-cyan-500/20 bg-cyan-500/6",
                  badge: "text-cyan-400 border-cyan-500/25 bg-cyan-500/10",
                  title: "Real stuff shipped to you",
                  body: "Some hardware, health, or consumer product launches offer physical prizes — the actual product, merch, or other physical rewards. Shipped internationally in most cases.",
                  example: "Example: \"Health monitor device (worth $199) for #1–#3\"",
                },
                {
                  emoji: "✨",
                  type: "Custom Prizes",
                  color: "border-indigo-500/20 bg-indigo-500/6",
                  badge: "text-indigo-400 border-indigo-500/25 bg-indigo-500/10",
                  title: "Unique rewards",
                  body: "Some owners get creative — 1:1 mentoring sessions, co-founder credits, early investor access, or exclusive community memberships. Read the prize description carefully.",
                  example: "Example: \"30-minute strategy call with the founder for #1\"",
                },
              ].map((p) => (
                <div key={p.type} className={cn("flex flex-col gap-4 rounded-2xl border p-5", p.color)}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xl">{p.emoji}</span>
                    <Badge className={cn("rounded-full px-2 py-0.5 text-[10px]", p.badge)}>{p.type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground/90">{p.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/80">{p.body}</p>
                    <p className="mt-2 text-[10px] italic text-muted-foreground/40">{p.example}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Prize tiers explained */}
            <Card>
              <h3 className="mb-5 text-sm font-bold text-foreground/90">Understanding prize tiers</h3>
              <div className="flex flex-col gap-3">
                {[
                  { rank: "#1",        medal: "🥇", label: "Champion",    color: "border-amber-500/30 bg-amber-500/8 text-amber-300",   body: "The single highest referrer. Almost always gets the biggest prize — usually cash or the most valuable reward." },
                  { rank: "#2 – #3",   medal: "🥈", label: "Top 3",       color: "border-zinc-600/40 bg-muted/20 text-foreground/80",     body: "Second and third place. Often get significant prizes like gift cards or a large discount." },
                  { rank: "#4 – #10",  medal: "🥉", label: "Top 10",      color: "border-orange-600/20 bg-orange-500/6 text-orange-300",body: "The next tier — usually lifetime access or a meaningful discount on the product." },
                  { rank: "#11 – #25", medal: "🌟", label: "Top 25",      color: "border-indigo-500/20 bg-indigo-500/6 text-indigo-300",body: "Still winning — typically discounts, early access perks, or smaller cash amounts." },
                  { rank: "Everyone",  medal: "✨", label: "Participation", color: "border-border/50 bg-card/30 text-muted-foreground/80",    body: "All waitlist members get early access to the product before the general public, regardless of rank." },
                ].map((tier) => (
                  <div key={tier.rank} className={cn("flex items-start gap-4 rounded-xl border px-4 py-3", tier.color.split(" ").slice(0, 2).join(" ") + " border-border/40")}>
                    <span className="text-xl shrink-0">{tier.medal}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold border", tier.color)}>
                          {tier.rank}
                        </Badge>
                        <span className="text-xs font-semibold text-muted-foreground">{tier.label}</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/60">{tier.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <Separator className="bg-muted/60" />

        {/* ═══════════════════════════════════════════════════════════
            WHERE TO SHARE
            ═══════════════════════════════════════════════════════════ */}
        <section id="strategy">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <SectionBadge><Flame size={11} /> Winning strategy</SectionBadge>
              <SectionHeading sub="The difference between 1 referral and 50 referrals is almost always about where and how you share.">
                How to get the most referrals
              </SectionHeading>
            </div>

            {/* Channel breakdown */}
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: <Twitter size={16} className="text-sky-400" />,
                  channel: "Twitter / X",
                  difficulty: "⭐ Easy",
                  potential: "🚀 High",
                  color: "border-sky-500/20",
                  tips: [
                    "Write a genuine take on why you're excited about the product",
                    "Tag the product's official account for potential retweets",
                    "Add your referral link in the first tweet — don't make people click through",
                    "Post at peak times: 9–10am and 5–7pm in your timezone",
                    "Retweet your original post a few days later with updated context",
                  ],
                },
                {
                  icon: <Users size={16} className="text-indigo-400" />,
                  channel: "Discord & Slack",
                  difficulty: "⭐⭐ Medium",
                  potential: "🚀🚀 Very High",
                  color: "border-indigo-500/20",
                  tips: [
                    "Find relevant servers (tech communities, startup groups, niche interest communities)",
                    "Read the rules — many allow product sharing in a dedicated channel",
                    "Don't just drop a link — add context explaining why you joined",
                    "Engage in the community first before posting",
                    "Join multiple servers in the product's category",
                  ],
                },
                {
                  icon: <Mail size={16} className="text-amber-400" />,
                  channel: "Email & Newsletters",
                  difficulty: "⭐⭐ Medium",
                  potential: "🚀🚀🚀 Highest",
                  color: "border-amber-500/20",
                  tips: [
                    "Email converts better than any social platform",
                    "Forward to specific friends you think would love this product",
                    "If you have a newsletter, even a small one, add a product mention",
                    "Personal emails ('Hey [name], thought you'd like this') outperform mass sends",
                    "Subject line: '[Product name] — early access before launch'",
                  ],
                },
                {
                  icon: <Smartphone size={16} className="text-emerald-400" />,
                  channel: "WhatsApp & Telegram",
                  difficulty: "⭐ Easy",
                  potential: "🚀🚀 Very High",
                  color: "border-emerald-500/20",
                  tips: [
                    "Group chats with relevant communities are goldmines",
                    "Direct message close friends who match the product's audience",
                    "Share to your Status/Story for broad reach",
                    "Tech-focused groups (developer communities, startup groups) convert best",
                    "Keep your message short and personal — 2–3 sentences max",
                  ],
                },
                {
                  icon: <Layers size={16} className="text-rose-400" />,
                  channel: "Reddit",
                  difficulty: "⭐⭐⭐ Hard",
                  potential: "🚀🚀🚀 Highest",
                  color: "border-rose-500/20",
                  tips: [
                    "Find subreddits related to the product's category",
                    "Read the rules carefully — most subreddits ban direct promotion",
                    "Write a genuine post about the problem the product solves, mention you joined",
                    "Never post identical content to multiple subreddits",
                    "Build karma in a subreddit before posting product-related content",
                  ],
                },
                {
                  icon: <BarChart2 size={16} className="text-violet-400" />,
                  channel: "LinkedIn",
                  difficulty: "⭐⭐ Medium",
                  potential: "🚀🚀 Very High",
                  color: "border-violet-500/20",
                  tips: [
                    "Best for B2B and professional tools",
                    "Write a short post explaining the problem + your excitement about the solution",
                    "Tag people in your network who work in relevant industries",
                    "LinkedIn posts with personal stories get 3× more engagement",
                    "Comment thoughtfully on related posts to get profile views",
                  ],
                },
              ].map((ch) => (
                <div key={ch.channel} className={cn("flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/30 p-5", ch.color)}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {ch.icon}
                      <span className="text-sm font-bold text-foreground/90">{ch.channel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
                      <span>{ch.difficulty}</span>
                      <span>·</span>
                      <span>{ch.potential}</span>
                    </div>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {ch.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground/80">
                        <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-500/70" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Golden rule */}
            <GlowCard color="amber">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-amber-400" />
                  <p className="text-base font-bold text-amber-300">The golden rule of referrals</p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <strong className="text-foreground/90">Only share products you genuinely believe in.</strong> People can tell when a recommendation is authentic vs. when you're just chasing a prize. Authentic recommendations from a trusted source convert at 5–10× the rate of generic "check this out" posts. The best referrers are people who would have talked about the product anyway — LaunchForge just rewards them for it.
                </p>
              </div>
            </GlowCard>

            {/* Timing strategy */}
            <Card>
              <h3 className="mb-5 text-sm font-bold text-foreground/90">Timing matters more than you think</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: <Clock size={16} className="text-indigo-400" />,
                    phase: "Day 1: Join early",
                    body: "Join the waitlist the moment you discover it. Your join date is your permanent tiebreaker — if you and someone else reach the same referral count, you rank higher if you joined first.",
                    accent: "border-indigo-500/15 bg-indigo-500/6",
                  },
                  {
                    icon: <TrendingUp size={16} className="text-emerald-400" />,
                    phase: "Week 1–2: Build momentum",
                    body: "Share in your primary channels. Don't do everything at once — spread it out so you stay top-of-mind. Post, wait for it to settle, then share somewhere new.",
                    accent: "border-emerald-500/15 bg-emerald-500/6",
                  },
                  {
                    icon: <Flame size={16} className="text-rose-400" />,
                    phase: "Final 48h: Final push",
                    body: "The biggest leaderboard shifts happen in the final days. Make a final push, re-share everywhere, and remind people who clicked your link earlier but didn't sign up.",
                    accent: "border-rose-500/15 bg-rose-500/6",
                  },
                ].map((p) => (
                  <div key={p.phase} className={cn("flex flex-col gap-2 rounded-xl border p-4", p.accent)}>
                    {p.icon}
                    <p className="text-xs font-bold text-foreground/90">{p.phase}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground/80">{p.body}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <Separator className="bg-muted/60" />

        {/* ═══════════════════════════════════════════════════════════
            GETTING PAID
            ═══════════════════════════════════════════════════════════ */}
        <section id="getting-paid">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <SectionBadge><DollarSign size={11} /> Getting paid</SectionBadge>
              <SectionHeading sub="What actually happens after the waitlist closes and how you receive your prize.">
                Receiving your prize
              </SectionHeading>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-foreground/80">The prize delivery process</h3>
                {[
                  { n: "1", title: "Waitlist closes", body: "The owner locks the leaderboard. Your final rank is recorded. This happens automatically on the expiry date or manually when the owner triggers it." },
                  { n: "2", title: "Winner verification", body: "The owner reviews the top referrers and confirms the winners. They may reach out via email to verify your identity and confirm prize details." },
                  { n: "3", title: "Prize contact", body: "The owner contacts you at the email you signed up with. For cash prizes, they'll ask for your payment details (PayPal, bank, etc.). For gift cards, they'll send the code directly." },
                  { n: "4", title: "Prize delivered", body: "Cash prizes typically take 1–5 business days to land. Gift card codes arrive instantly. Lifetime access is granted through the product's account system." },
                ].map((s) => (
                  <div key={s.n} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-[10px] font-black text-muted-foreground/80 mt-0.5">
                      {s.n}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground/80">{s.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground/60">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <GlowCard color="rose">
                  <div className="flex items-start gap-2">
                    <Shield size={15} className="mt-0.5 shrink-0 text-rose-400" />
                    <div>
                      <p className="text-sm font-bold text-rose-300">Know your rights</p>
                      <div className="mt-2 flex flex-col gap-2 text-xs leading-relaxed text-muted-foreground/80">
                        <p>LaunchForge displays prizes exactly as the owner sets them. Prizes are funded and delivered by the product owner, not by LaunchForge.</p>
                        <p>If you win a prize and don't receive it within 7 days of the waitlist closing, contact LaunchForge support. We document prize commitments and can help mediate.</p>
                        <p>Never send money or personal financial details unless you've verified the request came from a legitimate product owner you trust.</p>
                      </div>
                    </div>
                  </div>
                </GlowCard>

                <Card>
                  <h3 className="mb-3 text-xs font-bold text-muted-foreground">Prize payment methods supported</h3>
                  <div className="flex flex-wrap gap-2">
                    {["PayPal", "Wise", "Bank transfer", "Crypto", "Amazon gift card", "Apple gift card", "Google Play", "Direct coupon code"].map((m) => (
                      <Badge key={m} className="border-zinc-700/60 bg-muted/40 text-xs text-muted-foreground/80">{m}</Badge>
                    ))}
                  </div>
                  <p className="mt-3 text-[10px] text-muted-foreground/40">Payment method is agreed between you and the product owner. LaunchForge does not process payments.</p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <Separator className="bg-muted/60" />

        {/* ═══════════════════════════════════════════════════════════
            REAL NUMBERS
            ═══════════════════════════════════════════════════════════ */}
        <section>
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <SectionBadge><Medal size={11} /> Real numbers</SectionBadge>
              <SectionHeading sub="What realistic referral counts can achieve. All numbers are illustrative based on typical waitlist performance.">
                What can you realistically earn?
              </SectionHeading>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/60">
              <div className="grid grid-cols-4 border-b border-border/60 bg-card/60 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                <span>Referrals</span>
                <span>Typical rank</span>
                <span>Likely prize</span>
                <span>Effort needed</span>
              </div>
              {[
                { refs: "0",      rank: "Mid-queue",  prize: "Early access",           effort: "Just signed up",           color: "" },
                { refs: "1–3",    rank: "#50–#100",   prize: "Queue boost",             effort: "Tell 3 close friends",     color: "" },
                { refs: "5–10",   rank: "#20–#40",    prize: "Possible discount tier",  effort: "Post once on social",      color: "bg-zinc-900/20" },
                { refs: "10–20",  rank: "#10–#20",    prize: "Discount or small prize", effort: "Share across 2–3 channels",color: "" },
                { refs: "20–35",  rank: "#4–#10",     prize: "Lifetime access",         effort: "Consistent sharing, 1 week",color:"bg-zinc-900/20" },
                { refs: "35–50",  rank: "#2–#3",      prize: "$300+ gift card",         effort: "Community posts + email",  color: "" },
                { refs: "50+",    rank: "#1",         prize: "$500–$2,000 cash",        effort: "Full campaign, audience",  color: "bg-amber-500/5" },
              ].map((row) => (
                <div key={row.refs} className={cn("grid grid-cols-4 items-center border-b border-border/40 px-5 py-3.5 last:border-0", row.color)}>
                  <span className="text-sm font-bold tabular-nums text-foreground/90">{row.refs}</span>
                  <span className="text-xs text-muted-foreground">{row.rank}</span>
                  <span className="text-xs text-muted-foreground">{row.prize}</span>
                  <span className="text-xs text-muted-foreground/60">{row.effort}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground/40">
              These ranges are estimates based on typical waitlist competition. Results vary significantly by product popularity and how many other people are referring.
            </p>
          </div>
        </section>

        <Separator className="bg-muted/60" />

        {/* ═══════════════════════════════════════════════════════════
            FAQ
            ═══════════════════════════════════════════════════════════ */}
        <section id="faq">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <SectionBadge><HelpCircle size={11} /> FAQ</SectionBadge>
              <SectionHeading>Frequently asked questions</SectionHeading>
            </div>

            <Accordion type="single" collapsible className="flex flex-col gap-3">
              {[
                {
                  q: "Do I need to buy anything to participate?",
                  a: "Absolutely not. LaunchForge is 100% free to use. You never need to purchase anything, pay any fees, or provide payment information to join waitlists and win prizes. The prizes are funded entirely by the product owners, not by you.",
                },
                {
                  q: "How many waitlists can I join at once?",
                  a: "There's no limit. You can join as many waitlists as you like simultaneously. However, you'll get the best results by focusing your energy on 1–2 products at a time rather than spreading yourself thin. Depth beats breadth when it comes to referrals.",
                },
                {
                  q: "What happens if two people refer the same friend?",
                  a: "Whoever's link was used last wins. If your friend clicked two different referral links, the one they used to actually complete the signup form is counted. If your friend closes the tab and comes back later without a referral link, it counts as a direct signup (no referral).",
                },
                {
                  q: "Can I refer the same person multiple times?",
                  a: "No. Each email address can only be on a waitlist once. Once someone is on the list, they can't join again. However, you can refer as many different people as you want — there's no upper limit on your referral count.",
                },
                {
                  q: "What if the product never launches?",
                  a: "Unfortunately, not all products make it to launch. If a waitlist closes without the product launching, prize obligations depend on the owner. LaunchForge recommends only heavily promoting products from founders with a clear track record. We flag waitlists where the owner has fulfilled previous prize commitments.",
                },
                {
                  q: "Is my email address safe?",
                  a: "LaunchForge does not sell or share email addresses. Your email is shared with the waitlist owner for the purpose of the product launch (they'll email you when it goes live). You can unsubscribe from any waitlist at any time. Read the privacy policy of each product before joining.",
                },
                {
                  q: "What's the maximum prize I can win?",
                  a: "There's no cap set by LaunchForge. Prizes are set entirely by the product owner and can be anything from $50 gift cards to $5,000 cash prizes. We've seen enterprise product launches with significant cash rewards for the top referrer. The prize amount is always shown clearly on the waitlist page before you join.",
                },
                {
                  q: "Can I see who I'm competing against?",
                  a: "Yes. Every waitlist has a public leaderboard showing the top referrers with masked names (e.g. 'Sarah K.') and their referral counts. This lets you benchmark your progress. You can also look up your own position using the 'Find my rank' tool by entering your email.",
                },
                {
                  q: "Do referrals from different countries count?",
                  a: "Yes. LaunchForge is global. Referrals from any country count equally. Some prize types (like cash transfers) may have geographic restrictions depending on the owner's payment method — always read the prize description carefully.",
                },
                {
                  q: "What if I joined late and the top spots are already taken?",
                  a: "Late joiners still have a chance — referral campaigns can see explosive growth in the final days. Focus on getting referrals quickly rather than worrying about current rankings. Also look for newer waitlists where the competition hasn't had time to accumulate — the explore page is sorted by trending (recent joins) by default.",
                },
              ].map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="rounded-2xl border border-border/60 bg-card/30 px-5"
                >
                  <AccordionTrigger className="py-4 text-sm font-semibold text-foreground/90 hover:text-foreground hover:no-underline [&[data-state=open]]:text-indigo-300">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground/80">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <Separator className="bg-muted/60" />

        {/* ═══════════════════════════════════════════════════════════
            CTA
            ═══════════════════════════════════════════════════════════ */}
        <section>
          <GlowCard color="indigo" className="text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/15">
                <Rocket size={28} className="text-indigo-400" />
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-3xl font-black tracking-tight text-foreground">
                  Ready to start earning?
                </h2>
                <p className="mx-auto max-w-lg text-base leading-relaxed text-muted-foreground/80">
                  Browse live products, join the ones you're excited about, and start referring.
                  Your first referral is only one share away.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/explore">
                  <Button className="gap-2 bg-indigo-600 px-8 py-3 text-sm font-bold text-white hover:bg-indigo-500">
                    Browse open waitlists
                    <ArrowRight size={14} />
                  </Button>
                </Link>
                <Link href="/explore?filter=prizes">
                  <Button variant="outline" className="gap-2 border-zinc-700/80 bg-transparent px-8 py-3 text-sm text-muted-foreground hover:border-zinc-600 hover:bg-muted/60 hover:text-foreground/90">
                    <Trophy size={14} className="text-amber-400" />
                    View prize pools
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground/60">
                {[
                  "✓ Free forever",
                  "✓ No credit card",
                  "✓ Real prizes",
                  "✓ Join in 30 seconds",
                ].map((f) => (
                  <span key={f}>{f}</span>
                ))}
              </div>
            </div>
          </GlowCard>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <Zap size={13} className="text-white" />
            </div>
            <span className="text-sm font-black tracking-tight text-foreground/80">LaunchForge</span>
          </div>
          <p className="text-xs text-muted-foreground/60 max-w-sm">
            The viral waitlist platform for product launches. Helping founders grow and early believers earn since 2025.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground/40">
            <Link href="#"          className="hover:text-muted-foreground/80 transition-colors">Explore</Link>
            <Link href="#"      className="hover:text-muted-foreground/80 transition-colors">How to earn</Link>
            <Link href="#"          className="hover:text-muted-foreground/80 transition-colors">Privacy</Link>
            <Link href="#"            className="hover:text-muted-foreground/80 transition-colors">Terms</Link>
            <a href="mailto:support@launchforge.app" className="hover:text-muted-foreground/80 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Rocket({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  );
}