import React, { useState, useEffect } from 'react';
import {
  Grid,
  ChevronDown,
  RotateCcw,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Phone,
  RefreshCw,
  Wallet,
  Receipt,
  CreditCard,
  GitFork,
  QrCode,
  Landmark,
  Settings,
  Home,
  ChevronRight,
  ChevronLeft,
  Building2,
  CheckCircle2,
  Store,
  Plane,
  ShoppingCart,
  Film,
  HandCoins,
  Building,
  Globe,
  Bell,
  Fingerprint,
  Key,
  Lock,
  LogOut,
  UserCog,
  Sparkles,
} from 'lucide-react';
import { CbeLogo } from './CbeLogo';
import { CbeAccount, Language } from '../types/banking';
import { formatCurrency } from '../utils/smsParser';
import { formatEnglishNameOnly, formatCbeName } from '../utils/userDatabase';
import { LanguageModal, EthiopiaFlagIcon, UsaFlagIcon } from './LanguageModal';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface CbeHomeScreenProps {
  currentLang: Language;
  onToggleLang: () => void;
  onSelectLang?: (lang: Language) => void;
  account: CbeAccount;
  userName?: string;
  logoUrl?: string;
  onOpenCashOut: () => void;
  onOpenMiniStatement: () => void;
  onOpenCards: () => void;
  onOpenBillShare: () => void;
  onOpenTransfer: () => void;
  onOpenOtherTransfers: () => void;
  onOpenAirtime: () => void;
  onOpenBills: () => void;
  onOpenCbeBirr: () => void;
  onOpenReceiveQr: () => void;
  onOpenReceiveModal: () => void;
  onOpenSearch: () => void;
  onOpenBranches: () => void;
  onOpenSettings: () => void;
  onOpenMyInfo?: () => void;
  onLogout: () => void;
  transactions?: any[];
  onOpenReceipt?: (tx: any) => void;
}

