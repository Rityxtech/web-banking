
import React, { useState, useEffect, useRef } from 'react';
import { Shield, Smartphone, Globe, ArrowRight, CheckCircle, CreditCard, ChevronRight, Play, Star, Search, Zap, Server, Lock, Cpu, BarChart3, RefreshCw, ChevronDown, Check, ArrowLeft, Mail, Phone, MapPin, FileText, Briefcase, Users, HelpCircle, Download, Award, TrendingUp, Calendar, Image as ImageIcon, HeartPulse, Activity, AlertCircle, Wifi, Database, Mic, Video, Layers, Wallet, PieChart, Landmark, Key, UserCheck, DollarSign, Percent, Gift, Plane, ShoppingBag, Truck, Monitor, Sun, BookOpen, Newspaper, LifeBuoy, AlertTriangle, Fingerprint } from 'lucide-react';

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

// --- ABOUT US ---
export const AboutUsContent = () => (
    <div className="space-y-20 pb-20">
        <section className="text-center py-20 px-4">
            <Reveal direction="zoom">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
                    Lennox Meridian Holdings
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">We are building the <br /> financial operating system <br /> for the internet.</h1>
                <p className="text-slate-500 text-lg md:text-xl max-w-3xl mx-auto mb-10">Lennox is more than just a bank. We are a technology company that builds powerful, secure, and intuitive financial tools for everyone.</p>
            </Reveal>
        </section>

        <section className="grid md:grid-cols-2 gap-12 px-4 max-w-6xl mx-auto items-center">
            <Reveal direction="right">
                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1632" alt="Our Team" className="rounded-3xl shadow-2xl" />
            </Reveal>
            <Reveal direction="left">
                <h2 className="text-3xl font-black text-slate-900 mb-6">Our Mission</h2>
                <p className="text-slate-600 text-lg mb-6 leading-relaxed">We believe that access to financial services should be a basic human right. Our mission is to democratize banking by removing barriers, lowering fees, and building tools that empower people to take control of their financial destiny.</p>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-4xl font-black text-blue-600 mb-1">2.4M+</p>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Users</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-blue-600 mb-1">64</p>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Countries</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-blue-600 mb-1">$50B+</p>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Transacted</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-blue-600 mb-1">450+</p>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Team Members</p>
                    </div>
                </div>
            </Reveal>
        </section>

        <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-20 text-center">
            <Reveal direction="up">
                <h2 className="text-3xl md:text-5xl font-black mb-12">Our Core Values</h2>
                <div className="grid md:grid-cols-3 gap-8 text-left">
                    <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <UserCheck className="mb-4 text-blue-400" size={32} />
                        <h3 className="text-xl font-bold mb-2">Customer Obsession</h3>
                        <p className="text-slate-400 text-sm">We start with the customer and work backward. We work vigorously to earn and keep customer trust.</p>
                    </div>
                    <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <Shield className="mb-4 text-emerald-400" size={32} />
                        <h3 className="text-xl font-bold mb-2">Security First</h3>
                        <p className="text-slate-400 text-sm">We never compromise on security. Protecting our users' data and assets is our number one priority.</p>
                    </div>
                    <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <Zap className="mb-4 text-amber-400" size={32} />
                        <h3 className="text-xl font-bold mb-2">Bias for Action</h3>
                        <p className="text-slate-400 text-sm">Speed matters in business. We value calculated risk taking and quick decision making.</p>
                    </div>
                </div>
            </Reveal>
        </section>

        <section className="max-w-4xl mx-auto px-4 text-center">
            <Reveal direction="up">
                <h2 className="text-3xl font-black text-slate-900 mb-12">Leadership Team</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {[
                        { name: "Sarah Connor", role: "CEO & Founder", img: "https://randomuser.me/api/portraits/women/44.jpg" },
                        { name: "James Wright", role: "CTO", img: "https://randomuser.me/api/portraits/men/32.jpg" },
                        { name: "Emily Chen", role: "Head of Product", img: "https://randomuser.me/api/portraits/women/65.jpg" },
                        { name: "Michael Ross", role: "CFO", img: "https://randomuser.me/api/portraits/men/11.jpg" },
                        { name: "David Kim", role: "VP of Engineering", img: "https://randomuser.me/api/portraits/men/45.jpg" },
                        { name: "Lisa Park", role: "Head of Design", img: "https://randomuser.me/api/portraits/women/22.jpg" }
                    ].map((p, i) => (
                        <div key={i} className="group">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-slate-100 group-hover:border-blue-500 transition-colors">
                                <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <h4 className="font-bold text-slate-900">{p.name}</h4>
                            <p className="text-xs text-slate-500 uppercase tracking-widest">{p.role}</p>
                        </div>
                    ))}
                </div>
            </Reveal>
        </section>
    </div>
);

