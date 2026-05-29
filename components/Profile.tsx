import React, { useState, useEffect } from 'react';
import { User as UserType } from '../types';
import {
  User, Phone, Loader2, Camera, CheckCircle, Save,
  Edit2, AlertTriangle, UserRound, X, Upload,
  BadgeInfo, Contact, Map as MapIcon, Database, RefreshCw
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { mvp, fileToBase64 } from '../services/mvpService';

interface ProfileProps {
  user: UserType;
  onProfileUpdate?: (data: Partial<UserType>) => void;
}

const FormField = ({ label, name, value, onChange, placeholder, type = "text", options, disabled = true }: any) => (
  <div className="space-y-1.5">
    <label className="block text-xs md:text-sm font-black text-slate-400 dark:text-slate-500 ml-1 uppercase tracking-wider" htmlFor={name}>
      {label}
    </label>
    {type === "select" ? (
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 md:py-3.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm md:text-base font-semibold text-slate-900 dark:text-white transition-all appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 md:py-3.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm md:text-base font-semibold text-slate-900 dark:text-white transition-all placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
      />
    )}
  </div>
);

type SectionType = 'personal' | 'contact' | 'address' | null;

export const Profile: React.FC<ProfileProps> = ({ user, onProfileUpdate }) => {
  const [profileInternalId, setProfileInternalId] = useState<string | number | null>(null);
  const [editingSection, setEditingSection] = useState<SectionType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'diag', text: string } | null>(null);

  const [formData, setFormData] = useState({
    firstName: user.name.split(' ')[0] || '',
    lastName: user.name.split(' ').slice(1).join(' ') || '',
    email: user.email,
    phone: '',
    gender: 'Prefer not to say',
    dob: '',
    occupation: '',
    address: '',
    city: '',
    zip: '',
    country: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profiles } = await supabase.from('mvp_profiles').select('*');
        const profile = (profiles || []).find((p: any) => p.user_id === user.id || p.id === user.id);

        if (profile) {
          setProfileInternalId(profile.id);
          const names = (profile.full_name || '').split(' ');
          setFormData(prev => ({
            ...prev,
            firstName: names[0] || prev.firstName,
            lastName: names.slice(1).join(' ') || prev.lastName,
            email: profile.email || prev.email,
            phone: profile.phone || '',
            gender: profile.gender || 'Prefer not to say',
            dob: profile.dob || '',
            occupation: profile.occupation || '',
            address: profile.address || '',
            city: profile.city || '',
            zip: profile.zip || '',
            country: profile.country || ''
          }));
          if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
        }
      } catch (err: any) {
        console.error("DEBUG [PROFILE]: Initial fetch error", err.message);
      }
    };
    fetchData();
  }, [user.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setStatusMsg(null);

    try {
      // Convert to Base64 to send to PHP backend
      const base64Data = await fileToBase64(file);

      let targetId = profileInternalId;
      if (!targetId) {
        const { data: profiles } = await supabase.from('mvp_profiles').select('*');
        const p = (profiles || []).find((x: any) => x.user_id === user.id);
        if (p) {
          targetId = p.id;
          setProfileInternalId(p.id);
        }
      }

      if (targetId) {
        const { error: avErr } = await supabase.from('mvp_profiles').update({ avatar_url: base64Data }).eq('id', targetId);
        if (avErr) throw new Error(avErr.message);
        const newUrl = base64Data;
        setAvatarUrl(newUrl);
        if (onProfileUpdate) onProfileUpdate({ avatarUrl: newUrl });
        setStatusMsg({ type: 'success', text: 'Identity image synchronized with PHP core.' });
      } else {
        throw new Error("IDENTITY_SYNC_FAIL: Internal profile node not recognized.");
      }
    } catch (error: any) {
      setStatusMsg({ type: 'diag', text: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);
    try {
      if (profileInternalId) {
        const { error: remErr } = await supabase.from('mvp_profiles').update({ avatar_url: '' }).eq('id', profileInternalId);
        if (remErr) throw new Error(remErr.message);
      }
      setAvatarUrl('');
      if (onProfileUpdate) onProfileUpdate({ avatarUrl: '' });
      setStatusMsg({ type: 'success', text: 'Profile picture purged.' });
    } catch (err: any) {
      setStatusMsg({ type: 'diag', text: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSectionSave = async (section: SectionType) => {
    setIsLoading(true);
    setStatusMsg(null);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      let targetId = profileInternalId;

      if (!targetId) {
        const { data: profiles } = await supabase.from('mvp_profiles').select('*');
        const p = (profiles || []).find((x: any) => x.user_id === user.id);
        if (p) {
          targetId = p.id;
          setProfileInternalId(p.id);
        }
      }

      if (targetId) {
        const updateData = {
          full_name: fullName,
          phone: formData.phone,
          gender: formData.gender,
          dob: formData.dob,
          occupation: formData.occupation,
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
          country: formData.country
        };

        const { error: profErr } = await supabase.from('mvp_profiles').update(updateData).eq('id', targetId);
        if (!profErr) {
          if (onProfileUpdate) onProfileUpdate({ name: fullName });
          setEditingSection(null);
          setStatusMsg({ type: 'success', text: 'Ledger updated successfully.' });
        } else {
          throw new Error(profErr.message || "Registry update rejected by server.");
        }
      } else {
        throw new Error("IDENTITY_SYNC_FAIL: Node identity lost. Please refresh.");
      }
    } catch (err: any) {
      setStatusMsg({ type: 'diag', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const SectionControls = ({ section }: { section: SectionType }) => {
    const isEditing = editingSection === section;
    return (
      <div className="flex items-center gap-3">
        {isEditing ? (
          <>
            <button onClick={() => setEditingSection(null)} className="text-xs md:text-sm font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider transition-colors px-3 py-2">Cancel</button>
            <button onClick={() => handleSectionSave(section)} disabled={isLoading} className="flex items-center gap-2 text-xs md:text-sm font-black text-blue-600 hover:text-blue-700 uppercase tracking-wider transition-all px-3 py-2">{isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}Update</button>
          </>
        ) : (
          <button onClick={() => setEditingSection(section)} className="flex items-center gap-2 text-xs md:text-sm font-black text-slate-400 hover:text-blue-600 uppercase tracking-wider transition-all px-3 py-2"><Edit2 size={16} />Edit</button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full animate-fade-in pb-8">
      {statusMsg?.type === 'diag' && (
        <div className="mb-6 bg-red-600 text-white rounded-xl p-4 shadow-xl border border-red-500 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="shrink-0 mt-1" size={20} />
            <div className="flex-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">System Diagnostic Fault</h4>
              <p className="text-sm font-bold leading-relaxed mb-3">{statusMsg.text}</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-black uppercase transition-all"><RefreshCw size={14} /> Force Resync</button>
                <button onClick={() => setStatusMsg(null)} className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-black uppercase transition-all">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {statusMsg && statusMsg.type !== 'diag' && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-2xl animate-in slide-in-from-top-4 ${statusMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {statusMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
          {statusMsg.text}
          <button onClick={() => setStatusMsg(null)} className="ml-2 opacity-70 hover:opacity-100"><X size={12} /></button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 md:p-10 mb-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                  <UserRound size={40} className="md:w-12 md:h-12" />
                  <span className="text-xs font-black mt-2 uppercase tracking-wider">Root</span>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 size={24} className="text-white animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="text-center md:text-left space-y-3 flex-1">
            <h3 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Platform Identity</h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95">
                <Upload size={16} />
                Change Photo
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
              </label>
              <button onClick={handleRemoveAvatar} disabled={isUploading || !avatarUrl} className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 md:px-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3"><BadgeInfo className="text-blue-600 w-5 h-5 md:w-6 md:h-6" /><h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">Personal Details</h3></div>
            <SectionControls section="personal" />
          </div>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <FormField label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} disabled={editingSection !== 'personal'} placeholder="First Name" />
              <FormField label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} disabled={editingSection !== 'personal'} placeholder="Last Name" />
              <FormField label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} disabled={editingSection !== 'personal'} type="select" options={["Male", "Female", "Non-binary", "Other", "Prefer not to say"]} />
              <FormField label="Date of Birth" name="dob" value={formData.dob} onChange={handleInputChange} disabled={editingSection !== 'personal'} type="date" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 md:px-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3"><Contact className="text-blue-600 w-5 h-5 md:w-6 md:h-6" /><h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">Connectivity</h3></div>
            <SectionControls section="contact" />
          </div>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <FormField label="Email Terminal" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" type="email" disabled={true} />
              <FormField label="Secure Phone" name="phone" value={formData.phone} onChange={handleInputChange} disabled={editingSection !== 'contact'} placeholder="+1 (555) 000-0000" type="tel" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};