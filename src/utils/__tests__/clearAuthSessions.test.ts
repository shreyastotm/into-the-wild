import {
  clearAllAuthSessions,
  hasPersistentAuthSession,
} from "../clearAuthSessions";

// Mock localStorage and sessionStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
    // Add a method to get all keys (this is what hasPersistentAuthSession uses)
    getAllKeys: () => Object.keys(store),
  };
})();

const mockSessionStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

// Setup global mocks
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

// No need for complex Object.keys mocking since hasPersistentAuthSession
// now uses direct localStorage.getItem calls

describe("clearAuthSessions", () => {
  beforeEach(() => {
    // Reset storage before each test
    mockLocalStorage.clear();
    mockSessionStorage.clear();
  });

  describe("clearAllAuthSessions", () => {
    it("should clear all Supabase auth tokens from localStorage", () => {
      // Setup some auth tokens
      mockLocalStorage.setItem("itw-auth-token", "test-token");
      mockLocalStorage.setItem("supabase.auth.token", "supabase-token");
      mockLocalStorage.setItem("regular-key", "regular-value");

      // Call the function
      clearAllAuthSessions();

      // Check that auth tokens are removed
      expect(mockLocalStorage.getItem("itw-auth-token")).toBeNull();
      expect(mockLocalStorage.getItem("supabase.auth.token")).toBeNull();

      // Check that regular keys are preserved
      expect(mockLocalStorage.getItem("regular-key")).toBe("regular-value");
    });

    it("should clear all auth tokens from sessionStorage", () => {
      // Setup some auth tokens in sessionStorage
      mockSessionStorage.setItem("supabase.auth.token", "session-token");
      mockSessionStorage.setItem(
        "regular-session-key",
        "regular-session-value",
      );

      // Call the function
      clearAllAuthSessions();

      // Check that auth tokens are removed
      expect(mockSessionStorage.getItem("supabase.auth.token")).toBeNull();

      // Check that regular keys are preserved
      expect(mockSessionStorage.getItem("regular-session-key")).toBe(
        "regular-session-value",
      );
    });

    it("should handle empty storage gracefully", () => {
      // Call the function with empty storage
      expect(() => clearAllAuthSessions()).not.toThrow();
    });
  });

  describe("hasPersistentAuthSession", () => {
    it("should return true when auth tokens exist in localStorage", () => {
      mockLocalStorage.setItem("itw-auth-token", "test-token");

      expect(hasPersistentAuthSession()).toBe(true);
    });

    it("should return true when supabase tokens exist in localStorage", () => {
      mockLocalStorage.setItem("supabase.auth.token", "supabase-token");

      expect(hasPersistentAuthSession()).toBe(true);
    });

    it("should return false when no auth tokens exist", () => {
      mockLocalStorage.setItem("regular-key", "regular-value");

      expect(hasPersistentAuthSession()).toBe(false);
    });

    it("should return false when localStorage is empty", () => {
      expect(hasPersistentAuthSession()).toBe(false);
    });

    it("should handle localStorage errors gracefully", () => {
      // Mock localStorage to throw an error
      const originalGetItem = mockLocalStorage.getItem;
      mockLocalStorage.getItem = () => {
        throw new Error("localStorage error");
      };

      expect(hasPersistentAuthSession()).toBe(false);

      // Restore original function
      mockLocalStorage.getItem = originalGetItem;
    });
  });
});
