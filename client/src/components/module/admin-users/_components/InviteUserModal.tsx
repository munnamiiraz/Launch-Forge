"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Loader2, CheckCircle2, AlertCircle, Mail, Shield } from "lucide-react";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/src/components/ui/dialog";
import { Button }   from "@/src/components/ui/button";
import { Input }    from "@/src/components/ui/input";
import { Label }    from "@/src/components/ui/label";
import { cn }       from "@/src/lib/utils";
import { inviteUserAction } from "@/src/services/admin-users/users.actions";

interface InviteUserModalProps {
  open:    boolean;
  onClose: () => void;
}

export function InviteUserModal({ open, onClose }: InviteUserModalProps) {
  const [email,     setEmail]     = useState("");
  const [role,      setRole]      = useState<"USER" | "ADMIN">("USER");
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [isPending, startTx]      = useTransition();

  const reset = () => { setEmail(""); setRole("USER"); setSuccess(false); setError(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError("Email is required."); return; }
    startTx(async () => {
      const r = await inviteUserAction(email.trim(), role);
      if (r.success) {
        setSuccess(true);
        setTimeout(() => { onClose(); reset(); }, 1400);
      } else {
        setError(r.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); reset(); } }}>
      <DialogContent className="border-zinc-800/80 bg-zinc-950/98 p-0 shadow-2xl shadow-black/60 backdrop-blur-xl sm:max-w-md">
        <div className="absolute inset-x-0 top-0 h-px rounded-t-lg bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

        <DialogHeader className="border-b border-zinc-800/60 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10">
              <UserPlus size={16} className="text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-zinc-100">
                Invite user
              </DialogTitle>
              <p className="mt-0.5 text-xs text-zinc-500">
                Send an invitation email to add someone to LaunchForge.
              </p>
            </div>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 px-6 py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10"
              >
                <CheckCircle2 size={26} className="text-emerald-400" />
              </motion.div>
              <div>
                <p className="text-base font-semibold text-zinc-100">Invitation sent!</p>
                <p className="mt-1 text-sm text-zinc-500">{email}</p>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 px-6 py-5"
            >
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invite-email" className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                  <Mail size={11} className="text-zinc-600" />
                  Email address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  autoFocus
                  disabled={isPending}
                  className="border-zinc-800 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40"
                />
              </div>

              {/* Role */}
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                  <Shield size={11} className="text-zinc-600" />
                  Role
                </Label>
                <div className="flex gap-2">
                  {(["USER", "ADMIN"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "flex flex-1 flex-col gap-0.5 rounded-xl border p-3 text-left transition-all duration-150",
                        role === r
                          ? r === "ADMIN"
                            ? "border-red-500/40 bg-red-500/8 text-red-300"
                            : "border-indigo-500/40 bg-indigo-500/8 text-indigo-300"
                          : "border-zinc-800/80 bg-zinc-900/30 text-zinc-500 hover:border-zinc-700/60",
                      )}
                    >
                      <span className="text-xs font-semibold">{r === "ADMIN" ? "Admin" : "User"}</span>
                      <span className="text-[10px] opacity-70">
                        {r === "ADMIN"
                          ? "Full platform access"
                          : "Standard account access"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400"
                  >
                    <AlertCircle size={13} />{error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buttons */}
              <div className="flex items-center gap-3 pb-1">
                <Button
                  type="button" variant="ghost" size="sm"
                  onClick={() => { onClose(); reset(); }}
                  className="flex-1 text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit" size="sm" disabled={isPending}
                  className="group relative flex-[2] overflow-hidden bg-red-600 font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                  {isPending
                    ? <><Loader2 size={14} className="animate-spin" />Sending…</>
                    : <><UserPlus size={14} />Send invitation</>
                  }
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}