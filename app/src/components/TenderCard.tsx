import React from 'react';
import {
  FileText,
  Bookmark,
  BookmarkCheck,
  Clock,
  Sparkles,
  Building,
  Layers,
} from 'lucide-react';
import { Bid } from '@/types/bid';
import { formatDateTime, getTimeRemaining } from '@/utils/date';

interface TenderCardProps {
  bid: Bid;
  onSelect: (bid: Bid) => void;
  isSaved: boolean;
  onToggleSave: () => void;
  currentTime?: number;
}

export function TenderCard({
  bid,
  onSelect,
  isSaved,
  onToggleSave,
  currentTime,
}: TenderCardProps) {
  const timeRem = getTimeRemaining(bid.end_date, currentTime);

  return (
    <div className="group relative flex flex-col bg-zinc-950/80 hover:bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 transition-all duration-200 shadow-sm hover:shadow-md">
      {/* Top Bar: Bid Number, Badges, Bookmark */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/60 text-zinc-300">
            {bid.bid_number}
          </span>
          {bid.is_boq && (
            <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              BoQ
            </span>
          )}
          {bid.reverse_auction && (
            <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              RA
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className={`p-1.5 rounded-lg border transition-colors ${
            isSaved
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-zinc-900/80 border-zinc-800 text-zinc-500 hover:text-zinc-300'
          }`}
          title={isSaved ? 'Remove from Saved' : 'Save Tender'}
        >
          {isSaved ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Main Title & Category */}
      <div
        className="cursor-pointer space-y-1 mb-4"
        onClick={() => onSelect(bid)}
      >
        <h3 className="font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-2 text-base leading-snug">
          {bid.title || bid.category}
        </h3>
        <p className="text-xs text-zinc-400 flex items-center gap-1.5 truncate">
          <Building className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
          <span className="truncate">{bid.department || 'Unspecified Department'}</span>
        </p>
      </div>

      {/* Intelligence Tags */}
      {bid.matched_keywords && bid.matched_keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {bid.matched_keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            >
              <Sparkles className="w-2.5 h-2.5" />
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Metric Grid */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 text-xs mb-4 mt-auto">
        <div>
          <span className="text-zinc-500 block text-[11px] flex items-center gap-1">
            <Layers className="w-3 h-3 text-zinc-400" /> Quantity
          </span>
          <span className="font-mono font-medium text-zinc-200">
            {bid.quantity.toLocaleString('en-IN')} units
          </span>
        </div>
        <div>
          <span className="text-zinc-500 block text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400" /> Closing Date
          </span>
          <span
            className={`font-mono font-medium ${
              timeRem.badgeVariant === 'urgent'
                ? 'text-rose-400 font-semibold'
                : 'text-zinc-300'
            }`}
          >
            {timeRem.text}
          </span>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
        <span className="text-zinc-500 font-mono text-[11px]">
          End: {formatDateTime(bid.end_date).split(',')[0]}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelect(bid)}
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors"
          >
            Quick View
          </button>
          <a
            href={bid.doc_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded-md text-emerald-400 hover:text-emerald-300 transition-colors"
            title="Download PDF"
          >
            <FileText className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
