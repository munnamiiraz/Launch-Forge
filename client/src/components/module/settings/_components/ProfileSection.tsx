"use client";

import { useState, useTransition, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Globe, Clock, Camera,
  Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Lock, Shield,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Button }    from "@/src/components/ui/button";
import { Input }     from "@/src/components/ui/input";
import { Label }     from "@/src/components/ui/label";
import { Textarea }  from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/src/components/ui/select";
import { cn }    from "@/src/lib/utils";
import { updateProfileAction, changePasswordAction, uploadAvatarAction } from "@/src/services/settings/settings.actions";
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const set = (k: keyof ProfileForm, v: string) => {
    if (k === "email") return; // email changes are not supported
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
    setSuccess(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, or GIF)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // console.log("[Avatar] Starting upload for file:", file.name, file.size);
      const result = await uploadAvatarAction(file);
      // console.log("[Avatar] Upload result:", result);
      
      if (result.success && result.imageUrl) {
        setForm((f) => ({ ...f, image: result.imageUrl }));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        console.error("[Avatar] Upload failed:", result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error("[Avatar] Upload error:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    setError(null);
    startTx(async () => {
      const r = await updateProfileAction(form);
      if (r.success) { setSuccess(true); setDirty(false); setTimeout(() => setSuccess(false), 3000); }
      else setError(r.message);
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
                {form.image ? (
                  <AvatarImage src={form.image} alt={form.name} className="object-cover" />
                ) : null}
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-black text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-muted-foreground hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Camera size={11} />
                )}
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/80">{form.name || "Your name"}</p>
              <p className="text-xs text-muted-foreground/60">{form.email}</p>
              <p className="mt-1 text-[10px] text-muted-foreground/40">JPG, PNG or GIF. Max 10MB.</p>
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
              disabled
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

      {/* ── Security & Password ───────────────────────────── */}
      <Card className="relative overflow-hidden border-border/80 bg-card/40">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        <CardHeader className="border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-muted-foreground/60" />
            <p className="text-sm font-semibold text-foreground/90">Change password</p>
          </div>
          <p className="text-[11px] text-muted-foreground/60">
            For your security, password management is handled on a dedicated page.
          </p>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/30 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700/60 bg-muted/40 text-muted-foreground/60">
                <Shield size={15} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/90">Authentication security</p>
                <p className="text-xs text-muted-foreground/60">Update your credentials to keep your account safe.</p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-zinc-700/80 bg-transparent text-xs text-muted-foreground hover:bg-muted/60"
            >
              <a href="/reset-password">
                Go to Change Password
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function Field({
  id, label, icon, value, onChange, placeholder, type = "text", disabled = false,
}: {
  id: string; label: string; icon: React.ReactNode;
  value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; disabled?: boolean;
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
        disabled={disabled}
        className="border-zinc-800 bg-card/60 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}

