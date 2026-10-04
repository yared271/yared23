import React, { useState } from 'react';
import {
  ChevronLeft,
  Search,
  ArrowLeftRight,
  Wallet,
  Coins,
  ChevronRight,
  X,
  CreditCard,
  User,
  Banknote,
  AlertCircle,
  Loader2,
  Building2,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CbeAccount, Language, Transaction } from '../types/banking';
import { generateSecurityHash } from '../utils/smsParser';
import { formatEnglishNameOnly } from '../utils/userDatabase';

interface CbeOtherTransfersScreenProps {
  currentLang: Language;
  account: CbeAccount;
  onBack: () => void;
  onTransferSuccess: (tx: Transaction) => void;
}

// Authentic Telebirr Blue Logo SVG matching image.png exactly
export const TelebirrLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ethio Telecom / Telebirr iconic 4-point top star */}
    <path
      d="M32 18 L36 32 L50 32 L38 41 L43 55 L32 46 L21 55 L26 41 L14 32 L28 32 Z"
      fill="#0066c4"
    />
    {/* Telebirr swooping 't' curve */}
    <path
      d="M48 30 C68 30 82 44 82 64 C82 80 68 92 48 92 C28 92 16 80 16 64 C16 52 23 42 34 35"
      stroke="#0066c4"
      strokeWidth="8"
      strokeLinecap="round"
      fill="none"
    />
    {/* Telebirr center circle */}
    <circle cx="48" cy="64" r="10" fill="#0066c4" />
  </svg>
);

// List of all 22 Commercial Banks in Ethiopia
const ETHIOPIAN_BANKS_FULL_LIST = [
  { id: 'awash', nameEn: 'Awash Bank', nameAm: 'አዋሽ ባንክ', code: 'AWASH' },
  { id: 'abyssinia', nameEn: 'Bank of Abyssinia', nameAm: 'አቢሲኒያ ባንክ', code: 'BOA' },
  { id: 'dashen', nameEn: 'Dashen Bank (Amole)', nameAm: 'ዳሽን ባንክ', code: 'DASHEN' },
  { id: 'coop', nameEn: 'Cooperative Bank of Oromia', nameAm: 'የኦሮሚያ ህብረት ስራ ባንክ', code: 'COOP' },
  { id: 'hibret', nameEn: 'Hibret Bank', nameAm: 'ህብረት ባንክ', code: 'HIBRET' },
  { id: 'nib', nameEn: 'Nib International Bank', nameAm: 'ንብ ባንክ', code: 'NIB' },
  { id: 'wegagen', nameEn: 'Wegagen Bank', nameAm: 'ወጋገን ባንክ', code: 'WEGAGEN' },
  { id: 'amhara', nameEn: 'Amhara Bank', nameAm: 'አማራ ባንክ', code: 'AMHARA' },
  { id: 'zemen', nameEn: 'Zemen Bank', nameAm: 'ዘመን ባንክ', code: 'ZEMEN' },
  { id: 'siinqee', nameEn: 'Siinqee Bank', nameAm: 'ሲንቄ ባንክ', code: 'SIINQEE' },
  { id: 'oromia', nameEn: 'Oromia Bank', nameAm: 'ኦሮሚያ ባንክ', code: 'OROMIA' },
  { id: 'berhan', nameEn: 'Berhan Bank', nameAm: 'ብርሃን ባንክ', code: 'BERHAN' },
  { id: 'global', nameEn: 'Global Bank Ethiopia', nameAm: 'ግሎባል ባንክ', code: 'GLOBAL' },
  { id: 'enat', nameEn: 'Enat Bank', nameAm: 'እናት ባንክ', code: 'ENAT' },
  { id: 'lion', nameEn: 'Lion International Bank', nameAm: 'አንበሳ ባንክ', code: 'LION' },
  { id: 'tsehay', nameEn: 'Tsehay Bank', nameAm: 'ፀሐይ ባንክ', code: 'TSEHAY' },
  { id: 'hijra', nameEn: 'Hijra Bank', nameAm: 'ሂጅራ ባንክ', code: 'HIJRA' },
  { id: 'zamzam', nameEn: 'ZamZam Bank', nameAm: 'ዘምዘም ባንክ', code: 'ZAMZAM' },
  { id: 'gadaa', nameEn: 'Gadaa Bank', nameAm: 'ገዳ ባንክ', code: 'GADAA' },
  { id: 'ahadu', nameEn: 'Ahadu Bank', nameAm: 'አሃዱ ባንክ', code: 'AHADU' },
  { id: 'shabelle', nameEn: 'Shabelle Bank', nameAm: 'ሸበሌ ባንክ', code: 'SHABELLE' },
  { id: 'rammis', nameEn: 'Rammis Bank', nameAm: 'ራሚስ ባንክ', code: 'RAMMIS' },
];

