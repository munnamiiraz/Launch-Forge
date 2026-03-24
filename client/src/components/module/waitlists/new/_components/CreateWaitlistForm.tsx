"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, AlertCircle, Globe, Lock, Zap, ArrowRight,
  CheckCircle2, ImageIcon, ChevronDown, ChevronUp, Info, Calendar,
} from "lucide-react";

import { Button }   from "@/src/components/ui/button";
import { Input }    from "@/src/components/ui/input";
import { Label }    from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Switch }   from "@/src/components/ui/switch";
import { Separator } from "@/src/components/ui/separator";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Badge }    from "@/src/components/ui/badge";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/utils";

import { createWaitlistFormSchema, type CreateWaitlistFormSchema } from "../_lib/schema";
import { createWaitlistAction } from "@/src/services/owner-dashboard/create-waitlist.action";
import { LivePreview }          from "./LivePreview";
import { FIELD_LIMITS }         from "../_types";
import { useWorkspace } from "@/src/provider/WorkspaceProvider";

/* ── Slugify helper ──────────────────────────────────────────────── */
function slugify(str: string): string {
  return str
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function CreateWaitlistForm() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);
  const [slugEdited, setSlugEdited]   = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  const form = useForm<CreateWaitlistFormSchema>({
    resolver:      zodResolver(createWaitlistFormSchema),
    defaultValues: { name: "", slug: "", description: "", isOpen: true, endDate: "" },
    mode:          "onChange",
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting, dirtyFields } } = form;

  const watchedValues = watch();

  /* Auto-generate slug from name */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val, { shouldValidate: true });
    if (!slugEdited) {
      setValue("slug", slugify(val), { shouldValidate: true });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEdited(true);
    setValue("slug", slugify(e.target.value), { shouldValidate: true });
  };

  const openLogoPicker = () => {
    logoInputRef.current?.click();
  };

  const removeLogo = () => {
    setLogoFile(null);
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoPreviewUrl(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setGlobalError("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setGlobalError("Logo must be less than 10MB.");
      return;
    }

    setGlobalError(null);

    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = async (values: CreateWaitlistFormSchema) => {
    if (!activeWorkspace) {
      setGlobalError("No workspace selected.");
      return;
    }
    setGlobalError(null);

    const result = await createWaitlistAction(
      {
        name:        values.name,
        slug:        values.slug,
        description: values.description ?? "",
        isOpen:      values.isOpen,
        endDate:     values.endDate ?? "",
      },
      activeWorkspace.id,
      logoFile,
    );

    if (!result.success) {
      /* Surface slug conflicts on the slug field */
      if (result.message.toLowerCase().includes("slug")) {
        form.setError("slug", { message: result.message });
      } else {
        setGlobalError(result.message);
      }
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push(`/dashboard/waitlists`);
      router.refresh();
    }, 1500);
  };

  /* Character counter helpers */
  const nameLen = watchedValues.name?.length ?? 0;
  const descLen = watchedValues.description?.length ?? 0;

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5 py-16 text-center"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          className="relative flex h-16 w-16 items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-emerald-500/20"
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
        </motion.div>
        <div>
          <p className="text-lg font-semibold text-foreground">Waitlist created!</p>
          <p className="mt-1 text-sm text-muted-foreground/80">Redirecting to your waitlists…</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
          <Loader2 size={11} className="animate-spin" />
          One moment…
        </div>
      </motion.div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">

        {/* ── Left: form ──────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

          {/* Section: Basic info */}
          <motion.section custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-indigo-500/30 bg-indigo-500/15">
                <Zap size={12} className="text-indigo-400" />
              </div>
              <h2 className="text-sm font-semibold text-foreground/90">Basic info</h2>
            </div>

            <div className="rounded-xl border border-border/80 bg-card/30 p-5 flex flex-col gap-5">

              {/* Waitlist name */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="name"
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Waitlist name <span className="text-red-500">*</span>
                  </Label>
                  <span className={cn(
                    "text-[10px] tabular-nums",
                    nameLen > FIELD_LIMITS.NAME_MAX - 20
                      ? "text-amber-500"
                      : "text-muted-foreground/40"
                  )}>
                    {nameLen}/{FIELD_LIMITS.NAME_MAX}
                  </span>
                </div>
                <Input
                  id="name"
                  placeholder="Product Alpha"
                  autoFocus
                  disabled={isSubmitting}
                  {...register("name")}
                  onChange={handleNameChange}
                  className={cn(
                    "border-zinc-800 bg-card/60 text-foreground placeholder:text-muted-foreground/60",
                    "focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/50 transition-all duration-200",
                    errors.name && "border-red-500/60 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                  )}
                />
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-xs text-red-400"
                    >
                      <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
                      {errors.name.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Slug */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Label
                    htmlFor="slug"
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    URL slug <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={11} className="cursor-help text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="border-zinc-800 bg-zinc-900 text-xs text-foreground/80 max-w-xs">
                      This is your waitlist's unique URL — like your product's domain name. 
                      Your public page will be at launchforge.app/[slug]. 
                      Use lowercase letters, numbers, and hyphens only.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className={cn(
                  "flex items-center overflow-hidden rounded-lg border bg-card/60 transition-all duration-200",
                  errors.slug
                    ? "border-red-500/60 focus-within:border-red-500"
                    : "border-zinc-800 focus-within:border-zinc-600"
                )}>
                  <span className="shrink-0 border-r border-zinc-800 px-3 py-2 text-xs text-muted-foreground/60">
                    launchforge.app/
                  </span>
                  <input
                    id="slug"
                    value={watchedValues.slug ?? ""}
                    onChange={handleSlugChange}
                    disabled={isSubmitting}
                    placeholder="your-product-name"
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                  />
                  {watchedValues.slug && !errors.slug && dirtyFields.slug && (
                    <span className="mr-2.5 shrink-0">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                    </span>
                  )}
                </div>
                <AnimatePresence>
                  {errors.slug && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-xs text-red-400"
                    >
                      <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
                      {errors.slug.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="description"
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Description{" "}
                    <span className="normal-case text-muted-foreground/60">(optional)</span>
                  </Label>
                  <span className={cn(
                    "text-[10px] tabular-nums",
                    descLen > FIELD_LIMITS.DESCRIPTION_MAX - 100
                      ? "text-amber-500"
                      : "text-muted-foreground/40"
                  )}>
                    {descLen}/{FIELD_LIMITS.DESCRIPTION_MAX}
                  </span>
                </div>
                <Textarea
                  id="description"
                  rows={3}
                  disabled={isSubmitting}
                  placeholder="Describe your product in detail. Include what problem it solves, who it's for, key features, and any early access benefits. The more info you provide, the more likely people are to join! Also mention your website/domain if you have one."
                  {...register("description")}
                  className={cn(
                    "resize-none border-zinc-800 bg-card/60 text-sm text-foreground placeholder:text-muted-foreground/60",
                    "focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/50 transition-all duration-200",
                    errors.description && "border-red-500/60"
                  )}
                />
              </div>
            </div>
          </motion.section>

          {/* Section: Signup settings */}
          <motion.section custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-emerald-500/25 bg-emerald-500/10">
                <Globe size={12} className="text-emerald-400" />
              </div>
              <h2 className="text-sm font-semibold text-foreground/90">Signup settings</h2>
            </div>

            <div className="rounded-xl border border-border/80 bg-card/30 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-300",
                    watchedValues.isOpen
                      ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-400"
                      : "border-zinc-700/60 bg-muted/40 text-muted-foreground/60"
                  )}>
                    {watchedValues.isOpen ? <Globe size={15} /> : <Lock size={15} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/90">
                      {watchedValues.isOpen ? "Open for signups" : "Signups closed"}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {watchedValues.isOpen
                        ? "Anyone can join via your public link"
                        : "Signups are paused — you can enable them later"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={watchedValues.isOpen}
                  onCheckedChange={(v) => setValue("isOpen", v)}
                  disabled={isSubmitting}
                  className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-zinc-700"
                />
              </div>
            </div>
          </motion.section>

          {/* Section: Advanced (collapsible) */}
          <motion.section custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              className="flex w-full items-center gap-2 rounded-xl border border-border/60 bg-zinc-900/20 px-5 py-3 text-left transition-colors hover:bg-card/40"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-700/60 bg-muted/40">
                <ImageIcon size={12} className="text-muted-foreground/80" />
              </div>
              <span className="flex-1 text-sm font-medium text-muted-foreground">
                Advanced settings
              </span>
              <Badge
                variant="outline"
                className="border-zinc-700/60 bg-muted/40 px-2 py-0 text-[9px] text-muted-foreground/60"
              >
                Optional
              </Badge>
              {advancedOpen
                ? <ChevronUp  size={14} className="text-muted-foreground/60" />
                : <ChevronDown size={14} className="text-muted-foreground/60" />
              }
            </button>

            <AnimatePresence>
              {advancedOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-xl border border-border/80 bg-card/30 p-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Label
                          htmlFor="logo"
                          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                        >
                          Logo (optional)
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info size={11} className="cursor-help text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="border-zinc-800 bg-zinc-900 text-xs text-foreground/80">
                            Upload a logo image (PNG/JPG). Displayed on the public sign-up page.
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <input
                        ref={logoInputRef}
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />

                      {logoPreviewUrl ? (
                        <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-card/60 p-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={logoPreviewUrl}
                            alt="Logo preview"
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <div className="flex flex-1 flex-col">
                            <span className="text-xs font-medium text-foreground/80">
                              {logoFile?.name ?? "logo"}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60">
                              {(logoFile?.size ? Math.round(logoFile.size / 1024) : 0)} KB â€¢ Max 10MB
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={removeLogo}
                            disabled={isSubmitting}
                            className="border-zinc-700/60 bg-transparent text-xs text-muted-foreground hover:bg-muted/40"
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={openLogoPicker}
                          disabled={isSubmitting}
                          className="w-fit border-zinc-700/60 bg-transparent text-xs text-muted-foreground hover:bg-muted/40"
                        >
                          Upload logo
                        </Button>
                      )}
                    </div>

                    {/* End Date */}
                    <div className="mt-4 flex flex-col gap-1.5 border-t border-zinc-800/60 pt-4">
                      <div className="flex items-center gap-1.5">
                        <Label
                          htmlFor="endDate"
                          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                        >
                          End Date (optional)
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info size={11} className="cursor-help text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="border-zinc-800 bg-zinc-900 text-xs text-foreground/80">
                            Set a deadline for your waitlist. After this date, the waitlist will close 
                            and the top referrers will be awarded. Leave empty for no deadline.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <input
                        id="endDate"
                        type="date"
                        disabled={isSubmitting}
                        {...register("endDate")}
                        className={cn(
                          "rounded-lg border bg-card/60 px-3 py-2 text-sm text-foreground transition-all duration-200",
                          "border-zinc-800 placeholder:text-muted-foreground/60",
                          "focus-visible:border-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600/50",
                          errors.endDate && "border-red-500/60"
                        )}
                      />
                      {errors.endDate && (
                        <p className="text-xs text-red-400">{errors.endDate.message}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Global error */}
          <AnimatePresence>
            {globalError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Alert variant="destructive" className="border-red-500/20 bg-red-500/5 py-2.5">
                  <AlertCircle size={14} className="text-red-400" />
                  <AlertDescription className="text-xs text-red-400">
                    {globalError}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit row */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-3"
          >
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => router.back()}
              className="text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground/80"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className={cn(
                "group relative flex-1 overflow-hidden",
                "bg-indigo-600 font-semibold text-white",
                "hover:bg-indigo-500 transition-all duration-200",
                "disabled:pointer-events-none disabled:opacity-60"
              )}
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating waitlist…
                </>
              ) : (
                <>
                  Create waitlist
                  <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </motion.div>
        </form>

      </div>
    </TooltipProvider>
  );
}
