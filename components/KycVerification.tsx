
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Upload, Camera, FileText, CheckCircle, AlertCircle, Clock, ChevronRight, Smartphone, Loader2, X, RefreshCw, AlertTriangle, Lock, TrendingUp, BarChart3 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { mvp, fileToBase64 } from '../services/mvpService';

const CameraCapture = ({ onCapture, onClose }: { onCapture: (file: File) => void, onClose: () => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let localStream: MediaStream | null = null;
        const startCamera = async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError("Camera API not supported."); return;
            }
            try {
                localStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
                });
                if (videoRef.current && localStream) {
                    videoRef.current.srcObject = localStream;
                    await videoRef.current.play();
                }
            } catch (err: any) {
                setError("Camera access denied. Please enable permissions.");
            }
        };
        startCamera();
        return () => { if (localStream) localStream.getTracks().forEach(track => track.stop()); };
    }, []);

    const capture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
                        onCapture(file);
                    }
                }, 'image/jpeg', 0.8);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-2.5 animate-in fade-in duration-200">
            {error ? (
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl text-center max-w-xs">
                    <AlertCircle size={32} className="text-red-500 mx-auto mb-2.5" />
                    <p className="text-slate-900 dark:text-white font-bold text-sm">{error}</p>
                    <button onClick={onClose} className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold">Close</button>
                </div>
            ) : (
                <div className="relative w-full max-w-md bg-black rounded-2xl overflow-hidden shadow-2xl">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-[50vh] object-cover transform -scale-x-100" />
                    <canvas ref={canvasRef} className="hidden" />
                    <button onClick={onClose} className="absolute top-2.5 right-2.5 p-2 bg-black/40 text-white rounded-full"><X size={20} /></button>
                    <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-center">
                        <button onClick={capture} className="w-14 h-14 bg-white rounded-full border-4 border-slate-300 shadow-lg active:scale-90 transition-transform" />
                    </div>
                </div>
            )}
        </div>
    );
};

