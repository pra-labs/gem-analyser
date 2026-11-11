import React from 'react';
import {
  X,
  FileText,
  ExternalLink,
  Calendar,
  Layers,
  Building,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Bid } from '@/types/bid';
import { formatDateTime, getTimeRemaining } from '@/utils/date';

interface TenderModalProps {
  bid: Bid | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  currentTime?: number;
}

export function TenderModal({
  bid,
  onClose,
  isSaved,
  onToggleSave,
  currentTime,
}: TenderModalProps) {
  if (!bid) return null;

  const timeRem = getTimeRemaining(bid.end_date, currentTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/40 flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-semibold tracking-wider">
                {bid.bid_number}
              </span>
              {bid.is_boq && (
                <span className="px-2 py-0.5 text-xs rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                  BoQ Tender
                </span>
              )}
              {bid.reverse_auction && (
                <span className="px-2 py-0.5 text-xs rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                  Reverse Auction
                </span>
              )}
              <span
                className={`px-2 py-0.5 text-xs rounded-md font-medium border ${
                  timeRem.badgeVariant === 'urgent'
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    : timeRem.badgeVariant === 'warning'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {timeRem.text}
              </span>
            </div>
            <h3 className="text-xl font-bold text-zinc-100 leading-snug pt-1">
              {bid.title || bid.category}
            </h3>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-zinc-500" />
              {bid.department || 'Not Specified'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSave}
              className={`p-2 rounded-lg border transition-all ${
                isSaved
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save Tender'}
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-zinc-300">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
              <span className="text-xs text-zinc-500 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-zinc-400" /> Quantity
              </span>
              <span className="text-lg font-mono font-bold text-zinc-100">
                {bid.quantity.toLocaleString('en-IN')} units
              </span>
            </div>

            <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
              <span className="text-xs text-zinc-500 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" /> Status
              </span>
              <span
                className={`text-sm font-semibold capitalize ${
                  timeRem.isExpired ? 'text-zinc-500' : 'text-emerald-400'
                }`}
              >
                {timeRem.isExpired ? 'Expired' : 'Active Submission'}
              </span>
            </div>

            <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
              <span className="text-xs text-zinc-500 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /> Evaluation
              </span>
              <span className="text-sm font-medium text-zinc-200">
                {bid.reverse_auction ? 'e-Reverse Auction' : 'Single/Two Stage'}
              </span>
            </div>

            <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
              <span className="text-xs text-zinc-500 flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" /> Procurement Type
              </span>
              <span className="text-sm font-medium text-zinc-200">
                {bid.is_boq ? 'BoQ Package' : 'Custom Item'}
              </span>
            </div>
          </div>

          {/* Timeline Schedule */}
          <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" /> Submission Schedule & Deadlines
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-xs text-zinc-500 block">Bid Published / Start Date:</span>
                <span className="text-sm font-mono text-zinc-200">
                  {formatDateTime(bid.start_date)}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">Bid Closing / Submission Deadline:</span>
                <span className="text-sm font-mono font-semibold text-rose-400">
                  {formatDateTime(bid.end_date)}
                </span>
              </div>
            </div>
          </div>

          {/* Categories and Scope */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Item Specification / Categories
            </h4>
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed max-h-48 overflow-y-auto">
              {bid.full_categories || bid.category || 'No expanded items specified.'}
            </div>
          </div>

          {/* Matched Keywords / AI Tagging */}
          {bid.matched_keywords && bid.matched_keywords.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Matched Intelligence Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {bid.matched_keywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 border border-indigo-500/30 text-indigo-300"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-zinc-500">
            Internal ID: <span className="font-mono text-zinc-400">{bid.id}</span>
          </span>
          <div className="flex items-center gap-3">
            <a
              href={bid.doc_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
            >
              <FileText className="w-4 h-4" />
              Download GeM Tender PDF
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
