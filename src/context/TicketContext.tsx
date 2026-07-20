'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, ShiftState, ShiftSummary, TicketDirection, TransactionType } from '../types';

const STORAGE_KEY = 'peryahan_ticket_shift_v3';
const HISTORY_STORAGE_KEY = 'peryahan_shift_history_v3';

const DEFAULT_SHIFT: ShiftState = {
  shiftId: '',
  shiftStartTime: new Date().toISOString(),
  startingTicketNum: 1,
  currentTicketNum: 1,
  ticketDirection: 'ascending',
  ticketPrice: 60,
  rideName: 'General Carnival Ride',
  transactions: [],
  isShiftActive: true,
  spoiledTicketsCount: 0,
  currencySymbol: '₱',
};

interface TicketContextType {
  shift: ShiftState;
  totalTicketsSold: number;
  totalRevenue: number;
  totalReturnedTickets: number;
  totalRefundsAmount: number;
  lastSoldTicketNum: number;
  completeSale: (quantity: number, cashPaid: number, notes?: string) => Transaction | null;
  processReturn: (quantity: number, reuseTicketNum?: boolean, notes?: string) => Transaction | null;
  voidTransaction: (id: string) => void;
  setStartingTicketNum: (num: number) => void;
  adjustCurrentTicketNum: (num: number) => void;
  setTicketDirection: (direction: TicketDirection) => void;
  setTicketPrice: (price: number) => void;
  setRideName: (name: string) => void;
  addSpoiledTicket: (count?: number) => void;
  endShift: () => ShiftSummary;
  startNewShift: (startTicketNum?: number, price?: number, rideName?: string, direction?: TicketDirection) => void;
  getShiftSummary: () => ShiftSummary;
  shiftHistory: ShiftSummary[];
  clearHistory: () => void;
  hasLoaded: boolean;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shift, setShift] = useState<ShiftState>(DEFAULT_SHIFT);
  const [shiftHistory, setShiftHistory] = useState<ShiftSummary[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedShift = localStorage.getItem(STORAGE_KEY);
      if (savedShift) {
        const parsed = JSON.parse(savedShift);
        setShift({
          ...DEFAULT_SHIFT,
          ...parsed,
        });
      } else {
        setShift({
          ...DEFAULT_SHIFT,
          shiftId: `SHIFT-${Date.now().toString().slice(-6)}`,
          shiftStartTime: new Date().toISOString(),
        });
      }

      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        setShiftHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Failed to load peryahan shift state from localStorage:', e);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  // Save shift to localStorage on change
  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shift));
    } catch (e) {
      console.error('Failed to save peryahan shift state:', e);
    }
  }, [shift, hasLoaded]);

  // Save history to localStorage
  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(shiftHistory));
    } catch (e) {
      console.error('Failed to save peryahan shift history:', e);
    }
  }, [shiftHistory, hasLoaded]);

  // Calculate totals
  const completedSales = shift.transactions.filter((t) => t.status === 'completed' && (t.type === 'sale' || !t.type));
  const completedReturns = shift.transactions.filter((t) => t.status === 'completed' && t.type === 'return');

  const grossTicketsSold = completedSales.reduce((acc, t) => acc + t.ticketQuantity, 0);
  const totalReturnedTickets = completedReturns.reduce((acc, t) => acc + t.ticketQuantity, 0);
  const totalTicketsSold = Math.max(0, grossTicketsSold - totalReturnedTickets);

  const grossRevenue = completedSales.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalRefundsAmount = completedReturns.reduce((acc, t) => acc + (t.refundAmount || t.totalAmount), 0);
  const totalRevenue = grossRevenue - totalRefundsAmount;

  const isAscending = shift.ticketDirection === 'ascending';

  const lastSoldTicketNum =
    grossTicketsSold > 0
      ? isAscending
        ? shift.currentTicketNum - 1
        : shift.currentTicketNum + 1
      : shift.startingTicketNum;

  const completeSale = (quantity: number, cashPaid: number, notes?: string): Transaction | null => {
    if (quantity <= 0) return null;
    const totalAmount = quantity * shift.ticketPrice;
    if (cashPaid < totalAmount) return null;

    const startNum = shift.currentTicketNum;
    const endNum = isAscending
      ? startNum + quantity - 1
      : startNum - quantity + 1;
    
    const nextCurrentNum = isAscending
      ? startNum + quantity
      : startNum - quantity;

    const changeGiven = cashPaid - totalAmount;

    const newTransaction: Transaction = {
      id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'sale',
      timestamp: new Date().toISOString(),
      ticketQuantity: quantity,
      ticketStartNum: startNum,
      ticketEndNum: endNum,
      unitPrice: shift.ticketPrice,
      totalAmount,
      cashPaid,
      changeGiven,
      rideName: shift.rideName,
      status: 'completed',
      notes,
    };

    setShift((prev) => ({
      ...prev,
      currentTicketNum: nextCurrentNum,
      transactions: [newTransaction, ...prev.transactions],
    }));

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 30, 40]);
      } catch {
        // ignore
      }
    }

    return newTransaction;
  };

  const processReturn = (quantity: number, reuseTicketNum: boolean = true, notes?: string): Transaction | null => {
    if (quantity <= 0) return null;
    const refundAmount = quantity * shift.ticketPrice;

    // Calculate ticket range returned
    const startNum = isAscending
      ? shift.currentTicketNum - 1
      : shift.currentTicketNum + 1;
    
    const endNum = isAscending
      ? startNum - quantity + 1
      : startNum + quantity - 1;

    // If seller chooses to reuse the returned ticket, adjust current ticket pointer back
    const nextCurrentNum = reuseTicketNum
      ? isAscending
        ? shift.currentTicketNum - quantity
        : shift.currentTicketNum + quantity
      : shift.currentTicketNum;

    const returnTxn: Transaction = {
      id: `RET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'return',
      timestamp: new Date().toISOString(),
      ticketQuantity: quantity,
      ticketStartNum: startNum,
      ticketEndNum: endNum,
      unitPrice: shift.ticketPrice,
      totalAmount: refundAmount,
      cashPaid: 0,
      changeGiven: 0,
      refundAmount,
      rideName: shift.rideName,
      status: 'completed',
      notes: notes || 'Customer returned ticket',
    };

    setShift((prev) => ({
      ...prev,
      currentTicketNum: nextCurrentNum,
      transactions: [returnTxn, ...prev.transactions],
    }));

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([80, 50, 80]);
      } catch {
        // ignore
      }
    }

    return returnTxn;
  };

  const voidTransaction = (id: string) => {
    setShift((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === id ? { ...t, status: 'voided' } : t
      ),
    }));
  };

  const setStartingTicketNum = (num: number) => {
    setShift((prev) => {
      const sold = prev.transactions.filter((t) => t.status === 'completed').length;
      return {
        ...prev,
        startingTicketNum: num,
        currentTicketNum: sold === 0 ? num : prev.currentTicketNum,
      };
    });
  };

  const adjustCurrentTicketNum = (num: number) => {
    setShift((prev) => ({
      ...prev,
      currentTicketNum: num,
    }));
  };

  const setTicketDirection = (direction: TicketDirection) => {
    setShift((prev) => ({
      ...prev,
      ticketDirection: direction,
    }));
  };

  const setTicketPrice = (price: number) => {
    if (price < 0) return;
    setShift((prev) => ({
      ...prev,
      ticketPrice: price,
    }));
  };

  const setRideName = (name: string) => {
    setShift((prev) => ({
      ...prev,
      rideName: name,
    }));
  };

  const addSpoiledTicket = (count: number = 1) => {
    setShift((prev) => {
      const isAsc = prev.ticketDirection === 'ascending';
      return {
        ...prev,
        spoiledTicketsCount: prev.spoiledTicketsCount + count,
        currentTicketNum: isAsc ? prev.currentTicketNum + count : prev.currentTicketNum - count,
      };
    });
  };

  const getShiftSummary = (): ShiftSummary => {
    const activeSales = shift.transactions.filter((t) => t.status === 'completed' && (t.type === 'sale' || !t.type));
    const activeReturns = shift.transactions.filter((t) => t.status === 'completed' && t.type === 'return');
    const voidedTxns = shift.transactions.filter((t) => t.status === 'voided');

    const soldQty = activeSales.reduce((acc, t) => acc + t.ticketQuantity, 0);
    const returnedQty = activeReturns.reduce((acc, t) => acc + t.ticketQuantity, 0);
    const netTicketsSold = Math.max(0, soldQty - returnedQty);

    const grossRev = activeSales.reduce((acc, t) => acc + t.totalAmount, 0);
    const refundsAmt = activeReturns.reduce((acc, t) => acc + (t.refundAmount || t.totalAmount), 0);
    const netRevenue = grossRev - refundsAmt;

    const isAsc = shift.ticketDirection === 'ascending';
    const endingNum = netTicketsSold > 0
      ? (isAsc ? shift.currentTicketNum - 1 : shift.currentTicketNum + 1)
      : shift.startingTicketNum;

    return {
      startingTicketNum: shift.startingTicketNum,
      endingTicketNum: endingNum,
      ticketDirection: shift.ticketDirection,
      totalTicketsSold: netTicketsSold,
      totalRevenue: netRevenue,
      totalReturnedTickets: returnedQty,
      totalRefundsAmount: refundsAmt,
      activeTransactionsCount: activeSales.length + activeReturns.length,
      voidedTransactionsCount: voidedTxns.length,
      spoiledTicketsCount: shift.spoiledTicketsCount,
      shiftStartTime: shift.shiftStartTime,
      shiftEndTime: new Date().toISOString(),
      rideName: shift.rideName,
    };
  };

  const endShift = (): ShiftSummary => {
    const summary = getShiftSummary();
    setShiftHistory((prev) => [summary, ...prev]);
    return summary;
  };

  const startNewShift = (
    startTicketNum?: number,
    price?: number,
    rideName?: string,
    direction?: TicketDirection
  ) => {
    const nextStartNum = startTicketNum ?? shift.currentTicketNum;
    const nextPrice = price ?? shift.ticketPrice;
    const nextRide = rideName ?? shift.rideName;
    const nextDir = direction ?? shift.ticketDirection;

    const newShift: ShiftState = {
      shiftId: `SHIFT-${Date.now().toString().slice(-6)}`,
      shiftStartTime: new Date().toISOString(),
      startingTicketNum: nextStartNum,
      currentTicketNum: nextStartNum,
      ticketDirection: nextDir,
      ticketPrice: nextPrice,
      rideName: nextRide,
      transactions: [],
      isShiftActive: true,
      spoiledTicketsCount: 0,
      currencySymbol: '₱',
    };

    setShift(newShift);
  };

  const clearHistory = () => {
    setShiftHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <TicketContext.Provider
      value={{
        shift,
        totalTicketsSold,
        totalRevenue,
        totalReturnedTickets,
        totalRefundsAmount,
        lastSoldTicketNum,
        completeSale,
        processReturn,
        voidTransaction,
        setStartingTicketNum,
        adjustCurrentTicketNum,
        setTicketDirection,
        setTicketPrice,
        setRideName,
        addSpoiledTicket,
        endShift,
        startNewShift,
        getShiftSummary,
        shiftHistory,
        clearHistory,
        hasLoaded,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTicket must be used within a TicketProvider');
  }
  return context;
};
