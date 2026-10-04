import React, { useState, useMemo } from 'react';
import {
  Search,
  Receipt,
  Download,
  Printer,
  Copy,
  Check,
  FilterX,
  ShieldCheck,
  Send,
  Building2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Language, Transaction, TransferMode } from '../types/banking';
import { formatCurrency, formatSimpleDate } from '../utils/smsParser';
import { getTranslation } from '../locales/translations';

interface CbeTransactionLedgerProps {
  transactions: Transaction[];
  currentLang: Language;
  onViewReceipt: (tx: Transaction) => void;
  onOpenCbeTransfer: () => void;
  onOpenOtherTransfer: () => void;
}

export const CbeTransactionLedger: React.FC<CbeTransactionLedgerProps> = ({
  transactions,
  currentLang,
  onViewReceipt,
  onOpenCbeTransfer,
  onOpenOtherTransfer,
}) => {
  const t = getTranslation(currentLang);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filter by mode
      if (filterMode === 'cbe') {
        if (tx.transferMode !== 'cbe_to_cbe') return false;
      } else if (filterMode === 'other') {
        if (tx.transferMode !== 'other_banks' && tx.transferMode !== 'cbe_birr') return false;
      } else if (filterMode === 'inflow') {
        if (tx.type !== 'inflow') return false;
      } else if (filterMode === 'outflow') {
        if (tx.type !== 'outflow') return false;
      }

      // Filter by Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchRef = tx.referenceNumber.toLowerCase().includes(q);
        const matchSender = tx.senderName.toLowerCase().includes(q);
        const matchReceiver = tx.receiverName.toLowerCase().includes(q);
        const matchNote = tx.note.toLowerCase().includes(q);
        const matchAcc = tx.receiverAccount.toLowerCase().includes(q) || tx.senderAccount.toLowerCase().includes(q);
        const matchAmount = tx.amount.toString().includes(q);

        if (!matchRef && !matchSender && !matchReceiver && !matchNote && !matchAcc && !matchAmount) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, filterMode, searchQuery]);

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = ['Ref FT', 'Date', 'Type', 'Transfer Mode', 'Sender', 'Receiver', 'Receiver Bank', 'Amount (ETB)', 'Fee', 'Purpose'];
    const rows = filteredTransactions.map((tx) => [
      tx.referenceNumber,
      tx.timestamp,
      tx.type,
      tx.transferMode,
      `"${tx.senderName}"`,
      `"${tx.receiverName}"`,
      `"${tx.receiverBank}"`,
      tx.amount,
      tx.fee,
      `"${tx.note.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CBE_Transaction_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Search & Action Filters */}
      <div className="bg-[#2a072d] border border-purple-800/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-purple-950/80 border border-purple-700/80 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-xs sm:text-sm text-purple-100 placeholder:text-purple-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Export & Print */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-900 hover:bg-purple-800 text-purple-200 border border-purple-700 transition-all active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.exportCsv}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-900 hover:bg-purple-800 text-purple-200 border border-purple-700 transition-all active:scale-[0.98]"
            >
              <Printer className="w-3.5 h-3.5 text-purple-300" />
              <span>{t.printReport}</span>
            </button>
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-purple-950/90 rounded-xl border border-purple-800/80 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
              filterMode === 'all'
                ? 'bg-amber-400 text-purple-950 shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            {t.filterAll} ({transactions.length})
          </button>

          <button
            onClick={() => setFilterMode('cbe')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              filterMode === 'cbe'
                ? 'bg-amber-400 text-purple-950 shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <Send className="w-3 h-3" />
            <span>{t.filterCbeOnly}</span>
          </button>

          <button
            onClick={() => setFilterMode('other')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              filterMode === 'other'
                ? 'bg-sky-400 text-slate-950 shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>{t.filterOtherBanks}</span>
          </button>

          <button
            onClick={() => setFilterMode('inflow')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
              filterMode === 'inflow'
                ? 'bg-emerald-400 text-slate-950 shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            {t.filterInflow}
          </button>

          <button
            onClick={() => setFilterMode('outflow')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
              filterMode === 'outflow'
                ? 'bg-rose-400 text-slate-950 shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            {t.filterOutflow}
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-[#240626] border border-purple-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:px-6 py-3.5 border-b border-purple-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-white tracking-wide">
              {t.transactionHistoryTitle}
            </h3>
            <span className="text-xs text-amber-400 font-mono">
              ({filteredTransactions.length} records)
            </span>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-3">
            <p className="text-xs text-purple-300">
              {t.noRecordsFound}
            </p>
            <button
              onClick={() => {
                setFilterMode('all');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-amber-300 bg-purple-900 rounded-lg hover:bg-purple-800"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-900/80 bg-purple-950/70 text-purple-300 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4 sm:px-6">Date / Ref</th>
                  <th className="py-3 px-4">Beneficiary / Payer</th>
                  <th className="py-3 px-4 hidden md:table-cell">Transfer Mode</th>
                  <th className="py-3 px-4 text-right">Amount (ETB)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">CBE Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/40">
                {filteredTransactions.map((tx) => {
                  const isInflow = tx.type === 'inflow';
                  const isCbe = tx.transferMode === 'cbe_to_cbe';
                  const isCopied = copiedId === tx.id;

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onViewReceipt(tx)}
                      className="group hover:bg-purple-900/30 cursor-pointer transition-colors"
                    >
                      {/* Date & FT Reference */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <div className="font-mono text-purple-100 font-bold">
                          {tx.referenceNumber}
                        </div>
                        <div className="text-[11px] text-purple-400">
                          {formatSimpleDate(tx.timestamp, currentLang)}
                        </div>
                      </td>

                      {/* Party & Remark */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">
                          {isInflow ? tx.senderName : tx.receiverName}
                        </div>
                        <div className="text-[11px] text-purple-300 truncate max-w-xs">
                          {tx.note}
                        </div>
                      </td>

                      {/* Mode Badge */}
                      <td className="py-3.5 px-4 hidden md:table-cell whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          isCbe
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : 'bg-sky-400/20 text-sky-300 border border-sky-400/40'
                        }`}>
                          {isCbe ? 'CBE to CBE (0.00 Fee)' : 'EthSwitch / Telebirr'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className={`font-mono text-sm font-extrabold tabular-nums ${
                            isInflow ? 'text-emerald-400' : 'text-amber-200'
                          }`}
                        >
                          {isInflow ? '+' : '-'} {formatCurrency(tx.amount, '')}
                          <span className="text-[10px] text-purple-400 font-normal ml-1">ETB</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>Settled</span>
                        </span>
                      </td>

                      {/* Receipt Action */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewReceipt(tx);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-purple-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-lg transition-all shadow-sm"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>{currentLang === 'am' ? 'ደረሰኝ' : 'Slip'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
