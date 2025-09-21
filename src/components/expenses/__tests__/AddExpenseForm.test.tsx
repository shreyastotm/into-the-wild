import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddExpenseForm } from '../AddExpenseForm';
import { ExpenseCategory } from '@/hooks/useExpenseSplitting';

// Mock dependencies
vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } }),
}));
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}));

const mockParticipants = [
  { user_id: 'user1', full_name: 'Alice' },
  { user_id: 'user2', full_name: 'Bob' },
];

const mockCategories: ExpenseCategory[] = [
  { id: 1, name: 'Food', icon: 'pizza' },
  { id: 2, name: 'Transport', icon: 'car' },
];

describe('AddExpenseForm', () => {
  let createExpenseMock: ReturnType<typeof vi.fn>;
  let onSuccessMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createExpenseMock = vi.fn().mockResolvedValue(true);
    onSuccessMock = vi.fn();
  });

  it('renders step 1 initially', () => {
    render(
      <AddExpenseForm
        trekId={1}
        participants={mockParticipants}
        categories={mockCategories}
        createExpense={createExpenseMock}
        onSuccess={onSuccessMock}
      />
    );
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('moves to step 2 when Next is clicked with valid data', () => {
    render(
      <AddExpenseForm
        trekId={1}
        participants={mockParticipants}
        categories={mockCategories}
        createExpense={createExpenseMock}
        onSuccess={onSuccessMock}
      />
    );
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Expense' } });
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
    fireEvent.click(screen.getByText('Next'));
    
    expect(screen.getByText(/split with/i)).toBeInTheDocument();
    expect(screen.getByText('Add Expense')).toBeInTheDocument();
  });

  it('calls createExpense and onSuccess when form is submitted', async () => {
    render(
      <AddExpenseForm
        trekId={1}
        participants={mockParticipants}
        categories={mockCategories}
        createExpense={createExpenseMock}
        onSuccess={onSuccessMock}
      />
    );

    // Step 1
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Dinner' } });
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '200' } });
    fireEvent.click(screen.getByText('Next'));

    // Step 2
    fireEvent.click(screen.getByText('Add Expense'));

    await waitFor(() => {
      expect(createExpenseMock).toHaveBeenCalledWith({
        trekId: 1,
        categoryId: 1, // First category is selected by default
        amount: 200,
        description: 'Dinner',
        expenseDate: expect.any(String),
        shareWithUsers: [
          { userId: 'user1', amount: 100 },
          { userId: 'user2', amount: 100 },
        ],
      });
    });

    await waitFor(() => {
        expect(onSuccessMock).toHaveBeenCalled();
    });
  });
});