export const CbeHomeScreen: React.FC<CbeHomeScreenProps> = ({
  currentLang,
  onToggleLang,
  onSelectLang,
  account,
  userName = 'User',
  logoUrl,
  onOpenCashOut,
  onOpenMiniStatement,
  onOpenCards,
  onOpenBillShare,
  onOpenTransfer,
  onOpenOtherTransfers,
  onOpenAirtime,
  onOpenBills,
  onOpenCbeBirr,
  onOpenReceiveQr,
  onOpenReceiveModal,
  onOpenSearch,
  onOpenBranches,
  onOpenSettings,
  onOpenMyInfo,
  onLogout,
  transactions = [],
  onOpenReceipt,
}) => {
  const [hideBalance, setHideBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState(false);
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [showLangModal, setShowLangModal] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'transactions' | 'settings'>('home');
  const [txFilterType, setTxFilterType] = useState<'all' | 'debited' | 'credited'>('all');
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [showTxSearchInput, setShowTxSearchInput] = useState(false);
  const [settingsSubView, setSettingsSubView] = useState<'main' | 'account_pref' | 'notifications' | 'biometric' | 'change_pin' | 'change_passphrase'>('main');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyModalType, setPrivacyModalType] = useState<'privacy' | 'terms'>('privacy');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthsAm = ['ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ'];
      const month = currentLang === 'am' ? monthsAm[now.getMonth()] : monthsEn[now.getMonth()];
      const year = now.getFullYear();

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? (currentLang === 'am' ? 'ከሰዓት' : 'PM') : (currentLang === 'am' ? 'ጥዋት' : 'AM');
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hourStr = String(hours).padStart(2, '0');

      setCurrentDateStr(`${day} ${month} ${year} · ${hourStr}:${minutes} ${ampm}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, [currentLang]);

  const handleCopyAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshToast(true);

    setTimeout(() => {
      setIsRefreshing(false);
      setTimeout(() => setRefreshToast(false), 2500);
    }, 1200);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const last4 = account.accountNumber ? account.accountNumber.slice(-4) : '8612';
  const maskedAccount = currentLang === 'am' ? `የቁጠባ ሒሳብ 1 **** ${last4}` : `Saving Account 1 **** ${last4}`;
  const unmaskedAccount = `${currentLang === 'am' ? 'የቁጠባ ሒሳብ' : 'Saving Account'} ${account.accountNumber}`;

  const filteredTxs = transactions.filter((tx: any) => {
    const partyName = (tx.senderName || tx.receiverName || '').toLowerCase();
    const noteText = (tx.note || '').toLowerCase();
    const categoryText = (tx.category || '').toLowerCase();
    const matchesSearch = 
      partyName.includes(txSearchQuery.toLowerCase()) || 
      noteText.includes(txSearchQuery.toLowerCase()) || 
      categoryText.includes(txSearchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (txFilterType === 'debited') {
      return tx.type === 'outflow' || tx.type === 'transfer';
    }
    if (txFilterType === 'credited') {
      return tx.type === 'inflow';
    }
    return true; // 'all'
  });

  const formatTxDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const day = String(date.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = String(date.getFullYear()).slice(-2);
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hourStr = String(hours).padStart(2, '0');
      return `${day}-${month}-${year} ${hourStr}:${minutes} ${ampm}`;
    } catch {
      return '28-Sep-26 11:02 AM';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 flex flex-col justify-between w-full max-w-[420px] mx-auto relative shadow-2xl overflow-hidden font-sans pb-28 select-none">
      {/* Toast Notification when refreshed */}
      {refreshToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-xs border border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {currentLang === 'am'
              ? 'ሒሳብዎ እና የቅርብ ጊዜ ዝውውሮችዎ ታድሰዋል!'
              : 'Balance and transactions refreshed successfully!'}
          </span>
        </div>
      )}

      {/* Dedicated High-Fidelity Settings Header Bar */}
      {activeNavTab === 'settings' && (
        <div className="bg-[#701484] text-white px-4 py-3.5 flex items-center justify-between shrink-0 select-none relative z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (settingsSubView !== 'main') {
                  setSettingsSubView('main');
                } else {
                  setActiveNavTab('home');
                }
              }}
              className="text-white hover:opacity-80 transition-opacity flex items-center justify-center p-1 cursor-pointer"
            >
              {/* Back Arrow key ← */}
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <span className="font-extrabold text-[17px] tracking-wide">
              {settingsSubView === 'main' ? 'Settings' : (
                settingsSubView === 'change_pin' ? 'Change PIN' :
                settingsSubView === 'account_pref' ? 'Account Preferences' :
                settingsSubView === 'notifications' ? 'Notification Preferences' :
                settingsSubView === 'biometric' ? 'Biometric Login' : 'Passphrase'
              )}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-white hover:opacity-80 transition-opacity p-1 cursor-pointer">
              <Search className="w-5 h-5 stroke-[2.3]" />
            </button>
            <button 
              onClick={onOpenSettings}
              className="text-white hover:opacity-80 transition-opacity p-1 cursor-pointer flex flex-col justify-center items-center gap-0.75 w-5 h-5"
            >
              <span className="w-1.25 h-1.25 rounded-full bg-white block" />
              <span className="w-1.25 h-1.25 rounded-full bg-white block" />
              <span className="w-1.25 h-1.25 rounded-full bg-white block" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Purple Header Container: Greeting & Controls */}
      {activeNavTab !== 'settings' && (
        <div className="bg-[#701484] text-white pt-4 pb-2 px-3.5 relative z-10">
        {/* User Greeting & Top Header Controls */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            {/* 4-Square Grid Button */}
            <button
              onClick={onOpenMyInfo || onOpenSettings}
              className="w-9.5 h-9.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              title={currentLang === 'am' ? 'የግል መረጃ (My Information)' : 'My Information'}
            >
              <Grid className="w-4.5 h-4.5" />
            </button>
            <div>
              <div className="text-[10.5px] text-purple-200 font-medium leading-none mb-1">
                {currentLang === 'am' ? 'ሰላም,' : 'Hello,'}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-base font-extrabold text-white leading-tight">
                  {userName ? userName.trim().split(' ')[0] : 'Yared'}
                </div>
              </div>
            </div>
          </div>

          {/* Controls: Language, Refresh, Search */}
          <div className="flex items-center gap-1.5 pr-1">
            {/* Language Selector (Arrow removed as requested) */}
            <button
              onClick={() => setShowLangModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 border border-white/10 text-xs font-semibold text-white hover:bg-white/25 transition-colors cursor-pointer shadow-sm"
            >
              <span>{currentLang === 'am' ? 'አማርኛ' : 'English'}</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="w-8 h-8 rounded-full bg-white/15 border border-white/10 text-white flex items-center justify-center hover:bg-white/25 transition-colors cursor-pointer shadow-sm"
              title={currentLang === 'am' ? 'አድስ (Refresh)' : 'Refresh'}
            >
              <RotateCcw className={`w-4 h-4 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              className="w-8 h-8 rounded-full bg-white/15 border border-white/10 text-white flex items-center justify-center hover:bg-white/25 transition-colors cursor-pointer shadow-sm"
              title={currentLang === 'am' ? 'ፈልግ (Search)' : 'Search'}
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      )}

      {/* 2. ATM Card Container: Complete unclipped card with 100% visible curved corners */}
      {activeNavTab !== 'settings' && (
        <div className="bg-[#701484] px-4 pt-1 pb-4 relative z-10">
        {/* The Black Bank ATM Card with 100% visible rounded-3xl corners */}
        <div className="rounded-[24px] bg-[#111113] p-4.5 sm:p-5 shadow-[0_14px_35px_rgba(0,0,0,0.4)] border border-neutral-800/90 relative overflow-hidden text-white">
          {/* Subtle Dotted Matrix World Map (faint gold/white dots, NO blue blobs, NO gray shapes) */}
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 650 320" className="w-full h-full fill-[#dfb743]">
              <g>
                <circle cx="80" cy="70" r="2.5" /><circle cx="95" cy="70" r="2.5" /><circle cx="110" cy="70" r="2.5" />
                <circle cx="70" cy="85" r="2.5" /><circle cx="85" cy="85" r="2.5" /><circle cx="100" cy="85" r="2.5" /><circle cx="115" cy="85" r="2.5" /><circle cx="130" cy="85" r="2.5" />
                <circle cx="65" cy="100" r="2.5" /><circle cx="80" cy="100" r="2.5" /><circle cx="95" cy="100" r="2.5" /><circle cx="110" cy="100" r="2.5" /><circle cx="125" cy="100" r="2.5" /><circle cx="140" cy="100" r="2.5" />
                <circle cx="75" cy="115" r="2.5" /><circle cx="90" cy="115" r="2.5" /><circle cx="105" cy="115" r="2.5" /><circle cx="120" cy="115" r="2.5" /><circle cx="135" cy="115" r="2.5" />
                <circle cx="85" cy="130" r="2.5" /><circle cx="100" cy="130" r="2.5" /><circle cx="115" cy="130" r="2.5" /><circle cx="130" cy="130" r="2.5" />
                <circle cx="100" cy="145" r="2.5" /><circle cx="115" cy="145" r="2.5" /><circle cx="115" cy="160" r="2.5" />
              </g>
              <g>
                <circle cx="140" cy="190" r="2.5" /><circle cx="155" cy="190" r="2.5" /><circle cx="170" cy="190" r="2.5" />
                <circle cx="145" cy="205" r="2.5" /><circle cx="160" cy="205" r="2.5" /><circle cx="175" cy="205" r="2.5" /><circle cx="190" cy="205" r="2.5" />
                <circle cx="150" cy="220" r="2.5" /><circle cx="165" cy="220" r="2.5" /><circle cx="180" cy="220" r="2.5" />
                <circle cx="155" cy="235" r="2.5" /><circle cx="170" cy="235" r="2.5" />
                <circle cx="160" cy="250" r="2.5" /><circle cx="165" cy="265" r="2.5" />
              </g>
              <g>
                <circle cx="280" cy="70" r="2.5" /><circle cx="295" cy="70" r="2.5" /><circle cx="310" cy="70" r="2.5" />
                <circle cx="275" cy="85" r="2.5" /><circle cx="290" cy="85" r="2.5" /><circle cx="305" cy="85" r="2.5" /><circle cx="320" cy="85" r="2.5" />
                <circle cx="270" cy="100" r="2.5" /><circle cx="285" cy="100" r="2.5" /><circle cx="300" cy="100" r="2.5" /><circle cx="315" cy="100" r="2.5" />
                <circle cx="275" cy="120" r="2.5" /><circle cx="290" cy="120" r="2.5" /><circle cx="305" cy="120" r="2.5" /><circle cx="320" cy="120" r="2.5" /><circle cx="335" cy="120" r="2.5" />
                <circle cx="270" cy="135" r="2.5" /><circle cx="285" cy="135" r="2.5" /><circle cx="300" cy="135" r="2.5" /><circle cx="315" cy="135" r="2.5" /><circle cx="330" cy="135" r="2.5" /><circle cx="345" cy="135" r="2.5" />
                <circle cx="280" cy="150" r="2.5" /><circle cx="295" cy="150" r="2.5" /><circle cx="310" cy="150" r="2.5" /><circle cx="325" cy="150" r="2.5" /><circle cx="340" cy="150" r="2.5" />
                <circle cx="290" cy="165" r="2.5" /><circle cx="305" cy="165" r="2.5" /><circle cx="320" cy="165" r="2.5" /><circle cx="335" cy="165" r="2.5" />
                <circle cx="300" cy="180" r="2.5" /><circle cx="315" cy="180" r="2.5" /><circle cx="330" cy="180" r="2.5" />
                <circle cx="310" cy="210" r="2.5" /><circle cx="315" cy="225" r="2.5" />
              </g>
              <g>
                <circle cx="360" cy="70" r="2.5" /><circle cx="375" cy="70" r="2.5" /><circle cx="390" cy="70" r="2.5" /><circle cx="405" cy="70" r="2.5" /><circle cx="420" cy="70" r="2.5" />
                <circle cx="355" cy="85" r="2.5" /><circle cx="370" cy="85" r="2.5" /><circle cx="385" cy="85" r="2.5" /><circle cx="400" cy="85" r="2.5" /><circle cx="415" cy="85" r="2.5" />
                <circle cx="370" cy="100" r="2.5" /><circle cx="385" cy="100" r="2.5" /><circle cx="400" cy="100" r="2.5" /><circle cx="415" cy="100" r="2.5" /><circle cx="430" cy="100" r="2.5" />
                <circle cx="385" cy="115" r="2.5" /><circle cx="400" cy="115" r="2.5" /><circle cx="415" cy="115" r="2.5" /><circle cx="430" cy="115" r="2.5" />
                <circle cx="395" cy="130" r="2.5" /><circle cx="410" cy="130" r="2.5" /><circle cx="425" cy="130" r="2.5" />
                <circle cx="480" cy="200" r="2.5" /><circle cx="495" cy="200" r="2.5" /><circle cx="510" cy="200" r="2.5" />
                <circle cx="470" cy="215" r="2.5" /><circle cx="485" cy="215" r="2.5" /><circle cx="500" cy="215" r="2.5" />
              </g>
            </svg>
          </div>

          <div className="relative z-10 flex flex-col justify-between space-y-3.5">
            {/* Card Header with Official White Logo */}
            <div className="flex items-center gap-3.5">
              <CbeLogo
                isDarkBg={true}
                size="md"
                className="w-12 h-12 shrink-0 pointer-events-none"
              />
              <div className="flex flex-col">
                <h3 className="text-sm sm:text-[15px] font-bold text-[#dfb743] font-serif tracking-tight leading-none mb-1">
                  የኢትዮጵያ ንግድ ባንክ
                </h3>
                <h4 className="text-[10px] sm:text-[11px] font-bold text-[#dfb743]/90 tracking-wider uppercase font-sans leading-none">
                  COMMERCIAL BANK OF ETHIOPIA
                </h4>
              </div>
            </div>

            {/* Centered Balance, Account, and Date matching image.png */}
            <div className="flex flex-col items-center text-center space-y-1.5 py-1">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Balance
              </span>
              
              <div className="flex items-center justify-center gap-2">
                <span className="text-[25px] sm:text-[28px] font-extrabold text-white tracking-wide leading-none">
                  {hideBalance ? '******' : `${formatCurrency(account.balance, '').trim()} .Birr`}
                </span>
                <button
                  onClick={() => setHideBalance(!hideBalance)}
                  className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                  title={hideBalance ? 'Show Balance & Account' : 'Hide Balance & Account'}
                >
                  {hideBalance ? (
                    <EyeOff className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-[#dfb743]" />
                  )}
                </button>
              </div>

              {/* Account Number matching gold/yellow layout */}
              <div className="flex items-center gap-1.5 text-xs text-[#dfb743] font-bold tracking-wide pt-0.5">
                <span>
                  {hideBalance 
                    ? `Saving - ${account.accountNumber.slice(0, 4)}****${account.accountNumber.slice(-4)}` 
                    : `Saving - ${account.accountNumber}`}
                </span>
                <button
                  onClick={handleCopyAccount}
                  className="p-1 hover:text-white transition-colors cursor-pointer text-neutral-400"
                  title="Copy Account Number"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* Centered Date matching image.png */}
              <div className="text-[10px] text-neutral-400 font-mono tracking-tight pt-1">
                {currentDateStr || '01 Jul 2026 · 10:14 AM'}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 3. Conditional Tab Views based on activeNavTab */}
      {activeNavTab === 'home' && (
        <div className="bg-white rounded-t-[32px] px-4 pt-4 pb-24 space-y-4 relative z-20 shadow-xs flex-1">
          {/* 3-Dots Carousel Indicator directly below the card */}
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <div className="w-7 h-1.5 rounded-full bg-[#dfa732]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#dfa732]/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#dfa732]/70" />
          </div>

          {/* 4 Circular Action Buttons */}
          <div className="grid grid-cols-4 gap-2 text-center relative items-start">
            {/* Button 1: Cash Out */}
            <button
              onClick={onOpenCashOut}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-13 h-13 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center justify-center text-[#701484] group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 text-[#701484]" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 12 20.5 A 8.5 8.5 0 1 1 20.5 12" />
                  <path d="M 8.5 3.5 L 12 3.5 L 12 7" />
                  <path d="M 16 3.5 L 21 3.5 L 21 8.5" />
                  <path d="M 14.5 10 L 21 3.5" />
                  <text x="12" y="14.5" textAnchor="middle" dominantBaseline="middle" fill="#701484" fontSize="8" fontWeight="bold" fontFamily="monospace" stroke="none">$</text>
                </svg>
              </div>
              <span className="text-[11px] font-bold text-[#701484] leading-tight">
                {currentLang === 'am' ? 'ጥሬ ገንዘብ' : 'Cash Out'}
              </span>
            </button>

            {/* Button 2: Mini Statement */}
            <button
              onClick={onOpenMiniStatement}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-13 h-13 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center justify-center text-[#701484] group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" className="w-6.5 h-6.5">
                  <path
                    d="M 5 2 L 7.5 4 L 10 2 L 12.5 4 L 15 2 L 17.5 4 L 20 2 L 20 22 L 17.5 20 L 15 22 L 12.5 20 L 10 22 L 7.5 20 L 5 22 Z"
                    fill="#701484"
                  />
                  <line x1="8" y1="8" x2="16" y2="8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="8" y1="16" x2="14" y2="16" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-[#701484] leading-tight">
                {currentLang === 'am' ? 'የሒሳብ መግለጫ' : 'Mini Satement'}
              </span>
            </button>

            {/* Button 3: Cards */}
            <button
              onClick={onOpenCards}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-13 h-13 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center justify-center text-[#701484] group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 text-[#701484]" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
                  <line x1="2.5" y1="9.5" x2="21.5" y2="9.5" strokeWidth="2.5" />
                  <line x1="6" y1="14.5" x2="10" y2="14.5" strokeWidth="2.2" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-[#701484] leading-tight">
                {currentLang === 'am' ? 'ካርዶች' : 'Cards'}
              </span>
            </button>

            {/* Button 4: Bill Share */}
            <div className="relative">
              <button
                onClick={onOpenBillShare}
                className="flex flex-col items-center gap-1.5 group cursor-pointer w-full"
              >
                <div className="w-13 h-13 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center justify-center text-[#701484] group-hover:scale-105 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-6.5 h-6.5 text-[#701484]" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="20" x2="12" y2="13" />
                    <path d="M 12 13 Q 9 11 6.5 7.5" />
                    <path d="M 5.5 10.5 L 6.5 7 L 10 7.5" />
                    <path d="M 12 13 Q 15 11 17.5 7.5" />
                    <path d="M 14 7.5 L 17.5 7 L 18.5 10.5" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-[#701484] leading-tight">
                  {currentLang === 'am' ? 'ክፍያ ማጋራት' : 'Bill Share'}
                </span>
              </button>
              <button
                onClick={onOpenBillShare}
                className="absolute -right-1 top-3.5 w-5 h-5 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#701484] cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 1. Primary 6 Main Service Cards */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Card 1: CBE Transfer */}
            <button
              onClick={onOpenTransfer}
              className="p-3.5 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:border-[#701484]/40 flex items-center gap-3 text-left transition-all hover:shadow-md cursor-pointer h-20 group"
            >
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#701484]">
                  {currentLang === 'am' ? 'የንግድ ባንክ ዝውውር' : 'CBE Transfer'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {currentLang === 'am' ? 'ብር ላክ' : 'Send Money'}
                </div>
              </div>
            </button>

            {/* Card 2: Receive */}
            <button
              onClick={onOpenReceiveModal}
              className="p-3.5 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:border-emerald-400/40 flex items-center gap-3 text-left transition-all hover:shadow-md cursor-pointer h-20 group"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#701484]">
                  {currentLang === 'am' ? 'ገንዘብ መቀበያ' : 'Receive'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {currentLang === 'am' ? 'ክፍያ ተቀበል' : 'Get Paid'}
                </div>
              </div>
            </button>

            {/* Card 3: Airtime */}
            <button
              onClick={onOpenAirtime}
              className="p-3.5 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:border-[#701484]/40 flex flex-col items-center justify-center gap-1.5 text-center transition-all hover:shadow-md cursor-pointer h-22 group"
            >
              <Phone className="w-6 h-6 stroke-[2.2] text-[#701484] group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-[#701484]">
                {currentLang === 'am' ? 'ሞባይል ካርድ' : 'Airtime'}
              </div>
            </button>

            {/* Card 4: Other Transfers */}
            <button
              onClick={onOpenOtherTransfers}
              className="p-3.5 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:border-[#701484]/40 flex flex-col items-center justify-center gap-1.5 text-center transition-all hover:shadow-md cursor-pointer h-22 group"
            >
              <RefreshCw className="w-6 h-6 stroke-[2.2] text-[#701484] group-hover:rotate-45 transition-transform" />
              <div className="text-xs font-bold text-[#701484]">
                {currentLang === 'am' ? 'ሌሎች ዝውውሮች' : 'Other Transfers'}
              </div>
            </button>

            {/* Card 5: CBEBirr */}
            <button
              onClick={onOpenCbeBirr}
              className="p-3.5 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:border-[#701484]/40 flex flex-col items-center justify-center gap-1.5 text-center transition-all hover:shadow-md cursor-pointer h-22 group"
            >
              <img src="/cbe_birr.svg" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" alt="CBE Birr" />
              <div className="text-xs font-bold text-[#701484]">
                {currentLang === 'am' ? 'ንግድ ባንክ ብር' : 'CBEBirr'}
              </div>
            </button>

            {/* Card 6: Bills & Utilities */}
            <button
              onClick={onOpenBills}
              className="p-3.5 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:border-[#701484]/40 flex flex-col items-center justify-center gap-1.5 text-center transition-all hover:shadow-md cursor-pointer h-22 group"
            >
              <Receipt className="w-6 h-6 stroke-[2.2] text-[#701484] group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-[#701484]">
                {currentLang === 'am' ? 'ክፍያዎች' : 'Bills & Utilities'}
              </div>
            </button>
          </div>

          {/* 2. Additional Lifestyle & Ecosystem Services */}
          <div className="space-y-3 pt-3">
            <div className="text-xs font-extrabold text-[#701484] tracking-wide px-1">
              {currentLang === 'am' ? 'የኢኮሲስተም አገልግሎቶች' : 'Ecosystem Services'}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* 1. Banking */}
              <button
                onClick={onOpenTransfer}
                className="p-3.5 bg-white rounded-2xl shadow-2xs border border-slate-100/90 flex flex-col items-center justify-center gap-2 text-center hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer h-28 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#701484] group-hover:bg-purple-100 transition-colors flex items-center justify-center">
                  <Landmark className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {currentLang === 'am' ? 'ባንክ' : 'Banking'}
                </span>
              </button>

              {/* 2. Government Services */}
              <button
                onClick={onOpenBills}
                className="p-3.5 bg-white rounded-2xl shadow-2xs border border-slate-100/90 flex flex-col items-center justify-center gap-2 text-center hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer h-28 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#701484] group-hover:bg-purple-100 transition-colors flex items-center justify-center">
                  <Building2 className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {currentLang === 'am' ? 'የመንግስት አገልግሎቶች' : 'Government Services'}
                </span>
              </button>

              {/* 3. Pay to Merchant */}
              <button
                onClick={onOpenReceiveQr}
                className="p-3.5 bg-white rounded-2xl shadow-2xs border border-slate-100/90 flex flex-col items-center justify-center gap-2 text-center hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer h-28 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#701484] group-hover:bg-purple-100 transition-colors flex items-center justify-center">
                  <Store className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {currentLang === 'am' ? 'ለነጋዴ ክፍያ' : 'Pay to Merchant'}
                </span>
              </button>

              {/* 4. Travel */}
              <button
                onClick={onOpenBills}
                className="p-3.5 bg-white rounded-2xl shadow-2xs border border-slate-100/90 flex flex-col items-center justify-center gap-2 text-center hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer h-28 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#701484] group-hover:bg-purple-100 transition-colors flex items-center justify-center">
                  <Plane className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {currentLang === 'am' ? 'ጉዞ' : 'Travel'}
                </span>
              </button>

              {/* 5. Shopping */}
              <button
                onClick={onOpenBills}
                className="p-3.5 bg-white rounded-2xl shadow-2xs border border-slate-100/90 flex flex-col items-center justify-center gap-2 text-center hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer h-28 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#701484] group-hover:bg-purple-100 transition-colors flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {currentLang === 'am' ? 'ግዢ' : 'Shopping'}
                </span>
              </button>

              {/* 6. Entertainment */}
              <button
                onClick={onOpenBills}
                className="p-3.5 bg-white rounded-2xl shadow-2xs border border-slate-100/90 flex flex-col items-center justify-center gap-2 text-center hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer h-28 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#701484] group-hover:bg-purple-100 transition-colors flex items-center justify-center">
                  <Film className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {currentLang === 'am' ? 'መዝናኛ' : 'Entertainment'}
                </span>
              </button>
            </div>

            {/* 7. Pay for */}
            <button
              onClick={onOpenAirtime}
              className="w-1/2 mx-auto p-3.5 bg-white rounded-2xl shadow-2xs border border-slate-100/90 flex flex-col items-center justify-center gap-2 text-center hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer h-28 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#701484] group-hover:bg-purple-100 transition-colors flex items-center justify-center">
                <HandCoins className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {currentLang === 'am' ? 'ክፍያ መፈጸሚያ' : 'Pay for'}
              </span>
            </button>
          </div>
        </div>
      )}

      {activeNavTab === 'transactions' && (
        <div className="flex-1 flex flex-col bg-[#701484] relative">
          {/* Faint gold dot in middle directly below the card */}
          <div className="flex items-center justify-center py-2 relative z-10 bg-[#701484]">
            <div className="w-2 h-2 rounded-full bg-[#dfb743]" />
          </div>

          {/* White container body with rounded-t-3xl */}
          <div className="bg-white rounded-t-[32px] px-5 pt-5 pb-24 relative z-20 flex-1 flex flex-col shadow-xs animate-in slide-in-from-bottom-4 duration-300">
            {/* Filter Tabs & Search Icon matching image exactly */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-4 relative">
              <div className="flex items-center gap-6 text-sm font-bold">
                <button
                  onClick={() => { setTxFilterType('all'); }}
                  className={`pb-2.5 relative font-extrabold text-[13px] transition-colors cursor-pointer ${txFilterType === 'all' ? 'text-[#701484]' : 'text-slate-400'}`}
                >
                  All
                  {txFilterType === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-[#701484] rounded-full animate-in fade-in" />}
                </button>
                <button
                  onClick={() => { setTxFilterType('debited'); }}
                  className={`pb-2.5 relative font-extrabold text-[13px] transition-colors cursor-pointer ${txFilterType === 'debited' ? 'text-[#701484]' : 'text-slate-400'}`}
                >
                  Debited
                  {txFilterType === 'debited' && <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-[#701484] rounded-full animate-in fade-in" />}
                </button>
                <button
                  onClick={() => { setTxFilterType('credited'); }}
                  className={`pb-2.5 relative font-extrabold text-[13px] transition-colors cursor-pointer ${txFilterType === 'credited' ? 'text-[#701484]' : 'text-slate-400'}`}
                >
                  Credited
                  {txFilterType === 'credited' && <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-[#701484] rounded-full animate-in fade-in" />}
                </button>
              </div>
              
              <button
                onClick={() => setShowTxSearchInput(!showTxSearchInput)}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${showTxSearchInput ? 'bg-[#701484]/10 text-[#701484]' : 'text-slate-500 hover:text-[#701484]'}`}
              >
                <Search className="w-5 h-5 stroke-[2.3]" />
              </button>
            </div>

            {/* Dynamic Interactive Search Bar */}
            {showTxSearchInput && (
              <div className="mb-4 animate-in slide-in-from-top-2 duration-200">
                <input
                  autoFocus
                  type="text"
                  placeholder={currentLang === 'am' ? 'በስም ወይም በምድብ ፈልግ...' : 'Search transactions...'}
                  value={txSearchQuery}
                  onChange={(e) => setTxSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#701484] font-semibold text-slate-800 placeholder-slate-400"
                />
              </div>
            )}

            {/* Scrollable Transaction Ledger Items (Exactly matching image slips!) */}
            <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[460px] pr-0.5">
              {filteredTxs.length > 0 ? (
                filteredTxs.map((tx: any) => {
                  const isInflow = tx.type === 'inflow';
                  // For debited/outflow transfers, display the person you sent money to (receiverName)!
                  // For credited/inflow transfers, display who sent you money (senderName)!
                  const rawName = isInflow
                    ? (tx.senderName || 'Deposit')
                    : (tx.receiverName || tx.senderName || 'Transfer');
                  const partyName = formatCbeName(rawName);
                  
                  return (
                    <div
                      key={tx.id}
                      onClick={() => onOpenReceipt?.(tx)}
                      className="w-full bg-[#f8f9fa] hover:bg-slate-100 p-4 rounded-[22px] border border-slate-100 flex items-center justify-between transition-all cursor-pointer active:scale-[0.99] group shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        {/* Transaction Icon / Logo */}
                        {tx.category === 'Airtime Topup' && tx.receiverBank?.toLowerCase().includes('ethio') ? (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white border border-slate-100 p-1.5 shadow-xs">
                            <img src="/ethio_telecom.svg" className="w-full h-full object-contain" alt="Ethio" />
                          </div>
                        ) : tx.category === 'Airtime Topup' && tx.receiverBank?.toLowerCase().includes('safari') ? (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white border border-slate-100 p-1.5 shadow-xs">
                            <img src="/safaricom.svg" className="w-full h-full object-contain rounded-full" alt="Safaricom" />
                          </div>
                        ) : tx.category === 'Telebirr Transfer' || tx.transferMode === 'cbe_birr' ? (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white border border-slate-100 p-1.5 shadow-xs">
                            <img src="/cbe_birr.svg" className="w-full h-full object-contain" alt="CBE Birr" />
                          </div>
                        ) : isInflow ? (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-500" title="Credit / Deposit">
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <polyline points="19 12 12 19 5 12"></polyline>
                            </svg>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-rose-50 text-rose-500" title="Debit / Outflow">
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="19" x2="12" y2="5"></line>
                              <polyline points="5 12 12 5 19 12"></polyline>
                            </svg>
                          </div>
                        )}
                        
                        <div className="space-y-0.5 text-left">
                          <h4 className="font-extrabold text-[#701484] text-[12.5px] leading-tight group-hover:text-purple-900 transition-colors truncate max-w-[150px]">
                            {partyName}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold font-mono">
                            {formatTxDate(tx.timestamp)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right space-y-1.5 shrink-0">
                        {/* Dynamic Amount text and color matching inflow (green +) or outflow (red -) */}
                        <span className={`text-[13px] font-extrabold tracking-wide font-mono ${isInflow ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isInflow ? '+' : '-'}{formatCurrency(tx.amount, '').trim()} ETB
                        </span>
                        <div className="text-[7.5px] font-extrabold tracking-wider text-purple-700 bg-purple-50 border border-purple-100/70 px-2 py-0.5 rounded-md text-center uppercase block font-sans">
                          {tx.category || 'ACCOUNT TO ACCOUNT'}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
                  <p className="text-xs font-bold">{currentLang === 'am' ? 'ምንም ዝውውር አልተገኘም' : 'No transactions found'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeNavTab === 'settings' && (
        <div className="flex-1 flex flex-col bg-[#701484] relative">
          
          {settingsSubView === 'main' ? (
            /* ================= MAIN SETTINGS VIEW ================= */
            <div className="bg-[#f8f9fa] px-5 pt-6 pb-36 relative z-20 flex-1 flex flex-col shadow-xs animate-in slide-in-from-bottom-4 duration-300 text-left overflow-y-auto">
              
              {/* Preferences Section */}
              <div className="space-y-3">
                <h3 className="text-[#701484] font-extrabold text-[14px] sm:text-[15px] px-1 tracking-wide">
                  Preferences
                </h3>
                
                {/* 1. Language Box */}
                <button
                  onClick={() => setShowLangModal(true)}
                  className="w-full bg-white p-4 rounded-[18px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-purple-300 transition-all cursor-pointer text-left active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#701484]">
                      <Globe className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-[12.5px] leading-tight">
                        Language
                      </h4>
                      <p className="text-[10.5px] text-slate-400 font-bold mt-0.5">
                        {currentLang === 'am' ? 'አማርኛ' : 'English'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-300" />
                </button>

                {/* 2. Account Preferences */}
                <button
                  onClick={() => setSettingsSubView('account_pref')}
                  className="w-full bg-white p-4 rounded-[18px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-purple-300 transition-all cursor-pointer text-left active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#701484]">
                      <UserCog className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-[12.5px] leading-tight">
                        Account Preferences
                      </h4>
                      <p className="text-[10.5px] text-slate-400 font-bold mt-0.5">
                        Configure layout & balance
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-300" />
                </button>

                {/* 3. Notification Preferences */}
                <button
                  onClick={() => setSettingsSubView('notifications')}
                  className="w-full bg-white p-4 rounded-[18px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-purple-300 transition-all cursor-pointer text-left active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#701484]">
                      <Bell className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-[12.5px] leading-tight">
                        Notification Preferences
                      </h4>
                      <p className="text-[10.5px] text-slate-400 font-bold mt-0.5">
                        SMS & Push alerts active
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-300" />
                </button>
              </div>

              {/* Security Settings Section */}
              <div className="space-y-3 mt-6">
                <h3 className="text-[#701484] font-extrabold text-[14px] sm:text-[15px] px-1 tracking-wide">
                  Security Settings
                </h3>

                {/* 1. Biometric Login */}
                <button
                  onClick={() => setSettingsSubView('biometric')}
                  className="w-full bg-white p-4 rounded-[18px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-purple-300 transition-all cursor-pointer text-left active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#701484]">
                      <Fingerprint className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-[12.5px] leading-tight">
                        Biometric Login
                      </h4>
                      <p className="text-[10.5px] text-slate-400 font-bold mt-0.5">
                        {biometricEnabled ? 'Biometrics active' : 'Biometrics disabled'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-300" />
                </button>

                {/* 2. Change PIN */}
                <button
                  onClick={() => {
                    setSettingsSubView('change_pin');
                    setPinChangeError('');
                    setPinChangeSuccess('');
                    setCurrentPinInput('');
                    setNewPinInput('');
                  }}
                  className="w-full bg-white p-4 rounded-[18px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-purple-300 transition-all cursor-pointer text-left active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#701484]">
                      <Key className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-[12.5px] leading-tight">
                        Change PIN
                      </h4>
                      <p className="text-[10.5px] text-slate-400 font-bold mt-0.5">
                        Update your 4-digit mobile PIN
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-300" />
                </button>

                {/* PWA Install Button */}
                {(isInstallable || isIOS) && !isInstalled && (
                  <button
                    onClick={() => {
                      if (isIOS) setShowIOSGuide(true);
                      else install();
                    }}
                    className="w-full bg-[#701484]/5 p-4 rounded-[18px] border border-[#701484]/20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-[#701484]/40 transition-all cursor-pointer text-left active:scale-[0.99] group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#701484] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[#701484] text-[12.5px] leading-tight">
                          Install Application
                        </h4>
                        <p className="text-[10.5px] text-slate-400 font-bold mt-0.5">
                          Add CBE Mobile to your home screen
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4.5 h-4.5 text-[#701484]/40" />
                  </button>
                )}

                {/* 3. Change Passphrase */}
                <button
                  onClick={() => setSettingsSubView('change_passphrase')}
                  className="w-full bg-white p-4 rounded-[18px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-purple-300 transition-all cursor-pointer text-left active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#701484]">
                      <Lock className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-[12.5px] leading-tight">
                        Change Passphrase
                      </h4>
                      <p className="text-[10.5px] text-slate-400 font-bold mt-0.5">
                        Set login sentence phrase
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-300" />
                </button>

                {/* 4. Log out Box in Red matching the image exactly */}
                <button
                  onClick={onLogout}
                  className="w-full bg-white p-4 rounded-[18px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-rose-300 transition-all cursor-pointer text-left active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                      <LogOut className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-rose-500 text-[12.5px] leading-tight">
                        Log out
                      </h4>
                      <p className="text-[10.5px] text-rose-400/80 font-bold mt-0.5">
                        Sign out of this session
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-rose-300" />
                </button>
              </div>

              {/* Version & Privacy Footer matching Screenshot_20261002-100902.jpg */}
              <div className="text-center pt-8 pb-4 mt-auto shrink-0 space-y-1">
                <p className="text-[10.5px] font-extrabold text-slate-400">
                  Version: 1.0
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[10.5px] font-extrabold text-[#701484] underline-offset-2">
                  <span
                    onClick={() => {
                      setPrivacyModalType('privacy');
                      setShowPrivacyModal(true);
                    }}
                    className="hover:underline cursor-pointer text-slate-500 hover:text-[#701484] transition-colors"
                  >
                    Privacy policy
                  </span>
                  <span className="text-slate-300">|</span>
                  <span
                    onClick={() => {
                      setPrivacyModalType('terms');
                      setShowPrivacyModal(true);
                    }}
                    className="hover:underline cursor-pointer text-slate-500 hover:text-[#701484] transition-colors"
                  >
                    Terms and Conditions
                  </span>
                </div>
              </div>

            </div>
          ) : (
            /* ================= SUB-VIEWS FOR INTERACTIVE PREFERENCES ================= */
            <div className="bg-[#f8f9fa] px-6 pt-6 pb-36 relative z-20 flex-1 flex flex-col shadow-xs animate-in slide-in-from-right-4 duration-200 text-left overflow-y-auto">
              
              {/* Subview Header */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                <button
                  onClick={() => setSettingsSubView('main')}
                  className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-[#701484] cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <h4 className="font-extrabold text-[#701484] text-sm uppercase tracking-wider">
                  {settingsSubView === 'change_pin' && 'Change PIN'}
                  {settingsSubView === 'account_pref' && 'Account Preferences'}
                  {settingsSubView === 'notifications' && 'Notification Preferences'}
                  {settingsSubView === 'biometric' && 'Biometric Login'}
                  {settingsSubView === 'change_passphrase' && 'Change Passphrase'}
                </h4>
              </div>

              {/* Subview Body Content */}
              {settingsSubView === 'change_pin' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    Update your mobile banking PIN securely. Keep it private.
                  </p>

                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="Enter current PIN"
                        value={currentPinInput}
                        onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold font-mono tracking-widest text-sm focus:border-[#701484] outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">New PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="Enter new 4-digit PIN"
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold font-mono tracking-widest text-sm focus:border-[#701484] outline-none"
                      />
                    </div>

                    {pinChangeError && (
                      <p className="text-xs font-bold text-rose-500 bg-rose-50 p-2.5 rounded-xl border border-rose-100 text-center">{pinChangeError}</p>
                    )}
                    {pinChangeSuccess && (
                      <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-center">{pinChangeSuccess}</p>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setPinChangeError('');
                        setPinChangeSuccess('');
                        if (!currentPinInput || !newPinInput) {
                          setPinChangeError('Please enter both current and new PIN.');
                          return;
                        }
                        if (newPinInput.length !== 4) {
                          setPinChangeError('New PIN must be exactly 4 digits.');
                          return;
                        }
                        // Update storage
                        const savedProfile = localStorage.getItem('cbe_user_profile_v8');
                        if (savedProfile) {
                          const parsed = JSON.parse(savedProfile);
                          if (currentPinInput !== parsed.pin) {
                            setPinChangeError('Incorrect current PIN.');
                            return;
                          }
                          parsed.pin = newPinInput;
                          localStorage.setItem('cbe_user_profile_v8', JSON.stringify(parsed));
                        }
                        setPinChangeSuccess('Your PIN has been successfully changed!');
                        setCurrentPinInput('');
                        setNewPinInput('');
                      }}
                      className="w-full py-4 bg-[#701484] hover:bg-[#620d69] text-white font-extrabold text-xs rounded-full shadow-md cursor-pointer transition-all mt-4"
                    >
                      Update Mobile PIN
                    </button>
                  </div>
                </div>
              )}

              {settingsSubView === 'account_pref' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 font-semibold">
                    Config your account visibility and preferences.
                  </p>
                  
                  <div className="bg-slate-50 p-4.5 rounded-3xl space-y-3.5 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Hide balance by default</span>
                      <input
                        type="checkbox"
                        checked={hideBalance}
                        onChange={(e) => setHideBalance(e.target.checked)}
                        className="w-4.5 h-4.5 accent-[#701484] rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-3">
                      <span className="text-xs font-bold text-slate-700">Enable Shake to Refresh</span>
                      <input type="checkbox" defaultChecked className="w-4.5 h-4.5 accent-[#701484] cursor-pointer" />
                    </div>
                  </div>
                </div>
              )}

              {settingsSubView === 'notifications' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 font-semibold">
                    Toggle your real-time banking notifications.
                  </p>
                  
                  <div className="bg-slate-50 p-4.5 rounded-3xl space-y-4 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">SMS Alerts</span>
                        <span className="text-[9.5px] text-slate-400 font-medium">Alert on transfers and deposits</span>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#701484] cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-3.5">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Push Notifications</span>
                        <span className="text-[9.5px] text-slate-400 font-medium">Offers and monthly reports</span>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#701484] cursor-pointer" />
                    </div>
                  </div>
                </div>
              )}

              {settingsSubView === 'biometric' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    Toggle fast biometric login (Face ID / Fingerprint ID) for secure instant access.
                  </p>

                  <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-3xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#701484] block">Enable Fingerprint / Face ID</span>
                      <span className="text-[9.5px] text-slate-400 font-bold mt-0.5 block">Fast authentication on startup</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={biometricEnabled}
                      onChange={(e) => setBiometricEnabled(e.target.checked)}
                      className="w-5 h-5 accent-[#701484] cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {settingsSubView === 'change_passphrase' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    Set a customized greeting login passphrase sentence.
                  </p>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="e.g. Always rely on Commercial Bank!"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:border-[#701484]"
                    />
                    <button
                      type="button"
                      onClick={() => setSettingsSubView('main')}
                      className="w-full py-3.5 bg-[#701484] hover:bg-[#620d69] text-white font-extrabold text-xs rounded-full shadow-md cursor-pointer"
                    >
                      Save Passphrase
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* Floating Center Scan QR Button (Official CBE Purple #701484) - Only visible on Home Tab */}
      {activeNavTab === 'home' && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={onOpenReceiveQr}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#701484] hover:bg-[#590e6a] active:scale-95 text-white text-xs font-bold shadow-xl shadow-[#701484]/40 border-2 border-white cursor-pointer"
          >
            <QrCode className="w-4 h-4 stroke-[2.2]" />
            <span className="tracking-wide font-bold">{currentLang === 'am' ? 'QR ይቃኙ' : 'Scan QR'}</span>
          </button>
        </div>
      )}

      {/* Bottom Dock Navigation Bar - High-Fidelity Exact Match with Labels! */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 px-6 py-2 flex items-center justify-between z-30 shadow-[0_-4px_25px_rgba(0,0,0,0.07)]">
        {/* Left Tab: Home */}
        <button
          onClick={() => setActiveNavTab('home')}
          className="flex flex-col items-center justify-center cursor-pointer w-20 group"
        >
          <div className={`flex items-center justify-center px-4 py-1.5 rounded-full transition-all ${activeNavTab === 'home' ? 'bg-[#f6ebd9] text-[#701484]' : 'text-slate-400 group-hover:text-slate-600'}`}>
            <Home className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <span className={`text-[10px] font-bold mt-1 transition-colors ${activeNavTab === 'home' ? 'text-[#701484]' : 'text-slate-400 group-hover:text-slate-600'}`}>
            {currentLang === 'am' ? 'ዋና ገጽ' : 'Home'}
          </span>
        </button>

        {/* Center Tab: Transactions (Landmark bank icon) */}
        <button
          onClick={() => setActiveNavTab('transactions')}
          className="flex flex-col items-center justify-center cursor-pointer w-24 group"
        >
          <div className={`flex items-center justify-center px-4 py-1.5 rounded-full transition-all ${activeNavTab === 'transactions' ? 'bg-[#f6ebd9] text-[#701484]' : 'text-slate-400 group-hover:text-slate-600'}`}>
            <Landmark className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <span className={`text-[10px] font-bold mt-1 transition-colors ${activeNavTab === 'transactions' ? 'text-[#701484]' : 'text-slate-400 group-hover:text-slate-600'}`}>
            {currentLang === 'am' ? 'ዝውውሮች' : 'Transactions'}
          </span>
        </button>

        {/* Right Tab: Settings */}
        <button
          onClick={() => setActiveNavTab('settings')}
          className="flex flex-col items-center justify-center cursor-pointer w-20 group"
        >
          <div className={`flex items-center justify-center px-4 py-1.5 rounded-full transition-all ${activeNavTab === 'settings' ? 'bg-[#f6ebd9] text-[#701484]' : 'text-slate-400 group-hover:text-slate-600'}`}>
            <Settings className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <span className={`text-[10px] font-bold mt-1 transition-colors ${activeNavTab === 'settings' ? 'text-[#701484]' : 'text-slate-400 group-hover:text-slate-600'}`}>
            {currentLang === 'am' ? 'ቅንብሮች' : 'Settings'}
          </span>
        </button>
      </div>

      {/* Language Modal */}
      <LanguageModal
        isOpen={showLangModal}
        currentLang={currentLang}
        onSelectLang={(lang) => {
          if (onSelectLang) {
            onSelectLang(lang);
          } else if (lang !== currentLang) {
            onToggleLang();
          }
        }}
        onClose={() => setShowLangModal(false)}
      />

      {/* 4. Complete, Gorgeous interactive CBE Privacy Policy & Terms Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-[#121016]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
          <div className="bg-white text-slate-800 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 flex flex-col h-[520px] max-h-[85vh]">
            
            {/* Header bar matching branding */}
            <div className="bg-[#701484] text-white p-4.5 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-xs uppercase tracking-wider">
                {privacyModalType === 'privacy' ? 'CBE Privacy Policy' : 'CBE Terms & Conditions'}
              </h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable body contents */}
            <div className="flex-1 p-6 overflow-y-auto text-left space-y-4 text-xs font-medium text-slate-600 leading-relaxed">
              {privacyModalType === 'privacy' ? (
                <>
                  <p className="font-bold text-slate-800 text-sm">Commercial Bank of Ethiopia (CBE)</p>
                  <p>
                    Commercial Bank of Ethiopia is highly committed to protecting and respecting your personal privacy. This Mobile Banking Privacy Policy outlines how your confidential personal information and secure transactions are safeguarded.
                  </p>
                  <h4 className="font-bold text-[#701484] pt-1">1. Local Device Security</h4>
                  <p>
                    Your personal identification number (PIN), biometric facial templates, fingerprint configurations, and passphrases are stored strictly in an encrypted secure enclave on your local physical device. CBE never transmits, accesses, or saves these variables on our remote servers.
                  </p>
                  <h4 className="font-bold text-[#701484] pt-1">2. Secure Transaction Ledger</h4>
                  <p>
                    To execute secure funds transfer (including Peer-to-Peer, utility bill pay, airtime top-up, and cash-out requests), our backend utilizes industry-grade end-to-end encryption protocols.
                  </p>
                  <h4 className="font-bold text-[#701484] pt-1">3. Third-Party Access</h4>
                  <p>
                    CBE does not sell, lease, or distribute your private account details, balance logs, or contact records to any unauthorized third-party marketing entities.
                  </p>
                  <p className="text-[10px] text-slate-400 italic pt-2">
                    Last updated: October 2026. Commercial Bank of Ethiopia. All Rights Reserved.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-slate-800 text-sm">CBE Mobile Banking Terms & Conditions</p>
                  <p>
                    Welcome to the Commercial Bank of Ethiopia (CBE) mobile banking service application. By accessing or executing financial transactions on this platform, you agree to comply with the legal clauses listed below.
                  </p>
                  <h4 className="font-bold text-[#701484] pt-1">1. User Security Obligation</h4>
                  <p>
                    The authorized account owner is solely responsible for maintaining the confidentiality of their 4-digit mobile transaction PIN and secure login passphrase. You must not share your credential keys with third parties under any circumstances.
                  </p>
                  <h4 className="font-bold text-[#701484] pt-1">2. Authorized Transactions</h4>
                  <p>
                    All successful financial transactions executed via your local device biometric check or verified PIN entry shall be deemed authorized and non-reversible. Please verify beneficiary names and bank account numbers prior to confirming transfers.
                  </p>
                  <h4 className="font-bold text-[#701484] pt-1">3. System Service Limits</h4>
                  <p>
                    For cardless ATM withdrawals and transfer limits, a single-transaction limit of 10,000 ETB and a daily limit of 50,000 ETB are strictly enforced.
                  </p>
                  <p className="text-[10px] text-slate-400 italic pt-2">
                    Last updated: October 2026. Commercial Bank of Ethiopia. All Rights Reserved.
                  </p>
                </>
              )}
            </div>

            {/* Sticky footer button */}
            <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-6 py-2.5 bg-[#701484] hover:bg-[#620d69] text-white font-extrabold text-[11px] rounded-xl cursor-pointer"
              >
                Close & Return
              </button>
            </div>

          </div>
        </div>
      )}
      {/* iOS Installation Guide Overlay */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#701484] p-6 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <img src="/cbe_logo.png" className="w-12 h-12 object-contain" alt="CBE Logo" />
              </div>
              <h3 className="text-white font-black text-lg">Install on iPhone</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-[#701484] flex items-center justify-center font-black shrink-0">1</div>
                <p className="text-slate-600 text-sm font-bold pt-1">
                  Tap the <span className="text-[#701484]">Share</span> button in the bottom Safari toolbar.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-[#701484] flex items-center justify-center font-black shrink-0">2</div>
                <p className="text-slate-600 text-sm font-bold pt-1">
                  Scroll down and tap <span className="text-[#701484]">Add to Home Screen</span>.
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-4 bg-[#701484] text-white font-black rounded-2xl shadow-xl shadow-purple-200 active:scale-95 transition-transform"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
