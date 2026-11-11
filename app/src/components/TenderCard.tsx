import React, { useState } from 'react';
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
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
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
  const [showFullInsight, setShowFullInsight] = useState(false);
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
      onClick={() => onSelect(bid)}
      className={`group relative flex flex-col rounded-xl border p-4 sm:p-5 transition-all duration-200 shadow-sm hover:shadow-xl cursor-pointer ${cardStyle}`}
    >
      {/* 1. Top Bar: Bid Number & Category Chips + Top-Right Distinct Fit Score Pill */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/60 text-zinc-300">
            {bid.bid_number}
          </span>
          {/* Procurement Type Tag */}
          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
            fit.procurementType === 'Software / SaaS'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : fit.procurementType === 'Services / Manpower'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              : 'bg-zinc-800/80 text-zinc-400 border-zinc-700'
          }`}>
            {fit.procurementType}
          </span>
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
        </div>

        {/* Distinct Fit Score Pill at Top-Right */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-2 py-0.5 text-xs font-bold rounded-full border font-mono inline-flex items-center gap-1 ${
              fit.score >= 80
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                : fit.score >= 60
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}
            title={`Fit Score: ${fit.score}% (${fit.recommendation})`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{fit.score}%</span>
          </span>
        </div>
      </div>

      {/* 2. Main Title */}
      <div className="space-y-1 mb-2">
        <h3
          className="font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-2 text-sm sm:text-base leading-snug"
          title={bid.title || bid.category}
        >
          {bid.title || bid.category}
        </h3>
      </div>

      {/* 3. Consolidated Metadata Row: Department, Quantity, Urgency Countdown */}
      <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs mb-3">
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
                ? 'text-rose-400 font-bold animate-pulse'
                : isWarning
                ? 'text-amber-400 font-semibold'
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
        className="mb-3 px-2.5 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/70 text-[11px] text-zinc-400 cursor-pointer hover:border-zinc-700 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="truncate pr-2">
            💡 <strong className="text-zinc-300">{fit.recommendation}:</strong> {fit.reason}
          </span>
          <span className="text-emerald-400 shrink-0 flex items-center gap-0.5 text-[10px]">
            {showFullInsight ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </span>
        </div>
        {showFullInsight && fit.strengths.length > 0 && (
          <div className="mt-2 pt-2 border-t border-zinc-800 space-y-1 text-[10px] text-zinc-300">
            {fit.strengths.map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Detected Intelligence Tags with Categorical Icons */}
      {bid.matched_keywords && bid.matched_keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 mt-auto">
          {bid.matched_keywords.slice(0, 3).map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-300"
            >
              {getKeywordIcon(kw)}
              <span>{kw}</span>
            </span>
          ))}
        </div>
      )}

      {/* 6. Action Toolbar: Primary Quick View + One-Tap +Kanban + Secondary Icons */}
      <div
        className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Quick View Primary CTA */}
        <button
          onClick={() => onSelect(bid)}
          className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-center cursor-pointer"
        >
          Quick View
        </button>

        {/* 1-Tap Kanban / Bookmark Button */}
        <button
          onClick={onToggleSave}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1 transition-all cursor-pointer ${
            isSaved
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
          title={isSaved ? 'In Kanban Pipeline' : 'Add to Kanban Pipeline'}
        >
          {isSaved ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isSaved ? 'In Pipeline' : '+ Pipeline'}</span>
        </button>

        {/* Secondary Tool Icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenAIBrief(bid)}
            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors"
            title="Instant AI Brief"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          <a
            href={bid.doc_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            title="Download PDF"
          >
            <FileText className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
