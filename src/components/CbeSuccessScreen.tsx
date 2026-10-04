import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import {
  Check,
  Receipt,
  Share2,
} from 'lucide-react';
import { CbeLogo } from './CbeLogo';
import { Language, Transaction } from '../types/banking';
import { toTitleCaseEnglish } from '../utils/userDatabase';

// Authentic CBE Viewfinder Screenshot Icon (camera frame matching IMG_20261001_132739_360.jpg)
const ScreenshotViewfinderIcon: React.FC<{ className?: string }> = ({ className = "w-4.5 h-4.5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M 4 8 L 4 5 C 4 4.4 4.4 4 5 4 L 8 4" />
    <path d="M 16 4 L 19 4 C 19.6 4 20 4.4 20 5 L 20 8" />
    <path d="M 20 16 L 20 19 C 20 19.6 19.6 20 19 20 L 16 20" />
    <path d="M 8 20 L 5 20 C 4.4 20 4 19.6 4 19 L 4 16" />
    <circle cx="12" cy="12" r="3.2" strokeWidth="2.2" />
  </svg>
);

interface CbeSuccessScreenProps {
  transaction: Transaction;
  currentLang: Language;
  onClose: () => void;
  onOpenReceiptDetails: () => void;
  logoUrl?: string;
}

export const CbeSuccessScreen: React.FC<CbeSuccessScreenProps> = ({
  transaction,
  currentLang,
  onClose,
  onOpenReceiptDetails,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const receiptCardRef = useRef<HTMLDivElement>(null);

  // Exact service charge, VAT, disaster recovery fees from IMG_20261001_132739_360.jpg
  const serviceCharge = transaction.fee !== undefined ? transaction.fee : 1.00;
  const vat = transaction.vat !== undefined ? transaction.vat : 0.15;
  const disasterRecovery = 0.05;
  const rawAmount = Number(transaction.amount) || 2130.00;
  const totalDebited = rawAmount + serviceCharge + vat + disasterRecovery;

  // Format account to ETB-XXXX format exactly as in IMG_20261001_132739_360.jpg
  const formatAccountForSlip = (acc?: string, fallback = '0997') => {
    if (!acc) return `ETB-${fallback}`;
    if (acc.startsWith('ETB-')) return acc;
    const digits = acc.replace(/\D/g, '');
    if (digits.length >= 4) {
      return `ETB-${digits.slice(-4)}`;
    }
    return `ETB-${digits || fallback}`;
  };

  // Format date like: "Aug 15, 2026 05:46 PM" matching IMG_20261001_132739_360.jpg
  const formatSlipDate = (ts?: string) => {
    const d = ts ? new Date(ts) : new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()] || 'Aug';
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hourStr = String(hours).padStart(2, '0');
    return `${month} ${day}, ${year} ${hourStr}:${minutes} ${ampm}`;
  };

  // Convert names to clean Title Case English (only first letter capital, NO Amharic, NO parentheses)
  const senderDisplayName = toTitleCaseEnglish(transaction.senderName || 'Wajira Yadeta Lidi');
  const senderAccountDisplay = formatAccountForSlip(transaction.senderAccount, '0997');
  const receiverDisplayName = toTitleCaseEnglish(transaction.receiverName || 'Yared Nigusse Teshome');
  const receiverAccountDisplay = formatAccountForSlip(transaction.receiverAccount, '8612');
  const formattedDate = formatSlipDate(transaction.timestamp);
  const formattedAmount = rawAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const rawReason = transaction.note || 'MB Transfer';
  const cleanReason = rawReason.replace(/mb transfer/i, 'MB Transfer');

  useEffect(() => {
    const qrPayload = JSON.stringify({
      bank: 'Commercial Bank of Ethiopia',
      id: transaction.referenceNumber || 'FT262277V0S0',
      amount: `${rawAmount} ETB`,
      from: `${senderDisplayName} ${senderAccountDisplay}`,
      to: `${receiverDisplayName} ${receiverAccountDisplay}`,
      date: formattedDate,
      reason: cleanReason,
      totalDebited: `ETB${totalDebited.toFixed(2)}`,
      status: 'VERIFIED_SUCCESS_CBE',
    });

    QRCode.toDataURL(qrPayload, {
      width: 280,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR code generation failed', err));
  }, [transaction, senderDisplayName, senderAccountDisplay, receiverDisplayName, receiverAccountDisplay, formattedDate, rawAmount, totalDebited, cleanReason]);

  const handleShare = () => {
    const text = `ETB ${formattedAmount} has been debited from ${senderDisplayName} ${senderAccountDisplay} for ${receiverDisplayName} ${receiverAccountDisplay} on ${formattedDate} with transaction ID: ${transaction.referenceNumber || 'FT262277V0S0'}. Reason: ${cleanReason}\nTotal Amount Debited: ETB${totalDebited.toFixed(2)} with Service Charge of ETB${serviceCharge.toFixed(2)}, VAT (15%) of ETB${vat.toFixed(2)} and Disaster Recovery (5%) of ETB${disasterRecovery.toFixed(2)}.`;
    if (navigator.share) {
      navigator.share({ title: 'CBE Transaction Summary', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setToastMessage('Transaction summary copied to clipboard!');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleScreenshot = async () => {
    // Camera flash shutter animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 240);

    try {
      if (receiptCardRef.current) {
        const canvas = await html2canvas(receiptCardRef.current, {
          scale: 2.5,
          useCORS: true,
          backgroundColor: '#f8f9fa',
          logging: false,
        });

        const imageUri = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `CBE_Transaction_${transaction.referenceNumber || 'FT262277V0S0'}.png`;
        link.href = imageUri;
        link.click();

        setToastMessage(
          currentLang === 'am'
            ? 'ስክሪንሾት በተሳካ ሁኔታ ተቀምጧል!'
            : 'Screenshot captured successfully!'
        );
        setTimeout(() => setToastMessage(null), 2500);
      }
    } catch (err) {
      console.error('Screenshot capture fallback', err);
      window.print();
    }
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full max-w-md mx-auto bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-2xl relative select-none font-sans">
      {/* Camera Shutter Flash Overlay */}
      {isFlashing && (
        <div className="fixed inset-0 z-50 bg-white/95 pointer-events-none animate-out fade-out duration-200" />
      )}

      {/* Top Purple Banner (Exact layout matching IMG_20261001_132739_360.jpg) */}
      <div className="bg-[#701484] text-white pt-4 pb-8 px-4 relative shrink-0">
        <div className="flex items-center justify-between">
          {/* White Shield with Purple Checkmark + Thank you / Success */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L4 5.2V11.2C4 16.2 7.4 20.8 12 22C16.6 20.8 20 16.2 20 11.2V5.2L12 2Z"
                  fill="white"
                />
                <path
                  d="M8.5 11.8L11 14.3L15.5 9.8"
                  stroke="#701484"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-white tracking-wide leading-tight font-sans">
                Thank you
              </h1>
              <p className="text-[11px] text-white/90 font-medium leading-tight">
                Success
              </p>
            </div>
          </div>

          {/* Top-Right Rounded Square Viewfinder Screenshot Button matching IMG_20261001_132739_360.jpg */}
          <button
            onClick={handleScreenshot}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            title="Take Screenshot"
          >
            <ScreenshotViewfinderIcon className="w-4 h-4 text-white stroke-[2.3]" />
          </button>
        </div>

        {/* Big Floating Circular Checkmark Badge overlapping purple header and white body */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="w-14 h-14 rounded-full bg-white p-1 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#701484] flex items-center justify-center text-white">
              <Check className="w-7 h-7 stroke-[3.8]" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Fully contained to fit mobile viewport without scroll */}
      <div className="px-3.5 pt-7 pb-2 flex-1 flex flex-col justify-between overflow-hidden">
        {/* Subtitle */}
        <div className="text-center shrink-0 mb-1.5">
          <h2 className="text-[11.5px] font-medium text-slate-700 tracking-tight font-sans">
            Transaction Completed Successfully!
          </h2>
        </div>

        {/* Transaction Summary Card (Exact text & typography from IMG_20261001_132739_360.jpg) */}
        <div
          ref={receiptCardRef}
          className="bg-[#f8f9fa] rounded-2xl p-3 sm:p-3.5 shadow-xs border border-slate-200/80 flex flex-col justify-between flex-1 text-left space-y-1.5 overflow-hidden"
        >
          {/* Card Label */}
          <div className="text-[10px] font-normal text-slate-400 tracking-normal shrink-0">
            Transaction Summary
          </div>

          {/* Exact CBE Summary Paragraph matching IMG_20261001_132739_360.jpg */}
          <div className="space-y-1.5 text-[11px] leading-[1.4] text-slate-900 font-sans">
            <p className="text-slate-900">
              ETB {formattedAmount} has been debited from{' '}
              <strong className="font-bold text-slate-950">
                {senderDisplayName}
              </strong>{' '}
              <span className="font-normal text-slate-900">
                {senderAccountDisplay}
              </span>{' '}
              for{' '}
              <strong className="font-bold text-slate-950">
                {receiverDisplayName}
              </strong>{' '}
              <span className="font-normal text-slate-900">
                {receiverAccountDisplay}
              </span>{' '}
              on{' '}
              <span className="font-normal text-slate-900">
                {formattedDate}
              </span>{' '}
              with transaction ID:{' '}
              <strong className="font-bold text-slate-950">
                {transaction.referenceNumber || 'FT262277V0S0'}
              </strong>
              . Reason:{' '}
              <span className="font-normal text-slate-900">
                {cleanReason}
              </span>
            </p>

            <p className="text-[10px] text-slate-800 font-normal leading-snug pt-0.5">
              Total Amount Debited: ETB{totalDebited.toFixed(2)} with Service Charge of ETB{serviceCharge.toFixed(2)}, VAT (15%) of ETB{vat.toFixed(2)} and Disaster Recovery (5%) of ETB{disasterRecovery.toFixed(2)}.
            </p>
          </div>

          {/* Centered Clean QR Code & Official Footer matching IMG_20261001_132739_360.jpg */}
          <div className="flex flex-col items-center justify-center shrink-0 pt-0.5 pb-0.5">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="CBE Verification QR Code"
                className="w-32 h-32 sm:w-36 sm:h-36 object-contain select-none"
              />
            ) : (
              <div className="w-32 h-32 bg-slate-100 rounded-lg animate-pulse" />
            )}

            {/* Official CBE Footer under QR code matching IMG_20261001_132739_360.jpg */}
            <div className="flex items-center gap-2 pt-1 pointer-events-none select-none">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xs">
                <CbeLogo isDarkBg={false} size="sm" className="w-7 h-7 shrink-0" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-slate-800 font-serif leading-tight">
                  Commercial Bank of Ethiopia
                </h4>
                <p className="text-[8.5px] text-slate-500 font-mono tracking-tight">
                  The bank you can always rely on!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback notification toast */}
        {toastMessage && (
          <div className="p-1.5 bg-slate-900 text-white text-[10px] font-semibold rounded-lg text-center shadow-lg animate-in fade-in my-1 shrink-0">
            {toastMessage}
          </div>
        )}

        {/* Bottom Actions Area */}
        <div className="shrink-0 space-y-1.5 pt-1.5">
          {/* 3 Action Buttons Row: Receipt, Screenshot, Share (Exact matching IMG_20261001_132739_360.jpg) */}
          <div className="flex items-center justify-around gap-1 px-1">
            <button
              onClick={onOpenReceiptDetails}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-800 hover:text-[#701484] hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-slate-900 stroke-[2.2]" />
              <span>Receipt</span>
            </button>

            <button
              onClick={handleScreenshot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-800 hover:text-[#701484] hover:bg-slate-50 transition-all cursor-pointer"
            >
              <ScreenshotViewfinderIcon className="w-4 h-4 text-slate-900" />
              <span>Screenshot</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-800 hover:text-[#701484] hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-900 stroke-[2.2]" />
              <span>Share</span>
            </button>
          </div>

          {/* Gray Close Button (Exact matching IMG_20261001_132739_360.jpg) */}
          <div>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-[#e6e8eb] hover:bg-[#d8dade] active:scale-[0.99] text-slate-700 font-bold text-xs transition-all cursor-pointer shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
