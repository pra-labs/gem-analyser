import React from 'react';
import {
  FileText,
  Bookmark,
  BookmarkCheck,
  Eye,
  Sparkles,
  ExternalLink,
  Layers,
  Clock,
} from 'lucide-react';
import { Bid } from '@/types/bid';
import { formatDateShort, getTimeRemaining } from '@/utils/date';
import { computeFitScore } from '@/utils/aiScoring';

interface TenderTableProps {
  bids: Bid[];
  onSelect: (bid: Bid) => void;
  onOpenAIBrief: (bid: Bid) => void;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  currentTime?: number;
}

export function TenderTable({
  bids,
  onSelect,
  onOpenAIBrief,
  savedIds,
  onToggleSave,
  currentTime,
}: TenderTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-md">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/80 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <th className="py-3 px-3 w-10 text-center">Save</th>
            <th className="py-3 px-3 w-28">Match</th>
            <th className="py-3 px-3 w-36">Bid Number</th>
            <th className="py-3 px-4 min-w-[280px]">Title / Category</th>
            <th className="py-3 px-3 max-w-[180px]">Department</th>
            <th className="py-3 px-3 text-right">Quantity</th>
            <th className="py-3 px-3">Flags</th>
            <th className="py-3 px-3 w-36">Deadline</th>
            <th className="py-3 px-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
          {bids.map((bid) => {
            const isSaved = savedIds.has(bid.id);
            const timeRem = getTimeRemaining(bid.end_date, currentTime);
            const fit = computeFitScore(bid);
            const isUrgent = timeRem.badgeVariant === 'urgent';
            const isExpired = timeRem.badgeVariant === 'expired';

            return (
              <tr
                key={bid.id}
                onClick={() => onSelect(bid)}
                className={`group cursor-pointer transition-colors ${
                  isExpired
                    ? 'opacity-60 bg-zinc-950/40 hover:opacity-90'
                    : isUrgent
                    ? 'bg-rose-950/10 hover:bg-rose-950/20'
                    : 'hover:bg-zinc-900/60'
                }`}
              >
                {/* Save bookmark */}
                <td
                  className="py-3 px-3 text-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(bid.id);
                  }}
                >
                  <button
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      isSaved
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-zinc-600 hover:text-zinc-300'
                    }`}
                    title={isSaved ? 'Remove from Saved Pipeline' : 'Save Tender'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </td>

                {/* Match Score */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full font-mono inline-flex items-center gap-1 ${
                      fit.score >= 80
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : fit.score >= 60
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    {fit.score}%
                  </span>
                </td>

                {/* Bid Number */}
                <td className="py-3 px-3 font-mono text-xs font-medium text-zinc-300 whitespace-nowrap">
                  {bid.bid_number}
                </td>

                {/* Title & Category */}
                <td className="py-3 px-4">
                  <div
                    className="font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1"
                    title={bid.title || bid.category}
                  >
                    {bid.title || bid.category}
                  </div>
                  {bid.matched_keywords && bid.matched_keywords.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {bid.matched_keywords.slice(0, 3).map((kw) => (
                        <span
                          key={kw}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </td>

                {/* Department */}
                <td
                  className="py-3 px-3 text-xs text-zinc-400 max-w-[180px] truncate"
                  title={bid.department}
                >
                  {bid.department || 'Unspecified'}
                </td>

                {/* Quantity */}
                <td className="py-3 px-3 text-right font-mono text-xs text-zinc-200 whitespace-nowrap">
                  {bid.quantity.toLocaleString('en-IN')}
                </td>

                {/* Flags (RA / BoQ) */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {bid.is_boq && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        BoQ
                      </span>
                    )}
                    {bid.reverse_auction && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        RA
                      </span>
                    )}
                    {!bid.is_boq && !bid.reverse_auction && (
                      <span className="text-[11px] text-zinc-600 font-mono">—</span>
                    )}
                  </div>
                </td>

                {/* Deadline */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <span
                    className={`font-mono text-xs ${
                      isUrgent
                        ? 'text-rose-400 font-bold animate-pulse'
                        : isExpired
                        ? 'text-zinc-500'
                        : 'text-zinc-300'
                    }`}
                  >
                    {timeRem.text}
                  </span>
                </td>

                {/* Action Buttons */}
                <td
                  className="py-3 px-3 text-center whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onOpenAIBrief(bid)}
                      className="px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
                      title="AI Brief & Clauses"
                    >
                      AI Brief
                    </button>
                    <a
                      href={bid.doc_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                      title="Download PDF"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
