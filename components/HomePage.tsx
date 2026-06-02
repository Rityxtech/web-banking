
import React, { useState, useEffect, useRef } from 'react';
import { APP_CONFIG } from '../config';
import { Shield, Smartphone, Globe, ArrowRight, CheckCircle, CreditCard, ChevronRight, Play, Star, Search, Zap, Server, Lock, Cpu, BarChart3, RefreshCw, ChevronDown, Check, ArrowLeft, Mail, Phone, MapPin, FileText, Briefcase, Users, HelpCircle, Download, Award, TrendingUp, Calendar, Image as ImageIcon, HeartPulse, Activity, AlertCircle, Wifi, Database, Mic, Video, Layers } from 'lucide-react';
import { Fingerprint, EyeOff } from 'lucide-react';
import { CheckingContent, SavingsContent, CreditCardsContent, InvestmentsContent } from './ProductPages';
import { AboutUsContent, CareersContent, BlogContent, PressContent, HelpCenterContent, StatusContent, SecurityContent, PrivacyPolicyContent, TermsOfServiceContent, ContactUsContent } from './FooterContent';

interface HomePageProps {
   onNavigate: (page: 'signin' | 'signup', email?: string) => void;
   logoUrl?: string;
   siteName?: string;
}

interface RevealProps {
   children?: React.ReactNode;
   className?: string;
   direction?: 'up' | 'down' | 'left' | 'right' | 'zoom';
   delay?: number;
   threshold?: number;
}

// --- Animation Wrapper Component ---
const Reveal: React.FC<RevealProps> = ({ children, className = "", direction = 'up', delay = 0, threshold = 0.1 }) => {
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

      if (ref.current) {
         observer.observe(ref.current);
      }

      return () => {
         if (ref.current) {
            observer.unobserve(ref.current);
         }
      };
   }, [threshold]);

   const getTransformClass = () => {
      switch (direction) {
         case 'up': return 'translate-y-10';
         case 'down': return '-translate-y-10';
         case 'left': return '-translate-x-20'; // Slide in from left
         case 'right': return 'translate-x-20'; // Slide in from right
         case 'zoom': return 'scale-90';
         default: return 'translate-y-10';
      }
   };

   return (
      <div
         ref={ref}
         className={`${className} transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : `opacity-0 ${getTransformClass()}`
            }`}
         style={{ transitionDelay: `${delay}ms` }}
      >
         {children}
      </div>
   );
};

const FeatureItem = ({ text }: { text: string }) => (
   <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
      <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
         <Check size={10} strokeWidth={3} className="md:w-3 md:h-3" />
      </div>
      <span className="text-slate-600 text-xs md:text-sm font-medium">{text}</span>
   </div>
);

const ComparisonBar = ({ label, speed, width, isWinner }: { label: string, speed: string, width: string, isWinner?: boolean }) => (
   <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6">
      <div className="w-16 md:w-24 text-[10px] md:text-xs font-bold text-slate-900">{label}</div>
      <div className="flex-1">
         <div className="flex items-center gap-2 md:gap-3">
            <div className={`h-8 md:h-10 rounded-r-full flex items-center px-3 md:px-4 text-[8px] md:text-[10px] font-bold text-white transition-all duration-1000 ${isWinner ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-slate-200 text-slate-500'}`} style={{ width }}>
               {isWinner && 'Fastest'}
            </div>
            <span className="text-[10px] md:text-xs font-bold text-slate-500">{speed}</span>
         </div>
      </div>
   </div>
);

