import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Building2,
  Share2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { CbeAccount, Language, Transaction } from '../types/banking';
import { formatCurrency, formatSimpleDate } from '../utils/smsParser';
import { getTranslation } from '../locales/translations';

interface ReceiptModalProps {
  transaction: Transaction | null;
  accounts: CbeAccount[];
  currentLang: Language;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  accounts,
  currentLang,
  onClose,
}) => {
  const t = getTranslation(currentLang) as any;
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transaction) {
      const qrPayload = JSON.stringify({
        ref: transaction.referenceNumber,
        amt: `${transaction.amount} ${transaction.currency}`,
        from: transaction.senderName,
        to: transaction.receiverName,
        time: transaction.timestamp,
        hash: transaction.hash,
        verifiedBy: 'RiggedBank-Core-Ethiopia-2026',
      });

      QRCode.toDataURL(qrPayload, {
        width: 160,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR code generation failed', err));
    }
  }, [transaction]);

  if (!transaction) return null;

  const associatedAccount = accounts.find((a) => a.id === transaction.accountId);
  const totalDebited = transaction.amount + transaction.fee + transaction.vat;

  const handleCopyReceiptText = () => {
    const text = `
=== ${t.receiptTitle.toUpperCase()} ===
Ref No: ${transaction.referenceNumber}
Date: ${formatSimpleDate(transaction.timestamp, currentLang)}
Status: ${transaction.status.toUpperCase()}
Amount: ${formatCurrency(transaction.amount, transaction.currency)}
Fee: ${formatCurrency(transaction.fee + transaction.vat, transaction.currency)}
Total: ${formatCurrency(totalDebited, transaction.currency)}

Payer: ${transaction.senderName} (${transaction.senderAccount})
Payee: ${transaction.receiverName} (${transaction.receiverAccount} - ${transaction.receiverBank})
Channel: ${transaction.channel}
Remark: ${transaction.note}
Security Hash: ${transaction.hash}
Verified via RiggedBank Ledger Network
===================================
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              {t.receiptTitle}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyReceiptText}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
              title="Copy Receipt Text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Slip Content Area */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-200" ref={receiptRef}>
          {/* Authentic Bank Header */}
          <div className="text-center space-y-2 border-b border-dashed border-slate-700/80 pb-5">
            <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-wide uppercase">
                {currentLang === 'am' ? 'ሪግድ ባንክ ዋና ዲጂታል ሌጀር' : 'RIGGED BANK CORE SYSTEM'}
              </h2>
              <p className="text-xs text-slate-400">
                {associatedAccount ? (currentLang === 'am' ? associatedAccount.nameAm : associatedAccount.nameEn) : 'Digital Banking Transaction'}
              </p>
            </div>

            {/* Verified Stamp Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.verifiedStamp}</span>
            </div>
          </div>

          {/* Amount Hero */}
          <div className="text-center bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              {t.transferAmount}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
              {formatCurrency(transaction.amount, transaction.currency)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Status: <span className="text-emerald-400 font-bold uppercase">{transaction.status}</span>
            </div>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">{t.referenceNo}</span>
              <span className="font-mono font-bold text-white tracking-tight">{transaction.referenceNumber}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">{t.transactionDate}</span>
              <span className="font-mono text-slate-200">{formatSimpleDate(transaction.timestamp, currentLang)}</span>
            </div>

            <div className="flex items-start justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">{t.senderDetails}</span>
              <div className="text-right">
                <div className="font-semibold text-slate-200">{transaction.senderName}</div>
                <div className="font-mono text-[11px] text-slate-400">{transaction.senderAccount}</div>
              </div>
            </div>

            <div className="flex items-start justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">{t.receiverDetails}</span>
              <div className="text-right">
                <div className="font-semibold text-slate-200">{transaction.receiverName}</div>
                <div className="font-mono text-[11px] text-slate-400">
                  {transaction.receiverAccount} ({transaction.receiverBank})
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">{t.paymentChannel}</span>
              <span className="font-medium text-slate-200">{transaction.channel}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">{t.serviceFee}</span>
              <span className="font-mono text-slate-300">{formatCurrency(transaction.fee, transaction.currency)}</span>
            </div>

            {transaction.vat > 0 && (
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{t.vatCharge}</span>
                <span className="font-mono text-slate-300">{formatCurrency(transaction.vat, transaction.currency)}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-b border-slate-800/80 text-sm font-bold">
              <span className="text-slate-200">{t.totalDebited}</span>
              <span className="font-mono text-emerald-400 tabular-nums">{formatCurrency(totalDebited, transaction.currency)}</span>
            </div>

            <div className="py-1.5 space-y-1">
              <span className="text-slate-400 block">{t.reasonRemark}</span>
              <p className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 leading-relaxed font-sans">
                {transaction.note}
              </p>
            </div>
          </div>

          {/* QR Code & Verification Block */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
            {qrCodeDataUrl && (
              <div className="bg-white p-2 rounded-lg shrink-0 shadow-md">
                <img
                  src={qrCodeDataUrl}
                  alt="Official Transaction Verification QR"
                  className="w-24 h-24"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="space-y-1 text-center sm:text-left text-xs">
              <div className="flex items-center justify-center sm:justify-start gap-1 font-semibold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t.securityHash}</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 break-all bg-slate-900/90 p-1.5 rounded border border-slate-800">
                {transaction.hash}
              </p>
              <p className="text-[11px] text-slate-500">
                {t.scanToVerify}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleCopyReceiptText}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t.receiptCopied : t.copyReceipt}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printReceipt}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
