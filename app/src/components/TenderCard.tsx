import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Sparkles,
  Building,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Bid } from '@/types/bid';
import { getTimeRemaining } from '@/utils/date';
import { computeFitScore } from '@/utils/aiScoring';

interface TenderCardProps {
  bid: Bid;
  onSelect: (bid: Bid) => void;
  onOpenAIBrief: (bid: Bid) => void;
  isSaved: boolean;
  onToggleSave: () => void;
  currentTime?: number;
}

export function TenderCard({
  bid,
  onSelect,
  onOpenAIBrief,
  isSaved,
  onToggleSave,
  currentTime,
}: TenderCardProps) {
  const [showFullInsight, setShowFullInsight] = useState(false);
  const timeRem = getTimeRemaining(bid.end_date, currentTime);
  const isUrgent = timeRem.badgeVariant === 'urgent';
  const isWarning = timeRem.badgeVariant === 'warning';
  const isExpired = timeRem.badgeVariant === 'expired';

  const fit = computeFitScore(bid);

  // 60-30-10 Card Shell (30% neutral slate structure with 10% orange accents)
  const cardStyle = isExpired
    ? 'border-zinc-800/60 bg-zinc-950/40 opacity-60 grayscale-[35%] hover:opacity-90 hover:grayscale-0'
    : isUrgent
    ? 'border-orange-500/70 bg-[#121318] shadow-lg shadow-orange-500/10 hover:border-orange-400'
    : 'border-zinc-800/90 bg-[#121318] hover:bg-[#181920] hover:border-zinc-700';

  return (
    <div
      onClick={() => onSelect(bid)}
      className={`group relative flex flex-col rounded-xl border p-4 sm:p-5 transition-all duration-200 shadow-sm hover:shadow-xl cursor-pointer ${cardStyle}`}
    >
      {/* 1. Top Bar: Bid Number & Category Chips + Top-Right Integrated Fit Score Pill */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/60 text-zinc-300">
            {bid.bid_number}
          </span>
          {/* Procurement Type Tag (30% Neutral Structure) */}
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-zinc-900 text-zinc-300 border border-zinc-700/80">
            {fit.procurementType}
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

        {/* 10% Strategic High-Contrast Accent Pill: Integrated with label */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-2.5 py-0.5 text-xs font-bold rounded-full border font-mono inline-flex items-center gap-1 transition-all ${
              fit.score >= 80
                ? 'bg-orange-500 text-white border-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                : fit.score >= 60
                ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
            title={`Fit Score: ${fit.score}% (${fit.recommendation})`}
          >
            <span>{fit.score}% Fit</span>
          </span>
        </div>
      </div>

      {/* 2. Main Title: Strict line-clamp-2 for clean uniform heights */}
      <div className="space-y-1 mb-2">
        <h3
          className="font-semibold text-zinc-100 group-hover:text-orange-400 transition-colors line-clamp-2 text-sm sm:text-base leading-snug"
          title={bid.title || bid.category}
        >
          {bid.title || bid.category}
        </h3>
      </div>

      {/* 3. Consolidated Metadata Row: Department & Deadline Countdown */}
      <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-xs mb-3">
        <div className="truncate">
          <span className="text-zinc-500 block text-[10px] uppercase font-semibold flex items-center gap-1">
            <Building className="w-3 h-3 text-zinc-400" /> Department
          </span>
          <span className="text-zinc-300 truncate block text-[11px]" title={bid.department}>
            {bid.department || 'Unspecified'}
          </span>
        </div>
        <div>
          <span className="text-zinc-500 block text-[10px] uppercase font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400" /> Deadline
          </span>
          <span
            className={`font-mono text-[11px] font-medium block truncate ${
              isUrgent
                ? 'text-orange-400 font-bold animate-pulse'
                : isWarning
                ? 'text-orange-300 font-semibold'
                : isExpired
                ? 'text-zinc-500'
                : 'text-zinc-300'
            }`}
          >
            {timeRem.text}
          </span>
        </div>
      </div>

      {/* 4. Compact AI Insight Callout with "More" Toggle */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setShowFullInsight(!showFullInsight);
        }}
        className="mb-3 px-2.5 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400 cursor-pointer hover:border-zinc-700 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="truncate pr-2">
            💡 <strong className="text-zinc-200">{fit.recommendation}:</strong> {fit.reason}
          </span>
          <span className="text-orange-400 shrink-0 flex items-center gap-0.5 text-[10px]">
            {showFullInsight ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </span>
        </div>
        {showFullInsight && fit.strengths.length > 0 && (
          <div className="mt-2 pt-2 border-t border-zinc-800 space-y-1 text-[10px] text-zinc-300">
            {fit.strengths.map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-orange-400"></span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Detected Intelligence Tags: Clean, neutral, text-only pills to avoid icon clutter */}
      {bid.matched_keywords && bid.matched_keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 mt-auto">
          {bid.matched_keywords.slice(0, 3).map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-900/90 border border-zinc-800 text-zinc-300"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* 6. Action Toolbar: Primary Quick View CTA + Clean Single + Track CTA + Tool buttons */}
      <div
        className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Quick View Primary CTA (Vibrant Tangerine Accent) */}
        <button
          onClick={() => onSelect(bid)}
          className="flex-1 py-1.5 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 font-semibold text-xs text-white shadow-md shadow-orange-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-center cursor-pointer active:scale-[0.98]"
        >
          Quick View
        </button>

        {/* Clean Pipeline CTA: Single '+' and clean 'Track' / 'In Pipeline' label */}
        <button
          onClick={onToggleSave}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1 transition-all cursor-pointer ${
            isSaved
              ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
          }`}
          title={isSaved ? 'In Kanban Pipeline' : 'Track in Pipeline'}
        >
          {isSaved ? <Check className="w-3.5 h-3.5 text-orange-400" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isSaved ? 'Tracked' : 'Track'}</span>
        </button>

        {/* Clear Tool Buttons: AI Brief + GeM PDF */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenAIBrief(bid)}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-orange-400 border border-zinc-800 transition-colors"
            title="Instant AI Brief"
            aria-label="Instant AI Brief"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          <a
            href={bid.doc_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            title="Download GeM PDF"
            aria-label="Download GeM PDF"
          >
            <FileText className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
