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
} from 'lucide-react';
import { SortOption, Bid } from '@/types/bid';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (m: 'cards' | 'table') => void;
  activeTab: 'all' | 'saved';
  onTabChange: (t: 'all' | 'saved') => void;
  savedCount: number;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onOpenMobileFilters: () => void;
  totalFiltered: number;
  bids?: Bid[];
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
    <div className="space-y-4 mb-6">
      {/* Top Banner / Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              GeM Tender Intelligence
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              LIVE
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time government procurement discovery, high-density filtering & specs viewer
          </p>
        </div>

        {/* Tab switcher: All Tenders vs Saved Pipeline */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => onTabChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Tenders ({totalFiltered})
          </button>
          <button
            onClick={() => onTabChange('saved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'saved'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
            Saved Pipeline ({savedCount})
          </button>
        </div>
      </div>

      {/* Control Bar: Search Input with Autocomplete, Sorting, View Toggle, Export, Mobile Filter Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar with Autocomplete Dropdown */}
        <div className="relative flex-1" ref={searchContainerRef}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search by tender title, category, bid number, department..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner"
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
              <div className="max-h-60 overflow-y-auto divide-y divide-zinc-900">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSearchChange(item.label);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-zinc-900 text-left transition-colors"
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
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Mobile Filter Trigger */}
          <button
            onClick={onOpenMobileFilters}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 cursor-pointer"
          >
            <option value="closing_soon">⚡ Closing Soonest</option>
            <option value="closing_latest">⏳ Closing Latest</option>
            <option value="quantity_high">📦 Quantity: High to Low</option>
            <option value="quantity_low">📦 Quantity: Low to High</option>
            <option value="recent_start">🆕 Recently Published</option>
          </select>

          {/* Cards vs Table View Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => onViewModeChange('cards')}
              className={`p-1.5 rounded-lg transition-colors ${
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
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="High-Density Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-zinc-950 border border-zinc-800 shadow-xl py-1 z-30 text-xs">
                <button
                  onClick={() => {
                    onExportCSV();
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-zinc-300 hover:bg-zinc-900 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  CSV Format
                </button>
                <button
                  onClick={() => {
                    onExportJSON();
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-zinc-300 hover:bg-zinc-900 flex items-center gap-2"
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  JSON Format
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
