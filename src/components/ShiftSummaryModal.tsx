'use client';

import React, { useState } from 'react';
import { useTicket } from '../context/TicketContext';
import { ShiftSummary } from '../types';
import { FileText, Copy, Check, Download, RefreshCw, X, Eye, FileCode } from 'lucide-react';

interface ShiftSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftSummaryModal: React.FC<ShiftSummaryModalProps> = ({ isOpen, onClose }) => {
  const { getShiftSummary, endShift, startNewShift, shift } = useTicket();
  const [copied, setCopied] = useState(false);
  const [showFullTextPreview, setShowFullTextPreview] = useState(false);

  if (!isOpen) return null;

  const summary = getShiftSummary();

  const formattedStartTime = new Date(summary.shiftStartTime).toLocaleString();
  const formattedEndTime = new Date(summary.shiftEndTime).toLocaleString();

  const generateTextReport = () => {
    const activeTxns = shift.transactions.filter((t) => t.status === 'completed');

    let logText = '\nITEMIZED TRANSACTION LOGS:\n';
    if (activeTxns.length === 0) {
      logText += 'No transactions logged.\n';
    } else {
      activeTxns.forEach((t, i) => {
        const timeStr = new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (t.type === 'return') {
          logText += `${i + 1}. [RETURN] #${t.ticketStartNum} (${t.ticketQuantity} tix) @ ${timeStr} - Refund: ₱${t.refundAmount || t.totalAmount}\n`;
        } else {
          logText += `${i + 1}. [SALE] #${t.ticketStartNum} to #${t.ticketEndNum} (${t.ticketQuantity} tix) @ ${timeStr} - Total: ₱${t.totalAmount} (Paid: ₱${t.cashPaid}, Change: ₱${t.changeGiven})\n`;
        }
      });
    }

    return `🎟️ PERYAHAN CARNIVAL TICKET REPORT 🎟️
-----------------------------------
Attraction: ${summary.rideName}
Shift Date: ${new Date(summary.shiftStartTime).toLocaleDateString()}
Shift Time: ${new Date(summary.shiftStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(summary.shiftEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

TICKET SEQUENCE:
• Starting Ticket: #${summary.startingTicketNum}
• Ending Ticket: #${summary.endingTicketNum}
• Direction Mode: ${summary.ticketDirection === 'ascending' ? 'Ascending (1 → 2)' : 'Descending (100 → 99)'}
• Net Tickets Sold: ${summary.totalTicketsSold} pcs
• Returned Tickets: ${summary.totalReturnedTickets} pcs
• Spoiled/Damaged Tickets: ${summary.spoiledTicketsCount} pcs

FINANCIAL TOTALS:
• Ticket Price: ₱${shift.ticketPrice}
• Net Cash Revenue: ₱${summary.totalRevenue.toLocaleString()}
• Cash Refunds Issued: ₱${summary.totalRefundsAmount.toLocaleString()}
-----------------------------------${logText}-----------------------------------
Report generated via Peryahan App (Offline PWA)`;
  };

  const handleCopy = () => {
    const text = generateTextReport();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleExportTextFile = () => {
    const text = generateTextReport();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peryahan_shift_report_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const activeTxns = shift.transactions.filter((t) => t.status === 'completed');
    let csv = '\uFEFFTransaction ID,Type,Timestamp,Ticket Start,Ticket End,Quantity,Price Per Ticket,Total/Refund Amount,Cash Paid,Change Given\n';
    activeTxns.forEach((t) => {
      csv += `"${t.id}","${t.type || 'sale'}","${t.timestamp}",${t.ticketStartNum},${t.ticketEndNum},${t.ticketQuantity},${t.unitPrice},${t.refundAmount || t.totalAmount},${t.cashPaid},${t.changeGiven}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peryahan_shift_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEndAndStartNew = () => {
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
          <div className="flex justify-between text-slate-400">
            <span>Damaged/Spoiled Tickets:</span>
            <span className="text-amber-400">{summary.spoiledTicketsCount} pcs</span>
          </div>
        </div>

        {/* In-App Full Text Report Preview */}
        {showFullTextPreview && (
          <div className="space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
              <span>Full Text Report Preview</span>
              <button
                onClick={() => setShowFullTextPreview(false)}
                className="text-slate-400 hover:text-white"
              >
                Hide
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
              {generateTextReport()}
            </pre>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-md shadow-amber-500/20"
          >
            {copied ? <Check className="h-4 w-4 text-slate-950 stroke-[3]" /> : <Copy className="h-4 w-4 stroke-[2.5]" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary Text (for SMS / Messenger)'}</span>
          </button>

          <button
            onClick={() => setShowFullTextPreview(!showFullTextPreview)}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold rounded-2xl transition flex items-center justify-center gap-2 text-slate-200 text-xs"
          >
            <Eye className="h-4 w-4 text-amber-400" />
            <span>{showFullTextPreview ? 'Hide Text Report Preview' : 'View Full Report on Screen'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportTextFile}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold rounded-2xl transition flex items-center justify-center gap-1.5 text-slate-200 text-xs"
            >
              <FileCode className="h-4 w-4 text-emerald-400" />
              <span>Download .txt</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold rounded-2xl transition flex items-center justify-center gap-1.5 text-slate-200 text-xs"
            >
              <Download className="h-4 w-4 text-blue-400" />
              <span>Download .csv</span>
            </button>
          </div>

          <button
            onClick={handleEndAndStartNew}
            className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-black rounded-2xl transition flex items-center justify-center gap-2 text-xs uppercase"
          >
            <RefreshCw className="h-4 w-4 text-amber-400" />
            <span>End Shift & Start Next Ticket Shift</span>
          </button>
        </div>
      </div>
    </div>
  );
};
