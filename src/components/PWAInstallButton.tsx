import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ArrowDownToLine, PhoneCall } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="w-full mt-3 flex items-center justify-center gap-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 px-4 py-3 text-xs font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer animate-pulse"
      >
        <ArrowDownToLine className="w-4 h-4 stroke-[2.5]" />
        <span>INSTALL CBE MOBILE APP 📱</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="w-full mt-3 flex items-center justify-center gap-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 px-4 py-3 text-xs font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <ArrowDownToLine className="w-4 h-4 stroke-[2.5]" />
          <span>INSTALL CBE MOBILE APP (iOS) 📱</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-5 animate-in fade-in duration-200">
            <div className="w-full max-w-xs rounded-3xl bg-white p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-200 text-left border border-slate-100">
              <h3 className="text-sm font-black text-[#701484] uppercase tracking-wider flex items-center gap-2">
                <span>Install CBE Mobile Banking</span>
              </h3>
              
              <div className="text-slate-600 text-xs leading-relaxed space-y-2.5 font-medium">
                <p>To install this app on your iPhone / iPad home screen:</p>
                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-bold text-slate-800">
                  <span className="text-amber-500 font-extrabold text-sm">1.</span>
                  <span>Tap the <span className="text-[#701484]">"Share"</span> button in your Safari browser toolbar (bottom/top bar).</span>
                </div>
                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-bold text-slate-800">
                  <span className="text-amber-500 font-extrabold text-sm">2.</span>
                  <span>Scroll down and tap <span className="text-[#701484]">"Add to Home Screen"</span>.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-2xl bg-[#701484] hover:bg-[#5e0f6f] py-3 text-white text-xs font-black shadow-md cursor-pointer transition-all"
              >
                Close Guide
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback button for testing/installs when prompt is not deferred
  return (
    <button
      onClick={() => {
        alert("To install, tap your browser's menu (three dots icon or share icon) and select 'Install app' or 'Add to Home Screen'.");
      }}
      className="w-full mt-3 flex items-center justify-center gap-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 px-4 py-3 text-xs font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
    >
      <ArrowDownToLine className="w-4 h-4 stroke-[2.5]" />
      <span>HOW TO INSTALL APP 📱</span>
    </button>
  );
};
