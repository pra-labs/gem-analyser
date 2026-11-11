'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Bid, FilterState } from '@/types/bid';
import { FilterSidebar } from './FilterSidebar';
import { TenderHeader } from './TenderHeader';
import { TenderCard } from './TenderCard';
import { TenderTable } from './TenderTable';
import { TenderModal } from './TenderModal';
import { AIBriefModal } from './AIBriefModal';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { PipelineKanban } from './PipelineKanban';
import { useSavedBids } from '@/hooks/useSavedBids';
import { exportBidsToCSV, exportBidsToJSON } from '@/utils/export';
import { computeFitScore } from '@/utils/aiScoring';
import { Layers, Clock, AlertCircle, Bookmark, Compass } from 'lucide-react';

interface TenderExplorerProps {
  initialBids: Bid[];
  lastUpdated?: string;
}

export function TenderExplorer({ initialBids }: TenderExplorerProps) {
  const [bids] = useState<Bid[]>(() => {
    // Enrich with computed AI Fit scores upfront
    return initialBids.map((b) => {
      const assessment = computeFitScore(b);
      return {
        ...b,
        fitScore: assessment.score,
        fitRecommendation: assessment.recommendation,
        fitReason: assessment.reason,
      };
    });
  });

  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [briefBid, setBriefBid] = useState<Bid | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'analytics'>('all');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Client-side ticker for countdown calculations
  const [currentTime, setCurrentTime] = useState<number | undefined>(undefined);

  useEffect(() => {
    setCurrentTime(Date.now());
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Default to active bids only and AI Fit Score High-to-Low
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedDepartments: [],
    selectedKeywords: [],
    raFilter: 'all',
    boqFilter: 'all',
    urgencyFilter: 'active_only',
    sortBy: 'fit_score_desc',
  });

  const { savedIds, toggleSave, isSaved, getStage, updateStage } = useSavedBids();

  // Metrics
  const totalBidsCount = bids.length;
  const urgentCount = useMemo(() => {
    if (!currentTime) return 0;
    return bids.filter((b) => {
      const diff = new Date(b.end_date).getTime() - currentTime;
      return diff > 0 && diff < 48 * 3600 * 1000;
    }).length;
  }, [bids, currentTime]);

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
      // Tab filter (Saved pipeline handled separately in Kanban)
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
      if (filters.selectedKeywords.length > 0) {
        const hasMatchingKw = (bid.matched_keywords || []).some((k) =>
          filters.selectedKeywords.includes(k)
        );
        if (!hasMatchingKw) return false;
      }

      // Reverse Auction Filter
      if (filters.raFilter === 'ra_only' && !bid.reverse_auction) {
        return false;
      }
      if (filters.raFilter === 'no_ra' && bid.reverse_auction) {
        return false;
      }

      // BoQ Filter
      if (filters.boqFilter === 'boq_only' && !bid.is_boq) {
        return false;
      }
      if (filters.boqFilter === 'no_boq' && bid.is_boq) {
        return false;
      }

      // Urgency & Active/Expired Filter
      if (currentTime && filters.urgencyFilter !== 'all') {
        const diff = new Date(bid.end_date).getTime() - currentTime;
        if (filters.urgencyFilter === 'active_only') {
          if (diff <= 0) return false;
        } else if (filters.urgencyFilter === 'closing_48h') {
          if (diff <= 0 || diff > 48 * 3600 * 1000) return false;
        } else if (filters.urgencyFilter === 'closing_7d') {
          if (diff <= 0 || diff > 7 * 24 * 3600 * 1000) return false;
        } else if (filters.urgencyFilter === 'expired_only') {
          if (diff > 0) return false;
        } else if (filters.urgencyFilter === 'active') {
          if (diff <= 7 * 24 * 3600 * 1000) return false;
        }
      }

      return true;
    });
  }, [bids, filters, activeTab, savedIds, currentTime]);

  // Sort Pipeline
  const sortedBids = useMemo(() => {
    const list = [...filteredBids];
    switch (filters.sortBy) {
      case 'fit_score_desc':
        return list.sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0));
      case 'closing_soon':
        return list.sort(
          (a, b) =>
            new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
        );
      case 'closing_latest':
        return list.sort(
          (a, b) =>
            new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
        );
      case 'quantity_high':
        return list.sort((a, b) => b.quantity - a.quantity);
      case 'quantity_low':
        return list.sort((a, b) => a.quantity - b.quantity);
      case 'recent_start':
        return list.sort(
          (a, b) =>
            new Date(b.start_date || 0).getTime() -
            new Date(a.start_date || 0).getTime()
        );
      default:
        return list;
    }
  }, [filteredBids, filters.sortBy]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedDepartments: [],
      selectedKeywords: [],
      raFilter: 'all',
      boqFilter: 'all',
      urgencyFilter: 'active_only',
      sortBy: 'fit_score_desc',
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
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  AI Command Center
                </span>
              </div>
              <div className="text-[11px] text-zinc-500">
                AI Matchmaking, Tender Intelligence & Bidding Pipeline
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
            <button
              onClick={() => {
                setActiveTab('all');
                setFilters((prev) => ({
                  ...prev,
                  urgencyFilter: 'closing_48h',
                }));
              }}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-rose-500/50 transition-colors cursor-pointer group"
              title="Click to filter by < 48 hours closing soon"
            >
              <Clock className="w-3.5 h-3.5 text-rose-400 group-hover:animate-pulse" />
              <span>
                Urgent (&lt;48h):{' '}
                <strong className="text-rose-400">
                  {currentTime ? urgentCount : '—'}
                </strong>
              </span>
            </button>
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
          bids={bids}
          urgentCount={urgentCount}
          onSelectUrgentFilter={() => {
            setActiveTab('all');
            setFilters((p) => ({ ...p, urgencyFilter: 'closing_48h' }));
          }}
        />

        {/* Tab 1: Intelligence Analytics Dashboard */}
        {activeTab === 'analytics' ? (
          <AnalyticsDashboard bids={bids} />
        ) : activeTab === 'saved' ? (
          /* Tab 2: Saved Pipeline Kanban */
          savedIds.size === 0 ? (
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-12 text-center flex flex-col items-center justify-center shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Bookmark className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">
                Your Bidding Pipeline is Empty
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mt-1.5 mb-6 leading-relaxed">
                Track and move prospective government bids through your pipeline (Bookmarked ➔ Feasibility ➔ Pricing ➔ Submitted ➔ Won).
              </p>
              <button
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                Explore All Tenders
              </button>
            </div>
          ) : (
            <PipelineKanban
              bids={bids}
              savedIds={savedIds}
              getStage={getStage}
              updateStage={updateStage}
              onRemove={toggleSave}
              onSelectBid={setSelectedBid}
              onOpenAIBrief={setBriefBid}
              currentTime={currentTime}
            />
          )
        ) : (
          /* Tab 3: All Tenders Explorer with Filter Sidebar */
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
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors cursor-pointer"
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
                      onOpenAIBrief={setBriefBid}
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
                  onOpenAIBrief={setBriefBid}
                  savedIds={savedIds}
                  onToggleSave={toggleSave}
                  currentTime={currentTime}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Tender Quick Preview Slide-over / Modal */}
      <TenderModal
        bid={selectedBid}
        onClose={() => setSelectedBid(null)}
        isSaved={selectedBid ? isSaved(selectedBid.id) : false}
        onToggleSave={() => selectedBid && toggleSave(selectedBid.id)}
        currentTime={currentTime}
      />

      {/* AI Tender Brief & Clause Extractor Modal */}
      <AIBriefModal
        bid={briefBid}
        onClose={() => setBriefBid(null)}
      />
    </div>
  );
}
