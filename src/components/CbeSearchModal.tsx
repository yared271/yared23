import React, { useState } from 'react';
import {
  Search,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Phone,
  RefreshCw,
  Wallet,
  Receipt,
  Landmark,
  CreditCard,
  User,
} from 'lucide-react';
import { Language } from '../types/banking';

interface CbeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onSelectAction: (actionKey: string) => void;
}

export const CbeSearchModal: React.FC<CbeSearchModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectAction,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const services = [
    {
      id: 'transfer',
      titleEn: 'CBE Transfer (Send Money)',
      titleAm: 'የንግድ ባንክ ዝውውር (ብር ላክ)',
      descEn: 'Send money to any CBE account',
      descAm: 'ወደ ንግድ ባንክ አካውንት ብር ይላኩ',
      icon: ArrowUpRight,
      color: 'text-rose-500 bg-rose-50',
    },
    {
      id: 'receive',
      titleEn: 'Receive Money (QR Code)',
      titleAm: 'ገንዘብ መቀበያ (QR Code)',
      descEn: 'Generate QR code or account details to receive money',
      descAm: 'ገንዘብ ለመቀበል የQR ኮድ ያሳዩ',
      icon: ArrowDownLeft,
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      id: 'airtime',
      titleEn: 'Buy Airtime (Mobile Top-up)',
      titleAm: 'የሞባይል አየር ሰዓት መሙያ',
      descEn: 'Ethio Telecom & Safaricom recharge',
      descAm: 'የኢትዮ ቴሌኮም እና ሳፋሪኮም ካርድ ይሙሉ',
      icon: Phone,
      color: 'text-[#701484] bg-purple-50',
    },
    {
      id: 'other_transfers',
      titleEn: 'Other Bank Transfers',
      titleAm: 'ወደ ሌሎች ባንኮች ዝውውር',
      descEn: 'Transfer to Awash, Dashen, Telebirr, etc.',
      descAm: 'ወደ አዋሽ፣ ዳሽን፣ ቴሌብር እና ሌሎች ባንኮች ይላኩ',
      icon: RefreshCw,
      color: 'text-[#701484] bg-purple-50',
    },
    {
      id: 'cbebirr',
      titleEn: 'CBE Birr Wallet',
      titleAm: 'ንግድ ባንክ ብር (CBE Birr)',
      descEn: 'Wallet to bank or agent cash-out',
      descAm: 'የሞባይል ዋሌት አገልግሎት',
      icon: Wallet,
      color: 'text-[#701484] bg-purple-50',
    },
    {
      id: 'bills',
      titleEn: 'Bills & Utilities Payment',
      titleAm: 'የመብራት፣ ውሃ እና ሌሎች ክፍያዎች',
      descEn: 'Pay electricity, water, traffic, DSTV, school fees',
      descAm: 'የመብራት፣ ውሃ፣ ትራፊክ እና የትምህርት ቤት ክፍያ',
      icon: Receipt,
      color: 'text-[#701484] bg-purple-50',
    },
    {
      id: 'statement',
      titleEn: 'Mini Statement & Ledger',
      titleAm: 'አጭር የሒሳብ መግለጫ (Statement)',
      descEn: 'View recent transactions and balance slip',
      descAm: 'የቅርብ ጊዜ ዝውውሮችን እና ደረሰኞችን ይመልከቱ',
      icon: Landmark,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  const filtered = services.filter((s) => {
    const q = query.toLowerCase();
    return (
      s.titleEn.toLowerCase().includes(q) ||
      s.titleAm.toLowerCase().includes(q) ||
      s.descEn.toLowerCase().includes(q) ||
      s.descAm.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Header */}
        <div className="bg-[#701484] text-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm">
              {currentLang === 'am' ? 'አገልግሎት ፈልግ (Search)' : 'Search CBE Services'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex items-center bg-white/15 rounded-xl px-3 py-2 text-white border border-white/20">
            <Search className="w-4 h-4 text-purple-200 shrink-0 mr-2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={currentLang === 'am' ? 'የአገልግሎት ስም ይጻፉ...' : 'Search transfer, airtime, bills...'}
              className="w-full bg-transparent text-white placeholder:text-purple-200 text-xs outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-0.5 text-purple-200 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              {currentLang === 'am' ? 'ምንም አይነት አገልግሎት አልተገኘም' : 'No services found'}
            </div>
          ) : (
            filtered.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onClose();
                    onSelectAction(item.id);
                  }}
                  className="w-full p-3 rounded-2xl border border-slate-100 hover:border-[#701484]/40 hover:bg-slate-50 flex items-center gap-3 text-left transition-all cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <IconComp className="w-4.5 h-4.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {currentLang === 'am' ? item.titleAm : item.titleEn}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {currentLang === 'am' ? item.descAm : item.descEn}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
