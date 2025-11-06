/**
 * Indian Market Standards Utilities
 *
 * This module provides utilities for Indian market compliance including:
 * - Currency formatting with ₹ symbol
 * - Date formatting in DD/MM/YYYY format
 * - GST calculations (18% default)
 * - Indian number formatting
 * - Mobile number validation
 *
 * @author Into The Wild Development Team
 * @version 1.0.0
 */

import { format, parse } from "date-fns";

/**
 * Currency formatting options for Indian market
 */
export interface CurrencyOptions {
  /** Include GST in display (default: false) */
  includeGST?: boolean;
  /** GST rate percentage (default: 18) */
  gstRate?: number;
  /** Show breakdown (default: false) */
  showBreakdown?: boolean;
}

/**
 * Format currency in Indian format with ₹ symbol
 *
 * @param amount - Amount in rupees
 * @param options - Currency formatting options or currency code for backward compatibility
 * @returns Formatted currency string
 *
 * @example
 * ```typescript
 * formatCurrency(1000) // "₹1,000"
 * formatCurrency(1000, { includeGST: true }) // "₹1,000 (₹1,180 with GST)"
 * formatCurrency(1000, { showBreakdown: true }) // "₹1,000 + ₹180 GST = ₹1,180"
 * ```
 */

// Overloaded function for backward compatibility
export function formatCurrency(amount: number): string;
export function formatCurrency(
  amount: number,
  options: CurrencyOptions,
): string;
export function formatCurrency(
  amount: number,
  options: CurrencyOptions | string = {},
): string {
  // Handle backward compatibility with string parameter
  const opts = typeof options === "string" ? {} : options;
  const { includeGST = false, gstRate = 18, showBreakdown = false } = opts;

  // Format base amount
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);

  if (!includeGST) {
    return formattedAmount;
  }

  const gstAmount = Math.round(amount * (gstRate / 100));
  const totalAmount = amount + gstAmount;

  if (showBreakdown) {
    return `${formattedAmount} + ${formatCurrency(gstAmount)} GST = ${formatCurrency(totalAmount)}`;
  }

  return `${formattedAmount} (${formatCurrency(totalAmount)} with GST)`;
}

/**
 * Format date in Indian format (DD/MM/YYYY)
 *
 * @param date - Date to format
 * @param includeTime - Whether to include time (default: false)
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * formatIndianDate(new Date('2024-01-15')) // "15/01/2024"
 * formatIndianDate(new Date('2024-01-15'), true) // "15/01/2024 14:30"
 * ```
 */
export function formatIndianDate(
  date: Date | string,
  includeTime = false,
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Format as DD/MM/YYYY
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  const dateString = `${day}/${month}/${year}`;

  if (includeTime) {
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    return `${dateString} ${hours}:${minutes}`;
  }

  return dateString;
}

/**
 * Parse Indian date format (DD/MM/YYYY) to Date object
 *
 * @param dateString - Date string in DD/MM/YYYY format
 * @returns Parsed Date object
 *
 * @example
 * ```typescript
 * parseIndianDate('15/01/2024') // Date object for 2024-01-15
 * ```
 */
export function parseIndianDate(dateString: string): Date {
  return parse(dateString, "dd/MM/yyyy", new Date());
}

/**
 * Format number in Indian number system
 *
 * @param number - Number to format
 * @param options - Number formatting options
 * @returns Formatted number string
 *
 * @example
 * ```typescript
 * formatIndianNumber(1000000) // "10,00,000"
 * formatIndianNumber(1000.5) // "1,000.50"
 * ```
 */
export function formatIndianNumber(
  number: number,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat("en-IN", options).format(number);
}

/**
 * Parse PostgreSQL INTERVAL duration to number of days
 *
 * @param duration - Duration string from PostgreSQL INTERVAL type
 * @returns Number of days as string (e.g., "1", "2", "3")
 *
 * @example
 * ```typescript
 * parseDuration("3 days") // "3"
 * parseDuration("2 days 12:00:00") // "2"
 * parseDuration("1 day") // "1"
 * parseDuration(null) // "1"
 * ```
 */
export function parseDuration(duration: string | null | undefined): string {
  if (!duration) return "1";

  const durationStr = String(duration);

  // Handle PostgreSQL INTERVAL format: "3 days", "2 days 12:00:00", etc.
  const daysMatch = durationStr.match(/(\d+)\s*days?/i);
  if (daysMatch) {
    return daysMatch[1];
  }

  // Try to match just a number at the start
  const numMatch = durationStr.match(/^(\d+)/);
  if (numMatch) {
    return numMatch[1];
  }

  // Fallback: try to parse as integer
  const num = parseInt(durationStr, 10);
  return isNaN(num) ? "1" : num.toString();
}

/**
 * Validate Indian mobile number
 *
 * @param phoneNumber - Phone number to validate
 * @returns Validation result
 *
 * @example
 * ```typescript
 * validateIndianMobile('+919876543210') // { isValid: true, formatted: '+91 98765 43210' }
 * validateIndianMobile('9876543210') // { isValid: true, formatted: '+91 98765 43210' }
 * ```
 */
