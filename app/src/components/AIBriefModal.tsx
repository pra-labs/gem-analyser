import React from 'react';
import { X, Sparkles, ShieldAlert, CheckCircle2, FileText, AlertTriangle, ExternalLink } from 'lucide-react';
import { Bid } from '@/types/bid';
import { generateAIBrief } from '@/utils/aiBrief';

interface AIBriefModalProps {
  bid: Bid | null;
  onClose: () => void;
}

export function AIBriefModal({ bid, onClose }: AIBriefModalProps) {
  if (!bid) return null;

  const brief = generateAIBrief(bid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100">
                  AI Tender Brief & Clause Extraction
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {brief.fitScore}% Fit
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {brief.bidNumber} • {brief.department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm scrollbar-thin">
          {/* Executive Summary Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 to-zinc-900 border border-indigo-500/20 flex items-center justify-between">
            <span className="text-xs text-zinc-300 leading-relaxed">
              <strong>Assessment:</strong> {brief.recommendation} — High probability of technical qualification under startup/MSE quota.
            </span>
          </div>

          {/* 1. Scope of Work (3 Bullet Points) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Scope of Work (Key Deliverables)
            </h3>
            <div className="space-y-2">
              {brief.scopeOfWork.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Mandatory Criteria & EMD / ePBG */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Mandatory Eligibility & EMD Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase">EMD Deposit</span>
                <p className="text-zinc-200">{brief.emdAndPbG.estimatedEmd}</p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase">Performance Security</span>
                <p className="text-zinc-200">{brief.emdAndPbG.pbGRequirement}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-400">
              💡 <strong>MSME Advantage:</strong> {brief.emdAndPbG.relaxationNote}
            </div>
          </div>

          {/* 3. Penalty, SLA & Risk Flags */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> SLA Risk & Penalty Flags
            </h3>
            <div className="space-y-2">
              {brief.risksAndSLA.map((risk, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5"></span>
                  <span className="leading-relaxed">{risk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/40">
          <a
            href={bid.doc_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Download Full Official GeM PDF
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Close Brief
          </button>
        </div>
      </div>
    </div>
  );
}
