'use client';

import React, { useState } from 'react';
import { useTicket } from '../context/TicketContext';
import { Undo2, X, CheckCircle2, RotateCcw, Recycle, Plus, Trash2 } from 'lucide-react';
import { Transaction } from '../types';

interface TicketReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketReturnModal: React.FC<TicketReturnModalProps> = ({ isOpen, onClose }) => {
  const { shift, processReturn, returnedTicketsPool } = useTicket();

  const [ticketInputs, setTicketInputs] = useState<string[]>(['']);
  const [notes, setNotes] = useState<string>('');
  const [returnedReceipt, setReturnedReceipt] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  // Parse valid ticket numbers from inputs
  const parsedTicketNums = ticketInputs
    .map((v) => parseInt(v, 10))
    .filter((n) => !isNaN(n) && n > 0);

  const quantity = parsedTicketNums.length;
  const refundAmount = quantity * shift.ticketPrice;
  const hasValidTicket = quantity > 0;

  const handleAddTicketInput = () => {
    setTicketInputs((prev) => [...prev, '']);
  };

  const handleRemoveTicketInput = (index: number) => {
    setTicketInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTicketInputChange = (index: number, value: string) => {
    setTicketInputs((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasValidTicket) return;

    const txn = processReturn(parsedTicketNums, notes);
    if (txn) {
      setReturnedReceipt(txn);
    }
  };

  const handleFinish = () => {
    setReturnedReceipt(null);
    setTicketInputs(['']);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Undo2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Process Ticket Return</h2>
              <p className="text-xs text-slate-400">Enter the ticket number on the returned ticket</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full border border-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {returnedReceipt ? (
          /* Return Receipt Confirmation */
          <div className="space-y-4 text-center py-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Refund Completed</h3>
              <p className="text-xs text-slate-400">Ticket(s) added to reuse pool</p>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-left space-y-2 text-sm font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">RETURNED TICKET(S):</span>
                <span className="text-rose-400 font-bold">{returnedReceipt.ticketQuantity} pcs</span>
              </div>
              <div className="flex justify-between text-base pt-1">
                <span className="text-rose-400 font-bold">CASH REFUNDED:</span>
                <span className="text-rose-400 font-bold">₱{returnedReceipt.refundAmount?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-2 border-t border-slate-800">
                <Recycle className="h-3.5 w-3.5" />
                <span>
                  Added to reuse pool. Next customer will automatically receive these tickets.
                </span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-xl transition"
            >
              DONE / BACK TO POS
            </button>
          </div>
        ) : (
          /* Return Form */
          <form onSubmit={handleConfirmReturn} className="space-y-4">
            {/* Ticket Number Inputs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Returned Ticket Number(s)
              </label>
              <p className="text-[11px] text-slate-500">
                Type the number printed on the physical ticket being returned.
              </p>

              <div className="space-y-2">
                {ticketInputs.map((val, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-sm">#</span>
                      <input
                        type="number"
                        min="1"
                        value={val}
                        onChange={(e) => handleTicketInputChange(idx, e.target.value)}
                        placeholder={`Ticket number ${idx + 1}`}
                        className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl pl-7 pr-3 py-2.5 text-slate-100 font-mono text-lg focus:outline-none"
                        autoFocus={idx === 0}
                      />
                    </div>
                    {ticketInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTicketInput(idx)}
                        className="p-2 text-slate-500 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddTicketInput}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 border-dashed rounded-xl transition flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-300"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Another Ticket</span>
              </button>
            </div>

            {/* Calculated Cash Refund */}
            <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
              hasValidTicket
                ? 'bg-rose-950/40 border-rose-800/60'
                : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div>
                <span className={`text-xs uppercase font-bold tracking-wider block ${
                  hasValidTicket ? 'text-rose-400' : 'text-slate-500'
                }`}>
                  Total Cash Refund
                </span>
                <span className="text-xs text-slate-400">
                  {quantity} ticket{quantity !== 1 ? 's' : ''} × ₱{shift.ticketPrice}
                </span>
              </div>
              <span className={`text-3xl font-black font-mono ${
                hasValidTicket ? 'text-rose-400' : 'text-slate-600'
              }`}>
                ₱{refundAmount.toLocaleString()}
              </span>
            </div>

            {/* Pool Info */}
            <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-800/40 space-y-1">
              <div className="flex items-center gap-1.5">
                <Recycle className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Auto-Reuse Pool</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Returned tickets are saved in a reuse pool. The <strong className="text-slate-300">next customer</strong> will 
                receive these tickets first before the counter advances.
              </p>
              {returnedTicketsPool.length > 0 && (
                <p className="text-[11px] text-amber-400 font-mono">
                  Currently in pool: {returnedTicketsPool.map(n => `#${n}`).join(', ')}
                </p>
              )}
            </div>

            {/* Reason / Notes optional */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Reason / Customer Note (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Changed mind, child too small"
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!hasValidTicket}
                className={`w-full py-3.5 font-black text-sm uppercase rounded-2xl transition shadow-lg flex items-center justify-center gap-2 ${
                  hasValidTicket
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-slate-950 shadow-rose-950/40'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 shadow-none'
                }`}
              >
                <RotateCcw className="h-4 w-4" />
                <span>
                  {hasValidTicket
                    ? `CONFIRM REFUND (₱${refundAmount})`
                    : 'Enter ticket number above'
                  }
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
