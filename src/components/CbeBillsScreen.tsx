import React, { useState } from 'react';
import {
  Zap,
  Droplets,
  Phone,
  Car,
  Receipt,
  Building2,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CbeAccount, Language, Transaction } from '../types/banking';
import { formatCurrency, generateSecurityHash } from '../utils/smsParser';

// Fallback Logos for the 8 Billers with higher fidelity SVGs
export const EeuLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#ffffff" />
    <circle cx="50" cy="50" r="40" fill="#4caf50" />
    <path d="M 50 25 L 50 75 M 35 45 L 65 45 M 35 60 L 65 60" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
    <circle cx="50" cy="50" r="30" fill="none" stroke="#ff9800" strokeWidth="4" />
  </svg>
);

export const AawsaLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#ffffff" />
    <circle cx="50" cy="50" r="40" fill="#0082c8" />
    <path d="M 30 55 Q 40 45 50 55 T 70 55 M 30 65 Q 40 55 50 65 T 70 65" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" fill="none" />
    <path d="M 50 25 C 55 25 60 30 60 40 C 60 50 50 60 50 60 C 50 60 40 50 40 40 C 40 30 45 25 50 25 Z" fill="#ffffff" />
  </svg>
);

export const WeBirrLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#1b5e20" />
    <path d="M 25 40 L 40 70 L 75 30" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <text x="50" y="85" fill="#ffffff" fontSize="18" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">WEBIRR</text>
  </svg>
);

export const WebSprixLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#fbc02d" />
    <circle cx="50" cy="50" r="30" fill="none" stroke="#000000" strokeWidth="6" />
    <path d="M 50 20 L 50 80 M 20 50 L 80 50" stroke="#000000" strokeWidth="4" />
    <text x="50" y="58" fill="#000000" fontSize="24" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">WS</text>
  </svg>
);

interface CbeBillsScreenProps {
  currentLang: Language;
  account: CbeAccount;
  onBack: () => void;
  onPaymentSuccess: (tx: Transaction) => void;
}

