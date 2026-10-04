import React from 'react';
import { Send, ArrowRightLeft, ShieldCheck, Zap, UserCheck, Smartphone, Building2, ChevronRight } from 'lucide-react';
import { Language, VerifiedBeneficiary } from '../types/banking';
import { VERIFIED_CBE_BENEFICIARIES } from '../data/initialData';
import { getTranslation } from '../locales/translations';

interface DualTransferSectionProps {
  currentLang: Language;
  onOpenCbeTransfer: (beneficiary?: VerifiedBeneficiary) => void;
  onOpenOtherTransfer: (beneficiary?: VerifiedBeneficiary) => void;
  onOpenAirtime: () => void;
  onOpenSmsParser: () => void;
}

export const DualTransferSection: React.FC<DualTransferSectionProps> = ({
  currentLang,
  onOpenCbeTransfer,
  onOpenOtherTransfer,
  onOpenAirtime,
  onOpenSmsParser,
}) => {
  const t = getTranslation(currentLang);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-amber-400" />
          <span>{t.transferModesTitle}</span>
        </h3>
        <span className="text-[11px] font-mono text-purple-300">
          CBE Direct Core & EthSwitch
        </span>
      </div>

      {/* The Two Flagship CBE Transfer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Transfer Mode 1: CBE to CBE */}
        <div
          onClick={() => onOpenCbeTransfer()}
          className="group cursor-pointer rounded-2xl p-5 bg-gradient-to-br from-[#3b0b3e] via-[#2a062c] to-[#1a041c] border border-purple-800/80 hover:border-amber-400/80 shadow-lg hover:shadow-purple-900/40 transition-all duration-300 relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center">
              <div className="h-full w-full bg-purple-950 rounded-[14px] flex items-center justify-center">
                <Send className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                0.00 ETB FEE · ነጻ
              </span>
              <span className="text-[10px] text-amber-300/80 font-mono mt-1">
                Instant 13-Digit Validation
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
              <span>1. {t.transferMode1Title}</span>
              <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              {t.transferMode1Desc}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-900/60 flex items-center justify-between text-xs font-mono">
            <span className="text-purple-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>ስም አረጋግጥ (Name Lookup)</span>
            </span>
            <span className="text-amber-400 font-bold group-hover:underline">
              {currentLang === 'am' ? 'አሁን ያስተላልፉ →' : 'Transfer Now →'}
            </span>
          </div>
        </div>

        {/* Transfer Mode 2: To Other Banks / EthSwitch / Telebirr */}
        <div
          onClick={() => onOpenOtherTransfer()}
          className="group cursor-pointer rounded-2xl p-5 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 border border-purple-800/80 hover:border-sky-400/80 shadow-lg hover:shadow-indigo-950/50 transition-all duration-300 relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 p-0.5 shadow-md shadow-sky-500/20 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-sky-500/15 text-sky-300 border border-sky-500/30">
                EthSwitch Network
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-1">
                12+ Ethiopian Banks & Wallets
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-base font-extrabold text-white group-hover:text-sky-300 transition-colors flex items-center justify-between">
              <span>2. {t.transferMode2Title}</span>
              <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              {t.transferMode2Desc}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-900/60 flex items-center justify-between text-xs font-mono">
            <span className="text-purple-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>ቴሌብር፣ አዋሽ፣ አቢሲኒያ፣ ዳሽን...</span>
            </span>
            <span className="text-sky-400 font-bold group-hover:underline">
              {currentLang === 'am' ? 'አሁን ያስተላልፉ →' : 'Transfer Now →'}
            </span>
          </div>
        </div>
      </div>

      {/* Saved / Favorite Beneficiaries Quick Chips */}
      <div className="bg-purple-950/70 border border-purple-900/70 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-amber-300 uppercase tracking-wider">
            {t.savedBeneficiariesTitle}
          </span>
          <span className="text-[11px] text-purple-300 font-mono">{t.clickToFill}</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {VERIFIED_CBE_BENEFICIARIES.map((ben) => {
            const isCbe = ben.bankName.includes('Commercial Bank');
            return (
              <button
                key={ben.accountNumber}
                onClick={() => {
                  if (isCbe) {
                    onOpenCbeTransfer(ben);
                  } else {
                    onOpenOtherTransfer(ben);
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-800/80 text-left shrink-0 transition-all hover:border-amber-400/50"
              >
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCbe ? 'bg-amber-400 text-purple-950' : 'bg-sky-400 text-slate-950'
                }`}>
                  {ben.fullName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white whitespace-nowrap">
                    {currentLang === 'am' ? ben.fullNameAm : ben.fullName}
                  </div>
                  <div className="text-[10px] text-purple-300 font-mono">
                    {ben.accountNumber} · {isCbe ? 'CBE' : ben.bankName.split(' ')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