export const CbeOtherTransfersScreen: React.FC<CbeOtherTransfersScreenProps> = ({
  currentLang,
  account,
  onBack,
  onTransferSuccess,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState(ETHIOPIAN_BANKS_FULL_LIST[0]);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState('');

  const [phoneOrAcc, setPhoneOrAcc] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('MB transfer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [hideFromBalance, setHideFromBalance] = useState(true);

  const options = [
    {
      id: 'wallet',
      title: 'Wallet',
      subtitle: 'Wallet',
      icon: <img src="/ethio_telecom.svg" className="w-7 h-7 object-contain" alt="Wallet" />,
    },
    {
      id: 'other_bank',
      title: 'Transfer to Other Banks',
      subtitle: 'Transfer to Other Banks',
      icon: <Building2 className="w-6 h-6 text-[#701484]" />,
    },
    {
      id: 'micro_finances',
      title: 'Transfer to Micro Finances',
      subtitle: 'Transfer to Micro Finances',
      icon: <Coins className="w-6 h-6 text-[#701484]" />,
    },
    {
      id: 'sacco',
      title: 'SACCO',
      subtitle: 'SACCO',
      icon: <Coins className="w-6 h-6 text-[#701484]" />,
    },
  ];

  const filteredOptions = options.filter(
    (o) =>
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBanks = ETHIOPIAN_BANKS_FULL_LIST.filter(
    (b) =>
      b.nameEn.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
      b.nameAm.includes(bankSearchQuery) ||
      b.code.toLowerCase().includes(bankSearchQuery.toLowerCase())
  );

  const handleSelectOption = (id: string) => {
    setSelectedOption(id);
    setError(null);
    setPhoneOrAcc('');
    setRecipientName('');
    setAmount('');
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phoneOrAcc.trim() || phoneOrAcc.length < 8) {
      setError('Please enter a valid account or phone number');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid transfer amount in ETB');
      return;
    }

    if (numAmount > account.balance) {
      setError('Insufficient account balance');
      return;
    }

    setLoading(true);
    const bankOrWalletName =
      selectedOption === 'other_bank'
        ? selectedBank.nameEn
        : options.find((o) => o.id === selectedOption)?.title || 'Other Transfer';

    setLoadingStep(`Connecting to ${bankOrWalletName} Gateway...`);

    setTimeout(() => {
      setLoadingStep('Verifying account details and debited amount...');
    }, 900);

    setTimeout(() => {
      setLoading(false);
      const ftCode = `FT262277V0S0`;
      const resolvedRecipient =
        recipientName.trim() || (selectedOption?.includes('telebirr') ? 'Telebirr User' : 'Transfer Beneficiary');

      const newTx: Transaction = {
        id: ftCode,
        referenceNumber: ftCode,
        transferMode: 'other_banks',
        accountId: account.id,
        senderName: formatEnglishNameOnly(localStorage.getItem('cbe_user_full_name') || 'Yared Nigusse Teshome'),
        senderAccount: `ETB-${account.accountNumber.slice(-4)}`,
        receiverName: formatEnglishNameOnly(resolvedRecipient),
        receiverAccount: phoneOrAcc,
        receiverBank: bankOrWalletName,
        amount: numAmount,
        fee: 5.00,
        vat: 0.75,
        currency: 'ETB',
        type: 'outflow',
        category: 'Other Bank Transfer',
        timestamp: new Date().toISOString(),
        status: 'completed',
        note: remark ? remark.replace(/mb transfer/i, 'MB Transfer') : 'MB Transfer',
        channel: 'CBE Mobile App',
        hash: generateSecurityHash(ftCode, numAmount, localStorage.getItem('cbe_user_full_name') || 'Yared Nigusse Teshome', resolvedRecipient),
      };

      onTransferSuccess(newTx);
    }, 1800);
  };

  const activeOptionObj = options.find((o) => o.id === selectedOption);

  return (
    <div className="w-full min-h-screen bg-[#74117c] text-slate-800 flex flex-col justify-between max-w-[480px] mx-auto relative shadow-2xl overflow-x-hidden font-sans">
      {/* Header Bar matching image.png */}
      <div className="bg-[#74117c] px-5 pt-5 pb-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6.5 h-6.5 stroke-[2.5]" />
          </button>
          <h1 className="text-lg font-bold tracking-wide">
            Other Transfers
          </h1>
        </div>

        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 text-white hover:text-purple-200 transition-colors cursor-pointer"
        >
          <Search className="w-6 h-6 stroke-[2.2]" />
        </button>
      </div>

      {/* Optional Search Bar */}
      {showSearch && (
        <div className="px-5 pb-4 bg-[#74117c] animate-in slide-in-from-top duration-200">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transfer options..."
            className="w-full px-4 py-3 bg-white/15 text-white placeholder:text-purple-200 rounded-2xl text-sm outline-none border border-white/20"
          />
        </div>
      )}

      {/* Main Container Sheet matching image.png */}
      <div className="bg-[#f8f9fa] rounded-t-[40px] pt-7 px-5 pb-8 flex-1 flex flex-col overflow-y-auto space-y-4">
        {filteredOptions.map((opt) => (
          <div
            key={opt.id}
            onClick={() => handleSelectOption(opt.id)}
            className="bg-white rounded-3xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-purple-50 transition-colors">
                {opt.icon}
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-800 group-hover:text-[#74117c] transition-colors">
                  {opt.title}
                </div>
                <div className="text-xs text-slate-400 font-semibold mt-1">
                  {opt.subtitle}
                </div>
              </div>
            </div>

            <div className="text-[#74117c]">
              <ChevronRight className="w-6 h-6 stroke-[2.8]" />
            </div>
          </div>
        ))}

        {filteredOptions.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-400">
            No transfer option found matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Bank Picker Modal */}
      {showBankPicker && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-250">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#74117c]" />
                <h3 className="text-sm font-bold text-slate-800">
                  Select Destination Bank
                </h3>
              </div>
              <button
                onClick={() => setShowBankPicker(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bank Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={bankSearchQuery}
                onChange={(e) => setBankSearchQuery(e.target.value)}
                placeholder="Search bank name (e.g. Awash, Dashen, Abyssinia)..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#74117c]"
              />
            </div>

            {/* Bank List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredBanks.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBank(b);
                    setShowBankPicker(false);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold cursor-pointer transition-all ${
                    selectedBank.id === b.id
                      ? 'border-[#74117c] bg-purple-50/60 text-[#74117c]'
                      : 'border-slate-100 bg-white text-slate-800 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#74117c] font-bold text-[10px] flex items-center justify-center shrink-0 font-mono">
                      {b.code.slice(0, 3)}
                    </div>
                    <div>
                      <div>{b.nameEn}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{b.nameAm}</div>
                    </div>
                  </div>

                  {selectedBank.id === b.id && (
                    <Check className="w-4 h-4 text-[#74117c] stroke-[3]" />
                  )}
                </div>
              ))}

              {filteredBanks.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  No bank found matching "{bankSearchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Transfer Popup Form Modal when option is selected */}
      {selectedOption && !showBankPicker && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-250 border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-50">
                  {activeOptionObj?.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {activeOptionObj?.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Direct CBE EthSwitch Gateway Transfer
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOption(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                <Loader2 className="w-10 h-10 text-[#74117c] animate-spin" />
                <p className="text-xs font-bold text-slate-700">{loadingStep}</p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-3">
                {/* From Account Card */}
                <div className="bg-[#222933] text-white rounded-xl p-3 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10.5px] text-slate-400 font-medium block">
                      {currentLang === 'am' ? 'ከአካውንት' : 'From account'}
                    </span>
                    <div className="text-xs font-bold text-white tracking-tight mt-0.5">
                      {currentLang === 'am' ? 'የቁጠባ ሒሳብ - 1********8657' : 'Saving Account - 1********8657'}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-white font-mono">
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
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                {/* Bank Selector for "Other Bank" */}
                {selectedOption === 'other_bank' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Select Bank*
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowBankPicker(true)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold text-slate-800 hover:border-[#74117c] transition-all shadow-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-[#74117c]" />
                        <span>{selectedBank.nameEn} ({selectedBank.nameAm})</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                )}

                {/* Account / Phone Number */}
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phoneOrAcc}
                    onChange={(e) => setPhoneOrAcc(e.target.value)}
                    placeholder={
                      selectedOption.includes('telebirr')
                        ? 'Telebirr Mobile Number (e.g. 0911824902)*'
                        : 'Account / Card Number*'
                    }
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#74117c] outline-none font-mono"
                  />
                </div>

                {/* Recipient Full Name */}
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Recipient Full Name (Optional)"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#74117c] outline-none"
                  />
                </div>

                {/* Amount */}
                <div className="relative">
                  <Banknote className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount (ETB)*"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#74117c] outline-none font-mono"
                  />
                </div>

                {/* Remark */}
                <input
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Reason / Note (Default: MB transfer)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
                />

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#74117c] hover:bg-[#620d69] text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer mt-2"
                >
                  Send Transfer
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
