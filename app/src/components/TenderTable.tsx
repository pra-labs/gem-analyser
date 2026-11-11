import React from 'react';
import {
  FileText,
  Bookmark,
  BookmarkCheck,
  Eye,
} from 'lucide-react';
import { Bid } from '@/types/bid';
import { formatDateShort, getTimeRemaining } from '@/utils/date';

interface TenderTableProps {
  bids: Bid[];
  onSelect: (bid: Bid) => void;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  currentTime?: number;
}

export function TenderTable({
  bids,
  onSelect,
  savedIds,
  onToggleSave,
  currentTime,
}: TenderTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/60">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/60 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <th className="py-3 px-4 w-12 text-center">Save</th>
            <th className="py-3 px-4">Bid Number</th>
            <th className="py-3 px-4 min-w-[280px]">Title / Category</th>
            <th className="py-3 px-4">Department</th>
            <th className="py-3 px-4 text-right">Quantity</th>
            <th className="py-3 px-4">Flags</th>
            <th className="py-3 px-4">Deadline</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
          {bids.map((bid) => {
            const isSaved = savedIds.has(bid.id);
            const timeRem = getTimeRemaining(bid.end_date, currentTime);

            return (
              <tr
                key={bid.id}
                onClick={() => onSelect(bid)}
                className="group hover:bg-zinc-900/40 cursor-pointer transition-colors"
              >
                {/* Save bookmark */}
                <td
                  className="py-3 px-4 text-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(bid.id);
                  }}
                >
                  <button
                    className={`p-1 rounded transition-colors ${
                      isSaved
                        ? 'text-amber-400'
                        : 'text-zinc-600 group-hover:text-zinc-400'
                    }`}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </td>

                {/* Bid Number */}
                <td className="py-3 px-4 font-mono text-xs font-medium text-zinc-300 whitespace-nowrap">
                  {bid.bid_number}
                </td>

                {/* Title & Category */}
                <td className="py-3 px-4">
                  <div className="font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {bid.title || bid.category}
                  </div>
                  {bid.matched_keywords && bid.matched_keywords.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {bid.matched_keywords.map((kw) => (
                        <span
                          key={kw}
                          className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </td>

                {/* Department */}
                <td className="py-3 px-4 text-xs text-zinc-400 max-w-[200px] truncate">
                  {bid.department || '—'}
                </td>

                {/* Quantity */}
                <td className="py-3 px-4 font-mono text-right text-xs font-medium text-zinc-200 whitespace-nowrap">
                  {bid.quantity.toLocaleString('en-IN')}
                </td>

                {/* Flags */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {bid.is_boq && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        BoQ
                      </span>
                    )}
                    {bid.reverse_auction && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        RA
                      </span>
                    )}
                    {!bid.is_boq && !bid.reverse_auction && (
                      <span className="text-zinc-600 text-xs">—</span>
                    )}
                  </div>
                </td>

                {/* Deadline */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div
                    className={`text-xs font-mono font-medium ${
                      timeRem.badgeVariant === 'urgent'
                        ? 'text-rose-400'
                        : timeRem.badgeVariant === 'warning'
                        ? 'text-amber-400'
                        : 'text-zinc-300'
                    }`}
                  >
                    {timeRem.text}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {formatDateShort(bid.end_date)}
                  </div>
                </td>

                {/* Actions */}
                <td
                  className="py-3 px-4 text-center whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onSelect(bid)}
                      className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                      title="Quick Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={bid.doc_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-zinc-800 text-emerald-400 hover:text-emerald-300 transition-colors"
                      title="Download PDF"
                    >
                      <FileText className="w-4 h-4" />
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
