import React from 'react';
import { Eye, EyeOff, Wallet, Landmark, ShieldCheck, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { CbeAccount, Language } from '../types/banking';
import { formatCurrency } from '../utils/smsParser';
import { getTranslation } from '../locales/translations';

interface CbeHeroCardsProps {
  accounts: CbeAccount[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  hideBalance: boolean;
  onToggleHideBalance: () => void;
  currentLang: Language;
  totalInflow: number;
  totalOutflow: number;
}

export const CbeHeroCards: React.FC<CbeHeroCardsProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  hideBalance,
  onToggleHideBalance,
  currentLang,
  totalInflow,
  totalOutflow,
}) => {
  const t = getTranslation(currentLang);
  const primaryAccount = accounts.find((a) => a.id === 'cbe-primary') || accounts[0];
  const birrAccount = accounts.find((a) => a.id === 'cbe-birr');

  return (
    <section className="space-y-4">
      {/* CBE Iconic Purple & Gold Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main CBE Saving Account Card */}
        <div
          onClick={() => onSelectAccount('cbe-primary')}
          className={`md:col-span-2 cursor-pointer rounded-2xl p-6 relative overflow-hidden transition-all duration-300 border ${
            selectedAccountId === 'cbe-primary'
              ? 'bg-gradient-to-br from-[#4a0e4e] via-[#380b3b] to-[#250727] border-amber-500/60 shadow-xl shadow-purple-950/50 ring-1 ring-amber-400/30'
              : 'bg-gradient-to-br from-[#3b0b3e] to-[#1e0420] border-purple-900/60 hover:border-purple-700'
          }`}
        >
          {/* Subtle CBE geometric background pattern */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
                    {currentLang === 'am' ? 'የኢትዮጵያ ንግድ ባንክ' : 'Commercial Bank of Ethiopia'}
                  </span>
                </div>
                <h2 className="text-sm font-semibold text-purple-100">
                  {currentLang === 'am' ? primaryAccount.accountTypeAm : primaryAccount.accountTypeEn}
                </h2>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHideBalance();
                }}
                className="text-purple-300 hover:text-white p-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-900/70 border border-purple-800/60 transition-colors"
                title={hideBalance ? t.showBalance : t.hideBalance}
              >
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-amber-300" />}
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-purple-300">
                {t.availableBalance}
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight tabular-nums">
                {hideBalance ? '•••••••••• ETB' : formatCurrency(primaryAccount.balance, 'ETB')}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-900/60 text-xs">
              <div className="flex items-center gap-2 font-mono text-purple-200">
                <span className="text-purple-400">{t.accountNumber}:</span>
                <span className="font-bold tracking-wider text-amber-200">{primaryAccount.accountNumber}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{currentLang === 'am' ? 'ተረጋግጧል (Active)' : 'Verified & Active'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary: CBE Birr Wallet Card */}
        {birrAccount && (
          <div
            onClick={() => onSelectAccount('cbe-birr')}
            className={`cursor-pointer rounded-2xl p-6 relative overflow-hidden transition-all duration-300 border flex flex-col justify-between space-y-4 ${
              selectedAccountId === 'cbe-birr'
                ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 border-amber-400/60 shadow-xl ring-1 ring-amber-400/30'
                : 'bg-gradient-to-br from-slate-900 to-purple-950/80 border-purple-900/60 hover:border-purple-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300 font-mono">
                  {t.cbeBirrWallet}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 bg-slate-800 rounded">
                *889#
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400">
                {t.availableBalance}
              </span>
              <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
                {hideBalance ? '••••••' : formatCurrency(birrAccount.balance, 'ETB')}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs font-mono flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Wallet Phone:</span>
              <span className="font-bold text-sky-300">{birrAccount.accountNumber}</span>
            </div>
          </div>
        )}
      </div>

      {/* Inflow vs Outflow Mini Gauges */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-purple-950/60 border border-purple-900/60 rounded-xl p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-purple-300">{currentLang === 'am' ? 'አጠቃላይ ገቢ (+)' : 'Total Inflow'}</span>
            <div className="text-sm sm:text-base font-bold text-emerald-400 font-mono tabular-nums">
              {hideBalance ? '••••••' : `+${formatCurrency(totalInflow, 'ETB')}`}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-purple-950/60 border border-purple-900/60 rounded-xl p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-purple-300">{currentLang === 'am' ? 'አጠቃላይ ወጪ (-)' : 'Total Outflow'}</span>
            <div className="text-sm sm:text-base font-bold text-rose-300 font-mono tabular-nums">
              {hideBalance ? '••••••' : `-${formatCurrency(totalOutflow, 'ETB')}`}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </section>
  );
};
