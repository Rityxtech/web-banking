
import React, { useState, useRef, useEffect } from 'react';
import { APP_CONFIG } from '../config';
import { Account, Card } from '../types';
import { Plus, CreditCard, Snowflake, RefreshCw, Shield, Globe, Wifi, Lock, Eye, EyeOff, Copy, Check, ArrowLeft, Loader2, CheckCircle, AlertCircle, X, KeyRound, Mail, Trash2, AlertTriangle, Clock, Wallet, Landmark, TrendingUp, PlusCircle, Unlock, ArrowRightLeft } from 'lucide-react';
import { HighYieldEnrollmentModal } from './ui/HighYieldEnrollmentModal';
import { HighYieldWithdrawalModal } from './ui/HighYieldWithdrawalModal';
import { supabase, supabaseAdmin } from '../services/supabase';
import { mvp } from '../services/mvpService';
import { getEmailTemplate } from '../utils/emailTemplates';

interface AccountsProps {
    user?: any;
    onSendOtp?: () => Promise<string | null>;
    onVerifyOtp?: (otp: string) => Promise<boolean>;
    onUpdatePin?: (newPin: string) => Promise<boolean>;
    accounts: Account[];
    cards: Card[];
    onAddCard: (type: string, number: string, holder: string, expiry: string, pin?: string, cvv?: string) => Promise<{ success: boolean; message?: string }>;
    onFreezeCard: (id: number) => void;
    onReplaceCard?: (id: number) => Promise<'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'ERROR'>;
    onDeleteCard?: (id: number) => Promise<{ success: boolean; message?: string }>;
    onChangePin?: (id: number, newPin: string) => void;
    onTopUp: (amount: number) => void;
    cardControls?: { online: boolean; international: boolean; contactless: boolean };
    onUpdateControls?: (controls: any) => void;
    monthlySpend?: number;
    monthlyLimit?: number;
    kycLevel?: number;
    onModalChange?: (isOpen: boolean) => void;
    onNavigate?: (path: string) => void;
    isBalanceHidden?: boolean;
}

