import React, { useState, useMemo } from 'react';
import { Filter, X, RefreshCw, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { FilterState } from '@/types/bid';

interface SidebarProps {
  departments: { name: string; count: number }[];
  keywords: { name: string; count: number }[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatching: number;
  totalBids: number;
  onReset: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function FilterSidebar({
  departments,
  keywords,
  filters,
  setFilters,
  totalMatching,
  totalBids,
  onReset,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const [deptSearch, setDeptSearch] = useState('');
  const [isExpandedDept, setIsExpandedDept] = useState(false);

  const toggleDepartment = (dept: string) => {
    setFilters((prev) => {
      const exists = prev.selectedDepartments.includes(dept);
      return {
        ...prev,
        selectedDepartments: exists
          ? prev.selectedDepartments.filter((d) => d !== dept)
          : [...prev.selectedDepartments, dept],
      };
    });
  };

  const toggleKeyword = (kw: string) => {
    setFilters((prev) => {
      const exists = prev.selectedKeywords.includes(kw);
      return {
        ...prev,
        selectedKeywords: exists
          ? prev.selectedKeywords.filter((k) => k !== kw)
          : [...prev.selectedKeywords, kw],
      };
    });
  };

  // Filtered department list based on user search in the sidebar
  const filteredDepartments = useMemo(() => {
    if (!deptSearch.trim()) return departments;
    const q = deptSearch.toLowerCase().trim();
    return departments.filter((d) => d.name.toLowerCase().includes(q));
  }, [departments, deptSearch]);

  const visibleDepartments = isExpandedDept || deptSearch.trim().length > 0
    ? filteredDepartments
    : filteredDepartments.slice(0, 7);

  const activeFiltersCount =
    (filters.searchQuery ? 1 : 0) +
    filters.selectedDepartments.length +
    filters.selectedKeywords.length +
    (filters.raFilter !== 'all' ? 1 : 0) +
    (filters.boqFilter !== 'all' ? 1 : 0) +
    (filters.urgencyFilter !== 'all' ? 1 : 0);

  const sidebarContent = (
    <div className="flex flex-col h-full space-y-5 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <h2 className="font-semibold text-zinc-100 tracking-wide">Filters</h2>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Urgency Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Urgency / Deadline
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: 'All Active' },
            { id: 'closing_48h', label: '⚡ < 48 Hours' },
            { id: 'closing_7d', label: '⏳ < 7 Days' },
            { id: 'active', label: 'Active (>7d)' },
          ].map((item) => {
            const isSelected = filters.urgencyFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    urgencyFilter: item.id as FilterState['urgencyFilter'],
                  }))
                }
                className={`py-1.5 px-2 rounded-md text-xs font-medium border text-center transition-all ${
                  isSelected
                    ? item.id === 'closing_48h'
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-semibold'
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reverse Auction (RA) Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Reverse Auction (RA)
        </label>
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'ra_only', label: 'RA Only' },
            { id: 'no_ra', label: 'No RA' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  raFilter: item.id as FilterState['raFilter'],
                }))
              }
              className={`flex-1 py-1.5 rounded-md text-xs font-medium border text-center transition-all ${
                filters.raFilter === item.id
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* BoQ (Bill of Quantities) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Bill of Quantities (BoQ)
        </label>
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'boq_only', label: 'BoQ Only' },
            { id: 'no_boq', label: 'Standard' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  boqFilter: item.id as FilterState['boqFilter'],
                }))
              }
              className={`flex-1 py-1.5 rounded-md text-xs font-medium border text-center transition-all ${
                filters.boqFilter === item.id
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Keyword Category Tags */}
      {keywords.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Detected Intelligence Tags
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {keywords.map((kw) => {
              const active = filters.selectedKeywords.includes(kw.name);
              return (
                <button
                  key={kw.name}
                  onClick={() => toggleKeyword(kw.name)}
                  className={`px-2 py-1 rounded text-xs border font-medium transition-all ${
                    active
                      ? 'bg-teal-500/20 border-teal-500/40 text-teal-200'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <span>{kw.name}</span>
                  <span className="ml-1 text-[10px] opacity-60">({kw.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Ministry / Department - Searchable and Collapsible */}
      <div className="space-y-2 flex flex-col">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Departments ({departments.length})
          </label>
          {departments.length > 7 && (
            <button
              onClick={() => setIsExpandedDept(!isExpandedDept)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
            >
              {isExpandedDept ? (
                <>Show less <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>View all <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </div>

        {/* Search input for departments */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={deptSearch}
            onChange={(e) => setDeptSearch(e.target.value)}
            placeholder="Search departments..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
          />
          {deptSearch && (
            <button
              onClick={() => setDeptSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Scrollable Department list */}
        <div className="space-y-1 pr-1 max-h-56 overflow-y-auto">
          {visibleDepartments.length === 0 ? (
            <div className="text-xs text-zinc-500 py-2 text-center">
              No matching departments
            </div>
          ) : (
            visibleDepartments.map((dept) => {
              const active = filters.selectedDepartments.includes(dept.name);
              return (
                <label
                  key={dept.name}
                  onClick={() => toggleDepartment(dept.name)}
                  className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer border transition-all text-xs ${
                    active
                      ? 'bg-zinc-800/80 border-zinc-600 text-white font-medium'
                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <input
                      type="checkbox"
                      checked={active}
                      readOnly
                      className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="truncate" title={dept.name}>
                      {dept.name || 'Unspecified'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500 ml-auto flex-shrink-0">
                    {dept.count}
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>

      {/* Footer stats */}
      <div className="pt-3 border-t border-zinc-800 text-xs text-zinc-500 flex justify-between items-center">
        <span>Showing:</span>
        <span className="font-mono text-zinc-300 font-semibold">
          {totalMatching} / {totalBids} tenders
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 bg-zinc-950/80 backdrop-blur-md p-4 rounded-xl border border-zinc-800/80 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto z-10 shadow-lg">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-80 max-w-[85vw] bg-zinc-950 p-5 h-full overflow-y-auto border-r border-zinc-800 shadow-2xl flex flex-col z-10">
            <div className="flex justify-end mb-2">
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-md text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
