
import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Globe, Shield, Smartphone, ChevronRight, LogOut, FileText, HelpCircle, X, Loader2, CheckCircle, AlertCircle, ArrowLeft, Save, KeyRound, Mail } from 'lucide-react';
import { User as UserType } from '../types';
import { supabase } from '../services/supabase';
import { mvp } from '../services/mvpService';
import { getEmailTemplate } from '../utils/emailTemplates';

interface SettingsProps {
    user: UserType;
    settings: {
        emailNotifs: boolean;
        pushNotifs: boolean;
        biometric: boolean;
        twoFactor: boolean;
    };
    onUpdateSettings: (newSettings: any) => void;
    onLogout: () => void;
}

const SettingItem = ({ icon: Icon, label, subLabel, onClick, toggleState, hasToggle, colorClass = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" }: any) => (
    <div
        onClick={onClick}
        className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
    >
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                <Icon size={20} />
            </div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{label}</h4>
                {subLabel && <p className="text-xs text-slate-500 dark:text-slate-400">{subLabel}</p>}
            </div>
        </div>

        {hasToggle ? (
            <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${toggleState ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${toggleState ? 'left-6' : 'left-1'}`}></div>
            </div>
        ) : (
            <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
        )}
    </div>
);

const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="px-4 pb-2 pt-6 text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
);

const EditProfilePage = ({ user, settings, onUpdateSettings, onBack }: any) => {
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [profileId, setProfileId] = useState<number | null>(null);

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        language: 'English (US)'
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isPinLoading, setIsPinLoading] = useState(false);
    const [pinSuccess, setPinSuccess] = useState<string | null>(null);
    const [pinError, setPinError] = useState<string | null>(null);
    const [pinData, setPinData] = useState({
        oldPin: '',
        newPin: '',
        confirmPin: ''
    });

    const [forgotStep, setForgotStep] = useState<'none' | 'confirm_email' | 'verify_otp'>('none');
    const [otp, setOtp] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: profiles } = await supabase.from('mvp_profiles').select('*');
                const profile = (profiles || []).find((p: any) => p.user_id === user.id);

                if (profile) {
                    setProfileId(profile.id); // Save the database primary key for updates

                    const names = (profile.full_name || '').split(' ');

                    let currentSettings: any = {};
                    try {
                        currentSettings = typeof profile.settings === 'string'
                            ? JSON.parse(profile.settings)
                            : profile.settings || {};
                    } catch (e) { }

                    setProfileData({
                        firstName: names[0] || '',
                        lastName: names.slice(1).join(' ') || '',
                        email: profile.email || user.email || '',
                        phone: profile.phone || '',
                        country: profile.country || 'United States',
                        language: currentSettings.language || 'English (US)'
                    });
                }
            } catch (err) { }
        };
        fetchProfile();
    }, [user.id]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileId) {
            setProfileError("Profile record not found. Cannot update.");
            return;
        }

        setIsProfileLoading(true);
        setProfileError(null);
        setProfileSuccess(null);

        try {
            const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
            const newSettings = { ...settings, language: profileData.language };

            // Use profileId (database primary key) instead of user.id (UUID)
            const { error: profErr } = await supabase.from('mvp_profiles').update({
                full_name: fullName,
                phone: profileData.phone,
                country: profileData.country,
                settings: JSON.stringify(newSettings)
            }).eq('id', profileId);

            if (profErr) throw new Error(profErr.message || "Update failed on server.");

            onUpdateSettings({ language: profileData.language });

            await supabase.from('mvp_notifications').insert([{
                user_id: user.id,
                title: 'Profile Updated',
                message: 'Your personal information has been updated successfully.',
                type: 'info',
                is_read: false
            }]);

            // Send Account Update Email
            if (profileData.email) {
                const { subject, content } = getEmailTemplate('account', {
                    user_name: fullName,
                    update_type: 'Profile Information Updated'
                });
                mvp.sendEmail(profileData.email, subject, content, 'Account Update').catch(console.error);
            }

            setProfileSuccess('Profile updated successfully.');
            setTimeout(() => setProfileSuccess(null), 3000);
        } catch (err: any) {
            setProfileError(err.message || 'Failed to update profile.');
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }
        setIsPasswordLoading(true);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: profileData.email || user.email,
                password: passwordData.oldPassword
            });
            if (signInError) throw new Error("Incorrect old password.");

            const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
            if (error) throw error;

            await supabase.from('mvp_notifications').insert([{
                user_id: user.id,
                title: 'Password Changed',
                message: 'Your account password has been updated securely.',
                type: 'security',
                is_read: false
            }]);

            // Send Password Changed Email
            const email = profileData.email || user.email;
            if (email) {
                const fullName = `${profileData.firstName} ${profileData.lastName}`.trim() || 'Client';
                const { subject, content } = getEmailTemplate('account', {
                    user_name: fullName,
                    update_type: 'Password Changed'
                });
                mvp.sendEmail(email, subject, content, 'Security').catch(console.error);
            }

            setPasswordSuccess('Password changed successfully.');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setPasswordSuccess(null), 4000);
        } catch (err: any) {
            setPasswordError(err.message);
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleUpdatePin = async (e: React.FormEvent) => {
        e.preventDefault();
        setPinError(null);
        setPinSuccess(null);

        if (pinData.newPin.length !== 4 || isNaN(Number(pinData.newPin))) {
            setPinError("PIN must be exactly 4 digits.");
            return;
        }

        if (pinData.newPin !== pinData.confirmPin) {
            setPinError("New PINs do not match.");
            return;
        }

        // If user already has a PIN, verify old PIN matches
        if (user.pin && user.pin !== pinData.oldPin) {
            setPinError("Incorrect old PIN.");
            return;
        }

        setIsPinLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                data: { pin: pinData.newPin }
            });

            if (error) throw error;

            await supabase.from('mvp_notifications').insert([{
                user_id: user.id,
                title: 'Security PIN Updated',
                message: 'Your transaction PIN has been updated.',
                type: 'security',
                is_read: false
            }]);

            setPinSuccess('PIN updated successfully.');
            setPinData({ oldPin: '', newPin: '', confirmPin: '' });
            setTimeout(() => setPinSuccess(null), 3000);

            // Optimistic update of local user object might be needed or handled by parent re-render
            // Ideally onUpdateSettings should handle this if it refreshed full profile, but here we just updated auth metadata.
        } catch (err: any) {
            setPinError(err.message || "Failed to update PIN.");
        } finally {
            setIsPinLoading(false);
        }
    };

    const handleSendResetCode = async () => {
        setIsPasswordLoading(true);
        setPasswordError(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(profileData.email || user.email);
            if (error) throw error;
            setPasswordSuccess(`Reset code sent to ${profileData.email || user.email}`);
            setForgotStep('verify_otp');
        } catch (err: any) {
            setPasswordError(err.message);
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleResetPasswordWithOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setIsPasswordLoading(true);
        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email: profileData.email || user.email,
                token: otp,
                type: 'recovery'
            });
            if (verifyError) throw verifyError;
            const { error: updateError } = await supabase.auth.updateUser({ password: passwordData.newPassword });
            if (updateError) throw updateError;
            await supabase.from('mvp_notifications').insert([{
                user_id: user.id,
                title: 'Password Reset',
                message: 'Your password was reset successfully.',
                type: 'security',
                is_read: false
            }]);
            setPasswordSuccess('Password successfully reset!');
            setForgotStep('none');
        } catch (err: any) {
            setPasswordError(err.message);
        } finally {
            setIsPasswordLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-2 sticky top-0 bg-[#f8f9fd] dark:bg-slate-950 z-10 py-2 md:py-4">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
            </div>
            <div className="space-y-2.5 pb-4">
                {forgotStep === 'none' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 md:p-6 shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><User size={18} className="text-blue-600" /> Personal Information</h3>
                        {profileSuccess && <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 font-bold text-sm">✓ {profileSuccess}</div>}
                        {profileError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 font-bold text-sm">! {profileError}</div>}
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input value={profileData.firstName} onChange={e => setProfileData({ ...profileData, firstName: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white" placeholder="First Name" />
                                <input value={profileData.lastName} onChange={e => setProfileData({ ...profileData, lastName: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white" placeholder="Last Name" />
                            </div>
                            <input value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white" placeholder="Phone Number" />
                            <input value={profileData.country} onChange={e => setProfileData({ ...profileData, country: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white" placeholder="Country" />
                            <button type="submit" disabled={isProfileLoading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                                {isProfileLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Profile
                            </button>
                        </form>
                    </div>
                )}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 md:p-6 shadow-sm">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Lock size={18} className="text-orange-600" /> Security</h3>
                    {passwordError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">! {passwordError}</div>}
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <input type="password" value={passwordData.oldPassword} onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white" placeholder="Old Password" />
                        <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white" placeholder="New Password" />
                        <button type="submit" disabled={isPasswordLoading} className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold">Update Password</button>
                    </form>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 md:p-6 shadow-sm">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><KeyRound size={18} className="text-emerald-600" /> Transaction PIN</h3>
                    {pinSuccess && <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 font-bold text-sm">✓ {pinSuccess}</div>}
                    {pinError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">! {pinError}</div>}
                    <form onSubmit={handleUpdatePin} className="space-y-4">
                        {user.pin && (
                            <input
                                type="password"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                maxLength={4}
                                value={pinData.oldPin}
                                onChange={e => setPinData({ ...pinData, oldPin: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) })}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white"
                                placeholder="Current PIN"
                            />
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="password"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                maxLength={4}
                                value={pinData.newPin}
                                onChange={e => setPinData({ ...pinData, newPin: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) })}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white"
                                placeholder="New 4-Digit PIN"
                            />
                            <input
                                type="password"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                maxLength={4}
                                value={pinData.confirmPin}
                                onChange={e => setPinData({ ...pinData, confirmPin: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) })}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white"
                                placeholder="Confirm PIN"
                            />
                        </div>
                        <button type="submit" disabled={isPinLoading} className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold">
                            {isPinLoading ? 'Updating...' : 'Update PIN'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const Settings: React.FC<SettingsProps> = ({ user, settings, onUpdateSettings, onLogout }) => {
    const [view, setView] = useState<'main' | 'profile'>('main');

    const toggle = (key: string) => {
        const updated = { [key]: !((settings as any)[key]) };
        onUpdateSettings(updated);
        // Find profile ID to update settings
        supabase.from('mvp_profiles').select('id,settings').then(({ data: profiles }) => {
            const profile = (profiles || []).find((p: any) => p.user_id === user.id);
            if (profile) {
                let existingSettings = {};
                try {
                    existingSettings = typeof profile.settings === 'string' ? JSON.parse(profile.settings) : profile.settings || {};
                } catch (e) { }
                supabase.from('mvp_profiles').update({ settings: JSON.stringify({ ...existingSettings, ...updated }) }).eq('id', profile.id);
            }
        });
    };

    if (view === 'profile') {
        return <EditProfilePage user={user} settings={settings} onUpdateSettings={onUpdateSettings} onBack={() => setView('main')} />;
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in relative">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                <SectionHeader title="Account" />
                <SettingItem icon={User} label="Personal Information" subLabel="Profile, Language & Security" onClick={() => setView('profile')} colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" />
                <SectionHeader title="Security" />
                <SettingItem icon={Shield} label="Two-Factor Authentication" hasToggle={true} toggleState={settings.twoFactor} onClick={() => toggle('twoFactor')} colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" />
                <SettingItem icon={Smartphone} label="Biometric ID" hasToggle={true} toggleState={settings.biometric} onClick={() => toggle('biometric')} colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" />
                <div className="p-4 mt-2">
                    <button onClick={onLogout} className="w-full py-3 flex items-center justify-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors"><LogOut size={18} /> Sign Out</button>
                </div>
            </div>
        </div>
    );
};
