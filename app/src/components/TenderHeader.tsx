import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  Download,
  FileSpreadsheet,
  FileCode,
  X,
  Tag,
  Building,
  Hash,
  Kanban,
  BarChart3,
  Flame,
} from 'lucide-react';
import { Bid, FilterState } from '@/types/bid';

interface TenderHeaderProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalFiltered: number;
  totalBids?: number;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
  onOpenMobileFilters: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  bids: Bid[];
  savedCount: number;
  activeTab: 'all' | 'saved' | 'analytics';
  onTabChange: (tab: 'all' | 'saved' | 'analytics') => void;
  sortBy?: FilterState['sortBy'];
  onSortChange?: (s: FilterState['sortBy']) => void;
  urgentCount?: number;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export function TenderHeader({
  filters,
  setFilters,
  totalFiltered,
  viewMode,
  onViewModeChange,
  onOpenMobileFilters,
  searchQuery,
  onSearchChange,
  bids,
  savedCount,
  activeTab,
  onTabChange,
  urgentCount = 0,
  onExportCSV,
  onExportJSON,
}: TenderHeaderProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Autocomplete Suggestions computation
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    const results: Array<{
      type: 'bid' | 'dept' | 'keyword';
      label: string;
      sub?: string;
    }> = [];

    // Check bid numbers
    for (const b of bids) {
      if (b.bid_number.toLowerCase().includes(q)) {
        results.push({
          type: 'bid',
          label: b.bid_number,
          sub: b.title || b.category,
        });
        if (results.length >= 3) break;
      }
    }

    // Check unique departments
    const seenDepts = new Set<string>();
    for (const b of bids) {
      const dept = b.department?.trim();
      if (dept && dept.toLowerCase().includes(q) && !seenDepts.has(dept)) {
        seenDepts.add(dept);
        results.push({ type: 'dept', label: dept });
        if (results.length >= 5) break;
      }
    }

    // Check unique keywords
    const seenKw = new Set<string>();
    for (const b of bids) {
      for (const kw of b.matched_keywords || []) {
        if (kw.toLowerCase().includes(q) && !seenKw.has(kw)) {
          seenKw.add(kw);
          results.push({ type: 'keyword', label: kw });
          if (results.length >= 8) break;
        }
      }
    }

    return results;
  }, [searchQuery, bids]);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-3 mb-4">
      {/* Consolidated Compact Single Top Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        {/* Brand & Identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-orange-500/20">
            GeM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-zinc-100 tracking-tight">
                GeM Analyser
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-orange-400 border border-zinc-800">
                AI Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Unified Tab Switcher with Inline Stat Counts */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
          <button
            onClick={() => onTabChange('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-orange-500 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({totalFiltered})
          </button>

          <button
            onClick={() => onTabChange('saved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'saved'
                ? 'bg-orange-500 text-white font-semibold shadow-sm'
                : savedCount > 0
                ? 'text-zinc-200 hover:text-white'
                : 'text-zinc-500'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Pipeline ({savedCount})
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-orange-500 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Trends
          </button>
        </div>
      </div>

      {/* Sticky Filter & Search Control Bar */}
      {activeTab !== 'analytics' && (
        <div className="space-y-2">
          <div className="sticky top-2 z-20 py-2.5 px-3 rounded-2xl bg-[#121318]/95 backdrop-blur-md border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Bar with Autocomplete Dropdown */}
            <div className="relative flex-1 min-w-0" ref={searchContainerRef}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search tender title, category, bid number..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-40 overflow-hidden text-xs">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-zinc-500 border-b border-zinc-900 bg-zinc-900/40">
                    Suggested Matches
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-zinc-900 scrollbar-thin">
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSearchChange(item.label);
                          setShowSuggestions(false);
                        }}
                        className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-zinc-900 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {item.type === 'bid' && <Hash className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
                          {item.type === 'dept' && <Building className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
                          {item.type === 'keyword' && <Tag className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
                          <span className="text-zinc-200 truncate">{item.label}</span>
                          {item.sub && (
                            <span className="text-zinc-500 text-[11px] truncate max-w-xs">({item.sub})</span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase ml-2">
                          {item.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Tools Toolbar */}
            <div className="flex items-center gap-2 justify-between sm:justify-end flex-wrap sm:flex-nowrap">
              {/* Mobile Filter Trigger */}
              <button
                onClick={onOpenMobileFilters}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5">
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value as FilterState['sortBy'],
                    }))
                  }
                  className="px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="fit_score_desc">🎯 AI Fit: High to Low</option>
                  <option value="closing_soon">⏳ Closing Soon</option>
                  <option value="closing_late">📅 Latest</option>
                  <option value="quantity_desc">📦 Volume: High to Low</option>
                </select>
              </div>

              {/* View Switcher: Cards vs Table */}
              {activeTab === 'all' && (
                <div className="flex items-center p-0.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <button
                    onClick={() => onViewModeChange('cards')}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                      viewMode === 'cards'
                        ? 'bg-zinc-800 text-orange-400 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Card Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onViewModeChange('table')}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                      viewMode === 'table'
                        ? 'bg-zinc-800 text-orange-400 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="List Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Export Bids"
                >
                  <Download className="w-4 h-4" />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-zinc-950 border border-zinc-800 shadow-xl py-1 z-30 text-xs">
                    <button
                      onClick={() => {
                        onExportCSV();
                        setShowExportMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-zinc-300 hover:bg-zinc-900 flex items-center gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-orange-400" />
                      CSV Format
                    </button>
                    <button
                      onClick={() => {
                        onExportJSON();
                        setShowExportMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-zinc-300 hover:bg-zinc-900 flex items-center gap-2 cursor-pointer"
                    >
                      <FileCode className="w-3.5 h-3.5 text-orange-400" />
                      JSON Format
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick-Access Horizontal Scrollable Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin text-xs">
            {/* Urgent pill with dynamic counter */}
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  urgencyFilter:
                    prev.urgencyFilter === 'closing_48h' ? 'active_only' : 'closing_48h',
                }))
              }
              className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium transition-all flex items-center gap-1.5 ${
                filters.urgencyFilter === 'closing_48h'
                  ? 'bg-orange-500 text-white border-orange-400 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Flame className="w-3 h-3 text-orange-400" />
              <span>Urgent &lt;48h ({urgentCount})</span>
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  procurementTypeFilter:
                    prev.procurementTypeFilter === 'software_only' ? 'all' : 'software_only',
                }))
              }
              className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium transition-all ${
                filters.procurementTypeFilter === 'software_only'
                  ? 'bg-orange-500 text-white border-orange-400 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Software / SaaS Only
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  urgencyFilter:
                    prev.urgencyFilter === 'closing_7d' ? 'active_only' : 'closing_7d',
                }))
              }
              className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium transition-all ${
                filters.urgencyFilter === 'closing_7d'
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-300 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Closing in &le; 7 Days
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  boqFilter: prev.boqFilter === 'boq_only' ? 'all' : 'boq_only',
                }))
              }
              className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium transition-all ${
                filters.boqFilter === 'boq_only'
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-300 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              BoQ Only
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  raFilter: prev.raFilter === 'no_ra' ? 'all' : 'no_ra',
                }))
              }
              className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium transition-all ${
                filters.raFilter === 'no_ra'
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-300 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              No Reverse Auction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
