'use client';

import React, { useState } from 'react';
import { useTicket } from '../context/TicketContext';
import { ShiftSummary } from '../types';
import { Calendar, History, Download, Copy, Check, Trash2, ChevronDown, ChevronUp, Ticket, DollarSign } from 'lucide-react';

export const ShiftHistoryList: React.FC = () => {
  const { shiftHistory, clearHistory } = useTicket();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const totalShifts = shiftHistory.length;
  const grandTotalTickets = shiftHistory.reduce((sum, s) => sum + s.totalTicketsSold, 0);
  const grandTotalRevenue = shiftHistory.reduce((sum, s) => sum + s.totalRevenue, 0);

  const handleCopyShift = (summary: ShiftSummary, index: number) => {
    const text = `🎟️ PERYAHAN SHIFT REPORT #${totalShifts - index} 🎟️
Attraction: ${summary.rideName}
Date: ${new Date(summary.shiftStartTime).toLocaleDateString()}
Time: ${new Date(summary.shiftStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(summary.shiftEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

TICKETS:
• Range: #${summary.startingTicketNum} → #${summary.endingTicketNum}
• Direction: ${summary.ticketDirection}
• Net Sold: ${summary.totalTicketsSold} pcs
• Returned: ${summary.totalReturnedTickets} pcs

FINANCIAL:
• Revenue: ₱${summary.totalRevenue.toLocaleString()}
• Refunds: ₱${summary.totalRefundsAmount.toLocaleString()}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(`shift-${index}`);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handleExportAllCSV = () => {
    if (shiftHistory.length === 0) return;

    let csv = '\uFEFFShift #,Attraction,Start Time,End Time,Starting Ticket,Ending Ticket,Direction,Net Tickets Sold,Returned Tickets,Net Revenue,Refunds Paid\n';
    shiftHistory.forEach((s, i) => {
      const shiftNum = totalShifts - i;
      csv += `"${shiftNum}","${s.rideName}","${s.shiftStartTime}","${s.shiftEndTime}",${s.startingTicketNum},${s.endingTicketNum},"${s.ticketDirection}",${s.totalTicketsSold},${s.totalReturnedTickets},${s.totalRevenue},${s.totalRefundsAmount}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peryahan_all_shifts_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all saved shift history? This action cannot be undone.')) {
      clearHistory();
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-slate-100">
      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-amber-400" />
          <div>
            <h3 className="font-bold text-white text-base">Past Shifts History</h3>
            <p className="text-xs text-slate-400">All remitted & completed shifts saved locally</p>
          </div>
        </div>

        {shiftHistory.length > 0 && (
          <button
            onClick={handleExportAllCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Cumulative Stats Banner */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Shifts Completed</span>
          <span className="text-xl font-black font-mono text-amber-400">{totalShifts}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">All-Time Tickets</span>
          <span className="text-xl font-black font-mono text-emerald-400">{grandTotalTickets.toLocaleString()} pcs</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">All-Time Revenue</span>
          <span className="text-xl font-black font-mono text-yellow-400">₱{grandTotalRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Shift List */}
      {shiftHistory.length === 0 ? (
        <div className="text-center py-8 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
          <Calendar className="h-8 w-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-400">No past shifts recorded yet</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            When you complete a shift and tap "End Shift &amp; Start Next Ticket Shift", your daily summary will be saved here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shiftHistory.map((s, index) => {
            const shiftNum = totalShifts - index;
            const isExpanded = expandedIndex === index;
            const startDateStr = new Date(s.shiftStartTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
            const startTimeStr = new Date(s.shiftStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTimeStr = new Date(s.shiftEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={index}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 transition hover:border-slate-700"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/30">
                      SHIFT #{shiftNum}
                    </span>
                    <span className="text-sm font-bold text-white">{s.rideName}</span>
                  </div>

                  <span className="text-xs font-mono text-slate-400">{startDateStr}</span>
                </div>

                {/* Summary numbers grid */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Start → Next Start</span>
                    <span className="font-bold text-amber-400">#{s.startingTicketNum} → #{s.endingTicketNum}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Net Sold</span>
                    <span className="font-bold text-emerald-400">{s.totalTicketsSold} pcs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Revenue</span>
                    <span className="font-bold text-yellow-400">₱{s.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs font-mono text-slate-300 animate-in fade-in duration-150">
                    <div className="flex justify-between text-slate-400">
                      <span>Shift Time:</span>
                      <span>{startTimeStr} - {endTimeStr}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Counting Direction:</span>
                      <span className="uppercase">{s.ticketDirection}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Returned Tickets:</span>
                      <span className="text-rose-400 font-bold">{s.totalReturnedTickets} pcs</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Refunds Paid:</span>
                      <span className="text-rose-400 font-bold">₱{s.totalRefundsAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    <span>{isExpanded ? 'Hide Details' : 'View Full Details'}</span>
                  </button>

                  <button
                    onClick={() => handleCopyShift(s, index)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-800 transition"
                  >
                    {copiedId === `shift-${index}` ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleClear}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-950/30 border border-rose-900/40 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History Log</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
