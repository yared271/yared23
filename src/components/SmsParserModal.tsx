import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { CbeAccount, BankId, Language, ParsedSmsResult, Transaction } from '../types/banking';
import { parseEthiopianBankSms, formatCurrency, generateSecurityHash } from '../utils/smsParser';
import { SAMPLE_SMS_TEMPLATES } from '../data/initialData';
import { getTranslation } from '../locales/translations';

interface SmsParserModalProps {
  accounts: CbeAccount[];
  currentLang: Language;
  onClose: () => void;
  onAddTransaction: (transaction: Transaction) => void;
}

export const SmsParserModal: React.FC<SmsParserModalProps> = ({
  accounts,
  currentLang,
  onClose,
  onAddTransaction,
}) => {
  const t = getTranslation(currentLang) as any;
  const [smsText, setSmsText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedSmsResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState(false);

  const handleParse = (textToParse: string = smsText) => {
    setParseError(null);
    setSuccessNotice(false);

    if (!textToParse.trim()) {
      setParseError('Please enter or paste an SMS message to parse.');
      return;
    }

    const result = parseEthiopianBankSms(textToParse);
    if (!result) {
      setParseError(t.smsParseError);
      setParsedData(null);
    } else {
      setParsedData(result);
    }
  };

  const handleSelectTemplate = (template: { bank: string; sms: string }) => {
    setSmsText(template.sms);
    handleParse(template.sms);
  };

  const handleSaveToLedger = () => {
    if (!parsedData) return;

    const sourceAccount = accounts.find((a) => a.id === parsedData.bankId) || accounts[0];
    const isOutflow = parsedData.type === 'outflow';

    const newTx: Transaction = {
      id: parsedData.referenceNumber || `TXN${Date.now()}`,
      referenceNumber: parsedData.referenceNumber,
      transferMode: 'cbe_to_cbe',
      accountId: parsedData.bankId,
      senderName: isOutflow ? 'You (Self)' : parsedData.partyName,
      senderAccount: isOutflow ? sourceAccount.accountNumber : parsedData.partyAccount,
      receiverName: isOutflow ? parsedData.partyName : 'You (Self)',
      receiverAccount: isOutflow ? parsedData.partyAccount : sourceAccount.accountNumber,
      receiverBank: sourceAccount.nameEn,
      amount: parsedData.amount,
      fee: parsedData.fee || 0,
      vat: parsedData.fee ? Number((parsedData.fee * 0.15).toFixed(2)) : 0,
      currency: 'ETB',
      type: parsedData.type,
      category: parsedData.category,
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: `Parsed from SMS confirmation: ${parsedData.partyName}`,
      channel: (parsedData.channel as any) || 'Mobile App',
      hash: generateSecurityHash(parsedData.referenceNumber, parsedData.amount, parsedData.partyName, sourceAccount.accountNumber),
      rawSms: smsText,
    };

    onAddTransaction(newTx);
    setSuccessNotice(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {t.smsParserTitle}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t.smsParserSubtitle}
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

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-300">
          {/* Preset Sample SMS Quick Buttons */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {t.sampleSmsTemplates}
            </label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_SMS_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors text-left"
                >
                  ⚡ {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* SMS Text Area */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {t.pasteSmsPrompt}
            </label>
            <textarea
              rows={4}
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="Paste SMS here, e.g.: 'Dear Customer, you have transferred ETB 2,500.00 to ABEBE...'"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-mono"
            />
          </div>

          {/* Parse Trigger Button */}
          <div className="flex justify-end">
            <button
              onClick={() => handleParse()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-500/10 active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.parseNow}</span>
            </button>
          </div>

          {/* Error Message */}
          {parseError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{t.smsParseSuccess}</span>
            </div>
          )}

          {/* Parsed Result Preview Card */}
          {parsedData && !successNotice && (
            <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white">{t.parsedDetails}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                  parsedData.type === 'inflow' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {parsedData.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Identified Bank:</span>
                  <span className="font-bold text-slate-200 uppercase">{parsedData.bankId}</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Amount:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {formatCurrency(parsedData.amount, 'ETB')}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Reference ID:</span>
                  <span className="font-mono text-emerald-400">{parsedData.referenceNumber}</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Counterparty:</span>
                  <span className="font-semibold text-slate-200">{parsedData.partyName}</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Category:</span>
                  <span className="text-slate-300">{parsedData.category}</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Channel:</span>
                  <span className="text-slate-300">{parsedData.channel}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveToLedger}
                  className="w-full py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.addToHistory}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
