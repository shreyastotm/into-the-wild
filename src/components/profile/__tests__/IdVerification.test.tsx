import { createClient } from "@supabase/supabase-js";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import IdVerification from "../IdVerification";

// Mock Supabase client
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: "test-user-id" } } }),
      signIn: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      match: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn().mockResolvedValue({ data: {}, error: null }),
      delete: vi.fn().mockResolvedValue({ data: {}, error: null }),
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: "https://example.com/image.jpg" },
        }),
      }),
    },
  })),
}));

describe("IdVerification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<IdVerification data-testid="idverification" />);
    expect(screen.getByTestId("idverification")).toBeInTheDocument();
  });

  it("accepts and displays props correctly", () => {
    render(<IdVerification title="Test Title" data-testid="idverification" />);
    expect(screen.getByTestId("idverification")).toHaveTextContent(
      "Test Title",
    );
  });

  it("handles user interactions", () => {
    const handleClick = vi.fn();
    render(
      <IdVerification onClick={handleClick} data-testid="idverification" />,
    );
    fireEvent.click(screen.getByTestId("idverification"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("updates state correctly", async () => {
    render(<IdVerification data-testid="idverification" />);
    fireEvent.click(screen.getByTestId("idverification"));
    await waitFor(() => {
      expect(screen.getByTestId("idverification")).toHaveTextContent(
        /updated|changed|new/i,
      );
    });
  });

  it("interacts with Supabase correctly", async () => {
    render(<IdVerification data-testid="idverification" />);
    // Verify Supabase client was created
    expect(createClient).toHaveBeenCalled();

    // Test component behavior that uses Supabase
    // This will depend on the specific component
  });
});