// --- CAREERS ---
export const CareersContent = () => (
    <div className="space-y-20 pb-20">
        <section className="relative bg-slate-50 py-20 px-4 text-center rounded-3xl overflow-hidden">
            <Reveal direction="up">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">Do the best work <br /> of your life.</h1>
                <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10">Join a team of visionaries, engineers, and problem solvers building the future of finance.</p>
                <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">View Open Roles</button>
            </Reveal>
        </section>

        <section className="px-4 max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { icon: HeartPulse, title: "Health & Wellness", desc: "Premium medical, dental, and vision coverage for you and your dependents." },
                    { icon: Monitor, title: "Remote First", desc: "Work from anywhere in the world. We provide a $2,000 allowance for your home office setup." },
                    { icon: Plane, title: "Unlimited PTO", desc: "Take the time you need to recharge. We believe in working smarter, not harder." },
                    { icon: DollarSign, title: "Competitive Pay", desc: "Top-tier salary packages and significant equity in the company." },
                    { icon: BookOpen, title: "Learning Budget", desc: "$1,500 annual stipend for conferences, courses, and books." },
                    { icon: Users, title: "Team Retreats", desc: "Twice a year, we fly the whole team to an awesome location to connect." }
                ].map((perk, i) => (
                    <Reveal key={i} direction="up" delay={i * 100}>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4"><perk.icon size={20} /></div>
                            <h3 className="font-bold text-slate-900 mb-2">{perk.title}</h3>
                            <p className="text-sm text-slate-500">{perk.desc}</p>
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>

        <section className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-black text-slate-900 mb-8">Open Positions</h2>
            <div className="space-y-4">
                {[
                    { title: "Senior Software Engineer, Backend", team: "Engineering", loc: "Remote (US/EU)" },
                    { title: "Staff Product Designer", team: "Design", loc: "New York, NY" },
                    { title: "Engineering Manager", team: "Engineering", loc: "Remote" },
                    { title: "Product Manager, Growth", team: "Product", loc: "London, UK" },
                    { title: "Security Engineer", team: "Security", loc: "Remote" },
                    { title: "Customer Success Lead", team: "Operations", loc: "San Francisco, CA" }
                ].map((job, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 transition-colors group cursor-pointer">
                        <div>
                            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">{job.team} • {job.loc}</p>
                        </div>
                        <ArrowRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={20} />
                    </div>
                ))}
            </div>
        </section>
    </div>
);

// --- BLOG ---
export const BlogContent = () => (
    <div className="space-y-20 pb-20">
        <section className="text-center py-20 px-4">
            <Reveal direction="up">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">Lennox Insights</h1>
                <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">Latest news, product updates, and financial advice from the Lennox team.</p>
            </Reveal>
        </section>

        <section className="px-4 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000", cat: "Product", date: "Oct 12, 2024", title: "Introducing Lennox Investments: Commission-free trading for everyone", desc: "Today we are launching our biggest update yet. Now you can trade stocks and crypto directly from your dashboard." },
                    { img: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&q=80&w=1000", cat: "Engineering", date: "Sep 28, 2024", title: "How we scaled our transaction engine to 10k TPS", desc: "A deep dive into the architecture behind our lightning-fast payments infrastructure." },
                    { img: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1000", cat: "Security", date: "Sep 15, 2024", title: "Why we are moving to hardware security keys", desc: "The future of authentication is passwordless. Here is why we are adopting WebAuthn." },
                    { img: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=1000", cat: "Company", date: "Aug 22, 2024", title: "Lennox raises Series C to expand globally", desc: "We are thrilled to announce $150M in new funding led by Sequoia Capital." },
                    { img: "https://images.unsplash.com/photo-1616077168079-5e092925105e?auto=format&fit=crop&q=80&w=1000", cat: "Design", date: "Aug 05, 2024", title: "Designing for trust in fintech", desc: "How we use visual design to create a sense of security and reliability for our users." },
                    { img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000", cat: "Tips", date: "Jul 18, 2024", title: "5 ways to save more money this year", desc: "Simple, actionable tips to help you reach your savings goals faster." }
                ].map((post, i) => (
                    <Reveal key={i} direction="up" delay={i * 100}>
                        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all group cursor-pointer h-full flex flex-col">
                            <div className="h-48 overflow-hidden">
                                <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-bold uppercase text-blue-600 tracking-widest">{post.cat}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-xs font-medium text-slate-400">{post.date}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{post.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">{post.desc}</p>
                                <p className="text-blue-600 text-sm font-bold flex items-center gap-1">Read Story <ArrowRight size={16} /></p>
                            </div>
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    </div>
);

// --- STATUS ---
export const StatusContent = () => (
    <div className="space-y-12 pb-20">
        <section className="bg-slate-900 text-white py-12 px-4 text-center rounded-b-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> All Systems Operational
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-4">System Status</h1>
            <p className="text-slate-400">Real-time performance monitoring of Lennox services.</p>
        </section>

        <section className="max-w-3xl mx-auto px-4 space-y-6">
            {[
                { name: "API Gateway", status: "Operational", lat: "24ms" },
                { name: "Web Application", status: "Operational", lat: "12ms" },
                { name: "Mobile App (iOS)", status: "Operational", lat: "-" },
                { name: "Mobile App (Android)", status: "Operational", lat: "-" },
                { name: "Card Processing (Visa)", status: "Operational", lat: "120ms" },
                { name: "Bank Transfers (ACH)", status: "Operational", lat: "-" },
                { name: "Crypto Exchange", status: "Operational", lat: "45ms" },
                { name: "Support Chat", status: "Operational", lat: "-" }
            ].map((sys, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <span className="font-bold text-slate-900">{sys.name}</span>
                    <div className="flex items-center gap-4">
                        {sys.lat !== '-' && <span className="text-xs text-slate-400 font-mono hidden md:inline">{sys.lat}</span>}
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5"><CheckCircle size={14} /> {sys.status}</span>
                    </div>
                </div>
            ))}
        </section>

        <section className="max-w-3xl mx-auto px-4">
            <h3 className="font-bold text-slate-900 mb-4">Past Incidents</h3>
            <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="font-bold text-slate-900 text-sm mb-1">Scheduled Maintenance</p>
                    <p className="text-xs text-slate-500 mb-2">Oct 10, 2024 • 02:00 UTC - 04:00 UTC</p>
                    <p className="text-xs text-slate-600">Performed routine database upgrades. No downtime observed.</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="font-bold text-slate-900 text-sm mb-1">Card Processing Latency</p>
                    <p className="text-xs text-slate-500 mb-2">Sep 22, 2024 • 14:30 UTC - 14:45 UTC</p>
                    <p className="text-xs text-slate-600">Users experienced slower than normal card authorizations due to a partner outage. Resolved in 15 minutes.</p>
                </div>
            </div>
        </section>
    </div>
);

// --- SECURITY ---
export const SecurityContent = () => (
    <div className="space-y-20 pb-20">
        <section className="bg-slate-900 text-white py-20 px-4 text-center rounded-3xl">
            <Shield className="mx-auto text-blue-500 mb-6" size={64} />
            <h1 className="text-4xl md:text-6xl font-black mb-6">Security is our <br /> backbone.</h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">We use military-grade encryption and advanced machine learning to keep your money and data safe.</p>
        </section>

        <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
            {[
                { icon: Lock, title: "AES-256 Encryption", desc: "All user data is encrypted at rest and in transit using the same standards as the US military." },
                { icon: Fingerprint, title: "Biometric Auth", desc: "Support for FaceID, TouchID, and hardware security keys for login." },
                { icon: Brain, title: "AI Fraud Detection", desc: "Our machine learning models analyze transactions in real-time to block suspicious activity." },
                { icon: Server, title: "Cold Storage", desc: "The majority of crypto assets are held in offline, air-gapped cold storage vaults." },
                { icon: Bug, title: "Bug Bounty Program", desc: "We pay ethical hackers to find vulnerabilities in our system before bad actors do." },
                { icon: ShieldCheck, title: "FDIC Insured", desc: "USD cash balances are eligible for FDIC insurance up to $250,000 through our partner banks." }
            ].map((item, i) => (
                <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 mb-4"><item.icon size={24} /></div>
                    <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
            ))}
        </section>

        <section className="bg-blue-50 rounded-3xl p-8 md:p-16 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
                <h2 className="text-3xl text-slate-900 font-black mb-6">Found a vulnerability?</h2>
                <p className="text-slate-600 mb-6 leading-relaxed">We take security reports seriously. If you believe you’ve found a security issue in our applications or infrastructure, please submit a report to our security team.</p>
                <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm">Report Vulnerability</button>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-4">Responsible Disclosure Policy</h4>
                <ul className="space-y-3 text-sm text-slate-500">
                    <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 shrink-0" /> Do not exploit the vulnerability.</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 shrink-0" /> Do not access user data.</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 shrink-0" /> Give us time to fix it before public disclosure.</li>
                </ul>
            </div>
        </section>
    </div>
);

// --- LEGAL (Simple Text Pages) ---
export const PrivacyPolicyContent = () => (
    <div className="prose prose-slate max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-black text-slate-900">Privacy Policy</h1>
        <p className="text-slate-500">Last updated: October 15, 2024</p>

        <h3>1. Introduction</h3>
        <p>Lennox Meridian Holdings ("Lennox", "we", "us", or "our") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>

        <h3>2. Data We Collect</h3>
        <p>We collect various types of information, including:</p>
        <ul>
            <li><strong>Identity Data:</strong> First name, last name, username, title, date of birth, and gender.</li>
            <li><strong>Contact Data:</strong> Billing address, delivery address, email address, and telephone numbers.</li>
            <li><strong>Financial Data:</strong> Bank account and payment card details.</li>
            <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products and services you have purchased from us.</li>
        </ul>

        <h3>3. How We Use Your Data</h3>
        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
        <ul>
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal or regulatory obligation.</li>
        </ul>

        <h3>4. Data Security</h3>
        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>

        <h3>5. Your Legal Rights</h3>
        <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.</p>
    </div>
);

export const TermsOfServiceContent = () => (
    <div className="prose prose-slate max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-black text-slate-900">Terms of Service</h1>
        <p className="text-slate-500">Last updated: October 15, 2024</p>

        <h3>1. Agreement to Terms</h3>
        <p>By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.</p>

        <h3>2. Banking Services</h3>
        <p>Lennox is not a bank. Banking services are provided by Lennox's partner banks, Members FDIC. By opening an account, you also agree to the Partner Bank's Account Agreement.</p>

        <h3>3. User Accounts</h3>
        <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

        <h3>4. Prohibited Uses</h3>
        <p>You may use the Service only for lawful purposes in accordance with Terms. You agree not to use the Service:</p>
        <ul>
            <li>In any way that violates any applicable federal, state, local or international law or regulation.</li>
            <li>For the purpose of exploiting, harming or attempting to exploit or harm minors in any way.</li>
            <li>To transmit, or procure the spending of, any advertising or promotional material, including any "junk mail", "chain letter" or "spam" or any other similar solicitation.</li>
        </ul>

        <h3>5. Termination</h3>
        <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
    </div>
);

// --- HELP CENTER ---
export const HelpCenterContent = ({ onNavigate }: any) => (
    <div className="space-y-12 pb-20">
        <section className="bg-blue-600 text-white py-20 px-4 text-center rounded-3xl">
            <h1 className="text-4xl md:text-5xl font-black mb-6">How can we help you?</h1>
            <div className="max-w-xl mx-auto relative cursor-text">
                <input type="text" placeholder="Search for answers..." className="w-full py-4 pl-12 pr-4 rounded-xl text-slate-900 font-medium focus:outline-none shadow-xl" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>
        </section>

        <section className="px-4 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {[
                { icon: UserCheck, title: "Account & Profile", topics: ["Reset Password", "Update Email", "Verification Status"] },
                { icon: CreditCard, title: "Cards & Payments", topics: ["Activate Card", "Dispute Transaction", "International Fees"] },
                { icon: Lock, title: "Security & Privacy", topics: ["Two-Factor Auth", "Freeze Account", "Phishing Prevention"] },
                { icon: TrendingUp, title: "Investments", topics: ["Tax Documents", "Dividend Schedule", "Trading Rules"] },
                { icon: Smartphone, title: "Mobile App", topics: ["Biometric Login", "Push Notifications", "App Crash"] },
                { icon: Gift, title: "Rewards & Referrals", topics: ["Redeem Cashback", "Referral Bonus", "Points History"] },
            ].map((cat, i) => (
                <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"><cat.icon size={20} /></div>
                    <h3 className="font-bold text-slate-900 mb-3">{cat.title}</h3>
                    <ul className="space-y-2">
                        {cat.topics.map((t, j) => (
                            <li key={j} className="text-sm text-slate-500 hover:text-blue-600 hover:underline">{t}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </section>

        <section className="max-w-4xl mx-auto px-4">
            <div className="bg-slate-50 rounded-3xl p-8 md:p-12 text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Can't find what you're looking for?</h2>
                <p className="text-slate-500 mb-8">Our support team is available 24/7 to assist you.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => onNavigate('contact')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Contact Support</button>
                    <button className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold">Visit Community</button>
                </div>
            </div>
        </section>
    </div>
);

// --- PRESS ---
export const PressContent = () => (
    <div className="space-y-20 pb-20">
        <section className="text-center py-20 px-4">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">Lennox in the News</h1>
            <p className="text-slate-500 text-lg">For media inquiries, please contact <span className="text-blue-600 underline">press@lennox.com</span></p>
        </section>

        <section className="max-w-5xl mx-auto px-4 space-y-8">
            {[
                { source: "The Wall Street Journal", date: "Oct 01, 2024", title: "Lennox Challenges Traditional Banking with AI-First Approach", desc: "The fintech unicorn is betting big on artificial intelligence to automate personal finance.", link: "#" },
                { source: "TechCrunch", date: "Sep 15, 2024", title: "Lennox Raises $150M Series C led by Sequoia", desc: "The fresh capital will be used to expand into European markets and launch crypto trading.", link: "#" },
                { source: "Forbes", date: "Aug 20, 2024", title: "Forbes Fintech 50: Lennox Debuts on the List", desc: "Recognized as one of the most innovative financial technology companies of the year.", link: "#" },
                { source: "CNBC", date: "Jul 10, 2024", title: "CEO Sarah Connor on the Future of Digital Wallets", desc: "Watch the full interview with Squawk Box team discussing the shift to cashless societies.", link: "#" }
            ].map((article, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
                    <div className="w-full md:w-48 h-32 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black uppercase tracking-widest text-xs shrink-0">{article.source}</div>
                    <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">
                            {article.source} • {article.date}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 hover:text-blue-600 cursor-pointer">{article.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-3">{article.desc}</p>
                        <a href={article.link} className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1">Read Article <ArrowRight size={14} /></a>
                    </div>
                </div>
            ))}
        </section>

        <section className="max-w-6xl mx-auto px-4">
            <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-16 text-center">
                <h2 className="text-2xl font-bold mb-8">Brand Assets</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white/10 p-6 rounded-xl border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                        <Download className="mx-auto mb-4" size={24} />
                        <p className="font-bold">Logos (SVG/PNG)</p>
                    </div>
                    <div className="bg-white/10 p-6 rounded-xl border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                        <ImageIcon className="mx-auto mb-4" size={24} />
                        <p className="font-bold">Product Screenshots</p>
                    </div>
                    <div className="bg-white/10 p-6 rounded-xl border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                        <Users className="mx-auto mb-4" size={24} />
                        <p className="font-bold">Executive Headshots</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
);

// --- CONTACT US ---
export const ContactUsContent = () => {
    const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormState('submitting');
        // Simulate network request
        setTimeout(() => {
            setFormState('success');
        }, 1500);
    };

    return (
        <div className="space-y-20 pb-20">
            <section className="bg-slate-900 text-white py-20 px-4 text-center rounded-3xl">
                <Reveal direction="up">
                    <h1 className="text-4xl md:text-6xl font-black mb-6">Get in touch.</h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">We are here to help. Chat with our support team or send us a message.</p>
                </Reveal>
            </section>

            <section className="px-4 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                <Reveal direction="up" delay={0}>
                    <div className="p-8 bg-white border border-slate-100 rounded-3xl text-center hover:shadow-xl transition-shadow h-full">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Mail size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Email Support</h3>
                        <p className="text-slate-500 mb-6">For general inquiries and account support.</p>
                        <a href="mailto:admin@lennoxmh.com" className="text-blue-600 font-bold hover:underline text-lg">admin@lennoxmh.com</a>
                    </div>
                </Reveal>
                <Reveal direction="up" delay={100}>
                    <div className="p-8 bg-white border border-slate-100 rounded-3xl text-center hover:shadow-xl transition-shadow h-full">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Phone size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Phone Support</h3>
                        <p className="text-slate-500 mb-6">Speak directly with a support agent.</p>
                        <p className="text-slate-900 font-bold text-lg">+1 (888) 123-4567</p>
                        <p className="text-xs text-slate-400 mt-2">Mon-Fri, 9am-6pm EST</p>
                    </div>
                </Reveal>
                <Reveal direction="up" delay={200}>
                    <div className="p-8 bg-white border border-slate-100 rounded-3xl text-center hover:shadow-xl transition-shadow h-full">
                        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <MapPin size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Headquarters</h3>
                        <p className="text-slate-500 mb-6">Visit our main office.</p>
                        <p className="text-slate-900 font-bold">123 Financial District Blvd</p>
                        <p className="text-slate-900 font-bold">New York, NY 10005</p>
                    </div>
                </Reveal>
            </section>

            <section className="max-w-3xl mx-auto px-4">
                <Reveal direction="up" delay={300}>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                        <div className="p-8 md:p-12">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-black text-slate-900 mb-4">Send us a message</h2>
                                <p className="text-slate-500">Fill out the form below and we'll get back to you within 24 hours.</p>
                            </div>

                            {formState === 'success' ? (
                                <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-green-800 mb-2">Message Sent!</h3>
                                    <p className="text-green-600 mb-6">Thank you for contacting us. We have received your ticket and will respond to <span className="font-bold">admin@lennoxmh.com</span> shortly.</p>
                                    <button onClick={() => setFormState('idle')} type="button" className="text-green-700 font-bold hover:underline">Send another message</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Full Name</label>
                                            <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-900" placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Email Address</label>
                                            <input required type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-900" placeholder="john@company.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Subject</label>
                                        <div className="relative">
                                            <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium bg-white text-slate-900 appearance-none">
                                                <option>General Inquiry</option>
                                                <option>Account Support</option>
                                                <option>Technical Issue</option>
                                                <option>Partnership</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Message</label>
                                        <textarea required rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium resize-none text-slate-900" placeholder="How can we help you today?"></textarea>
                                    </div>
                                    <button disabled={formState === 'submitting'} type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                                        {formState === 'submitting' ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>Send Message <ArrowRight size={20} /></>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </Reveal>
            </section>
        </div>
    );
};

// Missing icons helper
const ShieldCheck = ({ size, className }: any) => <Shield size={size} className={className} />;
const Brain = ({ size, className }: any) => <Cpu size={size} className={className} />;
const Bug = ({ size, className }: any) => <AlertTriangle size={size} className={className} />;
