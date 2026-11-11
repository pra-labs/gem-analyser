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
    <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-[#121318] shadow-md">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/90 text-xs font-semibold uppercase tracking-wider text-zinc-400">
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
                    ? 'bg-orange-950/15 hover:bg-orange-950/25'
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
                    className="p-1 text-zinc-500 hover:text-orange-400 transition-colors"
                    title={isSaved ? 'In Kanban Pipeline' : 'Add to Pipeline'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-orange-400 fill-orange-400/20" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </td>

                {/* Match Score Badge (10% Strategic Tangerine Accent) */}
                <td className="py-3 px-3">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                      fit.score >= 80
                        ? 'bg-orange-500 text-white border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.3)]'
                        : fit.score >= 60
                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{fit.score}%</span>
                  </span>
                </td>

                {/* Bid Number */}
                <td className="py-3 px-3">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/60 text-zinc-300 whitespace-nowrap">
                    {bid.bid_number}
                  </span>
                </td>

                {/* Title */}
                <td className="py-3 px-4">
                  <div className="font-medium text-zinc-100 group-hover:text-orange-400 transition-colors line-clamp-2">
                    {bid.title || bid.category}
                  </div>
                  {bid.matched_keywords && bid.matched_keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {bid.matched_keywords.slice(0, 2).map((k) => (
                        <span
                          key={k}
                          className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                </td>

                {/* Department */}
                <td className="py-3 px-3 max-w-[180px]">
                  <span className="text-xs text-zinc-400 line-clamp-2" title={bid.department}>
                    {bid.department || '—'}
                  </span>
                </td>

                {/* Quantity */}
                <td className="py-3 px-3 text-right font-mono text-xs text-zinc-400">
                  {bid.quantity.toLocaleString()}
                </td>

                {/* Flags */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1">
                    {/* Procurement Type tag */}
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-zinc-900 text-zinc-300 border border-zinc-700">
                      {fit.procurementType === 'Software / SaaS'
                        ? 'SaaS'
                        : fit.procurementType === 'Services / Manpower'
                        ? 'Services'
                        : 'Supply'}
                    </span>
                    {bid.is_boq && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-zinc-900 text-zinc-400 border border-zinc-700">
                        BoQ
                      </span>
                    )}
                    {bid.reverse_auction && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-zinc-900 text-zinc-400 border border-zinc-700">
                        RA
                      </span>
                    )}
                  </div>
                </td>

                {/* Deadline */}
                <td className="py-3 px-3">
                  <div className="text-xs">
                    <span
                      className={`font-mono block whitespace-nowrap ${
                        isUrgent
                          ? 'text-orange-400 font-bold animate-pulse'
                          : isExpired
                          ? 'text-zinc-500'
                          : 'text-zinc-300'
                      }`}
                    >
                      {timeRem.text}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      {formatDateShort(bid.end_date)}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td
                  className="py-3 px-3 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onSelect(bid)}
                      className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 transition-colors"
                      title="Quick View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenAIBrief(bid)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-orange-400 border border-zinc-800 transition-colors"
                      title="AI Brief"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={bid.doc_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                      title="GeM PDF"
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
