export type TransferMode = 'cbe_to_cbe' | 'other_banks' | 'cbe_birr' | 'airtime';

export interface CbeAccount {
  id: string;
  nameEn: string;
  nameAm: string;
  accountNumber: string;
  accountTypeEn: string;
  accountTypeAm: string;
  balance: number;
  currency: string;
  isPrimary?: boolean;
}

export type TransactionType = 'inflow' | 'outflow' | 'transfer';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'reversed';

export type BankId = 'cbe' | 'telebirr' | 'awash' | 'dashen' | 'boa' | 'abyssinia' | 'coop' | 'hibret' | 'nib' | 'wegagen' | 'rigged';

export type TransactionCategory =
  | 'CBE to CBE Transfer'
  | 'Other Bank Transfer'
  | 'Telebirr Transfer'
  | 'Airtime Topup'
  | 'Salary & Inward'
  | 'Utility Bill'
  | 'Merchant QR'
  | 'ATM Withdrawal'
  | 'Service Charge'
  | 'Shopping'
  | 'Transfer'
  | 'Food & Dining'
  | 'Airtime'
  | 'Utility'
  | 'Salary'
  | 'Bill Payment'
  | 'Fee'
  | 'Refund'
  | 'Savings';

export interface Transaction {
  id: string; // e.g. "FT260982736154"
  referenceNumber: string;
  transferMode: TransferMode | 'general';
  accountId: string;
  senderName: string;
  senderAccount: string;
  receiverName: string;
  receiverAccount: string;
  receiverBank: string;
  amount: number;
  fee: number;
  vat: number;
  currency: 'ETB' | 'USD';
  type: TransactionType;
  category: TransactionCategory;
  timestamp: string; // ISO string
  status: TransactionStatus;
  note: string;
  branchName?: string;
  payerPhone?: string;
  payeePhone?: string;
  rawSms?: string;
  hash: string;
  channel: 'CBE Mobile App' | 'CBE Birr' | 'Internet Banking' | 'USSD *889#' | 'EthSwitch';
}

export interface VerifiedBeneficiary {
  accountNumber: string;
  fullName: string;
  fullNameAm: string;
  bankName: string;
  phone?: string;
  avatar?: string;
}

export interface ParsedSmsResult {
  bankId: string;
  amount: number;
  referenceNumber: string;
  type: TransactionType;
  partyName: string;
  partyAccount: string;
  balanceAfter?: number;
  fee?: number;
  dateStr?: string;
  channel?: string;
  category: TransactionCategory;
}

export type Language = 'am' | 'en';
