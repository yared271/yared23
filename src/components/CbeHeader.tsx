import React from 'react';
import { Globe, ArrowRightLeft, Send, FileSpreadsheet, Smartphone, Landmark } from 'lucide-react';
import { Language } from '../types/banking';
import { getTranslation } from '../locales/translations';

interface CbeHeaderProps {
  currentLang: Language;
  onToggleLang: () => void;
  activeTab: 'ledger' | 'sms' | 'statement';
  onSelectTab: (tab: 'ledger' | 'sms' | 'statement') => void;
  onOpenCbeTransfer: () => void;
  onOpenOtherTransfer: () => void;
}

export const CbeHeader: React.FC<CbeHeaderProps> = ({
  currentLang,
  onToggleLang,
  activeTab,
  onSelectTab,
  onOpenCbeTransfer,
  onOpenOtherTransfer,
}) => {
  const t = getTranslation(currentLang);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-900/60 bg-purple-950/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center">
            <div className="h-full w-full bg-purple-950 rounded-[10px] flex items-center justify-center">
              <Landmark className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('ledger');
            }}
            className="flex flex-col text-left hover:opacity-95 transition-opacity"
          >
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight">
              {currentLang === 'am' ? 'የኢትዮጵያ ንግድ ባንክ' : 'Commercial Bank of Ethiopia'}
            </span>
            <span className="text-[10px] font-semibold text-amber-400 font-mono tracking-wider">
              CBE MOBILE BANKING · ሁሌም የሚተማመኑበት ባንክ
            </span>
          </a>
        </div>

        {/* Zone 2: Clean Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-purple-900/50 p-1 rounded-xl border border-purple-800/80">
          <button
            onClick={() => onSelectTab('ledger')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'ledger'
                ? 'bg-purple-800 text-amber-300 shadow-sm border border-purple-700/60'
                : 'text-purple-200 hover:text-white hover:bg-purple-800/40'
            }`}
          >
            {currentLang === 'am' ? 'የትራንዛክሽን ሌጀር' : 'Ledger & Accounts'}
          </button>

          <button
            onClick={() => onSelectTab('sms')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'sms'
                ? 'bg-purple-800 text-amber-300 shadow-sm border border-purple-700/60'
                : 'text-purple-200 hover:text-white hover:bg-purple-800/40'
            }`}
          >
            {currentLang === 'am' ? 'የ-CBE SMS መፍቻ' : 'SMS Parser'}
          </button>

          <button
            onClick={() => onSelectTab('statement')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'statement'
                ? 'bg-purple-800 text-amber-300 shadow-sm border border-purple-700/60'
                : 'text-purple-200 hover:text-white hover:bg-purple-800/40'
            }`}
          >
            {currentLang === 'am' ? 'የባንክ እስቴትመንት' : 'Statement'}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-800/80 bg-purple-900/60 hover:bg-purple-850 text-xs font-medium text-purple-200 transition-colors"
            title="Toggle Language / ቋንቋ ቀይር"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono uppercase font-bold">{currentLang === 'am' ? 'English' : 'አማርኛ'}</span>
          </button>

          <button
            onClick={onOpenCbeTransfer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-purple-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-[0.98] rounded-xl transition-all shadow-md shadow-amber-500/20 whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{currentLang === 'am' ? '+ ገንዘብ አስተላልፍ' : '+ Transfer'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
