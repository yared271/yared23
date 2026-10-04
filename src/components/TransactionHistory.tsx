import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Download,
  Printer,
  Copy,
  Check,
  FilterX,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Clock,
  AlertCircle,
  Tag,
  Calendar,
  Smartphone
} from 'lucide-react';
import { CbeAccount, BankId, Language, Transaction, TransactionCategory, TransactionType } from '../types/banking';
import { formatCurrency, formatSimpleDate } from '../utils/smsParser';
import { getTranslation } from '../locales/translations';

interface TransactionHistoryProps {
  transactions: Transaction[];
  accounts: CbeAccount[];
  selectedBankId: BankId | 'all';
  currentLang: Language;
  onViewReceipt: (transaction: Transaction) => void;
  onOpenNewTransfer: () => void;
  onOpenSmsParser: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  accounts,
  selectedBankId,
  currentLang,
  onViewReceipt,
  onOpenNewTransfer,
  onOpenSmsParser,
}) => {
  const t = getTranslation(currentLang) as any;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all' | 'pending'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique categories
  const categories: TransactionCategory[] = [
    'Salary',
    'Transfer',
    'Bill Payment',
    'Airtime',
    'Merchant QR',
    'Utility',
    'Food & Dining',
    'Shopping',
    'Fee',
    'Refund',
    'Savings'
  ];

  // Filtering Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filter by bank
      if (selectedBankId !== 'all' && tx.accountId !== selectedBankId) {
        return false;
      }

      // Filter by type
      if (selectedType === 'pending') {
        if (tx.status !== 'pending') return false;
      } else if (selectedType !== 'all') {
        if (tx.type !== selectedType) return false;
      }

      // Filter by category
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }

      // Filter by Date
      if (dateFilter !== 'all') {
        const txDate = new Date(tx.timestamp).getTime();
        const now = new Date().getTime();
        const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90;
        const cutoff = now - days * 24 * 60 * 60 * 1000;
        if (txDate < cutoff) return false;
      }

      // Filter by Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchRef = tx.referenceNumber.toLowerCase().includes(query);
        const matchId = tx.id.toLowerCase().includes(query);
        const matchSender = tx.senderName.toLowerCase().includes(query);
        const matchReceiver = tx.receiverName.toLowerCase().includes(query);
        const matchNote = tx.note.toLowerCase().includes(query);
        const matchPhone = (tx.payerPhone || '').includes(query) || (tx.payeePhone || '').includes(query);
        const matchAmount = tx.amount.toString().includes(query);

        if (!matchRef && !matchId && !matchSender && !matchReceiver && !matchNote && !matchPhone && !matchAmount) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, selectedBankId, selectedType, selectedCategory, dateFilter, searchQuery]);

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = ['Transaction ID', 'Reference', 'Date', 'Type', 'Category', 'Bank Account', 'Counterparty', 'Amount (ETB)', 'Fee', 'Status', 'Note'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.referenceNumber,
      tx.timestamp,
      tx.type,
      tx.category,
      tx.accountId,
      `"${tx.type === 'inflow' ? tx.senderName : tx.receiverName}"`,
      tx.amount,
      tx.fee,
      tx.status,
      `"${tx.note.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RiggedBank_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintLedger = () => {
    window.print();
  };

  const getAccountBrand = (accId: string) => {
    const acc = accounts.find((a) => a.id === accId);
    return acc ? (acc as any).brandCode || 'CBE' : 'CBE';
  };

  const getAccountBadgeStyle = (accId: string) => {
    const acc = accounts.find((a) => a.id === accId);
    return (acc as any)?.iconBg || 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Export & Print Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all active:scale-[0.98]"
              title="Download filtered CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{t.exportCsv}</span>
            </button>

            <button
              onClick={handlePrintLedger}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all active:scale-[0.98]"
              title="Print transaction table"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">{t.printReport}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          {/* Transaction Type Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-x-auto">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedType === 'all'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.allTypes}
            </button>
            <button
              onClick={() => setSelectedType('inflow')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedType === 'inflow'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.inflow}
            </button>
            <button
              onClick={() => setSelectedType('outflow')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedType === 'outflow'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.outflow}
            </button>
            <button
              onClick={() => setSelectedType('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedType === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.pending}
            </button>
          </div>

          {/* Secondary Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label={t.filterCategory}
                className="appearance-none bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                <option value="all">{t.allCategories}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Tag className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>

            {/* Date Range Filter */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                aria-label={t.filterDate}
                className="appearance-none bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                <option value="all">All Dates (ሁሉንም)</option>
                <option value="7d">Last 7 Days (7 ቀናት)</option>
                <option value="30d">Last 30 Days (30 ቀናት)</option>
                <option value="90d">Last 90 Days (3 ወራት)</option>
              </select>
              <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>

            {/* Clear Filters Button if any active */}
            {(selectedType !== 'all' || selectedCategory !== 'all' || dateFilter !== 'all' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSelectedCategory('all');
                  setDateFilter('all');
                  setSearchQuery('');
                }}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors px-2 py-1"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>{t.clearFilters}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-wide">
              {t.transactionHistory}
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              ({filteredTransactions.length} records)
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            {t.showingOf.replace('{count}', filteredTransactions.length.toString()).replace('{total}', transactions.length.toString())}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-semibold text-slate-200">
                {t.noTransactionsFound}
              </h3>
              <p className="text-xs text-slate-400">
                Try adjusting your search keywords, clearing active filters, or parse a bank SMS to add fresh transactions.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSelectedCategory('all');
                  setDateFilter('all');
                  setSearchQuery('');
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {t.clearFilters}
              </button>
              <button
                onClick={onOpenSmsParser}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t.parseSms}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Table of Transactions */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/50 text-slate-400 font-semibold tracking-wider uppercase text-[10px]">
                  <th className="py-3 px-4 sm:px-6">{t.colDateTime}</th>
                  <th className="py-3 px-4">{t.colReference}</th>
                  <th className="py-3 px-4">{t.colParty}</th>
                  <th className="py-3 px-4 hidden md:table-cell">{t.colCategory}</th>
                  <th className="py-3 px-4 hidden lg:table-cell">{t.colAccount}</th>
                  <th className="py-3 px-4 text-right">{t.colAmount}</th>
                  <th className="py-3 px-4 text-center">{t.colStatus}</th>
                  <th className="py-3 px-4 sm:px-6 text-right">{t.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.map((tx) => {
                  const isInflow = tx.type === 'inflow';
                  const isCopied = copiedId === tx.id;

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onViewReceipt(tx)}
                      className="group hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <div className="font-mono text-slate-300 font-medium">
                          {formatSimpleDate(tx.timestamp, currentLang)}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span>{tx.channel}</span>
                        </div>
                      </td>

                      {/* Reference & Copy Button */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-300 font-semibold tracking-tight">
                            {tx.referenceNumber}
                          </span>
                          <button
                            onClick={(e) => handleCopy(tx.id, tx.referenceNumber, e)}
                            className="p-1 rounded text-slate-500 hover:text-emerald-400 hover:bg-slate-700/50 transition-colors"
                            title="Copy Reference ID"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                          {tx.hash.slice(0, 16)}...
                        </div>
                      </td>

                      {/* Counterparty & Remark */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">
                          {isInflow ? tx.senderName : tx.receiverName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-[280px]">
                          {tx.note}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 hidden md:table-cell whitespace-nowrap">
                        <span className="text-slate-300 font-medium">
                          {tx.category}
                        </span>
                      </td>

                      {/* Bank / Account */}
                      <td className="py-3.5 px-4 hidden lg:table-cell whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${getAccountBadgeStyle(tx.accountId)}`}>
                          {getAccountBrand(tx.accountId)}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className={`font-mono text-sm font-bold tabular-nums flex items-center justify-end gap-1 ${
                            isInflow ? 'text-emerald-400' : 'text-slate-200'
                          }`}
                        >
                          {isInflow ? '+' : '-'} {formatCurrency(tx.amount, '')}
                          <span className="text-[10px] text-slate-400 font-normal">ETB</span>
                        </div>
                        {tx.fee > 0 && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            Fee: {formatCurrency(tx.fee + tx.vat, 'ETB')}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {tx.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{t.statusCompleted}</span>
                          </span>
                        ) : tx.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{t.statusPending}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400">
                            <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>{t.statusFailed}</span>
                          </span>
                        )}
                      </td>

                      {/* Receipt Action */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewReceipt(tx);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-all group-hover:border-emerald-500/50"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>{t.colAction}</span>
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
