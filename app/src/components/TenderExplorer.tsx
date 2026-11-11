'use client';

import React, { useState, useMemo, useEffect, useSyncExternalStore } from 'react';
import { Bid, FilterState } from '@/types/bid';
import { FilterSidebar } from './FilterSidebar';
import { TenderCard } from './TenderCard';
import { TenderTable } from './TenderTable';
import { TenderModal } from './TenderModal';
import { TenderHeader } from './TenderHeader';
import { useSavedBids } from '@/hooks/useSavedBids';
import { exportBidsToCSV, exportBidsToJSON } from '@/utils/export';
import { Layers, Clock, AlertCircle } from 'lucide-react';

interface ExplorerProps {
  initialBids: Bid[];
  lastUpdated: string;
}

const initialFilters: FilterState = {
  searchQuery: '',
  selectedDepartments: [],
  selectedKeywords: [],
  raFilter: 'all',
  boqFilter: 'all',
  urgencyFilter: 'all',
  sortBy: 'deadline_asc',
};

// External store for current minute to avoid useEffect setState cascading render warning
let timeListeners: Array<() => void> = [];
let currentTimeSnapshot: number | undefined = undefined;

if (typeof window !== 'undefined') {
  currentTimeSnapshot = Date.now();
  setInterval(() => {
    currentTimeSnapshot = Date.now();
    for (const l of timeListeners) l();
  }, 60000);
}

function subscribeTime(listener: () => void) {
  timeListeners = [...timeListeners, listener];
  return () => {
    timeListeners = timeListeners.filter((l) => l !== listener);
  };
}

function getTimeSnapshot() {
  return currentTimeSnapshot;
}

function getServerTimeSnapshot() {
  return undefined;
}

