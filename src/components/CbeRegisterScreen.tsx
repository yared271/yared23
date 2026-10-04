import React, { useState } from 'react';
import { User, Phone, CreditCard, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CbeLogo } from './CbeLogo';
import { Language } from '../types/banking';

interface CbeRegisterScreenProps {
  currentLang: Language;
  onToggleLang: () => void;
  onRegisterSuccess: (userData: { fullName: string; accountNumber: string; phone: string; pin: string }) => void;
  onGoToLogin: () => void;
}

export const CbeRegisterScreen: React.FC<CbeRegisterScreenProps> = ({
  currentLang,
  onToggleLang,
  onRegisterSuccess,
  onGoToLogin,
}) => {
  const [fullName, setFullName] = useState('');
  const [accountNumber, setAccountNumber] = useState(() => {
    return '1000' + Math.floor(100000000 + Math.random() * 900000000);
  });
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const nameParts = fullName.trim().split(/\s+/);
    if (!fullName.trim() || nameParts.length < 2) {
      setError(currentLang === 'am' ? 'እባክዎ ሙሉ ስምዎን ከአያትዎ ጋር (ቢያንስ 3 ስም) ያስገቡ' : 'Please enter your full 3-part name (First, Father, Grandfather)');
      return;
    }
    if (!accountNumber.trim() || accountNumber.length < 10) {
      setError(currentLang === 'am' ? 'እባክዎ ትክክለኛ የንግድ ባንክ ሒሳብ ቁጥር ያስገቡ' : 'Please enter a valid CBE Account Number');
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      setError(currentLang === 'am' ? 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ' : 'Please enter your registered phone number');
      return;
    }
    if (pin.length < 4) {
      setError(currentLang === 'am' ? 'እባክዎ ባለ 4 አሃዝ ፒን (1-4 ወይም የመረጡትን) ያስገቡ' : 'Please set a 4-digit PIN (e.g. 1234)');
      return;
    }
    if (pin !== confirmPin) {
      setError(currentLang === 'am' ? 'ያስገቧቸው ፒን ቁጥሮች አልተመሳሰሉም' : 'PIN numbers do not match');
      return;
    }

    onRegisterSuccess({
      fullName: fullName.trim(),
      accountNumber: accountNumber.trim(),
      phone: phone.trim(),
      pin: pin,
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between w-full max-w-[420px] mx-auto relative shadow-2xl overflow-hidden font-sans">
      {/* Top Header */}
      <div className="p-4 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CbeLogo size="sm" className="w-8 h-8" />
          <span className="text-xs font-bold text-[#c59b27] uppercase tracking-wider font-serif">
            {currentLang === 'am' ? 'የኢትዮጵያ ንግድ ባንክ' : 'Commercial Bank of Ethiopia'}
          </span>
        </div>

        <button
          onClick={onToggleLang}
          className="px-3 py-1 rounded-full bg-white shadow-sm border border-slate-200 text-xs font-semibold text-slate-700"
        >
          {currentLang === 'am' ? 'አማርኛ' : 'English'}
        </button>
      </div>

      {/* Main Registration Form */}
      <div className="px-6 py-4 space-y-5 my-auto">
        <div className="text-center space-y-1">
          <div className="flex justify-center mb-1">
            <CbeLogo size="lg" className="w-20 h-20" />
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            {currentLang === 'am' ? 'የ-CBE ሞባይል ባንኪንግ ምዝገባ' : 'Register CBE Mobile Banking'}
          </h1>
          <p className="text-xs text-slate-500">
            {currentLang === 'am' ? 'ይፋዊ የሂሳብ መረጃዎን ያስገቡና ቋሚ ፒን (PIN) ያዘጋጁ' : 'Set up your account and permanent security PIN'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3 text-xs">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-slate-600 font-semibold block">
              {currentLang === 'am' ? 'የሂሳብ ባለቤት ሙሉ ስም (ከአያት ጋር)' : 'Full Name (with Grandfather name)'}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c59b27]" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={currentLang === 'am' ? 'ምሳሌ፡ አበበ ከበደ ወልደ' : 'e.g. Abebe Kebede Wolde'}
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:border-[#c59b27] outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Account Number */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-slate-600 font-semibold block">
                {currentLang === 'am' ? 'የተሰጠዎት የንግድ ባንክ ሒሳብ ቁጥር' : 'CBE Assigned Account Number'}
              </label>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {currentLang === 'am' ? 'ራስ-ሰር የተፈጠረ' : 'Auto Generated'}
              </span>
            </div>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c59b27]" />
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="1000..."
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono font-bold focus:border-[#c59b27] outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-slate-600 font-semibold block">
              {currentLang === 'am' ? 'ስልክ ቁጥር (የመግቢያ ስልክ)' : 'Phone Number (Login Phone)'}
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c59b27]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={currentLang === 'am' ? '09... ወይም 07...' : '09... or 07...'}
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono font-bold focus:border-[#c59b27] outline-none shadow-sm"
              />
            </div>
          </div>

          {/* 4-Digit PIN & Confirm PIN */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-slate-600 font-semibold block">
                {currentLang === 'am' ? 'ባለ 4 አሃዝ ፒን (1-4)' : 'Set 4-Digit PIN (1-4)'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c59b27]" />
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono font-bold text-center tracking-[0.2em] focus:border-[#c59b27] outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-semibold block">
                {currentLang === 'am' ? 'ፒኑን ይድገሙ' : 'Confirm PIN'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c59b27]" />
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono font-bold text-center tracking-[0.2em] focus:border-[#c59b27] outline-none shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-[#c59b27] hover:bg-[#b0891e] active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-[#c59b27]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{currentLang === 'am' ? 'ይመዝገቡና ይቀጥሉ' : 'Register & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={onGoToLogin}
            className="text-xs font-semibold text-[#74117c] hover:underline"
          >
            {currentLang === 'am' ? 'ቀደም ሲል ተመዝግበዋል? ይግቡ' : 'Already have an account? Login'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-5 text-center text-xs text-slate-400">
        © Commercial Bank of Ethiopia
      </div>
    </div>
  );
};
