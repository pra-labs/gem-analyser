import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  Building,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Bid } from '@/types/bid';

interface AnalyticsProps {
  bids: Bid[];
}

export function AnalyticsDashboard({ bids }: AnalyticsProps) {
  // 1. Department Breakdown
  const deptMap: Record<string, number> = {};
  for (const b of bids) {
    const d = b.department?.trim() || 'Unspecified';
    deptMap[d] = (deptMap[d] || 0) + 1;
  }
  const topDepartments = Object.entries(deptMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxDeptCount = topDepartments[0]?.[1] || 1;

  // 2. Intelligence Category Breakdown
  const kwMap: Record<string, number> = {};
  for (const b of bids) {
    for (const kw of b.matched_keywords || []) {
      kwMap[kw] = (kwMap[kw] || 0) + 1;
    }
  }
  const topKeywords = Object.entries(kwMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // 3. Reverse Auction vs Non-RA
  const raCount = bids.filter((b) => b.reverse_auction).length;
  const nonRaCount = bids.length - raCount;
  const raPercentage = Math.round((raCount / (bids.length || 1)) * 100);

  // 4. Quantity Distribution
  const smallQty = bids.filter((b) => b.quantity <= 10).length;
  const medQty = bids.filter((b) => b.quantity > 10 && b.quantity <= 100).length;
  const largeQty = bids.filter((b) => b.quantity > 100).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase font-semibold">Active Dataset</span>
            <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">{bids.length}</div>
            <span className="text-[11px] text-emerald-400">Public procurement tenders</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase font-semibold">Lead Ministry</span>
            <div className="text-base font-bold text-zinc-100 mt-1 truncate max-w-[170px]" title={topDepartments[0]?.[0]}>
              {topDepartments[0]?.[0] || 'N/A'}
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">{topDepartments[0]?.[1] || 0} active tenders</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase font-semibold">Reverse Auction (RA)</span>
            <div className="text-2xl font-bold font-mono text-indigo-300 mt-1">{raPercentage}%</div>
            <span className="text-[11px] text-zinc-400">{raCount} RA / {nonRaCount} Non-RA</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase font-semibold">Startup Scope</span>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
              {Math.round(((smallQty + medQty) / (bids.length || 1)) * 100)}%
            </div>
            <span className="text-[11px] text-amber-400">SME/Startup accessible</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Issuing Departments Bar Graph */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-sm text-zinc-100">Top Issuing Departments & Ministries</h3>
            </div>
            <span className="text-xs text-zinc-500 font-mono">Tender Count</span>
          </div>

          <div className="space-y-3 pt-1">
            {topDepartments.map(([name, count]) => {
              const pct = Math.round((count / maxDeptCount) * 100);
              return (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span className="truncate pr-3 font-medium" title={name}>{name}</span>
                    <span className="font-mono text-zinc-400 shrink-0">{count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500/80 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intelligence Category Distribution */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-sm text-zinc-100">Dominant Technology Clusters</h3>
            </div>
            <span className="text-xs text-zinc-500 font-mono">Active Focus</span>
          </div>

          <div className="space-y-3 pt-1">
            {topKeywords.map(([kw, count]) => {
              const maxKw = topKeywords[0]?.[1] || 1;
              const pct = Math.round((count / maxKw) * 100);
              return (
                <div key={kw} className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span className="font-medium">{kw}</span>
                    <span className="font-mono text-cyan-400 shrink-0">{count} tenders</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-500/80 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Procurement Insights Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800">
        <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Strategic Procurement Intelligence for Startups & MSEs
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-400 leading-relaxed mt-3">
          <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80">
            <strong className="text-zinc-200 block mb-1">Defense & Education Dominance</strong>
            Ministries like Defense and Higher Education (NITTTR, IITs) represent the fastest cycle times for software and lab simulators.
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80">
            <strong className="text-zinc-200 block mb-1">Standard vs RA Evaluation</strong>
            Over {100 - raPercentage}% of IT software tenders do not invoke Reverse Auction, allowing technical proposal scoring to dictate winning margins.
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80">
            <strong className="text-zinc-200 block mb-1">BoQ Customization</strong>
            Custom BoQ tenders allow bespoke AI architectures (WhatsApp bots, data engines) to meet unique departmental specifications.
          </div>
        </div>
      </div>
    </div>
  );
}
