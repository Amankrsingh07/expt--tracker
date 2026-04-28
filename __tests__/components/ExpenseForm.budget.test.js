/**
 * Budget Enforcement Integration Tests
 * Tests for real-time budget validation in expense forms
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseForm from '@/components/ExpenseForm';

// Mock fetch
global.fetch = jest.fn();

describe('ExpenseForm - Budget Enforcement', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  // ========================================================================
  // TEST 1: Real-time Budget Check
  // ========================================================================
  describe('Real-time Budget Validation', () => {
    test('Should show blue info box when within budget', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: [{ id: 1, name: 'Food' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            budgets: [{ categoryId: 1, monthlyBudget: 5000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            expenses: [{ categoryId: 1, amount: 2000 }]
          })
        });

      render(<ExpenseForm onSuccess={() => {}} />);

      // Enter amount and select category
      const amountInput = screen.getByPlaceholderText('₹ 0.00');
      const categorySelect = screen.getByDisplayValue('Select category');

      await userEvent.type(amountInput, '3000');
      await userEvent.selectOption(categorySelect, '1');

      // Wait for real-time check
      await waitFor(() => {
        expect(screen.getByText(/Budget Info:/i)).toBeInTheDocument();
      });

      // Should show blue (normal) info box
      const infoBox = screen.getByText(/Budget Info:/i).closest('div');
      expect(infoBox).toHaveClass('bg-blue');
    });

    test('Should show yellow warning at 80-100% budget used', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: [{ id: 1, name: 'Food' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            budgets: [{ categoryId: 1, monthlyBudget: 5000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            expenses: [{ categoryId: 1, amount: 4200 }] // 84% used
          })
        });

      render(<ExpenseForm onSuccess={() => {}} />);

      const amountInput = screen.getByPlaceholderText('₹ 0.00');
      const categorySelect = screen.getByDisplayValue('Select category');

      await userEvent.type(amountInput, '500');
      await userEvent.selectOption(categorySelect, '1');

      // Wait for warning
      await waitFor(() => {
        expect(screen.getByText(/WARNING/i)).toBeInTheDocument();
      });

      const warningBox = screen.getByText(/WARNING/i).closest('div');
      expect(warningBox).toHaveClass('bg-yellow');
    });

    test('Should show red error when budget would be exceeded', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: [{ id: 1, name: 'Food' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            budgets: [{ categoryId: 1, monthlyBudget: 5000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            expenses: [{ categoryId: 1, amount: 4800 }] // 96% used
          })
        });

      render(<ExpenseForm onSuccess={() => {}} />);

      const amountInput = screen.getByPlaceholderText('₹ 0.00');
      const categorySelect = screen.getByDisplayValue('Select category');

      await userEvent.type(amountInput, '1000');
      await userEvent.selectOption(categorySelect, '1');

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/BUDGET EXCEEDED/i)).toBeInTheDocument();
      });

      const errorBox = screen.getByText(/BUDGET EXCEEDED/i).closest('div');
      expect(errorBox).toHaveClass('bg-red');
    });
  });

  // ========================================================================
  // TEST 2: Submit Button State
  // ========================================================================
  describe('Submit Button State Management', () => {
    test('Should disable submit button when budget exceeded', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: [{ id: 1, name: 'Food' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            budgets: [{ categoryId: 1, monthlyBudget: 5000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            expenses: [{ categoryId: 1, amount: 5000 }] // At limit
          })
        });

      render(<ExpenseForm onSuccess={() => {}} />);

      const amountInput = screen.getByPlaceholderText('₹ 0.00');
      const categorySelect = screen.getByDisplayValue('Select category');

      await userEvent.type(amountInput, '1');
      await userEvent.selectOption(categorySelect, '1');

      // Wait for button to disable
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Add Transaction/i });
        expect(submitButton).toBeDisabled();
      });
    });

    test('Should enable submit button when amount reduced', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: [{ id: 1, name: 'Food' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            budgets: [{ categoryId: 1, monthlyBudget: 5000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            expenses: [{ categoryId: 1, amount: 3000 }]
          })
        });

      render(<ExpenseForm onSuccess={() => {}} />);

      const amountInput = screen.getByPlaceholderText('₹ 0.00');
      const categorySelect = screen.getByDisplayValue('Select category');

      await userEvent.type(amountInput, '2500');
      await userEvent.selectOption(categorySelect, '1');

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Add Transaction/i });
        expect(submitButton).not.toBeDisabled();
      });
    });

    test('Should enable submit with yellow warning', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: [{ id: 1, name: 'Food' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            budgets: [{ categoryId: 1, monthlyBudget: 5000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            expenses: [{ categoryId: 1, amount: 4200 }]
          })
        });

      render(<ExpenseForm onSuccess={() => {}} />);

      const amountInput = screen.getByPlaceholderText('₹ 0.00');
      const categorySelect = screen.getByDisplayValue('Select category');

      await userEvent.type(amountInput, '500');
      await userEvent.selectOption(categorySelect, '1');

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Add Transaction/i });
        expect(submitButton).not.toBeDisabled();
        expect(screen.getByText(/WARNING/i)).toBeInTheDocument();
      });
    });
  });

  // ========================================================================
  // TEST 3: Budget Info Display
  // ========================================================================
  describe('Budget Information Display', () => {
    test('Should display correct budget details', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: [{ id: 1, name: 'Food' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            budgets: [{ categoryId: 1, monthlyBudget: 5000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            expenses: [{ categoryId: 1, amount: 2000 }]
          })
        });

      render(<ExpenseForm onSuccess={() => {}} />);

      const amountInput = screen.getByPlaceholderText('₹ 0.00');
      const categorySelect = screen.getByDisplayValue('Select category');

      await userEvent.type(amountInput, '1500');
      await userEvent.selectOption(categorySelect, '1');

      await waitFor(() => {
        expect(screen.getByText('Budget: ₹5,000')).toBeInTheDocument();
        expect(screen.getByText('Spent: ₹2,000')).toBeInTheDocument();
        expect(screen.getByText('Remaining: ₹3,000')).toBeInTheDocument();
        expect(screen.getByText('After This: ₹3,500')).toBeInTheDocument();
      });
    });

    test('Should update info when amount changes', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: [{ id: 1, name: 'Food' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            budgets: [{ categoryId: 1, monthlyBudget: 5000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            expenses: [{ categoryId: 1, amount: 2000 }]
          })
        });

      render(<ExpenseForm onSuccess={() => {}} />);

      const amountInput = screen.getByPlaceholderText('₹ 0.00');
      const categorySelect = screen.getByDisplayValue('Select category');

      await userEvent.type(amountInput, '1000');
      await userEvent.selectOption(categorySelect, '1');

      // First info display
      await waitFor(() => {
        expect(screen.getByText('After This: ₹3,000')).toBeInTheDocument();
      });

      // Change amount
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '2000');

      // Info should update
      await waitFor(() => {
        expect(screen.getByText('After This: ₹4,000')).toBeInTheDocument();
      });
    });

    test('Should clear info when category without budget selected', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            categories: [
              { id: 1, name: 'Food' },
              { id: 2, name: 'Uncategorized' }
            ]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            budgets: [{ categoryId: 1, monthlyBudget: 5000 }] // No budget for category 2
          })
        });

      render(<ExpenseForm onSuccess={() => {}} />);

      const categorySelect = screen.getByDisplayValue('Select category');

      await userEvent.selectOption(categorySelect, '2');

      // Info box should not appear
      await waitFor(() => {
        expect(screen.queryByText(/Budget Info:/i)).not.toBeInTheDocument();
      });
    });
  });

  // ========================================================================
  // TEST 4: Form Submission
  // ========================================================================
  describe('Form Submission with Budget Enforcement', () => {
    test('Should submit successfully when within budget', async () => {
      const onSuccess = jest.fn();
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: [{ id: 1, name: 'Food' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            budgets: [{ categoryId: 1, monthlyBudget: 5000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            expenses: [{ categoryId: 1, amount: 2000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, categoryId: 1, amount: 2000 })
        });

      render(<ExpenseForm onSuccess={onSuccess} />);

      const amountInput = screen.getByPlaceholderText('₹ 0.00');
      const categorySelect = screen.getByDisplayValue('Select category');
      const submitButton = screen.getByRole('button', { name: /Add Transaction/i });

      await userEvent.type(amountInput, '2000');
      await userEvent.selectOption(categorySelect, '1');

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    test('Should not submit when budget exceeded', async () => {
      const onSuccess = jest.fn();
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: [{ id: 1, name: 'Food' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            budgets: [{ categoryId: 1, monthlyBudget: 5000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            expenses: [{ categoryId: 1, amount: 5000 }]
          })
        });

      render(<ExpenseForm onSuccess={onSuccess} />);

      const amountInput = screen.getByPlaceholderText('₹ 0.00');
      const categorySelect = screen.getByDisplayValue('Select category');
      const submitButton = screen.getByRole('button', { name: /Add Transaction/i });

      await userEvent.type(amountInput, '1000');
      await userEvent.selectOption(categorySelect, '1');

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });

    test('Should clear form after successful submission', async () => {
      const onSuccess = jest.fn();
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: [{ id: 1, name: 'Food' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            budgets: [{ categoryId: 1, monthlyBudget: 5000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            expenses: [{ categoryId: 1, amount: 2000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1 })
        });

      render(<ExpenseForm onSuccess={onSuccess} />);

      const amountInput = screen.getByPlaceholderText('₹ 0.00');
      const categorySelect = screen.getByDisplayValue('Select category');
      const submitButton = screen.getByRole('button', { name: /Add Transaction/i });

      await userEvent.type(amountInput, '2000');
      await userEvent.selectOption(categorySelect, '1');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(amountInput).toHaveValue(null);
      });
    });
  });

  // ========================================================================
  // TEST 5: Error Handling
  // ========================================================================
  describe('Error Handling', () => {
    test('Should handle budget fetch errors gracefully', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: [{ id: 1, name: 'Food' }] })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Failed to fetch budgets' })
        });

      render(<ExpenseForm onSuccess={() => {}} />);

      const categorySelect = screen.getByDisplayValue('Select category');
      await userEvent.selectOption(categorySelect, '1');

      // Should not crash, just show no budget info
      await waitFor(() => {
        expect(screen.queryByText(/Budget Info:/i)).not.toBeInTheDocument();
      });
    });

    test('Should handle submission errors', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: [{ id: 1, name: 'Food' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            budgets: [{ categoryId: 1, monthlyBudget: 5000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            expenses: [{ categoryId: 1, amount: 2000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Server error' })
        });

      global.alert = jest.fn();

      render(<ExpenseForm onSuccess={() => {}} />);

      const amountInput = screen.getByPlaceholderText('₹ 0.00');
      const categorySelect = screen.getByDisplayValue('Select category');
      const submitButton = screen.getByRole('button', { name: /Add Transaction/i });

      await userEvent.type(amountInput, '2000');
      await userEvent.selectOption(categorySelect, '1');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalled();
      });
    });
  });

  // ========================================================================
  // TEST 6: Income vs Expense
  // ========================================================================
  describe('Income vs Expense Type', () => {
    test('Should not show budget warnings for income', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: [{ id: 1, name: 'Food' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            budgets: [{ categoryId: 1, monthlyBudget: 5000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            expenses: [{ categoryId: 1, amount: 5000 }]
          })
        });

      render(<ExpenseForm onSuccess={() => {}} />);

      const typeButtons = screen.getAllByRole('button');
      const incomeButton = typeButtons.find(btn => btn.textContent === 'Income');

      await userEvent.click(incomeButton);

      const amountInput = screen.getByPlaceholderText('₹ 0.00');
      await userEvent.type(amountInput, '10000');

      // Should not show budget warnings
      await waitFor(() => {
        expect(screen.queryByText(/BUDGET EXCEEDED/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/WARNING/i)).not.toBeInTheDocument();
      });
    });

    test('Should show budget warnings when toggling to expense', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: [{ id: 1, name: 'Food' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            budgets: [{ categoryId: 1, monthlyBudget: 5000 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            expenses: [{ categoryId: 1, amount: 5000 }]
          })
        });

      render(<ExpenseForm onSuccess={() => {}} />);

      const typeButtons = screen.getAllByRole('button');
      const incomeButton = typeButtons.find(btn => btn.textContent === 'Income');
      const expenseButton = typeButtons.find(btn => btn.textContent === 'Expense');

      const amountInput = screen.getByPlaceholderText('₹ 0.00');
      const categorySelect = screen.getByDisplayValue('Select category');

      await userEvent.click(incomeButton);
      await userEvent.type(amountInput, '1000');
      await userEvent.selectOption(categorySelect, '1');

      // No warnings for income
      expect(screen.queryByText(/BUDGET EXCEEDED/i)).not.toBeInTheDocument();

      // Toggle to expense
      await userEvent.click(expenseButton);

      // Now should show warning
      await waitFor(() => {
        expect(screen.getByText(/BUDGET EXCEEDED/i)).toBeInTheDocument();
      });
    });
  });
});
