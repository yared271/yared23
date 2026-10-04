import React, { useState } from 'react';
import { ChevronLeft, Search, User, AlertCircle, Home, Landmark, Settings, Pencil, Camera, Upload } from 'lucide-react';
import { CbeAccount, Language, Transaction } from '../types/banking';
import { generateSecurityHash } from '../utils/smsParser';

export const EthioTelecomLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#ffffff" />
    <path
      d="M 28 54 C 28 32, 44 20, 62 20 C 80 20, 85 35, 78 48 C 72 58, 54 56, 45 52 C 38 48, 44 38, 52 38 C 60 38, 68 44, 70 38 C 72 32, 60 28, 52 32 C 44 36, 38 45, 38 54"
      fill="none"
      stroke="#4CAF50"
      strokeWidth="11"
      strokeLinecap="round"
    />
    <path
      d="M 38 54 C 38 68, 48 76, 62 76 C 76 76, 84 66, 84 54 C 84 45, 78 40, 72 44 C 66 48, 70 58, 62 60 C 54 62, 48 54, 48 48"
      fill="none"
      stroke="#00A2E2"
      strokeWidth="10"
      strokeLinecap="round"
    />
  </svg>
);

export const SafaricomLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#ffffff" />
    <path
      d="M 85,32 C 95,50, 85,75, 65,85 C 45,95, 20,85, 12,65 C 5,45, 15,20, 35,12 C 55,5, 78,12, 84,28"
      fill="none"
      stroke="#E21818"
      strokeWidth="8.5"
      strokeLinecap="round"
    />
    <text
      x="50"
      y="57"
      fill="#009639"
      fontSize="33"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontWeight="900"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      S
    </text>
  </svg>
);

interface CbeAirtimeScreenProps {
  currentLang: Language;
  account: CbeAccount;
  userName?: string;
  userPhone?: string;
  onBack: () => void;
  onAirtimeSuccess: (tx: Transaction) => void;
}

