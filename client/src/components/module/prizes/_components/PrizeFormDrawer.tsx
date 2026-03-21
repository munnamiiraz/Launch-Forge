"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Loader2, CheckCircle2, AlertCircle, Trophy,
  DollarSign, Calendar, Image as ImageIcon,
  AlignLeft, Hash, ArrowRight,
} from "lucide-react";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/src/components/ui/dialog";
import { Button }    from "@/src/components/ui/button";
import { Input }     from "@/src/components/ui/input";
import { Label }     from "@/src/components/ui/label";
import { Textarea }  from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/src/components/ui/select";
import { PrizeTypeSelector } from "./PrizeTypeSelector";
import { PrizePreviewCard }  from "./PrizePreviewCard";
import { createPrizeAction, updatePrizeAction } from "@/src/services/prizes/prizes.action";
import { CURRENCIES, PRIZE_TYPE_META } from "@/src/components/module/prizes/_types";
import type { Prize, CreatePrizeForm } from "@/src/components/module/prizes/_types";

interface PrizeFormDrawerProps {
  open:        boolean;
  onClose:     () => void;
  waitlistId:  string;
  editPrize?:  Prize | null;
  onSaved:     (prize: Prize) => void;
}

const EMPTY_FORM: CreatePrizeForm = {
  title:       "",
  description: "",
  prizeType:   "CASH",
  value:       "",
  currency:    "USD",
  rankFrom:    "1",
  rankTo:      "1",
  imageUrl:    "",
  expiresAt:   "",
};

function buildInitialForm(editPrize?: Prize | null): CreatePrizeForm {
  if (!editPrize) return { ...EMPTY_FORM };
  return {
    title:       editPrize.title,
    description: editPrize.description ?? "",
    prizeType:   editPrize.prizeType,
    value:       editPrize.value?.toString() ?? "",
    currency:    editPrize.currency ?? "USD",
    rankFrom:    editPrize.rankFrom.toString(),
    rankTo:      editPrize.rankTo.toString(),
    imageUrl:    editPrize.imageUrl ?? "",
    expiresAt:   editPrize.expiresAt
      ? new Date(editPrize.expiresAt).toISOString().slice(0, 16)
      : "",
  };
}

export function PrizeFormDrawer({
  open, onClose, waitlistId, editPrize, onSaved,
}: PrizeFormDrawerProps) {
  const contentKey = editPrize?.id ?? "new";
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      {open && (
        <PrizeFormDialogContent
          key={contentKey}
          onClose={onClose}
          waitlistId={waitlistId}
          editPrize={editPrize}
          onSaved={onSaved}
        />
      )}
    </Dialog>
  );
}

