"use client";

import { useState, useMemo } from "react";
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
import { CATEGORIES, MOCK_PRODUCTS } from "../_lib/data";
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

export function ExploreClient() {
  const [search,          setSearch]          = useState("");
  const [activeCategory,  setActiveCategory]  = useState<ProductCategory | "All">("All");
  const [sortBy,          setSortBy]          = useState<SortOption>("trending");
  const [showOpen,        setShowOpen]        = useState(false);
  const [showPrizesOnly,  setShowPrizesOnly]  = useState(false);

  // Modals
  const [joinProduct,   setJoinProduct]   = useState<PublicProduct | null>(null);
  const [detailProduct, setDetailProduct] = useState<PublicProduct | null>(null);
  const [joinOpen,      setJoinOpen]      = useState(false);
  const [detailOpen,    setDetailOpen]    = useState(false);

  const filtered = useMemo(() => {
    let list = [...MOCK_PRODUCTS];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q),
      );
    }
    if (activeCategory !== "All") {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (showOpen)       list = list.filter((p) => p.isOpen);
    if (showPrizesOnly) list = list.filter((p) => p.prizes.length > 0);

    return sortProducts(list, sortBy);
  }, [search, activeCategory, sortBy, showOpen, showPrizesOnly]);

  const openCount  = MOCK_PRODUCTS.filter((p) => p.isOpen).length;
  const prizeCount = MOCK_PRODUCTS.filter((p) => p.prizes.length > 0).length;
  const hasFilters = search || activeCategory !== "All" || showOpen || showPrizesOnly;

  const handleJoin   = (p: PublicProduct) => { setJoinProduct(p);   setJoinOpen(true);   };
  const handleDetail = (p: PublicProduct) => { setDetailProduct(p); setDetailOpen(true); };
  const clearFilters = () => {
    setSearch(""); setActiveCategory("All"); setShowOpen(false); setShowPrizesOnly(false);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Sticky search + filter bar ──────────────────── */}
      <div className="sticky top-16 z-20 flex flex-col gap-3 bg-[#080808]/90 pb-3 pt-1 backdrop-blur-xl">

        {/* Search row */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, categories, tags…"
              className="h-10 border-zinc-800/80 bg-zinc-900/60 pl-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-indigo-500/40 focus-visible:ring-1 focus-visible:ring-indigo-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-0.5 rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
                  sortBy === opt.id
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-400",
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
            onClick={() => setActiveCategory("All")}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150",
              activeCategory === "All"
                ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-300"
                : "border-zinc-800/80 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300",
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? "All" : cat)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150",
                activeCategory === cat
                  ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-300"
                  : "border-zinc-800/80 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300",
              )}
            >
              {cat}
            </button>
          ))}

          <div className="mx-1 h-5 w-px shrink-0 bg-zinc-800" />

          {/* Quick filters */}
          <button
            onClick={() => setShowOpen((v) => !v)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
              showOpen
                ? "border-emerald-500/40 bg-emerald-500/12 text-emerald-400"
                : "border-zinc-800/80 bg-zinc-900/40 text-zinc-600 hover:text-zinc-400",
            )}
          >
            🟢 Open only
            <Badge className="border-zinc-700 bg-zinc-800/60 px-1.5 py-0 text-[9px] text-zinc-500">
              {openCount}
            </Badge>
          </button>

          <button
            onClick={() => setShowPrizesOnly((v) => !v)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
              showPrizesOnly
                ? "border-amber-500/40 bg-amber-500/12 text-amber-400"
                : "border-zinc-800/80 bg-zinc-900/40 text-zinc-600 hover:text-zinc-400",
            )}
          >
            🏆 With prizes
            <Badge className="border-zinc-700 bg-zinc-800/60 px-1.5 py-0 text-[9px] text-zinc-500">
              {prizeCount}
            </Badge>
          </button>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="shrink-0 flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <X size={11} />Clear
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-600">
            <span className="font-semibold text-zinc-400">{filtered.length}</span>{" "}
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
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60">
              <Rocket size={28} className="text-zinc-700" />
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-400">No products found</p>
              <p className="mt-1 text-sm text-zinc-600">
                Try different keywords or clear your filters.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="gap-2 border-zinc-700/80 bg-transparent text-sm text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/60"
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
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
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