export const CbeAirtimeScreen: React.FC<CbeAirtimeScreenProps> = ({
  currentLang,
  account,
  userName = 'CBE Customer',
  userPhone = '',
  onBack,
  onAirtimeSuccess,
}) => {
  const [customEthioLogo, setCustomEthioLogo] = useState<string>(() => localStorage.getItem('cbe_ethio_logo_url') || '');
  const [customSafLogo, setCustomSafLogo] = useState<string>(() => localStorage.getItem('cbe_safaricom_logo_url') || '');
  const [selectedProvider, setSelectedProvider] = useState<'ethio' | 'safaricom' | null>(null);

  const handleEthioLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomEthioLogo(result);
        localStorage.setItem('cbe_ethio_logo_url', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSafLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomSafLogo(result);
        localStorage.setItem('cbe_safaricom_logo_url', result);
      };
      reader.readAsDataURL(file);
    }
  };
  const [mobNo, setMobNo] = useState(userPhone || '');
  const [recipientName, setRecipientName] = useState(userName || '');
  const [amount, setAmount] = useState('100');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAirtime = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (!mobNo.trim()) {
      setError('Please enter the mobile number');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const ftCode = `FT26${Math.floor(100000 + Math.random() * 900000)}V0S0`;
      const providerName = selectedProvider === 'safaricom' ? 'Safaricom Airtime Topup' : 'Ethio Telecom Airtime Topup';

      const newTx: Transaction = {
        id: ftCode,
        referenceNumber: ftCode,
        transferMode: 'airtime',
        accountId: account.id,
        senderName: userName,
        senderAccount: account.accountNumber,
        receiverName: recipientName.trim() || 'Mobile Topup',
        receiverAccount: `TEL-${mobNo.slice(-4)}`,
        receiverBank: providerName,
        amount: numAmount,
        fee: 0.00,
        vat: 0.00,
        currency: 'ETB',
        type: 'outflow',
        category: 'Airtime Topup',
        timestamp: new Date().toISOString(),
        status: 'completed',
        note: `Airtime Recharge for ${mobNo}`,
        channel: 'CBE Mobile App',
        hash: generateSecurityHash(ftCode, numAmount, userName, mobNo),
      };

      onAirtimeSuccess(newTx);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between w-full max-w-[420px] mx-auto relative shadow-2xl overflow-hidden font-sans select-none pb-20">
      {/* Top Header matching Image 3 */}
      <div className="bg-[#701484] text-white pt-4 pb-3 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 rounded-full text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <h1 className="text-base font-extrabold tracking-wide">
            {currentLang === 'am' ? 'የአየር ሰዓት ሞላ (Airtime)' : 'Airtime'}
          </h1>
        </div>

        <button className="p-1.5 rounded-full text-white/90 hover:bg-white/10 transition-colors cursor-pointer">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-4 flex-1">
        {/* 2 Big Topup Tiles matching Image 3 */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Ethio telecom Topup */}
          <button
            onClick={() => setSelectedProvider('ethio')}
            className={`w-full bg-white p-5 rounded-2xl border flex flex-col items-center justify-center text-center shadow-xs transition-all cursor-pointer h-32 ${
              selectedProvider === 'ethio'
                ? 'border-[#701484] ring-2 ring-[#701484]/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <img src="/ethio_telecom.svg" className="w-14 h-14 mb-2 object-contain" alt="Ethio Telecom" />
            <span className="text-[11px] font-bold text-slate-800 leading-snug">
              Ethio telecom Topup
            </span>
          </button>

          {/* Safaricom Topup */}
          <button
            onClick={() => setSelectedProvider('safaricom')}
            className={`w-full bg-white p-5 rounded-2xl border flex flex-col items-center justify-center text-center shadow-xs transition-all cursor-pointer h-32 ${
              selectedProvider === 'safaricom'
                ? 'border-[#701484] ring-2 ring-[#701484]/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <img src="/safaricom.svg" className="w-12 h-12 mb-2 object-contain rounded-lg shadow-sm" alt="Safaricom" />
            <span className="text-[11px] font-bold text-slate-800 leading-snug">
              Safaricom Topup
            </span>
          </button>
        </div>

        {/* Input Form when provider selected */}
        {selectedProvider && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>
                {selectedProvider === 'safaricom' ? 'Safaricom Direct Recharge' : 'Ethio Telecom Direct Recharge'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                className="text-[11px] text-[#701484] hover:underline"
              >
                Change
              </button>
            </h3>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAirtime} className="space-y-3.5">
              <div className="relative">
                <input
                  type="text"
                  value={mobNo}
                  onChange={(e) => setMobNo(e.target.value)}
                  placeholder="Recharged Mobile Number"
                  className="w-full px-4 py-3 bg-white border-2 border-[#701484] rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none font-mono"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#701484]">
                  <User className="w-4.5 h-4.5 fill-[#701484]" />
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Recipient Name (Optional)"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:border-[#701484] focus:outline-none"
                />
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount (ETB)*"
                  className="w-full px-4 py-3 bg-white border-2 border-[#701484] rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#701484] hover:bg-[#620d69] text-white font-bold text-xs rounded-full shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? 'Processing Recharge...' : 'Continue'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar matching Image 1 & 14 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-full bg-white border-t border-slate-100 py-2 px-6 flex items-center justify-around z-40">
        <button onClick={onBack} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f6ebd9] text-[#701484] text-xs font-bold cursor-pointer">
          <Home className="w-4 h-4 stroke-[2.5]" />
          <span>Home</span>
        </button>

        <button onClick={onBack} className="text-slate-400 hover:text-[#701484] cursor-pointer p-2 flex items-center justify-center">
          <Landmark className="w-5 h-5" />
        </button>

        <button onClick={onBack} className="text-slate-400 hover:text-[#701484] cursor-pointer p-2 flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
