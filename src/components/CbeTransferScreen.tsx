import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  User,
  Banknote,
  Trash2,
  Plus,
  ChevronDown,
  AlertCircle,
  Loader2,
  Building2,
  RotateCcw,
  Eye,
  EyeOff,
  Wallet,
} from 'lucide-react';
import { CbeAccount, Language, Transaction } from '../types/banking';
import { generateSecurityHash } from '../utils/smsParser';
import { findUserByAccountOrPhone, formatEnglishNameOnly, formatCbeName } from '../utils/userDatabase';
import { VERIFIED_CBE_BENEFICIARIES } from '../data/initialData';

interface CbeTransferScreenProps {
  currentLang: Language;
  account: CbeAccount;
  userName?: string;
  onBack: () => void;
  onTransferSuccess: (tx: Transaction) => void;
}

interface RecentTransferItem {
  id: string;
  name: string;
  maskedAccount: string;
  fullAccount: string;
}

const DEFAULT_RECENT_TRANSFERS: RecentTransferItem[] = [
  { id: '1', name: 'Kaleb Zewedu Woldesenbet', maskedAccount: '1*********7646', fullAccount: '1000348297646' },
  { id: '2', name: 'Meron G/meskel Kebede', maskedAccount: '1*********2178', fullAccount: '1000217821789' },
  { id: '3', name: 'Mikiyas Kasa Birhanu', maskedAccount: '1*********5051', fullAccount: '1000505150512' },
  { id: '4', name: 'Betelihem Molla Morka', maskedAccount: '1*********4801', fullAccount: '1000480148013' },
];

