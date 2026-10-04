import React from 'react';
import { X, Check } from 'lucide-react';
import { Language } from '../types/banking';

export const EthiopiaFlagIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-4' }) => (
  <svg viewBox="0 0 36 24" className={`rounded-xs shadow-xs shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="8" y="0" fill="#009A44" />
    <rect width="36" height="8" y="8" fill="#FED100" />
    <rect width="36" height="8" y="16" fill="#D80027" />
    <circle cx="18" cy="12" r="5.5" fill="#0033A0" />
    <path d="M18 7.5 L19.2 11 L22.8 11 L19.8 13.1 L21 16.5 L18 14.4 L15 16.5 L16.2 13.1 L13.2 11 L16.8 11 Z" fill="#FED100" />
  </svg>
);

export const UsaFlagIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-4' }) => (
  <svg viewBox="0 0 36 24" className={`rounded-xs shadow-xs shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="24" fill="#BB133E" />
    <path d="M0 3.69h36M0 7.38h36M0 11.07h36M0 14.76h36M0 18.45h36M0 22.15h36" stroke="#FFFFFF" strokeWidth="1.84" />
    <rect width="14.4" height="12.92" fill="#002147" />
    <circle cx="2.8" cy="2.5" r="0.7" fill="#FFFFFF" />
    <circle cx="7.2" cy="2.5" r="0.7" fill="#FFFFFF" />
    <circle cx="11.6" cy="2.5" r="0.7" fill="#FFFFFF" />
    <circle cx="5" cy="6.4" r="0.7" fill="#FFFFFF" />
    <circle cx="9.4" cy="6.4" r="0.7" fill="#FFFFFF" />
    <circle cx="2.8" cy="10.3" r="0.7" fill="#FFFFFF" />
    <circle cx="7.2" cy="10.3" r="0.7" fill="#FFFFFF" />
    <circle cx="11.6" cy="10.3" r="0.7" fill="#FFFFFF" />
  </svg>
);

interface LanguageModalProps {
  isOpen: boolean;
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  currentLang,
  onSelectLang,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200 border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {currentLang === 'am' ? 'ቋንቋ ይምረጡ' : 'Select Language'}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              {currentLang === 'am' ? 'የአፕሊኬሽኑን ቋንቋ ይቀይሩ' : 'Choose your preferred application language'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Options */}
        <div className="space-y-2.5 pt-1">
          {/* Amharic Option */}
          <button
            onClick={() => {
              onSelectLang('am');
              onClose();
            }}
            className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
              currentLang === 'am'
                ? 'border-[#701484] bg-purple-50/80 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <EthiopiaFlagIcon className="w-7 h-5" />
              <div>
                <div className="text-xs font-bold text-slate-800">አማርኛ</div>
                <div className="text-[11px] text-slate-500 font-medium">Amharic (Ethiopia)</div>
              </div>
            </div>

            {currentLang === 'am' && (
              <div className="w-6 h-6 rounded-full bg-[#701484] text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>

          {/* English Option */}
          <button
            onClick={() => {
              onSelectLang('en');
              onClose();
            }}
            className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
              currentLang === 'en'
                ? 'border-[#701484] bg-purple-50/80 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <UsaFlagIcon className="w-7 h-5" />
              <div>
                <div className="text-xs font-bold text-slate-800">English</div>
                <div className="text-[11px] text-slate-500 font-medium">English (United States)</div>
              </div>
            </div>

            {currentLang === 'en' && (
              <div className="w-6 h-6 rounded-full bg-[#701484] text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
