import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  RotateCw,
  Plus,
  Copy,
  Check,
  Clock,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { CbeAccount, Language } from '../types/banking';
import { formatCurrency } from '../utils/smsParser';

interface CbeCashOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  account: CbeAccount;
  onCashOutSuccess?: (amount: number) => void;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  code: string;
  type: 'atm' | 'agent';
  timestamp: string;
  expirySeconds: number;
}

export const CbeCashOutModal: React.FC<CbeCashOutModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  account,
  onCashOutSuccess,
}) => {
  const [view, setView] = useState<'history' | 'new_form' | 'success'>('history');
  const [withdrawals, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState('');
  const [cashOutType, setCashOutType] = useState<'atm' | 'agent'>('atm');
  const [latestCode, setLatestCode] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Countdown timer for active requests
  useEffect(() => {
    if (withdrawals.length === 0) return;
    const interval = setInterval(() => {
      setWithdrawalRequests((prev) =>
        prev
          .map((w) => ({ ...w, expirySeconds: w.expirySeconds - 1 }))
          .filter((w) => w.expirySeconds > 0)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [withdrawals]);

  if (!isOpen) return null;

  const quickAmounts = [200, 500, 1000, 2000, 3000, 5000];

  const handleRefreshHistory = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      setError(
        currentLang === 'am'
          ? 'እባክዎ ትክክለኛ የብር መጠን ያስገቡ'
          : 'Please enter a valid cash-out amount'
      );
      return;
    }

    if (finalAmount > account.balance) {
      setError(
        currentLang === 'am'
          ? 'በቂ ሂሳብ የለዎትም!'
          : 'Insufficient account balance!'
      );
      return;
    }

    if (finalAmount > 10000) {
      setError(
        currentLang === 'am'
          ? 'የአንድ ጊዜ ከፍተኛው የጥሬ ገንዘብ ማውጫ 10,000 ብር ነው'
          : 'Maximum cardless cash-out per transaction is 10,000 ETB'
      );
      return;
    }

    // Generate 6-digit ATM cashout code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setLatestCode(generatedCode);

    const newRequest: WithdrawalRequest = {
      id: 'W' + Math.floor(100000 + Math.random() * 900000),
      amount: finalAmount,
      code: generatedCode,
      type: cashOutType,
      timestamp: new Date().toISOString(),
      expirySeconds: 1800, // 30 minutes
    };

    setWithdrawalRequests((prev) => [newRequest, ...prev]);

    if (onCashOutSuccess) {
      onCashOutSuccess(finalAmount);
    }

    setView('success');
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleDeleteRequest = (id: string) => {
    setWithdrawalRequests((prev) => prev.filter((w) => w.id !== id));
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121016]/90 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in select-none">
      <div className="bg-white text-slate-800 w-full max-w-sm rounded-[36px] overflow-hidden shadow-2xl border border-slate-200 flex flex-col h-[640px] max-h-[95vh] relative">
        
        {/* Header Bar matching image perfectly */}
        <div className="bg-[#701484] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (view === 'new_form') {
                  setView('history');
                } else if (view === 'success') {
                  setView('history');
                } else {
                  onClose();
                }
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-sm tracking-wide">
              {view === 'new_form'
                ? (currentLang === 'am' ? 'አዲስ ገንዘብ ማውጫ' : 'New Withdrawal')
                : (currentLang === 'am' ? 'የገንዘብ ማውጫ ታሪክ' : 'Withdrawal History')}
            </h2>
          </div>
          
          <button
            onClick={handleRefreshHistory}
            className={`p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white ${isLoading ? 'animate-spin' : ''}`}
          >
            <RotateCw className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white p-6 flex flex-col relative overflow-y-auto">
          
          {view === 'history' && (
            /* ================= VIEW 1: WITHDRAWAL HISTORY ================= */
            <div className="flex-1 flex flex-col h-full">
              {withdrawals.length === 0 ? (
                // Empty state matching IMG_20261002_133648_933.jpg
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 my-auto">
                  {/* Clean SVG ribbon flag with checkmark inside */}
                  <div className="w-20 h-20 text-[#a37fc9] flex items-center justify-center">
                    <svg viewBox="0 0 48 48" className="w-20 h-20 text-purple-400" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      {/* Ribbon bookmark path */}
                      <path d="M12 4 L36 4 L36 44 L24 34 L12 44 Z" />
                      {/* Inside Checkmark */}
                      <path d="M19 22 L23 26 L30 18" strokeWidth="4" />
                    </svg>
                  </div>

                  <h3 className="text-[15px] font-bold text-slate-800 tracking-tight">
                    No withdrawal requests found yet.
                  </h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[260px]">
                    When you initiate a withdrawal, it will show up here.
                  </p>

                  <button
                    onClick={handleRefreshHistory}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-[#701484] hover:bg-[#620d69] active:scale-95 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Refresh History
                  </button>
                </div>
              ) : (
                // List of active withdrawal requests
                <div className="space-y-4">
                  <div className="text-[10px] font-extrabold text-[#701484] uppercase tracking-wider block mb-2 text-left">
                    Active Cash-Out Codes
                  </div>
                  
                  {withdrawals.map((w) => (
                    <div
                      key={w.id}
                      className="bg-purple-50/40 p-4 rounded-3xl border border-purple-100 flex flex-col space-y-3 shadow-2xs relative text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold bg-[#701484]/10 text-[#701484] px-2.5 py-0.5 rounded-full uppercase">
                          {w.type === 'atm' ? 'ATM Cardless' : 'Agent Cash Out'}
                        </span>
                        
                        <button
                          onClick={() => handleDeleteRequest(w.id)}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-slate-400 text-[10px] font-semibold">Amount</div>
                          <div className="text-base font-extrabold text-slate-800">
                            {formatCurrency(w.amount, '').trim()} ETB
                          </div>
                        </div>

                        {/* Big copyable code */}
                        <button
                          onClick={() => handleCopyCode(w.code, w.id)}
                          className="bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700"
                        >
                          <span className="text-xs font-extrabold font-mono tracking-wider">{w.code}</span>
                          {copiedCodeId === w.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>

                      {/* Expiry countdown timer */}
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold border-t border-purple-100/50 pt-2.5">
                        <Clock className="w-3.5 h-3.5 text-[#701484]" />
                        <span>Code expires in:</span>
                        <span className="text-[#701484] font-mono">{formatTimer(w.expirySeconds)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Floating bottom right '+ New Withdrawal' button */}
              <div className="absolute bottom-6 right-6">
                <button
                  onClick={() => setView('new_form')}
                  className="flex items-center gap-1.5 px-4.5 py-3.5 bg-[#701484] hover:bg-[#620d69] active:scale-95 text-white font-extrabold text-xs rounded-full shadow-lg shadow-purple-950/20 cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                  <span>New Withdrawal</span>
                </button>
              </div>
            </div>
          )}

          {view === 'new_form' && (
            /* ================= VIEW 2: FORM FOR NEW WITHDRAWAL ================= */
            <form onSubmit={handleCreateRequest} className="space-y-5 text-left animate-in slide-in-from-right-4 duration-200">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                  Cash-Out Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCashOutType('atm')}
                    className={`py-3 rounded-2xl border text-center font-bold text-xs cursor-pointer transition-all ${cashOutType === 'atm' ? 'border-[#701484] bg-purple-50/50 text-[#701484]' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    ATM Cardless
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashOutType('agent')}
                    className={`py-3 rounded-2xl border text-center font-bold text-xs cursor-pointer transition-all ${cashOutType === 'agent' ? 'border-[#701484] bg-purple-50/50 text-[#701484]' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    At CBE Agent
                  </button>
                </div>
              </div>

              {/* Quick Amount Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                  Select Amount
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2.5 rounded-xl border text-center font-bold font-mono text-[11px] cursor-pointer transition-all ${selectedAmount === amt && !customAmount ? 'border-[#701484] bg-purple-50 text-[#701484]' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'}`}
                    >
                      {amt} ETB
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                  Or Custom Amount (Max 10k)
                </label>
                <input
                  type="number"
                  placeholder="Enter custom cash-out amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#701484] font-semibold text-xs"
                />
              </div>

              {error && (
                <div className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#701484] hover:bg-[#620d69] text-white font-extrabold text-xs rounded-full shadow-md cursor-pointer transition-all mt-4"
              >
                Generate Withdrawal Code
              </button>
            </form>
          )}

          {view === 'success' && (
            /* ================= VIEW 3: SUCCESS CODE SCREEN ================= */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-800">
                  Withdrawal Code Generated!
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {cashOutType === 'atm'
                    ? 'Use this code at any CBE ATM to withdraw cash without a card.'
                    : 'Show this code to any authorized CBE Agent to cash out.'}
                </p>
              </div>

              {/* High-fidelity 6-Digit code card */}
              <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-3xl w-full flex flex-col items-center justify-center space-y-2">
                <span className="text-[9px] font-extrabold tracking-wider text-purple-700/80 uppercase">
                  ATM Cash-Out Code
                </span>
                <span className="text-3xl font-extrabold font-mono tracking-widest text-[#701484]">
                  {latestCode}
                </span>

                <button
                  onClick={() => handleCopyCode(latestCode, 'latest')}
                  className="mt-2 text-xs font-bold text-[#701484] hover:underline flex items-center gap-1 cursor-pointer bg-white px-3 py-1 rounded-full border border-purple-100 shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedCodeId === 'latest' ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                <Clock className="w-4 h-4 text-[#701484]" />
                <span>Code is valid for 30 minutes</span>
              </div>

              <button
                onClick={() => setView('history')}
                className="w-full py-3 bg-[#701484] hover:bg-[#620d69] text-white font-extrabold text-xs rounded-full shadow-md cursor-pointer transition-all"
              >
                Go to Withdrawal History
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
