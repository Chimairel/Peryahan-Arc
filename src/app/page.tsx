'use client';

import React, { useState, useEffect } from 'react';
import { TicketTrackerCard } from '../components/TicketTrackerCard';
import { TicketCalculator } from '../components/TicketCalculator';
import { TransactionHistory } from '../components/TransactionHistory';
import { ShiftSummaryModal } from '../components/ShiftSummaryModal';
import { SettingsModal } from '../components/SettingsModal';
import { TicketReturnModal } from '../components/TicketReturnModal';
import { ShiftHistoryList } from '../components/ShiftHistoryList';
import { useTicket } from '../context/TicketContext';
import {
  Ticket,
  Sparkles,
  WifiOff,
  Wifi,
  ShieldCheck,
  Calculator,
  History,
  FileText,
  Settings,
  Undo2,
  BarChart3
} from 'lucide-react';

type TabType = 'pos' | 'history' | 'report' | 'settings';

export default function Home() {
  const { hasLoaded, shift, getShiftSummary } = useTicket();
  const [activeTab, setActiveTab] = useState<TabType>('pos');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Monitor online / offline network status
  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!hasLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="h-12 w-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-4" />
        <p className="text-amber-400 font-bold font-mono text-sm tracking-wider">
          LOADING TICKET BOOTH...
        </p>
      </div>
    );
  }

  const summary = getShiftSummary();

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 pb-24 sm:pb-12">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                PERYAHAN TICKET SELLER
                <Sparkles className="h-4 w-4 text-amber-400" />
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                {shift.rideName} • <span className="text-amber-400 font-semibold">₱{shift.ticketPrice}/tix</span>
              </p>
            </div>
          </div>

          {/* Network Connection Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isOffline
                ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span>Offline Active</span>
              </>
            ) : (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span>Online (PWA)</span>
              </>
            )}
          </div>
        </div>

        {/* Top Desktop Tab Bar ONLY (Hidden on Mobile) */}
        <div className="hidden sm:block max-w-2xl mx-auto pt-3">
          <div className="grid grid-cols-4 gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('pos')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'pos'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>POS / Counter</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Activity Log</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'report'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Shift Report</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Setup</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Content Container */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Offline Notice Banner */}
        {isOffline && (
          <div className="mb-4 p-3 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-amber-950/80 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200 shadow-md">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              <strong>100% Offline Ready:</strong> App is running locally on your phone storage. You can safely close or exit the app anytime without losing ticket data.
            </span>
          </div>
        )}

        {/* TAB 1: POS & TICKET CALCULATOR */}
        {activeTab === 'pos' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Quick Action Return Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setIsReturnModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-bold transition shadow-sm active:scale-95"
              >
                <Undo2 className="h-4 w-4" />
                <span>Return / Refund Ticket</span>
              </button>
            </div>

            {/* Ticket Counter & Starting Ticket Banner */}
            <TicketTrackerCard
              onOpenSettings={() => setActiveTab('settings')}
              onOpenSummary={() => setIsSummaryOpen(true)}
            />

            {/* Quick Calculator */}
            <TicketCalculator />
          </div>
        )}

        {/* TAB 2: ACTIVITY LOG & RETURNS */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <TransactionHistory />
          </div>
        )}

        {/* TAB 3: SHIFT REPORT */}
        {activeTab === 'report' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileText className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Active Shift Summary</h3>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Starting Ticket #
                  </span>
                  <span className="text-2xl font-black font-mono text-amber-400">
                    #{summary.startingTicketNum}
                  </span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Next Shift Start #
                  </span>
                  <span className="text-2xl font-black font-mono text-amber-400">
                    #{summary.endingTicketNum}
                  </span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Net Tickets Sold
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    {summary.totalTicketsSold} pcs
                  </span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Net Cash Revenue
                  </span>
                  <span className="text-2xl font-black font-mono text-yellow-400">
                    ₱{summary.totalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsSummaryOpen(true)}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl transition shadow-lg shadow-amber-500/20 text-sm uppercase tracking-wide"
              >
                END SHIFT
              </button>
            </div>

            {/* Past Shifts History Log */}
            <ShiftHistoryList />
          </div>
        )}

        {/* TAB 4: SETUP & SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-400" />
                <span>Ticket Booth Configuration</span>
              </h3>
              <p className="text-xs text-slate-400">
                Configure ticket prices, starting numbers, direction mode, or start a fresh new shift / booth for the next day.
              </p>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl transition text-sm shadow-md"
              >
                OPEN SHIFT & BOOTH SETTINGS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Mobile Bottom Bar (Always visible on mobile) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex flex-col items-center justify-center py-2 rounded-xl transition ${
              activeTab === 'pos' ? 'text-amber-400 bg-slate-900 font-bold' : 'text-slate-400'
            }`}
          >
            <Calculator className="h-5 w-5" />
            <span className="text-[10px] mt-1">POS</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center py-2 rounded-xl transition ${
              activeTab === 'history' ? 'text-amber-400 bg-slate-900 font-bold' : 'text-slate-400'
            }`}
          >
            <History className="h-5 w-5" />
            <span className="text-[10px] mt-1">Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center justify-center py-2 rounded-xl transition ${
              activeTab === 'report' ? 'text-amber-400 bg-slate-900 font-bold' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-[10px] mt-1">Report</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center py-2 rounded-xl transition ${
              activeTab === 'settings' ? 'text-amber-400 bg-slate-900 font-bold' : 'text-slate-400'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="text-[10px] mt-1">Setup</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ShiftSummaryModal isOpen={isSummaryOpen} onClose={() => setIsSummaryOpen(false)} />
      <TicketReturnModal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} />
    </main>
  );
}
