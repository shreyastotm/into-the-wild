import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddExpenseForm } from "../AddExpenseForm";

const mockOnExpenseAdded = jest.fn();
const mockUser = { id: "1" };

jest.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({ user: mockUser, userProfile: {} })
}));
jest.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ insert: () => ({ error: undefined }) }) }
}));
jest.mock("@/components/ui/use-toast", () => ({
  toast: jest.fn()
}));

describe("AddExpenseForm", () => {
  it("shows validation error when fields are empty", async () => {
    render(<AddExpenseForm trekId={1} onExpenseAdded={mockOnExpenseAdded} participants={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /add expense/i }));
    await waitFor(() => {
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    render(<AddExpenseForm trekId={1} onExpenseAdded={mockOnExpenseAdded} participants={[]} />);
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Test expense" } });
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: /add expense/i }));
    await waitFor(() => {
      expect(mockOnExpenseAdded).toHaveBeenCalled();
    });
  });
});
