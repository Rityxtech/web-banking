import React, { useState, useEffect } from 'react';
import { User as UserType } from '../types';
import {
  User, Phone, Loader2, Camera, CheckCircle, Save,
  Edit2, AlertTriangle, UserRound, X, Upload,
  BadgeInfo, Contact, Map as MapIcon, Database, RefreshCw
} from 'lucide-react';
import { mvp, fileToBase64 } from '../services/mvpService';

interface ProfileProps {
  user: UserType;
  onProfileUpdate?: (data: Partial<UserType>) => void;
}

const FormField = ({ label, name, value, onChange, placeholder, type = "text", options, disabled = true }: any) => (
  <div className="space-y-0.5">
    <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 ml-0.5 uppercase tracking-tighter" htmlFor={name}>
      {label}
    </label>
    {type === "select" ? (
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[11px] font-semibold text-slate-900 dark:text-white transition-all appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
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
        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[11px] font-semibold text-slate-900 dark:text-white transition-all placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
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
        const profiles = await mvp.read('profiles');
        const profile = profiles.find((p: any) => p.user_id === user.id || p.id === user.id);

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
        const profiles = await mvp.read('profiles');
        const p = profiles.find((x: any) => x.user_id === user.id);
        if (p) {
          targetId = p.id;
          setProfileInternalId(p.id);
        }
      }

      if (targetId) {
        // Sending raw base64 to PHP update operation
        // PHP should handle this by saving the file and updating the column
        const res = await mvp.update('profiles', targetId, { avatar_url: base64Data });

        // If PHP backend returns the new public URL in the response
        const newUrl = res.avatar_url || base64Data;
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
        await mvp.update('profiles', profileInternalId, { avatar_url: '' });
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
        const profiles = await mvp.read('profiles');
        const p = profiles.find((x: any) => x.user_id === user.id);
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

        const res = await mvp.update('profiles', targetId, updateData);

        if (res.success || res.id) {
          if (onProfileUpdate) onProfileUpdate({ name: fullName });
          setEditingSection(null);
          setStatusMsg({ type: 'success', text: 'Ledger updated successfully.' });
        } else {
          throw new Error(res.error || "Registry update rejected by server.");
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
      <div className="flex items-center gap-1.5">
        {isEditing ? (
          <>
            <button onClick={() => setEditingSection(null)} className="text-[8px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-tighter transition-colors">Cancel</button>
            <button onClick={() => handleSectionSave(section)} disabled={isLoading} className="flex items-center gap-1 text-[8px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-tighter transition-all">{isLoading ? <Loader2 size={8} className="animate-spin" /> : <Save size={8} />}Update</button>
          </>
        ) : (
          <button onClick={() => setEditingSection(section)} className="flex items-center gap-1 text-[8px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-tighter transition-all"><Edit2 size={8} />Edit</button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in pb-[15px]">
      {statusMsg?.type === 'diag' && (
        <div className="mb-4 bg-red-600 text-white rounded-xl p-4 shadow-xl border border-red-500 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="shrink-0 mt-1" size={20} />
            <div className="flex-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">System Diagnostic Fault</h4>
              <p className="text-xs font-bold leading-relaxed mb-3">{statusMsg.text}</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase transition-all"><RefreshCw size={12} /> Force Resync</button>
                <button onClick={() => setStatusMsg(null)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase transition-all">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {statusMsg && statusMsg.type !== 'diag' && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold shadow-2xl animate-in slide-in-from-top-4 ${statusMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {statusMsg.type === 'success' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
          {statusMsg.text}
          <button onClick={() => setStatusMsg(null)} className="ml-1 opacity-70 hover:opacity-100"><X size={10} /></button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-3 md:p-4 mb-2.5 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-3 relative z-10">
          <div className="relative group">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-slate-300 dark:text-slate-600">
                  <UserRound size={20} />
                  <span className="text-[5px] font-black mt-0.5 uppercase tracking-tighter">Root</span>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 size={14} className="text-white animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="text-center md:text-left space-y-1 flex-1">
            <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform Identity</h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5">
              <label className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[8px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-95">
                <Upload size={8} />
                Change
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
              </label>
              <button onClick={handleRemoveAvatar} disabled={isUploading || !avatarUrl} className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded text-[8px] font-bold transition-all disabled:opacity-50">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-3 py-1.5 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5"><BadgeInfo className="text-blue-600" size={10} /><h3 className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Personal Details</h3></div>
            <SectionControls section="personal" />
          </div>
          <div className="p-3 space-y-2.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <FormField label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} disabled={editingSection !== 'personal'} placeholder="First Name" />
              <FormField label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} disabled={editingSection !== 'personal'} placeholder="Last Name" />
              <FormField label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} disabled={editingSection !== 'personal'} type="select" options={["Male", "Female", "Non-binary", "Other", "Prefer not to say"]} />
              <FormField label="Date of Birth" name="dob" value={formData.dob} onChange={handleInputChange} disabled={editingSection !== 'personal'} type="date" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-3 py-1.5 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5"><Contact className="text-blue-600" size={10} /><h3 className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Connectivity</h3></div>
            <SectionControls section="contact" />
          </div>
          <div className="p-3 space-y-2.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <FormField label="Email Terminal" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" type="email" disabled={true} />
              <FormField label="Secure Phone" name="phone" value={formData.phone} onChange={handleInputChange} disabled={editingSection !== 'contact'} placeholder="+1 (555) 000-0000" type="tel" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};