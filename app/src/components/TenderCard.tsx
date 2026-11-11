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

interface TenderCardProps {
  bid: Bid;
  onSelect: (bid: Bid) => void;
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
  isSaved,
  onToggleSave,
  currentTime,
}: TenderCardProps) {
  const timeRem = getTimeRemaining(bid.end_date, currentTime);

  return (
    <div className="group relative flex flex-col bg-zinc-950/90 hover:bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 transition-all duration-200 shadow-sm hover:shadow-xl">
      {/* Top Bar: Bid Number & Category Chips */}
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

        {/* Pulsating / Urgent Deadline Badge */}
        {timeRem.badgeVariant === 'urgent' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.25)] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            {timeRem.text}
          </span>
        ) : timeRem.badgeVariant === 'warning' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            {timeRem.text}
          </span>
        ) : (
          <span className="text-[11px] font-mono text-zinc-400">
            {timeRem.text}
          </span>
        )}
      </div>

      {/* Main Title & Department */}
      <div
        className="cursor-pointer space-y-1 mb-3.5"
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

      {/* Detected Intelligence Tags with Distinct Categorical Icons */}
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

      {/* Standardized Unified Action Toolbar */}
      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
            isSaved
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
          title={isSaved ? 'Remove from Saved Pipeline' : 'Save to Pipeline'}
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelect(bid)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            Quick View
          </button>
          <a
            href={bid.doc_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors font-medium"
            title="Download Official GeM PDF Document"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>
    </div>
  );
}
