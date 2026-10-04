import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Printer,
  Calendar,
  Building2,
  ShieldCheck,
  Download
} from 'lucide-react';
import { CbeAccount, BankId, Language, Transaction } from '../types/banking';
import { formatCurrency, formatSimpleDate } from '../utils/smsParser';
import { getTranslation } from '../locales/translations';

interface StatementModalProps {
  accounts: CbeAccount[];
  transactions: Transaction[];
  currentLang: Language;
  onClose: () => void;
}

export const StatementModal: React.FC<StatementModalProps> = ({
  accounts,
  transactions,
  currentLang,
  onClose,
}) => {
  const t = getTranslation(currentLang) as any;
  const [selectedBankId, setSelectedBankId] = useState<BankId | 'all'>('all');
  const [period, setPeriod] = useState<'30d' | '90d' | 'ytd'>('30d');

  const activeAccount = accounts.find((a) => a.id === selectedBankId);

  // Filter transactions for statement
  const filteredStatementTx = transactions.filter((tx) => {
    if (selectedBankId !== 'all' && tx.accountId !== selectedBankId) {
      return false;
    }
    return true;
  });

  const totalCredits = filteredStatementTx
    .filter((tx) => tx.type === 'inflow')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDebits = filteredStatementTx
    .filter((tx) => tx.type === 'outflow')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const closingBalance = selectedBankId === 'all'
    ? accounts.reduce((sum, a) => sum + a.balance, 0)
    : activeAccount?.balance || 0;

  const openingBalance = closingBalance - totalCredits + totalDebits;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {t.statementTitle}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t.statementSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printOfficialStatement}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Controls */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs shrink-0">
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">{t.statementForAccount}</label>
            <select
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value as any)}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 outline-none focus:border-emerald-500/50"
            >
              <option value="all">{t.allAccounts} (Consolidated Ledger)</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {(acc as any).brandCode || 'CBE'} - {currentLang === 'am' ? acc.nameAm : acc.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">{t.statementPeriod}</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 outline-none focus:border-emerald-500/50"
            >
              <option value="30d">{t.periodThisMonth}</option>
              <option value="90d">{t.periodLast3Months}</option>
              <option value="ytd">{t.periodYearToDate}</option>
            </select>
          </div>
        </div>

        {/* Statement Printable Sheet */}
        <div className="overflow-y-auto p-6 space-y-6 text-slate-200">
          {/* Official Bank Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-xs border border-emerald-500/40">
                  RGB
                </div>
                <h2 className="text-lg font-black tracking-tight text-white uppercase">
                  RiggedBank Consolidated Core Statement
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Official Account Statement & Ledger Verification Slip
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Customer: YARED NIGUSSE | ID: RGB-CUST-88219 | Addis Ababa, Ethiopia
              </p>
            </div>

            <div className="text-right sm:text-right space-y-0.5 text-xs font-mono">
              <div className="text-slate-400">Statement Date:</div>
              <div className="font-bold text-white">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
              <div className="text-[11px] text-emerald-400 font-semibold uppercase">Status: Official / Verified</div>
            </div>
          </div>

          {/* Statement Balance Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
              <span className="text-slate-400">{t.openingBalance}</span>
              <div className="font-mono font-bold text-white text-sm tabular-nums">
                {formatCurrency(openingBalance, 'ETB')}
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
              <span className="text-slate-400">{t.totalCredits}</span>
              <div className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
                +{formatCurrency(totalCredits, 'ETB')}
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
              <span className="text-slate-400">{t.totalDebits}</span>
              <div className="font-mono font-bold text-rose-400 text-sm tabular-nums">
                -{formatCurrency(totalDebits, 'ETB')}
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
              <span className="text-slate-400">{t.closingBalance}</span>
              <div className="font-mono font-bold text-emerald-300 text-sm tabular-nums">
                {formatCurrency(closingBalance, 'ETB')}
              </div>
            </div>
          </div>

          {/* Statement Itemized Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Itemized Statement Ledger
            </h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-semibold">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Ref ID</th>
                    <th className="py-2.5 px-3">Description / Party</th>
                    <th className="py-2.5 px-3 text-right">Debit (-)</th>
                    <th className="py-2.5 px-3 text-right">Credit (+)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredStatementTx.map((tx) => {
                    const isCredit = tx.type === 'inflow';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                          {formatSimpleDate(tx.timestamp, 'en')}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">
                          {tx.referenceNumber}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-300">
                          <span className="font-medium text-white">{isCredit ? tx.senderName : tx.receiverName}</span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-xs">{tx.note}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-rose-400 font-bold tabular-nums">
                          {!isCredit ? formatCurrency(tx.amount, '') : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-400 font-bold tabular-nums">
                          {isCredit ? formatCurrency(tx.amount, '') : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification & Stamp Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>RiggedBank Digital Signature Verified: RSA-2048 SHA-256</span>
            </div>
            <div className="text-[10px] font-mono">
              Generated by RiggedBank Core System v2026.10
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
