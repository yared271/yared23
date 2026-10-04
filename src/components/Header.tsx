import React from 'react';
import { ShieldCheck, Plus, Globe, Smartphone, FileSpreadsheet, BarChart3, ListFilter } from 'lucide-react';
import { Language } from '../types/banking';
import { getTranslation } from '../locales/translations';

interface HeaderProps {
  currentLang: Language;
  onToggleLang: () => void;
  activeTab: 'ledger' | 'analytics' | 'sms' | 'statement';
  onSelectTab: (tab: 'ledger' | 'analytics' | 'sms' | 'statement') => void;
  onOpenNewTransfer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onToggleLang,
  activeTab,
  onSelectTab,
  onOpenNewTransfer,
}) => {
  const t = getTranslation(currentLang) as any;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="h-full w-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('ledger');
            }}
            className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-95 transition-opacity"
          >
            <span>RiggedBank</span>
            <span className="text-xs font-medium text-emerald-400 font-mono px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
              {currentLang === 'am' ? 'ሪግድ ባንክ' : 'CORE'}
            </span>
          </a>
        </div>

        {/* Zone 2: 4 Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onSelectTab('ledger')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'ledger'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>{currentLang === 'am' ? 'የትራንዛክሽን ሌጀር' : 'Ledger & History'}</span>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{currentLang === 'am' ? 'ትንተና' : 'Analytics'}</span>
          </button>

          <button
            onClick={() => onSelectTab('sms')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'sms'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{currentLang === 'am' ? 'የባንክ SMS መፍቻ' : 'SMS Parser'}</span>
          </button>

          <button
            onClick={() => onSelectTab('statement')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'statement'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{currentLang === 'am' ? 'እስቴትመንት' : 'Statement'}</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
            title="Toggle Language / ቋንቋ ቀይር"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono uppercase">{currentLang === 'am' ? 'English' : 'አማርኛ'}</span>
          </button>

          <button
            onClick={onOpenNewTransfer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] rounded-lg transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.newTransaction}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden items-center justify-around gap-1 mt-2.5 pt-2 border-t border-slate-800/60 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => onSelectTab('ledger')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
            activeTab === 'ledger' ? 'text-emerald-400 bg-slate-900' : 'text-slate-400'
          }`}
        >
          {currentLang === 'am' ? 'ሌጀር' : 'Ledger'}
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
            activeTab === 'analytics' ? 'text-emerald-400 bg-slate-900' : 'text-slate-400'
          }`}
        >
          {currentLang === 'am' ? 'ትንተና' : 'Analytics'}
        </button>
        <button
          onClick={() => onSelectTab('sms')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
            activeTab === 'sms' ? 'text-emerald-400 bg-slate-900' : 'text-slate-400'
          }`}
        >
          {currentLang === 'am' ? 'SMS መፍቻ' : 'SMS Parser'}
        </button>
        <button
          onClick={() => onSelectTab('statement')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
            activeTab === 'statement' ? 'text-emerald-400 bg-slate-900' : 'text-slate-400'
          }`}
        >
          {currentLang === 'am' ? 'እስቴትመንት' : 'Statement'}
        </button>
      </div>
    </header>
  );
};
