
import React, { useState } from 'react';
import { ArrowLeft, FileText, Camera, LifeBuoy, MapPin, Repeat, CreditCard, Download, Smartphone, CheckCircle } from 'lucide-react';

interface MoreActionsProps {
  onBack: () => void;
  onNavigate: (tab: string) => void;
}

const ALL_ACTIONS = [
  { id: 'check', label: 'Check Deposit', icon: Camera, color: 'text-blue-600 bg-blue-50', link: 'check-deposit' },
  { id: 'statements', label: 'Statements', icon: FileText, color: 'text-purple-600 bg-purple-50', link: 'statements' },
  { id: 'atm', label: 'Find ATM', icon: MapPin, color: 'text-emerald-600 bg-emerald-50', link: 'atm-locator' },
  { id: 'recurring', label: 'Recurring', icon: Repeat, color: 'text-indigo-600 bg-indigo-50', link: 'recurring' },
  { id: 'cards', label: 'Manage Cards', icon: CreditCard, color: 'text-pink-600 bg-pink-50', link: 'wallet' },
  { id: 'support', label: 'Help Center', icon: LifeBuoy, color: 'text-cyan-600 bg-cyan-50', link: 'help-center' },
  { id: 'contact', label: 'Contact Us', icon: Smartphone, color: 'text-teal-600 bg-teal-50', link: 'contact-us' },
];

export const MoreActions: React.FC<MoreActionsProps> = ({ onBack, onNavigate }) => {
  const [downloadMsg, setDownloadMsg] = useState(false);
  
  const handleActionClick = (actionId: string, link?: string) => {
    if (link) {
      onNavigate(link);
    } else {
      console.log(`Clicked action: ${actionId}`);
    }
  };

  return (
    <div className="min-h-full flex flex-col animate-fade-in">
        <div className="bg-white dark:bg-slate-800 w-full rounded-none md:rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full md:h-auto md:max-h-[calc(100vh-100px)]">
            
            {/* Header */}
            <div className="p-3 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 flex items-center gap-3">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-base md:text-xl font-bold text-slate-900 dark:text-white">More Actions</h2>
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">All Services</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 pb-4 md:pb-6">
                <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                    
                    <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-x-2 gap-y-6 md:gap-6">
                            {ALL_ACTIONS.map(action => (
                                <button 
                                    key={action.id}
                                    onClick={() => handleActionClick(action.id, action.link)}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${action.color}`}>
                                        <action.icon size={20} className="md:w-6 md:h-6" />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-medium text-slate-600 dark:text-slate-300 text-center leading-tight max-w-[80px]">
                                        {action.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Info Box */}
                    <div 
                        onClick={() => setDownloadMsg(true)}
                        className={`bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-xl text-white shadow-lg transition-all cursor-pointer hover:shadow-xl active:scale-[0.98] ${downloadMsg ? 'from-slate-800 to-slate-900' : ''}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
                                {downloadMsg ? <CheckCircle size={20} className="text-emerald-400" /> : <Download size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">{downloadMsg ? 'Coming Soon!' : 'Download App'}</h4>
                                <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                                    {downloadMsg 
                                        ? 'We are working hard to bring you the best mobile experience. Stay tuned!' 
                                        : 'Get the full experience on iOS and Android for biometric login and mobile checks.'}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
};
