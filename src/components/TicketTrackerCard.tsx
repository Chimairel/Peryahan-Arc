'use client';

import React, { useState } from 'react';
import { useTicket } from '../context/TicketContext';
import { Ticket, ArrowUpRight, ArrowDownRight, Settings, ShieldCheck, Edit3 } from 'lucide-react';

interface TicketTrackerCardProps {
  onOpenSettings: () => void;
  onOpenSummary: () => void;
}

export const TicketTrackerCard: React.FC<TicketTrackerCardProps> = ({
  onOpenSettings,
  onOpenSummary,
}) => {
  const {
    shift,
    totalTicketsSold,
    totalRevenue,
    lastSoldTicketNum,
    adjustCurrentTicketNum,
    setStartingTicketNum,
    setTicketDirection,
    addSpoiledTicket,
  } = useTicket();

  const [isAdjusting, setIsAdjusting] = useState(false);
  const [newNumInput, setNewNumInput] = useState(shift.currentTicketNum.toString());

  const isAscending = shift.ticketDirection === 'ascending';

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(newNumInput, 10);
    if (!isNaN(val)) {
      adjustCurrentTicketNum(val);
      setIsAdjusting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Prominent Header Banner: Starting Ticket Number & Direction Switch */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 rounded-2xl p-4 sm:p-5 shadow-lg shadow-amber-500/10 text-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-amber-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-slate-950/10 px-2 py-0.5 rounded text-slate-900">
              SHIFT STARTING TICKET #
            </span>
            <button
              onClick={onOpenSettings}
              className="text-xs font-bold underline hover:text-slate-800"
            >
              (Edit)
            </button>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight drop-shadow-sm">
              #{shift.startingTicketNum}
            </span>
            <span className="text-xs font-bold text-slate-800 uppercase">
              {isAscending ? '⬆️ Counting Up (1, 2, 3...)' : '⬇️ Counting Down (100, 99, 98...)'}
            </span>
          </div>
        </div>

        {/* Ascending / Descending Direction Toggle */}
        <div className="flex items-center bg-slate-950/20 p-1 rounded-xl gap-1 border border-slate-950/10 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setTicketDirection('ascending')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-black transition ${
              isAscending
                ? 'bg-slate-950 text-amber-400 shadow-md'
                : 'text-slate-900 hover:bg-slate-950/10'
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Ascending (1 → 2)</span>
          </button>

          <button
            type="button"
            onClick={() => setTicketDirection('descending')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-black transition ${
              !isAscending
                ? 'bg-slate-950 text-amber-400 shadow-md'
                : 'text-slate-900 hover:bg-slate-950/10'
            }`}
          >
            <ArrowDownRight className="h-4 w-4" />
            <span>Descending (100 → 99)</span>
          </button>
        </div>
      </div>

      {/* Main Ticket Status Tracker Bento Box */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/40 p-4 sm:p-6 border border-amber-500/20 shadow-2xl text-white">
        {/* Glow */}
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Ticket className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Live Ticket Counter Status
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Settings className="h-3.5 w-3.5 text-amber-400" />
            <span>Shift Setup</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Current Next Ticket # */}
          <div className="col-span-2 sm:col-span-1 bg-slate-950/70 rounded-xl p-3 border border-amber-500/40">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-400">NEXT TICKET TO ISSUE</span>
              <button
                onClick={() => {
                  setNewNumInput(shift.currentTicketNum.toString());
                  setIsAdjusting(!isAdjusting);
                }}
                className="text-[10px] text-amber-400 hover:underline font-mono"
              >
                [Adjust]
              </button>
            </div>

            {isAdjusting ? (
              <form onSubmit={handleSaveAdjust} className="flex gap-1 mt-1">
                <input
                  type="number"
                  value={newNumInput}
                  onChange={(e) => setNewNumInput(e.target.value)}
                  className="w-full bg-slate-800 border border-amber-500/50 rounded px-2 py-1 text-sm font-mono text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-amber-500 text-slate-950 text-xs font-bold px-2 py-1 rounded hover:bg-amber-400"
                >
                  Set
                </button>
              </form>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black font-mono tracking-tight text-amber-400">
                  #{shift.currentTicketNum}
                </span>
              </div>
            )}
            <p className="text-[10px] text-slate-400 mt-1">
              Mode: {isAscending ? '+1 per ticket' : '-1 per ticket'}
            </p>
          </div>

          {/* Tickets Sold */}
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block mb-1">TICKETS SOLD</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {totalTicketsSold}
              </span>
              <span className="text-xs text-slate-400">pcs</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Last issued: #{lastSoldTicketNum}
            </p>
          </div>

          {/* Total Money Earned */}
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block mb-1">TOTAL EARNED</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-yellow-400">
                ₱{totalRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Gross cash revenue</p>
          </div>

          {/* Spoiled Tickets */}
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">SPOILED</span>
              <span className="text-xs font-mono font-bold text-rose-400">
                {shift.spoiledTicketsCount}
              </span>
            </div>
            <button
              onClick={() => addSpoiledTicket(1)}
              className="w-full mt-2 py-1 px-2 text-[11px] font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 rounded transition text-center"
            >
              +1 Damaged Tix
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Offline Local Storage Active</span>
          </div>
          <button
            onClick={onOpenSummary}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 transition shadow-md active:scale-95"
          >
            End Shift Report
          </button>
        </div>
      </div>
    </div>
  );
};
