import React, { useState } from 'react';
import { ChevronLeft, Search, Banknote } from 'lucide-react';
import { CbeAccount, Language, Transaction } from '../types/banking';

interface CbeBirrScreenProps {
  currentLang: Language;
  account: CbeAccount;
  onBack: () => void;
  onTransferSuccess: (tx: Transaction) => void;
}

export const CbeBirrScreen: React.FC<CbeBirrScreenProps> = ({
  currentLang,
  account,
  onBack,
  onTransferSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  const menuOptions = [
    {
      id: 'own_wallet',
      title: 'Transfer to own CBEBirr wallet',
      subtitle: 'Transfer to own CBEBirr wallet',
    },
    {
      id: 'other_wallet',
      title: 'Transfer to other CBEbirr wallet',
      subtitle: 'Transfer to other CBEbirr wallet',
    },
    {
      id: 'agent',
      title: 'Transfer to CBEBirr Agent',
      subtitle: 'Transfer to CBEBirr Agent',
    },
  ];

  const handleSelectOption = (optionTitle: string) => {
    setSelectedOption(optionTitle);
    setAmount('');
    setError('');
    setStep(2);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(currentLang === 'am' ? 'እባክዎ ትክክለኛ መጠን ያስገቡ' : 'Please enter a valid amount');
      return;
    }
    if (parsedAmount > account.balance) {
      setError(currentLang === 'am' ? 'በቂ ቀሪ ሂሳብ የለዎትም' : 'Insufficient balance');
      return;
    }

    // Determine receiver details based on selected option
    let receiver = 'CBEBirr Wallet';
    if (selectedOption.includes('Agent')) {
      receiver = 'CBEBirr Agent (A0982)';
    } else if (selectedOption.includes('other')) {
      receiver = 'CBEBirr Wallet (0912***456)';
    }

    const fee = 0; // CBE Birr wallet transfers are typically free or low fee
    const reference = 'FT' + Math.floor(100000 + Math.random() * 900000);
    const remark = selectedOption;

    const newTx: Transaction = {
      id: reference,
      referenceNumber: reference,
      transferMode: 'cbe_birr',
      accountId: account.id,
      senderName: '', // Filled by App.tsx
      senderAccount: account.accountNumber,
      receiverName: receiver,
      receiverAccount: 'Wallet-7821',
      receiverBank: 'cbe',
      amount: parsedAmount,
      fee: fee,
      vat: 0,
      currency: 'ETB',
      type: 'transfer',
      category: 'Telebirr Transfer', // mapped to appropriate design categories
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: remark,
      hash: 'cbe-birr-hash-' + Math.random().toString(36).substring(2, 9),
      channel: 'CBE Birr',
    };

    onTransferSuccess(newTx);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between max-w-md mx-auto relative shadow-2xl overflow-hidden font-sans select-none animate-in fade-in">
      
      {/* 1. Official CBEBirr Header Bar matching both images */}
      <div className="bg-[#701484] text-white p-4 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (step === 2) {
                setStep(1);
              } else {
                onBack();
              }
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-sm tracking-wide">CBEBirr</h2>
        </div>
        <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
          <Search className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#f8f9fa] p-4 flex flex-col">
        
        {step === 1 ? (
          /* ================= STEP 1: MENU SELECTION ================= */
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
            {menuOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.title)}
                className="w-full bg-white p-4.5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-purple-300 hover:shadow-md transition-all text-left cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  {/* Styled CBEBirr Wallet Brand Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-[#701484]/5 p-2 shadow-xs flex items-center justify-center shrink-0">
                    <img src="/cbe_birr.svg" className="w-full h-full object-contain" alt="CBE Birr" />
                  </div>
                  
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-xs sm:text-[13px] leading-snug">
                      {opt.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {opt.subtitle}
                    </p>
                  </div>
                </div>

                <ChevronLeft className="w-5 h-5 text-purple-600 rotate-180 shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          /* ================= STEP 2: FORM INPUT ================= */
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-200 flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Selected Transaction Label */}
              <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-3xl">
                <span className="text-[10px] text-[#701484] uppercase font-extrabold tracking-wider block mb-1">
                  Selected Type
                </span>
                <h4 className="font-extrabold text-[#701484] text-[13px] leading-snug">
                  {selectedOption}
                </h4>
              </div>

              {/* Amount Form Block */}
              <form onSubmit={handleContinue} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                    Amount
                  </label>
                  
                  {/* Beautiful input matching the uploaded photo */}
                  <div className="relative flex items-center">
                    {/* Currency icon inside circle on the left */}
                    <div className="absolute left-3.5 w-9.5 h-9.5 rounded-full bg-purple-100/70 flex items-center justify-center text-[#701484]">
                      <Banknote className="w-5 h-5" />
                    </div>
                    
                    <input
                      autoFocus
                      type="number"
                      step="0.01"
                      placeholder="Enter Amount"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setError('');
                      }}
                      className="w-full py-4.5 pl-15 pr-5 bg-white border border-slate-200 rounded-[22px] font-semibold text-slate-800 placeholder-slate-400 text-sm focus:border-[#701484] focus:ring-1 focus:ring-[#701484] outline-none transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-bold text-rose-500 bg-rose-50 p-2.5 rounded-xl border border-rose-100 text-center animate-shake">
                    {error}
                  </p>
                )}
              </form>
            </div>

            {/* Bottom Continue Action Pill Button */}
            <div className="pt-6 shrink-0">
              <button
                onClick={handleContinue}
                type="button"
                className="w-full py-4 bg-[#701484] hover:bg-[#620d69] active:scale-[0.98] text-white font-extrabold text-sm rounded-full shadow-lg transition-all cursor-pointer text-center"
              >
                Continue
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