export function validateIndianMobile(phoneNumber: string): {
  isValid: boolean;
  formatted: string;
  message?: string;
} {
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, "");

  // Indian mobile number patterns
  const patterns = [
    /^(\+91)[6-9]\d{9}$/, // +91XXXXXXXXXX
    /^[6-9]\d{9}$/, // XXXXXXXXXX (will add +91)
  ];

  const isValid = patterns.some((pattern) => pattern.test(cleaned));

  if (!isValid) {
    return {
      isValid: false,
      formatted: phoneNumber,
      message: "Please enter a valid 10-digit Indian mobile number",
    };
  }

  // Format the number
  let formatted: string;
  if (cleaned.startsWith("+91")) {
    formatted = `+91 ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  } else if (cleaned.startsWith("91")) {
    formatted = `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  } else {
    formatted = `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }

  return {
    isValid: true,
    formatted,
  };
}

/**
 * Calculate GST amount
 *
 * @param amount - Base amount
 * @param gstRate - GST rate percentage (default: 18)
 * @returns GST amount
 *
 * @example
 * ```typescript
 * calculateGST(1000) // 180
 * calculateGST(1000, 12) // 120
 * ```
 */
export function calculateGST(amount: number, gstRate = 18): number {
  return Math.round(amount * (gstRate / 100));
}

/**
 * Calculate total amount including GST
 *
 * @param amount - Base amount
 * @param gstRate - GST rate percentage (default: 18)
 * @returns Total amount with GST
 *
 * @example
 * ```typescript
 * calculateTotalWithGST(1000) // 1180
 * ```
 */
export function calculateTotalWithGST(amount: number, gstRate = 18): number {
  return amount + calculateGST(amount, gstRate);
}

/**
 * Validate Aadhar number format (basic validation)
 *
 * @param aadharNumber - Aadhar number to validate
 * @returns Validation result
 *
 * @example
 * ```typescript
 * validateAadhar('1234 5678 9012') // { isValid: true }
 * ```
 */
export function validateAadhar(aadharNumber: string): {
  isValid: boolean;
  message?: string;
} {
  const cleaned = aadharNumber.replace(/\s/g, "");

  if (!/^\d{12}$/.test(cleaned)) {
    return {
      isValid: false,
      message: "Aadhar number must be 12 digits",
    };
  }

  return { isValid: true };
}

/**
 * Format trek distance in kilometers (Indian standard)
 *
 * @param distance - Distance in kilometers
 * @returns Formatted distance string
 *
 * @example
 * ```typescript
 * formatDistance(15.5) // "15.5 km"
 * formatDistance(1000) // "1,000 km"
 * ```
 */
export function formatDistance(distance: number): string {
  return `${formatIndianNumber(distance)} km`;
}

/**
 * Generate trek cost breakdown with GST
 *
 * @param baseCost - Base cost of trek
 * @param options - Cost breakdown options
 * @returns Cost breakdown object
 *
 * @example
 * ```typescript
 * getCostBreakdown(1000)
 * // {
 * //   baseCost: "₹1,000",
 * //   gstAmount: "₹180",
 * //   totalCost: "₹1,180",
 * //   gstRate: 18
 * // }
 * ```
 */
export function getCostBreakdown(
  baseCost: number,
  options: { gstRate?: number } = {},
): {
  baseCost: string;
  gstAmount: string;
  totalCost: string;
  gstRate: number;
} {
  const gstRate = options.gstRate ?? 18;
  const gstAmount = calculateGST(baseCost, gstRate);

  return {
    baseCost: formatCurrency(baseCost),
    gstAmount: formatCurrency(gstAmount),
    totalCost: formatCurrency(baseCost + gstAmount),
    gstRate,
  };
}

/**
 * Indian state codes for GST compliance
 */
export const INDIAN_STATE_CODES: Record<string, string> = {
  JK: "01",
  HP: "02",
  PB: "03",
  CH: "04",
  UT: "05",
  HR: "06",
  DL: "07",
  RJ: "08",
  UP: "09",
  BR: "10",
  SK: "11",
  AR: "12",
  NL: "13",
  MN: "14",
  MZ: "15",
  TR: "16",
  ML: "17",
  AS: "18",
  WB: "19",
  JH: "20",
  OR: "21",
  CT: "22",
  MP: "23",
  GJ: "24",
  DD: "25",
  DH: "26", // Renamed from DN to avoid duplicate
  MH: "27",
  AP: "28",
  KA: "29",
  GO: "30",
  LD: "31", // Lakshadweep
  PY: "34",
  AN: "35",
  TS: "36",
  LA: "37", // Ladakh (was duplicate LD)
  OD: "38",
  DN: "39", // Daman and Nagar Haveli (updated)
};

/**
 * Calculate price with GST (18% standard rate)
 *
 * @param amount - Base amount without GST
 * @returns Amount with GST included
 *
 * @example
 * ```typescript
 * calculateGSTPrice(100) // 118
 * ```
 */
export function calculateGSTPrice(amount: number): number {
  const GST_RATE = 0.18; // 18% standard GST rate
  return Math.round(amount * (1 + GST_RATE));
}

/**
 * Validate GST number format
 *
 * @param gstNumber - GST number to validate
 * @returns Validation result
 *
 * @example
 * ```typescript
 * validateGSTNumber('22AAAAA0000A1Z5') // { isValid: true }
 * ```
 */
export function validateGSTNumber(gstNumber: string): {
  isValid: boolean;
  message?: string;
} {
  const cleaned = gstNumber.replace(/\s/g, "").toUpperCase();

  if (
    !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleaned)
  ) {
    return {
      isValid: false,
      message: "Invalid GST number format. Expected format: 22AAAAA0000A1Z5",
    };
  }

  // Basic checksum validation (simplified)
  const stateCode = cleaned.substring(0, 2);
  if (!Object.values(INDIAN_STATE_CODES).includes(stateCode)) {
    return {
      isValid: false,
      message: "Invalid state code in GST number",
    };
  }

  return { isValid: true };
}
