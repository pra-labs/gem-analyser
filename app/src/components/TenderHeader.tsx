import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Download,
  BookmarkCheck,
  TrendingUp,
  FileSpreadsheet,
  FileCode,
  SlidersHorizontal,
  X,
  Building,
  Tag,
  Hash,
  BarChart3,
  Kanban,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SortOption, Bid, FilterState } from '@/types/bid';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (m: 'cards' | 'table') => void;
  activeTab: 'all' | 'saved' | 'analytics';
  onTabChange: (t: 'all' | 'saved' | 'analytics') => void;
  savedCount: number;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onOpenMobileFilters: () => void;
  totalFiltered: number;
  bids?: Bid[];
  urgentCount?: number;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export function TenderHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  activeTab,
  onTabChange,
  savedCount,
  sortBy,
  onSortChange,
  onExportCSV,
  onExportJSON,
  onOpenMobileFilters,
  totalFiltered,
  bids = [],
  urgentCount = 0,
  filters,
  setFilters,
}: HeaderProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Compute live autocomplete suggestions (unique departments and keywords matching query)
  const suggestions = React.useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    const results: Array<{ type: 'dept' | 'keyword' | 'bid'; label: string; sub?: string }> = [];

    // Check bid numbers
    for (const b of bids) {
      if (b.bid_number.toLowerCase().includes(q)) {
        results.push({ type: 'bid', label: b.bid_number, sub: b.category });
        if (results.length >= 2) break;
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
    <div className="space-y-3 mb-5">
      {/* Top Banner / Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100">
              GeM Tender Intelligence
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              AI COMMAND
            </span>
          </div>
        </div>

        {/* Tab switcher: All Tenders vs Saved Pipeline Kanban vs Intelligence Analytics */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => onTabChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Tenders ({totalFiltered})
          </button>
          <button
            onClick={() => onTabChange('saved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : savedCount > 0
                ? 'text-zinc-300 hover:text-white'
                : 'text-zinc-500 opacity-70 hover:opacity-100'
            }`}
          >
            <Kanban className={`w-3.5 h-3.5 ${savedCount > 0 ? 'text-amber-400' : 'text-zinc-500'}`} />
            Pipeline ({savedCount})
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            Trends
          </button>
        </div>
      </div>

      {/* Sticky Filter & Search Control Bar */}
      {activeTab !== 'analytics' && (
        <div className="space-y-2">
          <div className="sticky top-14 z-20 py-2.5 px-3 rounded-2xl bg-zinc-950/90 backdrop-blur-md border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
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
                placeholder="Search by tender title, category, bid number..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner"
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
                          {item.type === 'keyword' && <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
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
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 cursor-pointer max-w-[160px] sm:max-w-none truncate"
              >
                <option value="fit_score_desc">🎯 AI Fit Score</option>
                <option value="closing_soon">⚡ Closing Soonest</option>
                <option value="closing_latest">⏳ Closing Latest</option>
                <option value="quantity_high">📦 Quantity: High</option>
                <option value="quantity_low">📦 Quantity: Low</option>
                <option value="recent_start">🆕 Published</option>
              </select>

              {/* Cards vs Table View Toggle */}
              {activeTab === 'all' && (
                <div className="flex items-center p-0.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <button
                    onClick={() => onViewModeChange('cards')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'cards'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Card Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onViewModeChange('table')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-zinc-800 text-white shadow-sm'
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
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      CSV Format
                    </button>
                    <button
                      onClick={() => {
                        onExportJSON();
                        setShowExportMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-zinc-300 hover:bg-zinc-900 flex items-center gap-2 cursor-pointer"
                    >
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      JSON Format
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick-Access Horizontal Scrollable Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin text-xs">
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
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              💻 Software / SaaS Only
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  urgencyFilter:
                    prev.urgencyFilter === 'closing_48h' ? 'active_only' : 'closing_48h',
                }))
              }
              className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium transition-all ${
                filters.urgencyFilter === 'closing_48h'
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              ⚡ Urgent (&lt;48h)
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
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              ⏳ Closing in &le; 7 Days
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
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              📋 BoQ Only
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
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🛡️ No Reverse Auction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
