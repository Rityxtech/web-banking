
import React from 'react';
import { APP_CONFIG } from '../config';
import { ArrowLeft, Shield, Lock, FileText, CheckCircle } from 'lucide-react';

const PolicySection = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div>
        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{title}</h4>
        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {children}
        </div>
    </div>
);

export const PrivacyPolicy = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 animate-fade-in pb-20 md:pb-0">
        <div className="p-3 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 flex items-center gap-3 shadow-sm">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h2 className="text-base md:text-xl font-bold text-slate-900 dark:text-white">Privacy Policy</h2>
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">Effective Date: June 1, 2024</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100 dark:border-slate-700 space-y-8">
                
                <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 dark:border-slate-700 pb-8">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">We value your privacy</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {APP_CONFIG.BANK_NAME} is committed to maintaining the confidentiality, integrity, and security of your personal information. This Privacy Policy describes how we collect, use, and share your personal data.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <PolicySection title="1. Information We Collect">
                        <p>We collect information you provide directly to us, such as when you create an account, make a transaction, or contact customer support. This may include:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                            <li>Identity Data: Name, date of birth, government ID numbers.</li>
                            <li>Contact Data: Email address, phone number, mailing address.</li>
                            <li>Financial Data: Bank account numbers, transaction history, card details.</li>
                            <li>Device Data: IP address, device type, operating system version.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="2. How We Use Your Information">
                        <p>We use your information to provide, maintain, and improve our services, including:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                            <li>Processing transactions and sending related notifications.</li>
                            <li>Verifying your identity to prevent fraud and comply with laws (KYC/AML).</li>
                            <li>Providing customer support and responding to inquiries.</li>
                            <li>Personalizing your experience and offering relevant products.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="3. Information Sharing">
                        <p>We do not sell your personal information. We may share your data with:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                            <li>Service providers who perform services on our behalf (e.g., payment processing, data analysis).</li>
                            <li>Law enforcement or government authorities when required by law.</li>
                            <li>Professional advisors such as auditors and lawyers.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="4. Data Security">
                        <p>We use administrative, technical, and physical security measures to help protect your personal information. These measures include encryption, firewalls, and secure socket layer (SSL) technology. However, no data transmission over the Internet can be guaranteed to be 100% secure.</p>
                    </PolicySection>

                    <PolicySection title="5. Your Choices">
                        <p>You have choices regarding your personal information:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                            <li>Account Information: You can update your profile information within the app settings.</li>
                            <li>Communications: You can opt-out of promotional emails, but we will still send you non-promotional messages (e.g., transaction alerts).</li>
                            <li>Data Deletion: You may request the deletion of your account by contacting support.</li>
                        </ul>
                    </PolicySection>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Have more questions?</h4>
                        <p className="text-xs text-slate-500 mt-1">Our support team is available 24/7 to assist you.</p>
                    </div>
                    <button onClick={onBack} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        Close
                    </button>
                </div>

            </div>
        </div>
    </div>
  );
};
