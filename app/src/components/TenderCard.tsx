import React from 'react';
import {
  FileText,
  Bookmark,
  BookmarkCheck,
  Clock,
  Sparkles,
  Building,
  Layers,
  Bot,
  Shield,
  Brain,
  Car,
  Database,
  Radio,
  ExternalLink,
  Code,
  GraduationCap,
} from 'lucide-react';
import { Bid } from '@/types/bid';
import { formatDateTime, getTimeRemaining } from '@/utils/date';
import { computeFitScore } from '@/utils/aiScoring';

interface TenderCardProps {
  bid: Bid;
  onSelect: (bid: Bid) => void;
  onOpenAIBrief: (bid: Bid) => void;
  isSaved: boolean;
  onToggleSave: () => void;
  currentTime?: number;
}

function getKeywordIcon(kw: string) {
  const lower = kw.toLowerCase();
  if (lower.includes('chatbot')) return <Bot className="w-3 h-3 text-cyan-400" />;
  if (lower.includes('security') || lower.includes('cyber')) return <Shield className="w-3 h-3 text-rose-400" />;
  if (lower.includes('artificial') || lower.includes('ai') || lower.includes('machine learning') || lower.includes('deep learning'))
    return <Brain className="w-3 h-3 text-emerald-400" />;
  if (lower.includes('parking') || lower.includes('ev') || lower.includes('mobility'))
    return <Car className="w-3 h-3 text-amber-400" />;
  if (lower.includes('analytics') || lower.includes('data') || lower.includes('intelligence'))
    return <Database className="w-3 h-3 text-blue-400" />;
  if (lower.includes('iot') || lower.includes('sensor')) return <Radio className="w-3 h-3 text-purple-400" />;
  if (lower.includes('learning') || lower.includes('lms')) return <GraduationCap className="w-3 h-3 text-violet-400" />;
  if (lower.includes('software') || lower.includes('development')) return <Code className="w-3 h-3 text-indigo-400" />;
  return <Sparkles className="w-3 h-3 text-emerald-400" />;
}

export function TenderCard({
  bid,
  onSelect,
  onOpenAIBrief,
  isSaved,
  onToggleSave,
  currentTime,
}: TenderCardProps) {
  const timeRem = getTimeRemaining(bid.end_date, currentTime);
  const isUrgent = timeRem.badgeVariant === 'urgent';
  const isWarning = timeRem.badgeVariant === 'warning';
  const isExpired = timeRem.badgeVariant === 'expired';

  const fit = computeFitScore(bid);

  const cardStyle = isExpired
    ? 'border-zinc-800/60 bg-zinc-950/40 opacity-60 grayscale-[35%] hover:opacity-90 hover:grayscale-0'
    : isUrgent
    ? 'border-rose-500/50 bg-zinc-950 shadow-lg shadow-rose-500/10 hover:border-rose-400'
    : 'border-zinc-800/80 bg-zinc-950/90 hover:bg-zinc-900/70 hover:border-zinc-700';

  return (
    <div
      className={`group relative flex flex-col rounded-xl border p-5 transition-all duration-200 shadow-sm hover:shadow-xl ${cardStyle}`}
    >
      {/* Top Bar: Bid Number & Category Chips + Top-Right Bookmark Button */}
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

          {/* AI Match Score Badge */}
          <span
            className={`px-2 py-0.5 text-[11px] font-bold rounded-full border inline-flex items-center gap-1 ${
              fit.score >= 80
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : fit.score >= 60
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-400'
            }`}
            title={`PraLabs Fit Score: ${fit.score}% (${fit.reason})`}
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>{fit.score}% Match</span>
          </span>
        </div>

        {/* Right side: Status Tag + Clean Bookmark Icon */}
        <div className="flex items-center gap-2">
          {isUrgent ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              {timeRem.text}
            </span>
          ) : isWarning ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Clock className="w-3 h-3" />
              {timeRem.text}
            </span>
          ) : isExpired ? (
            <span className="text-[11px] font-mono text-zinc-500 px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-800">
              Expired
            </span>
          ) : (
            <span className="text-[11px] font-mono text-zinc-400">
              {timeRem.text}
            </span>
          )}

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isSaved
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:border-zinc-700'
            }`}
            title={isSaved ? 'Remove from Saved Pipeline' : 'Save to Pipeline'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-amber-400" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Title & Department */}
      <div
        className="cursor-pointer space-y-1 mb-2.5"
        onClick={() => onSelect(bid)}
      >
        <h3
          className="font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-2 text-base leading-snug"
          title={bid.title || bid.category}
        >
          {bid.title || bid.category}
        </h3>
        <p className="text-xs text-zinc-400 flex items-center gap-1.5 truncate">
          <Building className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
          <span className="truncate" title={bid.department}>
            {bid.department || 'Unspecified Department'}
          </span>
        </p>
      </div>

      {/* AI Fit Recommendation Hint Banner */}
      <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-[11px] flex items-center justify-between text-zinc-300">
        <span className="text-zinc-400 truncate pr-2">💡 {fit.reason}</span>
        <span className="font-mono font-semibold uppercase text-emerald-400 shrink-0">
          {fit.recommendation}
        </span>
      </div>

      {/* Detected Intelligence Tags with Categorical Icons */}
      {bid.matched_keywords && bid.matched_keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {bid.matched_keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-900/90 border border-zinc-700/60 text-zinc-300"
            >
              {getKeywordIcon(kw)}
              <span>{kw}</span>
            </span>
          ))}
        </div>
      )}

      {/* Metric Grid */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-xs mb-4 mt-auto">
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
          <span className="font-mono text-zinc-300">
            {formatDateTime(bid.end_date).split(',')[0]}
          </span>
        </div>
      </div>

      {/* Standardized Primary vs Secondary Action Toolbar */}
      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
        {/* AI Brief Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenAIBrief(bid);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors font-medium cursor-pointer"
          title="Extract Scope of Work, EMD and SLA clauses"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>AI Brief</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Secondary Action: Official PDF Link */}
          <a
            href={bid.doc_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/80 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
            title="Download Official GeM PDF Document"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>PDF</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          {/* Primary Action: Quick View */}
          <button
            onClick={() => onSelect(bid)}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
          >
            Quick View
          </button>
        </div>
      </div>
    </div>
  );
}