const FaqItem = ({ q, a }: { q: string, a: string }) => {
   const [isOpen, setIsOpen] = useState(false);
   return (
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-3 md:mb-4 bg-white transition-all duration-300">
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-4 md:p-5 text-left bg-white hover:bg-slate-50 transition-colors"
         >
            <span className="font-bold text-slate-900 text-sm md:text-base">{q}</span>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 md:w-[18px] md:h-[18px] ${isOpen ? 'rotate-180' : ''}`} />
         </button>
         <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 md:p-5 pt-0 text-xs md:text-sm text-slate-500 leading-relaxed border-t border-slate-100 mt-1 md:mt-2">
               {a}
            </div>
         </div>
      </div>
   );
};

// --- Footer Pages Component ---
const FooterPage = ({ page, onBack, onNavigate }: { page: string, onBack: () => void, onNavigate: (p: any) => void }) => {
   const renderContent = () => {
      switch (page) {
         // PRODUCT PAGES
         case 'Checking':
            return <CheckingContent onNavigate={onNavigate} />;
         case 'Savings':
            return <SavingsContent onNavigate={onNavigate} />;
         case 'Credit Cards':
            return <CreditCardsContent onNavigate={onNavigate} />;
         case 'Investments':
            return <InvestmentsContent onNavigate={onNavigate} />;


         // ... (existing codes)

         // COMPANY: About Us / Careers / Blog / Press
         case 'About Us':
            return <AboutUsContent />;
         case 'Careers':
            return <CareersContent />;
         case 'Blog':
            return <BlogContent />;
         case 'Press':
            return <PressContent />;

         // SUPPORT
         case 'Help Center':
            return <HelpCenterContent onNavigate={onNavigate} />;
         case 'Status':
            return <StatusContent />;
         case 'Security':
            return <SecurityContent />;

         // LEGAL
         case 'Privacy Policy':
            return <PrivacyPolicyContent />;
         case 'Terms of Service':
            return <TermsOfServiceContent />;

         // CONTACT
         case 'Contact Us':
            return <ContactUsContent />;

         default:
            return (
               <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <FileText className="text-slate-400" />
                  </div>
                  <h2 className="font-bold text-slate-900">{page}</h2>
                  <p className="text-sm text-slate-500 mt-2">Information is currently being updated by our team.</p>
               </div>
            );
      }
   };

   return (
      <div className="min-h-screen bg-[#F8FAFC]">
         <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 z-50 px-4 py-3 flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
               <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <span className="font-bold text-slate-900 capitalize text-sm">{page}</span>
         </div>
         <div className={`${['Checking', 'Savings', 'Credit Cards', 'Investments', 'About Us', 'Careers', 'Blog', 'Press', 'Help Center', 'Status', 'Security', 'Privacy Policy', 'Terms of Service', 'Contact Us'].includes(page) ? 'max-w-7xl' : 'max-w-2xl'} mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            {renderContent()}
         </div>
      </div>
   );
};

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, logoUrl, siteName }) => {
   const [heroEmail, setHeroEmail] = useState('');
   const [activePage, setActivePage] = useState<string>('home');

   const defaultLogo = "https://image2url.com/r2/default/images/1769428285590-d43b30ba-a0ba-499f-a066-6411c1619f75.webp";
   const displayLogo = logoUrl && logoUrl.trim() !== '' ? logoUrl : defaultLogo;
   const displayName = siteName && siteName.trim() !== '' ? siteName.split(' ')[0] : APP_CONFIG.BRAND_NAME;

   if (activePage !== 'home') {
      return <FooterPage page={activePage} onBack={() => setActivePage('home')} onNavigate={onNavigate} />;
   }

   return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">

         {/* 1. NAVBAR */}
         <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 transition-all duration-300 h-16 md:h-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
               <div className="flex justify-between items-center h-full">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                     <img
                        src={displayLogo}
                        alt={displayName}
                        className="w-8 h-8 object-contain rounded-full"
                        onError={(e) => { (e.target as HTMLImageElement).src = defaultLogo; }}
                     />
                     <span className="text-lg md:text-xl font-bold tracking-tight uppercase">{displayName}</span>
                  </div>
                  <div className="hidden md:flex items-center space-x-8">
                     <a href="#home" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Home</a>
                     <a href="#banking" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Banking</a>
                     <a href="#process" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Process</a>
                     <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5 rounded-sm" /> EN
                     </div>
                     <button
                        onClick={() => onNavigate('signin')}
                        className="bg-slate-900 text-white px-8 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5"
                     >
                        Login
                     </button>
                  </div>
                  <div className="md:hidden">
                     <button onClick={() => onNavigate('signin')} className="text-blue-600 font-bold text-sm">Log In</button>
                  </div>
               </div>
            </div>
         </nav>

         {/* 2. HERO SECTION */}
         <section id="home" className="relative pt-24 pb-12 md:pt-32 md:pb-24 overflow-hidden">
            <div className="absolute inset-0 z-0">
               <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070"
                  alt="Modern Banking Architecture"
                  className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-b from-sky-50/95 via-white/80 to-[#F8FAFC]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
               <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
                  <Reveal direction="zoom" delay={100}>
                     <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-blue-100 text-blue-600 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 md:mb-6 shadow-sm">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        {APP_CONFIG.COMPANY_NAME}
                     </div>
                  </Reveal>

                  <Reveal direction="up" delay={200}>
                     <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 mb-4 md:mb-6 leading-tight">
                        Secure Cloud Banking <br /> For Your Business
                     </h1>
                  </Reveal>

                  <Reveal direction="up" delay={300}>
                     <p className="text-sm md:text-lg text-slate-500 mb-6 md:mb-10 leading-relaxed max-w-2xl mx-auto px-2">
                        With comprehensive financial analysis, detailed expense tracking, and strategic investment linking, your wealth will be managed effortlessly.
                     </p>
                  </Reveal>

                  <Reveal direction="up" delay={400}>
                     <div className="max-w-xl mx-auto bg-white p-1 md:p-2 rounded-full shadow-xl shadow-blue-900/5 border border-slate-100 flex items-center transform transition-transform hover:scale-[1.01]">
                        <input
                           type="email"
                           value={heroEmail}
                           onChange={(e) => setHeroEmail(e.target.value)}
                           placeholder="Enter your email address"
                           className="flex-1 bg-transparent border-none outline-none px-4 md:px-6 text-slate-600 placeholder:text-slate-400 font-medium text-xs md:text-base h-10 md:h-auto"
                        />
                        <button
                           onClick={() => onNavigate('signup', heroEmail)}
                           className="w-10 h-10 md:w-auto md:px-6 md:py-3 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-md md:shadow-none shrink-0"
                        >
                           <Search size={16} className="md:hidden" />
                           <span className="hidden md:inline">Get Started</span>
                        </button>
                     </div>
                  </Reveal>
               </div>

               <div className="relative max-w-4xl mx-auto mt-8 md:mt-16 perspective-[2000px]">
                  <Reveal direction="zoom" delay={600}>
                     <div className="relative z-20 bg-white rounded-2xl md:rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 p-6 md:p-12 text-center max-w-[280px] md:max-w-sm mx-auto transform rotate-y-12 rotate-x-12 hover:rotate-0 transition-transform duration-700 ease-out cursor-pointer">
                        <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        <h3 className="text-slate-500 font-bold text-[10px] md:text-sm uppercase tracking-wider mb-1 md:mb-2">Premium Banking</h3>
                        <div className="flex items-baseline justify-center gap-1 mb-1">
                           <span className="text-3xl md:text-5xl font-extrabold text-slate-900">$0</span>
                           <span className="text-slate-400 font-bold text-xs md:text-base">/Monthly</span>
                        </div>
                        <p className="text-[10px] md:text-xs text-green-500 font-bold mb-4 md:mb-8">Save 100% forever</p>

                        <div className="space-y-2 md:space-y-4 text-left mb-6 md:mb-8 pl-2 md:pl-0">
                           <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm font-bold text-slate-700">
                              <Cpu size={14} className="text-blue-500 md:w-[18px] md:h-[18px]" /> Unlimited Transfers
                           </div>
                           <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm font-bold text-slate-700">
                              <Server size={14} className="text-blue-500 md:w-[18px] md:h-[18px]" /> 5 Virtual Cards
                           </div>
                           <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm font-bold text-slate-700">
                              <Globe size={14} className="text-blue-500 md:w-[18px] md:h-[18px]" /> Global ATM Access
                           </div>
                           <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm font-bold text-slate-700">
                              <Lock size={14} className="text-blue-500 md:w-[18px] md:h-[18px]" /> Vault Security
                           </div>
                        </div>

                        <button
                           onClick={() => onNavigate('signup')}
                           className="w-full py-3 md:py-4 bg-blue-500 text-white rounded-lg md:rounded-xl font-bold text-xs md:text-base hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                        >
                           Open Account Now
                        </button>
                     </div>
                  </Reveal>

                  <Reveal direction="left" delay={800} className="absolute top-6 md:top-10 left-[15%] md:left-1/4 -z-10 w-48 md:w-64 h-64 md:h-80">
                     <div className="w-full h-full bg-blue-50 rounded-2xl md:rounded-3xl transform -rotate-12 opacity-60"></div>
                  </Reveal>
                  <Reveal direction="right" delay={800} className="absolute top-10 md:top-20 right-[15%] md:right-1/4 -z-10 w-48 md:w-64 h-64 md:h-80">
                     <div className="w-full h-full bg-sky-50 rounded-2xl md:rounded-3xl transform rotate-12 opacity-60"></div>
                  </Reveal>
               </div>
            </div>
         </section>

         {/* 3. TRUST SECTION */}
         <section className="py-8 md:py-12 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
               <Reveal direction="up">
                  <p className="text-blue-500 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-2">Recommended Best Banking App</p>
                  <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto mb-6 md:mb-8 px-4">Our in-house developed monitoring solution constantly checks on the dedicated server and its to ensure top condition.</p>
               </Reveal>

               <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-24">
                  <Reveal direction="left" delay={200}>
                     <div className="flex flex-col items-center gap-1 md:gap-2">
                        <div className="flex items-center gap-2 text-lg md:text-xl font-bold text-slate-900">
                           <Star className="fill-green-500 text-green-500 w-4 h-4 md:w-6 md:h-6" /> Trustpilot
                        </div>
                        <div className="flex gap-1">
                           {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-sm flex items-center justify-center"><Star size={12} className="fill-white text-white md:w-3.5 md:h-3.5" /></div>)}
                        </div>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1 md:mt-2">Trustpilot - Trusted by Businesses <br /> Worldwide!</p>
                     </div>
                  </Reveal>

                  <div className="w-24 h-px bg-slate-100 md:w-px md:h-16"></div>

                  <Reveal direction="right" delay={200}>
                     <div className="flex flex-col items-center gap-1 md:gap-2">
                        <div className="text-lg md:text-xl font-bold text-orange-500 flex items-center gap-2">
                           <span className="text-xl md:text-2xl font-black">G</span> <span className="text-slate-900">High Performer</span>
                        </div>
                        <div className="flex gap-1">
                           {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} className="fill-orange-400 text-orange-400 md:w-[18px] md:h-[18px]" />)}
                        </div>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1 md:mt-2">Trusted by Thousands of Happy <br /> Customers!</p>
                     </div>
                  </Reveal>
               </div>
            </div>
         </section>

         {/* 4. THREE COLUMN FEATURES */}
         <section className="py-12 md:py-24 bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <Reveal direction="up">
                  <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-8 md:mb-16 text-center max-w-2xl mx-auto">
                     Powerful Digital Banking <br /> for a Competitive edge.
                  </h2>
               </Reveal>

               <div className="grid md:grid-cols-3 gap-3 md:gap-8">
                  {[
                     { title: 'Simple & Easy to Use', icon: Smartphone, desc: 'Manage all your finances in a single user-friendly dashboard that is feature packed, yet very easy to use.', color: 'text-green-500 bg-green-50' },
                     { title: 'Fraud Security Mitigation', icon: Shield, desc: 'Advanced AI monitors transactions 24/7. Any suspicious activity is instantly flagged and blocked to keep you safe.', color: 'text-blue-500 bg-blue-50' },
                     { title: '64+ Global Partners', icon: Globe, desc: 'Access your money from anywhere. Our global partner network ensures you can spend and withdraw locally.', color: 'text-purple-500 bg-purple-50' }
                  ].map((item, i) => (
                     <Reveal key={i} direction="up" delay={i * 200} className="h-full">
                        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl hover:shadow-xl transition-all duration-300 group border border-slate-100 h-full">
                           <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 ${item.color} transform group-hover:scale-110 transition-transform duration-300`}>
                              <item.icon size={24} className="md:w-8 md:h-8" />
                           </div>
                           <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-4">{item.title}</h3>
                           <p className="text-slate-500 leading-relaxed text-xs md:text-sm">{item.desc}</p>
                        </div>
                     </Reveal>
                  ))}
               </div>
            </div>
         </section>

         {/* 5. FEATURE DEEP DIVE (Left Image, Right Text) */}
         <section id="banking" className="py-12 md:py-24 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 -skew-x-12 transform origin-top-right"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
               <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
                  <Reveal direction="left" className="relative">
                     <div className="absolute inset-0 bg-blue-200 rounded-full blur-[80px] opacity-20"></div>
                     <img
                        src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop"
                        alt="Digital Banking Dashboard"
                        className="relative rounded-xl md:rounded-2xl shadow-2xl border border-slate-100 transform hover:scale-[1.02] transition-transform duration-500"
                     />
                     <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-white p-3 md:p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                           <Zap size={16} className="md:w-5 md:h-5" fill="currentColor" />
                        </div>
                        <div>
                           <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">Transaction</p>
                           <p className="text-xs md:text-sm font-bold text-slate-900">Instant Success</p>
                        </div>
                     </div>
                  </Reveal>

                  <Reveal direction="right" className="space-y-6 md:space-y-8">
                     <div className="space-y-4">
                        <h4 className="text-blue-600 font-bold text-[10px] md:text-xs uppercase tracking-widest">Built for the future</h4>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">Banking that moves at the speed of light.</h2>
                        <p className="text-slate-500 text-sm md:text-base leading-relaxed">Our proprietary cloud core allows for near-zero latency transactions. Send money across the globe and see it arrive before you've even closed the app.</p>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-3">
                           <FeatureItem text="Cloud-Native Architecture" />
                           <FeatureItem text="Auto-Scaling Performance" />
                           <FeatureItem text="Military Grade Security" />
                        </div>
                        <div className="space-y-3">
                           <FeatureItem text="Real-time Analytics" />
                           <FeatureItem text="Multi-Currency Support" />
                           <FeatureItem text="Smart Budgeting AI" />
                        </div>
                     </div>

                     <div className="pt-4">
                        <button onClick={() => onNavigate('signup')} className="group flex items-center gap-2 text-slate-900 font-extrabold hover:text-blue-600 transition-all text-sm md:text-base">
                           Explore our technology <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                     </div>
                  </Reveal>
               </div>
            </div>
         </section>

         {/* 6. COMPARISON SECTION */}
         <section className="py-12 md:py-24 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
               <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
                  <Reveal direction="up">
                     <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Why {APP_CONFIG.BRAND_NAME} is Different.</h2>
                     <p className="text-slate-400 text-sm md:text-lg">We benchmarked our core system against traditional banking infrastructure. The results speak for themselves.</p>
                  </Reveal>
               </div>

               <div className="grid lg:grid-cols-2 gap-12 md:gap-24 items-center">
                  <Reveal direction="left">
                     <div className="space-y-2 mb-10">
                        <h3 className="text-xl md:text-2xl font-bold mb-4">Transaction Velocity</h3>
                        <p className="text-slate-400 text-xs md:text-sm">Time taken to settle international transfers between regional nodes.</p>
                     </div>

                     <div className="space-y-2">
                        <ComparisonBar label="Traditional" speed="3-5 Days" width="20%" />
                        <ComparisonBar label="Neo Banks" speed="12-24 Hours" width="50%" />
                        <ComparisonBar label={`${APP_CONFIG.BRAND_NAME} Cloud`} speed="0.8 Seconds" width="100%" isWinner={true} />
                     </div>
                  </Reveal>

                  <Reveal direction="right" className="grid grid-cols-2 gap-4 md:gap-8">
                     {[
                        { label: 'Uptime', val: '99.99%', sub: 'Global Reliability' },
                        { label: 'Security', val: 'AES-256', sub: 'End-to-End' },
                        { label: 'Support', val: '< 2 Min', sub: 'Avg Response Time' },
                        { label: 'Coverage', val: '64+', sub: 'Active Regions' }
                     ].map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl md:rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-all">
                           <p className="text-2xl md:text-4xl font-black text-blue-400 mb-1">{stat.val}</p>
                           <p className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest">{stat.label}</p>
                           <p className="text-[8px] md:text-[10px] text-slate-500 mt-1">{stat.sub}</p>
                        </div>
                     ))}
                  </Reveal>
               </div>
            </div>
         </section>

         {/* 7. PROCESS SECTION */}
         <section id="process" className="py-12 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center max-w-2xl mx-auto mb-12 md:mb-20">
                  <Reveal direction="up">
                     <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">Simple Onboarding.</h2>
                     <p className="text-slate-500 text-sm md:text-lg">Get your business bank account up and running in minutes, not weeks.</p>
                  </Reveal>
               </div>

               <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
                  {/* Connecting lines for desktop */}
                  <div className="hidden md:block absolute top-24 left-1/3 w-1/3 h-px bg-slate-100 border-t-2 border-dashed border-slate-200 -z-10"></div>
                  <div className="hidden md:block absolute top-24 right-1/3 w-1/3 h-px bg-slate-100 border-t-2 border-dashed border-slate-200 -z-10"></div>

                  {[
                     { step: '01', title: 'Register Identity', desc: 'Create your account using your business email and basic details.' },
                     { step: '02', title: 'Verify Protocol', desc: 'Securely verify your identity through our encrypted cloud verification node.' },
                     { step: '03', title: 'Access Vault', desc: 'Instantly access your wallet, cards, and investment tools.' }
                  ].map((item, i) => (
                     <Reveal key={i} direction="up" delay={i * 200} className="text-center group">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6 md:mb-8 font-black text-xl md:text-2xl border-4 border-white shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 transform group-hover:scale-110">
                           {item.step}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 md:mb-4">{item.title}</h3>
                        <p className="text-slate-500 text-xs md:text-sm leading-relaxed px-4 md:px-0">{item.desc}</p>
                     </Reveal>
                  ))}
               </div>
            </div>
         </section>

         {/* 8. FAQ SECTION */}
         <section className="py-12 md:py-24 bg-[#F8FAFC]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
               <Reveal direction="up">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-10 md:mb-16 text-center">Frequently Asked Questions</h2>
               </Reveal>
               <Reveal direction="up" delay={200}>
                  <FaqItem q={`Is my money safe with ${APP_CONFIG.BRAND_NAME}?`} a={`Yes. ${APP_CONFIG.BRAND_NAME} employs military-grade AES-256 encryption for all data at rest and in transit. Your assets are stored in redundant, secure cloud vaults with 24/7 AI-driven monitoring.`} />
                  <FaqItem q="What are the transfer fees?" a={`${APP_CONFIG.BRAND_NAME} offers zero-fee transfers between internal accounts. For international transfers, we offer industry-leading competitive rates with transparent, real-time calculations.`} />
                  <FaqItem q="How do virtual cards work?" a="Virtual cards can be created instantly within the app. They function like physical cards for online and contactless payments but provide enhanced security through instant freezing and rotating CVV options." />
                  <FaqItem q="Can I invest through the app?" a="Absolutely. Our integrated investment module allows you to link your banking balance directly to stock and crypto markets, managing your entire portfolio from a single interface." />
                  <FaqItem q="What is the support turnaround time?" a="Our premium support team is available 24/7. We guarantee a response time of under 2 minutes for all critical account inquiries." />
               </Reveal>
            </div>
         </section>

         {/* 9. CTA SECTION */}
         <section className="py-12 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <Reveal direction="zoom">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 text-white text-center relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>

                     <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-6xl font-black mb-6 md:mb-8 leading-tight">Ready to upgrade your financial core?</h2>
                        <p className="text-blue-100 text-sm md:text-xl mb-10 md:mb-12 font-medium opacity-90 px-4">Join over 2.4 million businesses and individuals who have already switched to the future of digital banking.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
                           <button
                              onClick={() => onNavigate('signup')}
                              className="bg-white text-blue-600 px-8 py-4 md:px-12 md:py-5 rounded-2xl font-black text-sm md:text-lg hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                           >
                              Create Free Account
                           </button>
                           <button
                              onClick={() => onNavigate('signin')}
                              className="bg-blue-500/30 text-white border border-white/30 px-8 py-4 md:px-12 md:py-5 rounded-2xl font-black text-sm md:text-lg hover:bg-white/10 transition-all backdrop-blur-sm active:scale-95"
                           >
                              Contact Sales
                           </button>
                        </div>
                        <div className="mt-10 md:mt-16 flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-60">
                           <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest"><Shield size={14} /> FDIC Insured</div>
                           <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest"><CheckCircle size={14} /> No Hidden Fees</div>
                           <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest"><Lock size={14} /> Bank Grade Encryption</div>
                        </div>
                     </div>
                  </div>
               </Reveal>
            </div>
         </section>

         {/* 10. FOOTER */}
         <footer className="bg-white border-t border-slate-100 pt-16 md:pt-24 pb-32 md:pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 md:gap-12 mb-16 md:mb-20">
                  <div className="col-span-2 lg:col-span-1">
                     <div className="flex items-center gap-2 mb-6">
                        <img
                           src={displayLogo}
                           alt={displayName}
                           className="w-8 h-8 object-contain rounded-full"
                           onError={(e) => { (e.target as HTMLImageElement).src = defaultLogo; }}
                        />
                        <span className="text-xl font-bold tracking-tight uppercase">{displayName}</span>
                     </div>
                     <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6">Redefining the digital banking experience through innovative cloud technology and human-centric design.</p>
                     <div className="flex gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-colors cursor-pointer"><Star size={14} /></div>)}
                     </div>
                  </div>

                  <div>
                     <h4 className="font-bold text-slate-900 mb-6 text-sm md:text-base">Products</h4>
                     <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-slate-500">
                        {['Checking', 'Savings', 'Credit Cards', 'Investments'].map(p => (
                           <li key={p} className="hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setActivePage(p)}>{p}</li>
                        ))}
                     </ul>
                  </div>

                  <div>
                     <h4 className="font-bold text-slate-900 mb-6 text-sm md:text-base">Company</h4>
                     <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-slate-500">
                        {['About Us', 'Careers', 'Blog', 'Press'].map(p => (
                           <li key={p} className="hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setActivePage(p)}>{p}</li>
                        ))}
                     </ul>
                  </div>

                  <div>
                     <h4 className="font-bold text-slate-900 mb-6 text-sm md:text-base">Support</h4>
                     <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-slate-500">
                        {['Help Center', 'Status', 'Security', 'Contact Us'].map(p => (
                           <li key={p} className="hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setActivePage(p)}>{p}</li>
                        ))}
                     </ul>
                  </div>

                  <div>
                     <h4 className="font-bold text-slate-900 mb-6 text-sm md:text-base">Legal</h4>
                     <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-slate-500">
                        {['Privacy Policy', 'Terms of Service'].map(p => (
                           <li key={p} className="hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setActivePage(p)}>{p}</li>
                        ))}
                        <li>
                           <div className="pt-4 space-y-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Region</p>
                              <div className="flex items-center gap-2 font-bold text-slate-900">
                                 <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5 rounded-sm" /> United States
                              </div>
                           </div>
                        </li>
                     </ul>
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-slate-400 text-[10px] md:text-xs text-center md:text-left">
                     <p>© 2024 {APP_CONFIG.COMPANY_NAME}. All rights reserved.</p>
                     <p className="mt-1">Banking services provided by {APP_CONFIG.BRAND_NAME} Partner Bank, Member FDIC.</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                     <span className="flex items-center gap-1.5"><Shield size={12} className="text-blue-500" /> SSL Secured</span>
                     <span className="flex items-center gap-1.5"><Lock size={12} className="text-blue-500" /> PCI DSS Level 1</span>
                     <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-blue-500" /> ISO 27001</span>
                  </div>
               </div>
            </div>
         </footer>
      </div>
   );
};
