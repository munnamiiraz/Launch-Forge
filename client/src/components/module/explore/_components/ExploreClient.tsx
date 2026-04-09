"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, X, Rocket,
  TrendingUp, Clock, Users, Flame,
} from "lucide-react";

import { Input }   from "@/src/components/ui/input";
import { Button }  from "@/src/components/ui/button";
import { Badge }   from "@/src/components/ui/badge";
import { cn }      from "@/src/lib/utils";
import { ProductCard }        from "./ProductCard";
import { ProductDetailSheet } from "./ProductDetailSheet";
import { JoinWaitlistModal }  from "./JoinWaitlistModal";
import { CATEGORIES } from "../_lib/data";
import type { PublicProduct, ProductCategory, SortOption } from "../_lib/data";

const SORT_OPTIONS: { id: SortOption; label: string; icon: React.ReactNode }[] = [
  { id: "trending",     label: "Trending",     icon: <Flame      size={13} /> },
  { id: "newest",       label: "Newest",       icon: <Clock      size={13} /> },
  { id: "most-joined",  label: "Most joined",  icon: <Users      size={13} /> },
  { id: "closing-soon", label: "Closing soon", icon: <TrendingUp size={13} /> },
];

function sortProducts(list: PublicProduct[], by: SortOption): PublicProduct[] {
  return [...list].sort((a, b) => {
    switch (by) {
      case "trending":     return b.recentJoins - a.recentJoins;
      case "newest":       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "most-joined":  return b.totalSubscribers - a.totalSubscribers;
      case "closing-soon":
        if (!a.expiresAt && !b.expiresAt) return 0;
        if (!a.expiresAt) return 1;
        if (!b.expiresAt) return -1;
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
    }
  });
}

export function ExploreClient({
  products,
  initialSearch = "",
  initialCategory = "All",
  initialShowOpen = false,
  initialShowPrizesOnly = false,
}: {
  products: PublicProduct[];
  initialSearch?: string;
  initialCategory?: ProductCategory | "All";
  initialShowOpen?: boolean;
  initialShowPrizesOnly?: boolean;
}) {
  const router = useRouter();
  const [search,          setSearch]          = useState(initialSearch);
  const [activeCategory,  setActiveCategory]  = useState<ProductCategory | "All">(initialCategory);
  const [sortBy,          setSortBy]          = useState<SortOption>("trending");
  const [showOpen,        setShowOpen]        = useState(initialShowOpen);
  const [showPrizesOnly,  setShowPrizesOnly]  = useState(initialShowPrizesOnly);

  // Modals
  const [joinProduct,   setJoinProduct]   = useState<PublicProduct | null>(null);
  const [detailProduct, setDetailProduct] = useState<PublicProduct | null>(null);
  const [joinOpen,      setJoinOpen]      = useState(false);
  const [detailOpen,    setDetailOpen]    = useState(false);
 
  // Sync UI state when props change (back button etc)
  useEffect(() => {
    setActiveCategory(initialCategory);
    setSearch(initialSearch);
  }, [initialCategory, initialSearch]);

  // Debounced search sync
  useEffect(() => {
    if (search === initialSearch) return;

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (search.trim()) params.set("search", search.trim());
      else params.delete("search");
      
      router.push(`/explore?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, initialSearch, router]);

  const handleCategoryClick = (cat: ProductCategory | "All") => {
    const nextCat = cat === activeCategory ? "All" : cat;
    setActiveCategory(nextCat);

    const params = new URLSearchParams(window.location.search);
    if (nextCat !== "All") params.set("category", nextCat);
    else params.delete("category");

    router.push(`/explore?${params.toString()}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    // Client-side instant toggles (Status & Sort)
    let list = [...products];

    if (showOpen) {
      list = list.filter((p) => p.isOpen);
    }
    if (showPrizesOnly) {
      list = list.filter((p) => p.prizes.length > 0);
    }
    return sortProducts(list, sortBy);
  }, [products, sortBy, showOpen, showPrizesOnly]);

  const openCount  = products.filter((p) => p.isOpen).length;
  const prizeCount = products.filter((p) => p.prizes.length > 0).length;
  const hasFilters = search || activeCategory !== "All" || showOpen || showPrizesOnly;

  const handleJoin   = (p: PublicProduct) => { setJoinProduct(p);   setJoinOpen(true);   };
  const handleDetail = (p: PublicProduct) => { setDetailProduct(p); setDetailOpen(true); };
  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setShowOpen(false);
    setShowPrizesOnly(false);
    router.push("/explore");
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Sticky search + filter bar ──────────────────── */}
      <div className="sticky top-0 z-20 flex flex-col gap-3 bg-background/90 pb-3 pt-3 backdrop-blur-xl">

        {/* Search row */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, categories, tags…"
              className="h-10 border-border/80 bg-card/60 pl-9 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-indigo-500/40 focus-visible:ring-1 focus-visible:ring-indigo-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-0.5 rounded-lg border border-border/80 bg-card/60 p-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
                  sortBy === opt.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/40",
                )}
              >
                {opt.icon}
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleCategoryClick("All")}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150",
              activeCategory === "All"
                ? "border-indigo-500/40 bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"
                : "border-border bg-card/40 text-muted-foreground hover:border-indigo-500/30 hover:text-foreground/80",
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150",
                activeCategory === cat
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-card/40 text-muted-foreground hover:border-primary/30 hover:text-foreground/80",
              )}
            >
              {cat}
            </button>
          ))}

          <div className="mx-1.5 h-4 w-px shrink-0 bg-border" />

          {/* Quick filters */}
          <button
            onClick={() => setShowOpen((v) => !v)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
              showOpen
                ? "border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
                : "border-border bg-card/40 text-muted-foreground/80 hover:text-foreground",
            )}
          >
            🟢 Open only
            <Badge className="border-border bg-muted/60 px-1.5 py-0 text-[10px] text-muted-foreground">
              {openCount}
            </Badge>
          </button>

          <button
            onClick={() => setShowPrizesOnly((v) => !v)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
              showPrizesOnly
                ? "border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/12 text-amber-700 dark:text-amber-400"
                : "border-border bg-card/40 text-muted-foreground/80 hover:text-foreground",
            )}
          >
            🏆 With prizes
            <Badge className="border-border bg-muted/60 px-1.5 py-0 text-[10px] text-muted-foreground">
              {prizeCount}
            </Badge>
          </button>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="shrink-0 flex items-center gap-1 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={11} />Clear
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground/60">
            <span className="font-semibold text-muted-foreground">{filtered.length}</span>{" "}
            product{filtered.length !== 1 ? "s" : ""} found
            {hasFilters && " matching your filters"}
          </p>
        </div>
      </div>

      {/* ── Product grid ────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-5 py-24 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card/60">
              <Rocket size={28} className="text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-base font-semibold text-muted-foreground">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground/60">
                Try different keywords or clear your filters.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="gap-2 border-border bg-transparent text-sm text-muted-foreground hover:bg-muted/60"
            >
              <X size={13} />Clear filters
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key={`grid-${activeCategory}-${sortBy}-${showOpen}-${showPrizesOnly}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onJoin={handleJoin}
                onDetail={handleDetail}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modals ──────────────────────────────────────── */}
      <JoinWaitlistModal
        product={joinProduct}
        open={joinOpen}
        onClose={() => { setJoinOpen(false); }}
      />
      <ProductDetailSheet
        product={detailProduct}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onJoin={handleJoin}
      />
    </div>
  );
}
