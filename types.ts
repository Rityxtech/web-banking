
export enum AccountType {
  CHECKING = 'Checking',
  SAVINGS = 'Savings',
  CREDIT = 'Credit Card',
  INVESTMENT = 'Investment'
}

export enum TransactionType {
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal',
  TRANSFER_IN = 'Transfer In',
  TRANSFER_OUT = 'Transfer Out',
  PAYMENT = 'Payment',
  PURCHASE = 'Purchase'
}

export type TransactionStatus = 'Success' | 'Pending' | 'Cancelled' | 'Scheduled' | 'Failed';

export interface Transaction {
  id: string;
  account_id: string;
  amount: number;
  date: string;
  description: string;
  type: TransactionType;
  category: string;
  merchant?: string;
  status: TransactionStatus;
  icon?: string;
  created_at?: string;
  uuid?: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  accountNumber: string;
  color: string;
  is_main?: boolean;
  created_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  pin?: string;
}

export interface ExpenseData {
  category: string;
  amount: number;
  count: number;
  icon: any;
  color: string;
}

export interface ScheduleItem {
  id: string;
  name: string;
  date: string;
  amount: number;
  checked: boolean;
}

export interface Card {
  id: number;
  type: string;
  number: string;
  holder: string;
  expiry: string;
  gradient: string;
  shadow: string;
  isFrozen: boolean;
  pin?: string;
  cvv?: string;
  isDefault?: boolean;
  balance?: number;
}

export interface Loan {
  id: number;
  type: string;
  balance: number;
  original: number;
  rate: number;
  nextPayment: string;
  amount: number;
  progress: number;
  status: 'Current' | 'Paid Off';
}

export interface Asset {
  id: number;
  symbol: string;
  name: string;
  amount: number;
  shares: number;
  growth: number;
  isPositive: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert' | 'money' | 'security';
  is_read: boolean;
  created_at: string;
}

export type AdminViewType = 'dashboard' | 'users' | 'kyc' | 'transactions' | 'settings';

export interface LiveChatRoom {
    id: number;
    user_email: string;
    user_name?: string;
    status: 'open' | 'closed' | 'archived';
    last_message_at?: string;
    last_active_at?: string;
    source_template?: string;
    created_at?: string;
    updated_at?: string;
}

export interface LiveChatMessage {
    id: number;
    room_id: number;
    sender_type: 'user' | 'admin';
    sender_name?: string;
    text: string;
    is_read: boolean;
    created_at?: string;
}