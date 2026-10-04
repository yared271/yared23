import React, { useState } from 'react';
import {
  Landmark,
  X,
  MapPin,
  Clock,
  Phone,
  FileText,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Language } from '../types/banking';

interface CbeBranchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onOpenStatement: () => void;
}

export const CbeBranchesModal: React.FC<CbeBranchesModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onOpenStatement,
}) => {
  const [activeTab, setActiveTab] = useState<'branches' | 'atms'>('branches');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const branches = [
    {
      nameEn: 'Finfine Branch (Head Office)',
      nameAm: 'ፊንፊኔ ቅርንጫፍ (ዋናው መ/ቤት)',
      addressEn: 'Churchill Road, Addis Ababa',
      addressAm: 'ቸርችል ጎዳና፣ አዲስ አበባ',
      phone: '+251 11 551 5004',
      hours: 'Mon - Sat: 8:00 AM - 5:00 PM',
      code: '001',
    },
    {
      nameEn: 'Addis Ababa Branch',
      nameAm: 'አዲስ አበባ ቅርንጫፍ',
      addressEn: 'Ras Desta Damtew St, Addis Ababa',
      addressAm: 'ራስ ደስታ ዳምጠው መንገድ፣ አዲስ አበባ',
      phone: '+251 11 551 1277',
      hours: 'Mon - Sat: 8:00 AM - 5:00 PM',
      code: '002',
    },
    {
      nameEn: 'Bole Branch',
      nameAm: 'ቦሌ ቅርንጫፍ',
      addressEn: 'Bole Road, Next to Edna Mall',
      addressAm: 'ቦሌ መንገድ፣ ኤድና ሞል አጠገብ',
      phone: '+251 11 661 2450',
      hours: 'Mon - Sat: 8:00 AM - 7:00 PM',
      code: '045',
    },
    {
      nameEn: 'Mexico Branch',
      nameAm: 'ሜክሲኮ ቅርንጫፍ',
      addressEn: 'Mexico Square, K-Kare Building',
      addressAm: 'ሜክሲኮ አደባባይ፣ ኬ-ኬር ህንጻ',
      phone: '+251 11 553 0890',
      hours: 'Mon - Sat: 8:00 AM - 5:00 PM',
      code: '028',
    },
    {
      nameEn: 'Piassa Branch',
      nameAm: 'ፒያሳ ቅርንጫፍ',
      addressEn: 'Cunningham St, Piassa',
      addressAm: 'ካኒንግሃም መንገድ፣ ፒያሳ',
      phone: '+251 11 155 3211',
      hours: 'Mon - Sat: 8:00 AM - 5:00 PM',
      code: '012',
    },
  ];

  const atms = [
    {
      nameEn: 'CBE HQ Tower ATM (24/7)',
      nameAm: 'ንግድ ባንክ ዋና መ/ቤት ኤቲኤም (24/7)',
      locationEn: 'Goma Kuteba, CBE Tower Ground Floor',
      locationAm: 'ጎማ ቁጠባ፣ ንግድ ባንክ ታወር ምድር ቤት',
      status: 'Active · Dispensing ETB',
    },
    {
      nameEn: 'Bole Medhanialem ATM (24/7)',
      nameAm: 'ቦሌ መድኃኔዓለም ኤቲኤም (24/7)',
      locationEn: 'Near Medhanialem Church',
      locationAm: 'መድኃኔዓለም ቤተክርስቲያን አጠገብ',
      status: 'Active · Dispensing ETB',
    },
    {
      nameEn: 'Meskel Square ATM (24/7)',
      nameAm: 'መስቀል አደባባይ ኤቲኤም (24/7)',
      locationEn: 'Exhibition Center Parking',
      locationAm: 'ኤግዚቢሽን ማዕከል መኪና ማቆሚያ',
      status: 'Active · Dispensing ETB',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#701484] text-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-300" />
              <h2 className="font-bold text-sm">
                {currentLang === 'am' ? 'የንግድ ባንክ ቅርንጫፎች እና ኤቲኤም' : 'CBE Branches & ATMs'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick statement button */}
          <button
            onClick={() => {
              onClose();
              onOpenStatement();
            }}
            className="w-full py-2 px-3 bg-white/15 hover:bg-white/25 rounded-xl border border-white/20 flex items-center justify-center gap-2 text-xs font-bold text-amber-200 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{currentLang === 'am' ? 'ሙሉ የሒሳብ መግለጫ (Account Statement)' : 'View Account Statement'}</span>
          </button>

          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-black/20 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('branches')}
              className={`py-1.5 rounded-lg transition-all ${
                activeTab === 'branches' ? 'bg-white text-[#701484] shadow-xs' : 'text-purple-200'
              }`}
            >
              {currentLang === 'am' ? 'ቅርንጫፎች' : 'Branches'}
            </button>
            <button
              onClick={() => setActiveTab('atms')}
              className={`py-1.5 rounded-lg transition-all ${
                activeTab === 'atms' ? 'bg-white text-[#701484] shadow-xs' : 'text-purple-200'
              }`}
            >
              {currentLang === 'am' ? 'ኤቲኤም (ATMs)' : 'ATMs'}
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="p-4 overflow-y-auto space-y-2.5">
          {activeTab === 'branches' ? (
            branches.map((b, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {currentLang === 'am' ? b.nameAm : b.nameEn}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-purple-100 text-[#701484] font-semibold">
                    Code: {b.code}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{currentLang === 'am' ? b.addressAm : b.addressEn}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{b.hours}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#701484]">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span>{b.phone}</span>
                </div>
              </div>
            ))
          ) : (
            atms.map((a, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {currentLang === 'am' ? a.nameAm : a.nameEn}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{currentLang === 'am' ? a.locationAm : a.locationEn}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{a.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