export const CbeBillsScreen: React.FC<CbeBillsScreenProps> = ({
  currentLang,
  account,
  onBack,
  onPaymentSuccess,
}) => {
  const [selectedUtility, setSelectedUtility] = useState<string | null>(null);
  const [customerRef, setCustomerRef] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const [customLogos, setCustomLogos] = useState<Record<string, string>>(() => {
    const loaded: Record<string, string> = {};
    const keys = [
      'eeu_prepaid',
      'aawsa',
      'webirr',
      'safaricom_deposit',
      'safaricom_bill',
      'ethio_postpaid',
      'websprix',
      'eeu_postpaid'
    ];
    keys.forEach(k => {
      const val = localStorage.getItem(`cbe_bill_logo_${k}`);
      if (val) loaded[k] = val;
    });
    return loaded;
  });

  const handleUtilityLogoUpload = (utilId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomLogos(prev => ({ ...prev, [utilId]: result }));
        localStorage.setItem(`cbe_bill_logo_${utilId}`, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const utilities = [
    {
      id: 'eeu_prepaid',
      name: 'Ethiopian Electric Utility Prepaid',
      nameAm: 'የኢትዮጵያ ኤሌክትሪክ አገልግሎት ቅድመ ክፍያ',
      logoComponent: <EeuLogo className="w-12 h-12" />,
      color: 'bg-green-50',
      label: 'EEU Customer No',
      defaultAmount: '350.00'
    },
    {
      id: 'aawsa',
      name: 'AAWSA',
      nameAm: 'የአዲስ አበባ ውሃና ፍሳሽ ባለስልጣን',
      logoComponent: <AawsaLogo className="w-12 h-12" />,
      color: 'bg-sky-50',
      label: 'Water Bill Contract No',
      defaultAmount: '120.00'
    },
    {
      id: 'webirr',
      name: 'WeBirr',
      nameAm: 'ዌቢር ክፍያ',
      logoComponent: <WeBirrLogo className="w-12 h-12" />,
      color: 'bg-emerald-50',
      label: 'WeBirr Customer ID',
      defaultAmount: '500.00'
    },
    {
      id: 'safaricom_deposit',
      name: 'Safaricom Deposit',
      nameAm: 'የሳፋሪኮም ዲፖዚት',
      logoComponent: <img src="/safaricom.svg" className="w-12 h-12 object-contain rounded-lg" alt="Safaricom" />,
      color: 'bg-red-50',
      label: 'Safaricom Mobile No',
      defaultAmount: '1000.00'
    },
    {
      id: 'safaricom_bill',
      name: 'Safaricom Bill Payment',
      nameAm: 'የሳፋሪኮም ቢል ክፍያ',
      logoComponent: <img src="/safaricom.svg" className="w-12 h-12 object-contain rounded-lg" alt="Safaricom" />,
      color: 'bg-red-50',
      label: 'Safaricom Account No',
      defaultAmount: '450.00'
    },
    {
      id: 'ethio_postpaid',
      name: 'Ethio Telecom Postpaid',
      nameAm: 'የኢትዮ ቴሌኮም የድህረ ክፍያ',
      logoComponent: <img src="/ethio_telecom.svg" className="w-14 h-14 object-contain" alt="Ethio" />,
      color: 'bg-blue-50',
      label: 'Service Number / Phone No',
      defaultAmount: '600.00'
    },
    {
      id: 'websprix',
      name: 'WebSprix',
      nameAm: 'ዌብስፕሪክስ ኢንተርኔት',
      logoComponent: <WebSprixLogo className="w-12 h-12" />,
      color: 'bg-amber-50',
      label: 'WebSprix Customer ID',
      defaultAmount: '1150.00'
    },
    {
      id: 'eeu_postpaid',
      name: 'EEU Postpaid',
      nameAm: 'የኢትዮጵያ ኤሌክትሪክ አገልግሎት ድህረ ክፍያ',
      logoComponent: <EeuLogo className="w-12 h-12" />,
      color: 'bg-green-50',
      label: 'EEU Contract No',
      defaultAmount: '280.00'
    }
  ];

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUtility) return;

    const numAmount = parseFloat(amount) || 500;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const ftCode = `FT26${Math.floor(100000 + Math.random() * 900000)}V0S0`;
      const utilObj = utilities.find(u => u.id === selectedUtility);

      const newTx: Transaction = {
        id: ftCode,
        referenceNumber: ftCode,
        transferMode: 'cbe_to_cbe',
        accountId: account.id,
        senderName: localStorage.getItem('cbe_user_full_name') || 'User',
        senderAccount: `ETB-${account.accountNumber.slice(-4)}`,
        receiverName: `${utilObj?.name || 'Utility Provider'}`,
        receiverAccount: customerRef || 'BILL-AUTO-SETTLE',
        receiverBank: 'Commercial Bank of Ethiopia (Utility Portal)',
        amount: numAmount,
        fee: 1.00,
        vat: 0.15,
        currency: 'ETB',
        type: 'outflow',
        category: 'Utility Bill',
        timestamp: new Date().toISOString(),
        status: 'completed',
        note: `${utilObj?.name} Settlement (#${customerRef || '884920'})`,
        channel: 'CBE Mobile App',
        hash: generateSecurityHash(ftCode, numAmount, localStorage.getItem('cbe_user_full_name') || 'User', utilObj?.name || 'Utility'),
      };

      onPaymentSuccess(newTx);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between w-full max-w-[420px] mx-auto relative shadow-2xl overflow-hidden font-sans pb-4">
      {/* Top Header */}
      <div className="bg-[#74117c] text-white pt-5 pb-5 px-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 rounded-full text-white hover:bg-purple-900/60 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-base font-bold text-white tracking-wide">
            {currentLang === 'am' ? 'የክፍያ እና አገልግሎቶች' : 'Bills & Utilities'}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {!selectedUtility ? (
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#74117c] uppercase tracking-wider">
              {currentLang === 'am' ? 'አገልግሎት ይምረጡ' : 'Select Service Provider'}
            </div>

            {/* 8 Utility Cards matching image */}
            <div className="grid grid-cols-2 gap-3.5 pb-20">
              {utilities.map((util) => (
                <button
                  key={util.id}
                  onClick={() => {
                    setSelectedUtility(util.id);
                    setAmount(util.defaultAmount);
                  }}
                  className={`w-full p-4 bg-white rounded-2xl shadow-xs border flex flex-col items-center justify-center text-center transition-all h-36 hover:shadow-md cursor-pointer ${
                    selectedUtility === util.id
                      ? 'border-[#74117c] ring-2 ring-[#74117c]/10'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="w-14 h-14 flex items-center justify-center mb-1.5 shrink-0">
                    {customLogos[util.id] ? (
                      <img src={customLogos[util.id]} className="w-12 h-12 object-contain rounded-lg" alt={util.name} />
                    ) : (
                      util.logoComponent
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 leading-tight mb-0.5 line-clamp-2 h-7 flex items-center justify-center">{util.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Specific Utility Payment Form */
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-purple-50 p-1 shrink-0">
                  {customLogos[selectedUtility] ? (
                    <img src={customLogos[selectedUtility]} className="w-10 h-10 object-contain rounded-md" alt="custom" />
                  ) : (
                    utilities.find(u => u.id === selectedUtility)?.logoComponent
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    {utilities.find(u => u.id === selectedUtility)?.name}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {utilities.find(u => u.id === selectedUtility)?.nameAm}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUtility(null)}
                className="text-xs font-bold text-[#74117c] hover:underline"
              >
                Change
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  {utilities.find(u => u.id === selectedUtility)?.label}
                </label>
                <input
                  type="text"
                  required
                  value={customerRef}
                  onChange={(e) => setCustomerRef(e.target.value)}
                  placeholder="e.g. 10098273"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold focus:border-[#74117c] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  Amount (ETB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold text-base focus:border-[#74117c] outline-none"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#74117c] hover:bg-[#600e67] text-white font-bold text-sm shadow-md shadow-[#74117c]/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Processing Bill Payment...' : 'Pay Bill'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-slate-400 border-t border-slate-200">
        Commercial Bank of Ethiopia · Direct Bill Pay
      </div>
    </div>
  );
};
