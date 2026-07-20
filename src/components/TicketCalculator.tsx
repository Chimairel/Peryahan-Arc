'use client';

import React, { useState, useEffect } from 'react';
import { useTicket } from '../context/TicketContext';
import { ShoppingBag, Banknote, Calculator, CheckCircle2, RotateCcw, ArrowRight, Recycle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Transaction } from '../types';

interface TicketCalculatorProps {
  onSaleCompleted?: (transaction: Transaction) => void;
}

export const TicketCalculator: React.FC<TicketCalculatorProps> = ({ onSaleCompleted }) => {
  const { shift, completeSale, returnedTicketsPool } = useTicket();

  const [quantity, setQuantity] = useState<number>(1);
  const [customQtyInput, setCustomQtyInput] = useState<string>('1');
  const [cashPaidInput, setCashPaidInput] = useState<string>('');
  const [lastSaleReceipt, setLastSaleReceipt] = useState<Transaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  const pricePerTicket = shift.ticketPrice;
  const totalAmount = quantity * pricePerTicket;
  
  const cashPaid = parseFloat(cashPaidInput) || 0;
  const changeGiven = cashPaid >= totalAmount ? cashPaid - totalAmount : 0;
  const isCashInsufficient = cashPaid > 0 && cashPaid < totalAmount;

  // Sync quantity state when custom input changes
  const handleQtyChange = (val: string) => {
    setCustomQtyInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setQuantity(parsed);
    } else if (val === '') {
      setQuantity(0);
    }
  };

  const setPresetQty = (qty: number) => {
    setQuantity(qty);
    setCustomQtyInput(qty.toString());
  };

  const handleCashPreset = (amount: number) => {
    setCashPaidInput(amount.toString());
  };

  const handleCompleteSale = () => {
    if (quantity <= 0) return;
    if (cashPaid < totalAmount && cashPaid > 0) return;

    // Default cash to exact amount if seller pressed complete directly without cash input
    const finalCash = cashPaid === 0 ? totalAmount : cashPaid;

    const txn = completeSale(quantity, finalCash);
    if (txn) {
      setLastSaleReceipt(txn);
      setShowReceiptModal(true);

      // Launch festive ticket seller celebratory confetti
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f59e0b', '#eab308', '#10b981', '#3b82f6'],
        });
      } catch {
        // ignore
      }

      if (onSaleCompleted) {
        onSaleCompleted(txn);
      }

      // Reset for next ticket sale
      setPresetQty(1);
      setCashPaidInput('');
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-xl space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-amber-400" />
          <h3 className="font-bold text-slate-100 text-base">Quick Ticket Calculator</h3>
        </div>
        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 font-mono">
          ₱{pricePerTicket} / ticket
        </span>
      </div>

      {/* Pool Badge */}
      {returnedTicketsPool.length > 0 && (
        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-700/50 rounded-xl p-2.5">
          <Recycle className="h-4 w-4 text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-emerald-300 block">
              {returnedTicketsPool.length} returned ticket{returnedTicketsPool.length > 1 ? 's' : ''} in reuse pool
            </span>
            <span className="text-[10px] text-slate-400 font-mono truncate block">
              {returnedTicketsPool.map(n => `#${n}`).join(', ')}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400/70 shrink-0">Next sale uses these first</span>
        </div>
      )}

      {/* Step 1: Ticket Quantity Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
          1. Select Number of Tickets
        </label>
        
        {/* Preset buttons */}
        <div className="grid grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 10].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setPresetQty(q)}
              className={`py-3 rounded-xl font-bold font-mono text-base transition active:scale-95 border ${
                quantity === q
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/80'
              }`}
            >
              {q}x
            </button>
          ))}
        </div>

        {/* Custom input & Clear */}
        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <input
              type="number"
              min="1"
              value={customQtyInput}
              onChange={(e) => handleQtyChange(e.target.value)}
              placeholder="Custom quantity"
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 font-mono text-lg focus:outline-none"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
              tickets
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPresetQty(1)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            Reset (1)
          </button>
        </div>
      </div>

      {/* Calculated Total Price Highlight Card */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 border-2 border-amber-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-xs uppercase font-bold text-amber-400 tracking-wider block">
            Total Price
          </span>
          <span className="text-xs text-slate-400">
            {quantity} ticket{quantity > 1 ? 's' : ''} × ₱{pricePerTicket}
          </span>
        </div>
        <div className="text-right">
          <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400 tracking-tight">
            ₱{totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Step 2: Customer Cash Paid & Change Calculator */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
          2. Customer Cash & Change
        </label>

        {/* Quick cash bill shortcuts */}
        <div className="grid grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => handleCashPreset(totalAmount)}
            className="py-2 px-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 rounded-lg text-xs font-bold font-mono transition"
          >
            Exact
          </button>
          {[100, 200, 500, 1000].map((bill) => (
            <button
              key={bill}
              type="button"
              onClick={() => handleCashPreset(bill)}
              className="py-2 px-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold font-mono transition"
            >
              ₱{bill}
            </button>
          ))}
        </div>

        {/* Cash Paid input */}
        <div className="relative">
          <div className="absolute left-3 top-3 text-slate-400 font-bold">₱</div>
          <input
            type="number"
            value={cashPaidInput}
            onChange={(e) => setCashPaidInput(e.target.value)}
            placeholder={`Cash Paid (Leave empty for exact ₱${totalAmount})`}
            className={`w-full bg-slate-950 border ${
              isCashInsufficient
                ? 'border-rose-500 focus:border-rose-400 text-rose-300'
                : 'border-slate-700 focus:border-amber-500 text-slate-100'
            } rounded-xl pl-8 pr-3 py-3 font-mono text-xl focus:outline-none`}
          />
        </div>

        {/* Change Display Card */}
        {cashPaid > 0 && (
          <div
            className={`rounded-xl p-3.5 border transition ${
              isCashInsufficient
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider">
                {isCashInsufficient ? 'Insufficient Cash' : 'Customer Change'}
              </span>
              <span className="text-2xl font-black font-mono">
                {isCashInsufficient
                  ? `Short ₱${(totalAmount - cashPaid).toLocaleString()}`
                  : `₱${changeGiven.toLocaleString()}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Complete Sale Button */}
      <button
        type="button"
        disabled={quantity <= 0 || isCashInsufficient}
        onClick={handleCompleteSale}
        className={`w-full py-4 rounded-2xl font-black text-lg tracking-wide uppercase shadow-xl transition flex items-center justify-center gap-2 active:scale-98 ${
          quantity <= 0 || isCashInsufficient
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
        }`}
      >
        <span>Complete Sale ({quantity} Ticket{quantity > 1 ? 's' : ''})</span>
        <ArrowRight className="h-6 w-6 stroke-[3]" />
      </button>

      {/* Receipt Modal */}
      {showReceiptModal && lastSaleReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Sale Completed!</h3>
              <p className="text-xs text-slate-400">{shift.rideName}</p>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-left space-y-2 text-sm font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">TICKETS ISSUED:</span>
                <span className="text-amber-400 font-bold">
                  #{lastSaleReceipt.ticketStartNum} {lastSaleReceipt.ticketQuantity > 1 ? `to #${lastSaleReceipt.ticketEndNum}` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quantity:</span>
                <span className="text-slate-200 font-bold">{lastSaleReceipt.ticketQuantity} pcs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Price:</span>
                <span className="text-amber-300 font-bold">₱{lastSaleReceipt.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cash Paid:</span>
                <span className="text-slate-200">₱{lastSaleReceipt.cashPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-base">
                <span className="text-emerald-400 font-bold">CHANGE GIVEN:</span>
                <span className="text-emerald-400 font-bold">₱{lastSaleReceipt.changeGiven.toLocaleString()}</span>
              </div>
              {lastSaleReceipt.notes && (
                <div className="text-[11px] text-emerald-400 pt-2 border-t border-slate-800/80 font-sans">
                  ♻️ {lastSaleReceipt.notes}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowReceiptModal(false)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition"
            >
              NEXT CUSTOMER
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
