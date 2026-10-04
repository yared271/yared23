import React from 'react';
import {
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Tag,
  Users,
  Wallet,
  Calendar
} from 'lucide-react';
import { CbeAccount, BankId, Language, Transaction } from '../types/banking';
import { formatCurrency } from '../utils/smsParser';
import { getTranslation } from '../locales/translations';

interface AnalyticsViewProps {
  transactions: Transaction[];
  accounts: CbeAccount[];
  currentLang: Language;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  accounts,
  currentLang,
}) => {
  const t = getTranslation(currentLang) as any;

  const totalInflow = transactions
    .filter((tx) => tx.type === 'inflow')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOutflow = transactions
    .filter((tx) => tx.type === 'outflow')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Category Outflow breakdown
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === 'outflow')
    .forEach((tx) => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // Top Payees
  const payeeTotals: Record<string, { count: number; total: number }> = {};
  transactions
    .filter((tx) => tx.type === 'outflow')
    .forEach((tx) => {
      const name = tx.receiverName;
      if (!payeeTotals[name]) {
        payeeTotals[name] = { count: 0, total: 0 };
      }
      payeeTotals[name].count += 1;
      payeeTotals[name].total += tx.amount;
    });

  const sortedPayees = Object.entries(payeeTotals).sort((a, b) => b[1].total - a[1].total).slice(0, 5);

  const outflowTxCount = transactions.filter((tx) => tx.type === 'outflow').length;
  const avgOutflow = outflowTxCount > 0 ? totalOutflow / outflowTxCount : 0;

  return (
    <div className="space-y-6">
      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.totalInflow}</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
            +{formatCurrency(totalInflow, 'ETB')}
          </div>
          <p className="text-[11px] text-slate-500">
            From {transactions.filter((tx) => tx.type === 'inflow').length} incoming transactions
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.totalOutflow}</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-200 font-mono tabular-nums">
            -{formatCurrency(totalOutflow, 'ETB')}
          </div>
          <p className="text-[11px] text-slate-500">
            Across {outflowTxCount} outgoing payments
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.avgTransactionSize}</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-extrabold text-teal-400 font-mono tabular-nums">
            {formatCurrency(avgOutflow, 'ETB')}
          </div>
          <p className="text-[11px] text-slate-500">
            Average per debit transaction
          </p>
        </div>
      </div>

      {/* Two-Column Analytics Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                {t.spendingByCategory}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{sortedCategories.length} Categories</span>
          </div>

          <div className="space-y-3.5">
            {sortedCategories.map(([category, amount]) => {
              const percent = totalOutflow > 0 ? (amount / totalOutflow) * 100 : 0;
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">{percent.toFixed(1)}%</span>
                      <span className="font-mono font-bold text-slate-100">{formatCurrency(amount, 'ETB')}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Counterparties / Payees */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                {t.topCounterparties}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Frequent Payees</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {sortedPayees.map(([name, data]) => (
              <div key={name} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-200">{name}</div>
                  <div className="text-[11px] text-slate-500">{data.count} transactions completed</div>
                </div>
                <div className="text-right font-mono font-bold text-slate-100 tabular-nums">
                  {formatCurrency(data.total, 'ETB')}
                </div>
              </div>
            ))}
          </div>

          {/* Account Distribution summary */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Bank Balance Liquidity Share
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {accounts.map((acc) => (
                <div key={acc.id} className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                  <span className="font-medium text-slate-300">{(acc as any).brandCode || 'CBE'}</span>
                  <span className="font-mono text-slate-400">{formatCurrency(acc.balance, 'ETB')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
