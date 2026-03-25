
import React, { useState, useEffect } from 'react';
import { Loan } from '../types';
import { Landmark, Calculator, PieChart, ChevronRight, DollarSign, Calendar, TrendingUp, Info, AlertCircle, Check, Percent, X } from 'lucide-react';
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip } from 'recharts';
import { PinVerificationModal } from './ui/PinVerificationModal';

interface LoansProps {
  loans: Loan[];
  onApplyLoan: (amount: number, type: string) => void;
  onPayLoan: (id: number, amount: number) => void;
  onModalChange?: (isOpen: boolean) => void;
  user?: any;
  onSendOtp?: () => Promise<string | null>;
  onUpdatePin?: (newPin: string) => Promise<boolean>;
}

export const Loans: React.FC<LoansProps> = ({ loans, onApplyLoan, onPayLoan, onModalChange, user, onSendOtp, onUpdatePin }) => {
  const [calcAmount, setCalcAmount] = useState(50000);
  const [calcTerm, setCalcTerm] = useState(60);
  const [calcRate, setCalcRate] = useState(5.5);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinAction, setPinAction] = useState<'apply' | 'pay' | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);

  const [loanType, setLoanType] = useState('Personal Loan');
  const [applyAmount, setApplyAmount] = useState('');
  const [payAmount, setPayAmount] = useState('');

  useEffect(() => {
    const isAnyOpen = showApplyModal || showPayModal;
    if (onModalChange) onModalChange(isAnyOpen);
    document.body.style.overflow = isAnyOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showApplyModal, showPayModal, onModalChange]);

  const calculateMonthly = () => {
    const r = calcRate / 100 / 12;
    const n = calcTerm;
    const p = calcAmount;
    if (r === 0) return p / n;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const monthlyPayment = calculateMonthly();
  const totalPayment = monthlyPayment * calcTerm;
  const totalInterest = totalPayment - calcAmount;

  const creditData = [{ name: 'Used', value: 30, color: '#3b82f6' }, { name: 'Available', value: 70, color: '#e2e8f0' }];

  const formatAmount = (val: string) => {
    let cleanVal = val.replace(/[^0-9.]/g, '');
    if ((cleanVal.match(/\./g) || []).length > 1) return val;
    const parts = cleanVal.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (parts[1] && parts[1].length > 2) parts[1] = parts[1].slice(0, 2);
    return parts.join('.');
  };

  const handleApplyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApplyAmount(formatAmount(e.target.value));
  };

  const handlePayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPayAmount(formatAmount(e.target.value));
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = parseFloat(applyAmount.replace(/,/g, ''));
    if (rawAmount > 0) {
      setPinAction('apply');
      setShowPinModal(true);
    }
  };

  const processApply = () => {
    const rawAmount = parseFloat(applyAmount.replace(/,/g, ''));
    onApplyLoan(rawAmount, loanType);
    setShowApplyModal(false);
    setApplyAmount('');
    setShowPinModal(false);
    setPinAction(null);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = parseFloat(payAmount.replace(/,/g, ''));
    if (selectedLoanId && rawAmount > 0) {
      setPinAction('pay');
      setShowPinModal(true);
    }
  };

  const processPay = () => {
    const rawAmount = parseFloat(payAmount.replace(/,/g, ''));
    if (selectedLoanId) {
      onPayLoan(selectedLoanId, rawAmount);
      setShowPayModal(false);
      setPayAmount('');
      setSelectedLoanId(null);
    }
    setShowPinModal(false);
    setPinAction(null);
  };

  const openPayModal = (loan: Loan) => {
    setSelectedLoanId(loan.id);
    setPayAmount(String(loan.amount)); // Or empty, depending on UX. Pre-filling monthly payment for ease.
    setShowPayModal(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto relative">

      {/* Apply Loan Modal - Fixed Bottom Mobile - Z-[60] */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center px-0 md:px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowApplyModal(false)}></div>
          <div className="relative bg-white dark:bg-slate-800 w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:animate-in md:fade-in md:zoom-in duration-200 pb-8 md:pb-6 mb-[85px] md:mb-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Apply for New Loan</h3>
              <button onClick={() => setShowApplyModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Loan Type</label>
                <select value={loanType} onChange={e => setLoanType(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white">
                  <option>Personal Loan</option>
                  <option>Auto Loan</option>
                  <option>Home Improvement</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount ($)</label>
                <input type="text" inputMode="decimal" value={applyAmount} onChange={handleApplyAmountChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white" placeholder="e.g. 10,000" required />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Submit Application</button>
            </form>
          </div>
        </div>
      )}

      {/* Pay Loan Modal - Fixed Bottom Mobile - Z-[60] */}
      {showPayModal && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center px-0 md:px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPayModal(false)}></div>
          <div className="relative bg-white dark:bg-slate-800 w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:animate-in md:fade-in md:zoom-in duration-200 pb-8 md:pb-6 mb-[85px] md:mb-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Make a Payment</h3>
              <button onClick={() => setShowPayModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Paying off loan #{selectedLoanId}</p>
            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Amount ($)</label>
                <input type="text" inputMode="decimal" value={payAmount} onChange={handlePayAmountChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-2xl font-bold dark:text-white" required />
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">Confirm Payment</button>
            </form>
          </div>
        </div>
      )}

      {showPinModal && (
        <PinVerificationModal
          isOpen={showPinModal}
          title={pinAction === 'apply' ? "Confirm Loan Application" : "Confirm Loan Payment"}
          subtitle={`Enter PIN to ${pinAction === 'apply' ? 'submit application' : 'make payment'}`}
          expectedPin={user?.pin || user?.user_metadata?.pin || '0000'}
          onSuccess={pinAction === 'apply' ? processApply : processPay}
          onClose={() => setShowPinModal(false)}
          email={user?.email}
          onSendOtp={onSendOtp}
          onUpdatePin={onUpdatePin}
        />
      )}

      {/* Main Content Area */}
      <div className="space-y-6 animate-fade-in pt-2">
        <div className="flex justify-end items-center mb-2 md:mb-6">
          <button onClick={() => setShowApplyModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">Apply for New Loan</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center"><DollarSign size={20} /></div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 rounded">Total Debt</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">${loans.reduce((acc, curr) => acc + curr.balance, 0).toLocaleString()}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Across {loans.filter(l => l.status === 'Current').length} active loans</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center"><Calendar size={20} /></div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 rounded">Monthly Obligation</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">${loans.reduce((acc, curr) => curr.status === 'Current' ? acc + curr.amount : acc, 0).toLocaleString()}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total monthly payments</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center"><TrendingUp size={20} /></div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">Good</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">724</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Credit Score (Vantage 3.0)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Accounts</h2><button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700">View All History</button></div>
            <div className="space-y-4">
              {loans.map(loan => (
                <div key={loan.id} className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow ${loan.status === 'Paid Off' ? 'opacity-75' : ''}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-600"><Landmark size={24} /></div>
                      <div><h4 className="text-lg font-bold text-slate-900 dark:text-white">{loan.type}</h4><p className="text-sm text-slate-500 dark:text-slate-400">Loan #{loan.id}</p></div>
                    </div>
                    <div className="text-left md:text-right"><p className="text-2xl font-bold text-slate-900 dark:text-white">${loan.balance.toLocaleString()}</p><p className="text-xs font-medium text-slate-500 dark:text-slate-400">Principal Remaining</p></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-slate-50 dark:border-slate-700">
                    <div><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Interest Rate</p><p className="text-sm font-bold text-slate-900 dark:text-white">{loan.rate}% Fixed</p></div>
                    <div><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Monthly Payment</p><p className="text-sm font-bold text-slate-900 dark:text-white">${loan.amount}</p></div>
                    <div><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Next Due Date</p><p className="text-sm font-bold text-slate-900 dark:text-white">{new Date(loan.nextPayment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p></div>
                    <div><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</p><span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${loan.status === 'Current' ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-slate-700 bg-slate-100 dark:bg-slate-700 dark:text-slate-300'}`}><Check size={10} /> {loan.status}</span></div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-2"><span>Repayment Progress</span><span>{loan.progress.toFixed(1)}%</span></div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${loan.progress}%` }}></div></div>
                  </div>
                  {loan.status === 'Current' && (
                    <div className="mt-4 flex justify-end gap-3">
                      <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all">Amortization Schedule</button>
                      <button onClick={() => openPayModal(loan)} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 rounded-lg shadow-sm">Make Payment</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Calculator size={18} className="text-slate-400" /> Loan Calculator</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2"><label className="text-xs font-bold text-slate-500 uppercase">Amount</label><span className="text-sm font-bold text-slate-900 dark:text-white">${calcAmount.toLocaleString()}</span></div>
                  <input type="range" min="1000" max="500000" step="1000" value={calcAmount} onChange={(e) => setCalcAmount(Number(e.target.value))} className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Term (Months)</label><input type="number" value={calcTerm} onChange={(e) => setCalcTerm(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Rate (%)</label><input type="number" value={calcRate} onChange={(e) => setCalcRate(Number(e.target.value))} step="0.1" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-1"><span className="text-sm text-slate-500 dark:text-slate-400">Monthly Payment</span><span className="text-xl font-bold text-blue-600 dark:text-blue-400">${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                  <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-3"></div>
                  <div className="flex justify-between items-center text-xs"><span className="text-slate-500 dark:text-slate-400">Total Interest</span><span className="font-bold text-slate-700 dark:text-slate-200">${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                  <div className="flex justify-between items-center text-xs mt-1"><span className="text-slate-500 dark:text-slate-400">Total Cost</span><span className="font-bold text-slate-700 dark:text-slate-200">${totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                </div>
                <button className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">View Detailed Schedule</button>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><PieChart size={18} className="text-slate-400" /> Credit Utilization</h3>
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={creditData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {creditData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-3xl font-bold text-slate-900 dark:text-white">30%</span><span className="text-xs text-slate-500">Used</span></div>
              </div>
              <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">Excellent. Keeping utilization under 30% helps your score.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
