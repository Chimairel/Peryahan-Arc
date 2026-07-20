export type TicketDirection = 'ascending' | 'descending';
export type TransactionType = 'sale' | 'return';

export interface Transaction {
  id: string;
  type: TransactionType;
  timestamp: string;
  ticketQuantity: number;
  ticketStartNum: number;
  ticketEndNum: number;
  unitPrice: number;
  totalAmount: number;
  cashPaid: number;
  changeGiven: number;
  refundAmount?: number;
  rideName: string;
  status: 'completed' | 'voided';
  notes?: string;
}

export interface ShiftState {
  shiftId: string;
  shiftStartTime: string;
  shiftEndTime?: string;
  startingTicketNum: number;
  currentTicketNum: number;
  ticketDirection: TicketDirection;
  ticketPrice: number;
  rideName: string;
  transactions: Transaction[];
  isShiftActive: boolean;
  spoiledTicketsCount: number;
  currencySymbol: string;
}

export interface ShiftSummary {
  startingTicketNum: number;
  endingTicketNum: number;
  ticketDirection: TicketDirection;
  totalTicketsSold: number;
  totalRevenue: number;
  totalReturnedTickets: number;
  totalRefundsAmount: number;
  activeTransactionsCount: number;
  voidedTransactionsCount: number;
  spoiledTicketsCount: number;
  shiftStartTime: string;
  shiftEndTime: string;
  rideName: string;
}
