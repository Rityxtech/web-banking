
import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Loader2, CheckCircle, AlertCircle, ArrowLeft, User, Phone, MapPin, ChevronDown, Eye, EyeOff, RefreshCw, ShieldAlert, UserX, ArrowRight, AlertTriangle, MessageSquare, LogOut } from 'lucide-react';
import { supabase } from '../services/supabase';
import { mvp } from '../services/mvpService';
import { getEmailTemplate } from '../utils/emailTemplates';
import { APP_CONFIG } from '../config';

interface AuthProps {
  type: 'signin' | 'signup';
  authFeedback?: string;
  initialEmail?: string;
  allowSignup?: boolean;
  maintenanceMode?: boolean;
  showMaintenanceModal?: boolean;
  showSuspendedModal?: boolean;
  logoUrl?: string;
  siteName?: string;
  onAuthSuccess: () => void;
  onAdminBypass?: () => void;
  onSwitch: (type: 'signin' | 'signup') => void;
  onShowMaintenance?: () => void;
  onContactSupport?: (inquirySubject?: string) => void;
  onLogout?: () => void;
}

const GoogleLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.04 2.53-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

type AuthView = 'signin' | 'signup' | 'verify_otp' | 'forgot_password' | 'reset_password';

export const Auth: React.FC<AuthProps> = ({ type, authFeedback, initialEmail = '', allowSignup = true, maintenanceMode = false, showMaintenanceModal: propShowModal = false, showSuspendedModal: propShowSuspendedModal = false, logoUrl, siteName, onAuthSuccess, onAdminBypass, onSwitch, onShowMaintenance, onContactSupport, onLogout }) => {
  const [currentView, setCurrentView] = useState<AuthView>(type);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(authFeedback || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [debugInfo, setDebugInfo] = useState<Record<string, any> | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [signupStep, setSignupStep] = useState(1);

  // Maintenance modal state - controlled by parent prop or local state
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(propShowModal);

  // Suspended modal state - controlled by parent prop or local state
  const [showSuspendedModal, setShowSuspendedModal] = useState(propShowSuspendedModal);

  // Sync with parent prop when it changes
  useEffect(() => {
    if (propShowModal) {
      setShowMaintenanceModal(true);
    }
  }, [propShowModal]);

  // Sync suspended modal with parent prop
  useEffect(() => {
    if (propShowSuspendedModal) {
      setShowSuspendedModal(true);
    }
  }, [propShowSuspendedModal]);

  // Waitlist State
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isWaitlistSubmitting, setIsWaitlistSubmitting] = useState(false);
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(false);

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: initialEmail,
    phone: '',
    dob: '',
    gender: '',
    address: '',
    city: '',
    country: '',
    password: '',
    pin: ''
  });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpPurpose, setOtpPurpose] = useState<'signup' | 'confirm_email'>('signup');
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  const defaultLogo = "https://image2url.com/r2/default/images/1769428285590-d43b30ba-a0ba-499f-a066-6411c1619f75.webp";
  const displayLogo = logoUrl && logoUrl.trim() !== '' ? logoUrl : defaultLogo;
  const displayName = siteName && siteName.trim() !== '' ? siteName.split(' ')[0] : APP_CONFIG.BRAND_NAME;

  const checkIsAdmin = (email: string) => {
    return APP_CONFIG.ADMIN_EMAILS.includes(email?.trim().toLowerCase());
  };

  // Only block the Registration view if allowSignup is false
  const isRegBlocked = currentView === 'signup' && allowSignup === false;

  useEffect(() => {
    if (formData.email) setWaitlistEmail(formData.email);
  }, [formData.email]);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // If parent is showing the suspended modal, don't auto-redirect
        if (propShowSuspendedModal) return;

        const userEmail = data.session.user.email || '';
        const isAdmin = checkIsAdmin(userEmail);

        if (maintenanceMode && !isAdmin) {
          // App.tsx handles this post-auth check, we just let it cycle
          return;
        }

        // App.tsx handles navigation via onAuthStateChange / INITIAL_SESSION
      }
    };
    checkSession();
    // Intentionally omit propShowSuspendedModal so the effect doesn't re-run
    // and call onAuthSuccess when the modal is dismissed (e.g., via Contact Support)
  }, [maintenanceMode]);

  useEffect(() => {
    if (authFeedback) {
      setError(authFeedback);
    }
  }, [authFeedback]);

  useEffect(() => {
    if (initialEmail && type === 'signup' && !formData.email) {
      setFormData(prev => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail, type]);

  useEffect(() => {
    if (type === 'signin' || type === 'signup') {
      setCurrentView(type);
      setSignupStep(1);
      if (!authFeedback) setError('');
      setSuccessMsg('');
    }
  }, [type, authFeedback]);

  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'pin') {
      const numericValue = value.replace(/\D/g, '').slice(0, 4);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    // Explicitly set intent
    localStorage.setItem('lennox_auth_intent', 'signin');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (error) throw error;

      if (data.user && !data.session) {
        setSignInEmail(signInEmail);
        setCurrentView('verify_otp');
        setSuccessMsg(`Please verify ${signInEmail}`);
        return;
      }

      // Check maintenance mode - verify admin status from database
      if (maintenanceMode && data.user) {
        try {
          const userEmail = data.user!.email?.toLowerCase() || '';
          // Match the same hardcoded list as App.tsx handleSession
          let isAdmin = userEmail === APP_CONFIG.ADMIN_EMAILS[0] || userEmail === 'akugbof@gmail.com';
          if (!isAdmin) {
            const { data: profiles } = await supabase.from('mvp_profiles').select('id,user_id,role').limit(1);
            const profile = (profiles || []).find((p: any) => p.user_id === data.user!.id);
            isAdmin = profile?.role === 'admin' || userEmail.includes('admin');
          }
          console.log('[Auth] Maintenance admin check:', { userId: data.user!.id, email: userEmail, isAdmin });

          if (!isAdmin) {
            // Not admin during maintenance - show modal and block login
            // NOTE: Don't call supabase.auth.signOut() here - it triggers SIGNED_OUT
            // which resets the view and hides the modal. Just show modal locally.
            console.log('[Auth] Blocking non-admin during maintenance:', data.user!.email);
            setShowMaintenanceModal(true);
            setIsLoading(false);
            // Prevent any further auth flow - user stays on login page with modal showing
            return;
          }
          // Admin can proceed - continue with login
          console.log('[Auth] Allowing admin during maintenance:', data.user!.email);
        } catch (err) {
          console.error('[Auth] Maintenance profile check error:', err);
          // If profile check fails, block login during maintenance for safety
          // NOTE: Don't signOut here either - it triggers view reset
          setShowMaintenanceModal(true);
          setIsLoading(false);
          return;
        }
      }

      // Send Login Notification if New Device
      if (data.user && data.user.email) {
        const deviceKey = `lennox_device_${data.user.id}`;
        const isKnown = localStorage.getItem(deviceKey);

        if (!isKnown) {
          // Attempt to fetch location from primary source (ipwho.is - better accuracy)
          const fetchLocation = async () => {
            try {
              // Primary Provider
              const res = await fetch('https://ipwho.is/');
              const geoData = await res.json();

              if (!geoData.success) throw new Error("Primary geo failed");

              return {
                ip: geoData.ip,
                country: geoData.country
              };
            } catch (e) {
              // Secondary Provider
              try {
                const res = await fetch('https://ipapi.co/json/');
                const geoData = await res.json();
                return {
                  ip: geoData.ip,
                  country: geoData.country_name
                };
              } catch (err) {
                // Fallback if everything fails
                return {
                  ip: 'Unknown',
                  country: ''
                };
              }
            }
          };

          fetchLocation().then(geo => {
            const userName = data.user!.user_metadata?.full_name || 'Valued Client';
            const location = geo.country || 'Unknown Location';

            const preferredLang = localStorage.getItem('preferredLanguage') || 'en';
            const { subject, content } = getEmailTemplate('login', {
              user_name: userName,
              time: new Date().toLocaleString(),
              ip: geo.ip,
              location: location
            }, preferredLang);
            return mvp.sendEmail(data.user!.email!, subject, content, 'Login Notification');
          }).then(() => {
            localStorage.setItem(deviceKey, 'true');
          }).catch(console.error);
        }
      }

      // App.tsx handles all post-login state (suspension, navigation, etc.)
      // via onAuthStateChange to keep the auth flow in one place.
    } catch (err: any) {
      if (err.message && (err.message.includes('Email not confirmed'))) {
        try {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          await mvp.storeOtp(signInEmail, code, 'signup');
          const preferredLang = localStorage.getItem('preferredLanguage') || 'en';
          const { subject, content } = getEmailTemplate('otp', { otp: code }, preferredLang);
          const emailResult = await mvp.sendEmail(signInEmail, subject, content, APP_CONFIG.BANK_NAME);
          if (!emailResult.success) throw new Error(emailResult.error || 'Failed to send verification email');
          setOtpPurpose('confirm_email');
          setSignInEmail(signInEmail);
          setCurrentView('verify_otp');
          setSuccessMsg(`Email verification needed for ${signInEmail}`);
          setResendTimer(60);
        } catch (otpErr: any) {
          setError(otpErr.message || 'Failed to send verification code.');
        }
        setIsLoading(false);
        return;
      }
      setError(err.message || 'Authentication failed.');
      setIsLoading(false);
    }
    // On success, isLoading stays true until App.tsx unmounts Auth or shows the suspended modal
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (maintenanceMode) {
      if (onShowMaintenance) onShowMaintenance();
      return;
    }

    if (!allowSignup) return;

    if (formData.pin.length !== 4) return setError("PIN must be 4 digits.");
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) return setError("Missing required fields.");

    setIsLoading(true);
    setError('');
    setDebugInfo(null);

    // Explicitly set intent
    localStorage.setItem('lennox_auth_intent', 'signup');

    try {
      // Generate OTP, store via backend, send via Resend
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await mvp.storeOtp(formData.email, code, 'signup');
      const preferredLang = localStorage.getItem('preferredLanguage') || 'en';
      const { subject, content } = getEmailTemplate('otp', { otp: code }, preferredLang);
      const emailResult = await mvp.sendEmail(formData.email, subject, content, APP_CONFIG.BANK_NAME);
      if (!emailResult.success) throw new Error(emailResult.error || 'Failed to send OTP email');

      setOtpPurpose('signup');
      setSignInEmail(formData.email);
      setCurrentView('verify_otp');
      setSuccessMsg(`Code sent to ${formData.email}`);
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail) { setError("Enter your email address."); return; }
    setIsLoading(true); setError('');
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await mvp.storeOtp(signInEmail, code, 'recovery');
      const preferredLang = localStorage.getItem('preferredLanguage') || 'en';
      const { subject, content } = getEmailTemplate('otp', { otp: code }, preferredLang);
      const emailResult = await mvp.sendEmail(signInEmail, subject, content, APP_CONFIG.BANK_NAME);
      if (!emailResult.success) throw new Error(emailResult.error || 'Failed to send reset email');
      setCurrentView('reset_password'); setSuccessMsg(`Code sent to ${signInEmail}`); setResendTimer(60);
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true); setError(''); setSuccessMsg('');
    try {
      const emailToResend = signInEmail || formData.email;
      if (!emailToResend) throw new Error("Email address missing.");
      const otpType = currentView === 'reset_password' ? 'recovery' : 'signup';
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await mvp.storeOtp(emailToResend, code, otpType as any);
      const preferredLang = localStorage.getItem('preferredLanguage') || 'en';
      const { subject, content } = getEmailTemplate('otp', { otp: code }, preferredLang);
      const emailResult = await mvp.sendEmail(emailToResend, subject, content, APP_CONFIG.BANK_NAME);
      if (!emailResult.success) throw new Error(emailResult.error || 'Failed to resend code');
      setSuccessMsg(`Code sent successfully to ${emailToResend}`); setResendTimer(60);
    } catch (err: any) { setError(err.message || 'Failed to resend code.'); } finally { setIsLoading(false); }
  };

  const submitTokenVerification = async (token: string) => {
    if (token.length < 6) return;
    if (currentView === 'reset_password' && !newPassword) { setError('Please enter a new password.'); return; }
    setIsLoading(true); setError('');
    const isSignupVerification = currentView !== 'reset_password';

    // Explicitly set intent for signup verification
    if (isSignupVerification) {
      localStorage.setItem('lennox_auth_intent', 'signup');
    }

    try {
      const email = signInEmail || formData.email;
      if (!email) throw new Error("Email address missing.");

      if (currentView === 'reset_password') {
        // Verify OTP + reset password via backend
        const result = await mvp.resetPassword(email, newPassword, token);
        if (!result.success) throw new Error(result.error || 'Failed to reset password');
        setSuccessMsg('Password updated! Redirecting...');
        setTimeout(() => { setCurrentView('signin'); onSwitch('signin'); }, 1500);
      } else if (otpPurpose === 'confirm_email') {
        // Confirm existing user's email via backend (OTP verified server-side)
        const confirmResult = await mvp.confirmEmail(email, token);
        if (!confirmResult.success) throw new Error(confirmResult.error || 'Failed to confirm email');
        // Now sign in with the password they entered earlier
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: signInEmail,
          password: signInPassword
        });
        if (signInError) throw signInError;
        // App.tsx handles navigation via onAuthStateChange
      } else {
        // Signup verification: create confirmed user via backend (OTP verified server-side)
        const userMetadata = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          phone: formData.phone,
          dob: formData.dob,
          gender: formData.gender,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          pin: formData.pin,
          full_name: `${formData.firstName} ${formData.lastName}`
        };

        const createResult = await mvp.createConfirmedUser(email, formData.password, token, userMetadata);
        if (!createResult.success) {
          if (createResult.error?.includes('already exists') || createResult.error?.includes('duplicate')) {
            throw new Error(`Account ${email} already exists. Please sign in.`);
          }
          throw new Error(createResult.error || 'Failed to create account');
        }

        // Sign in the newly created user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: formData.password
        });
        if (signInError) throw signInError;

        const userName = userMetadata.full_name || 'Valued Client';
        const preferredLang = localStorage.getItem('preferredLanguage') || 'en';
        const { subject, content } = getEmailTemplate('welcome', { user_name: userName }, preferredLang);
        mvp.sendEmail(email, subject, content, 'Welcome').catch(console.error);
        // App.tsx handles navigation via onAuthStateChange
      }
    } catch (err: any) { setError(err.message || 'Invalid code.'); } finally { setIsLoading(false); }
  };

  const handleOtpChange = (index: number, value: string) => {
    const val = value.replace(/\D/g, '');
    if (val.length > 1) { const chars = val.split('').slice(0, 6); const newOtp = [...otp]; chars.forEach((c, i) => { if (i < 6) newOtp[i] = c; }); setOtp(newOtp); if (chars.length === 6 && currentView !== 'reset_password') submitTokenVerification(chars.join('')); return; }
    const newOtp = [...otp]; newOtp[index] = val.slice(-1); setOtp(newOtp);
    if (val && index < 5) otpInputs.current[index + 1]?.focus();
    if (index === 5 && val && currentView !== 'reset_password') submitTokenVerification(newOtp.join(''));
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Save the intent (signin vs signup) so App.tsx knows whether to create a profile or reject
      localStorage.setItem('lennox_auth_intent', currentView);
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setIsWaitlistSubmitting(true);
    try {
      await supabase.from('mvp_waitlist').insert({ email: waitlistEmail });
      setHasJoinedWaitlist(true);
    } catch (err) {
      setHasJoinedWaitlist(true);
    } finally {
      setIsWaitlistSubmitting(false);
    }
  };

  const inputClass = "w-full pl-9 pr-3 py-2.5 bg-black/20 border border-white/20 rounded-xl text-xs font-medium outline-none focus:bg-black/30 focus:border-blue-300 transition-all placeholder:text-white/60 text-white backdrop-blur-[2px] shadow-sm";

  // Only show the blocked UI for new registration attempts
  if (isRegBlocked) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 font-sans overflow-hidden bg-cover bg-center bg-no-repeat fixed inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070')" }}>
        <div className="w-full max-w-[380px] bg-black/40 backdrop-blur-md rounded-[24px] shadow-2xl border border-white/20 p-8 text-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
            <UserX size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Registration Closed</h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            We are currently not accepting new users. Join our waitlist to be notified when spots open up.
          </p>

          <div className="mb-6">
            {!hasJoinedWaitlist ? (
              <form onSubmit={handleJoinWaitlist} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={14} />
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={inputClass}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isWaitlistSubmitting}
                  className="w-full py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 backdrop-blur-sm border border-blue-500/30"
                >
                  {isWaitlistSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Join Waitlist'}
                </button>
              </form>
            ) : (
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 animate-in fade-in zoom-in">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold mb-1">
                  <CheckCircle size={18} />
                  <span>You're on the list!</span>
                </div>
                <p className="text-xs text-emerald-200/80">We'll notify {waitlistEmail} as soon as a spot opens up.</p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onSwitch('signin');
              setCurrentView('signin');
              setHasJoinedWaitlist(false);
            }}
            className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            Back to Login <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 font-sans overflow-hidden bg-cover bg-center bg-no-repeat fixed inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070')" }}>
      {/* Prominent Maintenance Mode Banner */}
      {maintenanceMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-3 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle size={18} />
            <span className="font-bold text-sm uppercase tracking-wider">System Maintenance in Progress</span>
          </div>
          <p className="text-xs text-white/90 mt-1">Only administrators can log in during maintenance</p>
        </div>
      )}
      <div className={`w-full max-w-[380px] flex flex-col items-center transition-all duration-300 ease-in-out relative z-10 ${maintenanceMode ? 'mt-12' : '-mt-[50px] md:mt-0'}`}>
        <div className="w-full bg-black/20 backdrop-blur-[4px] rounded-[24px] shadow-2xl border border-white/20 overflow-hidden transition-all duration-300 ring-1 ring-white/10">
          <div className="pt-6 pb-2 px-8 text-center">
            <img
              src={displayLogo}
              alt={displayName}
              className="w-12 h-12 mx-auto mb-3 object-contain drop-shadow-lg rounded-full"
              onError={(e) => { (e.target as HTMLImageElement).src = defaultLogo; }}
            />
            <h1 className="text-lg font-bold text-white tracking-tight drop-shadow-md">{currentView === 'signin' ? 'Welcome Back' : currentView === 'signup' ? 'Create Account' : currentView === 'forgot_password' ? 'Reset Password' : 'Check Your Email'}</h1>
            <p className="text-[11px] text-white/90 mt-1 font-medium drop-shadow-md">
              {maintenanceMode ? 'System Maintenance Active - Admin Access Only' : (currentView === 'signin' ? 'Enter details to continue' : currentView === 'signup' ? 'Join our digital banking' : 'We sent you a code')}
            </p>
          </div>
          <div className="px-8 pb-6 pt-4">
            {(error || successMsg) && (<div className={`mb-4 px-3 py-2 rounded-lg flex items-center gap-2 text-[10px] font-bold backdrop-blur-md border ${error ? 'bg-red-500/20 text-white border-red-200/30' : 'bg-emerald-500/20 text-white border-emerald-200/30'}`}>{error ? <AlertCircle size={14} /> : <CheckCircle size={14} />} <span className="flex-1">{error || successMsg}</span></div>)}
            {debugInfo && (
              <div className="mb-4 p-3 rounded-xl bg-black/60 border border-yellow-400/40 text-left backdrop-blur-md">
                <p className="text-[9px] font-black text-yellow-400 uppercase tracking-widest mb-2">⚠ Debug Info — Share this with support</p>
                <div className="space-y-1">
                  {Object.entries(debugInfo).map(([key, val]) => (
                    <div key={key} className="flex gap-2">
                      <span className="text-[9px] font-bold text-yellow-300/70 uppercase w-16 shrink-0">{key}:</span>
                      <span className="text-[9px] text-white/90 break-all font-mono">{String(val)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-white/40 mt-2">Full error also logged to browser console (F12 → Console)</p>
              </div>
            )}
            {currentView === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={14} /><input type="email" value={signInEmail} onChange={e => setSignInEmail(e.target.value)} className={inputClass} placeholder="Email address" required /></div>
                <div className="space-y-1">
                  <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={14} /><input type={showPassword ? "text" : "password"} value={signInPassword} onChange={e => setSignInPassword(e.target.value)} className={inputClass} placeholder="Password" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white/80">{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button></div>
                  <div className="flex justify-end"><button type="button" onClick={() => setCurrentView('forgot_password')} className="text-[10px] font-bold text-white hover:text-blue-200 hover:underline px-1 drop-shadow-md">Forgot password?</button></div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 mt-1 backdrop-blur-sm border bg-blue-600/80 hover:bg-blue-600 text-white shadow-blue-600/20 border-blue-500/30`}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Sign In'}
                </button>
                <div className="relative flex py-1 items-center"><div className="flex-grow border-t border-white/20"></div><span className="flex-shrink-0 mx-2 text-white/70 text-[9px] font-bold uppercase">Or</span><div className="flex-grow border-t border-white/20"></div></div>
                <button type="button" onClick={handleGoogleSignIn} className={`w-full py-2.5 bg-white/5 border border-white/20 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/10 text-white transition-all backdrop-blur-[2px]`}><GoogleLogo /> Continue with Google</button>
                {allowSignup && (
                  <p className="text-center text-[10px] text-white/90 mt-2 font-medium">New user? <button type="button" onClick={() => onSwitch('signup')} className="text-white font-bold hover:underline ml-1">Create account</button></p>
                )}
              </form>
            )}
            {currentView === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3">
                {signupStep === 1 ? (
                  <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                    <div className="grid grid-cols-2 gap-2"><input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className={inputClass.replace('pl-9', 'pl-3')} required /><input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className={inputClass.replace('pl-9', 'pl-3')} required /></div>
                    <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} className={inputClass.replace('pl-9', 'pl-3')} required />
                    <div className="grid grid-cols-2 gap-2"><input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className={inputClass.replace('pl-9', 'pl-3')} required /><input name="pin" type="password" maxLength={4} placeholder="PIN (4)" value={formData.pin} onChange={handleInputChange} className={`${inputClass.replace('pl-9', 'pl-3')} text-center`} required /></div>
                    <button type="button" onClick={() => {
                      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || formData.pin.length !== 4) {
                        setError("Please complete all required fields and a 4-digit PIN.");
                        return;
                      }
                      setError("");
                      setSignupStep(2);
                    }} className="w-full py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] mt-2 flex items-center justify-center gap-2 backdrop-blur-sm border border-blue-500/30">Next Step <ArrowRight size={14} /></button>
                    <div className="relative flex py-1 items-center"><div className="flex-grow border-t border-white/20"></div><span className="flex-shrink-0 mx-2 text-white/70 text-[9px] font-bold uppercase">Or</span><div className="flex-grow border-t border-white/20"></div></div>
                    <button type="button" onClick={handleGoogleSignIn} className={`w-full py-2.5 bg-white/5 border border-white/20 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/10 text-white transition-all backdrop-blur-[2px]`}><GoogleLogo /> Continue with Google</button>
                    <p className="text-center text-[10px] text-white/90 font-medium pt-1">Have an account? <button type="button" onClick={() => { setSignupStep(1); onSwitch('signin'); }} className="text-white font-bold hover:underline ml-1">Log in</button></p>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-2 mb-2">
                      <button type="button" onClick={() => setSignupStep(1)} className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"><ArrowLeft size={16} /></button>
                      <p className="text-[10px] font-bold text-white/90 uppercase tracking-widest">Additional Details</p>
                    </div>
                    <input name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} className={inputClass.replace('pl-9', 'pl-3')} required />
                    <input name="phone" type="tel" placeholder="Phone" value={formData.phone} onChange={handleInputChange} className={inputClass.replace('pl-9', 'pl-3')} />
                    <div className="grid grid-cols-2 gap-2"><input name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className={inputClass.replace('pl-9', 'pl-3')} /><input name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} className={inputClass.replace('pl-9', 'pl-3')} /></div>
                    <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] mt-2 flex items-center justify-center gap-2 backdrop-blur-sm border border-emerald-500/30">{isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Complete Registration'}</button>
                    <p className="text-center text-[10px] text-white/90 font-medium pt-1">Have an account? <button type="button" onClick={() => { setSignupStep(1); onSwitch('signin'); }} className="text-white font-bold hover:underline ml-1">Log in</button></p>
                  </div>
                )}
              </form>
            )}
            {(currentView === 'verify_otp' || currentView === 'reset_password') && (<div className="space-y-4 text-center"><div className="flex justify-center gap-2">{otp.map((digit, index) => (<input key={index} ref={(el) => (otpInputs.current[index] = el)} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => { if (e.key === 'Backspace' && !digit && index > 0) otpInputs.current[index - 1]?.focus(); }} className="w-9 h-11 text-center text-lg font-bold border border-white/20 rounded-lg bg-black/20 focus:bg-black/30 outline-none transition-all focus:border-blue-300 text-white backdrop-blur-[2px] shadow-sm" />))}</div>{currentView === 'reset_password' && (<input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={`${inputClass} text-center`} placeholder="Enter New Password" />)}<div className="text-[10px] text-white/70 bg-white/5 p-2 rounded-lg border border-white/10"><p><strong>Note:</strong> Emails may take 2-5 minutes to arrive.</p><p>Please check your <strong>Spam</strong> or <strong>Junk</strong> folder.</p></div><button onClick={() => submitTokenVerification(otp.join(''))} disabled={isLoading} className="w-full py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 backdrop-blur-sm border border-blue-500/30">{isLoading ? <Loader2 className="animate-spin" size={16} /> : (currentView === 'reset_password' ? 'Save New Password' : 'Verify Code')}</button><div className="flex justify-between items-center px-1"><button onClick={() => { setCurrentView('signin'); onSwitch('signin'); }} className="text-[10px] font-bold text-white hover:text-white/80">Back</button><button onClick={handleResend} disabled={resendTimer > 0 || isLoading} className={`text-[10px] font-bold ${resendTimer > 0 ? 'text-white/50' : 'text-blue-300 hover:text-blue-200'}`}>{resendTimer > 0 ? `Wait ${resendTimer}s` : (isLoading ? 'Sending...' : 'Resend Code')}</button></div>{currentView === 'verify_otp' && (<div className="pt-2 border-t border-white/10"><button type="button" onClick={handleGoogleSignIn} className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white transition-all flex items-center justify-center gap-2"><GoogleLogo /> No email received? Use Google</button></div>)}</div>)}
            {currentView === 'forgot_password' && (<div className="space-y-3"><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={14} /><input type="email" value={signInEmail} onChange={e => setSignInEmail(e.target.value)} className={inputClass} placeholder="Registered Email" /></div><button onClick={handleForgotPassword} disabled={isLoading} className="w-full py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 backdrop-blur-sm border border-blue-500/30">{isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Send Reset Code'}</button><div className="text-center pt-1"><button onClick={() => { setCurrentView('signin'); onSwitch('signin'); }} className="text-[10px] font-bold text-white hover:text-white/80">Back to Login</button></div></div>)}
          </div>
        </div>
        <div className="mt-6 text-center opacity-90"><p className="text-[9px] font-bold text-white/70 uppercase tracking-widest text-shadow-sm drop-shadow-md">Secured by {displayName} ID</p></div>
        <div className="mt-2 text-center opacity-70"><p className="text-[9px] font-medium text-white/50">Need help? <a href={`mailto:admin@${displayName.toLowerCase()}mh.com`} className="text-white hover:text-blue-300 underline transition-colors">admin@{displayName.toLowerCase()}mh.com</a></p></div>
      </div>

      {/* Maintenance Mode Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111a22] rounded-2xl border border-amber-500/50 p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-amber-500/20 rounded-full">
                <AlertTriangle className="text-amber-500" size={40} />
              </div>
            </div>
            <h2 className="text-xl font-black text-center text-slate-900 dark:text-white uppercase tracking-tight mb-2">System Maintenance</h2>
            <p className="text-sm text-center text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              {displayName} is currently undergoing scheduled maintenance. Normal user access is temporarily restricted.
            </p>
            <div className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">
                  <strong>Administrators:</strong> You can still log in using your admin credentials to manage the system during maintenance.
                </p>
              </div>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="w-full py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Suspended Modal */}
      {showSuspendedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111a22] rounded-2xl border border-red-500/50 p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-red-500/20 rounded-full">
                <ShieldAlert className="text-red-500" size={40} />
              </div>
            </div>
            <h2 className="text-xl font-black text-center text-slate-900 dark:text-white uppercase tracking-tight mb-2">Account Suspended</h2>
            <p className="text-sm text-center text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              We&apos;re unable to sign you in. Your account has been suspended. Please contact support for assistance.
            </p>
            <div className="space-y-3">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-xs text-red-800 dark:text-red-400 font-medium flex items-center gap-2">
                  <MessageSquare size={14} />
                  <span>Reach out to our support team to resolve this issue.</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSuspendedModal(false);
                  window.open(APP_CONFIG.JIVOCHAT_URL, '_blank');
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <MessageSquare size={16} /> Contact Support
              </button>
              {onLogout && (
                <button
                  onClick={() => {
                    setShowSuspendedModal(false);
                    onLogout();
                  }}
                  className="w-full py-3 bg-transparent border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-opacity flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Log Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
