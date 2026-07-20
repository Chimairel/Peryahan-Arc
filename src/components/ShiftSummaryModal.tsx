'use client';

import React from 'react';
import { useTicket } from '../context/TicketContext';
import { FileText, RefreshCw, X } from 'lucide-react';

interface ShiftSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftSummaryModal: React.FC<ShiftSummaryModalProps> = ({ isOpen, onClose }) => {
  const { getShiftSummary, endShift, startNewShift } = useTicket();

  if (!isOpen) return null;

  const summary = getShiftSummary();

  const formattedStartTime = new Date(summary.shiftStartTime).toLocaleString();
  const formattedEndTime = new Date(summary.shiftEndTime).toLocaleString();

  const handleConfirmEndShift = () => {
    if (confirm('Are you sure you want to end this shift and start a new ticket shift?')) {
      endShift();
      startNewShift(summary.endingTicketNum + 1);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Shift Summary Report</h2>
              <p className="text-xs text-slate-400">{summary.rideName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full border border-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Ticket sequence & financial stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Starting Ticket #
            </span>
            <span className="text-2xl font-black font-mono text-amber-400">
              #{summary.startingTicketNum}
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Ending Ticket #
            </span>
            <span className="text-2xl font-black font-mono text-amber-400">
              #{summary.endingTicketNum}
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Net Tickets Sold
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400">
              {summary.totalTicketsSold} pcs
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Net Cash Revenue
            </span>
            <span className="text-2xl font-black font-mono text-yellow-400">
              ₱{summary.totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Additional Shift Breakdown */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Shift Started:</span>
            <span className="text-slate-200">{formattedStartTime}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Current Time:</span>
            <span className="text-slate-200">{formattedEndTime}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Returned Tickets:</span>
            <span className="text-rose-400 font-bold">{summary.totalReturnedTickets} pcs</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Total Refunds Paid:</span>
            <span className="text-rose-400 font-bold">₱{summary.totalRefundsAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Single Primary Action Button: CONFIRM END SHIFT */}
        <div className="pt-2">
          <button
            onClick={handleConfirmEndShift}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl transition flex items-center justify-center gap-2 text-sm uppercase tracking-wide shadow-lg shadow-amber-500/20"
          >
            <RefreshCw className="h-5 w-5 stroke-[2.5]" />
            <span>CONFIRM END SHIFT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
