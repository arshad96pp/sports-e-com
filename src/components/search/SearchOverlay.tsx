"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowLeft, Clock, Search, SearchX, TrendingUp, X } from "lucide-react";
import { useSearchState } from "@/lib/hooks/useSearchState";
import { POPULAR_SEARCHES } from "@/lib/utils/search";
import { SearchProductRow } from "@/components/search/SearchProductRow";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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
    curatedForYou,
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
        <DialogPrimitive.Overlay className="fixed inset-0 z-70 bg-black/70 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          className="fixed inset-0 z-70 flex flex-col outline-none data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-6 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-6 sm:items-center sm:justify-center sm:p-6 sm:data-open:slide-in-from-bottom-0 sm:data-open:zoom-in-95 sm:data-closed:slide-out-to-bottom-0 sm:data-closed:zoom-out-95"
        >
          <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search STRYDE&apos;s catalogue of football, cricket, tennis and sports accessories.
          </DialogPrimitive.Description>

          <div className="flex h-full w-full flex-col overflow-hidden bg-white sm:h-auto sm:max-h-[86vh] sm:w-full sm:max-w-215 sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl">
            {/* Search input row */}
            <div className="flex items-center gap-2 border-b border-border p-4 sm:gap-3 sm:p-5">
              <button
                type="button"
                onClick={onClose}
                aria-label="Back"
                className="tap-target flex shrink-0 items-center justify-center sm:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="flex flex-1 items-center gap-2.5 rounded-full border border-border-strong bg-surface px-4 py-2.5">
                <Search className="h-4 w-4 shrink-0 text-muted" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goToSearch(query)}
                  placeholder="Search for footballs, cricket bats, rackets…"
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-soft"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                    <X className="h-4 w-4 text-muted" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="tap-target hidden shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink sm:flex"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
              {status === "idle" && (
                <IdleState
                  recentSearches={recentSearches}
                  onClearRecent={clearRecentSearches}
                  onPick={goToSearch}
                  bestSellers={bestSellers}
                  curatedForYou={curatedForYou}
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

              {status === "no-results" && <NoResultsState query={query} onPick={goToSearch} />}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function SearchPill({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Clock;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border border-border-strong px-3.5 py-2 text-xs font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-bold uppercase tracking-wide text-muted">{children}</h3>;
}

function HorizontalProductStrip({
  products,
  onNavigate,
}: {
  products: Parameters<typeof SearchProductRow>[0]["product"][];
  onNavigate: () => void;
}) {
  return (
    <div className="scrollbar-hide -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
      {products.map((product) => (
        <SearchProductRow key={product.id} product={product} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

function IdleState({
  recentSearches,
  onClearRecent,
  onPick,
  bestSellers,
  curatedForYou,
  onNavigate,
}: {
  recentSearches: string[];
  onClearRecent: () => void;
  onPick: (term: string) => void;
  bestSellers: Parameters<typeof SearchProductRow>[0]["product"][];
  curatedForYou: Parameters<typeof SearchProductRow>[0]["product"][];
  onNavigate: () => void;
}) {
  return (
    <div className="flex flex-col gap-7">
      {recentSearches.length > 0 && (
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <SectionHeading>Recent Searches</SectionHeading>
            <button type="button" onClick={onClearRecent} className="text-xs font-medium text-signal">
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <SearchPill key={term} icon={Clock} label={term} onClick={() => onPick(term)} />
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionHeading>Trending Searches</SectionHeading>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((term) => (
            <SearchPill key={term} icon={TrendingUp} label={term} onClick={() => onPick(term)} />
          ))}
        </div>
      </div>

      <div>
        <SectionHeading>Bestsellers</SectionHeading>
        <div className="mt-3">
          <HorizontalProductStrip products={bestSellers} onNavigate={onNavigate} />
        </div>
      </div>

      <div>
        <SectionHeading>Curated For You</SectionHeading>
        <div className="mt-3">
          <HorizontalProductStrip products={curatedForYou} onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-7">
      <div>
        <Skeleton className="h-3 w-32" />
        <div className="mt-3 flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="h-3 w-24" />
        <div className="mt-3 flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex w-64 shrink-0 flex-col gap-2 rounded-xl border border-border p-2.5 sm:w-60">
              <div className="flex items-start gap-2.5">
                <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
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
    <div className="flex flex-col gap-6">
      {categories.length > 0 && (
        <div>
          <SectionHeading>Categories</SectionHeading>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => onNavigateCategory(c.slug)}
                className="rounded-full bg-surface px-3.5 py-2 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-strong hover:text-ink"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionHeading>
          Products ({products.length})
        </SectionHeading>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {products.map((product) => (
            <SearchProductRow
              key={product.id}
              product={product}
              onNavigate={() => {
                onNavigate();
                onNavigateProduct(product.slug);
              }}
            />
          ))}
        </div>
      </div>

      {products.length > 0 && (
        <Button onClick={onViewAll} className="w-full rounded-full text-sm font-semibold">
          View all results for &ldquo;{query}&rdquo;
        </Button>
      )}
    </div>
  );
}

function NoResultsState({ query, onPick }: { query: string; onPick: (term: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface">
        <SearchX className="h-7 w-7 text-muted-soft" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-semibold text-ink">No results for &ldquo;{query}&rdquo;</p>
        <p className="mt-1 text-sm text-muted">Try checking your spelling or use a more general term.</p>
      </div>
      <div className="w-full text-left">
        <SectionHeading>Try Searching For</SectionHeading>
        <div className="mt-2.5 flex flex-wrap justify-center gap-2 sm:justify-start">
          {POPULAR_SEARCHES.map((term) => (
            <SearchPill key={term} icon={TrendingUp} label={term} onClick={() => onPick(term)} />
          ))}
        </div>
      </div>
    </div>
  );
}
