import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Send,
  Building2,
  Lock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Check
} from 'lucide-react';
import { CbeAccount, Language, Transaction, TransferMode, VerifiedBeneficiary } from '../types/banking';
import { OTHER_BANKS_LIST, VERIFIED_CBE_BENEFICIARIES } from '../data/initialData';
import { formatCurrency, generateSecurityHash } from '../utils/smsParser';
import { getTranslation } from '../locales/translations';
import { findUserByAccountOrPhone, formatEnglishNameOnly } from '../utils/userDatabase';

interface CbeTransferModalProps {
  initialMode: TransferMode;
  initialBeneficiary?: VerifiedBeneficiary | null;
  accounts: CbeAccount[];
  currentLang: Language;
  userName?: string;
  onClose: () => void;
  onAddTransaction: (tx: Transaction) => void;
  onOpenReceipt: (tx: Transaction) => void;
}

export const CbeTransferModal: React.FC<CbeTransferModalProps> = ({
  initialMode,
  initialBeneficiary,
  accounts,
  currentLang,
  userName = 'Yared Nigusse Teshome',
  onClose,
  onAddTransaction,
  onOpenReceipt,
}) => {
  const t = getTranslation(currentLang);
  const [transferMode, setTransferMode] = useState<TransferMode>(initialMode);
  const [sourceAccountId, setSourceAccountId] = useState<string>('cbe-primary');

  // Mode 1: CBE to CBE
  const [cbeAccountInput, setCbeAccountInput] = useState<string>(
    initialBeneficiary && initialMode === 'cbe_to_cbe' ? initialBeneficiary.accountNumber : ''
  );
  const [verifiedName, setVerifiedName] = useState<string | null>(
    initialBeneficiary && initialMode === 'cbe_to_cbe' ? initialBeneficiary.fullName : null
  );
  const [isValidating, setIsValidating] = useState(false);

  // Mode 2: Other Banks / EthSwitch
  const [selectedDestBank, setSelectedDestBank] = useState<string>(
    initialBeneficiary && initialMode === 'other_banks' ? initialBeneficiary.bankName : OTHER_BANKS_LIST[0].name
  );
  const [otherRecipientAccount, setOtherRecipientAccount] = useState<string>(
    initialBeneficiary && initialMode === 'other_banks' ? initialBeneficiary.accountNumber : ''
  );
  const [otherRecipientName, setOtherRecipientName] = useState<string>(
    initialBeneficiary && initialMode === 'other_banks' ? initialBeneficiary.fullName : ''
  );

  // Common fields
  const [amount, setAmount] = useState<string>('');
  const [remark, setRemark] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  const sourceAccount = accounts.find((a) => a.id === sourceAccountId) || accounts[0];
  const numAmount = parseFloat(amount) || 0;
  const isCbeMode = transferMode === 'cbe_to_cbe';

  const fee = isCbeMode ? 0.00 : 5.00;
  const vat = isCbeMode ? 0.00 : 0.75;
  const totalDebited = numAmount + fee + vat;

  // Auto-fill if initial beneficiary provided
  useEffect(() => {
    if (initialBeneficiary) {
      if (initialMode === 'cbe_to_cbe') {
        setCbeAccountInput(initialBeneficiary.accountNumber);
        setVerifiedName(initialBeneficiary.fullName);
      } else {
        setSelectedDestBank(initialBeneficiary.bankName);
        setOtherRecipientAccount(initialBeneficiary.accountNumber);
        setOtherRecipientName(initialBeneficiary.fullName);
      }
    }
  }, [initialBeneficiary, initialMode]);

  // Validate CBE Account
  const handleValidateCbeAccount = () => {
    setError(null);
    if (!cbeAccountInput.trim() || cbeAccountInput.length < 6) {
      setError('Please enter a valid 13-digit CBE account number.');
      return;
    }

    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      const userMatch = findUserByAccountOrPhone(cbeAccountInput.trim());
      if (userMatch) {
        setVerifiedName(userMatch.userProfile.fullName);
        return;
      }
      const match = VERIFIED_CBE_BENEFICIARIES.find((b) => b.accountNumber === cbeAccountInput.trim());
      if (match) {
        setVerifiedName(match.fullName);
      } else {
        // Realistic CBE algorithmic name resolution
        const randomNames = [
          'KASSAHUN GIZACHEW BEKELE',
          'TSEHAY WORKU ASSEFA',
          'BERHANU TADESSE HAILE',
          'ASTER MEKONNEN GOBENA',
          'HABTAMU ALEMU TEFERA'
        ];
        const assigned = randomNames[Math.abs(cbeAccountInput.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % randomNames.length];
        setVerifiedName(assigned);
      }
    }, 450);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const recipient = isCbeMode ? verifiedName : otherRecipientName;
    const destAcc = isCbeMode ? cbeAccountInput : otherRecipientAccount;
    const destBankName = isCbeMode ? 'Commercial Bank of Ethiopia' : selectedDestBank;

    if (isCbeMode && !verifiedName) {
      setError('Please validate the CBE account number to confirm the account holder name.');
      return;
    }

    if (!isCbeMode && (!otherRecipientName.trim() || !otherRecipientAccount.trim())) {
      setError('Please enter both the recipient full name and account/phone number.');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid transfer amount in ETB.');
      return;
    }

    if (totalDebited > sourceAccount.balance) {
      setError(`Insufficient balance in ${sourceAccount.nameEn}. Available: ${formatCurrency(sourceAccount.balance, 'ETB')}`);
      return;
    }

    if (pin.length < 4) {
      setError('Please enter your 4-digit mobile banking security PIN.');
      return;
    }

    const ftCode = `FT2609${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newTx: Transaction = {
      id: ftCode,
      referenceNumber: ftCode,
      transferMode: transferMode,
      accountId: sourceAccountId,
      senderName: formatEnglishNameOnly(userName || 'Yared Nigusse Teshome'),
      senderAccount: sourceAccount.accountNumber,
      receiverName: formatEnglishNameOnly(recipient || 'Beneficiary'),
      receiverAccount: destAcc,
      receiverBank: destBankName,
      amount: numAmount,
      fee: fee,
      vat: vat,
      currency: 'ETB',
      type: 'outflow',
      category: isCbeMode ? 'CBE to CBE Transfer' : selectedDestBank.includes('Telebirr') ? 'Telebirr Transfer' : 'Other Bank Transfer',
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: remark.trim() ? remark.trim().replace(/mb transfer/i, 'MB Transfer') : (isCbeMode ? 'MB Transfer' : 'EthSwitch Interbank Transfer'),
      channel: isCbeMode ? 'CBE Mobile App' : selectedDestBank.includes('Telebirr') ? 'CBE Birr' : 'EthSwitch',
      hash: generateSecurityHash(ftCode, numAmount, sourceAccount.accountNumber, destAcc),
    };

    onAddTransaction(newTx);
    setCompletedTx(newTx);
    setStep('success');

    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#7e22ce', '#a855f7', '#10b981'],
      });
    } catch {
      // safe
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#240626] border border-purple-800/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-900/80 bg-purple-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {isCbeMode ? t.cbeTransferModalTitle : t.otherBankModalTitle}
              </h3>
              <p className="text-[11px] text-purple-300">
                {isCbeMode ? t.cbeFreeNotice : t.interbankFeeNotice}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dual Transfer Mode Segmented Switch */}
        <div className="p-4 bg-purple-950/60 border-b border-purple-900/60 shrink-0">
          <div className="grid grid-cols-2 gap-2 bg-purple-900/40 p-1 rounded-xl border border-purple-800/80 text-xs">
            <button
              onClick={() => {
                setTransferMode('cbe_to_cbe');
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                transferMode === 'cbe_to_cbe'
                  ? 'bg-amber-400 text-purple-950 shadow-md'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <span>1. {t.cbeToCbeTransfer}</span>
            </button>

            <button
              onClick={() => {
                setTransferMode('other_banks');
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                transferMode === 'other_banks'
                  ? 'bg-sky-400 text-slate-950 shadow-md'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <span>2. {t.otherBanksTransfer}</span>
            </button>
          </div>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleTransferSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center gap-2 text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Source Account */}
            <div className="space-y-1.5">
              <label className="text-purple-200 font-semibold block">{t.sourceAccount}</label>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full p-2.5 bg-purple-950/90 border border-purple-800 rounded-xl text-white text-xs focus:border-amber-400 outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {currentLang === 'am' ? acc.nameAm : acc.nameEn} ({acc.accountNumber}) - {formatCurrency(acc.balance, 'ETB')}
                  </option>
                ))}
              </select>
            </div>

            {/* MODE 1: CBE to CBE Transfer Form Fields */}
            {isCbeMode ? (
              <div className="space-y-3 p-3.5 bg-purple-950/40 border border-purple-800/80 rounded-xl">
                <div className="space-y-1.5">
                  <label className="text-amber-300 font-bold block">{t.cbeAccountInputLabel}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cbeAccountInput}
                      onChange={(e) => {
                        setCbeAccountInput(e.target.value);
                        setVerifiedName(null);
                      }}
                      placeholder="e.g. 1000293847291"
                      className="flex-1 p-2.5 bg-purple-950 border border-purple-700 rounded-xl text-white font-mono text-xs focus:border-amber-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleValidateCbeAccount}
                      disabled={isValidating}
                      className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-purple-950 font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isValidating ? t.verifyingName : t.validateAccountBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Verified Account Holder Display */}
                {verifiedName && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-emerald-400/80 uppercase block">{t.nameVerifiedSuccess}</span>
                      <span className="font-bold text-xs text-white tracking-wide">{verifiedName}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* MODE 2: Other Banks / EthSwitch Form Fields */
              <div className="space-y-3 p-3.5 bg-purple-950/40 border border-purple-800/80 rounded-xl">
                <div className="space-y-1.5">
                  <label className="text-sky-300 font-bold block">{t.destinationBankLabel}</label>
                  <select
                    value={selectedDestBank}
                    onChange={(e) => setSelectedDestBank(e.target.value)}
                    className="w-full p-2.5 bg-purple-950 border border-purple-700 rounded-xl text-white text-xs focus:border-sky-400 outline-none"
                  >
                    {OTHER_BANKS_LIST.map((bank) => (
                      <option key={bank.id} value={bank.name}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-purple-200 font-semibold block">{t.recipientNameLabel}</label>
                    <input
                      type="text"
                      value={otherRecipientName}
                      onChange={(e) => setOtherRecipientName(e.target.value)}
                      placeholder="e.g. Selamawit Tadesse"
                      className="w-full p-2.5 bg-purple-950 border border-purple-700 rounded-xl text-white text-xs focus:border-sky-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-purple-200 font-semibold block">{t.otherBankAccountLabel}</label>
                    <input
                      type="text"
                      value={otherRecipientAccount}
                      onChange={(e) => setOtherRecipientAccount(e.target.value)}
                      placeholder="e.g. 01320492819200 or 0911223344"
                      className="w-full p-2.5 bg-purple-950 border border-purple-700 rounded-xl text-white font-mono text-xs focus:border-sky-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Transfer Amount */}
            <div className="space-y-1.5">
              <label className="text-purple-200 font-semibold block">{t.amountLabel}</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-3.5 pr-16 py-2.5 bg-purple-950 border border-purple-700 rounded-xl text-white font-mono text-base font-extrabold focus:border-amber-400 outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-amber-400">
                  ETB
                </span>
              </div>
            </div>

            {/* Payment Remark */}
            <div className="space-y-1.5">
              <label className="text-purple-200 font-semibold block">{t.remarkLabel}</label>
              <input
                type="text"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="e.g. House rent, School fee, Supplies"
                className="w-full p-2.5 bg-purple-950 border border-purple-700 rounded-xl text-white text-xs focus:border-amber-400 outline-none"
              />
            </div>

            {/* 4-Digit Security PIN */}
            <div className="space-y-1.5 bg-purple-950/80 p-3 rounded-xl border border-purple-800">
              <label className="text-purple-200 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.pinLabel}</span>
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-32 tracking-[0.4em] text-center p-2 bg-purple-900/90 border border-purple-600 rounded-lg text-white font-mono font-bold focus:border-amber-400 outline-none"
              />
              <p className="text-[10px] text-purple-400">Test PIN: any 4 numbers (e.g. 1234)</p>
            </div>

            {/* Fee & Debited Breakdown */}
            <div className="bg-purple-950/70 p-3 rounded-xl border border-purple-800 text-[11px] space-y-1 font-mono">
              <div className="flex justify-between text-purple-300">
                <span>Transfer Amount:</span>
                <span className="text-white font-bold">{formatCurrency(numAmount, 'ETB')}</span>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Service Fee & VAT:</span>
                <span className="text-amber-300 font-bold">
                  {isCbeMode ? '0.00 ETB (FREE)' : formatCurrency(fee + vat, 'ETB')}
                </span>
              </div>
              <div className="flex justify-between font-bold text-white pt-1 border-t border-purple-800 text-xs">
                <span>Total Amount Deducted:</span>
                <span className="text-amber-400">{formatCurrency(totalDebited, 'ETB')}</span>
              </div>
            </div>

            {/* Submit Transfer Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-purple-950 font-extrabold rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>{t.sendMoneyBtn}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Transfer Completed Success Step */
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto text-purple-950 shadow-lg shadow-amber-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">
                {t.transferSuccessMsg}
              </h3>
              <p className="text-xs text-purple-200">
                {formatCurrency(numAmount, 'ETB')} has been successfully transferred to {completedTx?.receiverName}.
              </p>
              <div className="font-mono text-xs text-amber-400 pt-1 font-bold">
                Ref No: {completedTx?.referenceNumber}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (completedTx) {
                    onClose();
                    onOpenReceipt(completedTx);
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-purple-950 font-extrabold rounded-xl transition-all shadow-md shadow-amber-500/20 text-xs flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.viewReceiptBtn}</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-purple-900 hover:bg-purple-800 text-purple-200 font-semibold rounded-xl transition-colors text-xs"
              >
                {t.close}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
