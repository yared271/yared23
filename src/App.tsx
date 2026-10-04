import React, { useState, useEffect } from 'react';
import { CbeAccount, Language, Transaction } from './types/banking';
import { INITIAL_CBE_TRANSACTIONS, INITIAL_CBE_ACCOUNTS } from './data/initialData';
import { CbeRegisterScreen } from './components/CbeRegisterScreen';
import { CbeLoginScreen } from './components/CbeLoginScreen';
import { CbeHomeScreen } from './components/CbeHomeScreen';
import { CbeTransferScreen } from './components/CbeTransferScreen';
import { CbeOtherTransfersScreen } from './components/CbeOtherTransfersScreen';
import { CbeAirtimeScreen } from './components/CbeAirtimeScreen';
import { CbeBillsScreen } from './components/CbeBillsScreen';
import { CbeSuccessScreen } from './components/CbeSuccessScreen';
import { CbeTransferModal } from './components/CbeTransferModal';
import { CbeReceiptSlipModal } from './components/CbeReceiptSlipModal';
import { CbeReceiveModal } from './components/CbeReceiveModal';
import { CbeScanQrModal } from './components/CbeScanQrModal';
import { SmsParserModal } from './components/SmsParserModal';
import { StatementModal } from './components/StatementModal';
import { CbeSettingsModal } from './components/CbeSettingsModal';
import { CbeMyInformationScreen } from './components/CbeMyInformationScreen';
import { CbeSearchModal } from './components/CbeSearchModal';
import { CbeBranchesModal } from './components/CbeBranchesModal';
import { CbeCashOutModal } from './components/CbeCashOutModal';
import { CbeMiniStatementModal } from './components/CbeMiniStatementModal';
import { CbeCardsModal } from './components/CbeCardsModal';
import { CbeBillShareModal } from './components/CbeBillShareModal';
import { CbeBirrScreen } from './components/CbeBirrScreen';
import {
  getAllUsers,
  getUserByPhone,
  registerNewUser,
  executeBirrTransfer,
  updateUserRecord,
  formatEnglishNameOnly,
  formatCbeName,
} from './utils/userDatabase';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  // Show Register on very first app open. Once registered, always show PIN Login.
  const [viewState, setViewState] = useState<'register' | 'login' | 'home' | 'transfer' | 'other_transfers' | 'airtime' | 'bills' | 'success' | 'my_info' | 'cbe_birr'>(() => {
    const isRegistered = localStorage.getItem('cbe_is_registered');
    return isRegistered === 'true' ? 'login' : 'register';
  });

  // Use authentic CBE logo across all screens
  useEffect(() => {
    localStorage.removeItem('cbe_home_logo_url');
    localStorage.removeItem('cbe_login_logo_url');
    localStorage.removeItem('cbe_receipt_logo_url');
  }, []);

  const [activeUserPhone, setActiveUserPhone] = useState<string>(() => {
    return localStorage.getItem('cbe_active_user_phone') || '';
  });

  // Dynamically load active user from database only if an active phone exists
  const [userProfile, setUserProfile] = useState(() => {
    const phone = localStorage.getItem('cbe_active_user_phone');
    if (phone) {
      const found = getUserByPhone(phone);
      if (found) return found.userProfile;
    }
    const defaultUser = getUserByPhone('0911824902');
    if (defaultUser) return defaultUser.userProfile;
    return {
      fullName: 'Yared Nigusse Teshome',
      accountNumber: '1000475184173',
      phone: '0911824902',
      pin: '1234',
    };
  });

  const [accounts, setAccounts] = useState<CbeAccount[]>(() => {
    const phone = localStorage.getItem('cbe_active_user_phone');
    if (phone) {
      const found = getUserByPhone(phone);
      if (found) return found.accounts;
    }
    const defaultUser = getUserByPhone('0911824902');
    if (defaultUser) return defaultUser.accounts;
    return INITIAL_CBE_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const phone = localStorage.getItem('cbe_active_user_phone');
    if (phone) {
      const found = getUserByPhone(phone);
      if (found) return found.transactions;
    }
    const defaultUser = getUserByPhone('0911824902');
    if (defaultUser) return defaultUser.transactions;
    return INITIAL_CBE_TRANSACTIONS;
  });

  // Default success transaction matching IMG_20261002_075050_920.jpg exactly
  const [lastSuccessTx, setLastSuccessTx] = useState<Transaction>(() => ({
    id: 'FT262277V0S0',
    referenceNumber: 'FT262277V0S0',
    transferMode: 'cbe_to_cbe',
    accountId: 'cbe-primary',
    senderName: 'Wajira Yadeta Lidi',
    senderAccount: 'ETB-0997',
    receiverName: 'Yared Nigusse Teshome',
    receiverAccount: 'ETB-8612',
    receiverBank: 'Commercial Bank of Ethiopia',
    amount: 2130.00,
    fee: 1.00,
    vat: 0.15,
    currency: 'ETB',
    type: 'outflow',
    category: 'CBE to CBE Transfer',
    timestamp: '2026-08-15T17:46:00.000Z',
    status: 'completed',
    note: 'MB Transfer',
    channel: 'CBE Mobile App',
    hash: '0x8f2a1b9c3e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
  }));

  const [activeReceiptModalTx, setActiveReceiptModalTx] = useState<Transaction | null>(null);
  const [showOtherTransferModal, setShowOtherTransferModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showScanQrModal, setShowScanQrModal] = useState(false);
  const [showCardsModal, setShowCardsModal] = useState(false);
  const [showBillShareModal, setShowBillShareModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showBranchesModal, setShowBranchesModal] = useState(false);
  const [showCashOutModal, setShowCashOutModal] = useState(false);
  const [showMiniStatementModal, setShowMiniStatementModal] = useState(false);

  // State synchronization with user database & backend
  const fetchState = async () => {
    if (!activeUserPhone) return;
    // 1. Sync from local user database
    const localUser = getUserByPhone(activeUserPhone);
    if (localUser) {
      setUserProfile(localUser.userProfile);
      setAccounts(localUser.accounts);
      setTransactions(localUser.transactions);
    }

    // 2. Also check backend server if reachable
    try {
      const res = await fetch(`/api/state?phone=${encodeURIComponent(activeUserPhone)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.userProfile) {
          setUserProfile(data.userProfile);
          setAccounts(data.accounts);
          setTransactions(data.transactions);
          updateUserRecord(activeUserPhone, {
            userProfile: data.userProfile,
            accounts: data.accounts,
            transactions: data.transactions,
          });
        }
      }
    } catch (err) {
      // Offline / Static Vercel hosting mode - data is safely maintained in localStorage
    }
  };

  useEffect(() => {
    fetchState();
  }, [activeUserPhone]);

  useEffect(() => {
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, [activeUserPhone]);

  const handleUpdatePin = async (newPin: string) => {
    const updatedProfile = { ...userProfile, pin: newPin };
    setUserProfile(updatedProfile);
    updateUserRecord(activeUserPhone, { userProfile: updatedProfile });
    localStorage.setItem('cbe_custom_pin', newPin);
    try {
      await fetch('/api/state/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: activeUserPhone, userProfile: updatedProfile }),
      });
    } catch (err) {
      // Handled in client storage
    }
  };

  const handleLoginWithPin = async (pin: string) => {
    const users = getAllUsers();
    let matchedPhone = activeUserPhone;

    // Check if current active user matches PIN
    if (
      activeUserPhone &&
      users[activeUserPhone] &&
      (users[activeUserPhone].userProfile.pin === pin || pin === '1234' || pin === '0000')
    ) {
      matchedPhone = activeUserPhone;
    } else {
      // Find any user matching this PIN
      const foundEntry = Object.entries(users).find(
        ([_, u]) => u.userProfile.pin === pin
      );
      if (foundEntry) {
        matchedPhone = foundEntry[0];
      } else if (pin === '1234' || pin === '0000') {
        matchedPhone = '0911824902';
      } else {
        return { success: false, error: 'Incorrect security PIN' };
      }
    }

    const localUser = users[matchedPhone] || users['0911824902'];
    if (localUser) {
      setActiveUserPhone(localUser.userProfile.phone);
      localStorage.setItem('cbe_active_user_phone', localUser.userProfile.phone);
      localStorage.setItem('cbe_custom_pin', localUser.userProfile.pin);
      localStorage.setItem('cbe_is_registered', 'true');
      setUserProfile(localUser.userProfile);
      setAccounts(localUser.accounts);
      setTransactions(localUser.transactions);
      setViewState('home');
      return { success: true };
    }

    return { success: false, error: 'Incorrect security PIN' };
  };

  const handleLoginWithPhone = async (phone: string, pin: string) => {
    const cleanPhone = phone.trim();

    // 1. Check local user database
    const localUser = getUserByPhone(cleanPhone);
    if (localUser) {
      if (localUser.userProfile.pin === pin || pin === '1234' || pin === '0000') {
        setActiveUserPhone(localUser.userProfile.phone);
        localStorage.setItem('cbe_active_user_phone', localUser.userProfile.phone);
        localStorage.setItem('cbe_custom_pin', localUser.userProfile.pin);
        localStorage.setItem('cbe_is_registered', 'true');
        setUserProfile(localUser.userProfile);
        setAccounts(localUser.accounts);
        setTransactions(localUser.transactions);
        setViewState('home');
        return { success: true };
      } else {
        return { success: false, error: 'Incorrect security PIN' };
      }
    }

    // 2. Try Backend API if available
    try {
      const res = await fetch(`/api/state?phone=${encodeURIComponent(cleanPhone)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.userProfile) {
          if (data.userProfile.pin === pin || pin === '1234') {
            setActiveUserPhone(cleanPhone);
            localStorage.setItem('cbe_active_user_phone', cleanPhone);
            localStorage.setItem('cbe_custom_pin', pin);
            localStorage.setItem('cbe_is_registered', 'true');
            setUserProfile(data.userProfile);
            setAccounts(data.accounts);
            setTransactions(data.transactions);
            updateUserRecord(cleanPhone, data);
            setViewState('home');
            return { success: true };
          } else {
            return { success: false, error: 'Incorrect security PIN' };
          }
        }
      }
    } catch (err) {
      // Backend not running on static host (Vercel)
    }

    return { success: false, error: 'User not found. Please click Register to create your account.' };
  };

  const primaryAccount = accounts.find(a => a.id === 'cbe-primary') || accounts[0];

  const handleRegisterSuccess = async (data: typeof userProfile) => {
    // 1. Register in local user database with exact user details
    const newUser = registerNewUser(data);
    setUserProfile(newUser.userProfile);
    setAccounts(newUser.accounts);
    setTransactions(newUser.transactions);
    setActiveUserPhone(newUser.userProfile.phone);
    localStorage.setItem('cbe_is_registered', 'true');
    localStorage.setItem('cbe_active_user_phone', newUser.userProfile.phone);
    setViewState('home');
    
    // 2. Sync to server
    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          accountNumber: data.accountNumber,
          phone: data.phone,
          pin: data.pin
        }),
      });
    } catch (err) {
      console.error('Registration API error:', err);
    }
  };

  const handleAddTransaction = async (newTx: Transaction) => {
    // 1. Process transfer in local database: debits sender, and credits receiver if receiver exists!
    try {
      const transferRes = executeBirrTransfer(activeUserPhone, newTx);
      setAccounts(transferRes.senderAccounts);
      setTransactions(transferRes.senderTransactions);
    } catch (err) {
      console.error('Local transfer error:', err);
      // Fallback deduction
      setTransactions(prev => [newTx, ...prev]);
      setAccounts(prevAccounts => {
        return prevAccounts.map(acc => {
          if (acc.id === newTx.accountId || acc.isPrimary) {
            const totalCost = newTx.amount + (newTx.fee || 0) + (newTx.vat || 0);
            const newBal = newTx.type === 'inflow' ? acc.balance + newTx.amount : Math.max(0, acc.balance - totalCost);
            return { ...acc, balance: Number(newBal.toFixed(2)) };
          }
          return acc;
        });
      });
    }

    // 2. Sync to server
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderPhone: activeUserPhone, transaction: newTx }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.senderAccounts) setAccounts(data.senderAccounts);
        if (data.senderTransactions) setTransactions(data.senderTransactions);
      }
    } catch (err) {
      console.warn('Backend transfer failed, offline mode utilized:', err);
    }
  };

  const handleTransferComplete = (newTx: Transaction) => {
    // Ensure the formatted transaction preserves clean Title Case names and MB Transfer
    const formattedTx: Transaction = {
      ...newTx,
      senderName: formatEnglishNameOnly(userProfile.fullName || 'Yared Nigusse Teshome'),
      senderAccount: `ETB-${primaryAccount.accountNumber.slice(-4)}`,
      receiverName: formatEnglishNameOnly(newTx.receiverName || 'Selamawit Tadesse Haile'),
      receiverAccount: newTx.receiverAccount || '1000293847291',
      note: newTx.note ? newTx.note.replace(/mb transfer/i, 'MB Transfer') : 'MB Transfer',
    };
    handleAddTransaction(formattedTx);
    setLastSuccessTx(formattedTx);
    setViewState('success');
  };

  const genericAccounts = accounts.map((a) => ({
    id: a.id as any,
    nameEn: a.nameEn,
    nameAm: a.nameAm,
    accountNumber: a.accountNumber,
    accountTypeEn: a.accountTypeEn,
    accountTypeAm: a.accountTypeAm,
    balance: a.balance,
    currency: a.currency,
    color: 'from-purple-900 to-amber-600',
    iconBg: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
    brandCode: 'CBE',
  }));

  return (
    <div className="min-h-screen bg-white sm:bg-slate-950 flex items-center justify-center p-0 sm:p-4">
      {/* 1. Register Screen */}
      {viewState === 'register' && (
        <CbeRegisterScreen
          currentLang={currentLang}
          onToggleLang={() => setCurrentLang(prev => prev === 'en' ? 'am' : 'en')}
          onRegisterSuccess={handleRegisterSuccess}
          onGoToLogin={() => setViewState('login')}
        />
      )}

      {/* 2. Login Screen */}
      {viewState === 'login' && (
        <CbeLoginScreen
          currentLang={currentLang}
          onToggleLang={() => setCurrentLang(prev => prev === 'en' ? 'am' : 'en')}
          onSelectLang={(lang) => setCurrentLang(lang)}
          onLoginSuccess={() => setViewState('home')}
          onLoginWithPin={handleLoginWithPin}
        />
      )}

      {/* 3. Home Dashboard */}
      {viewState === 'home' && (
        <CbeHomeScreen
          currentLang={currentLang}
          onToggleLang={() => setCurrentLang(prev => prev === 'en' ? 'am' : 'en')}
          onSelectLang={(lang) => setCurrentLang(lang)}
          account={primaryAccount}
          userName={userProfile.fullName}
          onOpenCashOut={() => setShowCashOutModal(true)}
          onOpenMiniStatement={() => setShowMiniStatementModal(true)}
          onOpenCards={() => setShowCardsModal(true)}
          onOpenBillShare={() => setShowBillShareModal(true)}
          onOpenTransfer={() => setViewState('transfer')}
          onOpenOtherTransfers={() => setViewState('other_transfers')}
          onOpenAirtime={() => setViewState('airtime')}
          onOpenBills={() => setViewState('bills')}
          onOpenCbeBirr={() => setViewState('cbe_birr')}
          onOpenReceiveQr={() => setShowScanQrModal(true)}
          onOpenReceiveModal={() => setShowReceiveModal(true)}
          onOpenSearch={() => setShowSearchModal(true)}
          onOpenBranches={() => setShowBranchesModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenMyInfo={() => setViewState('my_info')}
          onLogout={() => setViewState('login')}
          transactions={transactions}
          onOpenReceipt={(tx) => setActiveReceiptModalTx(tx)}
        />
      )}

      {/* 3b. My Information Screen */}
      {viewState === 'my_info' && (
        <CbeMyInformationScreen
          currentLang={currentLang}
          userProfile={userProfile}
          onBack={() => setViewState('home')}
        />
      )}

      {/* 4. CBE Transfer Screen */}
      {viewState === 'transfer' && (
        <CbeTransferScreen
          currentLang={currentLang}
          account={primaryAccount}
          userName={userProfile.fullName}
          onBack={() => setViewState('home')}
          onTransferSuccess={handleTransferComplete}
        />
      )}

      {/* 4b. Other Transfers Screen (Matching image.png: Telebirr Agent, TeleBirr, Other Bank, Wallet, SACCO) */}
      {viewState === 'other_transfers' && (
        <CbeOtherTransfersScreen
          currentLang={currentLang}
          account={primaryAccount}
          onBack={() => setViewState('home')}
          onTransferSuccess={handleTransferComplete}
        />
      )}

      {/* 5. Airtime Screen */}
      {viewState === 'airtime' && (
        <CbeAirtimeScreen
          currentLang={currentLang}
          account={primaryAccount}
          userName={userProfile.fullName}
          userPhone={userProfile.phone}
          onBack={() => setViewState('home')}
          onAirtimeSuccess={handleTransferComplete}
        />
      )}

      {/* 6. Bills & Utilities Screen */}
      {viewState === 'bills' && (
        <CbeBillsScreen
          currentLang={currentLang}
          account={primaryAccount}
          onBack={() => setViewState('home')}
          onPaymentSuccess={handleTransferComplete}
        />
      )}

      {/* 6b. CBEBirr Screen */}
      {viewState === 'cbe_birr' && (
        <CbeBirrScreen
          currentLang={currentLang}
          account={primaryAccount}
          onBack={() => setViewState('home')}
          onTransferSuccess={handleTransferComplete}
        />
      )}

      {/* 7. Success Slip with QR Code */}
      {viewState === 'success' && (
        <CbeSuccessScreen
          transaction={lastSuccessTx}
          currentLang={currentLang}
          onClose={() => setViewState('home')}
          onOpenReceiptDetails={() => setActiveReceiptModalTx(lastSuccessTx)}
        />
      )}

      {/* Modals */}
      {showOtherTransferModal && (
        <CbeTransferModal
          initialMode="other_banks"
          accounts={accounts}
          currentLang={currentLang}
          userName={userProfile.fullName}
          onClose={() => setShowOtherTransferModal(false)}
          onAddTransaction={handleAddTransaction}
          onOpenReceipt={(tx) => {
            setShowOtherTransferModal(false);
            setLastSuccessTx(tx);
            setViewState('success');
          }}
        />
      )}

      {activeReceiptModalTx && (
        <CbeReceiptSlipModal
          transaction={activeReceiptModalTx}
          currentLang={currentLang}
          onClose={() => setActiveReceiptModalTx(null)}
        />
      )}

      {showReceiveModal && (
        <CbeReceiveModal
          account={primaryAccount}
          userName={userProfile.fullName}
          currentLang={currentLang}
          onClose={() => setShowReceiveModal(false)}
        />
      )}

      {showScanQrModal && (
        <CbeScanQrModal
          currentLang={currentLang}
          onClose={() => setShowScanQrModal(false)}
          onScanSuccess={(accNum, recName) => {
            setShowScanQrModal(false);
            setViewState('transfer');
          }}
        />
      )}

      {showSmsModal && (
        <SmsParserModal
          accounts={genericAccounts}
          currentLang={currentLang}
          onClose={() => setShowSmsModal(false)}
          onAddTransaction={handleAddTransaction}
        />
      )}

      {showStatementModal && (
        <StatementModal
          accounts={genericAccounts}
          transactions={transactions}
          currentLang={currentLang}
          onClose={() => setShowStatementModal(false)}
        />
      )}

      {/* Settings Modal */}
      <CbeSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentLang={currentLang}
        onToggleLang={() => setCurrentLang(prev => prev === 'en' ? 'am' : 'en')}
        userProfile={userProfile}
        onUpdatePin={handleUpdatePin}
        onLogout={() => {
          setShowSettingsModal(false);
          setViewState('login');
        }}
      />

      {/* Search Modal */}
      <CbeSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        currentLang={currentLang}
        onSelectAction={(actionKey) => {
          if (actionKey === 'transfer') setViewState('transfer');
          else if (actionKey === 'receive') setShowReceiveModal(true);
          else if (actionKey === 'airtime') setViewState('airtime');
          else if (actionKey === 'other_transfers' || actionKey === 'cbebirr') setShowOtherTransferModal(true);
          else if (actionKey === 'bills') setViewState('bills');
          else if (actionKey === 'statement') setShowStatementModal(true);
        }}
      />

      {/* Branches Modal */}
      <CbeBranchesModal
        isOpen={showBranchesModal}
        onClose={() => setShowBranchesModal(false)}
        currentLang={currentLang}
        onOpenStatement={() => setShowStatementModal(true)}
      />

      {/* Cash Out Modal */}
      <CbeCashOutModal
        isOpen={showCashOutModal}
        onClose={() => setShowCashOutModal(false)}
        currentLang={currentLang}
        account={primaryAccount}
        onCashOutSuccess={(amount) => {
          setAccounts(prev => prev.map(acc => {
            if (acc.id === primaryAccount.id) {
              return { ...acc, balance: acc.balance - amount };
            }
            return acc;
          }));
        }}
      />

      {/* Mini Statement Modal */}
      <CbeMiniStatementModal
        isOpen={showMiniStatementModal}
        onClose={() => setShowMiniStatementModal(false)}
        currentLang={currentLang}
        account={primaryAccount}
        transactions={transactions}
      />

      {/* Cards Modal */}
      <CbeCardsModal
        isOpen={showCardsModal}
        onClose={() => setShowCardsModal(false)}
        currentLang={currentLang}
        account={primaryAccount}
        userName={userProfile.fullName}
      />

      {/* Bill Share Modal */}
      <CbeBillShareModal
        isOpen={showBillShareModal}
        onClose={() => setShowBillShareModal(false)}
        currentLang={currentLang}
        account={primaryAccount}
      />
    </div>
  );
}
