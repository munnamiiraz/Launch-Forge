"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Globe, Clock, Camera,
  Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Lock,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Button }    from "@/src/components/ui/button";
import { Input }     from "@/src/components/ui/input";
import { Label }     from "@/src/components/ui/label";
import { Textarea }  from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/src/components/ui/select";
import { cn }    from "@/src/lib/utils";
import { updateProfileAction, changePasswordAction } from "@/src/services/settings/settings.actions";
import { TIMEZONES } from "@/src/components/module/settings/_types";
import type { ProfileForm } from "@/src/components/module/settings/_types";

interface ProfileSectionProps {
  profile: ProfileForm;
}

function SaveBar({
  isPending, success, error, onSave, onReset,
}: {
  isPending: boolean;
  success:   boolean;
  error:     string | null;
  onSave:    () => void;
  onReset:   () => void;
}) {
  return (
    <AnimatePresence>
      {(success || error) && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
            success
              ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-400"
              : "border-red-500/25 bg-red-500/8 text-red-400",
          )}
        >
          {success
            ? <><CheckCircle2 size={13} />Saved successfully.</>
            : <><AlertCircle  size={13} />{error}</>
          }
        </motion.div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={isPending}
          className="text-xs text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/80"
        >
          Reset
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={isPending}
          size="sm"
          className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {isPending
            ? <><Loader2 size={12} className="animate-spin" />Saving…</>
            : "Save changes"
          }
        </Button>
      </div>
    </AnimatePresence>
  );
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  const [form,      setForm]    = useState<ProfileForm>(profile);
  const [dirty,     setDirty]   = useState(false);
  const [success,   setSuccess] = useState(false);
  const [error,     setError]   = useState<string | null>(null);
  const [isPending, startTx]    = useTransition();

  // Password section
  const [pwForm,     setPwForm]    = useState({ current: "", next: "", confirm: "" });
  const [showPw,     setShowPw]    = useState(false);
  const [pwSuccess,  setPwSuccess] = useState(false);
  const [pwError,    setPwError]   = useState<string | null>(null);
  const [pwPending,  startPwTx]   = useTransition();

  const set = (k: keyof ProfileForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
    setSuccess(false);
  };

  const handleSave = () => {
    setError(null);
    startTx(async () => {
      const r = await updateProfileAction(form);
      if (r.success) { setSuccess(true); setDirty(false); setTimeout(() => setSuccess(false), 3000); }
      else setError(r.message);
    });
  };

  const handlePwSave = () => {
    setPwError(null);
    if (!pwForm.current) { setPwError("Current password is required."); return; }
    if (pwForm.next.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords do not match."); return; }
    startPwTx(async () => {
      const r = await changePasswordAction(pwForm.current, pwForm.next);
      if (r.success) {
        setPwSuccess(true); setPwForm({ current: "", next: "", confirm: "" });
        setTimeout(() => setPwSuccess(false), 3000);
      } else setPwError(r.message);
    });
  };

  const initials = form.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-6" id="profile">

      {/* ── Identity ────────────────────────────────────────── */}
      <Card className="relative overflow-hidden border-border/80 bg-card/40">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        <CardHeader className="border-b border-border/60 px-5 py-4">
          <p className="text-sm font-semibold text-foreground/90">Profile</p>
          <p className="text-[11px] text-muted-foreground/60">Your public identity on LaunchForge</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 p-5">

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 rounded-2xl">
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-black text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-muted-foreground hover:bg-zinc-700 transition-colors">
                <Camera size={11} />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/80">{form.name || "Your name"}</p>
              <p className="text-xs text-muted-foreground/60">{form.email}</p>
              <p className="mt-1 text-[10px] text-muted-foreground/40">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>

          <Separator className="bg-muted/60" />

          {/* Name + Email */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="name" label="Full name" icon={<User size={12} />}
              value={form.name} onChange={(v) => set("name", v)}
              placeholder="Ada Lovelace"
            />
            <Field
              id="email" label="Email address" icon={<Mail size={12} />}
              value={form.email} onChange={(v) => set("email", v)}
              placeholder="ada@example.com" type="email"
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bio" className="text-xs font-medium text-muted-foreground">
              Bio <span className="text-muted-foreground/40">(optional)</span>
            </Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Tell your team a bit about yourself…"
              rows={2}
              className="resize-none border-zinc-800 bg-card/60 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40"
            />
            <p className="text-right text-[10px] text-muted-foreground/40">{form.bio.length}/160</p>
          </div>

          {/* Website + Timezone */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="website" label="Website" icon={<Globe size={12} />}
              value={form.website} onChange={(v) => set("website", v)}
              placeholder="https://example.com"
            />
            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock size={12} className="text-muted-foreground/60" />Timezone
              </Label>
              <Select
                value={form.timezone}
                onValueChange={(v) => set("timezone", v)}
              >
                <SelectTrigger className="border-zinc-800 bg-card/60 text-sm text-foreground focus:ring-zinc-600/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-background">
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz} className="text-xs text-foreground/80">
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Save */}
          {dirty && (
            <div className="flex items-center justify-between border-t border-border/60 pt-4">
              <p className="text-xs text-muted-foreground/60">You have unsaved changes</p>
              <SaveBar
                isPending={isPending} success={success} error={error}
                onSave={handleSave} onReset={() => { setForm(profile); setDirty(false); }}
              />
            </div>
          )}
          {!dirty && (success || error) && (
            <SaveBar
              isPending={isPending} success={success} error={error}
              onSave={handleSave} onReset={() => {}}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Change password ──────────────────────────────────── */}
      <Card className="relative overflow-hidden border-border/80 bg-card/40">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <CardHeader className="border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-muted-foreground/60" />
            <p className="text-sm font-semibold text-foreground/90">Change password</p>
          </div>
          <p className="text-[11px] text-muted-foreground/60">
            Use a strong password with letters, numbers, and symbols.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-5">
          <PasswordField
            id="pw-current" label="Current password"
            value={pwForm.current} onChange={(v) => setPwForm((f) => ({ ...f, current: v }))}
            show={showPw} onToggle={() => setShowPw((s) => !s)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordField
              id="pw-new" label="New password"
              value={pwForm.next} onChange={(v) => setPwForm((f) => ({ ...f, next: v }))}
              show={showPw} onToggle={() => setShowPw((s) => !s)}
            />
            <PasswordField
              id="pw-confirm" label="Confirm new password"
              value={pwForm.confirm} onChange={(v) => setPwForm((f) => ({ ...f, confirm: v }))}
              show={showPw} onToggle={() => setShowPw((s) => !s)}
            />
          </div>

          {/* Strength hints */}
          {pwForm.next && (
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "8+ chars",    ok: pwForm.next.length >= 8 },
                { label: "Uppercase",   ok: /[A-Z]/.test(pwForm.next) },
                { label: "Lowercase",   ok: /[a-z]/.test(pwForm.next) },
                { label: "Number",      ok: /\d/.test(pwForm.next) },
                { label: "Symbol",      ok: /[^a-zA-Z0-9]/.test(pwForm.next) },
              ].map((r) => (
                <span
                  key={r.label}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    r.ok
                      ? "bg-emerald-500/12 text-emerald-400"
                      : "bg-muted/60 text-muted-foreground/60",
                  )}
                >
                  {r.ok ? "✓" : "·"} {r.label}
                </span>
              ))}
            </div>
          )}

          <AnimatePresence>
            {(pwSuccess || pwError) && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
                  pwSuccess
                    ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-400"
                    : "border-red-500/25 bg-red-500/8 text-red-400",
                )}
              >
                {pwSuccess
                  ? <><CheckCircle2 size={13} />Password changed successfully.</>
                  : <><AlertCircle  size={13} />{pwError}</>
                }
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end">
            <Button
              onClick={handlePwSave}
              disabled={pwPending}
              size="sm"
              className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {pwPending
                ? <><Loader2 size={12} className="animate-spin" />Saving…</>
                : "Update password"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function Field({
  id, label, icon, value, onChange, placeholder, type = "text",
}: {
  id: string; label: string; icon: React.ReactNode;
  value: string; onChange: (v: string) => void;
  placeholder: string; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="text-muted-foreground/60">{icon}</span>
        {label}
      </Label>
      <Input
        id={id} type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="border-zinc-800 bg-card/60 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40"
      />
    </div>
  );
}

function PasswordField({
  id, label, value, onChange, show, onToggle,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; show: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          id={id} type={show ? "text" : "password"} value={value}
          placeholder="••••••••"
          onChange={(e) => onChange(e.target.value)}
          className="border-zinc-800 bg-card/60 pr-9 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground"
        >
          {show ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>
    </div>
  );
}