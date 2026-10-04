import React from 'react';
import { Eye, EyeOff, ArrowDownLeft, ArrowUpRight, TrendingUp, Building2, Wallet, Landmark } from 'lucide-react';
import { CbeAccount, BankId, Language } from '../types/banking';
import { formatCurrency } from '../utils/smsParser';
import { getTranslation } from '../locales/translations';

interface AccountOverviewProps {
  accounts: CbeAccount[];
  selectedBankId: BankId | 'all';
  onSelectBank: (id: BankId | 'all') => void;
  hideBalance: boolean;
  onToggleHideBalance: () => void;
  currentLang: Language;
  totalInflow: number;
  totalOutflow: number;
  transactionsCount: number;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({
  accounts,
  selectedBankId,
  onSelectBank,
  hideBalance,
  onToggleHideBalance,
  currentLang,
  totalInflow,
  totalOutflow,
  transactionsCount,
}) => {
  const t = getTranslation(currentLang) as any;

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const activeAccount = accounts.find((a) => a.id === selectedBankId);
  const currentDisplayBalance = selectedBankId === 'all' ? totalBalance : activeAccount?.balance || 0;
  const netFlow = totalInflow - totalOutflow;

  const getBankIcon = (id: BankId | 'all') => {
    switch (id) {
      case 'telebirr':
        return <Wallet className="w-4 h-4" />;
      case 'rigged':
        return <Landmark className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  return (
    <section className="space-y-4">
      {/* Top Banner & Balance Display */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/90 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {selectedBankId === 'all' ? t.combinedBalance : (currentLang === 'am' ? activeAccount?.nameAm : activeAccount?.nameEn)}
              </span>
              <button
                onClick={onToggleHideBalance}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-800/60"
                title={hideBalance ? t.showBalance : t.hideBalance}
              >
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono tabular-nums">
                {hideBalance ? '•••••••••• ETB' : formatCurrency(currentDisplayBalance, 'ETB')}
              </h1>
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className="font-mono text-emerald-400 font-medium">
                {selectedBankId === 'all' ? '6 Active Linked Accounts' : (currentLang === 'am' ? activeAccount?.accountTypeAm : activeAccount?.accountTypeEn)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-400">
                {selectedBankId === 'all' ? 'Consolidated Ledger' : activeAccount?.accountNumber}
              </span>
            </p>
          </div>

          {/* Key Metric Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{t.totalInflow}</span>
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-sm sm:text-base font-bold text-emerald-400 font-mono tabular-nums">
                {hideBalance ? '•••••' : `+${formatCurrency(totalInflow, '')}`}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Inward transfers & payroll</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{t.totalOutflow}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-200 font-mono tabular-nums">
                {hideBalance ? '•••••' : `-${formatCurrency(totalOutflow, '')}`}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Bills, merchants, transfers</span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{t.netFlow}</span>
                <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className={`text-sm sm:text-base font-bold font-mono tabular-nums ${netFlow >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                {hideBalance ? '•••••' : `${netFlow >= 0 ? '+' : ''}${formatCurrency(netFlow, '')}`}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">{transactionsCount} entries verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Selection Chips / Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        <button
          onClick={() => onSelectBank('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedBankId === 'all'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
              : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{t.allAccounts}</span>
          <span className="font-mono text-[11px] px-1.5 py-0.2 bg-slate-800 rounded text-slate-300">
            {accounts.length}
          </span>
        </button>

        {accounts.map((acc) => {
          const isSelected = selectedBankId === acc.id;
          return (
            <button
              key={acc.id}
              onClick={() => onSelectBank(acc.id as any)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                  : 'bg-slate-900/90 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className={`p-1 rounded-md border text-[11px] font-mono font-bold ${(acc as any).iconBg || 'bg-purple-900 text-purple-200'}`}>
                {(acc as any).brandCode || 'CBE'}
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-200 leading-tight">
                  {currentLang === 'am' ? acc.nameAm : acc.nameEn}
                </div>
                <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                  {hideBalance ? '••••••' : formatCurrency(acc.balance, 'ETB')}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
