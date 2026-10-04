import React, { useState } from 'react';
import { Upload, RotateCcw, Check, X, Image as ImageIcon, Link as LinkIcon, Sparkles, Home, Lock, Receipt, Globe } from 'lucide-react';

export type LogoTarget = 'home' | 'login' | 'receipt' | 'all';

export interface LogoPreset {
  id: string;
  nameEn: string;
  nameAm: string;
  url: string;
  recommendedFor?: string;
  isDarkRecommended?: boolean;
}

export const LOGO_PRESETS: LogoPreset[] = [
  {
    id: 'white',
    nameEn: 'CBE White Logo',
    nameAm: 'ነጭ ሎጎ (ለሆም ፔጅ)',
    url: '/cbe_white_logo.png',
    recommendedFor: 'ሆም ፔጅ ካርድ ላይ (Home Card)',
    isDarkRecommended: true,
  },
  {
    id: 'gold_3d',
    nameEn: '3D Gold Logo',
    nameAm: 'አዲሱ 3D የወርቅ ሎጎ',
    url: '/cbe_gold_logo.jpg',
    recommendedFor: 'የመግቢያ ገጽ እና ደረሰኝ (Login & Receipt)',
    isDarkRecommended: false,
  },
  {
    id: 'official_crest',
    nameEn: 'Official Purple Crest',
    nameAm: 'ዋናው ባለቀለም ማህተም',
    url: '/cbe_logo.png',
    recommendedFor: 'ኦፊሴላዊ ማህተም (Official)',
    isDarkRecommended: false,
  },
  {
    id: 'gold_hq',
    nameEn: 'HQ Gold 3D',
    nameAm: 'ከፍተኛ ጥራት ወርቅ',
    url: '/cbe_gold_logo.jpg',
    recommendedFor: 'ፕሪሚየም ወርቅ (HQ)',
    isDarkRecommended: false,
  },
  {
    id: 'classic_birr',
    nameEn: 'Classic CBE Birr',
    nameAm: 'ክላሲክ ንግድ ባንክ',
    url: '/cbe_icon_512.png',
    recommendedFor: 'ክላሲክ (Classic)',
    isDarkRecommended: false,
  },
];

interface CbeLogoModalProps {
  onClose: () => void;
  initialTarget?: LogoTarget;
  homeLogoUrl: string;
  loginLogoUrl: string;
  receiptLogoUrl: string;
  onUpdateLogo: (target: LogoTarget, newUrl: string) => void;
}

