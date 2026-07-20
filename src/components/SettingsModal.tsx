'use client';

import React, { useState } from 'react';
import { useTicket } from '../context/TicketContext';
import { TicketDirection } from '../types';
import { Settings, Save, X, RotateCcw, ShieldCheck, ArrowUpRight, ArrowDownRight, RefreshCw, Sun } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { shift, setStartingTicketNum, setTicketPrice, setRideName, setTicketDirection, startNewShift, endShift } = useTicket();

  const [startingNum, setStartingNum] = useState<string>(shift.startingTicketNum.toString());
  const [ticketPrice, setPrice] = useState<string>(shift.ticketPrice.toString());
  const [rideName, setRide] = useState<string>(shift.rideName);
  const [direction, setDir] = useState<TicketDirection>(shift.ticketDirection);

  const [showNewShiftForm, setShowNewShiftForm] = useState(false);
  const [newStartTicket, setNewStartTicket] = useState('1');
  const [newRideName, setNewRideName] = useState(shift.rideName);
  const [newPrice, setNewPrice] = useState(shift.ticketPrice.toString());
  const [newDirection, setNewDirection] = useState<TicketDirection>(shift.ticketDirection);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(startingNum, 10);
    const p = parseFloat(ticketPrice);

    if (!isNaN(num)) {
      setStartingTicketNum(num);
    }
    if (!isNaN(p) && p >= 0) {
      setTicketPrice(p);
    }
    if (rideName.trim()) {
      setRideName(rideName.trim());
    }
    setTicketDirection(direction);

    onClose();
  };

  const handleStartNewDayShift = (e: React.FormEvent) => {
    e.preventDefault();
    const startNum = parseInt(newStartTicket, 10);
    const p = parseFloat(newPrice);

    if (isNaN(startNum)) return;

    if (confirm('Are you sure you want to archive current shift data and start a new ticket shift?')) {
      endShift(); // Archives previous day's shift
      startNewShift(startNum, !isNaN(p) ? p : 60, newRideName.trim() || 'Carnival Ride', newDirection);
      setShowNewShiftForm(false);
      onClose();
    }
  };

  const handleResetEntireState = () => {
    if (confirm('Are you sure you want to completely reset all shift data and start from Ticket #1?')) {
      startNewShift(1, 60, 'General Carnival Ride', 'ascending');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Shift & Booth Setup</h2>
              <p className="text-xs text-slate-400">Configure ticket booth & shift defaults</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full border border-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {showNewShiftForm ? (
          /* New Shift / Next Day Form */
          <form onSubmit={handleStartNewDayShift} className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2 text-xs text-amber-300">
              <Sun className="h-4 w-4 shrink-0 text-amber-400" />
              <span>
                This will save your current shift summary into history and start a fresh shift for today.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                New Shift Starting Ticket #
              </label>
              <input
                type="number"
                value={newStartTicket}
                onChange={(e) => setNewStartTicket(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2.5 font-mono text-xl text-amber-400 font-bold focus:outline-none"
                placeholder="e.g. 501 or 1000"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Booth / Ride Name
              </label>
              <input
                type="text"
                value={newRideName}
                onChange={(e) => setNewRideName(e.target.value)}
                placeholder="e.g. Bump Car, Ferris Wheel"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2.5 text-slate-100 text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ticket Counting Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewDirection('ascending')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 ${
                    newDirection === 'ascending'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Ascending (1 → 2)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewDirection('descending')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 ${
                    newDirection === 'descending'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  <ArrowDownRight className="h-4 w-4" />
                  <span>Descending (100 → 99)</span>
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase rounded-2xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>START NEW SHIFT NOW</span>
              </button>

              <button
                type="button"
                onClick={() => setShowNewShiftForm(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl transition text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Active Settings Form */
          <form onSubmit={handleSave} className="space-y-4">
            {/* Starting Ticket Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Starting Ticket Number
              </label>
              <input
                type="number"
                value={startingNum}
                onChange={(e) => setStartingNum(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2.5 font-mono text-xl text-amber-400 font-bold focus:outline-none"
              />
              <p className="text-[11px] text-slate-500">
                The initial ticket number on your physical ticket booklet at shift start.
              </p>
            </div>

            {/* Ticket Sequence Direction */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ticket Sequence Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDir('ascending')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    direction === 'ascending'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <ArrowUpRight className="h-5 w-5" />
                  <span>Ascending (1 → 2 → 3)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDir('descending')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    direction === 'descending'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <ArrowDownRight className="h-5 w-5" />
                  <span>Descending (100 → 99 → 98)</span>
                </button>
              </div>
            </div>

            {/* Ticket Price */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Price Per Ticket (₱)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₱</span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={ticketPrice}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl pl-8 pr-3 py-2.5 font-mono text-lg text-amber-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Ride / Attraction Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ride / Booth Name
              </label>
              <input
                type="text"
                value={rideName}
                onChange={(e) => setRide(e.target.value)}
                placeholder="e.g. Ferris Wheel, Bump Car, Grand Carousel"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2.5 text-slate-100 text-sm focus:outline-none"
              />
            </div>

            {/* Offline status info */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Data saves automatically on your phone storage.</span>
            </div>

            {/* Action buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm"
              >
                <Save className="h-4 w-4" />
                <span>Save & Apply Settings</span>
              </button>

              {/* Start New Day / Shift Button */}
              <button
                type="button"
                onClick={() => setShowNewShiftForm(true)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-bold rounded-2xl transition text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Sun className="h-4 w-4 text-amber-400" />
                <span>Start New Day / Next Booth Shift</span>
              </button>

              <button
                type="button"
                onClick={handleResetEntireState}
                className="w-full py-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-900/30 font-semibold rounded-2xl transition text-[11px] flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Entire State (Ticket #1)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
