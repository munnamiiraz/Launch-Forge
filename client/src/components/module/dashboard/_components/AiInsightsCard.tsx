"use client";

import { useState } from "react";
import { Sparkles, Lock, Loader2, ArrowRight, BrainCircuit, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { useWorkspace } from "@/src/provider/WorkspaceProvider";
import { authFetch } from "@/src/lib/axios/authFetch";
import { Card } from "@/src/components/ui/card";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export function AiInsightsCard() {
  const { activeWorkspace } = useWorkspace();
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = activeWorkspace?.plan || "FREE";
  const isLocked = plan === "FREE" || plan === "STARTER";

  const fetchInsights = async () => {
    if (isLocked || !activeWorkspace) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${BASE_URL}/ai-chat/insights/${activeWorkspace.id}`);
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.message || "Failed to generate insights");
      setInsight(json.data.insights);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-border bg-card dark:bg-card/40 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <BrainCircuit size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Business Insights</h3>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">Premium Feature</p>
          </div>
        </div>
        
        {!insight && !loading && !isLocked && (
          <Button 
            onClick={fetchInsights}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 gap-2"
          >
            <Sparkles size={13} />
            Generate Advice
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isLocked ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted border border-border text-amber-600 dark:text-amber-500/80">
              <Lock size={18} />
            </div>
            <p className="text-sm font-medium text-foreground/90">Insights are locked</p>
            <p className="mt-1 text-xs text-muted-foreground/60 max-w-[240px]">
              Upgrade to <span className="text-indigo-400 font-semibold">Pro</span> to get AI-powered marketing advice specifically for your waitlists.
            </p>
            <Button variant="link" className="mt-2 text-indigo-400 text-xs h-auto p-0 gap-1">
              Upgrade now <ArrowRight size={12} />
            </Button>
          </motion.div>
        ) : loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-10"
          >
            <Loader2 size={24} className="animate-spin text-indigo-500 mb-3" />
            <p className="text-xs text-muted-foreground animate-pulse">Analyzing your workspace data...</p>
          </motion.div>
        ) : insight ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose dark:prose-invert prose-xs max-w-none"
          >
            <div className={cn(
              "rounded-lg bg-card border border-border p-4 text-[13px] leading-relaxed text-foreground/80",
              "max-h-[300px] overflow-y-auto custom-scrollbar shadow-sm"
            )}>
              <ReactMarkdown 
                components={{
                  h3: ({node, ...props}: any) => <h3 className="text-indigo-400 font-bold mt-0 mb-2 flex items-center gap-2" {...props}><Lightbulb size={14} /></h3>,
                  p: ({node, ...props}: any) => <p className="mb-3 last:mb-0" {...props} />,
                  ul: ({node, ...props}: any) => <ul className="list-disc ml-4 space-y-1 mb-3" {...props} />,
                  li: ({node, ...props}: any) => <li className="text-muted-foreground" {...props} />,
                }}
              >
                {insight}
              </ReactMarkdown>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setInsight(null)}
              className="mt-3 text-[10px] text-muted-foreground hover:text-foreground h-auto p-1"
            >
              Regenerate?
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center opacity-40">
             <Sparkles size={32} className="text-border mb-3" />
             <p className="text-xs text-muted-foreground">Click the button to generate personalized advice based on your 30-day performance.</p>
          </div>
        )}
      </AnimatePresence>

      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-600/5 blur-2xl dark:block hidden" />
    </Card>
  );
}
