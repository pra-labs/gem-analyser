import React from 'react';
import {
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Trophy,
  CheckCircle,
  FileCheck,
  SearchCheck,
} from 'lucide-react';
import { Bid, PipelineStage } from '@/types/bid';
import { getTimeRemaining } from '@/utils/date';
import { computeFitScore } from '@/utils/aiScoring';

interface PipelineKanbanProps {
  bids: Bid[];
  savedIds: Set<string>;
  getStage: (id: string) => PipelineStage;
  updateStage: (id: string, stage: PipelineStage) => void;
  onRemove: (id: string) => void;
  onSelectBid: (bid: Bid) => void;
  onOpenAIBrief: (bid: Bid) => void;
  currentTime?: number;
}

const STAGES: Array<{ id: PipelineStage; title: string; color: string; icon: React.ReactNode }> = [
  {
    id: 'saved',
    title: 'Bookmarked',
    color: 'border-zinc-700 text-zinc-300',
    icon: <Sparkles className="w-3.5 h-3.5 text-zinc-400" />,
  },
  {
    id: 'review',
    title: 'Feasibility Review',
    color: 'border-blue-500/50 text-blue-300',
    icon: <SearchCheck className="w-3.5 h-3.5 text-blue-400" />,
  },
  {
    id: 'prep',
    title: 'Doc Prep & Pricing',
    color: 'border-amber-500/50 text-amber-300',
    icon: <FileCheck className="w-3.5 h-3.5 text-amber-400" />,
  },
  {
    id: 'submitted',
    title: 'Bid Submitted',
    color: 'border-indigo-500/50 text-indigo-300',
    icon: <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />,
  },
  {
    id: 'won',
    title: 'Awarded / Won',
    color: 'border-emerald-500/50 text-emerald-300',
    icon: <Trophy className="w-3.5 h-3.5 text-emerald-400" />,
  },
];

export function PipelineKanban({
  bids,
  savedIds,
  getStage,
  updateStage,
  onRemove,
  onSelectBid,
  onOpenAIBrief,
  currentTime,
}: PipelineKanbanProps) {
  const savedBids = bids.filter((b) => savedIds.has(b.id));

  // Organize bids by stages
  const stageBids: Record<PipelineStage, Bid[]> = {
    saved: [],
    review: [],
    prep: [],
    submitted: [],
    won: [],
  };

  for (const b of savedBids) {
    const stage = getStage(b.id);
    if (stageBids[stage]) {
      stageBids[stage].push(b);
    } else {
      stageBids.saved.push(b);
    }
  }

  const handleMove = (id: string, currentStage: PipelineStage, direction: 'prev' | 'next') => {
    const currentIndex = STAGES.findIndex((s) => s.id === currentStage);
    if (direction === 'prev' && currentIndex > 0) {
      updateStage(id, STAGES[currentIndex - 1].id);
    } else if (direction === 'next' && currentIndex < STAGES.length - 1) {
      updateStage(id, STAGES[currentIndex + 1].id);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start animate-in fade-in duration-300">
      {STAGES.map((col, colIdx) => {
        const items = stageBids[col.id] || [];

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-md min-h-[500px]"
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {col.icon}
                <span className="font-semibold text-xs text-zinc-100">{col.title}</span>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                {items.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[70vh] scrollbar-thin">
              {items.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-600 border border-dashed border-zinc-900 rounded-xl">
                  Drop / Move bids here
                </div>
              ) : (
                items.map((bid) => {
                  const fit = computeFitScore(bid);
                  const timeRem = getTimeRemaining(bid.end_date, currentTime);

                  return (
                    <div
                      key={bid.id}
                      className="group rounded-xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-3.5 space-y-2.5 shadow-sm transition-all text-xs"
                    >
                      {/* Top tags */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[10px] font-semibold text-zinc-300 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                          {bid.bid_number}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 font-mono">
                          {fit.score}% Match
                        </span>
                      </div>

                      {/* Title */}
                      <h4
                        onClick={() => onSelectBid(bid)}
                        className="font-medium text-zinc-200 group-hover:text-emerald-400 line-clamp-2 cursor-pointer leading-snug"
                        title={bid.title || bid.category}
                      >
                        {bid.title || bid.category}
                      </h4>

                      {/* Department */}
                      <p className="text-[11px] text-zinc-500 truncate" title={bid.department}>
                        🏛️ {bid.department || 'Govt Department'}
                      </p>

                      {/* Deadline */}
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800/80">
                        <span className="text-zinc-400 font-mono">{timeRem.text}</span>
                        <button
                          onClick={() => onOpenAIBrief(bid)}
                          className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300"
                        >
                          AI Brief
                        </button>
                      </div>

                      {/* Move Toolbar */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                        <div className="flex items-center gap-1">
                          {colIdx > 0 && (
                            <button
                              onClick={() => handleMove(bid.id, col.id, 'prev')}
                              className="p-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                              title="Move to previous stage"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {colIdx < STAGES.length - 1 && (
                            <button
                              onClick={() => handleMove(bid.id, col.id, 'next')}
                              className="p-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                              title="Move to next stage"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => onRemove(bid.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                          title="Remove from pipeline"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