export const CbeTransferScreen: React.FC<CbeTransferScreenProps> = ({
  currentLang,
  account,
  userName = 'User',
  onBack,
  onTransferSuccess,
}) => {
  const [accountType, setAccountType] = useState<'other' | 'own'>('other');
  const [accountNumber, setAccountNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('MB transfer');
  const [showRemarkInput, setShowRemarkInput] = useState(false);
  const [hideFromBalance, setHideFromBalance] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  // Persistent Recent Transfers state
  const [recentTransfers, setRecentTransfers] = useState<RecentTransferItem[]>(() => {
    try {
      const saved = localStorage.getItem('cbe_recent_transfers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse recent transfers', e);
    }
    return DEFAULT_RECENT_TRANSFERS;
  });

  const updateRecentTransfers = (newList: RecentTransferItem[]) => {
    setRecentTransfers(newList);
    try {
      localStorage.setItem('cbe_recent_transfers', JSON.stringify(newList));
    } catch (e) {
      console.error('Failed to save recent transfers', e);
    }
  };

  const handleAccountChange = (val: string) => {
    // Digits only, max 13 digits
    const clean = val.replace(/\D/g, '').slice(0, 13);
    setAccountNumber(clean);

    // Dynamic registered beneficiary lookup
    if (clean.length >= 9) {
      const match = findUserByAccountOrPhone(clean);
      if (match && match.userProfile.fullName) {
        setRecipientName(formatEnglishNameOnly(match.userProfile.fullName));
      } else {
        const verified = VERIFIED_CBE_BENEFICIARIES.find(
          (b) => b.accountNumber === clean || b.phone === clean
        );
        if (verified) {
          setRecipientName(formatEnglishNameOnly(verified.fullName));
        } else {
          // Dynamic realistic Ethiopian English names
          const sampleNames = [
            'Selamawit Tadesse Haile',
            'Mikyas Kassa Birhanu',
            'Dawit Kebede Asfaw',
            'Abebe Bikila Gebre',
            'Bethel Worku Mekonnen',
            'Chala Tolossa Dadi',
            'Ermias Bekele Wolde',
            'Tigist Mengistu Bekele',
          ];
          const hashIdx = clean.split('').reduce((acc, c) => acc + parseInt(c, 10), 0) % sampleNames.length;
          setRecipientName(sampleNames[hashIdx]);
        }
      }
    }
  };

  const handleSelectRecent = (item: RecentTransferItem) => {
    setAccountNumber(item.fullAccount);
    setRecipientName(formatEnglishNameOnly(item.name));
  };

  const handleDeleteRecent = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = recentTransfers.filter((t) => t.id !== id);
    updateRecentTransfers(updated);
  };

  const handleClearAllRecent = () => {
    updateRecentTransfers([]);
  };

  const handleResetDefaults = () => {
    updateRecentTransfers(DEFAULT_RECENT_TRANSFERS);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanAcc = accountNumber.replace(/\D/g, '');

    if (cleanAcc.length < 10) {
      setError(
        currentLang === 'am'
          ? `እባክዎ ትክክለኛ የንግድ ባንክ ሒሳብ ቁጥር ያስገቡ (ቢያንስ 10 አሃዝ)`
          : `Please enter a valid CBE account number (at least 10 digits)`
      );
      return;
    }

    const resolvedRecipient = formatCbeName(
      recipientName.trim() || 'Selamawit Tadesse Haile'
    );

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(
        currentLang === 'am'
          ? 'እባክዎ የብር መጠን ያስገቡ'
          : 'Please enter a valid transfer amount (ETB)'
      );
      return;
    }

    if (numAmount > account.balance) {
      setError(
        currentLang === 'am'
          ? 'በቂ ሂሳብ የለዎትም (Insufficient balance)'
          : 'Insufficient account balance'
      );
      return;
    }

    // Auto-save new transfer recipient into Recent Transfers list
    const maskedAcc = cleanAcc.length >= 4
      ? `${cleanAcc[0]}********${cleanAcc.slice(-4)}`
      : cleanAcc;

    const existingIndex = recentTransfers.findIndex((t) => t.fullAccount === cleanAcc || t.name.toLowerCase() === resolvedRecipient.toLowerCase());
    
    let updatedList: RecentTransferItem[] = [];
    if (existingIndex >= 0) {
      // Move to top
      const item = recentTransfers[existingIndex];
      updatedList = [item, ...recentTransfers.filter((_, idx) => idx !== existingIndex)];
    } else {
      const newItem: RecentTransferItem = {
        id: `rec-${Date.now()}`,
        name: resolvedRecipient,
        maskedAccount: maskedAcc,
        fullAccount: cleanAcc,
      };
      updatedList = [newItem, ...recentTransfers];
    }
    updateRecentTransfers(updatedList);

    setLoading(true);
    setLoadingStep(
      currentLang === 'am'
        ? 'ከንግድ ባንክ ዋና ኔትወርክ ጋር በመገናኘት ላይ...'
        : 'Connecting to CBE Core Banking Network...'
    );

    setTimeout(() => {
      setLoadingStep(
        currentLang === 'am'
          ? 'ሒሳቡን በማረጋገጥ እና በማስተላለፍ ላይ...'
          : 'Verifying account and processing transfer...'
      );
    }, 900);

    setTimeout(() => {
      setLoading(false);
      const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
      const ftCode = `FT26${randomSuffix}`;
      const last4 = cleanAcc.slice(-4);

      const newTx: Transaction = {
        id: ftCode,
        referenceNumber: ftCode,
        transferMode: 'cbe_to_cbe',
        accountId: account.id,
        senderName: formatEnglishNameOnly(userName || 'Yared Nigusse Teshome'),
        senderAccount: `ETB-${account.accountNumber.slice(-4)}`,
        receiverName: formatEnglishNameOnly(resolvedRecipient),
        receiverAccount: cleanAcc, // Full account number for server matching
        receiverBank: 'Commercial Bank of Ethiopia',
        amount: numAmount,
        fee: 1.00,
        vat: 0.15,
        currency: 'ETB',
        type: 'outflow',
        category: 'CBE to CBE Transfer',
        timestamp: new Date().toISOString(),
        status: 'completed',
        note: remark.trim() ? remark.trim().replace(/mb transfer/i, 'MB Transfer') : 'MB Transfer',
        channel: 'CBE Mobile App',
        hash: generateSecurityHash(ftCode, numAmount, userName, resolvedRecipient),
      };

      onTransferSuccess(newTx);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between w-full max-w-[420px] mx-auto relative shadow-2xl overflow-hidden font-sans">
      {/* Header Bar */}
      <div className="bg-[#74117c] px-4 pt-4 pb-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            disabled={loading}
            className="p-1 rounded-full text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <h1 className="text-base font-medium tracking-wide">
            CBE Transfer
          </h1>
        </div>

        <button
          onClick={handleResetDefaults}
          className="text-xs text-purple-200 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          title="Reset to default list"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Container Card */}
      <div className="bg-[#f8f9fa] rounded-t-3xl pt-5 px-4 pb-6 flex-1 flex flex-col overflow-y-auto">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in">
            <Loader2 className="w-12 h-12 text-[#74117c] animate-spin" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">{loadingStep}</h3>
              <p className="text-xs text-slate-400">Please wait a moment...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleTransfer} className="space-y-3.5">
            {/* Account Type Selector Tabs */}
            <div className="grid grid-cols-2 gap-3 mb-1">
              {/* Other Account Option */}
              <button
                type="button"
                onClick={() => setAccountType('other')}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all cursor-pointer ${
                  accountType === 'other'
                    ? 'border-[#74117c] bg-white text-slate-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <span>Other Account</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  accountType === 'other' ? 'border-[#74117c]' : 'border-slate-300'
                }`}>
                  {accountType === 'other' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#74117c]" />
                  )}
                </div>
              </button>

              {/* Own Account Option */}
              <button
                type="button"
                onClick={() => setAccountType('own')}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all cursor-pointer ${
                  accountType === 'own'
                    ? 'border-amber-400 bg-white text-slate-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <span>Own Account</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  accountType === 'own' ? 'border-amber-400' : 'border-amber-400/80'
                }`}>
                  {accountType === 'own' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  )}
                </div>
              </button>
            </div>

            {/* From Account Card */}
            <div className="bg-[#222933] text-white rounded-xl p-3.5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {currentLang === 'am' ? 'ከአካውንት' : 'From account'}
                </span>
                <div className="text-xs font-bold text-white tracking-tight mt-0.5">
                  {currentLang === 'am' ? 'የቁጠባ ሒሳብ - 1*********8612' : 'Saving Account 1*********8612'}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-white font-mono">
                    {hideFromBalance
                      ? '******'
                      : account.balance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                    {currentLang === 'am' ? 'ብር' : 'ETB'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHideFromBalance(!hideFromBalance)}
                    className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                    title={hideFromBalance ? 'Show Balance' : 'Hide Balance'}
                  >
                    {hideFromBalance ? (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="flex flex-col items-end gap-1 text-xs font-medium text-white hover:opacity-80 transition-opacity cursor-pointer"
              >
                <ChevronDown className="w-4 h-4 text-slate-300" />
                <span className="text-[11px] text-slate-300 font-semibold">
                  {currentLang === 'am' ? 'ቀይር' : 'Change'}
                </span>
              </button>
            </div>

            {/* Input 1: Account Number* */}
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Building2 className="w-5 h-5 stroke-[1.8]" />
              </div>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => handleAccountChange(e.target.value)}
                placeholder="Account Number"
                maxLength={13}
                className="w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#74117c] focus:ring-1 focus:ring-[#74117c] outline-none transition-all shadow-xs font-mono"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <User className="w-5 h-5 stroke-[1.8]" />
              </div>
            </div>

            {/* Input 2: Recipient Full Name* */}
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <User className="w-5 h-5 stroke-[1.8]" />
              </div>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Enter Recipient Full Name*"
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#74117c] focus:ring-1 focus:ring-[#74117c] outline-none transition-all shadow-xs"
              />
            </div>

            {/* Input 3: Amount* */}
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Wallet className="w-5 h-5 stroke-[1.8]" />
              </div>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount*"
                className="w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#74117c] focus:ring-1 focus:ring-[#74117c] outline-none transition-all shadow-xs font-mono"
              />
            </div>

            {/* Remark Line */}
            <div className="pt-0.5 pb-1">
              {!showRemarkInput ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowRemarkInput(true)}
                    className="text-xs font-semibold text-[#74117c] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add remark</span>
                  </button>
                  <span className="text-[11px] text-slate-400 italic">
                    *Default: {remark}
                  </span>
                </div>
              ) : (
                <input
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Remark / Note"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#74117c] outline-none"
                />
              )}
            </div>

            {/* Submit Transfer Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#701484] hover:bg-[#620d69] active:scale-[0.99] text-white font-bold text-sm rounded-full shadow-md transition-all cursor-pointer"
            >
              Continue
            </button>
          </form>
        )}

        {/* Recent Transfers Section */}
        {!loading && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-bold text-slate-500">
                Recent Transfers
              </span>
              <div className="flex items-center gap-3">
                {recentTransfers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllRecent}
                    className="text-xs font-semibold text-[#74117c] hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
                {recentTransfers.length < DEFAULT_RECENT_TRANSFERS.length && (
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="text-xs font-semibold text-slate-400 hover:text-[#74117c] cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {recentTransfers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center space-y-2">
                <span>No recent transfers</span>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3 py-1.5 rounded-lg bg-purple-50 text-[#74117c] text-xs font-semibold border border-purple-100 hover:bg-purple-100 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Default List</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransfers.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectRecent(item)}
                    className="bg-white rounded-xl p-3 border border-slate-100 flex items-center justify-between shadow-xs hover:border-purple-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 tracking-wider">
                        {item.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-[#74117c] transition-colors">
                          {item.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {item.maskedAccount}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteRecent(e, item.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.8]" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-[#74117c]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