export const Accounts: React.FC<AccountsProps> = ({
    user, onSendOtp, onVerifyOtp, onUpdatePin,
    accounts, cards, onAddCard, onFreezeCard, onReplaceCard, onDeleteCard, onChangePin,
    cardControls = { online: true, international: false, contactless: true },
    onUpdateControls,
    monthlySpend = 0,
    monthlyLimit = 5000,
    kycLevel = 1,
    onModalChange,
    onNavigate,
    isBalanceHidden = false
}) => {
    const [view, setView] = useState<'list' | 'add' | 'success'>('list');
    const [activeCardIndex, setActiveCardIndex] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const [copied, setCopied] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [showReplaceModal, setShowReplaceModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [replaceError, setReplaceError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isSettingUpNewCard, setIsSettingUpNewCard] = useState(false);

    const [pinStep, setPinStep] = useState<'verify' | 'otp' | 'new'>('verify');
    const [currentPinInput, setCurrentPinInput] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [pinError, setPinError] = useState('');

    const [actionSuccess, setActionSuccess] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [networkError, setNetworkError] = useState<string | null>(null);

    const [showProvisionPinModal, setShowProvisionPinModal] = useState(false);
    const [provisionPin, setProvisionPin] = useState('');
    const [provisionConfirmPin, setProvisionConfirmPin] = useState('');
    const [provisionError, setProvisionError] = useState('');

    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [withdrawalAccount, setWithdrawalAccount] = useState<any>(null);

    // Transfer Modal State
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedTransferAccount, setSelectedTransferAccount] = useState<any>(null);
    const [transferStep, setTransferStep] = useState<'options' | 'input'>('options');
    const [transferAmountInput, setTransferAmountInput] = useState('');

    // Daily Interest Logic — runs once per day per device
    useEffect(() => {
        const checkAndPayInterest = async () => {
            const investmentAccount = accounts.find(a => (a.type || '').toLowerCase() === 'investment');
            if (!investmentAccount || Number(investmentAccount.balance) <= 0) return;

            // Guard: only pay once per calendar day per investment account
            const today = new Date().toDateString();
            const lastPayout = localStorage.getItem(`last_interest_${investmentAccount.id}`);
            if (lastPayout === today) return;

            // Calculate Daily Interest (8% APY, compounded daily)
            const principal = Number(investmentAccount.balance);
            const dailyRate = 0.08 / 365;
            const interest = principal * dailyRate;

            if (interest <= 0) return;

            try {
                // 1. Credit interest directly INTO the locked investment account
                //    This makes the locked balance grow visibly over time (compound effect)
                const { error: intErr } = await supabase.from('mvp_accounts').update({ balance: principal + interest }).eq('id', investmentAccount.id);
                if (intErr) throw new Error(intErr.message);

                // 2. Record a transaction entry so it shows in history
                const { error: txErr } = await supabase.from('mvp_transactions').insert([{
                    user_id: user?.id || 'ME',
                    account_id: investmentAccount.id,
                    amount: interest,
                    type: 'Interest',
                    description: `Daily Interest @ 8% APY (+$${interest.toFixed(4)})`,
                    status: 'Success',
                    date: new Date().toISOString()
                }]);
                if (txErr) console.error('Interest tx failed:', txErr.message);

                // 3. Mark paid for today so it won't run again until tomorrow
                localStorage.setItem(`last_interest_${investmentAccount.id}`, today);

                // 4. Refresh account balances in-place
                try {
                    const { data: freshAccs } = await supabase.from('mvp_accounts').select('*');
                    if (freshAccs && (window as any).__setAccounts) {
                        (window as any).__setAccounts(
                            freshAccs.map((a: any) => ({ ...a, accountNumber: a.account_number, balance: Number(a.balance) }))
                        );
                    }
                } catch { /* non-critical */ }

            } catch (e) {
                console.error('Failed to pay daily interest', e);
            }
        };

        // Delay 6s to let accounts load fully before checking
        const timer = setTimeout(checkAndPayInterest, 6000);
        return () => clearTimeout(timer);
    }, [accounts, user?.id]);

    const handleTransferClick = (account: any) => {
        setSelectedTransferAccount(account);
        setTransferStep('options');
        setTransferAmountInput('');
        setShowTransferModal(true);
    };

    const handleInternalTransferSubmit = async () => {
        if (!selectedTransferAccount) return;
        const amount = Number(transferAmountInput.replace(/,/g, ''));
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        if (amount > Number(selectedTransferAccount.balance)) {
            alert("Insufficient funds.");
            return;
        }

        setIsProcessing(true);
        try {
            // Determine Target Account
            const isSourceChecking = (selectedTransferAccount.type || '').toLowerCase() === 'checking' || (selectedTransferAccount.name || '').toLowerCase().includes('checking');
            let targetAccount;

            if (isSourceChecking) {
                targetAccount = accounts.find(a => (a.type || '').toLowerCase() === 'savings' || (a.name || '').toLowerCase().includes('saving'));
            } else {
                targetAccount = accounts.find(a => (a.is_main == 1 || a.name === 'Main Wallet' || (a.type || '').toLowerCase() === 'checking'));
            }

            if (!targetAccount) {
                throw new Error(isSourceChecking ? "No Savings Account found." : "No Checking Account found.");
            }

            if (isNaN(amount)) throw new Error("Invalid transfer amount");

            const newSourceBalance = Number(selectedTransferAccount.balance) - amount;
            const newTargetBalance = Number(targetAccount.balance) + amount;

            if (isNaN(newSourceBalance) || isNaN(newTargetBalance)) {
                throw new Error("Balance calculation error");
            }

            // Perform Updates — use Supabase directly (MVP API broken 404)
            // Debit Source
            const { error: srcErr } = await supabase.from('mvp_accounts').update({ balance: newSourceBalance }).eq('id', selectedTransferAccount.id);
            if (srcErr) throw new Error(srcErr.message);
            // Credit Target
            const { error: tgtErr } = await supabase.from('mvp_accounts').update({ balance: newTargetBalance }).eq('id', targetAccount.id);
            if (tgtErr) throw new Error(tgtErr.message);

            // Create Transaction Record (Source View)
            const { error: tx1Err } = await supabase.from('mvp_transactions').insert([{
                user_id: user.id || 'ME',
                account_id: selectedTransferAccount.id,
                amount: -amount,
                type: 'Transfer Out',
                description: `Transfer to ${targetAccount.name}`,
                status: 'Success',
                date: new Date().toISOString()
            }]);
            if (tx1Err) console.error('Transfer out tx failed:', tx1Err.message);

            // Create Transaction Record (Target View)
            const { error: tx2Err } = await supabase.from('mvp_transactions').insert([{
                user_id: user.id || 'ME',
                account_id: targetAccount.id,
                amount: amount,
                type: 'Transfer In',
                description: `Transfer from ${selectedTransferAccount.name}`,
                status: 'Success',
                date: new Date().toISOString()
            }]);
            if (tx2Err) console.error('Transfer in tx failed:', tx2Err.message);

            // Send Email
            if (user?.email) {
                const emailSubject = `Transfer Successful: $${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                const emailBody = `<p>You successfully transferred <b>$${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</b> from ${selectedTransferAccount.name} to ${targetAccount.name}.</p>`;
                await mvp.sendEmail(user.email, emailSubject, emailBody, 'Transaction Alert');
            }

            setActionSuccess("Transfer successful!");
            setTimeout(() => {
                setShowTransferModal(false);
                window.location.reload();
            }, 1000);

        } catch (error: any) {
            console.error('Transfer failed', error);
            alert(error.message || "Transfer failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEnrollment = async (amount: number, sourceAccountId: number) => {
        console.log('[Enrollment] Starting with amount:', amount, 'sourceId:', sourceAccountId);
        try {
            if (amount > 0) {
                const sourceAccount = accounts.find(a => a.id === sourceAccountId);
                console.log('[Enrollment] Source account found:', sourceAccount?.name, 'balance:', sourceAccount?.balance);

                if (!sourceAccount) {
                    throw new Error("Selected funding account not found.");
                }

                if ((Number(sourceAccount.balance) || 0) < amount) {
                    throw new Error("Insufficient funds in selected account.");
                }

                // Deduct from Source Account
                const newBalance = (Number(sourceAccount.balance) || 0) - amount;
                console.log('[Enrollment] Deducting', amount, 'from source. New balance:', newBalance);
                const { error: srcErr } = await supabase.from('mvp_accounts').update({ balance: newBalance }).eq('id', sourceAccount.id);
                if (srcErr) throw new Error(srcErr.message);
                console.log('[Enrollment] Source account updated');

                // Create Transaction for the deduction
                console.log('[Enrollment] Creating transaction record...');
                const { error: txErr } = await supabase.from('mvp_transactions').insert([{
                    user_id: user?.id || 'ME',
                    account_id: sourceAccount.id,
                    amount: -amount,
                    type: 'Transfer Out',
                    description: 'High Yield Investment Deposit',
                    status: 'Success',
                    date: new Date().toISOString()
                }]);
                if (txErr) console.error('Enrollment tx failed:', txErr.message);
            }

            // Credit Investment Account (Create or Update)
            const existingInvestmentAccount = accounts.find(a => (a.type || '').toLowerCase() === 'investment');
            console.log('[Enrollment] Existing investment account:', existingInvestmentAccount?.id);

            if (existingInvestmentAccount) {
                const newInvestmentBalance = (Number(existingInvestmentAccount.balance) || 0) + amount;
                console.log('[Enrollment] Updating investment balance to:', newInvestmentBalance);
                const { error: invErr } = await supabase.from('mvp_accounts').update({ balance: newInvestmentBalance }).eq('id', existingInvestmentAccount.id);
                if (invErr) throw new Error(invErr.message);
                console.log('[Enrollment] Investment account updated');
            } else {
                console.log('[Enrollment] Creating new investment account with balance:', amount);
                const { error: insErr } = await supabase.from('mvp_accounts').insert([{
                    user_id: user?.id,
                    name: 'High Yield Savings',
                    type: 'Investment',
                    balance: amount,
                    account_number: '8000' + Math.floor(Math.random() * 9000000000),
                    color: 'bg-indigo-900',
                    is_main: 0
                }]);
                if (insErr) throw new Error(insErr.message);
                console.log('[Enrollment] New investment account created');
            }

            // Close modal immediately after DB ops succeed
            console.log('[Enrollment] Closing modal...');
            setShowEnrollmentModal(false);

            // Store original principal for accurate "earned" display decoupled from admin edits
            if (existingInvestmentAccount) {
                const prevPrincipal = Number(localStorage.getItem(`hyi_principal_${user?.id}`) || 0);
                localStorage.setItem(`hyi_principal_${user?.id}`, String(prevPrincipal + amount));
            } else {
                localStorage.setItem(`hyi_principal_${user?.id}`, String(amount));
            }

            // Refresh accounts in-place instead of full page reload
            try {
                const { data: freshAccs } = await supabase.from('mvp_accounts').select('*');
                if (freshAccs && (window as any).__setAccounts) {
                    (window as any).__setAccounts(freshAccs.map((a: any) => ({ ...a, accountNumber: a.account_number, balance: Number(a.balance) })));
                } else {
                    window.location.reload();
                }
            } catch {
                window.location.reload();
            }

            // Send Welcome Email — non-blocking; MVP API is broken (404) so we must not await
            try {
                const preferredLang = localStorage.getItem('preferredLanguage') || 'en';
                const { subject, content } = getEmailTemplate('high_yield_enrollment', {
                    user_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member',
                    account_number: '****',
                    date: new Date().toLocaleDateString(),
                    amount: amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                }, preferredLang);
                if (user?.email) {
                    mvp.sendEmail(user.email, subject, content, 'Deposit').catch(() => {});
                }
            } catch {
                // Ignore email failure entirely
            }

            console.log('[Enrollment] Complete');
        } catch (error: any) {
            console.error('[Enrollment] Failed:', error);
            alert(error.message || "Failed to create investment account. Please try again.");
            throw error; // Re-throw so the modal knows it failed and can reset isProcessing
        }
    };

    const handleBreakSaving = async (investmentAccount: any) => {
        setWithdrawalAccount(investmentAccount);
        setShowWithdrawalModal(true);
    };

    const handleConfirmWithdrawal = async () => {
        if (!withdrawalAccount) return;
        console.log('[Withdrawal] Starting for account:', withdrawalAccount.id, 'balance:', withdrawalAccount.balance);

        // Find destination account: Prefer 'Savings', else 'Main Wallet'
        const targetAccount = accounts.find(a => (a.type || '').toLowerCase() === 'savings') ||
            accounts.find(a => (a.is_main == 1 || a.is_main === true || a.name === 'Main Wallet')) ||
            accounts[0];

        if (!targetAccount) {
            alert("No valid account found to credit funds.");
            setShowWithdrawalModal(false);
            return;
        }
        console.log('[Withdrawal] Target account:', targetAccount.id, targetAccount.name);

        const amount = Number(withdrawalAccount.balance);
        if (amount <= 0) {
            alert("No funds to withdraw.");
            setShowWithdrawalModal(false);
            return;
        }

        try {
            // 1. Credit Target Account
            const newTargetBalance = (Number(targetAccount.balance) || 0) + amount;
            console.log('[Withdrawal] Crediting target', targetAccount.id, 'new balance:', newTargetBalance);
            const { error: credErr } = await supabase.from('mvp_accounts').update({ balance: newTargetBalance }).eq('id', targetAccount.id);
            if (credErr) throw new Error(credErr.message);
            console.log('[Withdrawal] Target credited successfully');

            // 2. Delete Investment Account — use supabaseAdmin to bypass RLS
            console.log('[Withdrawal] Deleting investment account', withdrawalAccount.id);
            const { error: delErr } = await supabaseAdmin.from('mvp_accounts').delete().eq('id', withdrawalAccount.id);
            if (delErr) throw new Error(delErr.message);
            console.log('[Withdrawal] Delete command sent, verifying...');

            // Verify deletion actually happened
            const { data: verify } = await supabaseAdmin.from('mvp_accounts').select('id').eq('id', withdrawalAccount.id).single();
            if (verify) {
                console.error('[Withdrawal] CRITICAL: Account still exists after delete!', verify);
                throw new Error('Account deletion failed — account still exists in database.');
            }
            console.log('[Withdrawal] Account deletion verified');

            // 3. Record Transaction
            const { error: txErr } = await supabase.from('mvp_transactions').insert([{
                user_id: user?.id,
                account_id: targetAccount.id,
                amount: amount,
                type: 'Transfer In',
                description: 'High Yield Savings Withdrawal',
                status: 'Success',
                date: new Date().toISOString()
            }]);
            if (txErr) console.error('Withdrawal tx failed:', txErr.message);

            // Clear stored principal
            localStorage.removeItem(`hyi_principal_${user?.id}`);

            setShowWithdrawalModal(false);
            console.log('[Withdrawal] Modal closed');

            // Refresh accounts in-place
            try {
                const { data: freshAccs } = await supabaseAdmin.from('mvp_accounts').select('*');
                console.log('[Withdrawal] Refreshed accounts count:', freshAccs?.length || 0);
                if (freshAccs && (window as any).__setAccounts) {
                    (window as any).__setAccounts(freshAccs.map((a: any) => ({ ...a, accountNumber: a.account_number, balance: Number(a.balance) })));
                } else {
                    window.location.reload();
                }
            } catch {
                window.location.reload();
            }

            console.log('[Withdrawal] Complete');
        } catch (e: any) {
            console.error('[Withdrawal] Failed:', e);
            alert(e.message || "Error processing withdrawal.");
        }
    };

    // OTP Logic
    const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
    const [resendTimer, setResendTimer] = useState(0);

    // Timer Effect
    useEffect(() => {
        let interval: any;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const [formData, setFormData] = useState({
        type: 'VISA',
        number: '',
        holder: '',
        expiry: '',
        cvv: '',
        pin: ''
    });
    const [skipPin, setSkipPin] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const mainCard = (cards && cards.length > 0) ? (cards[activeCardIndex] || cards[0]) : null;

    useEffect(() => {
        if (activeCardIndex >= cards.length && cards.length > 0) {
            setActiveCardIndex(0);
            if (scrollRef.current) {
                scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            }
        }
    }, [cards.length, activeCardIndex]);

    const isDefaultCard = mainCard ? (mainCard.isDefault === true || mainCard.is_default === true || mainCard.type === '{APP_CONFIG.PREMIUM_CARD_NAME}') : false;

    const settings = cardControls;
    const spendPercentage = Math.min((monthlySpend / (monthlyLimit || 5000)) * 100, 100);
    const isNearLimit = spendPercentage > 90;

    useEffect(() => {
        const isAnyOpen = showReplaceModal || showPinModal || showDeleteModal || showProvisionPinModal || !!networkError;
        if (onModalChange) onModalChange(isAnyOpen);
        document.body.style.overflow = isAnyOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showReplaceModal, showPinModal, showDeleteModal, showProvisionPinModal, networkError, onModalChange]);

    const getCardAsset = (type: string = '') => {
        const t = (type || '').toLowerCase();
        if (t.includes('visa')) return { url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg', className: 'brightness-0 invert' };
        if (t.includes('master')) return { url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg', className: '' };
        if (t.includes('amex') || t.includes('american')) return { url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg', className: 'brightness-0 invert' };
        return null;
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!skipPin && formData.pin.length !== 4) {
            setNetworkError("Please enter a 4-digit PIN or choose to skip.");
            return;
        }

        setIsVerifying(true);
        try {
            const pinToSave = skipPin ? undefined : formData.pin;
            const result = await onAddCard(formData.type, formData.number, formData.holder.toUpperCase(), formData.expiry, pinToSave, formData.cvv);

            if (result.success) {
                setView('success');
            } else {
                setNetworkError(result.message || "Failed to add card. Please check your network or try again.");
            }
        } catch (err) {
            setNetworkError("An unexpected error occurred.");
        } finally {
            setIsVerifying(false);
        }
    };

    const toggleDetailView = () => {
        setShowDetails(!showDetails);
    };

    const resetAddForm = () => {
        setFormData({ type: 'VISA', number: '', holder: '', expiry: '', cvv: '', pin: '' });
        setSkipPin(false); setView('list');
    };

    const resetPinState = () => {
        setShowPinModal(false); setPinStep('verify'); setCurrentPinInput(''); setOtpInput(''); setNewPin(''); setConfirmPin(''); setPinError(''); setIsSettingUpNewCard(false);
    };

    const handleConfirmReplace = async () => {
        if (mainCard && onReplaceCard) {
            setIsProcessing(true); setReplaceError('');
            await new Promise(resolve => setTimeout(resolve, 1500));
            const result = await onReplaceCard(mainCard.id);
            setIsProcessing(false);
            if (result === 'SUCCESS') {
                setShowReplaceModal(false); setIsSettingUpNewCard(true); setPinStep('new'); setShowPinModal(true);
            } else if (result === 'INSUFFICIENT_FUNDS') { setReplaceError('Insufficient balance (Zero funds).'); }
            else { setReplaceError('System error occurred. Please try again.'); }
        }
    };

    const handleConfirmDelete = async () => {
        if (isDefaultCard) return;
        if (mainCard && onDeleteCard) {
            setIsProcessing(true); setDeleteError('');
            const result = await onDeleteCard(mainCard.id);
            setIsProcessing(false);
            if (result && result.success) {
                setShowDeleteModal(false); setActionSuccess('Card removed successfully');
                setTimeout(() => setActionSuccess(null), 3000);
            } else { setDeleteError(result?.message || 'Failed to delete card. Please try again.'); }
        }
    };

    const handleFreezeToggle = (id: number) => {
        if (!mainCard) return;
        if (mainCard.isFrozen && (mainCard.pin === 'RESET' || !mainCard.pin)) {
            setIsSettingUpNewCard(true); setPinStep('new'); setShowPinModal(true);
        } else { onFreezeCard(id); }
    };

    const handleVerifyCurrentPin = async (e: React.FormEvent) => {
        e.preventDefault(); setPinError(''); setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsProcessing(false);
        if (currentPinInput === '1234' || currentPinInput === (mainCard as any).pin) { setPinStep('new'); }
        else { setPinError('Incorrect PIN.'); }
    };

    const handleSendOtp = async () => {
        setPinError(''); setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsProcessing(false); setPinStep('otp');
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setIsProcessing(true);
        try {
            const result = await onSendOtp?.();
            if (result) {
                setGeneratedOtp(result);
                setResendTimer(60);
            }
        } catch (error) {
            console.error("Failed to resend OTP", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault(); setPinError('');
        if (otpInput.length !== 6) { setPinError('Enter a valid 6-digit code'); return; }
        setIsProcessing(true); await new Promise(resolve => setTimeout(resolve, 1000));
        setIsProcessing(false); setPinStep('new');
    };

    const handleSetNewPin = async (e: React.FormEvent) => {
        e.preventDefault(); setPinError('');
        if (newPin.length !== 4) return;
        if (newPin !== confirmPin) { setPinError('PINs do not match'); return; }

        if (Math.random() > 0.9) {
            setNetworkError("Unable to verify security credentials. The banking core is temporarily unreachable.");
            return;
        }

        if (mainCard && onChangePin) {
            setIsProcessing(true); await new Promise(resolve => setTimeout(resolve, 1000));
            onChangePin(mainCard.id, newPin);
            if (isSettingUpNewCard || mainCard.pin === 'RESET' || !mainCard.pin) {
                onFreezeCard(mainCard.id); setActionSuccess('Card Activated & PIN Set!');
            } else { setActionSuccess('PIN updated successfully!'); }
            setIsProcessing(false); resetPinState();
            setTimeout(() => setActionSuccess(null), 3000);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text); setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleSetting = (key: keyof typeof settings) => {
        if (onUpdateControls) onUpdateControls({ [key]: !settings[key] });
    };

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const index = Math.round(scrollLeft / clientWidth);
            if (index !== activeCardIndex && index >= 0 && index < cards.length) setActiveCardIndex(index);
        }
    };

    const scrollToCard = (index: number) => {
        if (scrollRef.current) scrollRef.current.scrollTo({ left: index * scrollRef.current.clientWidth, behavior: 'smooth' });
    };

    const formatCardNumber = (num: string) => (num || '').replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
        let detectedType = formData.type;
        if (val.startsWith('4')) detectedType = 'VISA';
        else if (val.startsWith('5')) detectedType = 'Mastercard';
        else if (val.startsWith('3')) detectedType = 'Amex';
        setFormData({ ...formData, number: val, type: detectedType });
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
        setFormData({ ...formData, expiry: val });
    };

    if (view === 'success') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center animate-fade-in p-2.5">
                <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-6 md:p-8 text-center shadow-xl border border-slate-100 dark:border-slate-700">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                        <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400 md:w-10 md:h-10" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">Card Added!</h2>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mb-6 md:mb-8">Your card ending in {formData.number.slice(-4) || '....'} has been {skipPin ? 'added. It is currently frozen until you set a PIN.' : 'verified and added.'}</p>
                    <button onClick={resetAddForm} className="w-full py-3 md:py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg">Back to Wallet</button>
                </div>
            </div>
        );
    }

    if (view === 'add') {
        const asset = getCardAsset(formData.type);
        return (
            <div className="animate-fade-in max-w-2xl mx-auto">
                {networkError && (
                    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center px-0 md:px-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setNetworkError(null)}></div>
                        <div className="relative bg-white dark:bg-slate-800 w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:animate-in md:zoom-in duration-200 mb-0 pb-10 md:pb-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="text-6xl mb-4 animate-pulse">🔌</div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Connection Lost</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{networkError}</p>
                                <button onClick={() => setNetworkError(null)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg">Retry Connection</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
                    <button onClick={() => setView('list')} className="p-1.5 md:p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"><ArrowLeft size={20} className="md:w-6 md:h-6" /></button>
                    <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg md:rounded-xl p-2 md:p-3 flex items-center gap-2 md:gap-3">
                        <AlertCircle size={14} className="text-blue-600 dark:text-blue-400 md:w-4 md:h-4" />
                        <p className="text-[10px] md:text-xs text-blue-700 dark:text-blue-300 font-medium">Linking your card is quick and secure.</p>
                    </div>
                </div>

                <div className="mb-4 md:mb-8 transform transition-all hover:scale-[1.02] duration-300">
                    <div className="relative h-40 md:h-auto md:aspect-[1.586] w-full max-w-sm mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl md:rounded-3xl p-4 md:p-8 text-white shadow-xl overflow-hidden flex flex-col justify-between border border-white/10">
                        <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-white/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 md:w-64 h-32 md:h-64 bg-blue-500/10 rounded-full -ml-8 -mb-8 blur-2xl"></div>
                        {asset && <div className="absolute -bottom-10 -right-10 opacity-[0.07] rotate-[-15deg] pointer-events-none"><img src={asset.url} alt="" className="w-64 h-auto grayscale invert" /></div>}
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <span className="font-bold tracking-wider opacity-80 text-xs md:text-base">{APP_CONFIG.BRAND_NAME}</span>
                                {asset ? <img src={asset.url} alt={formData.type || 'Card'} className={`h-6 md:h-8 w-auto object-contain ${asset.className}`} /> : <span className="font-bold italic text-xs md:text-base">{formData.type}</span>}
                            </div>
                            <div className="space-y-2 md:space-y-4">
                                <div className="flex items-center gap-2 md:gap-3"><Wifi size={16} className="rotate-90 opacity-70 md:w-5 md:h-5" /></div>
                                <p className="font-mono text-lg md:text-2xl tracking-widest text-shadow">{formData.number ? formatCardNumber(formData.number) : '•••• •••• •••• ••••'}</p>
                            </div>
                            <div className="flex justify-between items-end text-[10px] md:text-xs uppercase tracking-widest opacity-80">
                                <div><p className="opacity-60 mb-0.5">Card Holder</p><p>{formData.holder || 'YOUR NAME'}</p></div>
                                <div className="text-right"><p className="opacity-60 mb-0.5">Expires</p><p>{formData.expiry || 'MM/YY'}</p></div>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleAddSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-2.5 md:p-8 shadow-sm space-y-2.5 md:space-y-6">
                    <div className="space-y-1 md:space-y-1.5"><label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase ml-1">Card Number</label><div className="relative"><CreditCard size={16} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" value={formData.number} onChange={handleNumberChange} maxLength={16} className="w-full pl-9 md:pl-11 pr-3 md:pr-4 py-2.5 md:py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm md:text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0000 0000 0000 0000" required /></div></div>
                    <div className="grid grid-cols-2 gap-2.5 md:gap-4"><div className="space-y-1 md:space-y-1.5"><label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase ml-1">Expiry Date</label><input type="text" value={formData.expiry} onChange={handleExpiryChange} maxLength={5} className="w-full px-3 md:px-4 py-2.5 md:py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm md:text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" placeholder="MM/YY" required /></div><div className="space-y-1 md:space-y-1.5"><label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase ml-1">CVV / CVC</label><input type="password" value={formData.cvv} onChange={e => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} maxLength={4} className="w-full px-3 md:px-4 py-2.5 md:py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm md:text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest" placeholder="•••" required /></div></div>
                    <div className="space-y-1 md:space-y-1.5"><label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase ml-1">Card Holder Name</label><input type="text" value={formData.holder} onChange={e => setFormData({ ...formData, holder: e.target.value })} className="w-full px-3 md:px-4 py-2.5 md:py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm md:text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" placeholder="e.g. JONATHAN ALEXAN" required /></div>
                    <div className="space-y-2 md:space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700"><div className="flex items-center justify-between"><label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase ml-1">Create Card PIN</label><div className="flex items-center gap-2"><input type="checkbox" id="skipPin" checked={skipPin} onChange={(e) => setSkipPin(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><label htmlFor="skipPin" className="text-[10px] md:text-xs text-slate-500 cursor-pointer">Skip (Card will be frozen)</label></div></div>{!skipPin && (<div className="relative"><Lock size={16} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="password" value={formData.pin} onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })} maxLength={4} className="w-full pl-9 md:pl-11 pr-3 md:pr-4 py-2.5 md:py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm md:text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-[0.5em]" placeholder="••••" /></div>)}</div>
                    <div className="pt-2"><button type="submit" disabled={isVerifying || !formData.number || !formData.holder || !formData.expiry || !formData.cvv || (!skipPin && formData.pin.length !== 4)} className="w-full py-3 md:py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold text-base md:text-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">{isVerifying ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />} {isVerifying ? 'Verifying...' : 'Verify & Add Card'}</button><p className="text-center text-[10px] md:text-xs text-slate-400 mt-3 md:mt-4 flex items-center justify-center gap-1"><Lock size={10} /> 128-bit Encrypted Connection</p></div>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto relative pb-10">
            {networkError && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center px-0 md:px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setNetworkError(null)}></div>
                    <div className="relative bg-white dark:bg-slate-800 w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:animate-in md:zoom-in duration-200 mb-0 pb-10 md:pb-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="text-6xl mb-4 animate-pulse">🔌</div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Connection Lost</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{networkError}</p>
                            <button onClick={() => setNetworkError(null)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {actionSuccess && (<div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4"><CheckCircle size={18} /> <span className="font-bold text-sm">{actionSuccess}</span></div>)}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center px-0 md:px-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-800 w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 shadow-2xl animate-slide-up md:animate-zoom-in pb-8 md:pb-6 mb-[85px] md:mb-0">
                        <div className="text-center mb-4"><div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600 dark:text-red-400"><Trash2 size={24} /></div><h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Card</h3><p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Are you sure you want to remove this card? This action cannot be undone.</p>{deleteError && <p className="text-xs font-bold text-red-500 mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">{deleteError}</p>}</div>
                        <div className="flex gap-3"><button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold">Cancel</button><button onClick={handleConfirmDelete} disabled={isProcessing} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">{isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Delete'}</button></div>
                    </div>
                </div>
            )}
            {showReplaceModal && (
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center px-0 md:px-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReplaceModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-800 w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 shadow-2xl animate-slide-up md:animate-zoom-in pb-8 md:pb-6 mb-[85px] md:mb-0">
                        <div className="text-center mb-4"><div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600 dark:text-red-400"><AlertCircle size={24} /></div><h3 className="text-lg font-bold text-slate-900 dark:text-white">Replace Card</h3><p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Are you sure? The current card will be deactivated immediately.</p><div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50"><p className="text-xs font-medium text-red-700 dark:text-red-300">A replacement fee of <strong>$5.00</strong> will be deducted from your account.</p></div>{replaceError && <p className="text-xs font-bold text-red-500 mt-2">{replaceError}</p>}</div>
                        <div className="flex gap-3"><button onClick={() => setShowReplaceModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold">Cancel</button><button onClick={handleConfirmReplace} disabled={isProcessing} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">{isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Confirm & Pay $5'}</button></div>
                    </div>
                </div>
            )}
            {showPinModal && (
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center px-0 md:px-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetPinState}></div>
                    <div className="relative bg-white dark:bg-slate-800 w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 shadow-2xl animate-slide-up md:animate-zoom-in pb-8 md:pb-6 mb-[85px] md:mb-0">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><KeyRound size={20} className="text-blue-600" /> {pinStep === 'verify' ? 'Change PIN' : pinStep === 'otp' ? 'Verify Identity' : 'Set New PIN'}</h3><button onClick={resetPinState} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><X size={20} className="text-slate-400" /></button></div>
                        {pinStep === 'verify' && (<form onSubmit={handleVerifyCurrentPin} className="space-y-4"><p className="text-sm text-slate-500 dark:text-slate-400">Enter current 4-digit PIN.</p><input type="password" maxLength={4} value={currentPinInput} onChange={e => { setCurrentPinInput(e.target.value.replace(/\D/g, '')); setPinError(''); }} className="w-full text-center text-3xl font-bold tracking-widest py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="••••" />{pinError && <p className="text-xs text-red-500 font-bold text-center">{pinError}</p>}<button type="submit" disabled={currentPinInput.length !== 4 || isProcessing} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">{isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Next'}</button><button type="button" onClick={handleSendOtp} className="w-full text-xs font-bold text-blue-600 hover:underline">Forgot PIN?</button></form>)}
                        {pinStep === 'otp' && (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl flex items-start gap-3">
                                    <Mail size={20} className="text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 font-bold">Verification Code Sent</p>
                                        <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">We've sent a 6-digit code to <strong>{user?.email || 'your email'}</strong>.</p>
                                    </div>
                                </div>
                                <input type="text" maxLength={6} value={otpInput} onChange={e => { setOtpInput(e.target.value.replace(/\D/g, '')); setPinError(''); }} className="w-full text-center text-2xl font-bold tracking-widest py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white" placeholder="000000" />
                                {pinError && <p className="text-xs text-red-500 font-bold text-center">{pinError}</p>}
                                <button type="submit" disabled={otpInput.length !== 6 || isProcessing} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">{isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Verify Code'}</button>

                                <div className="text-center">
                                    {resendTimer > 0 ? (
                                        <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
                                            <Clock size={12} /> Resend code in {resendTimer}s
                                        </p>
                                    ) : (
                                        <button type="button" onClick={handleResendOtp} className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                            Resend Code
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}
                        {pinStep === 'new' && (<form onSubmit={handleSetNewPin} className="space-y-4"><div className="space-y-2"><label className="text-xs font-bold text-slate-500">New PIN</label><input type="password" maxLength={4} value={newPin} onChange={e => { setNewPin(e.target.value.replace(/\D/g, '')); setPinError(''); }} className="w-full text-center text-2xl font-bold tracking-widest py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white" placeholder="••••" /></div><div className="space-y-2"><label className="text-xs font-bold text-slate-500">Confirm PIN</label><input type="password" maxLength={4} value={confirmPin} onChange={e => { setConfirmPin(e.target.value.replace(/\D/g, '')); setPinError(''); }} className="w-full text-center text-2xl font-bold tracking-widest py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white" placeholder="••••" /></div>{pinError && <p className="text-xs text-red-500 font-bold text-center">{pinError}</p>}<button type="submit" disabled={newPin.length !== 4 || confirmPin.length !== 4 || isProcessing} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">{isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Set PIN & Activate'}</button></form>)}
                    </div>
                </div>
            )}

            <div className="space-y-8 animate-fade-in relative px-0 md:px-0">
                {/* BANK ACCOUNTS SECTION */}
                {accounts && accounts.length > 0 && (
                    <div className="mb-0">
                        <div className="flex items-center gap-3 mb-4 md:mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Wallet size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bank Accounts</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Manage your liquid assets</p>
                            </div>
                        </div>

                        <div className="relative w-full">
                            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full gap-4 pb-4" style={{ scrollBehavior: 'smooth' }}>
                                {/* Sort Accounts: Checking First */}
                                {[...accounts]
                                    .filter(acc => (acc.type || '').toLowerCase() !== 'investment' && !(acc.name || '').toLowerCase().includes('high yield'))
                                    .sort((a, b) => {
                                        const isCheckingA = (a.type || '').toLowerCase() === 'checking' || (a.name || '').toLowerCase().includes('checking');
                                        const isCheckingB = (b.type || '').toLowerCase() === 'checking' || (b.name || '').toLowerCase().includes('checking');
                                        return (isCheckingA === isCheckingB) ? 0 : isCheckingA ? -1 : 1;
                                    }).map(acc => {
                                        const normalizedType = (acc.type || '').toLowerCase();
                                        const normalizedName = (acc.name || '').toLowerCase();
                                        const isSavings = normalizedType === 'savings' || normalizedName.includes('saving');
                                        const isChecking = !isSavings;
                                        return (
                                            <div key={acc.id} className={`flex-shrink-0 snap-center relative w-full max-w-[320px] md:max-w-[380px] h-48 md:h-60 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] group ${isChecking ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white'}`}>
                                                {/* Background Decoration */}
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>

                                                <div className="relative z-10 flex flex-col h-full justify-between p-5 md:p-8">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] py-1 px-2 md:px-3 rounded-full w-fit ${isChecking ? 'bg-white/10 text-slate-300' : 'bg-black/10 text-white/90'}`}>
                                                                {isChecking ? 'Checking' : 'Savings'}
                                                            </span>
                                                            {!isChecking && (
                                                                <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-white/90 mt-1 ml-1">
                                                                    <TrendingUp size={10} className="md:w-3 md:h-3" /> 4.5% APY
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleTransferClick(acc); }}
                                                                className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all ${isChecking ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'}`}
                                                                title="Transfer Funds"
                                                            >
                                                                <ArrowRightLeft size={18} className="md:w-6 md:h-6" />
                                                            </button>
                                                            <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${isChecking ? 'bg-white/10' : 'bg-black/10'}`}>
                                                                {isChecking ? <CreditCard size={18} className="md:w-6 md:h-6" /> : <Landmark size={18} className="md:w-6 md:h-6" />}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-2 md:mt-4 mb-1 md:mb-2">
                                                        <p className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${isChecking ? 'text-slate-400' : 'text-white/80'}`}>Available Balance</p>
                                                        <h3 className="text-2xl md:text-4xl font-mono font-bold tracking-tighter truncate">
                                                            {!isBalanceHidden ? '$' + acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '••••••••'}
                                                        </h3>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                        <div>
                                                            <p className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-0.5 md:mb-1 ${isChecking ? 'text-slate-500' : 'text-white/70'}`}>Account Number</p>
                                                            <div className="flex items-center gap-2 group/copy cursor-pointer" onClick={() => copyToClipboard(acc.accountNumber || '')}>
                                                                <p className="font-mono text-sm md:text-lg tracking-widest opacity-90">
                                                                    •••• {acc.accountNumber?.slice(-4)}
                                                                </p>
                                                                <Copy size={12} className="opacity-0 group-hover/copy:opacity-100 transition-opacity md:w-[14px]" />
                                                            </div>
                                                        </div>
                                                        {acc.is_main && (
                                                            <div className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 bg-white/20 backdrop-blur-md rounded-lg border border-white/20">
                                                                <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                                                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wide">Primary</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                {/* High Yield Investment Card Logic */}
                                {(() => {
                                    const investmentAccount = accounts.find(a => (a.type || '').toLowerCase() === 'investment');
                                    const balance = Number(investmentAccount?.balance) || 0;
                                    const hasLockedFunds = investmentAccount && (balance > 0);

                                    // --- Interest display calculations ---
                                    // earned = currentBalance - original deposit (from localStorage)
                                    // This stays accurate even if an admin modifies the balance from the backend.
                                    const storedPrincipal = Number(localStorage.getItem(`hyi_principal_${user?.id}`)) || 0;
                                    // If no principal stored (legacy), fall back to created_at estimate
                                    const earnedInterest = storedPrincipal > 0
                                        ? Math.max(0, balance - storedPrincipal)
                                        : (() => {
                                            const created = investmentAccount?.created_at
                                                ? new Date(investmentAccount.created_at).getTime()
                                                : Date.now() - (1000 * 60 * 60 * 24 * 5);
                                            const daysActive = Math.max(0, (Date.now() - created) / (1000 * 60 * 60 * 24));
                                            return balance * (0.08 / 365) * daysActive;
                                        })();
                                    const dailyGain = balance * (0.08 / 365);

                                    if (hasLockedFunds) {
                                        return (
                                            <div key={investmentAccount.id} className="flex-shrink-0 snap-center relative w-full max-w-[320px] md:max-w-[380px] h-48 md:h-60 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] group bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white">
                                                {/* Background Decoration & Chart */}
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>
                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

                                                {/* Interest Chart Line */}
                                                <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20 pointer-events-none">
                                                    <svg viewBox="0 0 300 100" className="w-full h-full fill-none stroke-emerald-400 stroke-[3]" preserveAspectRatio="none">
                                                        <path d="M0,80 C50,70 80,40 120,50 S180,20 220,30 S270,10 300,5 L300,100 L0,100 Z" className="fill-emerald-400/20 stroke-none" />
                                                        <path d="M0,80 C50,70 80,40 120,50 S180,20 220,30 S270,10 300,5" />
                                                    </svg>
                                                </div>

                                                <div className="relative z-10 flex flex-col h-full justify-between p-5 md:p-6">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] py-1 px-2 md:px-3 rounded-full w-fit bg-emerald-500/20 text-emerald-100 border border-emerald-500/20">
                                                                High Yield
                                                            </span>
                                                            <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-emerald-300 mt-1 ml-1">
                                                                <TrendingUp size={10} className="md:w-3 md:h-3" /> 8.00% APY
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setShowEnrollmentModal(true); }}
                                                            className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md group/add"
                                                        >
                                                            <Plus size={18} className="md:w-6 md:h-6 text-white group-hover/add:rotate-90 transition-transform" />
                                                        </button>
                                                    </div>

                                                    <div className="mt-2 text-center md:text-left">
                                                        <p className="text-[10px] md:text-xs font-medium mb-1 text-indigo-200">Total Locked Balance</p>
                                                        <h3 className="text-3xl md:text-5xl font-mono font-bold tracking-tighter truncate">
                                                            {!isBalanceHidden ? '$' + (Number(investmentAccount.balance) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '••••••••'}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1 md:justify-start justify-center">
                                                            <div className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1">
                                                                <TrendingUp size={10} className="text-emerald-400" />
                                                                <span className="text-[10px] font-bold text-emerald-100">
                                                                    +${earnedInterest.toFixed(2)} Earned <span className="opacity-70 text-[9px] font-normal">(+${dailyGain.toFixed(2)}/day)</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setShowEnrollmentModal(true); }}
                                                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-105 flex items-center gap-2"
                                                        >
                                                            <PlusCircle size={14} /> Add Funds
                                                        </button>

                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleBreakSaving(investmentAccount); }}
                                                            className="px-4 py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-200 text-indigo-200 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-all border border-white/5 hover:border-red-500/30 flex items-center gap-2 group/btn"
                                                        >
                                                            <Lock size={12} className="group-hover/btn:hidden" />
                                                            <Unlock size={12} className="hidden group-hover/btn:block text-red-300" />
                                                            Unlock
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div
                                                onClick={() => setShowEnrollmentModal(true)}
                                                className="flex-shrink-0 snap-center relative w-full max-w-[320px] md:max-w-[380px] h-48 md:h-60 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] group bg-gradient-to-br from-indigo-600 to-purple-700 text-white cursor-pointer"
                                            >
                                                {/* Background Decoration */}
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>
                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

                                                <div className="relative z-10 flex flex-col h-full justify-between p-5 md:p-8">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] py-1 px-2 md:px-3 rounded-full w-fit bg-white/10 text-indigo-100">
                                                                Investment
                                                            </span>
                                                            <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-white/90 mt-1 ml-1 animate-pulse">
                                                                <TrendingUp size={10} className="md:w-3 md:h-3" /> Up to 8.00% APY
                                                            </span>
                                                        </div>
                                                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/10">
                                                            <TrendingUp size={18} className="md:w-6 md:h-6" />
                                                        </div>
                                                    </div>

                                                    <div className="mt-2 md:mt-4 mb-1 md:mb-2">
                                                        <p className="text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 text-indigo-200">Total Portfolio Value</p>
                                                        <h3 className="text-2xl md:text-4xl font-mono font-bold tracking-tighter truncate opacity-50">
                                                            $0.00
                                                        </h3>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                        <div>
                                                            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-0.5 md:mb-1 text-indigo-200">Status</p>
                                                            <p className="font-mono text-sm md:text-lg tracking-widest opacity-90">
                                                                Start Investing
                                                            </p>
                                                        </div>
                                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                                                            <Plus size={16} className="md:w-5 md:h-5" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {!cards || cards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center bg-white dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700/50">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-700/30 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                            <CreditCard size={40} className="text-slate-300 dark:text-slate-500" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">No Active Cards</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8 leading-relaxed">
                            Your digital wallet is currently empty. Provision a new card to enable transactions.
                        </p>
                        <button
                            onClick={() => setView('add')}
                            className="group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl"
                        >
                            <span className="flex items-center gap-3">
                                <Plus size={16} /> Provision Card
                            </span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 md:gap-8 items-start">
                        <div className="space-y-2 md:space-y-6">
                            <div className="flex items-center justify-between lg:hidden mb-1"><h2 className="text-base font-bold text-slate-900 dark:text-white">My Cards</h2><button onClick={() => setView('add')} className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-blue-600 dark:text-blue-400"><Plus size={18} /></button></div>
                            <div className="relative w-full">
                                <div ref={scrollRef} onScroll={handleScroll} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full gap-0 pb-2" style={{ scrollBehavior: 'smooth' }}>
                                    {cards.map((card, idx) => {
                                        const asset = getCardAsset(card.type);
                                        const isLennoxBlack = card.type === APP_CONFIG.PREMIUM_CARD_NAME;
                                        const cardIsDefault = card.isDefault === true || card.is_default === true || isLennoxBlack;
                                        let displayGradient = card.gradient;
                                        if (isLennoxBlack) displayGradient = 'from-gray-900 to-gray-800';
                                        else if (!displayGradient) displayGradient = 'from-blue-600 to-blue-500';

                                        return (
                                            <div key={card.id} className="w-full flex-shrink-0 snap-center px-2 md:px-1">
                                                <div className={`relative w-full max-w-[320px] mx-auto md:max-w-[380px] h-48 md:h-60 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl transition-all duration-300 transform ${card.isFrozen ? 'grayscale opacity-90' : ''} border border-white/10`}>
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${displayGradient}`}></div>
                                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-30 mix-blend-overlay"></div>
                                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
                                                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
                                                    {asset && <div className="absolute -bottom-8 -right-8 opacity-[0.07] rotate-[-15deg] pointer-events-none"><img src={asset.url} alt="" className="w-56 h-auto grayscale invert" /></div>}
                                                    <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-between text-white z-10">
                                                        <div className="flex justify-between items-start"><div><span className="font-bold text-lg md:text-xl tracking-wider block">{APP_CONFIG.BRAND_NAME}</span><span className="text-[8px] md:text-[10px] opacity-80 uppercase tracking-widest">{cardIsDefault ? 'System Default' : 'Virtual Card'}</span></div>{asset ? <img src={asset.url} alt={card.type || 'Card'} className={`h-6 md:h-8 w-auto object-contain ${asset.className}`} /> : <span className="font-bold italic text-xs md:text-base">{formData.type}</span>}</div>
                                                        <div className="flex items-center gap-3 md:gap-4 my-auto"><div className="w-10 h-7 md:w-12 md:h-9 bg-yellow-200/90 rounded md:rounded-md relative overflow-hidden shadow-sm"><div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay"></div><div className="absolute top-1/2 left-0 w-full h-[1px] bg-yellow-600/40"></div><div className="absolute top-0 left-1/2 h-full w-[1px] bg-yellow-600/40"></div></div><div className="flex flex-col gap-1"><Wifi size={20} className="rotate-90 opacity-80 md:w-6 md:h-6" /></div></div>
                                                        <div><div className="flex items-center justify-between mb-3 md:mb-4"><p className="font-mono text-xl md:text-3xl tracking-widest font-bold text-shadow-sm truncate">{showDetails && idx === activeCardIndex ? formatCardNumber(card.number) : `**** **** **** ${(card.number || '....').slice(-4)}`}</p>{idx === activeCardIndex && <button onClick={toggleDetailView} className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors">{showDetails ? <EyeOff size={16} className="md:w-[18px]" /> : <Eye size={16} className="md:w-[18px]" />}</button>}</div><div className="flex justify-between items-end"><div><p className="text-[8px] md:text-[9px] uppercase tracking-widest opacity-70 mb-0.5 md:mb-1">Card Holder</p><p className="font-medium tracking-wide uppercase text-xs md:text-base">{card.holder}</p></div><div className="text-right"><p className="text-[8px] md:text-[9px] uppercase tracking-widest opacity-70 mb-0.5 md:mb-1">Valid Thru</p><p className="font-medium tracking-wide text-xs md:text-base">{card.expiry}</p></div></div></div>
                                                    </div>
                                                    {cardIsDefault && !card.isFrozen && (<div className="absolute top-0 right-0 p-4"><div className="bg-blue-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg border border-white/20">SYSTEM DEFAULT</div></div>)}
                                                    {card.isFrozen && <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20"><div className="bg-white/90 backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/50 text-slate-900 font-bold flex items-center gap-2 md:gap-3 shadow-xl text-xs md:text-base"><Snowflake size={16} className="text-blue-600 md:w-5 md:h-5" /> {(card.pin === 'RESET' || !card.pin) ? 'Card Frozen (Set PIN)' : 'Card Frozen'}</div></div>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="flex justify-center gap-2 md:gap-3">{cards.map((_, idx) => <button key={idx} onClick={() => scrollToCard(idx)} className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${idx === activeCardIndex ? 'bg-blue-600 w-6 md:w-8' : 'bg-slate-300 dark:bg-slate-700 w-1.5 md:w-2 hover:bg-blue-400'}`} />)}<button onClick={() => setView('add')} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 transition-colors flex items-center justify-center group" title="Add Card"><Plus size={8} className="text-slate-400 group-hover:text-white" /></button></div>

                            {mainCard && (
                                <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-3 md:p-5"><h4 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 md:mb-4">Card Details</h4><div className="space-y-2 md:space-y-4"><div className="flex justify-between items-center p-2.5 md:p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg md:rounded-xl border border-slate-100 dark:border-slate-700/50"><div><p className="text-[10px] md:text-xs text-slate-500">Card Number</p><p className="font-mono font-bold text-slate-900 dark:text-white tracking-wide text-xs md:text-base">{showDetails ? formatCardNumber(mainCard.number) : `•••• •••• •••• ${(mainCard.number || '....').slice(-4)}`}</p></div><button onClick={() => copyToClipboard(mainCard.number)} className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">{copied ? <Check size={16} className="md:w-[18px]" /> : <Copy size={16} className="md:w-[18px]" />}</button></div><div className="flex gap-2.5 md:gap-4"><div className="flex-1 p-2.5 md:p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg md:rounded-xl border border-slate-100 dark:border-slate-700/50"><p className="text-[10px] md:text-xs text-slate-500">CVV</p><p className="font-mono font-bold text-slate-900 dark:text-white tracking-wider text-xs md:text-base">{showDetails ? (mainCard.cvv || '***') : '•••'}</p></div><div className="flex-1 p-2.5 md:p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg md:rounded-xl border border-slate-100 dark:border-slate-700/50"><p className="text-[10px] md:text-xs text-slate-500">PIN</p><p className="font-mono font-bold text-slate-900 dark:text-white tracking-wider text-xs md:text-base">{showDetails ? (mainCard.pin || '****') : '****'}</p></div></div></div></div>
                            )}
                        </div>

                        <div className="space-y-2.5 md:space-y-6">
                            <div className="hidden lg:flex items-center justify-between"><div><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Card Settings</h2><p className="text-sm text-slate-500">Manage security and preferences</p></div><button onClick={() => setView('add')} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg"><Plus size={16} /> Add Card</button></div>

                            {mainCard && (
                                <div className="grid grid-cols-3 gap-2 md:gap-3">
                                    <button onClick={() => handleFreezeToggle(mainCard.id)} className={`p-2 md:p-4 rounded-xl md:rounded-2xl border flex flex-col items-center gap-2 md:gap-3 transition-all duration-200 ${mainCard.isFrozen ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'}`}><div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${mainCard.isFrozen ? 'bg-blue-200 dark:bg-blue-800' : 'bg-slate-100 dark:bg-slate-700'}`}><Snowflake size={16} className="md:w-5 md:h-5" /></div><span className="text-[10px] md:text-xs font-bold">{mainCard.isFrozen ? 'Unfreeze' : 'Freeze'}</span></button>

                                    {isDefaultCard && (
                                        <button onClick={() => setShowReplaceModal(true)} className="p-2 md:p-4 rounded-xl md:rounded-2xl border transition-all duration-200 flex flex-col items-center gap-2 md:gap-3 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm text-slate-600 dark:text-slate-300"><div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"><RefreshCw size={16} className="md:w-5 md:h-5" /></div><span className="text-[10px] md:text-xs font-bold">Replace</span></button>
                                    )}

                                    {!isDefaultCard && (
                                        <button onClick={() => setShowDeleteModal(true)} className="p-2 md:p-4 rounded-xl md:rounded-2xl border transition-all duration-200 flex flex-col items-center gap-2 md:gap-3 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-sm"><div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"><Trash2 size={16} className="md:w-5 md:h-5" /></div><span className="text-[10px] md:text-xs font-bold">Delete</span></button>
                                    )}

                                    <button onClick={() => { setIsSettingUpNewCard(false); setPinStep('verify'); setShowPinModal(true); }} className="p-2 md:p-4 rounded-xl md:rounded-2xl border flex flex-col items-center gap-2 md:gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition-all duration-200 text-slate-600 dark:text-slate-300"><div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700"><Lock size={16} className="md:w-5 md:h-5" /></div><span className="text-[10px] md:text-xs font-bold">Change PIN</span></button>
                                </div>
                            )}

                            <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"><h4 className="px-4 pt-4 pb-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Security Controls</h4><div className="divide-y divide-slate-100 dark:divide-slate-700"><div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"><div className="flex items-center gap-3"><div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400"><Globe size={16} className="md:w-5 md:h-5" /></div><div><p className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">Online Payments</p><p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">Allow internet transactions</p></div></div><button onClick={() => toggleSetting('online')} className={`w-10 h-5 md:w-12 md:h-6 rounded-full relative transition-colors duration-200 ${settings.online ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}><div className={`absolute top-1 w-3 h-3 md:w-4 md:h-4 rounded-full bg-white transition-all shadow-sm ${settings.online ? 'left-6 md:left-7' : 'left-1'}`}></div></button></div><div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"><div className="flex items-center gap-3"><div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400"><Wifi size={16} className="md:w-5 md:h-5 rotate-90" /></div><div><p className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">Contactless</p><p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">Tap to pay in stores</p></div></div><button onClick={() => toggleSetting('contactless')} className={`w-10 h-5 md:w-12 md:h-6 rounded-full relative transition-colors duration-200 ${settings.contactless ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}><div className={`absolute top-1 w-3 h-3 md:w-4 md:h-4 rounded-full bg-white transition-all shadow-sm ${settings.contactless ? 'left-6 md:left-7' : 'left-1'}`}></div></button></div><div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"><div className="flex items-center gap-3"><div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400"><Globe size={16} className="md:w-5 md:h-5" /></div><div><p className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">International</p><p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">Allow foreign transactions</p></div></div><button onClick={() => toggleSetting('international')} className={`w-10 h-5 md:w-12 md:h-6 rounded-full relative transition-colors duration-200 ${settings.international ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}><div className={`absolute top-1 w-3 h-3 md:w-4 md:h-4 rounded-full bg-white transition-all shadow-sm ${settings.international ? 'left-6 md:left-7' : 'left-1'}`}></div></button></div></div></div>
                            {isNearLimit && (<div className="bg-red-50 dark:bg-red-900/20 p-3 md:p-4 rounded-xl md:rounded-2xl border border-red-100 dark:border-red-800 flex items-start gap-3"><AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5" /><div><h4 className="text-xs md:text-sm font-bold text-red-700 dark:text-red-300">Monthly Limit Warning</h4><p className="text-[10px] md:text-xs text-red-600 dark:text-red-400 mt-1 leading-relaxed">You have used {spendPercentage.toFixed(0)}% of your monthly spending limit. Upgrade your KYC level to increase limits.</p></div></div>)}
                        </div>
                    </div>
                )}
            </div>
            {showEnrollmentModal && (
                <HighYieldEnrollmentModal
                    isOpen={showEnrollmentModal}
                    onClose={() => setShowEnrollmentModal(false)}
                    onEnroll={handleEnrollment}
                    userPin={user?.pin || user?.user_metadata?.pin}
                    accounts={accounts}
                    onSendOtp={onSendOtp}
                    onVerifyOtp={onVerifyOtp}
                    onUpdatePin={onUpdatePin}
                    userEmail={user?.email}
                />
            )}
            {showWithdrawalModal && withdrawalAccount && (
                <HighYieldWithdrawalModal
                    isOpen={showWithdrawalModal}
                    onClose={() => setShowWithdrawalModal(false)}
                    onConfirm={handleConfirmWithdrawal}
                    amount={Number(withdrawalAccount.balance)}
                    targetAccountName={(() => {
                        const target = accounts.find(a => (a.type || '').toLowerCase() === 'savings') ||
                            accounts.find(a => (a.is_main == 1 || a.is_main === true || a.name === 'Main Wallet')) ||
                            accounts[0];
                        return (target?.type === 'Savings' || target?.name?.includes('Saving')) ? 'Savings Account' : 'Main Wallet';
                    })()}
                />
            )}
            {showTransferModal && selectedTransferAccount && (
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center px-0 md:px-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowTransferModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-800 w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:animate-in md:zoom-in duration-300 pb-10 md:pb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <ArrowRightLeft size={20} className="text-blue-600" /> Transfer Funds
                            </h3>
                            <button onClick={() => setShowTransferModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        {transferStep === 'options' ? (
                            <div className="space-y-3">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Select transfer destination for <b>{selectedTransferAccount.name}</b></p>
                                <button
                                    onClick={() => onNavigate ? onNavigate('transfers') : (window.location.hash = 'transfers')}
                                    className="w-full py-4 px-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl flex items-center justify-between group transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <Globe size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">External Transfer</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">To another bank or user</p>
                                        </div>
                                    </div>
                                    <ArrowLeft size={16} className="rotate-180 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                </button>

                                <button
                                    onClick={() => setTransferStep('input')}
                                    className="w-full py-4 px-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl flex items-center justify-between group transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                            <RefreshCw size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                                                To {(selectedTransferAccount.type === 'Checking' || selectedTransferAccount.name?.includes('Checking')) ? 'Savings' : 'Checking'}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Internal transfer</p>
                                        </div>
                                    </div>
                                    <ArrowLeft size={16} className="rotate-180 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="border-b border-dashed border-slate-200 dark:border-slate-700 pb-3 mb-3">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">From</p>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-900 dark:text-white">{selectedTransferAccount.name}</span>
                                            <span className="text-xs font-mono text-slate-500">${Number(selectedTransferAccount.balance).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">To</p>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                {(selectedTransferAccount.type === 'Checking' || selectedTransferAccount.name?.includes('Checking')) ? 'Savings Account' : 'Main Checking'}
                                            </span>
                                            <span className="text-xs font-mono text-slate-500">Internal</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="text"
                                            value={transferAmountInput}
                                            onChange={(e) => {
                                                const rawValue = e.target.value.replace(/,/g, '');
                                                if (!isNaN(Number(rawValue)) || rawValue === '') {
                                                    const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                                    setTransferAmountInput(formatted);
                                                }
                                            }}
                                            className="w-full py-3 pl-8 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                            placeholder="0.00"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-2">
                                    <button onClick={() => setTransferStep('options')} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold">Back</button>
                                    <button
                                        onClick={handleInternalTransferSubmit}
                                        disabled={isProcessing || !transferAmountInput || Number(transferAmountInput.replace(/,/g, '')) <= 0}
                                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Transfer'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
