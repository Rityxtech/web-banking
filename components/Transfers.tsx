
import React, { useState, useRef, useEffect } from 'react';
import { Account } from '../types';
import { Wallet, CheckCircle, ChevronRight, ChevronDown, User, AtSign, DollarSign, ArrowLeft, FileText, ShieldCheck, Clock, Share2, Download, Calendar, Globe, AlertCircle, Loader2, XCircle, X } from 'lucide-react';
import { shareReceipt } from '../utils/receipt';
import { getEmailTemplate } from '../utils/emailTemplates';
import { APP_CONFIG } from '../config';
import { supabase } from '../services/supabase';
import { mvp } from '../services/mvpService';
import { PinVerificationModal } from './ui/PinVerificationModal';
import { NetworkDisruptionModal } from './ui/NetworkDisruptionModal';

const CURRENCIES = [
    { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'United States Dollar' },
    { code: 'EUR', symbol: '€', flag: '🇪🇺', name: 'Euro' },
    { code: 'GBP', symbol: '£', flag: '🇬🇧', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', flag: '🇯🇵', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', flag: '🇨🇳', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', flag: '🇮🇳', name: 'Indian Rupee' },
    { code: 'AUD', symbol: 'A$', flag: '🇦🇺', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', flag: '🇨🇦', name: 'Canadian Dollar' },
    { code: 'CHF', symbol: 'Fr', flag: '🇨🇭', name: 'Swiss Franc' },
    { code: 'SGD', symbol: 'S$', flag: '🇸🇬', name: 'Singapore Dollar' },
    { code: 'HKD', symbol: 'HK$', flag: '🇭🇰', name: 'Hong Kong Dollar' },
    { code: 'NZD', symbol: 'NZ$', flag: '🇳🇿', name: 'New Zealand Dollar' },
    { code: 'KRW', symbol: '₩', flag: '🇰🇷', name: 'South Korean Won' },
    { code: 'BRL', symbol: 'R$', flag: '🇧🇷', name: 'Brazilian Real' },
    { code: 'RUB', symbol: '₽', flag: '🇷🇺', name: 'Russian Ruble' },
    { code: 'ZAR', symbol: 'R', flag: '🇿🇦', name: 'South African Rand' },
    { code: 'MXN', symbol: 'Mex$', flag: '🇲🇽', name: 'Mexican Peso' },
    { code: 'SEK', symbol: 'kr', flag: '🇸🇪', name: 'Swedish Krona' },
    { code: 'NOK', symbol: 'kr', flag: '🇳🇴', name: 'Norwegian Krone' },
    { code: 'DKK', symbol: 'kr', flag: '🇩🇰', name: 'Danish Krone' },
    { code: 'TRY', symbol: '₺', flag: '🇹🇷', name: 'Turkish Lira' },
    { code: 'NGN', symbol: '₦', flag: '🇳🇬', name: 'Nigerian Naira' },
    { code: 'AED', symbol: 'Dh', flag: '🇦🇪', name: 'UAE Dirham' },
    { code: 'SAR', symbol: '﷼', flag: '🇸🇦', name: 'Saudi Riyal' },
    { code: 'QAR', symbol: '﷼', flag: '🇶🇦', name: 'Qatari Riyal' },
    { code: 'KWD', symbol: 'KD', flag: '🇰🇼', name: 'Kuwaiti Dinar' },
    { code: 'BHD', symbol: 'BD', flag: '🇧🇭', name: 'Bahraini Dinar' },
    { code: 'OMR', symbol: '﷼', flag: '🇴🇲', name: 'Omani Rial' },
    { code: 'JOD', symbol: 'JD', flag: '🇯🇴', name: 'Jordanian Dinar' },
    { code: 'ILS', symbol: '₪', flag: '🇮🇱', name: 'Israeli Shekel' },
    { code: 'EGP', symbol: '£E', flag: '🇪🇬', name: 'Egyptian Pound' },
    { code: 'ZMW', symbol: 'ZK', flag: '🇿🇲', name: 'Zambian Kwacha' },
    { code: 'KES', symbol: 'KSh', flag: '🇰🇪', name: 'Kenyan Shilling' },
    { code: 'GHS', symbol: '₵', flag: '🇬🇭', name: 'Ghanaian Cedi' },
    { code: 'UGX', symbol: 'USh', flag: '🇺🇬', name: 'Ugandan Shilling' },
    { code: 'TZS', symbol: 'TSh', flag: '🇹🇿', name: 'Tanzanian Shilling' },
    { code: 'XOF', symbol: 'CFA', flag: '🇧🇯', name: 'West African CFA Franc' },
    { code: 'XAF', symbol: 'CFA', flag: '🇨🇲', name: 'Central African CFA Franc' },
    { code: 'MAD', symbol: 'DH', flag: '🇲🇦', name: 'Moroccan Dirham' },
    { code: 'TND', symbol: 'DT', flag: '🇹🇳', name: 'Tunisian Dinar' },
    { code: 'DZD', symbol: 'DA', flag: '🇩🇿', name: 'Algerian Dinar' },
    { code: 'ETB', symbol: 'Br', flag: '🇪🇹', name: 'Ethiopian Birr' },
    { code: 'BWP', symbol: 'P', flag: '🇧🇼', name: 'Botswana Pula' },
    { code: 'MUR', symbol: '₨', flag: '🇲🇺', name: 'Mauritian Rupee' },
    { code: 'SCR', symbol: '₨', flag: '🇸🇨', name: 'Seychellois Rupee' },
    { code: 'PKR', symbol: '₨', flag: '🇵🇰', name: 'Pakistani Rupee' },
    { code: 'BDT', symbol: '৳', flag: '🇧🇩', name: 'Bangladeshi Taka' },
    { code: 'LKR', symbol: 'Rs', flag: '🇱🇰', name: 'Sri Lankan Rupee' },
    { code: 'NPR', symbol: '₨', flag: '🇳🇵', name: 'Nepalese Rupee' },
    { code: 'MMK', symbol: 'K', flag: '🇲🇲', name: 'Myanmar Kyat' },
    { code: 'THB', symbol: '฿', flag: '🇹🇭', name: 'Thai Baht' },
    { code: 'VND', symbol: '₫', flag: '🇻🇳', name: 'Vietnamese Dong' },
    { code: 'IDR', symbol: 'Rp', flag: '🇮🇩', name: 'Indonesian Rupiah' },
    { code: 'MYR', symbol: 'RM', flag: '🇲🇾', name: 'Malaysian Ringgit' },
    { code: 'PHP', symbol: '₱', flag: '🇵🇭', name: 'Philippine Peso' },
    { code: 'TWD', symbol: 'NT$', flag: '🇹🇼', name: 'Taiwan Dollar' },
    { code: 'KZT', symbol: '₸', flag: '🇰🇿', name: 'Kazakhstani Tenge' },
    { code: 'UZS', symbol: "so'm", flag: '🇺🇿', name: 'Uzbekistani Som' },
    { code: 'AZN', symbol: '₼', flag: '🇦🇿', name: 'Azerbaijani Manat' },
    { code: 'GEL', symbol: '₾', flag: '🇬🇪', name: 'Georgian Lari' },
    { code: 'AMD', symbol: '֏', flag: '🇦🇲', name: 'Armenian Dram' },
    { code: 'BYN', symbol: 'Br', flag: '🇧🇾', name: 'Belarusian Ruble' },
    { code: 'UAH', symbol: '₴', flag: '🇺🇦', name: 'Ukrainian Hryvnia' },
    { code: 'PLN', symbol: 'zł', flag: '🇵🇱', name: 'Polish Zloty' },
    { code: 'CZK', symbol: 'Kč', flag: '🇨🇿', name: 'Czech Koruna' },
    { code: 'HUF', symbol: 'Ft', flag: '🇭🇺', name: 'Hungarian Forint' },
    { code: 'RON', symbol: 'lei', flag: '🇷🇴', name: 'Romanian Leu' },
    { code: 'BGN', symbol: 'лв', flag: '🇧🇬', name: 'Bulgarian Lev' },
    { code: 'HRK', symbol: 'kn', flag: '🇭🇷', name: 'Croatian Kuna' },
    { code: 'RSD', symbol: 'din', flag: '🇷🇸', name: 'Serbian Dinar' },
    { code: 'MKD', symbol: 'ден', flag: '🇲🇰', name: 'Macedonian Denar' },
    { code: 'BAM', symbol: 'KM', flag: '🇧🇦', name: 'Bosnia-Herzegovina Mark' },
    { code: 'ALL', symbol: 'L', flag: '🇦🇱', name: 'Albanian Lek' },
    { code: 'ISK', symbol: 'kr', flag: '🇮🇸', name: 'Icelandic Krona' },
    { code: 'GIP', symbol: '£', flag: '🇬🇮', name: 'Gibraltar Pound' },
    { code: 'COP', symbol: '$', flag: '🇨🇴', name: 'Colombian Peso' },
    { code: 'ARS', symbol: '$', flag: '🇦🇷', name: 'Argentine Peso' },
    { code: 'CLP', symbol: '$', flag: '🇨🇱', name: 'Chilean Peso' },
    { code: 'PEN', symbol: 'S/', flag: '🇵🇪', name: 'Peruvian Sol' },
    { code: 'UYU', symbol: '$U', flag: '🇺🇾', name: 'Uruguayan Peso' },
    { code: 'PYG', symbol: '₲', flag: '🇵🇾', name: 'Paraguayan Guarani' },
    { code: 'BOB', symbol: 'Bs', flag: '🇧🇴', name: 'Bolivian Boliviano' },
    { code: 'CRC', symbol: '₡', flag: '🇨🇷', name: 'Costa Rican Colon' },
    { code: 'GTQ', symbol: 'Q', flag: '🇬🇹', name: 'Guatemalan Quetzal' },
    { code: 'HNL', symbol: 'L', flag: '🇭🇳', name: 'Honduran Lempira' },
    { code: 'NIO', symbol: 'C$', flag: '🇳🇮', name: 'Nicaraguan Cordoba' },
    { code: 'PAB', symbol: 'B/.', flag: '🇵🇦', name: 'Panamanian Balboa' },
    { code: 'DOP', symbol: 'RD$', flag: '🇩🇴', name: 'Dominican Peso' },
    { code: 'CUP', symbol: '$MN', flag: '🇨🇺', name: 'Cuban Peso' },
    { code: 'JMD', symbol: 'J$', flag: '🇯🇲', name: 'Jamaican Dollar' },
    { code: 'TTD', symbol: 'TT$', flag: '🇹🇹', name: 'Trinidad & Tobago Dollar' },
    { code: 'BBD', symbol: 'Bds$', flag: '🇧🇧', name: 'Barbadian Dollar' },
    { code: 'BZD', symbol: 'BZ$', flag: '🇧🇿', name: 'Belize Dollar' },
    { code: 'XCD', symbol: '$', flag: '🇦🇬', name: 'Eastern Caribbean Dollar' },
    { code: 'BSD', symbol: 'B$', flag: '🇧🇸', name: 'Bahamian Dollar' },
    { code: 'ANG', symbol: 'ƒ', flag: '🇨🇼', name: 'Netherlands Antillean Guilder' },
    { code: 'AWG', symbol: 'ƒ', flag: '🇦🇼', name: 'Aruban Florin' },
    { code: 'XPF', symbol: 'F', flag: '🇵🇫', name: 'CFP Franc' },
    { code: 'FJD', symbol: 'FJ$', flag: '🇫🇯', name: 'Fijian Dollar' },
    { code: 'PGK', symbol: 'K', flag: '🇵🇬', name: 'Papua New Guinean Kina' },
    { code: 'SBD', symbol: 'SI$', flag: '🇸🇧', name: 'Solomon Islands Dollar' },
    { code: 'VUV', symbol: 'VT', flag: '🇻🇺', name: 'Vanuatu Vatu' },
    { code: 'TOP', symbol: 'T$', flag: '🇹🇴', name: 'Tongan Paʻanga' },
    { code: 'WST', symbol: 'WS$', flag: '🇼🇸', name: 'Samoan Tala' },
    { code: 'NAD', symbol: 'N$', flag: '🇳🇦', name: 'Namibian Dollar' },
    { code: 'LSL', symbol: 'M', flag: '🇱🇸', name: 'Lesotho Loti' },
    { code: 'SZL', symbol: 'E', flag: '🇸🇿', name: 'Swazi Lilangeni' },
    { code: 'MWK', symbol: 'MK', flag: '🇲🇼', name: 'Malawian Kwacha' },
    { code: 'MZN', symbol: 'MT', flag: '🇲🇿', name: 'Mozambican Metical' },
    { code: 'AOA', symbol: 'Kz', flag: '🇦🇴', name: 'Angolan Kwanza' },
    { code: 'CDF', symbol: 'FC', flag: '🇨🇩', name: 'Congolese Franc' },
    { code: 'BIF', symbol: 'FBu', flag: '🇧🇮', name: 'Burundian Franc' },
    { code: 'RWF', symbol: 'FRw', flag: '🇷🇼', name: 'Rwandan Franc' },
    { code: 'GNF', symbol: 'FG', flag: '🇬🇳', name: 'Guinean Franc' },
    { code: 'SLL', symbol: 'Le', flag: '🇸🇱', name: 'Sierra Leonean Leone' },
    { code: 'LRD', symbol: 'L$', flag: '🇱🇷', name: 'Liberian Dollar' },
    { code: 'CVE', symbol: 'Esc', flag: '🇨🇻', name: 'Cape Verdean Escudo' },
    { code: 'GMD', symbol: 'D', flag: '🇬🇲', name: 'Gambian Dalasi' },
    { code: 'SOS', symbol: 'Sh', flag: '🇸🇴', name: 'Somali Shilling' },
    { code: 'DJF', symbol: 'Fdj', flag: '🇩🇯', name: 'Djiboutian Franc' },
    { code: 'KMF', symbol: 'CF', flag: '🇰🇲', name: 'Comorian Franc' },
    { code: 'MGA', symbol: 'Ar', flag: '🇲🇬', name: 'Malagasy Ariary' },
    { code: 'MRU', symbol: 'UM', flag: '🇲🇷', name: 'Mauritanian Ouguiya' },
    { code: 'SDG', symbol: 'ج.س', flag: '🇸🇩', name: 'Sudanese Pound' },
    { code: 'SSP', symbol: '£', flag: '🇸🇸', name: 'South Sudanese Pound' },
    { code: 'LYD', symbol: 'LD', flag: '🇱🇾', name: 'Libyan Dinar' },
    { code: 'MOP', symbol: 'MOP$', flag: '🇲🇴', name: 'Macanese Pataca' },
    { code: 'BND', symbol: 'B$', flag: '🇧🇳', name: 'Brunei Dollar' },
    { code: 'KHR', symbol: '៛', flag: '🇰🇭', name: 'Cambodian Riel' },
    { code: 'LAK', symbol: '₭', flag: '🇱🇦', name: 'Lao Kip' },
    { code: 'MNT', symbol: '₮', flag: '🇲🇳', name: 'Mongolian Tugrik' },
    { code: 'KPW', symbol: '₩', flag: '🇰🇵', name: 'North Korean Won' },
    { code: 'AFN', symbol: '؋', flag: '🇦🇫', name: 'Afghan Afghani' },
    { code: 'IRR', symbol: '﷼', flag: '🇮🇷', name: 'Iranian Rial' },
    { code: 'IQD', symbol: 'ع.د', flag: '🇮🇶', name: 'Iraqi Dinar' },
    { code: 'LBP', symbol: 'ل.ل', flag: '🇱🇧', name: 'Lebanese Pound' },
    { code: 'SYP', symbol: '£S', flag: '🇸🇾', name: 'Syrian Pound' },
    { code: 'YER', symbol: '﷼', flag: '🇾🇪', name: 'Yemeni Rial' },
    { code: 'BTN', symbol: 'Nu.', flag: '🇧🇹', name: 'Bhutanese Ngultrum' },
    { code: 'MVR', symbol: 'Rf', flag: '🇲🇻', name: 'Maldivian Rufiyaa' },
    { code: 'TJS', symbol: 'SM', flag: '🇹🇯', name: 'Tajikistani Somoni' },
    { code: 'KGS', symbol: 'с', flag: '🇰🇬', name: 'Kyrgystani Som' },
    { code: 'TMT', symbol: 'm', flag: '🇹🇲', name: 'Turkmenistani Manat' },
    { code: 'MDL', symbol: 'L', flag: '🇲🇩', name: 'Moldovan Leu' },
    { code: 'SUR', symbol: '$', flag: '🇸🇷', name: 'Surinamese Dollar' },
    { code: 'GYD', symbol: '$', flag: '🇬🇾', name: 'Guyanese Dollar' },
    { code: 'KYD', symbol: 'CI$', flag: '🇰🇾', name: 'Cayman Islands Dollar' },
    { code: 'FKP', symbol: '£', flag: '🇫🇰', name: 'Falkland Islands Pound' },
    { code: 'SHP', symbol: '£', flag: '🇸🇭', name: 'Saint Helena Pound' },
    { code: 'IMP', symbol: '£', flag: '🇮🇲', name: 'Isle of Man Pound' },
    { code: 'JEP', symbol: '£', flag: '🇯🇪', name: 'Jersey Pound' },
    { code: 'GGP', symbol: '£', flag: '🇬🇬', name: 'Guernsey Pound' },
    { code: 'KID', symbol: '$', flag: '🇰🇮', name: 'Kiribati Dollar' },
    { code: 'TVD', symbol: '$', flag: '🇹🇻', name: 'Tuvaluan Dollar' },
    { code: 'NAD', symbol: 'N$', flag: '🇳🇦', name: 'Namibian Dollar' },
    { code: 'ERN', symbol: 'Nfk', flag: '🇪🇷', name: 'Eritrean Nakfa' },
    { code: 'HTG', symbol: 'G', flag: '🇭🇹', name: 'Haitian Gourde' },
    { code: 'XDR', symbol: 'SDR', flag: '🌐', name: 'Special Drawing Rights' },
];

interface TransfersProps {
    accounts: Account[];
    onTransfer: (fromId: string, toId: string, amount: number, note: string, skipEmail?: boolean) => Promise<boolean> | void;
    onSchedule?: (fromId: string, toId: string, amount: number, note: string, date: string, frequency: string) => void;
    onBack?: () => void;
    maxLimit?: number;
    shouldFail?: boolean;
    kycLevel?: number;
    dailyLimit?: number;
    dailyUsage?: number;
    user?: any;
    isBalanceHidden?: boolean;
    onSendOtp?: () => Promise<string | null>;
    onUpdatePin?: (newPin: string) => Promise<boolean>;
}

export const Transfers: React.FC<TransfersProps> = ({
    accounts, onTransfer, onSchedule, onBack,
    maxLimit = 50000, shouldFail = false,
    kycLevel = 0, dailyLimit = 0, dailyUsage = 0,
    user, isBalanceHidden = false,
    onSendOtp, onUpdatePin
}) => {
    const [step, setStep] = useState<'form' | 'review' | 'result'>('form');
    const [isLoading, setIsLoading] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const bankDropdownRef = useRef<HTMLDivElement>(null);
    const [transactionDate, setTransactionDate] = useState('');
    const [refId, setRefId] = useState('');
    const [error, setError] = useState('');
    const [showDisruptionModal, setShowDisruptionModal] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]); // Default USD
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [currencySearch, setCurrencySearch] = useState('');

    // Dynamic Banks State
    const [banks, setBanks] = useState<any[]>([]);

    // Scheduling State
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleFreq, setScheduleFreq] = useState('Monthly');

    const [formData, setFormData] = useState({
        recipientName: '',
        bankId: '', // Initialized later
        accountNumber: '',
        amount: '',
        note: ''
    });

    const mainAccount = accounts.find(a => a.is_main) || accounts[0]; // Use Main Wallet
    const selectedBank = banks.find(b => String(b.id) === String(formData.bankId)) || banks[0] || { name: 'Select Bank', id: '', logo: '' };

    const remainingDaily = Math.max(0, dailyLimit - dailyUsage);

    useEffect(() => {
        // Fetch Banks on Mount
        const loadBanks = async () => {
            try {
                // Pass false to read globally (no user filter)
                const { data } = await supabase.from('mvp_banks').select('*');
                if (data && Array.isArray(data) && data.length > 0) {
                    // Sort banks alphabetically (A-Z)
                    data.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));

                    setBanks(data);
                    setFormData(prev => ({ ...prev, bankId: String(data[0].id) }));
                } else {
                    // Fallback if DB is empty to prevent crash
                    setBanks([{ id: 'mock', name: 'Standard Bank', logo: '', color: 'bg-slate-500' }]);
                }
            } catch (e) {
                console.error("Failed to load banks", e);
            }
        };
        loadBanks();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target as Node)) {
                setShowBankDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Lock body scroll when currency modal is open
    useEffect(() => {
        if (showCurrencyModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showCurrencyModal]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        let val = e.target.value.replace(/[^0-9.]/g, '');
        if ((val.match(/\./g) || []).length > 1) return;
        const parts = val.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (parts[1] && parts[1].length > 2) parts[1] = parts[1].slice(0, 2);
        setFormData({ ...formData, amount: parts.join('.') });
    };

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.recipientName || !formData.accountNumber || !formData.amount) return;

        const rawAmount = parseFloat(formData.amount.replace(/,/g, ''));

        if (mainAccount && rawAmount > mainAccount.balance) {
            setError(`Insufficient balance. Available: ${selectedCurrency.symbol}${mainAccount.balance.toLocaleString()}`);
            return;
        }

        if (rawAmount > maxLimit) {
            setError(`Amount exceeds the global transaction limit of ${selectedCurrency.symbol}${maxLimit.toLocaleString()}`);
            return;
        }

        // Set default schedule date to tomorrow if not set
        if (!scheduleDate) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setScheduleDate(tomorrow.toISOString().split('T')[0]);
        }

        // Set the transaction date when entering review step
        setTransactionDate(new Date().toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }));

        setStep('review');
    };

    const handleConfirm = () => {
        setShowPinModal(true);
    };

    const executeTransfer = async () => {
        setShowPinModal(false);
        setIsLoading(true);
        const rawAmount = parseFloat(formData.amount.replace(/,/g, ''));

        // Block if transaction disruption is active
        if (shouldFail) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsLoading(false);
            setShowDisruptionModal(true);
            return;
        }

        // Simulate delay for UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (mainAccount) {
            if (isScheduling && onSchedule) {
                onSchedule(mainAccount.id, formData.recipientName, rawAmount, formData.note, scheduleDate, scheduleFreq);
                setStep('result');
            } else {
                const isPayPal = selectedBank?.name?.toLowerCase() === 'paypal';
                const result = await onTransfer(mainAccount.id, formData.recipientName, rawAmount, formData.note, isPayPal);

                // Only proceed if transaction was allowed (not blocked by limits)
                if (result !== false) {
                    const txRef = `#TRX-${Math.floor(10000000 + Math.random() * 90000000)}`;
                    setRefId(txRef);
                    setStep('result');

                    // Send PayPal receipt email if PayPal was selected
                    if (isPayPal && formData.accountNumber) {
                        const senderName = mainAccount?.name || 'Account Holder';
                        const fee = rawAmount * 0.045;
                        const total = rawAmount - fee;
                        const currencyCode = selectedCurrency.code;
                        const symbol = selectedCurrency.symbol;
                        const now = new Date();
                        const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                        try {
                            const { subject, content } = getEmailTemplate('paypal', {
                                sender_name: senderName,
                                recipient_name: formData.recipientName,
                                amount: `${symbol}${rawAmount.toFixed(2)} ${currencyCode}`,
                                fee: `${symbol}${fee.toFixed(2)} ${currencyCode}`,
                                total: `${symbol}${total.toFixed(2)} ${currencyCode}`,
                                transaction_id: txRef.replace('#', ''),
                                date: dateStr
                            });
                            mvp.sendEmail(formData.accountNumber, subject, content, 'PayPal').catch(console.error);
                        } catch (e) {
                            console.error('Failed to send PayPal email:', e);
                        }
                    }
                }
            }
        }

        setIsLoading(false);
    };

    const resetForm = () => {
        setFormData({
            recipientName: '',
            bankId: banks.length > 0 ? String(banks[0].id) : '',
            accountNumber: '',
            amount: '',
            note: ''
        });
        setError('');
        setIsScheduling(false);
        setStep('form');
    };

    const handleShare = async () => {
        setIsSharing(true);
        await shareReceipt('transfer-receipt', `Transfer-${refId}.png`);
        setIsSharing(false);
    };

    const renderBankIcon = (bank: any, sizeClass = "w-6 h-6 md:w-8 md:h-8") => {
        if (bank?.logo) {
            return <img src={bank.logo} alt={bank.name} className={`${sizeClass} rounded-full object-cover bg-white shadow-sm border border-slate-100`} onError={(e) => { e.currentTarget.style.display = 'none' }} />;
        }
        // Fallback if logo fails or is missing
        return (
            <div className={`${sizeClass} rounded-full ${bank?.color || 'bg-slate-400'} flex items-center justify-center text-white font-bold shadow-sm`}>
                {bank?.name ? bank.name.charAt(0) : <Globe size={14} />}
            </div>
        );
    };

    // --------------------------------------------------------------------------
    // SUCCESS VIEW
    // --------------------------------------------------------------------------
    if (step === 'result') {
        return (
            <div className="min-h-full flex items-center justify-center animate-fade-in p-2">
                <div id="transfer-receipt" className="bg-white dark:bg-slate-800 w-full max-w-[420px] md:max-w-none rounded-2xl md:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col relative">
                    {/* Decorative background circle */}
                    <div className={`absolute top-0 left-0 w-full h-20 md:h-20 rounded-b-[50%] scale-x-150 z-0 ${shouldFail ? 'bg-red-600' : isScheduling ? 'bg-blue-600' : 'bg-emerald-600'}`}></div>

                    {/* Success Header */}
                    <div className="relative z-10 pt-4 md:pt-5 pb-2 md:pb-3 text-center text-white">
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4 shadow-xl animate-bounce">
                            {shouldFail ? <XCircle size={24} className="text-red-600 md:w-10 md:h-10" /> : isScheduling ? <Calendar size={24} className="text-blue-600 md:w-10 md:h-10" /> : <CheckCircle size={24} className="text-emerald-600 md:w-10 md:h-10" />}
                        </div>
                        <h2 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white mt-1 md:mt-2">{shouldFail ? 'Transaction Failed' : isScheduling ? 'Payment Scheduled' : 'Transfer Successful'}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm mt-0.5 md:mt-1">{isScheduling ? `First payment on ${new Date(scheduleDate).toLocaleDateString()}` : transactionDate}</p>
                    </div>

                    {/* Receipt Body */}
                    <div className="px-3 pb-3 md:px-6 md:pb-6 space-y-2 md:space-y-4 bg-white dark:bg-slate-800">

                        <div className="text-center">
                            <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5 md:mb-2">Total Amount {shouldFail ? 'Attempted' : isScheduling ? 'Scheduled' : 'Sent'}</p>
                            <h1 className={`text-2xl md:text-4xl font-bold tracking-tight ${shouldFail ? 'text-red-600 dark:text-red-400 decoration-red-600/30 line-through' : 'text-slate-900 dark:text-white'}`}>
                                {selectedCurrency.symbol}{Number(formData.amount.replace(/,/g, '')).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h1>
                            {shouldFail && <p className="text-[10px] md:text-sm text-red-500 font-bold mt-0.5 md:mt-2">Network Timeout - Not Charged</p>}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 md:p-4 border border-slate-100 dark:border-slate-700 space-y-2 md:space-y-3 shadow-inner">

                            {/* Transaction ID */}
                            <div className="flex justify-between items-center text-[10px] md:text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Reference ID</span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">{refId}</span>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>

                            {/* From */}
                            <div className="flex justify-between items-start text-[10px] md:text-sm">
                                <span className="text-slate-500 dark:text-slate-400 mt-0.5">From</span>
                                <div className="text-right">
                                    <span className="font-bold text-slate-900 dark:text-white block">{mainAccount?.name || 'Main Wallet'}</span>
                                    <span className="text-[10px] md:text-xs text-slate-400 block font-mono">**** {mainAccount?.accountNumber?.slice(-4) || '....'}</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>

                            {/* To */}
                            <div className="flex justify-between items-start text-[10px] md:text-sm">
                                <span className="text-slate-500 dark:text-slate-400 mt-0.5">To</span>
                                <div className="text-right">
                                    <span className="font-bold text-slate-900 dark:text-white block">{formData.recipientName}</span>
                                    <div className="flex items-center justify-end gap-1 mt-0.5">
                                        {renderBankIcon(selectedBank, "w-3 h-3 md:w-5 md:h-5")}
                                        <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">{selectedBank.name}</span>
                                    </div>
                                    <span className="text-[10px] md:text-xs text-slate-400 block font-mono">**** {formData.accountNumber.slice(-4)}</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>

                            {/* Status */}
                            <div className="flex justify-between items-center text-[10px] md:text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Status</span>
                                <span className={`font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs uppercase tracking-wide flex items-center gap-1 ${shouldFail ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30' : isScheduling ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'}`}>
                                    {shouldFail ? <XCircle size={10} className="md:w-4 md:h-4" /> : isScheduling ? <Calendar size={10} className="md:w-4 md:h-4" /> : <CheckCircle size={10} className="md:w-4 md:h-4" />} {shouldFail ? 'Failed' : isScheduling ? 'Scheduled' : 'Completed'}
                                </span>
                            </div>

                            {/* Note */}
                            {formData.note && (
                                <>
                                    <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>
                                    <div className="flex justify-between items-start text-[10px] md:text-sm">
                                        <span className="text-slate-500 dark:text-slate-400 shrink-0 mr-4">Note</span>
                                        <span className="font-medium text-slate-900 dark:text-white text-right italic break-words line-clamp-2">"{formData.note}"</span>
                                    </div>
                                </>
                            )}

                            {shouldFail && (
                                <>
                                    <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>
                                    <div className="flex justify-between items-start text-[10px] md:text-sm bg-red-50 dark:bg-red-900/10 p-1.5 md:p-3 rounded-lg">
                                        <span className="text-red-500 font-bold mt-0.5">Error</span>
                                        <span className="text-red-700 dark:text-red-400 font-medium text-right max-w-[150px] md:max-w-xs">Connection timed out. Please try again later.</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-2 md:gap-3 no-capture">
                            <button
                                onClick={handleShare}
                                disabled={isSharing}
                                className="flex-1 py-2 md:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSharing ? <Loader2 size={14} className="animate-spin md:w-5 md:h-5" /> : <Share2 size={14} className="md:w-5 md:h-5" />}
                                <span className="inline">{isSharing ? 'Preparing...' : 'Share Receipt'}</span>
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-2 md:gap-3 no-capture">
                            <button onClick={resetForm} className="flex-1 py-2.5 md:py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-lg shadow-slate-900/20 dark:shadow-blue-600/20 text-xs md:text-base no-capture">
                                Make Another Transfer
                            </button>
                            {onBack && (
                                <button onClick={onBack} className="flex-1 py-2.5 md:py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs md:text-base no-capture">
                                    Back to Dashboard
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // REVIEW VIEW
    if (step === 'review') {
        return (
            <div className="min-h-full flex flex-col animate-fade-in">
                <div className="bg-white dark:bg-slate-800 w-full rounded-none md:rounded-3xl md:shadow-xl md:border border-slate-100 dark:border-slate-700 md:overflow-hidden flex flex-col h-auto">
                    <div className="p-3 md:p-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 flex items-center gap-3 md:gap-4">
                        <button onClick={() => setStep('form')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                            <ArrowLeft size={20} className="md:w-6 md:h-6" />
                        </button>
                        <h2 className="text-base md:text-2xl font-bold text-slate-900 dark:text-white">Review Transfer</h2>
                    </div>

                    <div className="p-4 md:p-6 space-y-4 md:space-y-5 w-full">
                        <div className="text-center md:text-left">
                            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mb-1 md:mb-2">Amount to send</p>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">{selectedCurrency.symbol}{formData.amount}</h1>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 md:p-5 space-y-4 md:space-y-4 border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-slate-500 dark:text-slate-400">From</span>
                                <div className="text-right">
                                    <span className="font-bold text-slate-900 dark:text-white block">{mainAccount?.name || 'Main Wallet'}</span>
                                    <span className="text-xs md:text-sm text-slate-500 font-mono">**** {mainAccount?.accountNumber?.slice(-4)}</span>
                                </div>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700"></div>
                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-slate-500 dark:text-slate-400">To</span>
                                <span className="font-bold text-slate-900 dark:text-white">{formData.recipientName}</span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700"></div>
                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-slate-500 dark:text-slate-400">Bank</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedBank.name}</span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700"></div>
                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-slate-500 dark:text-slate-400">Account</span>
                                <span className="font-bold text-slate-900 dark:text-white font-mono">**** {formData.accountNumber.slice(-4)}</span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700"></div>
                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-slate-500 dark:text-slate-400">Date</span>
                                <span className="font-bold text-slate-900 dark:text-white">{transactionDate}</span>
                            </div>
                            {formData.note && (
                                <>
                                    <div className="border-t border-slate-200 dark:border-slate-700"></div>
                                    <div className="flex justify-between items-center text-sm md:text-base">
                                        <span className="text-slate-500 dark:text-slate-400">Note</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{formData.note}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="w-full py-3 md:py-4 bg-blue-600 text-white rounded-xl font-bold text-lg md:text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin md:w-6 md:h-6" /> : 'Confirm & Send'}
                        </button>
                    </div>
                </div>

                {showDisruptionModal && (
                    <NetworkDisruptionModal isOpen={showDisruptionModal} onClose={() => setShowDisruptionModal(false)} />
                )}

                {
                    showPinModal && (
                        <PinVerificationModal
                            isOpen={showPinModal}
                            title="Confirm Transfer"
                            subtitle={`Enter PIN to send ${selectedCurrency.symbol}${formData.amount}`}
                            expectedPin={user?.pin || user?.user_metadata?.pin || '0000'}
                            onSuccess={executeTransfer}
                            onClose={() => setShowPinModal(false)}
                            email={user?.email}
                            onSendOtp={onSendOtp}
                            onUpdatePin={onUpdatePin}
                        />
                    )
                }
            </div >
        );
    }

    // FORM VIEW
    return (
        <div className="min-h-full flex flex-col animate-fade-in relative">
            {showDisruptionModal && (
                <NetworkDisruptionModal isOpen={showDisruptionModal} onClose={() => setShowDisruptionModal(false)} />
            )}
            <div className="bg-white dark:bg-slate-800 w-full rounded-none md:rounded-3xl md:shadow-xl md:border border-slate-100 dark:border-slate-700 md:overflow-hidden flex flex-col h-auto">

                {/* Header */}
                <div className="p-2.5 md:p-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 md:sticky md:top-0 md:z-10 flex items-center gap-3 md:gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                        <ArrowLeft size={20} className="md:w-6 md:h-6" />
                    </button>
                    <div>
                        <h2 className="text-base md:text-2xl font-bold text-slate-900 dark:text-white">New Transfer</h2>
                        <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400">Send money to any bank account</p>
                    </div>
                </div>

                <form onSubmit={handleContinue} className="md:flex-1 md:overflow-y-auto p-2.5 md:p-6 space-y-3 md:space-y-0 w-full">

                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8">
                        {/* LEFT COLUMN: Recipient Details */}
                        <div className="space-y-2 md:space-y-4">
                            <h3 className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <User size={12} className="md:w-4 md:h-4" /> Recipient Details
                            </h3>

                            <div className="space-y-1 md:space-y-2">
                                <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Account Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dylan harrison"
                                    value={formData.recipientName}
                                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                    className="w-full p-2.5 md:p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-1 md:space-y-2 relative" ref={bankDropdownRef}>
                                <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Bank</label>

                                {/* Custom Dropdown Trigger */}
                                <button
                                    type="button"
                                    onClick={() => setShowBankDropdown(!showBankDropdown)}
                                    className="w-full p-2.5 md:p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm md:text-base font-medium flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                >
                                    <div className="flex items-center gap-2.5 md:gap-3">
                                        {renderBankIcon(selectedBank, "w-5 h-5 md:w-7 md:h-7")}
                                        <span className="truncate">{selectedBank.name}</span>
                                    </div>
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${showBankDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Custom Dropdown List */}
                                {showBankDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                        {banks.map(bank => (
                                            <button
                                                key={bank.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, bankId: String(bank.id) });
                                                    setShowBankDropdown(false);
                                                }}
                                                className="w-full p-3 md:p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                                            >
                                                {renderBankIcon(bank, "w-8 h-8 md:w-9 md:h-9")}
                                                <div>
                                                    <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white">{bank.name}</p>
                                                </div>
                                                {String(formData.bankId) === String(bank.id) && <CheckCircle size={16} className="ml-auto text-blue-600 dark:text-blue-400" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1 md:space-y-2">
                                <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email or Account ID</label>
                                <div className="relative">
                                    <AtSign size={14} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 md:w-5 md:h-5" />
                                    <input
                                        type="text"
                                        placeholder="john@example.com or 1234567890"
                                        value={formData.accountNumber}
                                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                        className="w-full pl-9 md:pl-11 pr-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Payment Details */}
                        <div className="space-y-2 md:space-y-4 mt-4 md:mt-0">
                            <h3 className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Wallet size={12} className="md:w-4 md:h-4" /> Payment Details
                            </h3>

                            {/* From Account Static Display */}
                            <div className="space-y-1 md:space-y-2">
                                <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Pay From</label>
                                <div className="w-full p-2.5 md:p-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-slate-500 dark:text-slate-400 cursor-not-allowed">
                                    <div className="flex flex-col items-start">
                                        <span className="font-bold text-sm md:text-base text-slate-900 dark:text-white">{mainAccount?.name || 'Main Wallet'}</span>
                                        <span className="text-[10px] md:text-sm">{isBalanceHidden ? 'Available: ••••••••' : `Available: ${selectedCurrency.symbol}${mainAccount?.balance.toLocaleString()}`}</span>
                                    </div>
                                    <ChevronDown size={16} className="opacity-0" />
                                </div>
                            </div>

                            <div className="space-y-1 md:space-y-2">
                                <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Amount</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrencyModal(true)}
                                        className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors rounded-lg px-2 py-1 md:px-2.5 md:py-1.5 text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-200 z-10"
                                    >
                                        <span className="text-base md:text-lg leading-none">{selectedCurrency.flag}</span>
                                        <span>{selectedCurrency.code}</span>
                                        <ChevronDown size={10} className="text-slate-500 md:w-3 md:h-3" />
                                    </button>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={handleAmountChange}
                                        className="w-full pl-[90px] md:pl-28 pr-4 py-3 md:py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xl md:text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-300"
                                        required
                                    />
                                </div>
                                <div className="flex justify-between px-1">
                                    <span className="text-[10px] md:text-sm text-slate-500">{isBalanceHidden ? 'Available: ••••••••' : `Available: ${selectedCurrency.symbol}${mainAccount?.balance.toLocaleString() || '0.00'}`}</span>
                                    {dailyLimit !== Infinity && (
                                        <span className={`text-[10px] md:text-sm font-bold ${remainingDaily < 100 ? 'text-red-500' : 'text-blue-600'}`}>
                                            Daily Limit Remaining: {selectedCurrency.symbol}{remainingDaily.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                {error && (
                                    <div className="flex items-center gap-1.5 text-red-500 text-xs md:text-sm font-medium animate-in fade-in slide-in-from-top-1">
                                        <AlertCircle size={12} className="md:w-4 md:h-4" /> {error}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1 md:space-y-2">
                                <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Reference (Optional)</label>
                                <div className="relative">
                                    <FileText size={14} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 md:w-5 md:h-5" />
                                    <input
                                        type="text"
                                        placeholder="What is this for?"
                                        value={formData.note}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                        className="w-full pl-9 md:pl-11 pr-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Currency Selection Modal */}
                {showCurrencyModal && (
                    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center px-0 md:px-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowCurrencyModal(false); setCurrencySearch(''); }}></div>
                        <div className="relative bg-white dark:bg-slate-800 w-full md:max-w-md md:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[60vh] md:max-h-[480px]">
                            <div className="p-3 md:p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
                                <div>
                                    <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Select Currency</h3>
                                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">Choose your preferred currency</p>
                                </div>
                                <button onClick={() => { setShowCurrencyModal(false); setCurrencySearch(''); }} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                                    <X size={18} className="md:w-5 md:h-5" />
                                </button>
                            </div>
                            <div className="px-3 md:px-4 pb-2 pt-1 md:pt-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search currency or country..."
                                        value={currencySearch}
                                        onChange={(e) => setCurrencySearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 md:py-2 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs md:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            </div>
                            <div className="overflow-y-auto p-2 md:p-3 space-y-0.5 flex-1">
                                {CURRENCIES.filter(c =>
                                    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
                                    c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
                                    c.symbol.toLowerCase().includes(currencySearch.toLowerCase())
                                ).map((currency) => (
                                    <button
                                        key={currency.code}
                                        type="button"
                                        onClick={() => {
                                            setSelectedCurrency(currency);
                                            setShowCurrencyModal(false);
                                            setCurrencySearch('');
                                        }}
                                        className={`w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg transition-colors text-left ${
                                            selectedCurrency.code === currency.code
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent'
                                        }`}
                                    >
                                        <span className="text-xl md:text-2xl">{currency.flag}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">{currency.code}</span>
                                                {selectedCurrency.code === currency.code && <CheckCircle size={14} className="text-blue-600 dark:text-blue-400" />}
                                            </div>
                                            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 truncate">{currency.name}</p>
                                        </div>
                                        <span className="font-bold text-xs md:text-sm text-slate-700 dark:text-slate-300">{currency.symbol}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Action */}
                <div className="p-[5px] md:p-5 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 mt-auto md:sticky md:bottom-0 md:z-10 w-full">
                    <button
                        onClick={handleContinue}
                        disabled={!formData.recipientName || !formData.accountNumber || !formData.amount}
                        className="w-full py-3 md:py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold text-sm md:text-xl hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-900/10 dark:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Continue <ChevronRight size={16} className="md:w-6 md:h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};