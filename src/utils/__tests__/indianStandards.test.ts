/**
 * Tests for Indian Market Standards Utilities
 *
 * @author Into The Wild Development Team
 */

import { describe, expect, it } from "vitest";

import {
  calculateGST,
  calculateTotalWithGST,
  formatCurrency,
  formatDistance,
  formatIndianDate,
  formatIndianNumber,
  getCostBreakdown,
  parseIndianDate,
  validateAadhar,
  validateGSTNumber,
  validateIndianMobile,
} from "../indianStandards";

describe("Indian Standards Utilities", () => {
  describe("formatCurrency", () => {
    it("should format currency in Indian format", () => {
      expect(formatCurrency(1000)).toBe("₹1,000");
      expect(formatCurrency(1000000)).toBe("₹10,00,000");
      expect(formatCurrency(1000.5)).toBe("₹1,001"); // Rounds to nearest rupee
    });

    it("should handle decimal amounts correctly", () => {
      expect(formatCurrency(1000.4)).toBe("₹1,000"); // Rounds down
      expect(formatCurrency(1000.6)).toBe("₹1,001"); // Rounds up
    });

    it("should include GST when requested", () => {
      const result = formatCurrency(1000, { includeGST: true });
      expect(result).toBe("₹1,000 (₹1,180 with GST)");
    });

    it("should show breakdown when requested", () => {
      const result = formatCurrency(1000, { showBreakdown: true });
      expect(result).toContain("₹1,000");
      expect(result).toContain("₹180");
      expect(result).toContain("₹1,180");
    });

    it("should handle custom GST rate", () => {
      const result = formatCurrency(1000, { includeGST: true, gstRate: 12 });
      expect(result).toBe("₹1,000 (₹1,120 with GST)");
    });
  });

  describe("formatIndianDate", () => {
    it("should format date in DD/MM/YYYY format", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      expect(formatIndianDate(date)).toBe("15/01/2024");
    });

    it("should include time when requested", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      expect(formatIndianDate(date, true)).toBe("15/01/2024 16:00");
    });

    it("should handle string dates", () => {
      expect(formatIndianDate("2024-01-15")).toBe("15/01/2024");
    });
  });

  describe("parseIndianDate", () => {
    it("should parse DD/MM/YYYY format to Date object", () => {
      const result = parseIndianDate("15/01/2024");
      expect(result.getDate()).toBe(15);
      expect(result.getMonth()).toBe(0); // January (0-indexed)
      expect(result.getFullYear()).toBe(2024);
    });
  });

  describe("formatIndianNumber", () => {
    it("should format numbers in Indian system", () => {
      expect(formatIndianNumber(1000)).toBe("1,000");
      expect(formatIndianNumber(1000000)).toBe("10,00,000");
      expect(formatIndianNumber(1000.5)).toBe("1,000.5");
    });
  });

  describe("validateIndianMobile", () => {
    it("should validate correct Indian mobile numbers", () => {
      expect(validateIndianMobile("9876543210").isValid).toBe(true);
      expect(validateIndianMobile("+919876543210").isValid).toBe(true);
      expect(validateIndianMobile("919876543210").isValid).toBe(true);
    });

    it("should validate mobile numbers starting with 6-9", () => {
      expect(validateIndianMobile("6123456789").isValid).toBe(true);
      expect(validateIndianMobile("7123456789").isValid).toBe(true);
      expect(validateIndianMobile("8123456789").isValid).toBe(true);
      expect(validateIndianMobile("9123456789").isValid).toBe(true);
      expect(validateIndianMobile("5123456789").isValid).toBe(false); // Starts with 5
      expect(validateIndianMobile("4123456789").isValid).toBe(false); // Starts with 4
    });

    it("should reject invalid mobile numbers", () => {
      expect(validateIndianMobile("1234567890").isValid).toBe(false);
      expect(validateIndianMobile("987654321").isValid).toBe(false);
      expect(validateIndianMobile("98765432101").isValid).toBe(false);
    });

    it("should format valid numbers correctly", () => {
      const result = validateIndianMobile("9876543210");
      expect(result.formatted).toBe("+91 98765 43210");
    });
  });

  describe("calculateGST", () => {
    it("should calculate GST correctly", () => {
      expect(calculateGST(1000)).toBe(180); // 18% default
      expect(calculateGST(1000, 12)).toBe(120); // 12% custom
      expect(calculateGST(100, 5)).toBe(5); // 5%
    });
  });

  describe("calculateTotalWithGST", () => {
    it("should calculate total with GST", () => {
      expect(calculateTotalWithGST(1000)).toBe(1180); // 1000 + 180 GST
      expect(calculateTotalWithGST(1000, 12)).toBe(1120); // 1000 + 120 GST
    });
  });

  describe("validateAadhar", () => {
    it("should validate correct Aadhar numbers", () => {
      expect(validateAadhar("1234 5678 9012").isValid).toBe(true);
      expect(validateAadhar("123456789012").isValid).toBe(true);
    });

    it("should reject invalid Aadhar numbers", () => {
      expect(validateAadhar("12345678901").isValid).toBe(false);
      expect(validateAadhar("1234567890123").isValid).toBe(false);
      expect(validateAadhar("1234 5678 901").isValid).toBe(false);
    });
  });

  describe("formatDistance", () => {
    it("should format distance in kilometers", () => {
      expect(formatDistance(15.5)).toBe("15.5 km");
      expect(formatDistance(1000)).toBe("1,000 km");
    });
  });

  describe("getCostBreakdown", () => {
    it("should provide complete cost breakdown", () => {
      const breakdown = getCostBreakdown(1000);

      expect(breakdown.baseCost).toBe("₹1,000");
      expect(breakdown.gstAmount).toBe("₹180");
      expect(breakdown.totalCost).toBe("₹1,180");
      expect(breakdown.gstRate).toBe(18);
    });

    it("should handle custom GST rate", () => {
      const breakdown = getCostBreakdown(1000, { gstRate: 12 });

      expect(breakdown.gstAmount).toBe("₹120");
      expect(breakdown.totalCost).toBe("₹1,120");
      expect(breakdown.gstRate).toBe(12);
    });
  });

  describe("validateGSTNumber", () => {
    it("should validate correct GST numbers", () => {
      expect(validateGSTNumber("22AAAAA0000A1Z5").isValid).toBe(true);
      expect(validateGSTNumber("27AABCU9603R1ZV").isValid).toBe(true);
    });

    it("should reject invalid GST numbers", () => {
      expect(validateGSTNumber("123456789012345").isValid).toBe(false);
      expect(validateGSTNumber("22AAAAA0000A1Z").isValid).toBe(false);
      expect(validateGSTNumber("99AAAAA0000A1Z5").isValid).toBe(false); // Invalid state code
    });
  });
});
