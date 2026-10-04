import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Landmark,
  Share2,
  FileText
} from 'lucide-react';
import { Language, Transaction } from '../types/banking';
import { formatCurrency, formatSimpleDate } from '../utils/smsParser';
import { formatCbeName } from '../utils/userDatabase';
import { getTranslation } from '../locales/translations';

interface CbeReceiptSlipModalProps {
  transaction: Transaction | null;
  currentLang: Language;
  onClose: () => void;
}

export const CbeReceiptSlipModal: React.FC<CbeReceiptSlipModalProps> = ({
  transaction,
  currentLang,
  onClose,
}) => {
  const t = getTranslation(currentLang);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transaction) {
      const qrPayload = JSON.stringify({
        bank: 'Commercial Bank of Ethiopia (CBE)',
        ref: transaction.referenceNumber,
        amount: `${transaction.amount} ETB`,
        payer: transaction.senderName,
        beneficiary: transaction.receiverName,
        destAcc: transaction.receiverAccount,
        destBank: transaction.receiverBank,
        timestamp: transaction.timestamp,
        hash: transaction.hash,
        authStatus: 'SUCCESS_SETTLED_CBE',
      });

      QRCode.toDataURL(qrPayload, {
        width: 180,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR code generation failed', err));
    }
  }, [transaction]);

  if (!transaction) return null;

  const totalDebited = transaction.amount + transaction.fee + transaction.vat;

  const handleCopyReceiptText = () => {
    const text = `
=========================================
COMMERCIAL BANK OF ETHIOPIA (CBE)
የኢትዮጵያ ንግድ ባንክ
OFFICIAL TRANSACTION CONFIRMATION SLIP
=========================================
Ref No: ${transaction.referenceNumber}
Date & Time: ${formatSimpleDate(transaction.timestamp, currentLang)}
Status: ${transaction.status.toUpperCase()}

Transfer Amount: ${formatCurrency(transaction.amount, 'ETB')}
Service Charge: ${formatCurrency(transaction.fee, 'ETB')}
VAT (15%): ${formatCurrency(transaction.vat, 'ETB')}
Total Amount Debited: ${formatCurrency(totalDebited, 'ETB')}

Payer Name: ${transaction.senderName}
Payer Account: ${transaction.senderAccount}
Beneficiary Name: ${transaction.receiverName}
Beneficiary Account: ${transaction.receiverAccount.length > 10 ? `${transaction.receiverAccount[0]}*********${transaction.receiverAccount.slice(-4)}` : transaction.receiverAccount}
Destination Bank: ${transaction.receiverBank}
Channel: ${transaction.channel}
Payment Purpose: ${transaction.note}

Security Hash: ${transaction.hash}
Verified & Settled via CBE Core Banking Network
=========================================
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#240626] border border-purple-800/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100">
        {/* Modal Top Action Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-purple-900 bg-purple-950/90 shrink-0">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
            <Landmark className="w-4 h-4" />
            <span>{t.cbeReceiptSubtitle}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyReceiptText}
              className="p-1.5 rounded-lg text-purple-300 hover:text-amber-300 hover:bg-purple-900 transition-colors"
              title="Copy Receipt Text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official Printable CBE Receipt Slip Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-200" ref={receiptRef}>
          {/* Authentic CBE Header Banner */}
          <div className="text-center space-y-2 border-b border-dashed border-purple-800 pb-5">
            <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-amber-400/20 border border-amber-400/30 text-amber-400 mb-1">
              <Landmark className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-400 tracking-wide uppercase">
                {t.cbeReceiptTitle}
              </h2>
              <h3 className="text-xs sm:text-sm font-extrabold text-purple-200">
                {t.cbeReceiptAmharic}
              </h3>
              <p className="text-[11px] text-purple-300 font-mono mt-0.5">
                The Bank You Can Always Rely On!
              </p>
            </div>

            {/* Verified Stamp Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.cbeVerifiedStamp}</span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="text-center bg-purple-950/80 border border-purple-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-purple-300 uppercase tracking-wider font-semibold">
              {t.cbeAmountDebited}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tabular-nums">
              {formatCurrency(transaction.amount, 'ETB')}
            </div>
            <div className="text-[11px] text-purple-400 font-mono">
              Status: <span className="text-emerald-400 font-bold uppercase">{transaction.status}</span>
            </div>
          </div>

          {/* Itemized Details Grid */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-purple-900/80">
              <span className="text-purple-300">{t.cbeFtNo}</span>
              <span className="font-mono font-extrabold text-amber-300 tracking-wide">{transaction.referenceNumber}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-purple-900/80">
              <span className="text-purple-300">{t.cbeTxnDate}</span>
              <span className="font-mono text-purple-100">{formatSimpleDate(transaction.timestamp, currentLang)}</span>
            </div>

            <div className="flex items-start justify-between py-1.5 border-b border-purple-900/80">
              <span className="text-purple-300">{t.cbePayer}</span>
              <div className="text-right">
                <div className="font-bold text-white">{formatCbeName(transaction.senderName)}</div>
                <div className="font-mono text-[11px] text-purple-300">{transaction.senderAccount}</div>
              </div>
            </div>

            <div className="flex items-start justify-between py-1.5 border-b border-purple-900/80">
              <span className="text-purple-300">{t.cbeBeneficiary}</span>
              <div className="text-right">
                <div className="font-bold text-amber-200">{formatCbeName(transaction.receiverName)}</div>
                <div className="font-mono text-[11px] text-purple-300">
                  {transaction.receiverAccount.length > 10 ? `${transaction.receiverAccount[0]}*********${transaction.receiverAccount.slice(-4)}` : transaction.receiverAccount} ({transaction.receiverBank})
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-purple-900/80">
              <span className="text-purple-300">{t.cbeChannel}</span>
              <span className="font-medium text-white">{transaction.channel}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-purple-900/80">
              <span className="text-purple-300">{t.cbeServiceCharge}</span>
              <span className="font-mono text-purple-200">
                {transaction.fee === 0 ? '0.00 ETB (FREE)' : formatCurrency(transaction.fee, 'ETB')}
              </span>
            </div>

            {transaction.vat > 0 && (
              <div className="flex items-center justify-between py-1.5 border-b border-purple-900/80">
                <span className="text-purple-300">{t.cbeVat}</span>
                <span className="font-mono text-purple-200">{formatCurrency(transaction.vat, 'ETB')}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-b border-purple-900/80 text-sm font-bold">
              <span className="text-white">{t.cbeTotalDeducted}</span>
              <span className="font-mono text-amber-400 tabular-nums">{formatCurrency(totalDebited, 'ETB')}</span>
            </div>

            <div className="py-1.5 space-y-1">
              <span className="text-purple-300 block">{t.cbeRemark}</span>
              <p className="text-xs text-purple-100 bg-purple-950/90 p-2.5 rounded-lg border border-purple-800 leading-relaxed font-sans">
                {transaction.note}
              </p>
            </div>
          </div>

          {/* Scannable Verification QR Code Block */}
          <div className="bg-purple-950 border border-purple-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
            {qrCodeDataUrl && (
              <div className="bg-white p-2 rounded-lg shrink-0 shadow-md">
                <img
                  src={qrCodeDataUrl}
                  alt="Official CBE Transaction QR Code"
                  className="w-24 h-24"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="space-y-1 text-center sm:text-left text-xs">
              <div className="flex items-center justify-center sm:justify-start gap-1 font-semibold text-amber-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CBE Digital Hash Verification</span>
              </div>
              <p className="text-[10px] font-mono text-purple-300 break-all bg-purple-900/50 p-1.5 rounded border border-purple-800">
                {transaction.hash}
              </p>
              <p className="text-[11px] text-purple-400">
                {t.cbeScanQr}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3.5 border-t border-purple-900 bg-purple-950/90 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleCopyReceiptText}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-200 bg-purple-900 hover:bg-purple-800 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t.receiptCopied : t.copyReceipt}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-purple-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition-all shadow-md shadow-amber-500/20 active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printReceipt}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