export function TenderExplorer({ initialBids }: ExplorerProps) {
  const [bids, setBids] = useState<Bid[]>(initialBids);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const currentTime = useSyncExternalStore(subscribeTime, getTimeSnapshot, getServerTimeSnapshot);
  const { savedIds, toggleSave, isSaved } = useSavedBids();

  // Try to load fresh bids client-side if public bids json is updated
  useEffect(() => {
    let ignore = false;
    fetch('/data/bids.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data && Array.isArray(data.bids) && data.bids.length > 0) {
          setBids(data.bids);
        }
      })
      .catch((e) => console.log('Using static server bids', e));
    return () => {
      ignore = true;
    };
  }, []);

  // Compute Aggregations for Sidebar
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of bids) {
      const dept = b.department?.trim() || 'Unspecified';
      counts[dept] = (counts[dept] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [bids]);

  const keywordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of bids) {
      if (b.matched_keywords) {
        for (const kw of b.matched_keywords) {
          counts[kw] = (counts[kw] || 0) + 1;
        }
      }
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [bids]);

  // High-performance filter & sort pipeline
  const filteredBids = useMemo(() => {
    return bids.filter((bid) => {
      // Tab filter (Saved pipeline)
      if (activeTab === 'saved' && !savedIds.has(bid.id)) {
        return false;
      }

      // Search Query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const inNum = bid.bid_number.toLowerCase().includes(q);
        const inTitle = (bid.title || '').toLowerCase().includes(q);
        const inCat = (bid.category || '').toLowerCase().includes(q);
        const inDept = (bid.department || '').toLowerCase().includes(q);
        const inKw = (bid.matched_keywords || []).some((k) =>
          k.toLowerCase().includes(q)
        );
        if (!inNum && !inTitle && !inCat && !inDept && !inKw) {
          return false;
        }
      }

      // Department Filter
      if (
        filters.selectedDepartments.length > 0 &&
        !filters.selectedDepartments.includes(bid.department || 'Unspecified')
      ) {
        return false;
      }

      // Keyword Filter
      if (
        filters.selectedKeywords.length > 0 &&
        !filters.selectedKeywords.some((k) =>
          bid.matched_keywords?.includes(k)
        )
      ) {
        return false;
      }

      // Reverse Auction
      if (filters.raFilter === 'ra_only' && !bid.reverse_auction) return false;
      if (filters.raFilter === 'no_ra' && bid.reverse_auction) return false;

      // BoQ
      if (filters.boqFilter === 'boq_only' && !bid.is_boq) return false;
      if (filters.boqFilter === 'no_boq' && bid.is_boq) return false;

      // Urgency filter (if client timestamp is available)
      if (filters.urgencyFilter !== 'all' && currentTime) {
        const end = new Date(bid.end_date).getTime();
        const diffHours = (end - currentTime) / (1000 * 60 * 60);

        if (filters.urgencyFilter === 'closing_48h') {
          if (diffHours < 0 || diffHours > 48) return false;
        } else if (filters.urgencyFilter === 'closing_7d') {
          if (diffHours < 0 || diffHours > 168) return false;
        } else if (filters.urgencyFilter === 'active') {
          if (diffHours <= 168) return false;
        }
      }

      return true;
    });
  }, [bids, filters, activeTab, savedIds, currentTime]);

  const sortedBids = useMemo(() => {
    return [...filteredBids].sort((a, b) => {
      if (filters.sortBy === 'deadline_asc') {
        return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
      }
      if (filters.sortBy === 'deadline_desc') {
        return new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
      }
      if (filters.sortBy === 'quantity_desc') {
        return b.quantity - a.quantity;
      }
      if (filters.sortBy === 'quantity_asc') {
        return a.quantity - b.quantity;
      }
      if (filters.sortBy === 'start_desc') {
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      }
      return 0;
    });
  }, [filteredBids, filters.sortBy]);

  // Overall key intelligence stats
  const totalBidsCount = bids.length;
  const urgentCount = useMemo(() => {
    if (!currentTime) return 0;
    return bids.filter((b) => {
      const diff = new Date(b.end_date).getTime() - currentTime;
      return diff > 0 && diff <= 48 * 3600 * 1000;
    }).length;
  }, [bids, currentTime]);

  const handleResetFilters = () => {
    setFilters({
      ...initialFilters,
      sortBy: filters.sortBy,
    });
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Banner Navigation / Stats Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-zinc-950 text-sm shadow-[0_0_15px_rgba(16,185,129,0.35)]">
              GeM
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight text-white flex items-center gap-2">
                GeM Analyser Portal
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  v2.0
                </span>
              </div>
              <div className="text-[11px] text-zinc-500">
                AI Intelligence & Tender Procurement Tracker
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                Total: <strong className="text-white">{totalBidsCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>
                Urgent (&lt;48h):{' '}
                <strong className="text-rose-400">
                  {currentTime ? urgentCount : '—'}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TenderHeader
          searchQuery={filters.searchQuery}
          onSearchChange={(q) => setFilters((p) => ({ ...p, searchQuery: q }))}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          savedCount={savedIds.size}
          sortBy={filters.sortBy}
          onSortChange={(s) => setFilters((p) => ({ ...p, sortBy: s }))}
          onExportCSV={() => exportBidsToCSV(sortedBids)}
          onExportJSON={() => exportBidsToJSON(sortedBids)}
          onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
          totalFiltered={sortedBids.length}
        />

        {/* Layout: Sidebar + Tender Stream */}
        <div className="flex items-start gap-6">
          <FilterSidebar
            departments={departmentCounts}
            keywords={keywordCounts}
            filters={filters}
            setFilters={setFilters}
            totalMatching={sortedBids.length}
            totalBids={totalBidsCount}
            onReset={handleResetFilters}
            isOpenMobile={isMobileFiltersOpen}
            onCloseMobile={() => setIsMobileFiltersOpen(false)}
          />

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {sortedBids.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-12 text-center flex flex-col items-center justify-center">
                <AlertCircle className="w-12 h-12 text-zinc-600 mb-3" />
                <h3 className="text-base font-semibold text-zinc-200">
                  No matching tenders found
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-5">
                  Try adjusting or clearing your search term, department filters, or urgency parameters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
                >
                  Reset all filters
                </button>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedBids.map((bid) => (
                  <TenderCard
                    key={bid.id}
                    bid={bid}
                    onSelect={setSelectedBid}
                    isSaved={isSaved(bid.id)}
                    onToggleSave={() => toggleSave(bid.id)}
                    currentTime={currentTime}
                  />
                ))}
              </div>
            ) : (
              <TenderTable
                bids={sortedBids}
                onSelect={setSelectedBid}
                savedIds={savedIds}
                onToggleSave={toggleSave}
                currentTime={currentTime}
              />
            )}
          </div>
        </div>
      </main>

      {/* Tender Quick Preview Slide-over / Modal */}
      <TenderModal
        bid={selectedBid}
        onClose={() => setSelectedBid(null)}
        isSaved={selectedBid ? isSaved(selectedBid.id) : false}
        onToggleSave={() => selectedBid && toggleSave(selectedBid.id)}
        currentTime={currentTime}
      />
    </div>
  );
}
