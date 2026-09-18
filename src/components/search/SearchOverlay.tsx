"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowRight, Clock, Loader2, Search, SearchX, TrendingUp, X } from "lucide-react";
import { useSearchState } from "@/lib/hooks/useSearchState";
import { POPULAR_SEARCHES } from "@/lib/utils/search";
import { SearchProductRow } from "@/components/search/SearchProductRow";
import { Skeleton } from "@/components/ui/skeleton";
import { STORE } from "@/lib/config";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    query,
    setQuery,
    status,
    matchingProducts,
    matchingCategories,
    bestSellers,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  } = useSearchState(open);

  function goToSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    addRecentSearch(trimmed);
    onClose();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function goToProduct(slug: string) {
    onClose();
    router.push(`/product/${slug}`);
  }

  function goToCategory(slug: string) {
    onClose();
    router.push(`/category/${slug}`);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-70 bg-ink/95 backdrop-blur-xl data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          data-lenis-prevent
          className="fixed inset-0 z-70 flex h-dvh flex-col items-center overflow-y-auto overscroll-contain px-4 pt-20 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 sm:px-8 md:pt-[10vh]"
        >
          <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search {STORE.name}&apos;s catalogue of football, cricket, tennis and sports accessories.
          </DialogPrimitive.Description>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="group fixed top-4 right-4 z-10 rounded-full bg-white/5 p-2.5 text-white transition-all hover:bg-white/10 sm:top-8 sm:right-8 sm:p-3"
          >
            <X className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90 sm:h-6 sm:w-6" />
          </button>

          <div className="flex w-full max-w-4xl flex-col gap-8 pb-16 sm:gap-12">
            <div className="flex flex-col gap-4">
              <div className="group relative flex items-center">
                <Search
                  className={`absolute left-0 h-6 w-6 shrink-0 transition-colors sm:h-8 sm:w-8 ${
                    status === "loading" ? "text-white/20" : "text-white/50 group-focus-within:text-white"
                  }`}
                  strokeWidth={1}
                />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goToSearch(query)}
                  placeholder="Search football, cricket, tennis…"
                  aria-label="Search products"
                  className="w-full border-0 border-b border-white/10 bg-transparent py-4 pl-10 pr-10 font-display text-2xl font-light text-white transition-all outline-none placeholder:text-white/20 focus:border-white/40 focus:ring-0 sm:py-6 sm:pl-14 sm:pr-14 sm:text-3xl md:text-5xl lg:text-6xl"
                />
                {status === "loading" ? (
                  <Loader2 className="absolute right-0 h-6 w-6 shrink-0 animate-spin text-accent sm:h-7 sm:w-7" />
                ) : (
                  query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="absolute right-0 shrink-0 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  )
                )}
              </div>

              {!query && (
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
                    <TrendingUp className="h-3 w-3" />
                    Trending:
                  </span>
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="rounded-full border border-white/5 px-3 py-1 text-xs text-white/50 transition-all hover:bg-white/10 hover:text-white"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {status === "idle" && (
              <IdleState
                recentSearches={recentSearches}
                onClearRecent={clearRecentSearches}
                onPick={goToSearch}
                bestSellers={bestSellers}
                onNavigate={onClose}
              />
            )}

            {status === "loading" && <LoadingState />}

            {status === "results" && (
              <ResultsState
                query={query}
                products={matchingProducts}
                categories={matchingCategories}
                onNavigateProduct={goToProduct}
                onNavigateCategory={goToCategory}
                onNavigate={onClose}
                onViewAll={() => goToSearch(query)}
              />
            )}

            {status === "no-results" && <NoResultsState query={query} onPick={setQuery} />}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-bold tracking-[0.3em] text-white/30 uppercase">{children}</h3>
  );
}

function IdleState({
  recentSearches,
  onClearRecent,
  onPick,
  bestSellers,
  onNavigate,
}: {
  recentSearches: string[];
  onClearRecent: () => void;
  onPick: (term: string) => void;
  bestSellers: Parameters<typeof SearchProductRow>[0]["product"][];
  onNavigate: () => void;
}) {
  const hasRecent = recentSearches.length > 0;

  return (
    <div className="grid grid-cols-1 gap-10 pt-4 sm:gap-12 md:grid-cols-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionLabel>{hasRecent ? "Recent Searches" : "Popular Searches"}</SectionLabel>
          {hasRecent && (
            <button
              type="button"
              onClick={onClearRecent}
              className="text-xs font-medium text-white/40 transition-colors hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1">
          {(hasRecent ? recentSearches : POPULAR_SEARCHES).map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => onPick(term)}
              className="group flex w-full items-center gap-4 rounded-lg px-1 py-2 text-left text-white/50 transition-all hover:text-white"
            >
              {hasRecent ? (
                <Clock className="h-4 w-4 shrink-0 opacity-50" />
              ) : (
                <TrendingUp className="h-4 w-4 shrink-0 opacity-50" />
              )}
              <span className="text-lg font-light">{term}</span>
            </button>
          ))}
        </div>
      </div>

      {bestSellers.length > 0 && (
        <div className="hidden rounded-2xl border border-white/5 bg-white/5 p-6 sm:p-8 md:block">
          <SectionLabel>Bestsellers</SectionLabel>
          <div className="mt-5 space-y-3">
            {bestSellers.slice(0, 3).map((product, i) => (
              <SearchProductRow key={product.id} product={product} onNavigate={onNavigate} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 sm:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-3 sm:gap-6 sm:p-4"
        >
          <Skeleton className="h-16 w-16 shrink-0 rounded-lg bg-white/10 sm:h-20 sm:w-20 md:h-24 md:w-24" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-2.5 w-16 bg-white/10" />
            <Skeleton className="h-4 w-full max-w-40 bg-white/10" />
            <Skeleton className="h-3.5 w-20 bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultsState({
  query,
  products,
  categories,
  onNavigateProduct,
  onNavigateCategory,
  onNavigate,
  onViewAll,
}: {
  query: string;
  products: Parameters<typeof SearchProductRow>[0]["product"][];
  categories: { slug: string; name: string }[];
  onNavigateProduct: (slug: string) => void;
  onNavigateCategory: (slug: string) => void;
  onNavigate: () => void;
  onViewAll: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 pt-4">
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => onNavigateCategory(c.slug)}
              className="rounded-full border border-white/5 bg-white/5 px-3.5 py-1.5 text-xs text-white/60 transition-all hover:bg-white/10 hover:text-white"
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {products.map((product, i) => (
          <SearchProductRow
            key={product.id}
            product={product}
            index={i}
            onNavigate={() => {
              onNavigate();
              onNavigateProduct(product.slug);
            }}
          />
        ))}
      </div>

      {products.length > 0 && (
        <button
          type="button"
          onClick={onViewAll}
          className="group flex w-full items-center justify-center gap-3 border-t border-white/10 py-4 text-sm font-bold tracking-widest text-white/40 uppercase transition-colors hover:text-white"
        >
          View all results for &ldquo;{query}&rdquo;
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
}

function NoResultsState({ query, onPick }: { query: string; onPick: (term: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center sm:py-20">
      <SearchX className="h-12 w-12 text-white/10" strokeWidth={1} />
      <div className="space-y-1">
        <p className="text-xl font-light text-white/60">No results found for &ldquo;{query}&rdquo;</p>
        <p className="text-sm text-white/30">Try a different keyword or browse a category below.</p>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {POPULAR_SEARCHES.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => onPick(term)}
            className="rounded-full border border-white/5 px-3.5 py-1.5 text-xs text-white/50 transition-all hover:bg-white/10 hover:text-white"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
