import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Lock,
  Unlock,
  Sliders,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Wifi,
  Sparkles,
} from 'lucide-react';
import { CbeAccount, Language } from '../types/banking';
import { CbeLogo } from './CbeLogo';

interface CbeCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  account: CbeAccount;
  userName?: string;
}

export const CbeCardsModal: React.FC<CbeCardsModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  account,
  userName = 'User',
}) => {
  const [isFrozen, setIsFrozen] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [dailyAtmLimit, setDailyAtmLimit] = useState(10000);
  const [onlinePurchaseEnabled, setOnlinePurchaseEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // PIN change state
  const [showChangePin, setShowChangePin] = useState(false);
  const [newCardPin, setNewCardPin] = useState('');
  const [pinChangedSuccess, setPinChangedSuccess] = useState(false);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleFreeze = () => {
    const nextState = !isFrozen;
    setIsFrozen(nextState);
    triggerToast(
      nextState
        ? currentLang === 'am'
          ? 'ካርድዎ ለጊዜው ታግዷል (Frozen)!'
          : 'Card temporarily frozen!'
        : currentLang === 'am'
        ? 'ካርድዎ ገቢር ሆኗል (Unfrozen)!'
        : 'Card unfrozen & active!'
    );
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardPin.length !== 4) return;
    setPinChangedSuccess(true);
    setNewCardPin('');
    setTimeout(() => {
      setPinChangedSuccess(false);
      setShowChangePin(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#701484] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              {/* Credit card icon */}
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">
                {currentLang === 'am' ? 'የባንክ ካርዶች' : 'CBE Debit Cards'}
              </h2>
              <span className="text-[10px] text-purple-200">
                {currentLang === 'am' ? 'የካርድ አስተዳደር እና ደህንነት' : 'Manage & Secure Your Cards'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {toastMessage && (
            <div className="p-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl text-center animate-in fade-in shadow-md">
              {toastMessage}
            </div>
          )}

          {/* 3D Realistic CBE Gold Debit Card */}
          <div
            className={`relative rounded-2xl p-4.5 text-white transition-all shadow-xl overflow-hidden ${
              isFrozen
                ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 opacity-90 grayscale'
                : 'bg-gradient-to-br from-[#2a1134] via-[#1a0821] to-[#0f0413] border border-amber-500/30 shadow-[#701484]/20'
            }`}
          >
            {/* Background watermark logo */}
            <div className="absolute right-0 top-0 bottom-0 w-44 opacity-10 pointer-events-none flex items-center justify-center">
              <CbeLogo isDarkBg={true} size="xl" />
            </div>

            {/* Top row */}
            <div className="flex items-center justify-between relative z-10 mb-4">
              <div className="flex items-center gap-2">
                <CbeLogo isDarkBg={true} size="sm" className="w-6 h-6" />
                <div>
                  <span className="text-[11px] font-bold text-white tracking-wide block leading-tight font-serif">
                    Commercial Bank of Ethiopia
                  </span>
                  <span className="text-[9px] text-amber-200/80 italic block leading-tight">
                    The bank you can always rely on!
                  </span>
                </div>
              </div>
              <Wifi className="w-4 h-4 text-amber-300/80 rotate-90" />
            </div>

            {/* EMV Chip & Contactless */}
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-8 h-6 rounded-md bg-gradient-to-tr from-amber-400 to-amber-200 border border-amber-500/60 shadow-xs flex items-center justify-center">
                <div className="w-full h-px bg-amber-700/40 my-auto" />
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                isFrozen ? 'bg-rose-900/60 text-rose-300' : 'bg-emerald-900/60 text-emerald-300'
              }`}>
                {isFrozen ? (currentLang === 'am' ? 'የታገደ (Frozen)' : 'FROZEN') : (currentLang === 'am' ? 'ንቁ (ACTIVE)' : 'ACTIVE')}
              </span>
            </div>

            {/* Card Number */}
            <div className="flex items-center justify-between relative z-10 mb-3">
              <span className="text-base sm:text-lg font-mono font-black tracking-[0.15em] text-neutral-100">
                {showCardNumber ? '9231 4082 9865 1589' : '9231 40** **** ***1 589'}
              </span>
              <button
                onClick={() => setShowCardNumber(!showCardNumber)}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                title="Toggle Card Number"
              >
                {showCardNumber ? <EyeOff className="w-4 h-4 text-amber-300" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Bottom Row: Name, Expiry, Logo */}
            <div className="flex items-end justify-between relative z-10 text-[10px] font-mono">
              <div>
                <span className="text-neutral-400 text-[8px] uppercase block">Cardholder</span>
                <span className="font-bold text-neutral-200 tracking-wider">
                  {userName.toUpperCase()}
                </span>
                {/* Real-time Balance sync on card */}
                <div className="mt-1 text-amber-300/90 font-bold text-[9px]">
                  BAL: {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                </div>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 text-[8px] uppercase block">Expires</span>
                <span className="font-bold text-neutral-200 tracking-wider">10 JUN 2029</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2.5">
            {/* Freeze Card Button */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isFrozen ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {isFrozen ? <Lock className="w-4.5 h-4.5" /> : <Unlock className="w-4.5 h-4.5" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {currentLang === 'am' ? 'ካርድ ለጊዜው እገድ' : 'Freeze Card'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isFrozen
                      ? (currentLang === 'am' ? 'ካርድዎ ታግዷል፤ ማንቃት ይችላሉ' : 'Card is currently blocked')
                      : (currentLang === 'am' ? 'ካርዱ እንዳይሰራ ማገድ' : 'Temporarily disable ATM & POS')}
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggleFreeze}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                  isFrozen ? 'bg-rose-500 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-4.5 h-4.5 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            {/* Daily ATM Limit Slider */}
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2 text-slate-800">
                  <Sliders className="w-4 h-4 text-[#701484]" />
                  <span>{currentLang === 'am' ? 'የቀን ኤቲኤም ማውጫ ወሰን' : 'Daily ATM Limit'}</span>
                </div>
                <span className="font-mono text-[#701484] font-black">
                  {dailyAtmLimit.toLocaleString()} ETB
                </span>
              </div>
              <input
                type="range"
                min={2000}
                max={20000}
                step={1000}
                value={dailyAtmLimit}
                onChange={(e) => setDailyAtmLimit(Number(e.target.value))}
                className="w-full accent-[#701484] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>2,000 ETB</span>
                <span>10,000 ETB</span>
                <span>20,000 ETB</span>
              </div>
            </div>

            {/* Change Card PIN */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
              <button
                onClick={() => setShowChangePin(!showChangePin)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#701484] flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <span>{currentLang === 'am' ? 'የካርድ ፒን (ATM PIN) ቀይር' : 'Change Card ATM PIN'}</span>
                </div>
                <span className="text-[11px] text-[#701484]">
                  {showChangePin ? (currentLang === 'am' ? 'ዝጋ' : 'Close') : (currentLang === 'am' ? 'ቀይር' : 'Edit')}
                </span>
              </button>

              {showChangePin && (
                <form onSubmit={handleSavePin} className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                  {pinChangedSuccess && (
                    <div className="p-2 bg-emerald-50 text-emerald-700 text-[11px] rounded-lg font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{currentLang === 'am' ? 'የካርድ ፒን ተቀይሯል!' : 'Card PIN updated!'}</span>
                    </div>
                  )}
                  <input
                    type="password"
                    maxLength={4}
                    value={newCardPin}
                    onChange={(e) => setNewCardPin(e.target.value.replace(/\D/g, ''))}
                    placeholder={currentLang === 'am' ? 'አዲስ ባለ 4-አሃዝ ፒን' : 'Enter 4-digit PIN'}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-center text-sm font-mono font-bold outline-none focus:border-[#701484]"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#b88d4c] hover:bg-[#a3793b] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {currentLang === 'am' ? 'አዲሱን ፒን መዝግብ' : 'Save PIN'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
