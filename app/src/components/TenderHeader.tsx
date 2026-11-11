import React from 'react';
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
} from 'lucide-react';
import { SortOption } from '@/types/bid';

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
}: HeaderProps) {
  const [showExportMenu, setShowExportMenu] = React.useState(false);

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

      {/* Control Bar: Search Input, Sorting, View Toggle, Export, Mobile Filter Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by tender title, category, bid number, department..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
          />
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Mobile Filter trigger */}
          <button
            onClick={onOpenMobileFilters}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            Filters
          </button>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 cursor-pointer"
          >
            <option value="deadline_asc">Closing Soon (Urgent)</option>
            <option value="deadline_desc">Closing Latest</option>
            <option value="quantity_desc">Quantity: High to Low</option>
            <option value="quantity_asc">Quantity: Low to High</option>
            <option value="start_desc">Recently Published</option>
          </select>

          {/* View mode toggle (Cards vs Table) */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
            <button
              onClick={() => onViewModeChange('cards')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'cards'
                  ? 'bg-zinc-800 text-emerald-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-zinc-800 text-emerald-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Dense Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              Export
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-44 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-1 z-30 text-xs">
                  <button
                    onClick={() => {
                      onExportCSV();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    Export to CSV
                  </button>
                  <button
                    onClick={() => {
                      onExportJSON();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-left"
                  >
                    <FileCode className="w-4 h-4 text-amber-400" />
                    Export to JSON
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
