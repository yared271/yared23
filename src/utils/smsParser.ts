import { BankId, ParsedSmsResult, TransactionCategory, TransactionType } from '../types/banking';

export function parseEthiopianBankSms(text: string): ParsedSmsResult | null {
  if (!text || text.trim().length < 10) return null;

  const normalized = text.trim();
  let bankId: BankId = 'rigged';
  let type: TransactionType = 'outflow';
  let amount = 0;
  let referenceNumber = `REF-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  let partyName = 'Unknown Party';
  let partyAccount = 'N/A';
  let balanceAfter: number | undefined = undefined;
  let fee = 0;
  let category: TransactionCategory = 'Transfer';

  const lower = normalized.toLowerCase();

  // Identify Bank
  if (lower.includes('cbe') || lower.includes('commercial bank') || lower.includes('ንግድ ባንክ')) {
    bankId = 'cbe';
  } else if (lower.includes('telebirr') || lower.includes('ቴሌብር') || lower.includes('ethio telecom') || lower.includes('994')) {
    bankId = 'telebirr';
  } else if (lower.includes('awash') || lower.includes('አዋሽ')) {
    bankId = 'awash';
  } else if (lower.includes('abyssinia') || lower.includes('boa') || lower.includes('አቢሲኒያ') || lower.includes('apollo')) {
    bankId = 'abyssinia';
  } else if (lower.includes('dashen') || lower.includes('amole') || lower.includes('ዳሽን')) {
    bankId = 'dashen';
  } else if (lower.includes('rigged') || lower.includes('ሪግድ')) {
    bankId = 'rigged';
  }

  // Identify Type (inflow vs outflow)
  if (
    lower.includes('credited') ||
    lower.includes('received') ||
    lower.includes('deposited') ||
    lower.includes('ተቀብለዋል') ||
    lower.includes('ገቢ ሆኗል') ||
    lower.includes('ተጨምሯል') ||
    lower.includes('inward')
  ) {
    type = 'inflow';
  } else {
    type = 'outflow';
  }

  // Extract Amount (e.g., "ETB 3,500.00", "850.00 ETB", "3,500.00 Birr", "ብር 1,200.00")
  const amountMatch =
    normalized.match(/(?:ETB|etb|ብር|Birr|birr)\s*([\d,]+(?:\.\d{1,2})?)/i) ||
    normalized.match(/([\d,]+(?:\.\d{1,2})?)\s*(?:ETB|etb|ብር|Birr|birr)/i) ||
    normalized.match(/(?:transferred|paid|sent|credited|debited|received)\s*(?:ETB\s*)?([\d,]+(?:\.\d{1,2})?)/i);

  if (amountMatch && amountMatch[1]) {
    const cleanAmount = amountMatch[1].replace(/,/g, '');
    const parsed = parseFloat(cleanAmount);
    if (!isNaN(parsed) && parsed > 0) {
      amount = parsed;
    }
  }

  // Extract Reference / Transaction ID (e.g., "Ref: FT26093088219", "Transaction ID: TB99283410", "Txn: BOA8829104")
  const refMatch =
    normalized.match(/(?:Ref|Reference|Ref No|Txn Ref|Transaction ID|FT|Txn|ኮድ|ማጣቀሻ)[:\s]+([A-Za-z0-9_-]+)/i) ||
    normalized.match(/\b(FT[0-9A-Z]{8,14}|TB[0-9A-Z]{6,12}|AW[0-9A-Z]{6,12}|BOA[0-9A-Z]{6,12})\b/i);

  if (refMatch && refMatch[1]) {
    referenceNumber = refMatch[1];
  }

  // Extract Counterparty Name & Account
  const toPartyMatch = normalized.match(/(?:to|from|for)\s+([A-Za-z0-9\s&()'-]+?)(?:\s*\(([\d\w-]+)\)|\s+on\s+|\s+Ref|\s+Fee|\s+Transaction|\s+Txn|\.|$)/i);
  if (toPartyMatch && toPartyMatch[1] && toPartyMatch[1].trim().length > 2) {
    const rawName = toPartyMatch[1].trim();
    if (!rawName.toLowerCase().startsWith('account')) {
      partyName = rawName;
    }
    if (toPartyMatch[2]) {
      partyAccount = toPartyMatch[2].trim();
    }
  }

  // Extract Fee if available
  const feeMatch = normalized.match(/(?:Fee|Service Fee|ክፍያ)[:\s]*(?:ETB\s*)?([\d,]+(?:\.\d{1,2})?)/i);
  if (feeMatch && feeMatch[1]) {
    const cleanFee = feeMatch[1].replace(/,/g, '');
    const parsedFee = parseFloat(cleanFee);
    if (!isNaN(parsedFee)) {
      fee = parsedFee;
    }
  }

  // Extract Remaining Balance if available
  const balanceMatch =
    normalized.match(/(?:Available balance|Current balance|Remaining balance|Balance|ቀሪ ሒሳብ)[:\s]*(?:is\s*)?(?:ETB\s*)?([\d,]+(?:\.\d{1,2})?)/i) ||
    normalized.match(/(?:ETB\s*)?([\d,]+(?:\.\d{1,2})?)\s*(?:balance|ቀሪ ሒሳብ)/i);

  if (balanceMatch && balanceMatch[1]) {
    const cleanBal = balanceMatch[1].replace(/,/g, '');
    const parsedBal = parseFloat(cleanBal);
    if (!isNaN(parsedBal)) {
      balanceAfter = parsedBal;
    }
  }

  // Deduce Category
  if (lower.includes('coffee') || lower.includes('restaurant') || lower.includes('burger') || lower.includes('cafe')) {
    category = 'Food & Dining';
  } else if (lower.includes('airtime') || lower.includes('package') || lower.includes('ethio telecom') || lower.includes('ሞባይል ካርድ')) {
    category = 'Airtime';
  } else if (lower.includes('electric') || lower.includes('water') || lower.includes('utility') || lower.includes('መብራት') || lower.includes('ውሃ')) {
    category = 'Utility';
  } else if (lower.includes('supermarket') || lower.includes('store') || lower.includes('shop') || lower.includes('ሱቅ')) {
    category = 'Shopping';
  } else if (lower.includes('salary') || lower.includes('payroll') || lower.includes('ደመወዝ')) {
    category = 'Salary';
  } else if (lower.includes('qr') || lower.includes('merchant') || lower.includes('ነጋዴ')) {
    category = 'Merchant QR';
  } else {
    category = type === 'inflow' ? 'Transfer' : 'Bill Payment';
  }

  return {
    bankId,
    type,
    amount: amount || 500,
    referenceNumber,
    partyName: partyName || (type === 'inflow' ? 'Corporate Inflow' : 'Commercial Merchant'),
    partyAccount: partyAccount || 'N/A',
    balanceAfter,
    fee,
    category,
    channel: bankId === 'telebirr' ? 'Telebirr' : 'Mobile App'
  };
}

export function formatCurrency(amount: number, currency: string = 'ETB'): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ` ${currency}`;
}

export function formatSimpleDate(isoString: string, lang: 'am' | 'en' = 'en'): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    return date.toLocaleDateString(lang === 'am' ? 'am-ET' : 'en-US', options);
  } catch {
    return isoString;
  }
}

export function generateSecurityHash(ref: string, amount: number, sender: string, receiver: string): string {
  const raw = `${ref}-${amount}-${sender}-${receiver}-RIGGED-SECURE-KEY-2026`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}f7a91c0b3d5e6f8a${ref.toLowerCase()}`;
}
