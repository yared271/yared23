import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types/banking';

interface CbeInstallPromptProps {
  currentLang?: Language;
  variant?: 'banner' | 'button' | 'settings_item';
  onInstalled?: () => void;
}

export const CbeInstallPrompt: React.FC<CbeInstallPromptProps> = ({
  currentLang = 'am',
  variant = 'banner',
  onInstalled,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed as PWA or dismissed, hide the banner
  if (isInstalled || (dismissed && variant === 'banner')) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onInstalled?.();
      }
    } else {
      setShowGuide(true);
    }
  };

  // Settings menu item variant
  if (variant === 'settings_item') {
    return (
      <>
        <div
          onClick={handleInstallClick}
          className="bg-white rounded-2xl p-4 border border-purple-100 shadow-2xs flex items-center justify-between hover:border-purple-300 transition-all cursor-pointer group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#701484] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Download className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                {currentLang === 'am' ? 'መተግበሪያውን ስልክዎ ላይ ይጫኑ (Install App)' : 'Install App / Add Shortcut'}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {currentLang === 'am' ? 'ከ Chrome በቀጥታ ስክሪንዎ ላይ እንደ መተግበሪያ ይጫኑ' : 'Install instant PWA shortcut from Google Chrome'}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#701484] bg-purple-50 px-2.5 py-1 rounded-full">
            {currentLang === 'am' ? 'ጫን' : 'Install'}
          </span>
        </div>

        {/* Instructions Modal if browser doesn't trigger prompt automatically */}
        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[#701484] font-bold text-sm">
                  <Smartphone className="w-5 h-5" />
                  <span>{currentLang === 'am' ? 'መተግበሪያውን በ Chrome የመጫኛ መንገድ' : 'Install via Google Chrome'}</span>
                </div>
                <button
                  onClick={() => setShowGuide(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-sans">
                <p className="font-semibold text-slate-800">
                  {currentLang === 'am'
                    ? 'በ Google Chrome ስክሪንዎ ላይ በቀጥታ ለመጫን፦'
                    : 'To install on your Home Screen via Chrome:'}
                </p>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#701484]">1.</span>
                  <span>{currentLang === 'am' ? 'ከላይ በቀኝ በኩል ያሉትን ሶስት ነጥቦች (⋮) ይጫኑ' : 'Tap the three dots (⋮) menu at the top-right in Chrome.'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#701484]">2.</span>
                  <span>{currentLang === 'am' ? '"Install app" ወይም "Add to Home screen" (ወደ ስክሪን ጨምር) የሚለውን ይምረጡ' : 'Select "Install app" or "Add to Home screen".'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#701484]">3.</span>
                  <span>{currentLang === 'am' ? '"Install / ጫን" የሚለውን ሲነኩ ልክ እንደ መደበኛ አፕ ስልክዎ ላይ ይቀመጣል' : 'Tap "Install" to place the CBE App on your phone launcher.'}</span>
                </div>
              </div>

              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-3 rounded-2xl bg-[#701484] text-white font-bold text-xs shadow-md hover:bg-[#5e106e] transition-all"
              >
                {currentLang === 'am' ? 'ገባኝ / እሺ' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Button variant
  if (variant === 'button') {
    return (
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#701484] text-white text-[11px] font-bold shadow-sm hover:bg-[#5e106e] transition-all active:scale-95"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.2]" />
        <span>{currentLang === 'am' ? 'አፑን ጫን' : 'Install App'}</span>
      </button>
    );
  }

  // Top or bottom banner variant
  return (
    <>
      <div className="w-full bg-gradient-to-r from-[#701484] to-[#4a0d58] text-white px-3.5 py-2.5 rounded-2xl shadow-md flex items-center justify-between gap-3 text-xs mb-3 border border-purple-300/30">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Smartphone className="w-4.5 h-4.5 text-white stroke-[2.2]" />
          </div>
          <div className="truncate">
            <h4 className="font-bold text-[12px] leading-tight text-white">
              {currentLang === 'am' ? 'CBE ሞባይል አፕ' : 'CBE Mobile App'}
            </h4>
            <p className="text-[10px] text-purple-200 truncate">
              {currentLang === 'am' ? 'ስልክዎ ላይ ሾርትከት አድርገው ይጫኑ' : 'Install shortcut on home screen'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-white text-[#701484] font-extrabold text-[11px] shadow-sm hover:bg-purple-50 active:scale-95 transition-all cursor-pointer"
          >
            {currentLang === 'am' ? 'ጫን' : 'Install'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-white/70 hover:text-white"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guide dialog */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#701484] font-bold text-sm">
                <Smartphone className="w-5 h-5" />
                <span>{currentLang === 'am' ? 'መተግበሪያውን በ Chrome የመጫኛ መንገድ' : 'Install via Google Chrome'}</span>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-sans">
              <p className="font-semibold text-slate-800">
                {currentLang === 'am'
                  ? 'በ Google Chrome ስክሪንዎ ላይ በቀጥታ ለመጫን፦'
                  : 'To install on your Home Screen via Chrome:'}
              </p>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#701484]">1.</span>
                <span>{currentLang === 'am' ? 'ከላይ በቀኝ በኩል ያሉትን ሶስት ነጥቦች (⋮) ይጫኑ' : 'Tap the three dots (⋮) menu at the top-right in Chrome.'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#701484]">2.</span>
                <span>{currentLang === 'am' ? '"Install app" ወይም "Add to Home screen" (ወደ ስክሪን ጨምር) የሚለውን ይምረጡ' : 'Select "Install app" or "Add to Home screen".'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#701484]">3.</span>
                <span>{currentLang === 'am' ? '"Install / ጫን" የሚለውን ሲነኩ ልክ እንደ መደበኛ አፕ ስልክዎ ላይ ይቀመጣል' : 'Tap "Install" to place the CBE App on your phone launcher.'}</span>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-3 rounded-2xl bg-[#701484] text-white font-bold text-xs shadow-md hover:bg-[#5e106e] transition-all"
            >
              {currentLang === 'am' ? 'ገባኝ / እሺ' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
