'use client';

import React, { useState } from 'react';
import { useTicket } from '../context/TicketContext';
import { Undo2, X, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Transaction } from '../types';

interface TicketReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketReturnModal: React.FC<TicketReturnModalProps> = ({ isOpen, onClose }) => {
  const { shift, processReturn } = useTicket();

  const [quantity, setQuantity] = useState<number>(1);
  const [reuseTicket, setReuseTicket] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [returnedReceipt, setReturnedReceipt] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const refundAmount = quantity * shift.ticketPrice;

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    const txn = processReturn(quantity, reuseTicket, notes);
    if (txn) {
      setReturnedReceipt(txn);
    }
  };

  const handleFinish = () => {
    setReturnedReceipt(null);
    setQuantity(1);
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
              <p className="text-xs text-slate-400">Refund cash & adjust ticket inventory</p>
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
              <p className="text-xs text-slate-400">Customer ticket returned</p>
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
              <div className="text-[11px] text-slate-500 pt-1">
                {reuseTicket ? '✅ Next ticket pointer updated to reuse returned ticket code.' : '⚠️ Ticket discarded (pointer unchanged).'}
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
            {/* Quantity Returned */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Number of Tickets Being Returned
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[1, 2, 3, 4].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className={`py-2 rounded-xl font-bold font-mono text-sm border transition ${
                      quantity === q
                        ? 'bg-rose-500 text-slate-950 border-rose-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {q} ticket{q > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3 py-2 text-slate-100 font-mono text-lg focus:outline-none"
              />
            </div>

            {/* Calculated Cash Refund */}
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-rose-400 tracking-wider block">
                  Total Cash Refund
                </span>
                <span className="text-xs text-slate-400">
                  {quantity} ticket{quantity > 1 ? 's' : ''} × ₱{shift.ticketPrice}
                </span>
              </div>
              <span className="text-3xl font-black font-mono text-rose-400">
                ₱{refundAmount.toLocaleString()}
              </span>
            </div>

            {/* Reuse Ticket Toggle */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Reuse returned ticket code?</span>
                <input
                  type="checkbox"
                  checked={reuseTicket}
                  onChange={(e) => setReuseTicket(e.target.checked)}
                  className="h-4 w-4 accent-rose-500 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {reuseTicket
                  ? 'Yes: Rewinds current ticket counter back so the returned ticket can be sold to the next customer.'
                  : 'No: Leaves current ticket counter as is (logs as returned revenue deduction only).'}
              </p>
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
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-slate-950 font-black text-sm uppercase rounded-2xl transition shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>CONFIRM REFUND (₱{refundAmount})</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