function PrizeFormDialogContent({
  onClose,
  waitlistId,
  editPrize,
  onSaved,
}: Omit<PrizeFormDrawerProps, "open">) {
  const [form, setForm] = useState<CreatePrizeForm>(() => buildInitialForm(editPrize));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTx] = useTransition();

  const isEditing = !!editPrize;
  const meta = PRIZE_TYPE_META[form.prizeType];

  const set = (key: keyof CreatePrizeForm, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = (): string | null => {
    if (!form.title.trim())         return "Prize title is required.";
    if (form.title.trim().length < 3) return "Title must be at least 3 characters.";
    const from = parseInt(form.rankFrom);
    const to   = parseInt(form.rankTo);
    if (!from || from < 1)          return "Rank From must be at least 1.";
    if (!to   || to   < 1)          return "Rank To must be at least 1.";
    if (from > to)                  return "Rank From must be ≤ Rank To.";
    if (meta.showValue && form.value) {
      const val = parseFloat(form.value);
      if (isNaN(val) || val <= 0)   return "Value must be a positive number.";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);

    startTx(async () => {
      const result = isEditing
        ? await updatePrizeAction(editPrize!.id, waitlistId, form)
        : await createPrizeAction(waitlistId, form);

      if (!result.success) { setError(result.message); return; }

      setSuccess(true);
      setTimeout(() => {
        if ("data" in result && result.data) onSaved(result.data);
        else onSaved({ ...editPrize!, ...form, rankFrom: parseInt(form.rankFrom), rankTo: parseInt(form.rankTo), value: form.value ? parseFloat(form.value) : null, updatedAt: new Date().toISOString() } as Prize);
        onClose();
        setSuccess(false);
      }, 900);
    });
  };

  return (
    <DialogContent
      showCloseButton={false}
      className="flex max-h-[90vh] w-[92vw] flex-col gap-0 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 p-0 sm:w-[50vw] sm:max-w-none"
    >
        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        <DialogHeader className="border-b border-zinc-800/60 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
                <Trophy size={16} className="text-amber-400" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-zinc-100">
                  {isEditing ? "Edit prize" : "Announce a prize"}
                </DialogTitle>
                <p className="mt-0.5 text-xs text-zinc-600">
                  {isEditing
                    ? "Update the prize details below."
                    : "Set the reward and rank range. Only OWNER can create prizes."}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 rounded-lg text-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-300"
            >
              <X size={14} />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Scrollable form ───────────────────────────────── */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col overflow-y-auto px-6 py-5"
          >
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-16 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10"
                  >
                    <CheckCircle2 size={28} className="text-emerald-400" />
                  </motion.div>
                  <p className="text-base font-semibold text-zinc-100">
                    {isEditing ? "Prize updated!" : "Prize announced!"}
                  </p>
                  <p className="text-sm text-zinc-500">Updating your prize board…</p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-5"
                >
                  {/* Prize type */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                      Prize type
                    </Label>
                    <PrizeTypeSelector
                      value={form.prizeType}
                      onChange={(t) => set("prizeType", t)}
                      disabled={isPending}
                    />
                  </div>

                  <Separator className="bg-zinc-800/60" />

                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="prize-title" className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                      <AlignLeft size={11} className="text-zinc-600" />
                      Prize title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="prize-title"
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      placeholder={`e.g. "${meta.emoji} ${meta.label} for #1 Referrer"`}
                      disabled={isPending}
                      className="border-zinc-800 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40"
                    />
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="prize-desc" className="text-xs font-medium text-zinc-400">
                      Description <span className="text-zinc-700">(optional)</span>
                    </Label>
                    <Textarea
                      id="prize-desc"
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Tell participants more about this prize…"
                      rows={2}
                      disabled={isPending}
                      className="resize-none border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40"
                    />
                  </div>

                  {/* Value + Currency (only for monetary types) */}
                  {meta.showValue && (
                    <div className="flex gap-3">
                      <div className="flex flex-1 flex-col gap-1.5">
                        <Label htmlFor="prize-value" className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                          <DollarSign size={11} className="text-zinc-600" />
                          Value <span className="text-zinc-700">(optional)</span>
                        </Label>
                        <Input
                          id="prize-value"
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.value}
                          onChange={(e) => set("value", e.target.value)}
                          placeholder="500"
                          disabled={isPending}
                          className="border-zinc-800 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40"
                        />
                      </div>
                      <div className="flex w-32 flex-col gap-1.5">
                        <Label className="text-xs font-medium text-zinc-400">Currency</Label>
                        <Select
                          value={form.currency}
                          onValueChange={(v) => set("currency", v)}
                          disabled={isPending}
                        >
                          <SelectTrigger className="border-zinc-800 bg-zinc-900/60 text-xs text-zinc-100 focus:ring-zinc-600/40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-zinc-800 bg-zinc-950">
                            {CURRENCIES.map((c) => (
                              <SelectItem key={c.code} value={c.code} className="text-xs text-zinc-300">
                                {c.symbol} {c.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Rank range */}
                  <div className="flex flex-col gap-2">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                      <Hash size={11} />
                      Rank range <span className="font-normal normal-case text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/30 px-4 py-3">
                      <div className="flex flex-1 flex-col gap-1">
                        <span className="text-[10px] text-zinc-600">From rank</span>
                        <Input
                          type="number"
                          min="1"
                          value={form.rankFrom}
                          onChange={(e) => set("rankFrom", e.target.value)}
                          disabled={isPending}
                          className="h-9 border-zinc-800 bg-zinc-900/60 text-center text-base font-bold text-zinc-100 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-0.5 pt-4">
                        <ArrowRight size={14} className="text-zinc-700" />
                        <span className="text-[9px] text-zinc-700">to</span>
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <span className="text-[10px] text-zinc-600">To rank</span>
                        <Input
                          type="number"
                          min="1"
                          value={form.rankTo}
                          onChange={(e) => set("rankTo", e.target.value)}
                          disabled={isPending}
                          className="h-9 border-zinc-800 bg-zinc-900/60 text-center text-base font-bold text-zinc-100 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-700">
                      e.g. From 1 → To 1 means only #1 wins. From 1 → To 3 means top 3 share this prize.
                    </p>
                  </div>

                  {/* Expiry */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="prize-expiry" className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                      <Calendar size={11} className="text-zinc-600" />
                      Expiry date <span className="text-zinc-700">(optional)</span>
                    </Label>
                    <Input
                      id="prize-expiry"
                      type="datetime-local"
                      value={form.expiresAt}
                      onChange={(e) => set("expiresAt", e.target.value)}
                      disabled={isPending}
                      className="border-zinc-800 bg-zinc-900/60 text-sm text-zinc-400 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40 [color-scheme:dark]"
                    />
                    <p className="text-[10px] text-zinc-700">
                      Leave blank for no expiry. Prize will hide from public page after this date.
                    </p>
                  </div>

                  {/* Image URL */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="prize-image" className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                      <ImageIcon size={11} className="text-zinc-600" />
                      Prize image URL <span className="text-zinc-700">(optional)</span>
                    </Label>
                    <Input
                      id="prize-image"
                      value={form.imageUrl}
                      onChange={(e) => set("imageUrl", e.target.value)}
                      placeholder="https://example.com/prize.png"
                      disabled={isPending}
                      className="border-zinc-800 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40"
                    />
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <Alert variant="destructive" className="border-red-500/20 bg-red-500/5 py-2.5">
                          <AlertCircle size={13} className="text-red-400" />
                          <AlertDescription className="text-xs text-red-400">{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <div className="flex gap-3 pb-4 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onClose}
                      className="flex-1 text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="group relative flex-[2] overflow-hidden bg-amber-500 font-semibold text-white hover:bg-amber-400 disabled:opacity-60"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                      {isPending
                        ? <><Loader2 size={14} className="animate-spin" />{isEditing ? "Saving…" : "Announcing…"}</>
                        : <><Trophy size={14} />{isEditing ? "Save changes" : "Announce prize"}</>
                      }
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* ── Live preview panel ─────────────────────────── */}
          <div className="hidden w-[200px] shrink-0 flex-col gap-3 border-l border-zinc-800/60 bg-zinc-900/20 p-4 xl:flex">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-700">Preview</p>
            <PrizePreviewCard
              form={form}
              compact
            />
          </div>
        </div>
    </DialogContent>
  );
}
