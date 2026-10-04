import { CbeAccount, Transaction } from '../types/banking';
import { INITIAL_CBE_TRANSACTIONS } from '../data/initialData';

export interface UserRecord {
  userProfile: {
    fullName: string;
    accountNumber: string;
    phone: string;
    pin: string;
  };
  accounts: CbeAccount[];
  transactions: Transaction[];
}

export function toTitleCaseEnglish(name: string): string {
  if (!name) return 'CBE Customer';
  // 1. Remove anything in parentheses, e.g. "(ያሬድ ንጉሴ)" or "(KALEB ZEWEDU WOLDESENBET)"
  let cleaned = name.replace(/\([^)]*\)/g, '');
  // 2. Remove any Ethiopic / Amharic characters
  cleaned = cleaned.replace(/[\u1200-\u137F]/g, '');
  // 3. Remove punctuation / numbers / symbols except letters, hyphens, apostrophes and spaces
  cleaned = cleaned.replace(/[^a-zA-Z\s'-]/g, ' ');
  // 4. Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  if (!cleaned) return 'CBE Customer';

  // 5. Convert each word to Title Case: only first letter capitalized, rest lowercase
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      if (word.length <= 1) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export function formatCbeName(name: string): string {
  return toTitleCaseEnglish(name);
}

export function formatEnglishNameOnly(name: string): string {
  return toTitleCaseEnglish(name);
}

const STORAGE_KEY = 'cbe_users_database_v7';
const ACTIVE_PHONE_KEY = 'cbe_active_user_phone';
const IS_REGISTERED_KEY = 'cbe_is_registered';

const DEFAULT_USERS: Record<string, UserRecord> = {
  "0911824902": {
    userProfile: {
      fullName: 'Yared Nigusse Teshome',
      accountNumber: '1000475184173',
      phone: '0911824902',
      pin: '1234',
    },
    accounts: [
      {
        id: 'cbe-primary',
        nameEn: 'CBE Saving Account',
        nameAm: 'የኢትዮጵያ ንግድ ባንክ የቁጠባ ሒሳብ',
        accountNumber: '1000475184173',
        accountTypeEn: 'Saving Account - 1*********4173',
        accountTypeAm: 'የቁጠባ ሒሳብ - 1*********4173',
        balance: 5000000.00, // 5 Million ETB for Yared
        currency: 'ETB',
        isPrimary: true,
      },
      {
        id: 'cbe-birr',
        nameEn: 'CBE Birr Wallet',
        nameAm: 'ንግድ ባንክ ብር (CBE Birr)',
        accountNumber: '0911824902',
        accountTypeEn: 'Mobile Wallet Account',
        accountTypeAm: 'የሞባይል ዋሌት ሒሳብ',
        balance: 14820.50,
        currency: 'ETB',
        isPrimary: false,
      },
    ],
    transactions: INITIAL_CBE_TRANSACTIONS,
  },
  "0912345678": {
    userProfile: {
      fullName: 'Abebe Kebede Wolde',
      accountNumber: '1000348291111',
      phone: '0912345678',
      pin: '1111',
    },
    accounts: [
      {
        id: 'cbe-primary',
        nameEn: 'CBE Saving Account',
        nameAm: 'የኢትዮጵያ ንግድ ባንክ የቁጠባ ሒሳብ',
        accountNumber: '1000348291111',
        accountTypeEn: 'Saving Account - 1*********1111',
        accountTypeAm: 'የቁጠባ ሒሳብ - 1*********1111',
        balance: 1000000.00, // 1 Million ETB for customers
        currency: 'ETB',
        isPrimary: true,
      },
      {
        id: 'cbe-birr',
        nameEn: 'CBE Birr Wallet',
        nameAm: 'ንግድ ባንክ ብር (CBE Birr)',
        accountNumber: '0912345678',
        accountTypeEn: 'Mobile Wallet Account',
        accountTypeAm: 'የሞባይል ዋሌት ሒሳብ',
        balance: 14820.50,
        currency: 'ETB',
        isPrimary: false,
      },
    ],
    transactions: [],
  }
};

export function getAllUsers(): Record<string, UserRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_USERS, ...parsed };
      }
    }
  } catch (e) {
    console.error('Failed to load user database from localStorage', e);
  }
  return { ...DEFAULT_USERS };
}

