import React, { useState } from 'react';
import {
  ChevronLeft,
  Search,
  MoreVertical,
  Contact2,
  MessageSquareCode,
  Building,
  User,
  X,
  ChevronRight,
  QrCode,
} from 'lucide-react';
import { Language } from '../types/banking';

interface CbeMyInformationScreenProps {
  currentLang: Language;
  userProfile: {
    fullName: string;
    accountNumber: string;
    phone: string;
  };
  onBack: () => void;
}

export const CbeMyInformationScreen: React.FC<CbeMyInformationScreenProps> = ({
  currentLang,
  userProfile,
  onBack,
}) => {
  const [activeQrTab, setActiveQrTab] = useState<'account' | 'phone'>('account');
  const [cbeNoor, setCbeNoor] = useState(false);

  const formattedAccount = userProfile.accountNumber;
  const maskedAccount = formattedAccount.length > 4 
    ? `${formattedAccount[0]}*********${formattedAccount.slice(-4)}` 
    : formattedAccount;

  const formattedPhone = userProfile.phone;
  const maskedPhone = formattedPhone.length > 4 
    ? `${formattedPhone.slice(0, 2)}****${formattedPhone.slice(-4)}` 
    : formattedPhone;

  return (
    <div className="w-full h-full max-h-screen bg-[#f8f9fa] text-slate-800 flex flex-col justify-between max-w-md mx-auto relative shadow-2xl overflow-hidden font-sans">
      {/* Top Header Bar matching Screenshot_20261002-100947.jpg - Sticky Top */}
      <div className="bg-[#74117c] px-4 pt-3.5 pb-3.5 flex items-center justify-between text-white shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="Back"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <h1 className="text-base font-medium tracking-wide">
            My Information
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 text-white hover:text-purple-200 transition-colors cursor-pointer">
            <Search className="w-5 h-5 stroke-[2.2]" />
          </button>
          <button className="p-1 text-white hover:text-purple-200 transition-colors cursor-pointer">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 px-4 pt-4 pb-12 space-y-3.5 overflow-y-auto">
        {/* User Card matching Screenshot_20261002-100947.jpg */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-purple-400 text-white flex items-center justify-center shrink-0 shadow-sm">
            <User className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-800">
              {userProfile.fullName}
            </h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Last Sign In: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Contact Us Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between hover:border-purple-200 transition-all cursor-pointer">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#74117c] flex items-center justify-center shrink-0">
              <Contact2 className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              Contact Us
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* ChatBot Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between hover:border-purple-200 transition-all cursor-pointer">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#74117c] flex items-center justify-center shrink-0">
              <MessageSquareCode className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              ChatBot
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* CBE NOOR Card with Toggle Switch */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#74117c] flex items-center justify-center shrink-0">
              <Building className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              CBE NOOR
            </span>
          </div>

          <button
            type="button"
            onClick={() => setCbeNoor(!cbeNoor)}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
              cbeNoor
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${cbeNoor ? 'translate-x-1' : ''}`} />
            <span>{cbeNoor ? 'on' : 'off'}</span>
          </button>
        </div>

        {/* QR Code Section with Tabs matching Screenshot_20261002-100947.jpg */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          {/* Tabs: My Accounts / Phone Number */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveQrTab('account')}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeQrTab === 'account'
                  ? 'bg-purple-100/80 text-[#74117c] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              My Accounts
            </button>

            <button
              type="button"
              onClick={() => setActiveQrTab('phone')}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeQrTab === 'phone'
                  ? 'bg-purple-100/80 text-[#74117c] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Phone Number
            </button>
          </div>

          {/* QR Code Display */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100/80 space-y-3">
            <div className="p-3 bg-white rounded-2xl border-2 border-purple-200 shadow-xs">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  activeQrTab === 'account' ? formattedAccount : formattedPhone
                )}`}
                alt="CBE QR Code"
                className="w-40 h-40 object-contain"
              />
            </div>

            {/* Display under QR Code:
                - If My Accounts: shows masked account number and Full Name
                - If Phone Number: shows phone number and Full Name */}
            <div className="text-center space-y-1">
              <div className="text-sm font-bold font-mono text-slate-800">
                {activeQrTab === 'account' ? maskedAccount : maskedPhone}
              </div>
              <div className="text-xs font-bold text-slate-600">
                {userProfile.fullName}
              </div>
              <div className="text-[11px] text-slate-400 font-medium pt-1">
                Scan this QR code to transfer directly
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
