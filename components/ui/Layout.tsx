
import React, { useState, useEffect, useRef } from 'react';
import { APP_CONFIG } from '../config';
import {
  LayoutDashboard, Wallet, CreditCard, PieChart, MessageSquare,
  User, Settings, LogOut, Bell, Search, Command, TrendingUp, X, Check, Clock,
  LifeBuoy, Sun, Moon, ChevronRight, ArrowRightLeft, ShieldCheck, Trash2
} from 'lucide-react';
import { User as UserType, Notification } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  user: UserType;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isModalOpen?: boolean;
  notifications?: Notification[];
  onMarkRead?: (id: string) => void;
  onClearNotifications?: () => void;
  messageBadge?: number;
  supportBadge?: number;
  notificationsSynced?: boolean;
  logoUrl?: string;
  siteName?: string;
}

const SidebarItem = ({ icon: Icon, label, id, active, onClick, hasSubmenu, badgeCount }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 mb-0.5 ${active
      ? 'bg-blue-600 text-white shadow-sm md:bg-blue-50/80 md:text-blue-700 md:dark:bg-blue-900/20 md:dark:text-blue-400 font-bold'
      : 'text-blue-900/80 hover:bg-blue-100/50 hover:text-blue-900 dark:text-blue-100/70 dark:hover:bg-white/10 dark:hover:text-white md:text-slate-500 md:hover:bg-slate-50/50 md:hover:text-slate-900 md:dark:text-slate-400 md:dark:hover:bg-white/5 md:dark:hover:text-white'
      }`}
  >
    <div className="flex items-center gap-3 relative">
      <div className="relative">
        <Icon size={18} className={active ? 'text-white md:text-blue-600 md:dark:text-blue-400' : ''} />
        {badgeCount > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-red-600 text-white text-[9px] font-black flex items-center justify-center px-1 rounded-full border border-white dark:border-slate-900 shadow-sm animate-in zoom-in">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </div>
      <span className="text-sm">{label}</span>
    </div>
    {hasSubmenu && <span className="text-blue-900/50 dark:text-blue-200/50 md:text-slate-400 text-xs">^</span>}
  </button>
);

const MobileNavItem = ({ icon: Icon, label, id, active, onClick, badgeCount }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`flex-1 flex flex-col items-center justify-center py-0.5 transition-all duration-300 group ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
  >
    <div className={`relative p-0.5 rounded-xl transition-all duration-300 ${active ? '-translate-y-0.5' : ''}`}>
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      {badgeCount > 0 && (
        <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 bg-red-600 text-white text-[8px] font-black flex items-center justify-center px-1 rounded-full border border-white dark:border-slate-950 shadow-sm animate-in zoom-in">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
      {active && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>}
    </div>
    <span className={`text-[8px] font-bold mt-0.5 transition-all duration-300 ${active ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
      {label}
    </span>
  </button>
);

const getTimeAgo = (dateStr: string | number | Date | undefined) => {
  if (!dateStr) return '';
  const str = String(dateStr);
  let date = new Date(str);
  if (isNaN(date.getTime()) || /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(str)) {
    date = new Date(str.replace(' ', 'T') + 'Z');
  }
  if (isNaN(date.getTime())) return 'Just now';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 0) return 'Just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const Layout: React.FC<LayoutProps> = ({
  children, currentPath, onNavigate, onLogout, user, isDarkMode, toggleTheme, isModalOpen,
  notifications = [], onMarkRead, onClearNotifications, messageBadge = 0, supportBadge = 0,
  notificationsSynced = true, logoUrl, siteName = '{APP_CONFIG.BANK_NAME}'
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const defaultLogo = "https://image2url.com/r2/default/images/1769428285590-d43b30ba-a0ba-499f-a066-6411c1619f75.webp";
  const displayLogo = logoUrl && logoUrl.trim() !== '' ? logoUrl : defaultLogo;

  useEffect(() => {
    if (user.avatarUrl) {
      console.debug(`[IDENTITY SYNC] Avatar verified for node: ${user.name.split(' ')[0]}. Status: OK.`);
    }
  }, [user.avatarUrl, user.name]);

  const handleTabClick = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const getHeaderInfo = () => {
    switch (currentPath) {
      case 'dashboard': return { title: `Hey ${user.name.split(' ')[0]}`, subtitle: 'Welcome back' };
      case 'wallet': return { title: 'My Wallet', subtitle: 'Manage your cards and balance' };
      case 'transactions': return { title: 'Transaction History', subtitle: 'View and manage all your financial activity' };
      case 'statistics': return { title: 'Financial Statistics', subtitle: 'Detailed analysis of your financial performance' };
      case 'investments': return { title: 'Investments', subtitle: 'Portfolio & Assets' };
      case 'settings': return { title: 'Settings', subtitle: 'Account & Security' };
      case 'profile': return { title: 'My Profile', subtitle: 'View and edit your personal information' };
      case 'kyc': return { title: 'Verification', subtitle: 'Complete your identity verification' };
      case 'message': return { title: 'AI Assistant', subtitle: 'Your personal financial guide' };
      case 'topup': return { title: 'Top Up', subtitle: 'Add funds to your wallet' };
      case 'request': return { title: 'Request Money', subtitle: 'Create a payment link' };
      case 'transfers': return { title: 'Transfers', subtitle: 'Send money securely' };
      case 'contact-us': return { title: 'Support', subtitle: 'We are here to help' };
      default: return { title: 'Dashboard', subtitle: 'Welcome back' };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="flex min-h-screen bg-background dark:bg-slate-950 font-sans relative">

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed md:sticky top-0 inset-y-0 left-0 z-50 w-72 md:h-screen flex flex-col flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]
        bg-blue-900/20 dark:bg-blue-900/60 backdrop-blur-xl border-r border-blue-100/20 dark:border-white/10 shadow-2xl
        md:bg-white md:dark:bg-slate-900 md:backdrop-blur-none md:border-slate-100 md:dark:border-slate-800 md:shadow-none md:w-64
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 pb-24 md:pb-0
      `}>
        <div className="p-5 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={displayLogo}
              alt={siteName}
              className="w-8 h-8 object-contain rounded-full"
              onError={(e) => { (e.target as HTMLImageElement).src = defaultLogo; }}
            />
            <span className="text-xl font-bold text-blue-900 dark:text-white md:text-slate-900 md:dark:text-white tracking-tight">{siteName}</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-blue-900/70 hover:text-blue-900 dark:text-white/70 dark:hover:text-white bg-blue-100/50 dark:bg-white/10 rounded-full backdrop-blur-sm transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar space-y-3">
          <div>
            <p className="px-3 mb-1 text-[10px] font-bold text-blue-900/40 dark:text-blue-200/60 md:text-slate-400 md:dark:text-slate-500 uppercase tracking-widest">General</p>
            <div className="space-y-0.5">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" active={currentPath === 'dashboard'} onClick={handleTabClick} />
              <SidebarItem icon={Wallet} label="My Wallet" id="wallet" active={currentPath === 'wallet'} onClick={handleTabClick} />
              <SidebarItem icon={CreditCard} label="Transactions" id="transactions" active={currentPath === 'transactions'} onClick={handleTabClick} />

              <div className="hidden md:block">
                <SidebarItem icon={PieChart} label="Statistics" id="statistics" active={currentPath === 'statistics'} onClick={handleTabClick} />
              </div>

              <SidebarItem icon={MessageSquare} label="Message" id="message" active={currentPath === 'message'} onClick={handleTabClick} badgeCount={messageBadge} />
              <SidebarItem icon={User} label="Profile" id="profile" active={currentPath === 'profile'} onClick={handleTabClick} />
              <SidebarItem icon={ShieldCheck} label="Verification" id="kyc" active={currentPath === 'kyc'} onClick={handleTabClick} />
            </div>
          </div>

          <div>
            <p className="px-3 mb-1 text-[10px] font-bold text-blue-900/40 dark:text-blue-200/60 md:text-slate-400 md:dark:text-slate-500 uppercase tracking-widest">Services</p>
            <div className="space-y-0.5">
              <SidebarItem icon={TrendingUp} label="Investments" id="investments" active={currentPath === 'investments'} onClick={handleTabClick} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-blue-100/20 dark:border-white/10 md:border-slate-100 md:dark:border-slate-800 space-y-0.5">
          <SidebarItem icon={Settings} label="Settings" id="settings" active={currentPath === 'settings'} onClick={handleTabClick} />
          <SidebarItem icon={LifeBuoy} label="Support" id="contact-us" active={currentPath === 'contact-us'} onClick={handleTabClick} badgeCount={supportBadge} />

          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900/80 dark:text-blue-100/70 md:text-slate-500 md:dark:text-slate-400">Appearance</span>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode ? 'bg-slate-700' : 'bg-blue-100'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-transform duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-7 bg-slate-900 text-yellow-400' : 'translate-x-1 bg-white text-orange-500'}`}>
                {isDarkMode ? <Moon size={10} /> : <Sun size={10} />}
              </div>
            </button>
          </div>

          <SidebarItem icon={LogOut} label="Logout" id="logout" active={false} onClick={onLogout} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <header className="h-16 md:h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 flex-shrink-0 sticky top-0 z-30">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">{headerInfo.title}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{headerInfo.subtitle}</p>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative hidden md:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 w-64 transition-all dark:text-white dark:placeholder-slate-500"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 shadow-sm">
                <Command size={10} className="text-slate-400 dark:text-slate-300" />
              </div>
            </div>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2 md:p-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative ${isNotificationsOpen ? 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white ring-2 ring-blue-100 dark:ring-blue-900' : ''}`}
              >
                <Bell size={18} className="md:w-5 md:h-5" />
                {notificationsSynced && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold px-0.5 border-2 border-white dark:border-slate-900 shadow-sm z-10 animate-in zoom-in duration-200">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className={`
                    bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right ring-1 ring-black/5
                    fixed right-4 top-[70px] w-72
                    md:absolute md:right-0 md:top-full md:mt-3 md:w-80 md:auto md:top-auto
                  `}>
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">Notifications</h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => { if (onClearNotifications) onClearNotifications(); }}
                        className="text-[10px] text-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-md transition-colors uppercase tracking-tight"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-[320px] md:max-h-[480px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div
                          key={String(notif.id)}
                          onClick={() => {
                            const idStr = String(notif.id);
                            if (idStr.startsWith('temp-')) return;
                            if (onMarkRead && !notif.is_read) onMarkRead(idStr);
                          }}
                          className={`p-3 md:p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group relative ${!notif.is_read ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''} ${String(notif.id).startsWith('temp-') ? 'opacity-70 cursor-wait' : ''}`}
                        >
                          {!notif.is_read && (
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500"></div>
                          )}
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-xs md:text-sm font-bold ${!notif.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{notif.title}</h4>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                              {getTimeAgo(notif.created_at)}
                            </span>
                          </div>
                          <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-2">{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        <Bell size={24} className="mx-auto mb-2 opacity-50" />
                        <p>No notifications yet</p>
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 text-center border-t border-slate-100 dark:border-slate-700">
                    <button onClick={() => onNavigate('transactions')} className="w-full py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors flex items-center justify-center gap-1">
                      View Activity <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              className="flex items-center gap-3 pl-3 md:pl-6 border-l border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsMobileMenuOpen(true);
                } else {
                  onNavigate('profile');
                }
              }}
              role="button"
              aria-label="Go to Profile"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="User"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-600 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                  <User size={18} />
                </div>
              )}
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{user.name}</p>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-tighter">Verified Node</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full px-[10px] md:px-8 pt-[8px] md:pt-5 pb-[90px] md:pb-6 scroll-smooth flex flex-col">
          <div className="max-w-[1600px] mx-auto w-full flex-1">
            {children}
          </div>

          <footer className="hidden md:block w-full max-w-[1600px] mx-auto mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500">
              <div className="flex items-center gap-4">
                <span>&copy; 2024 {siteName}</span>
                <span className="hidden lg:inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <span className="hidden lg:inline-block">Licensed Member FDIC</span>
              </div>
              <div className="flex gap-6 font-medium">
                <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy</a>
                <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms</a>
                <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Security</a>
                <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Contact</a>
              </div>
            </div>
          </footer>
        </main>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[70]">
          <div className="filter drop-shadow-[0_-5px_10px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_-5px_10px_rgba(0,0,0,0.3)]">
            <div
              className="h-[60px] w-full relative transition-colors duration-300"
              style={{
                background: `radial-gradient(circle 28px at 50% -2px, transparent 28px, ${isDarkMode ? '#0f172a' : '#f8f9fd'} 28.5px)`
              }}
            >
              <div className="absolute top-0 left-0 h-[2px] w-[calc(50%-29px)] bg-blue-500/20 dark:bg-blue-400/20 rounded-r-full"></div>
              <div className="absolute top-0 right-0 h-[2px] w-[calc(50%-29px)] bg-blue-500/20 dark:bg-blue-400/20 rounded-l-full"></div>

              <div className="flex items-center justify-between h-full px-2 pt-2">
                <div className="flex-1 flex justify-around pr-8">
                  <MobileNavItem icon={LayoutDashboard} label="Home" id="dashboard" active={currentPath === 'dashboard'} onClick={onNavigate} />
                  <MobileNavItem icon={MessageSquare} label="Chat" id="message" active={currentPath === 'message'} onClick={onNavigate} badgeCount={messageBadge} />
                </div>

                <div className="absolute left-1/2 -top-6 -translate-x-1/2">
                  <button
                    onClick={() => onNavigate('transfers')}
                    className={`w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center transform transition-transform active:scale-95 hover:scale-105 border-[3px] ${isDarkMode ? 'border-slate-900' : 'border-[#f8f9fd]'}`}
                  >
                    <ArrowRightLeft size={20} />
                  </button>
                </div>

                <div className="flex-1 flex justify-around pl-8">
                  <MobileNavItem icon={CreditCard} label="Activity" id="transactions" active={currentPath === 'transactions'} onClick={onNavigate} />
                  <MobileNavItem icon={Wallet} label="Wallet" id="wallet" active={currentPath === 'wallet'} onClick={onNavigate} />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