export function saveUsers(users: Record<string, UserRecord>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save user database to localStorage', e);
  }
}

export function getUserByPhone(phone: string): UserRecord | null {
  const users = getAllUsers();
  const clean = phone.trim().replace(/\D/g, '');
  for (const pKey of Object.keys(users)) {
    const cleanKey = pKey.replace(/\D/g, '');
    if (cleanKey === clean || (clean.length >= 9 && cleanKey.endsWith(clean.slice(-9)))) {
      return users[pKey];
    }
  }
  return null;
}

export function findUserByAccountOrPhone(identifier: string): UserRecord | null {
  const users = getAllUsers();
  const clean = identifier.trim().replace(/\D/g, '');
  if (!clean) return null;

  for (const pKey of Object.keys(users)) {
    const user = users[pKey];
    const userAcc = user.userProfile.accountNumber.replace(/\D/g, '');
    const userPhone = user.userProfile.phone.replace(/\D/g, '');

    if (userAcc === clean || userPhone === clean) {
      return user;
    }
    if (clean.length >= 9 && (userAcc.endsWith(clean.slice(-9)) || userPhone.endsWith(clean.slice(-9)))) {
      return user;
    }
  }
  return null;
}

export function registerNewUser(profile: {
  fullName: string;
  accountNumber: string;
  phone: string;
  pin: string;
}): UserRecord {
  const users = getAllUsers();
  const cleanPhone = profile.phone.trim();
  const cleanAccount = profile.accountNumber.trim();
  const startingBalance = cleanPhone.replace(/\D/g, '') === '0911824902' ? 5000000.00 : 1000000.00;

  const newUser: UserRecord = {
    userProfile: {
      fullName: profile.fullName.trim(),
      accountNumber: cleanAccount,
      phone: cleanPhone,
      pin: profile.pin.trim(),
    },
    accounts: [
      {
        id: 'cbe-primary',
        nameEn: 'CBE Saving Account',
        nameAm: 'የኢትዮጵያ ንግድ ባንክ የቁጠባ ሒሳብ',
        accountNumber: cleanAccount,
        accountTypeEn: `Saving Account - 1*********${cleanAccount.slice(-4)}`,
        accountTypeAm: `የቁጠባ ሒሳብ - 1*********${cleanAccount.slice(-4)}`,
        balance: startingBalance,
        currency: 'ETB',
        isPrimary: true,
      },
      {
        id: 'cbe-birr',
        nameEn: 'CBE Birr Wallet',
        nameAm: 'ንግድ ባንክ ብር (CBE Birr)',
        accountNumber: cleanPhone,
        accountTypeEn: 'Mobile Wallet Account',
        accountTypeAm: 'የሞባይል ዋሌት ሒሳብ',
        balance: 14820.50,
        currency: 'ETB',
        isPrimary: false,
      }
    ],
    transactions: [],
  };

  users[cleanPhone] = newUser;
  saveUsers(users);

  localStorage.setItem(ACTIVE_PHONE_KEY, cleanPhone);
  localStorage.setItem(IS_REGISTERED_KEY, 'true');
  localStorage.setItem('cbe_user_full_name', newUser.userProfile.fullName);
  localStorage.setItem('cbe_custom_pin', newUser.userProfile.pin);

  return newUser;
}

export function updateUserRecord(phone: string, updates: Partial<UserRecord>): UserRecord | null {
  const users = getAllUsers();
  const user = getUserByPhone(phone);
  if (!user) return null;

  const key = user.userProfile.phone;
  const updatedUser: UserRecord = {
    ...user,
    ...updates,
    userProfile: updates.userProfile || user.userProfile,
    accounts: updates.accounts || user.accounts,
    transactions: updates.transactions || user.transactions,
  };

  users[key] = updatedUser;
  saveUsers(users);
  return updatedUser;
}

