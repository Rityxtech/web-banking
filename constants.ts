import { Account, AccountType, Transaction, TransactionType, User, ExpenseData, ScheduleItem, Card, Loan, Asset } from './types';
import { Utensils, ShoppingCart, Activity } from 'lucide-react';

export const CURRENT_USER: User = {
  id: 'u_1',
  name: 'Jonathan Alexan',
  email: 'leslieale@gmail.com',
  avatarUrl: 'https://i.pravatar.cc/150?u=jonathan'
};

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_1',
    name: 'Main Wallet',
    type: AccountType.CHECKING,
    balance: 84858.99,
    accountNumber: '**** 4521',
    color: 'bg-blue-600'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '#TD7483',
    account_id: 'acc_1',
    amount: 120.00,
    date: '2024-07-07T11:30:00',
    description: 'PayPal',
    type: TransactionType.PURCHASE,
    category: 'Payment',
    status: 'Success',
    icon: 'paypal'
  },
  {
    id: '#TD7484',
    account_id: 'acc_1',
    amount: 500.00,
    date: '2024-07-08T12:45:00',
    description: 'Wise',
    type: TransactionType.TRANSFER_OUT,
    category: 'Transfer',
    status: 'Cancelled',
    icon: 'wise'
  },
  {
    id: '#TD7485',
    account_id: 'acc_1',
    amount: 15.99,
    date: '2024-07-09T22:30:00',
    description: 'Adobe',
    type: TransactionType.PAYMENT,
    category: 'Subscription',
    status: 'Success',
    icon: 'adobe'
  },
  {
    id: '#TD7486',
    account_id: 'acc_1',
    amount: 45.50,
    date: '2024-07-10T09:15:00',
    description: 'Uber Ride',
    type: TransactionType.PURCHASE,
    category: 'Transport',
    status: 'Success',
    icon: 'uber'
  }
];

export const TOP_EXPENSES: ExpenseData[] = [
  { category: 'Food & Drinks', amount: 6468, count: 64, icon: Utensils, color: 'bg-blue-600' },
  { category: 'Shopping', amount: 4235, count: 56, icon: ShoppingCart, color: 'bg-green-500' },
  { category: 'Health', amount: 3235, count: 48, icon: Activity, color: 'bg-orange-500' }
];

export const PAYMENT_SCHEDULE: ScheduleItem[] = [
  { id: 'sch_1', name: 'PayPal', date: '7 Jul 2024 • 11:30 am', amount: 748.94, checked: true },
  { id: 'sch_2', name: 'Wise', date: '8 Jul 2024 • 11:30 am', amount: 865.56, checked: true },
  { id: 'sch_3', name: 'Adobe', date: '12 Jul 2024 • 11:30 am', amount: 246.64, checked: false },
  { id: 'sch_4', name: 'Atlassian', date: '13 Jul 2024 • 11:30 am', amount: 756.48, checked: false },
];

export const INITIAL_CARDS: Card[] = [
  { id: 1, type: 'VISA', number: '4521', holder: 'Jonathan Alexan', expiry: '12/26', gradient: 'from-blue-600 to-blue-500', shadow: 'shadow-blue-500/20', isFrozen: false },
  { id: 2, type: 'Mastercard', number: '9012', holder: 'Jonathan Alexan', expiry: '09/25', gradient: 'from-slate-800 to-slate-900', shadow: 'shadow-slate-500/20', isFrozen: false },
  { id: 3, type: 'VISA', number: '3456', holder: 'Jonathan Alexan', expiry: '11/27', gradient: 'from-emerald-600 to-emerald-500', shadow: 'shadow-emerald-500/20', isFrozen: false }
];

export const INITIAL_LOANS: Loan[] = [
  { id: 1, type: 'Home Mortgage', balance: 342000, original: 400000, rate: 4.5, nextPayment: '2024-08-01', amount: 2100, progress: 14.5, status: 'Current' },
  { id: 2, type: 'Car Loan', balance: 12500, original: 25000, rate: 3.2, nextPayment: '2024-07-28', amount: 450, progress: 50, status: 'Current' },
];

export const INITIAL_ASSETS: Asset[] = [
  // Fix: Rename 'change' to 'growth' to match the Asset interface definition in types.ts.
  { id: 1, symbol: 'AAPL', name: 'Apple Inc.', amount: 14500.50, shares: 78.4, growth: 2.4, isPositive: true },
  // Fix: Rename 'change' to 'growth' to match the Asset interface definition in types.ts.
  { id: 2, symbol: 'TSLA', name: 'Tesla, Inc.', amount: 8400.20, shares: 34.2, growth: -1.2, isPositive: false },
  // Fix: Rename 'change' to 'growth' to match the Asset interface definition in types.ts.
  { id: 3, symbol: 'BTC', name: 'Bitcoin', amount: 12500.00, shares: 0.24, growth: 5.8, isPositive: true },
  // Fix: Rename 'change' to 'growth' to match the Asset interface definition in types.ts.
  { id: 4, symbol: 'VTI', name: 'Vanguard Total Stock', amount: 9800.75, shares: 42.1, growth: 0.8, isPositive: true },
];