import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ChevronLeft, Share2, Link as LinkIcon, Download } from 'lucide-react';
import { CbeLogo } from './CbeLogo';
import { CbeAccount, Language } from '../types/banking';

interface CbeReceiveModalProps {
  account: CbeAccount;
  userName?: string;
  currentLang: Language;
  onClose: () => void;
}

export const CbeReceiveModal: React.FC<CbeReceiveModalProps> = ({
  account,
  userName,
  currentLang,
  onClose,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState<string>('0.00');
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [inputVal, setInputVal] = useState('');

  useEffect(() => {
    const payload = JSON.stringify({
      bank: 'CBE',
      name: userName,
      account: account.accountNumber,
      amount: amount,
      action: 'PAY_ME_CBE'
    });

    // Generate high-resolution QR
    QRCode.toDataURL(payload, {
      width: 320,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    }).then(setQrUrl);
  }, [account, userName, amount]);

  const handleCopy = () => {
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() && !isNaN(parseFloat(inputVal))) {
      setAmount(parseFloat(inputVal).toFixed(2));
    } else {
      setAmount('0.00');
    }
    setShowAmountInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121016]/95 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in select-none">
      <div className="bg-[#121016] text-white w-full max-w-sm rounded-[36px] overflow-hidden shadow-2xl border border-slate-800 flex flex-col h-[680px] max-h-[95vh]">
        {/* Header Bar matching Image */}
        <div className="bg-[#701484] text-white p-4 flex items-center gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-sm tracking-wide">Receive Money</h2>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between space-y-4 bg-[#121016]">
          
          {/* Card Frame matching Image */}
          <div className="bg-[#1c1824] p-5 rounded-3xl border border-slate-800/60 shadow-lg relative flex-1 flex flex-col justify-between">
            
            {/* Logo and branding info */}
            <div className="flex items-center gap-3">
              {/* Authentic Emblem icon */}
              <CbeLogo size="sm" isDarkBg={true} className="w-9 h-9" />
              <div>
                <h3 className="font-serif font-bold text-xs text-[#dfb743] leading-tight tracking-wide">
                  Commercial Bank of Ethiopia
                </h3>
                <p className="text-[9px] text-[#dfb743]/80 italic font-medium">
                  The bank you can always rely on!
                </p>
              </div>
            </div>

            {/* Account Info Bar */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[9.5px] text-slate-500 block uppercase font-bold tracking-wider">Account No</span>
                <span className="font-bold text-slate-100 font-mono text-[11px] tracking-wide">
                  {account.accountNumber.length > 4 ? `${account.accountNumber[0]}********${account.accountNumber.slice(-4)}` : account.accountNumber}
                </span>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-[9.5px] text-slate-500 block uppercase font-bold tracking-wider">Reason</span>
                <span className="font-semibold text-slate-300 font-mono text-[11.5px]">
                  Mobile Banking
                </span>
              </div>
            </div>

            {/* Amount Field */}
            <div className="space-y-0.5">
              <span className="text-[9.5px] text-slate-500 block uppercase font-bold tracking-wider">Amount</span>
              <span className="font-mono text-lg font-extrabold text-white">
                {amount}
              </span>
            </div>

            {/* QR Frame with purple border & centering emblem logo */}
            <div className="relative mx-auto my-3 p-3 bg-white rounded-3xl border-4 border-[#701484] shadow-xl inline-flex items-center justify-center">
              {qrUrl ? (
                <div className="relative w-48 h-48">
                  <img src={qrUrl} alt="CBE QR" className="w-full h-full object-contain" />
                  
                  {/* Central Embedded CBE Logo Badge matching the real app! */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-2xl bg-[#701484] border-2 border-white flex items-center justify-center shadow-lg overflow-hidden">
                      <CbeLogo size="sm" isDarkBg={true} className="w-8 h-8 scale-110" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-2xl" />
              )}
            </div>

            {/* Yellow Action Icons (Share, Copy, Download) */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/50">
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1 text-[#dfb743] hover:text-[#f3cd58] py-1 bg-transparent active:scale-95 transition-all cursor-pointer"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-[9.5px] font-bold tracking-wide">Share QR</span>
              </button>

              <button
                onClick={handleCopy}
                type="button"
                className="flex flex-col items-center justify-center gap-1 text-[#dfb743] hover:text-[#f3cd58] py-1 bg-transparent active:scale-95 transition-all cursor-pointer"
              >
                <LinkIcon className="w-5 h-5" />
                <span className="text-[9.5px] font-bold tracking-wide">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1 text-[#dfb743] hover:text-[#f3cd58] py-1 bg-transparent active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span className="text-[9.5px] font-bold tracking-wide">Download</span>
              </button>
            </div>

          </div>

          {/* Wide ADD AMOUNT Button */}
          <div className="shrink-0 pt-1">
            <button
              onClick={() => {
                setInputVal('');
                setShowAmountInput(true);
              }}
              type="button"
              className="w-full py-3.5 bg-[#701484] hover:bg-[#620d69] active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all cursor-pointer"
            >
              ADD AMOUNT
            </button>
          </div>

        </div>
      </div>

      {/* Inline overlay for Adding Amount dynamically */}
      {showAmountInput && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddAmountSubmit}
            className="bg-[#1c1824] border border-slate-800 p-5 rounded-3xl w-full max-w-xs space-y-4 shadow-2xl text-center"
          >
            <h4 className="text-sm font-bold text-[#dfb743]">Enter Amount (ETB)</h4>
            <input
              autoFocus
              type="number"
              step="0.01"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="0.00"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center font-mono font-bold text-white text-lg focus:border-[#701484] outline-none"
            />
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowAmountInput(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-[#701484] hover:bg-[#620d69] text-white rounded-xl text-xs font-bold"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