export function executeBirrTransfer(
  senderPhone: string,
  transaction: Transaction
): {
  success: boolean;
  senderAccounts: CbeAccount[];
  senderTransactions: Transaction[];
  receiverFound: boolean;
  receiverName?: string;
} {
  const users = getAllUsers();
  const sender = getUserByPhone(senderPhone);
  
  if (!sender) {
    throw new Error('Sender account not found');
  }

  const amount = Number(transaction.amount);
  const totalCost = amount + (transaction.fee || 0) + (transaction.vat || 0);

  // 1. Deduct from sender's account
  const updatedSenderAccounts = sender.accounts.map((acc) => {
    if (acc.id === transaction.accountId || acc.isPrimary) {
      const newBal = Math.max(0, acc.balance - totalCost);
      return { ...acc, balance: Number(newBal.toFixed(2)) };
    }
    return acc;
  });

  const senderTx: Transaction = {
    ...transaction,
    type: 'outflow',
    timestamp: new Date().toISOString(),
  };

  const updatedSenderTransactions = [senderTx, ...sender.transactions];
  sender.accounts = updatedSenderAccounts;
  sender.transactions = updatedSenderTransactions;
  users[sender.userProfile.phone] = sender;

  // 2. Check if receiver is a registered user
  const receiverUser = findUserByAccountOrPhone(transaction.receiverAccount);
  let receiverFound = false;
  let receiverName: string | undefined;

  if (receiverUser && receiverUser.userProfile.phone !== sender.userProfile.phone) {
    receiverFound = true;
    receiverName = receiverUser.userProfile.fullName;

    // Credit receiver's primary account
    receiverUser.accounts = receiverUser.accounts.map((acc) => {
      if (acc.id === 'cbe-primary' || acc.isPrimary) {
        const newBal = acc.balance + amount;
        return { ...acc, balance: Number(newBal.toFixed(2)) };
      }
      return acc;
    });

    // Create incoming transaction for receiver
    const receiverTx: Transaction = {
      ...transaction,
      id: `FT-IN-${Date.now().toString(36).toUpperCase()}`,
      referenceNumber: transaction.referenceNumber,
      senderName: sender.userProfile.fullName,
      senderAccount: `ETB-${sender.userProfile.accountNumber.slice(-4)}`,
      receiverName: receiverUser.userProfile.fullName,
      receiverAccount: `ETB-${receiverUser.userProfile.accountNumber.slice(-4)}`,
      type: 'inflow',
      category: 'CBE to CBE Transfer',
      timestamp: new Date().toISOString(),
      fee: 0,
      vat: 0,
      status: 'completed',
    };

    receiverUser.transactions = [receiverTx, ...receiverUser.transactions];
    users[receiverUser.userProfile.phone] = receiverUser;
  } else if (transaction.receiverAccount) {
    // If receiver is not yet registered in local database, auto-seed account so funds exist
    const cleanReceiver = transaction.receiverAccount.replace(/\D/g, '');
    if (cleanReceiver.length >= 9) {
      const isPhone = cleanReceiver.startsWith('09') || cleanReceiver.startsWith('07') || cleanReceiver.length === 10;
      const targetPhone = isPhone ? cleanReceiver : `09${cleanReceiver.slice(-8)}`;
      const targetAcc = isPhone ? `1000${cleanReceiver.slice(-9)}` : cleanReceiver;
      const newReceiverName = transaction.receiverName || 'CBE Customer';

      const newRecUser: UserRecord = {
        userProfile: {
          fullName: newReceiverName,
          accountNumber: targetAcc,
          phone: targetPhone,
          pin: '1234',
        },
        accounts: [
          {
            id: 'cbe-primary',
            nameEn: 'CBE Saving Account',
            nameAm: 'የኢትዮጵያ ንግድ ባንክ የቁጠባ ሒሳብ',
            accountNumber: targetAcc,
            accountTypeEn: `Saving Account - ${targetAcc.slice(0, 1)}*********${targetAcc.slice(-4)}`,
            accountTypeAm: `የቁጠባ ሒሳብ - ${targetAcc.slice(0, 1)}*********${targetAcc.slice(-4)}`,
            balance: amount,
            currency: 'ETB',
            isPrimary: true,
          }
        ],
        transactions: [
          {
            ...transaction,
            id: `FT-IN-${Date.now().toString(36).toUpperCase()}`,
            senderName: sender.userProfile.fullName,
            type: 'inflow',
            timestamp: new Date().toISOString(),
          }
        ]
      };
      users[targetPhone] = newRecUser;
      receiverFound = true;
      receiverName = newReceiverName;
    }
  }

  saveUsers(users);

  return {
    success: true,
    senderAccounts: updatedSenderAccounts,
    senderTransactions: updatedSenderTransactions,
    receiverFound,
    receiverName,
  };
}
