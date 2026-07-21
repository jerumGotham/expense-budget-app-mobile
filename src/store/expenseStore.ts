import { create } from "zustand";

import { CreateExpensePayload, financeApi } from "@/api/financeApi";
import { sendBudgetWarning } from "@/services/notificationService";
import { useFinanceStore } from "@/store/financeStore";
import { Expense } from "@/types/finance";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

export type CreateExpenseInput = {
  title: string;
  amount: number;
  categoryId: string;
  categoryName: string;

  source: "manual" | "receipt";

  receiptId?: string;
  expenseDate?: string;
  merchant?: string;
  notes?: string;
  paymentMethod?: string;
};

type ExpenseState = {
  isSavingExpense: boolean;
  isDeletingExpense: boolean;
  error: string | null;

  createExpense: (payload: CreateExpenseInput) => Promise<Expense>;

  deleteExpense: (expenseId: string) => Promise<void>;

  clearExpenseError: () => void;
};

export const useExpenseStore = create<ExpenseState>((set) => ({
  isSavingExpense: false,
  isDeletingExpense: false,
  error: null,

  createExpense: async (payload) => {
    set({
      isSavingExpense: true,
      error: null,
    });

    try {
      const apiPayload: CreateExpensePayload = {
        title: payload.title.trim(),
        amount: payload.amount,

        categoryId: payload.categoryId,

        source: payload.source,

        expenseDate: payload.expenseDate ?? new Date().toISOString(),

        receiptId: payload.receiptId,

        merchant: payload.merchant?.trim(),

        notes: payload.notes?.trim(),

        paymentMethod: payload.paymentMethod?.trim(),
      };

      const result = await financeApi.createExpense(apiPayload);

      const created = result.expense;

      const expense: Expense = {
        id: created.id,
        title: created.title,
        amount: created.amount,

        categoryId: created.categoryId,

        categoryName: created.categoryName,

        date: created.date,
        source: created.source,

        receiptId: created.receiptId,

        merchant: created.merchant,

        notes: created.notes,

        paymentMethod: created.paymentMethod,
      };

      await useFinanceStore.getState().refreshFinance();

      for (const alert of result.alerts) {
        await sendBudgetWarning(alert.title, alert.percentage);
      }

      set({
        isSavingExpense: false,
        error: null,
      });

      return expense;
    } catch (error) {
      set({
        isSavingExpense: false,
        error: getApiErrorMessage(error, "Unable to create expense."),
      });

      throw error;
    }
  },

  deleteExpense: async (expenseId) => {
    set({
      isDeletingExpense: true,
      error: null,
    });

    try {
      await financeApi.deleteExpense(expenseId);

      await useFinanceStore.getState().refreshFinance();

      set({
        isDeletingExpense: false,
        error: null,
      });
    } catch (error) {
      set({
        isDeletingExpense: false,
        error: getApiErrorMessage(error, "Unable to delete expense."),
      });

      throw error;
    }
  },

  clearExpenseError: () => {
    set({
      error: null,
    });
  },
}));
