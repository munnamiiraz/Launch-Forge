"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, Send, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { broadcastNewsletterAction } from "@/src/services/newsletter/newsletter.action";

export default function NewsletterPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !body.trim()) {
      toast.error("Please fill in both subject and message body.");
      return;
    }

    if (subject.length < 5) {
      toast.error("Subject is too short.");
      return;
    }

    setIsLoading(true);
    const result = await broadcastNewsletterAction({ subject, body });
    setIsLoading(false);

    if (result.success) {
      toast.success("Broadcast started! The jobs are now processing in the background.");
      setSubject("");
      setBody("");
    } else {
      toast.error(result.error || "Something went wrong.");
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8 h-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <Mail className="text-red-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Newsletter HQ</h1>
            <p className="text-muted-foreground">Broadcast messages to your entire subscriber list instantly.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main Form ────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <Card className="border-border/60 bg-zinc-900/50 backdrop-blur-sm shadow-2xl overflow-hidden relative group">
            {/* Top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <CardHeader>
              <CardTitle className="text-lg">Compose Broadcast</CardTitle>
              <CardDescription>
                Craft your message. Markdown is supported (depending on your email worker).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBroadcast} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                    Email Subject
                  </Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Exciting updates from LaunchForge! 🚀"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-zinc-950/50 border-white/5 focus-visible:ring-red-500/50 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                    Message Body
                  </Label>
                  <Textarea
                    id="body"
                    placeholder="Write your newsletter content here..."
                    className="min-h-[300px] bg-zinc-950/50 border-white/5 focus-visible:ring-red-500/50 resize-none leading-relaxed"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Send size={18} />
                        </motion.div>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <Send size={18} />
                        Launch Broadcast
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="bg-white/[0.02] border-t border-white/5 text-[10px] text-muted-foreground/40 justify-center">
              Targeting all users with 'newsLadder: true'. Be careful: this action cannot be undone.
            </CardFooter>
          </Card>
        </div>

        {/* ── Tips & Safety ────────────────────────────────────── */}
        <div className="space-y-6">
          <Card className="border-border/40 bg-zinc-900/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-yellow-500/80">
                <AlertCircle size={16} />
                <h3 className="text-sm font-bold uppercase tracking-wide">Safety Check</h3>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-3">
              <p>You are about to send an email to all your active subscribers.</p>
              <ul className="list-disc pl-4 space-y-2">
                <li>Double check for typos in the subject.</li>
                <li>Ensure all links are working.</li>
                <li>Broadcasts are processed in the background; you can monitor status in the <b>Admin Queues</b> dashboard.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-zinc-900/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-blue-500/80">
                <Info size={16} />
                <h3 className="text-sm font-bold uppercase tracking-wide">Pro Tip</h3>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              Using emojis in the subject line can increase open rates by up to <b>15%</b>. Don't overdo it, but a well-placed 🚀 or 🎉 works wonders!
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
