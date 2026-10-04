import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Language } from '../types/banking';

interface CbeMiniStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  account?: any;
  transactions?: any[];
}

export const CbeMiniStatementModal: React.FC<CbeMiniStatementModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#121016]/95 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in select-none">
      <div className="bg-white text-slate-800 w-full max-w-sm rounded-[36px] overflow-hidden shadow-2xl border border-slate-200 flex flex-col h-[640px] max-h-[95vh]">
        {/* Purple Header Bar matching Image */}
        <div className="bg-[#701484] text-white p-4 flex items-center gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-sm tracking-wide">
            {currentLang === 'am' ? 'የቅርብ ጊዜ ዝውውሮች' : 'Mini Statement'}
          </h2>
        </div>

        {/* Content Container with White/Light Gray Background */}
        <div className="flex-1 bg-white p-6 flex flex-col items-center justify-center text-center space-y-6">
          {/* Rocket Icon inside soft light-purple circle */}
          <div className="w-24 h-24 rounded-full bg-[#f1ebf7] flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 24 24" className="w-13 h-13 text-[#701484] -rotate-12" fill="currentColor">
              {/* Stylized high fidelity CBE rocket */}
              <path d="M19.5,4.5 C19.5,4.5 15,4.5 11,8 C9,9.5 8,11.5 8.5,13.5 L4.5,17.5 C4,18 4,19 4.5,19.5 C5,20 6,20 6.5,19.5 L10.5,15.5 C12.5,16 14.5,15 16,13 C19.5,9 19.5,4.5 19.5,4.5 Z M14,10 C13,10 12,9 12,8 C12,7 13,6 14,6 C15,6 16,7 16,8 C16,9 15,10 14,10 Z" />
              <path d="M4.5,15.5 L7.5,14 L6,12.5 Z" />
              <path d="M8.5,19.5 L10,16.5 L11.5,18 Z" />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold tracking-tight text-slate-800 pt-2">
            Coming Soon
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[280px]">
            {currentLang === 'am' 
              ? 'በቅርቡ አዲስ የሒሳብ መግለጫ ማውጫ አገልግሎት ይዘንላችሁ እንመጣለን! ሒሳብዎን እና የሚፈልጉትን የጊዜ ገደብ መርጠው መግለጫ ማመንጨት ይችላሉ።'
              : 'We are working on a new Mini Statement feature! You will soon be able to pick your account and set a time range to generate your statement.'
            }
          </p>

          {/* Go Back button */}
          <div className="pt-4 w-full px-8">
            <button
              onClick={onClose}
              type="button"
              className="w-full py-2.5 bg-[#701484] hover:bg-[#620d69] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
