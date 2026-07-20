'use client';

import React, { useState } from 'react';
import { useTicket } from '../context/TicketContext';
import { History, XCircle, Tag, Clock, ChevronDown, ChevronUp, Undo2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { TicketReturnModal } from './TicketReturnModal';

export const TransactionHistory: React.FC = () => {
  const { shift, voidTransaction } = useTicket();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const transactions = shift.transactions;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-amber-400" />
          <h3 className="font-bold text-slate-100 text-base">Shift Activity Feed</h3>
          <span className="text-xs bg-slate-800 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
            {transactions.length} logs
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReturnModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition active:scale-95 shadow-sm"
          >
            <Undo2 className="h-3.5 w-3.5" />
            <span>Return Ticket</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg border border-slate-700 transition"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* History content */}
      {isExpanded && (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
              <Tag className="h-8 w-8 mx-auto mb-2 opacity-30 text-amber-400" />
              <p className="text-sm">No transactions or returns logged yet.</p>
              <p className="text-xs text-slate-600">Issued tickets and returns will appear here.</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isVoided = tx.status === 'voided';
              const isReturn = tx.type === 'return';
              const formattedTime = new Date(tx.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={tx.id}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                    isVoided
                      ? 'bg-slate-950/40 border-slate-800/50 text-slate-500 opacity-60 line-through'
                      : isReturn
                      ? 'bg-rose-950/30 border-rose-800/40 text-slate-200'
                      : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      {isReturn ? (
                        <span className="flex items-center gap-1 text-xs bg-rose-950 text-rose-300 font-black px-2 py-0.5 rounded border border-rose-800">
                          <ArrowDownLeft className="h-3 w-3" />
                          RETURN ({tx.ticketQuantity} tix)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-800">
                          <ArrowUpRight className="h-3 w-3" />
                          SALE ({tx.ticketQuantity} tix)
                        </span>
                      )}

                      <span className="font-mono font-bold text-amber-400 text-sm">
                        Ticket #{tx.ticketStartNum}
                        {tx.ticketQuantity > 1 ? ` - #${tx.ticketEndNum}` : ''}
                      </span>

                      {isVoided && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded">
                          VOIDED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {formattedTime}
                      </span>
                      {isReturn ? (
                        <span className="text-rose-400 font-semibold">
                          Refunded: ₱{tx.refundAmount || tx.totalAmount}
                        </span>
                      ) : (
                        <>
                          <span>Paid: ₱{tx.cashPaid}</span>
                          <span>Change: ₱{tx.changeGiven}</span>
                        </>
                      )}
                    </div>
                    {tx.notes && (
                      <p className="text-[11px] text-slate-400 italic">"{tx.notes}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono font-bold text-base ${
                        isReturn ? 'text-rose-400' : 'text-yellow-400'
                      }`}
                    >
                      {isReturn ? `-₱${tx.refundAmount || tx.totalAmount}` : `+₱${tx.totalAmount}`}
                    </span>
                    {!isVoided && (
                      <button
                        onClick={() => {
                          if (confirm(`Void log entry #${tx.ticketStartNum}?`)) {
                            voidTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                        title="Void record"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Ticket Return Modal */}
      <TicketReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
      />
    </div>
  );
};
