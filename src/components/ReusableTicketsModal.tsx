'use client';

import React from 'react';
import { useTicket } from '../context/TicketContext';
import { Recycle, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReusableTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReusableTicketsModal: React.FC<ReusableTicketsModalProps> = ({ isOpen, onClose }) => {
  const { returnedTicketsPool, shift } = useTicket();

  if (!isOpen) return null;

  const isAscending = shift.ticketDirection === 'ascending';
  // Sort pool for display: ascending -> lowest first, descending -> highest first
  const sortedPool = [...returnedTicketsPool].sort((a, b) => isAscending ? a - b : b - a);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Recycle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Reusable Ticket Pool</h2>
              <p className="text-xs text-slate-400">Returned tickets ready to be sold</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full border border-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Automatic Priority Issuing</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed pl-6">
            When a customer buys tickets, the app will automatically issue these returned tickets first before advancing the main ticket counter.
          </p>
        </div>

        {/* Ticket list */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Available Reusable Tickets</span>
            <span className="font-mono text-emerald-400">{sortedPool.length} pcs</span>
          </div>

          {sortedPool.length === 0 ? (
            <div className="text-center py-8 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <Recycle className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-400">No returned tickets in pool</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                When customers return tickets, their ticket numbers will appear here and be reused automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
              {sortedPool.map((ticketNum, index) => (
                <div
                  key={index}
                  className="bg-slate-950 border border-emerald-500/40 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-md relative group"
                >
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    {index === 0 ? 'Next Up' : `Queue #${index + 1}`}
                  </span>
                  <span className="text-2xl font-black font-mono text-white">
                    #{ticketNum}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl transition"
          >
            CLOSE / BACK TO POS
          </button>
        </div>
      </div>
    </div>
  );
};
