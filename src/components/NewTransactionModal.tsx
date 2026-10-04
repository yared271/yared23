import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Send,
  Building2,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Phone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CbeAccount, BankId, Language, Transaction, TransactionCategory } from '../types/banking';
import { formatCurrency, generateSecurityHash } from '../utils/smsParser';
import { getTranslation } from '../locales/translations';

interface NewTransactionModalProps {
  accounts: CbeAccount[];
  currentLang: Language;
  onClose: () => void;
  onAddTransaction: (tx: Transaction) => void;
  onOpenReceipt: (tx: Transaction) => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  accounts,
  currentLang,
  onClose,
  onAddTransaction,
  onOpenReceipt,
}) => {
  const t = getTranslation(currentLang) as any;

  const [sourceBankId, setSourceBankId] = useState<BankId>((accounts[0]?.id as BankId) || 'cbe');
  const [destBank, setDestBank] = useState<string>('Telebirr');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<TransactionCategory>('Transfer');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  const sourceAccount = accounts.find((a) => a.id === sourceBankId) || accounts[0];
  const numAmount = parseFloat(amount) || 0;
  const estimatedFee = numAmount > 1000 ? 10.00 : numAmount > 0 ? 5.00 : 0.00;
  const estimatedVat = Number((estimatedFee * 0.15).toFixed(2));
  const totalDeducted = numAmount + estimatedFee + estimatedVat;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recipientName.trim()) {
      setError('Please enter the recipient full name.');
      return;
    }
    if (!recipientAccount.trim()) {
      setError('Please enter the recipient account number or mobile phone.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid transfer amount.');
      return;
    }
    if (totalDeducted > sourceAccount.balance) {
      setError(`Insufficient funds in ${sourceAccount.nameEn}. Available: ${formatCurrency(sourceAccount.balance, 'ETB')}`);
      return;
    }
    if (pin.length < 4) {
      setError('Please enter your 4-digit security PIN to authorize the transaction.');
      return;
    }

    const ftCode = `FT${new Date().getFullYear().toString().slice(2)}${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const newTx: Transaction = {
      id: ftCode,
      referenceNumber: ftCode,
      accountId: sourceBankId,
      senderName: 'Yared Nigusse (ያሬድ ንጉሴ)',
      senderAccount: sourceAccount.accountNumber,
      receiverName: recipientName.trim(),
      receiverAccount: recipientAccount.trim(),
      receiverBank: destBank,
      amount: numAmount,
      fee: estimatedFee,
      vat: estimatedVat,
      currency: 'ETB',
      type: 'outflow',
      category: category,
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: note.trim() || 'Electronic Fund Transfer',
      channel: 'CBE Mobile App',
      transferMode: 'cbe_to_cbe',
      hash: generateSecurityHash(ftCode, numAmount, sourceAccount.accountNumber, recipientAccount.trim()),
    };

    onAddTransaction(newTx);
    setCompletedTx(newTx);
    setStep('success');

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#14b8a6', '#38bdf8', '#fbbf24'],
      });
    } catch {
      // safe fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {t.newTransferTitle}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t.newTransferSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Source Account Selector */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">{t.sourceAccount}</label>
              <select
                value={sourceBankId}
                onChange={(e) => setSourceBankId(e.target.value as BankId)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-emerald-500/50 outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {(acc as any).brandCode || 'CBE'} - {currentLang === 'am' ? acc.nameAm : acc.nameEn} ({formatCurrency(acc.balance, 'ETB')})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Bank & Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">{t.destinationBank}</label>
                <select
                  value={destBank}
                  onChange={(e) => setDestBank(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-emerald-500/50 outline-none"
                >
                  <option value="Commercial Bank of Ethiopia">Commercial Bank of Ethiopia (CBE)</option>
                  <option value="Telebirr SuperApp">Telebirr (ቴሌብር)</option>
                  <option value="Awash Bank">Awash Bank (አዋሽ)</option>
                  <option value="Bank of Abyssinia">Bank of Abyssinia (አቢሲኒያ)</option>
                  <option value="Dashen Bank">Dashen Bank (ዳሽን)</option>
                  <option value="Rigged Bank Prime Vault">Rigged Bank (ሪግድ ባንክ)</option>
                  <option value="Cooperative Bank of Oromia">Coop Bank (ህብረት)</option>
                  <option value="Nib International Bank">Nib Bank (ንብ)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">{t.selectCategory}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-emerald-500/50 outline-none"
                >
                  <option value="Transfer">Transfer / ዝውውር</option>
                  <option value="Bill Payment">Bill Payment / ክፍያ</option>
                  <option value="Airtime">Airtime / ካርድ</option>
                  <option value="Merchant QR">Merchant QR / ነጋዴ</option>
                  <option value="Utility">Utility / መብራት/ውሃ</option>
                  <option value="Food & Dining">Food & Dining / ምግብ</option>
                  <option value="Shopping">Shopping / ግዢ</option>
                </select>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">{t.recipientName}</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Abebe Bikila"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-emerald-500/50 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">{t.recipientAccount}</label>
                <input
                  type="text"
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  placeholder="e.g. 1000293849102 or 0911223344"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-emerald-500/50 outline-none font-mono"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">{t.transferAmountLabel}</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-3 pr-16 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-base font-bold focus:border-emerald-500/50 outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-emerald-400">
                  ETB
                </span>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">{t.paymentNote}</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason / payment reference (e.g. Rent, consulting fee)"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-emerald-500/50 outline-none"
              />
            </div>

            {/* Security PIN */}
            <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.transactionPin}</span>
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-32 tracking-[0.4em] text-center p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold focus:border-emerald-500 outline-none"
              />
              <p className="text-[10px] text-slate-500">Default test pin: any 4 digits (e.g. 1234)</p>
            </div>

            {/* Breakdown Summary */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Transfer Amount:</span>
                <span className="font-mono text-white">{formatCurrency(numAmount, 'ETB')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Interbank Fee:</span>
                <span className="font-mono text-slate-300">{formatCurrency(estimatedFee + estimatedVat, 'ETB')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-200 pt-1 border-t border-slate-800 text-xs">
                <span>Total Deducted:</span>
                <span className="font-mono text-emerald-400">{formatCurrency(totalDeducted, 'ETB')}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>{t.transferNow}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Success Step */
          <div className="p-6 text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {t.transferSuccess}
              </h3>
              <p className="text-xs text-slate-400">
                Amount of {formatCurrency(numAmount, 'ETB')} has been settled and transferred to {recipientName}.
              </p>
              <div className="font-mono text-xs text-emerald-400 pt-1">
                Ref: {completedTx?.referenceNumber}
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
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 text-xs flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.viewGeneratedReceipt}</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors text-xs"
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
