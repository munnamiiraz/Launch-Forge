"use client";

import { useState } from "react";
import { Send, Eye, ShieldCheck, Mail, Sparkles, Loader2, CheckCircle2, AlertCircle, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";

export default function NewsletterAdminPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastBlast, setLastBlast] = useState<{ id: string, count: number } | null>(null);

  const handleTestSend = async () => {
    if (!subject || !body) return toast.error("Please fill in subject and body");
    setIsSending(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/newsletter/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json();
      if (data.success) toast.success("Test email sent to your inbox!");
      else toast.error(data.message);
    } catch (err) {
      toast.error("Failed to send test email");
    } finally {
      setIsSending(false);
    }
  };

  const handleBroadcast = async () => {
    if (!subject || !body) return toast.error("Please fill in subject and body");
    
    const confirm = window.confirm("🚨 WARNING: You are about to send this email to ALL subscribers. This action cannot be undone. Proceed?");
    if (!confirm) return;

    setIsSending(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/newsletter/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Broadcast started!", { description: "The newsletter is now being enqueued." });
        setLastBlast({ id: data.data.jobId, count: 0 }); // We would need a real count if available
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Critical error during broadcast");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col gap-8 p-6 font-sans">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-heading text-foreground">Newsletter Command Center</h1>
          <p className="text-sm text-muted-foreground">Broadcast updates, news, and insights to your entire user base.</p>
        </div>
        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 font-semibold px-3 py-1">
          ADMIN
        </Badge>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        
        {/* ── Editor Section ──────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader className="border-b border-border/40 pb-4">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold font-heading flex items-center gap-2">
                       <Sparkles size={18} className="text-red-400" />
                       Compose Newsletter
                    </CardTitle>
                    <CardDescription className="text-xs">Use HTML or Markdown for the email body.</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsPreview(!isPreview)}
                    className="gap-2 h-8 text-xs font-medium"
                  >
                    {isPreview ? <Loader2 size={12} /> : <Eye size={12} />}
                    {isPreview ? "Edit Mode" : "Preview Mode"}
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <AnimatePresence mode="wait">
                {isPreview ? (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="min-h-[400px] rounded-xl border border-border/40 bg-white/5 p-8"
                  >
                    <div className="mb-4 pb-4 border-b border-white/10">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Subject</p>
                      <h2 className="text-lg font-bold text-foreground font-heading">{subject || "(No Subject)"}</h2>
                    </div>
                    <div 
                      className="prose prose-invert max-w-none text-muted-foreground/90 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: body || "<p>Email body will appear here...</p>" }}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="editor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Subject Line</label>
                      <Input 
                        placeholder="Weekly Round-up: New Features and More!" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="bg-background/50 text-base font-medium h-11 border-border/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email Content (HTML)</label>
                      <Textarea 
                        placeholder="<h1>Welcome to the update!</h1><p>We've added some amazing things...</p>" 
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="min-h-[400px] bg-background/50 font-mono text-xs leading-relaxed border-border/40"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* ── Control Panel Section ────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="border-border/40 bg-card/30 backdrop-blur-sm sticky top-6">
            <CardHeader>
              <CardTitle className="text-base font-semibold font-heading flex items-center gap-2">
                <ShieldCheck size={18} className="text-red-400" />
                Launch Control
              </CardTitle>
              <CardDescription className="text-xs">Final stage safety protocols.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-3">
                <Button 
                  onClick={handleTestSend}
                  disabled={isSending || !subject || !body}
                  variant="outline" 
                  className="w-full h-11 gap-3 border-border/40 hover:bg-white/5 text-sm font-medium transition-all"
                >
                  {isSending ? <Loader2 className="animate-spin" size={14} /> : <Mail size={14} />}
                  Send Test Preview
                </Button>
                <p className="text-[10px] text-center text-muted-foreground px-4 italic">
                  Always send a test to yourself first.
                </p>
              </div>

              <div className="h-px bg-border/40" />

              <div className="space-y-3">
                <Button 
                  onClick={handleBroadcast}
                  disabled={isSending || !subject || !body}
                  className="w-full h-12 gap-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-sm transition-all"
                >
                  {isSending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  INITIALIZE BROADCAST
                </Button>
                <div className="flex items-start gap-2 rounded-lg bg-red-500/5 p-3 border border-red-500/10">
                   <AlertCircle size={12} className="text-red-400 mt-0.5 shrink-0" />
                   <p className="text-[10px] text-red-300/80 leading-normal">
                     Broadcast will be sent to all subscribers using the distributed worker system.
                   </p>
                </div>
              </div>

              {lastBlast && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wider">Broadcast Live</span>
                     <CheckCircle2 size={12} className="text-green-500" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Job ID: <code className="text-foreground font-mono">{lastBlast.id}</code>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Status: <span className="text-green-400 font-semibold italic">Enqueued</span>
                  </p>
                </motion.div>
              )}

            </CardContent>
          </Card>

          <Card className="border-border/40 bg-zinc-950/20">
             <CardContent className="p-4 flex items-center gap-4">
                <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-white/5">
                   <Activity size={16} className="text-muted-foreground" />
                </div>
                <div>
                   <p className="text-xs font-semibold text-foreground">Infrastructure Monitoring</p>
                   <p className="text-[10px] text-muted-foreground">Check queue vitals for real-time success rates.</p>
                </div>
             </CardContent>
          </Card>

        </div>
        
      </div>
    </div>
  );
}
