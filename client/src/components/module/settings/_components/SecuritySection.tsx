"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Monitor, Smartphone, Globe, Key,
  Trash2, Plus, Eye, EyeOff, Copy, CheckCircle2,
  AlertCircle, Loader2, Clock, MapPin, Lock,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Button }    from "@/src/components/ui/button";
import { Input }     from "@/src/components/ui/input";
import { Label }     from "@/src/components/ui/label";
import { Badge }     from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { cn }    from "@/src/lib/utils";
import { revokeSessionAction, createApiKeyAction, revokeApiKeyAction } from "@/src/services/settings/settings.actions";
import type { ActiveSession, ApiKey } from "@/src/components/module/settings/_types";

interface SecuritySectionProps {
  sessions:     ActiveSession[];
  apiKeys:      ApiKey[];
  hasTwoFactor: boolean;
}

export function SecuritySection({ sessions: initialSessions, apiKeys: initialKeys, hasTwoFactor }: SecuritySectionProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [apiKeys,  setApiKeys]  = useState(initialKeys);

  // New API key form
  const [keyName,    setKeyName]    = useState("");
  const [newKey,     setNewKey]     = useState<string | null>(null);
  const [keyVisible, setKeyVisible] = useState(true);
  const [keyCopied,  setKeyCopied]  = useState(false);
  const [keyError,   setKeyError]   = useState<string | null>(null);
  const [keyPending, startKeyTx]    = useTransition();

  const handleRevokeSession = (id: string) => {
    setSessions((s) => s.filter((x) => x.id !== id));
    revokeSessionAction(id);
  };

  const handleCreateKey = () => {
    if (!keyName.trim()) { setKeyError("Key name is required."); return; }
    setKeyError(null);
    startKeyTx(async () => {
      const r = await createApiKeyAction(keyName.trim(), ["read"]);
      if (r.success && r.key) {
        setNewKey(r.key);
        const stub: ApiKey = {
          id:          `key_${Date.now()}`,
          name:        keyName.trim(),
          prefix:      r.key.slice(0, 12) + "…",
          scopes:      ["read"],
          createdAt:   new Date().toISOString(),
          lastUsedAt:  null,
        };
        setApiKeys((k) => [stub, ...k]);
        setKeyName("");
      }
    });
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys((k) => k.filter((x) => x.id !== id));
    revokeApiKeyAction(id);
  };

  const copyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6" id="security">

      {/* ── Two-factor auth ──────────────────────────────────── */}
      <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-emerald-400" />
            <p className="text-sm font-semibold text-zinc-200">Two-factor authentication</p>
          </div>
          <p className="text-[11px] text-zinc-600">Add an extra layer of security to your account.</p>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border",
                hasTwoFactor
                  ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-400"
                  : "border-zinc-700/60 bg-zinc-800/40 text-zinc-600",
              )}>
                <Lock size={15} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Authenticator app</p>
                <p className="text-xs text-zinc-600">
                  {hasTwoFactor
                    ? "2FA is enabled. Your account is protected."
                    : "Not enabled. Set up an authenticator app for added security."}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={hasTwoFactor ? "outline" : "default"}
              className={cn(
                "text-xs",
                hasTwoFactor
                  ? "border-zinc-700/80 bg-transparent text-zinc-400 hover:bg-zinc-800/60"
                  : "bg-emerald-600 text-white hover:bg-emerald-500",
              )}
            >
              {hasTwoFactor ? "Manage 2FA" : "Enable 2FA"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Active sessions ──────────────────────────────────── */}
      <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
        <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-200">Active sessions</p>
              <p className="text-[11px] text-zinc-600">Devices currently logged into your account.</p>
            </div>
            <Badge className="border-zinc-700/60 bg-zinc-800/40 text-[10px] text-zinc-500">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-zinc-800/40 p-0">
          {sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-900/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-600">
                  {session.device === "Mobile" ? <Smartphone size={14} /> : <Monitor size={14} />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-xs font-medium text-zinc-300">
                      {session.browser} on {session.os}
                    </p>
                    {session.isCurrent && (
                      <Badge className="border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0 text-[9px] text-emerald-400">
                        This device
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-zinc-600">
                    <span className="flex items-center gap-0.5">
                      <MapPin size={9} />{session.location}
                    </span>
                    <span className="text-zinc-800">·</span>
                    <span>{session.ip}</span>
                    <span className="text-zinc-800">·</span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={9} />{session.lastActive}
                    </span>
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevokeSession(session.id)}
                  className="shrink-0 gap-1 text-xs text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/8 hover:text-red-400"
                >
                  <Trash2 size={11} />Revoke
                </Button>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* ── API keys ─────────────────────────────────────────── */}
      <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <Key size={14} className="text-indigo-400" />
            <div>
              <p className="text-sm font-semibold text-zinc-200">API keys</p>
              <p className="text-[11px] text-zinc-600">
                Use API keys to authenticate requests to the LaunchForge API.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-5 p-5">

          {/* New key banner */}
          <AnimatePresence>
            {newKey && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-4"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <p className="text-xs font-semibold text-emerald-300">
                    API key created — copy it now, it won't be shown again.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2">
                  <code className="flex-1 break-all font-mono text-[11px] text-zinc-300">
                    {keyVisible ? newKey : "•".repeat(40)}
                  </code>
                  <button onClick={() => setKeyVisible((v) => !v)} className="shrink-0 text-zinc-600 hover:text-zinc-400">
                    {keyVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={copyKey} className="shrink-0 text-zinc-600 hover:text-zinc-300">
                    {keyCopied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setNewKey(null)}
                  className="self-end text-xs text-zinc-600 hover:bg-zinc-800/40"
                >
                  I've saved it, dismiss
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Create key */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-zinc-400">Create new API key</Label>
            <div className="flex gap-2">
              <Input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g. My integration"
                className="border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40"
                onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
              />
              <Button
                onClick={handleCreateKey}
                disabled={keyPending || !keyName.trim()}
                size="sm"
                className="shrink-0 gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {keyPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                {keyPending ? "Creating…" : "Create key"}
              </Button>
            </div>
            {keyError && <p className="text-xs text-red-400">{keyError}</p>}
            <p className="text-[10px] text-zinc-700">
              Keys have read-only scope by default. Contact support for write access.
            </p>
          </div>

          {/* Existing keys */}
          {apiKeys.length > 0 && (
            <>
              <Separator className="bg-zinc-800/60" />
              <div className="flex flex-col gap-2">
                {apiKeys.map((key, i) => (
                  <motion.div
                    key={key.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-3.5 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Key size={13} className="shrink-0 text-zinc-700" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-zinc-300">{key.name}</p>
                        <p className="font-mono text-[10px] text-zinc-600">{key.prefix}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="hidden flex-col items-end text-right sm:flex">
                        <span className="text-[10px] text-zinc-600">
                          {key.scopes.map((s) => (
                            <Badge key={s} className="border-zinc-800 bg-zinc-800/60 px-1.5 py-0 text-[9px] text-zinc-500">{s}</Badge>
                          ))}
                        </span>
                        <span className="text-[10px] text-zinc-700">
                          {key.lastUsedAt
                            ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                            : "Never used"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRevokeKey(key.id)}
                        className="h-7 w-7 rounded-md text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/8 hover:text-red-400"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}