export const CbeLogoModal: React.FC<CbeLogoModalProps> = ({
  onClose,
  initialTarget = 'home',
  homeLogoUrl,
  loginLogoUrl,
  receiptLogoUrl,
  onUpdateLogo,
}) => {
  const [activeTarget, setActiveTarget] = useState<LogoTarget>(initialTarget);

  // Initial state map
  const [targetLogos, setTargetLogos] = useState({
    home: homeLogoUrl || '/cbe_white_logo.png',
    login: loginLogoUrl || '/cbe_gold_logo.jpg',
    receipt: receiptLogoUrl || '/cbe_gold_logo.jpg',
  });

  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'url'>('gallery');
  const [urlInput, setUrlInput] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Current active preview
  const currentPreview = activeTarget === 'all' ? targetLogos.home : targetLogos[activeTarget];

  const handleSelectPreset = (presetUrl: string) => {
    if (activeTarget === 'all') {
      setTargetLogos({
        home: presetUrl,
        login: presetUrl,
        receipt: presetUrl,
      });
    } else {
      setTargetLogos((prev) => ({
        ...prev,
        [activeTarget]: presetUrl,
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        handleSelectPreset(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      handleSelectPreset(urlInput.trim());
    }
  };

  const handleSave = () => {
    if (activeTarget === 'all') {
      onUpdateLogo('all', targetLogos.home);
      setSuccessToast('ሁሉም ሎጎዎች ተቀይረዋል! (All logos updated)');
    } else {
      onUpdateLogo(activeTarget, targetLogos[activeTarget]);
      const targetName =
        activeTarget === 'home'
          ? 'የሆም ፔጅ ሎጎ (Home Card)'
          : activeTarget === 'login'
          ? 'የመግቢያ ገጽ ሎጎ (Login)'
          : 'የትራንዛክሽን ደረሰኝ ሎጎ (Receipt)';
      setSuccessToast(`${targetName} በተሳካ ሁኔታ ተቀምጧል!`);
    }

    setTimeout(() => {
      setSuccessToast('');
      onClose();
    }, 900);
  };

  const handleResetCurrentTarget = () => {
    const defaultForTarget =
      activeTarget === 'home'
        ? '/cbe_white_logo.png'
        : activeTarget === 'login'
        ? '/cbe_gold_logo.jpg'
        : '/cbe_gold_logo.jpg';

    if (activeTarget === 'all') {
      setTargetLogos({
        home: '/cbe_white_logo.png',
        login: '/cbe_gold_logo.jpg',
        receipt: '/cbe_gold_logo.jpg',
      });
      onUpdateLogo('home', '/cbe_white_logo.png');
      onUpdateLogo('login', '/cbe_gold_logo.jpg');
      onUpdateLogo('receipt', '/cbe_gold_logo.jpg');
    } else {
      setTargetLogos((prev) => ({
        ...prev,
        [activeTarget]: defaultForTarget,
      }));
      onUpdateLogo(activeTarget, defaultForTarget);
    }
  };

  const isDarkPreview = activeTarget === 'home';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full text-center space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 text-center pr-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#701484] text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>የንግድ ባንክ ሎጎ ጋለሪ (Logo Manager)</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            እያንዳንዱን ሎጎ ለይተው ይቀይሩ
          </h3>
          <p className="text-[11.5px] text-slate-500 leading-snug">
            ሆም ፔጅ ላይ ነጭ ሎጎ ማድረግ ይችላሉ፤ ይህም ውስጥ ያሉትን (መግቢያ እና ደረሰኝ) ሳይቀይር ለብቻው ይሰራል
          </p>
        </div>

        {/* Location Selector Tabs (Home / Login / Receipt / All) */}
        <div className="space-y-1 text-left">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            የሚቀየርበትን ቦታ ይምረጡ (Select Location):
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTarget('home')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                activeTarget === 'home'
                  ? 'bg-white text-[#701484] shadow-sm border border-purple-200 ring-2 ring-purple-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4 mb-0.5" />
              <span>ሆም ፔጅ ካርድ</span>
              <span className="text-[9px] opacity-75 font-normal">(Home Card)</span>
            </button>

            <button
              onClick={() => setActiveTarget('login')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                activeTarget === 'login'
                  ? 'bg-white text-[#701484] shadow-sm border border-purple-200 ring-2 ring-purple-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4 mb-0.5" />
              <span>የመግቢያ ገጽ</span>
              <span className="text-[9px] opacity-75 font-normal">(Login Screen)</span>
            </button>

            <button
              onClick={() => setActiveTarget('receipt')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                activeTarget === 'receipt'
                  ? 'bg-white text-[#701484] shadow-sm border border-purple-200 ring-2 ring-purple-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-4 h-4 mb-0.5" />
              <span>ደረሰኝ / Slip</span>
              <span className="text-[9px] opacity-75 font-normal">(Receipt Screen)</span>
            </button>
          </div>
        </div>

        {/* Live Preview of the Active Target */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
            isDarkPreview
              ? 'bg-[#111113] border-[#701484]/40 text-white'
              : 'bg-slate-50 border-purple-200 text-slate-800'
          }`}
        >
          <div className="text-[10.5px] font-semibold opacity-75 uppercase tracking-wider">
            {activeTarget === 'home' && '🏠 የሆም ፔጅ ካርድ ሎጎ እይታ (Home Dark Card)'}
            {activeTarget === 'login' && '🔐 የመግቢያ ገጽ ሎጎ እይታ (Login Light Screen)'}
            {activeTarget === 'receipt' && '🧾 የደረሰኝ እና ማጠቃለያ ሎጎ እይታ (Receipt Slip)'}
            {activeTarget === 'all' && '🌐 የሁሉም ቦታዎች ሎጎ (All Locations)'}
          </div>

          <div className="w-20 h-20 flex items-center justify-center p-1">
            {currentPreview ? (
              <img
                src={currentPreview}
                alt="Selected Logo Preview"
                className="w-full h-full object-contain filter drop-shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/cbe_white_logo.png';
                }}
              />
            ) : (
              <ImageIcon className="w-10 h-10 text-slate-400" />
            )}
          </div>

          <div className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20">
            {isDarkPreview ? 'ነጭ ሎጎ ለጨለማ ካርዱ ምርጥ ነው' : 'ወርቃማ ወይም ባለቀለም ሎጎ'}
          </div>
        </div>

        {/* Input Mode Tabs: Gallery / Upload / URL */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-white text-[#701484] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            የሎጎ ጋለሪ (Gallery)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-[#701484] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ፎቶ ምረጥ (Upload)
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-white text-[#701484] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            በURL (Link)
          </button>
        </div>

        {/* 1. Logo Gallery Preset Cards */}
        {activeTab === 'gallery' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-left">
              {LOGO_PRESETS.map((preset) => {
                const isSelected = currentPreview === preset.url;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`p-2.5 rounded-2xl border transition-all text-left flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50/90 border-[#701484] ring-2 ring-[#701484]/20'
                        : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl p-1 flex items-center justify-center shrink-0 ${
                        preset.isDarkRecommended ? 'bg-[#111113]' : 'bg-slate-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.nameEn}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {preset.nameAm}
                      </div>
                      <div className="text-[9.5px] text-slate-500 truncate">
                        {preset.nameEn}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#701484] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. File Upload from Phone / Gallery */}
        {activeTab === 'upload' && (
          <div className="py-2">
            <label className="flex flex-col items-center justify-center gap-2 p-5 bg-purple-50 hover:bg-purple-100/80 border-2 border-dashed border-purple-300 rounded-2xl text-[#701484] font-bold cursor-pointer transition-colors shadow-sm text-xs">
              <div className="w-11 h-11 rounded-full bg-white text-[#701484] flex items-center justify-center shadow-sm">
                <Upload className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span>ከስልክዎ ጋለሪ ፎቶ ይምረጡ (Choose Image)</span>
              <span className="text-[10px] text-slate-500 font-normal">
                PNG, JPG, SVG ወይም WebP ፋይል ይደገፋል
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* 3. URL Input */}
        {activeTab === 'url' && (
          <div className="flex gap-2 py-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-purple-500 outline-none"
            />
            <button
              onClick={handleUrlApply}
              className="px-3.5 bg-[#701484] text-white rounded-xl text-xs font-bold hover:bg-[#5b0f6c] cursor-pointer"
            >
              ተግብር
            </button>
          </div>
        )}

        {/* Success Toast */}
        {successToast && (
          <div className="p-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl animate-in fade-in flex items-center justify-center gap-2">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Confirm and Reset Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleSave}
            className="w-full py-3 px-4 bg-[#701484] hover:bg-[#5d0e6e] text-white font-bold rounded-2xl text-xs shadow-md shadow-purple-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>
              {activeTarget === 'all'
                ? 'ሁሉንም ሎጎዎች አጽድቅ (Confirm All)'
                : activeTarget === 'home'
                ? 'የሆም ፔጅ ሎጎን አጽድቅ (Confirm Home Logo)'
                : activeTarget === 'login'
                ? 'የመግቢያ ሎጎን አጽድቅ (Confirm Login Logo)'
                : 'የደረሰኝ ሎጎን አጽድቅ (Confirm Receipt Logo)'}
            </span>
          </button>

          <div className="flex items-center justify-center gap-4 pt-1">
            <button
              onClick={handleResetCurrentTarget}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ይህን ወደ ነባሪ መልስ (Reset this logo)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