const KycStep = ({ title, description, limits, icon: Icon, status, onFileSelect, uploading, type, onOpenCamera, disabled }: any) => {
    const isCompleted = status === 'verified';
    const isPending = status === 'pending';
    const isRejected = status === 'rejected';
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        // Strictly block click if disabled, completed, or pending review
        if (disabled || isCompleted || isPending) return;
        if (type === 'selfie' && onOpenCamera) onOpenCamera();
        else fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) onFileSelect(e.target.files[0]);
    };

    return (
        <div className={`p-2.5 md:p-6 rounded-xl md:rounded-2xl border transition-colors duration-300 relative overflow-hidden transform-gpu ${disabled ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed' :
            isCompleted ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900 dark:border-emerald-600' :
                isRejected ? 'bg-red-50/50 border-red-100 dark:bg-red-900 dark:border-red-600' :
                    'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'
            }`}>
            <div className="flex items-start justify-between mb-2.5">
                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${disabled ? 'bg-slate-200 text-slate-400 dark:bg-slate-800' :
                    isCompleted ? 'bg-emerald-100 text-emerald-600' :
                        isRejected ? 'bg-red-100 text-red-600' :
                            isPending ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-50 text-blue-600 dark:bg-slate-700'
                    }`}>
                    {disabled ? <Lock size={16} /> : <Icon size={16} className="md:w-6 md:h-6" />}
                </div>
                {isCompleted && <span className="text-[8px] md:text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full uppercase">Verified</span>}
                {isPending && <span className="text-[8px] md:text-[10px] font-bold bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full uppercase">Reviewing</span>}
                {isRejected && <span className="text-[8px] md:text-[10px] font-bold bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full uppercase">Rejected</span>}
            </div>

            <div className="mb-2.5">
                <h3 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-0.5">{title}</h3>
                <p className="text-[9px] md:text-xs text-slate-500 leading-tight">{description}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-[8px] md:text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-md w-fit">
                    <TrendingUp size={10} />
                    {limits}
                </div>
            </div>

            {/* Hide upload button if completed or disabled */}
            {!isCompleted && !disabled && (
                <>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                    <div className="space-y-1.5">
                        <button
                            onClick={handleClick}
                            disabled={uploading || isPending}
                            className={`w-full py-2 border-2 border-dashed rounded-lg md:rounded-xl flex items-center justify-center gap-1.5 text-[10px] md:text-xs font-bold transition-all ${isRejected ? 'border-red-200 bg-red-50/20 text-red-600 hover:border-red-400 cursor-pointer' :
                                isPending ? 'border-amber-200 bg-amber-50/50 text-amber-600 cursor-not-allowed opacity-80' :
                                    'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-500 hover:text-blue-600 cursor-pointer'
                                }`}
                        >
                            {uploading ? <Loader2 size={12} className="animate-spin" /> : (isPending || isRejected) ? <RefreshCw size={12} /> : <Upload size={12} />}
                            {uploading ? 'Wait' : isRejected ? 'Re-upload' : isPending ? 'Processing' : 'Upload'}
                        </button>
                        {isRejected && (
                            <div className="flex items-center gap-1 p-1 bg-red-50 dark:bg-red-950 rounded-md text-[8px] text-red-600 dark:text-red-300 font-bold uppercase">
                                <AlertTriangle size={8} /> Needs Clarity
                            </div>
                        )}
                    </div>
                </>
            )}

            {isCompleted && (
                <div className="w-full py-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg flex items-center justify-center text-[10px] md:text-xs font-bold text-emerald-600 dark:text-emerald-300 italic gap-1.5 cursor-not-allowed border border-emerald-100 dark:border-emerald-700">
                    <CheckCircle size={12} /> Verified
                </div>
            )}

            {disabled && (
                <div className="w-full py-2 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] md:text-xs font-bold text-slate-500 gap-1.5">
                    <Lock size={12} /> Locked
                </div>
            )}
        </div>
    );
};

export const KycVerification = ({
    userId,
    kycLevel = 0,
    onNavigate,
    dailyUsage = 0,
    weeklyUsage = 0,
    monthlyUsage = 0,
    dailyLimit = 0,
    weeklyLimit = 0,
    monthlyLimit = 0
}: {
    userId: string,
    kycLevel?: number,
    onNavigate?: (tab: string) => void,
    dailyUsage?: number,
    weeklyUsage?: number,
    monthlyUsage?: number,
    dailyLimit?: number,
    weeklyLimit?: number,
    monthlyLimit?: number
}) => {
    const [statuses, setStatuses] = useState({ governmentId: 'required', selfie: 'required', proofAddress: 'required' });
    const [uploadingType, setUploadingType] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;
        const fetchStatus = async () => {
            // Use Supabase directly — MVP API is broken (404)
            const { data: profiles } = await supabase
                .from('mvp_profiles')
                .select('user_id, settings')
                .eq('user_id', userId);
            const profile = profiles?.[0];
            if (profile && profile.settings) {
                const settings = typeof profile.settings === 'string' ? JSON.parse(profile.settings) : profile.settings;
                if (settings.kycStatus) setStatuses(prev => ({ ...prev, ...settings.kycStatus }));
            }
        };
        fetchStatus();
    }, [userId]);

    const handleUpload = async (file: File, type: string) => {
        if (!userId) return;
        setUploadingType(type); setErrorMsg(null);
        try {
            const base64Data = await fileToBase64(file);
            // Use Supabase directly — MVP API is broken (404)
            const { data: profiles } = await supabase
                .from('mvp_profiles')
                .select('id, user_id, settings, kyc_documents')
                .eq('user_id', userId);
            const profile = profiles?.[0];
            if (!profile) throw new Error("Profile node not found.");

            const currentSettings = typeof profile.settings === 'string' ? JSON.parse(profile.settings) : (profile.settings || {});
            const currentDocs = typeof profile.kyc_documents === 'string' ? JSON.parse(profile.kyc_documents || '{}') : (profile.kyc_documents || {});

            const newDocs = { ...currentDocs, [type]: base64Data };
            const newSettings = { ...currentSettings, kycStatus: { ...(currentSettings.kycStatus || {}), [type]: 'pending' } };

            const { error: updateErr } = await supabase
                .from('mvp_profiles')
                .update({
                    settings: JSON.stringify(newSettings),
                    kyc_documents: JSON.stringify(newDocs)
                })
                .eq('id', profile.id);
            if (updateErr) throw new Error(updateErr.message);

            setStatuses(prev => ({ ...prev, [type]: 'pending' }));
        } catch (error: any) {
            setErrorMsg("Transmission failed: " + error.message);
        } finally { setUploadingType(null); }
    };

    const getStatusBadge = () => {
        if (kycLevel === 0) return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Unverified</span>;
        if (kycLevel === 1) return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Tier 1</span>;
        if (kycLevel === 2) return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Tier 2</span>;
        return null;
    };

    const getLimitLabel = () => {
        if (kycLevel === 0) return "$0.00 Global Limit";
        if (kycLevel === 1) return "$1,000 Daily Limit";
        if (kycLevel === 2) {
            if (dailyLimit !== Infinity) return `$${dailyLimit.toLocaleString()} Daily Limit`;
            if (weeklyLimit !== Infinity) return `$${weeklyLimit.toLocaleString()} Weekly Limit`;
            if (monthlyLimit !== Infinity) return `$${monthlyLimit.toLocaleString()} Monthly Limit`;
            return "Unlimited Access";
        }
        return "";
    };

    const dailyPct = dailyLimit > 0 && dailyLimit !== Infinity ? Math.min((dailyUsage / dailyLimit) * 100, 100) : (dailyUsage > 0 && dailyLimit !== Infinity ? 100 : 0);
    const weeklyPct = weeklyLimit > 0 ? Math.min((weeklyUsage / weeklyLimit) * 100, 100) : (weeklyUsage > 0 ? 100 : 0);
    const monthlyPct = monthlyLimit > 0 ? Math.min((monthlyUsage / monthlyLimit) * 100, 100) : (monthlyUsage > 0 ? 100 : 0);

    const effectiveStatuses = {
        governmentId: kycLevel >= 1 ? 'verified' : statuses.governmentId,
        selfie: kycLevel >= 1 ? 'verified' : statuses.selfie,
        proofAddress: kycLevel >= 2 ? 'verified' : statuses.proofAddress,
    };

    return (
        <div className="w-full space-y-2.5 md:space-y-6 pb-5 md:pb-[20px]">
            {showCamera && <CameraCapture onCapture={(f) => { setShowCamera(false); handleUpload(f, 'selfie'); }} onClose={() => setShowCamera(false)} />}

            <div className="bg-white dark:bg-slate-800 p-2.5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4 md:mb-8">
                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-sm ${kycLevel > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        <ShieldCheck size={20} className="md:w-7 md:h-7" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white">Identity Verification</h1>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5">
                            {getStatusBadge()}
                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{getLimitLabel()}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 md:gap-4 p-2.5 md:p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700">
                    {dailyLimit !== Infinity && (
                        <div className="space-y-1.5 md:space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <div className="flex items-center gap-1.5">
                                    <BarChart3 size={10} className="text-blue-500 md:w-3.5 md:h-3.5" />
                                    <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-500 tracking-wider">Daily</span>
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold text-slate-900 dark:text-white">${dailyUsage.toLocaleString()} / ${dailyLimit.toLocaleString()}</span>
                            </div>
                            <div className="h-1 md:h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${dailyPct > 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${dailyPct}%` }}></div>
                            </div>
                        </div>
                    )}

                    {weeklyLimit !== Infinity && (
                        <div className="space-y-1.5 md:space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <div className="flex items-center gap-1.5">
                                    <TrendingUp size={10} className="text-emerald-500 md:w-3.5 md:h-3.5" />
                                    <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-500 tracking-wider">Weekly</span>
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold text-slate-900 dark:text-white">${weeklyUsage.toLocaleString()} / ${weeklyLimit.toLocaleString()}</span>
                            </div>
                            <div className="h-1 md:h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${weeklyPct > 90 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${weeklyPct}%` }}></div>
                            </div>
                        </div>
                    )}

                    {monthlyLimit !== Infinity && (
                        <div className="space-y-1.5 md:space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <div className="flex items-center gap-1.5">
                                    <TrendingUp size={10} className="text-purple-500 md:w-3.5 md:h-3.5" />
                                    <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-500 tracking-wider">Monthly</span>
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold text-slate-900 dark:text-white">${monthlyUsage.toLocaleString()} / ${monthlyLimit.toLocaleString()}</span>
                            </div>
                            <div className="h-1 md:h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${monthlyPct > 90 ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${monthlyPct}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {errorMsg && <div className="p-2.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg border border-red-100 animate-in fade-in flex items-center gap-2"><AlertCircle size={14} /> {errorMsg}</div>}

            <div className="space-y-6 md:space-y-8">
                <div>
                    <div className="flex items-center gap-2 mb-2.5 ml-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${kycLevel >= 1 ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>1</div>
                        <h3 className="text-[10px] md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Basic (Tier 1)</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                        <KycStep
                            title="ID"
                            description="Passport / License"
                            limits="$1,000 Limit"
                            icon={FileText}
                            type="governmentId"
                            status={effectiveStatuses.governmentId}
                            uploading={uploadingType === 'governmentId'}
                            onFileSelect={(f: File) => handleUpload(f, 'governmentId')}
                        />
                        <KycStep
                            title="Selfie"
                            description="Facial Scan"
                            limits="Instant Access"
                            icon={Camera}
                            type="selfie"
                            status={effectiveStatuses.selfie}
                            uploading={uploadingType === 'selfie'}
                            onFileSelect={(f: File) => handleUpload(f, 'selfie')}
                            onOpenCamera={() => setShowCamera(true)}
                        />
                    </div>
                </div>

                <div className={`${kycLevel < 1 ? 'opacity-50 pointer-events-none' : ''} transition-all duration-500 relative`}>
                    {kycLevel < 1 && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                            <div className="bg-slate-900/90 text-white px-4 py-2 rounded-full font-bold text-[9px] uppercase tracking-widest shadow-xl flex items-center gap-1.5 border border-white/20">
                                <Lock size={10} /> Needs Tier 1
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2 mb-2.5 ml-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${kycLevel >= 2 ? 'bg-emerald-500 text-white' : kycLevel === 1 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-500'}`}>2</div>
                        <h3 className={`text-[10px] md:text-sm font-black uppercase tracking-widest ${kycLevel >= 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Advanced (Tier 2)</h3>
                    </div>
                    <div className="grid grid-cols-1">
                        <KycStep
                            title="Proof of Address"
                            description="Utility Bill or Bank Statement"
                            limits="Unlock $50,000 Limit"
                            icon={Smartphone}
                            type="proofAddress"
                            status={effectiveStatuses.proofAddress}
                            uploading={uploadingType === 'proofAddress'}
                            onFileSelect={(f: File) => handleUpload(f, 'proofAddress')}
                            disabled={kycLevel < 1}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
