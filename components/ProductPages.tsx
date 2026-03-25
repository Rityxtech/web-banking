import React, { useState, useEffect, useRef } from 'react';
import { Shield, Smartphone, Globe, ArrowRight, CheckCircle, CreditCard, ChevronRight, Play, Star, Search, Zap, Server, Lock, Cpu, BarChart3, RefreshCw, ChevronDown, Check, ArrowLeft, Mail, Phone, MapPin, FileText, Briefcase, Users, HelpCircle, Download, Award, TrendingUp, Calendar, Image as ImageIcon, HeartPulse, Activity, AlertCircle, Wifi, Database, Mic, Video, Layers, Wallet, PieChart, Landmark, Key, UserCheck, DollarSign, Percent, Gift, Plane, ShoppingBag, Truck, Monitor, Sun, EyeOff } from 'lucide-react';

// Reusing Reveal component logic locally to avoid dependency issues
const Reveal = ({ children, className = "", direction = 'up', delay = 0, threshold = 0.1 }: any) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold }
        );
        if (ref.current) observer.observe(ref.current);
        return () => { if (ref.current) observer.unobserve(ref.current); };
    }, [threshold]);

    const getTransformClass = () => {
        switch (direction) {
            case 'up': return 'translate-y-10';
            case 'down': return '-translate-y-10';
            case 'left': return '-translate-x-20';
            case 'right': return 'translate-x-20';
            case 'zoom': return 'scale-90';
            default: return 'translate-y-10';
        }
    };

    return (
        <div ref={ref} className={`${className} transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : `opacity-0 ${getTransformClass()}`}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
};

const SectionHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="text-center mb-12 md:mb-16">
        <Reveal direction="up">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">{title}</h2>
            <p className="text-slate-500 text-sm md:text-lg max-w-2xl mx-auto">{subtitle}</p>
        </Reveal>
    </div>
);

const FeatureGrid = ({ items }: { items: { icon: any, title: string, desc: string }[] }) => (
    <div className="grid md:grid-cols-3 gap-8">
        {items.map((item, i) => (
            <Reveal key={i} direction="up" delay={i * 100}>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all h-full">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                        <item.icon size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
            </Reveal>
        ))}
    </div>
);

export const CheckingContent = ({ onNavigate }: { onNavigate: (path: string) => void }) => (
    <div className="space-y-20 pb-20">
        {/* 1. Hero */}
        <section className="relative bg-slate-900 text-white py-20 md:py-32 rounded-3xl overflow-hidden px-6 md:px-12 text-center">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <Reveal direction="up">
                <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6 border border-blue-500/30">Lennox Checking</span>
                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Banking built for <br /> the modern world.</h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">Zero fees. Instant transfers. Global access. Experience checking reinvented.</p>
                <button onClick={() => onNavigate('signup')} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/25">Open Free Account</button>
            </Reveal>
        </section>

        {/* 2. Key Benefits */}
        <section className="px-4">
            <SectionHeader title="Everything you need, nothing you don't." subtitle="We stripped away the complexity of traditional banking to give you a checking account that just works." />
            <FeatureGrid items={[
                { icon: Zap, title: "Instant Transfers", desc: "Send money significantly faster than traditional banks. Moves securely in milliseconds." },
                { icon: DollarSign, title: "Zero Monthly Fees", desc: "No maintenance fees, no overdraft fees, no minimum balance requirements. Keep your money." },
                { icon: Globe, title: "Global ATM Access", desc: "Withdraw cash from over 55,000 ATMs worldwide without paying a surcharge fee." }
            ]} />
        </section>

        {/* 3. Early Direct Deposit */}
        <section className="bg-blue-50 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
                <Reveal direction="right">
                    <span className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-2 block">Available Early</span>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">Get paid up to 2 days faster.</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">Stop waiting for your paycheck. With Lennox Early Direct Deposit, we release your funds as soon as we receive the notification from the Federal Reserve.</p>
                    <ul className="space-y-3">
                        {['No hidden fees', 'Automatic enrollment', 'Same security standards'].map(item => (
                            <li key={item} className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle size={18} className="text-emerald-500" /> {item}</li>
                        ))}
                    </ul>
                </Reveal>
            </div>
            <div className="flex-1 w-full flex justify-center">
                <Reveal direction="left">
                    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm border border-slate-100 transform rotate-2">
                        <div className="flex items-center gap-4 mb-4 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><DollarSign size={20} /></div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Incoming Deposit</p>
                                <p className="font-bold text-slate-900 text-lg">+$3,450.00</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Deposited 2 days early via Lennox Early Access.</p>
                    </div>
                </Reveal>
            </div>
        </section>

        {/* 4. Mobile First */}
        <section className="px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <Reveal direction="right">
                    <img src="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=1000" alt="Mobile App" className="rounded-3xl shadow-2xl" />
                </Reveal>
                <Reveal direction="left">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">Your bank in your pocket.</h2>
                    <p className="text-slate-500 text-lg mb-8">Manage your entire financial life from a single, intuitive dashboard. Track spending, freeze cards, and organize bills effortlessly.</p>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <Smartphone className="text-blue-500 shrink-0" size={24} />
                            <div>
                                <h4 className="font-bold text-slate-900">Instant Notifications</h4>
                                <p className="text-sm text-slate-500">Real-time alerts for every transaction.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Lock className="text-blue-500 shrink-0" size={24} />
                            <div>
                                <h4 className="font-bold text-slate-900">Card Control</h4>
                                <p className="text-sm text-slate-500">Freeze lost cards instantly in the app.</p>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>

        {/* 5. Comparison Table */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-black mb-4">Lennox vs The Old Banks</h2>
                <p className="text-slate-400">See why thousands make the switch every day.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-widest">
                            <th className="py-4 px-4">Feature</th>
                            <th className="py-4 px-4 text-white font-bold">Lennox Checking</th>
                            <th className="py-4 px-4 opacity-50">Traditional Banks</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm md:text-base">
                        {[
                            { f: 'Monthly Fees', l: '$0', t: '$12 - $25' },
                            { f: 'Overdraft Fees', l: '$0', t: '$35+' },
                            { f: 'Foreign Transaction Fees', l: '0%', t: '3%' },
                            { f: 'Minimum Balance', l: '$0', t: '$500 - $1,500' },
                            { f: 'ATM Fee Reimbursement', l: 'Unlimited', t: 'None' },
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                <td className="py-4 px-4 font-bold text-slate-300">{row.f}</td>
                                <td className="py-4 px-4 text-blue-400 font-bold">{row.l}</td>
                                <td className="py-4 px-4 text-slate-500">{row.t}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>

        {/* 6. FDIC Insured */}
        <section className="text-center max-w-3xl mx-auto px-4">
            <Reveal direction="up">
                <Shield size={48} className="mx-auto text-emerald-500 mb-6" />
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Your money is safe here.</h2>
                <p className="text-slate-500 leading-relaxed">
                    Lennox is a financial technology company, not a bank. Banking services provided by Lennox's bank partners, Members FDIC. Your funds are FDIC insured up to $250,000 through our partner banks.
                </p>
            </Reveal>
        </section>

        {/* 7. CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-20 text-center text-white">
            <h2 className="text-3xl md:text-5xl font-black mb-8">Ready to switch?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">Join over 2 million people who have already upgraded their financial life.</p>
            <button onClick={() => onNavigate('signup')} className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-slate-50 transition-all">Get Started in 2 Minutes</button>
        </section>
    </div>
);

export const SavingsContent = ({ onNavigate }: { onNavigate: (path: string) => void }) => (
    <div className="space-y-20 pb-20">
        <section className="relative bg-emerald-900 text-white py-20 md:py-32 rounded-3xl overflow-hidden px-6 md:px-12 text-center">
            <Reveal direction="up">
                <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-500/30">High Yield Savings</span>
                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Grow your wealth <br /> automatically.</h1>
                <p className="text-emerald-100/70 text-lg md:text-xl max-w-2xl mx-auto mb-10">Earn industry-leading APY on your savings. Start building your future today.</p>
                <div className="flex flex-col md:flex-row justify-center gap-4">
                    <button onClick={() => onNavigate('signup')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/25">Start Saving</button>
                    <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold px-6">
                        <TrendingUp size={20} /> Current APY: 4.50%
                    </div>
                </div>
            </Reveal>
        </section>

        <section className="px-4">
            <SectionHeader title="Smarter savings, zero effort." subtitle="Tools designed to help you save without thinking about it." />
            <FeatureGrid items={[
                { icon: TrendingUp, title: "High Yield APY", desc: "Earn up to 10x the national average on your savings balance, accrued daily and paid monthly." },
                { icon: RefreshCw, title: "Automatic Round-Ups", desc: "We round up every purchase to the nearest dollar and deposit the difference into your savings." },
                { icon: Target, title: "Goal-Based Vaults", desc: "Create dedicated sub-accounts for specific goals like 'New Car' or 'Vacation' to track progress." }
            ]} />
        </section>

        {/* Interest Calculator Demo */}
        <section className="bg-slate-50 rounded-3xl p-8 md:p-16 border border-slate-100">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="text-3xl font-black text-slate-900">See your money grow.</h2>
                    <p className="text-slate-500">Compound interest is the eighth wonder of the world. With our competitive rates, your money works harder for you.</p>
                    <div className="space-y-4">
                        <div className="p-4 bg-white rounded-xl border border-slate-200">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Initial Deposit</p>
                            <p className="text-xl font-bold text-slate-900">$10,000</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-200">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Monthly Contribution</p>
                            <p className="text-xl font-bold text-slate-900">$500</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Projected Savings (5 Years)</h3>
                    <div className="flex items-end gap-2 h-48 mb-4">
                        <div className="w-1/4 bg-slate-200 h-[20%] rounded-t-lg"></div>
                        <div className="w-1/4 bg-slate-300 h-[40%] rounded-t-lg"></div>
                        <div className="w-1/4 bg-emerald-400 h-[70%] rounded-t-lg"></div>
                        <div className="w-1/4 bg-emerald-600 h-[100%] rounded-t-lg relative group">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                $45,230
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-sm text-slate-500 font-medium">Lennox Savings vs Traditional Savings</p>
                </div>
            </div>
        </section>

        <section className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Common Questions</h2>
            <div className="space-y-4">
                {[
                    { q: "Is there a minimum balance?", a: "No. You can open an account with $0 and start earning interest on your first penny." },
                    { q: "Can I withdraw my money anytime?", a: "Yes. Use our app to transfer funds instantly to your checking account, 24/7." },
                    { q: "How is interest calculated?", a: "Interest is compounded daily and paid out on the first day of each month." },
                ].map((faq, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-2">{faq.q}</h4>
                        <p className="text-slate-500 text-sm">{faq.a}</p>
                    </div>
                ))}
            </div>
        </section>

        <section className="bg-emerald-600 rounded-3xl p-8 md:p-20 text-center text-white">
            <h2 className="text-3xl md:text-5xl font-black mb-8">Stop letting inflation eat your savings.</h2>
            <button onClick={() => onNavigate('signup')} className="bg-white text-emerald-600 px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-emerald-50 transition-all">Start Earning 4.50% APY</button>
        </section>
    </div>
);

export const CreditCardsContent = ({ onNavigate }: { onNavigate: (path: string) => void }) => (
    <div className="space-y-20 pb-20">
        <section className="relative bg-black text-white py-20 md:py-32 rounded-3xl overflow-hidden px-6 md:px-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/50 to-blue-900/50"></div>
            <Reveal direction="up">
                <span className="inline-block py-1 px-3 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-widest mb-6 border border-slate-700">Lennox Elite</span>
                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">The card that pays <br /> you back.</h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">Unlimited 2% cash back on everything. Premium travel rewards. No annual fees.</p>
                <button onClick={() => onNavigate('signup')} className="bg-white hover:bg-slate-100 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-white/10">Apply Now</button>
            </Reveal>
        </section>

        <section className="px-4">
            <SectionHeader title="Premium perks, standard." subtitle="Designed for the modern spender who demands more from their wallet." />
            <FeatureGrid items={[
                { icon: Percent, title: "Unlimited 2% Cash Back", desc: "Earn 2% cash back on every single purchase, every single day. No categories to track." },
                { icon: Plane, title: "No Foreign Transaction Fees", desc: "Travel freely. We never charge swift fees or foreign exchange markups when you spend abroad." },
                { icon: Shield, title: "Purchase Protection", desc: "Items bought with your Lennox card are automatically insured against theft and accidental damage for 120 days." }
            ]} />
        </section>

        <section className="bg-slate-900 rounded-3xl p-8 md:p-16 text-white overflow-hidden relative">
            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                <div className="flex-1">
                    <Reveal direction="right">
                        <h2 className="text-3xl md:text-4xl font-black mb-6">Metal by design.</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed">Crafted from a single sheet of reinforced stainless steel, the Lennox Elite card feels as powerful as it performs. Weighing in at 18g, it makes a statement every time you use it.</p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 font-bold text-slate-300"><CheckCircle className="text-purple-500" /> Laser engraved details</li>
                            <li className="flex items-center gap-3 font-bold text-slate-300"><CheckCircle className="text-purple-500" /> Minimalist front design</li>
                            <li className="flex items-center gap-3 font-bold text-slate-300"><CheckCircle className="text-purple-500" /> Contactless enabled</li>
                        </ul>
                    </Reveal>
                </div>
                <div className="flex-1 flex justify-center">
                    <Reveal direction="left">
                        <div className="w-80 h-52 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl border-t border-l border-slate-600 shadow-2xl relative flex flex-col justify-between p-6 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-8 bg-yellow-500/20 rounded md:rounded-md border border-yellow-500/30"></div>
                                <Activity className="text-slate-500/50" size={32} />
                            </div>
                            <div>
                                <p className="font-mono text-lg tracking-widest text-slate-300 mb-2">•••• •••• •••• 4288</p>
                                <div className="flex justify-between items-end">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Alex Morgan</p>
                                    <div className="w-8 h-8 rounded-full bg-slate-600/50"></div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>

        <section className="text-center max-w-4xl mx-auto px-4">
            <Reveal direction="up">
                <h2 className="text-3xl font-black text-slate-900 mb-12">Virtual Cards for Total Security</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-4"><Lock size={20} /></div>
                        <h4 className="font-bold text-slate-900 mb-2">Single-Use Cards</h4>
                        <p className="text-xs text-slate-500">Burn a card number automatically after one purchase. Perfect for sketchy sites.</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4"><RefreshCw size={20} /></div>
                        <h4 className="font-bold text-slate-900 mb-2">Subscription Cards</h4>
                        <p className="text-xs text-slate-500">Set spend limits on recurring payments. Block unwanted charges instantly.</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mx-auto mb-4"><EyeOff size={20} /></div>
                        <h4 className="font-bold text-slate-900 mb-2">Private Mode</h4>
                        <p className="text-xs text-slate-500">Keep your real card details hidden from merchants and data breaches.</p>
                    </div>
                </div>
            </Reveal>
        </section>

        <section className="bg-purple-900 text-white rounded-3xl p-8 md:p-20 text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Upgrade your wallet.</h2>
            <p className="text-purple-200 mb-10">Apply in minutes without impacting your credit score.</p>
            <button onClick={() => onNavigate('signup')} className="bg-white text-purple-900 px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-purple-50 transition-all">Get Your Card</button>
        </section>
    </div>
);

export const InvestmentsContent = ({ onNavigate }: { onNavigate: (path: string) => void }) => (
    <div className="space-y-20 pb-20">
        <section className="relative bg-slate-50 py-20 md:py-32 rounded-3xl overflow-hidden px-6 md:px-12 text-center border border-slate-200">
            <Reveal direction="up">
                <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-6">Lennox Invest</span>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">Investing made <br /> accessible.</h1>
                <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10">Stocks, Crypto, and ETFs. Commission-free and all in one place.</p>
                <button onClick={() => onNavigate('signup')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-indigo-600/25">Start Investing</button>
            </Reveal>
        </section>

        <section className="px-4">
            <SectionHeader title="Build your portfolio." subtitle="From Wall Street to the Blockchain, access global markets instantly." />
            <FeatureGrid items={[
                { icon: BarChart3, title: "Commission-Free Stocks", desc: "Trade thousands of US stocks and ETFs with $0 commission fees." },
                { icon: Database, title: "Crypto Integration", desc: "Buy, sell, and hold major cryptocurrencies like Bitcoin and Ethereum directly within your banking app." },
                { icon: PieChart, title: "Fractional Shares", desc: "Invest in top companies like Amazon or Google with as little as $1. No need to buy whole shares." }
            ]} />
        </section>

        <section className="bg-indigo-900 text-white rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 order-2 md:order-1">
                <Reveal direction="up">
                    <img src="https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=1000" alt="Trading Dashboard" className="rounded-2xl shadow-2xl border border-indigo-700/50" />
                </Reveal>
            </div>
            <div className="flex-1 order-1 md:order-2">
                <Reveal direction="left">
                    <h2 className="text-3xl md:text-4xl font-black mb-6">Smart automation for smarter investing.</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center shrink-0 border border-indigo-600 font-bold">1</div>
                            <div>
                                <h4 className="font-bold text-lg">Auto-Invest</h4>
                                <p className="text-indigo-200 text-sm">Set a schedule to buy your favorite assets automatically. Dollar-cost average with ease.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center shrink-0 border border-indigo-600 font-bold">2</div>
                            <div>
                                <h4 className="font-bold text-lg">Portfolio Rebalancing</h4>
                                <p className="text-indigo-200 text-sm">Our AI monitors your allocation and suggests adjustments to keep you on track.</p>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>

        <section className="px-4 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 mb-12">Designed for every investor.</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 bg-white border border-slate-100 rounded-3xl text-left hover:border-indigo-500 transition-colors group">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600">Beginners</h3>
                    <ul className="space-y-2 mt-4">
                        <li className="flex items-center gap-2 text-slate-500 text-sm"><Check size={16} className="text-green-500" /> Educational resources</li>
                        <li className="flex items-center gap-2 text-slate-500 text-sm"><Check size={16} className="text-green-500" /> Pre-built portfolios</li>
                        <li className="flex items-center gap-2 text-slate-500 text-sm"><Check size={16} className="text-green-500" /> $1 minimums</li>
                    </ul>
                </div>
                <div className="p-8 bg-white border border-slate-100 rounded-3xl text-left hover:border-indigo-500 transition-colors group">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600">Pro Traders</h3>
                    <ul className="space-y-2 mt-4">
                        <li className="flex items-center gap-2 text-slate-500 text-sm"><Check size={16} className="text-green-500" /> Limit & Stop orders</li>
                        <li className="flex items-center gap-2 text-slate-500 text-sm"><Check size={16} className="text-green-500" /> Real-time L2 Data</li>
                        <li className="flex items-center gap-2 text-slate-500 text-sm"><Check size={16} className="text-green-500" /> API Access</li>
                    </ul>
                </div>
            </div>
        </section>

        <section className="bg-gray-900 text-white rounded-3xl p-8 md:p-20 text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-8">Start your journey.</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto mb-8">Investing involves risk, including possible loss of principal. Lennox Invest LLC is a member of SIPC, which protects securities customers of its members up to $500,000.</p>
            <button onClick={() => onNavigate('signup')} className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-indigo-700 transition-all">Open Investment Account</button>
        </section>
    </div>
);

// Helper icons required
const Target = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
);
