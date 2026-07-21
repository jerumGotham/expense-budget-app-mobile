import { create } from "zustand";

import { authApi } from "@/api/authApi";
import { useExpenseStore } from "@/store/expenseStore";
import { useFinanceStore } from "@/store/financeStore";
import { useReceiptStore } from "@/store/receiptStore";
import { useReportStore } from "@/store/reportStore";
import { AuthUser } from "@/types/api";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

type AuthState = {
  user: AuthUser | null;

  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  isLoggingIn: boolean;

  error: string | null;

  checkAuthentication: () => Promise<boolean>;

  login: (email: string, password: string) => Promise<void>;

  register: (name: string, email: string, password: string) => Promise<void>;

  logout: () => Promise<void>;

  clearAuthError: () => void;

  isUpdatingAccount: boolean;

  updateAccount: (payload: {
    name?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isUpdatingAccount: false,
  isAuthenticated: false,
  isCheckingAuth: true,
  isLoggingIn: false,

  error: null,

  checkAuthentication: async () => {
    set({
      isCheckingAuth: true,
      error: null,
    });

    try {
      const token = await authApi.getStoredToken();

      const isAuthenticated = Boolean(token);

      set({
        isAuthenticated,
        isCheckingAuth: false,
      });

      return isAuthenticated;
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isCheckingAuth: false,
        error: getApiErrorMessage(error, "Unable to check authentication."),
      });

      return false;
    }
  },

  login: async (email, password) => {
    set({
      isLoggingIn: true,
      error: null,
    });

    try {
      const result = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });

      set({
        user: result.user,
        isAuthenticated: true,
        isLoggingIn: false,
        error: null,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoggingIn: false,
        error: getApiErrorMessage(error, "Invalid email or password."),
      });

      throw error;
    }
  },

  register: async (name, email, password) => {
    set({
      isLoggingIn: true,
      error: null,
    });

    try {
      const result = await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      set({
        user: result.user,
        isAuthenticated: true,
        isLoggingIn: false,
        error: null,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoggingIn: false,
        error: getApiErrorMessage(error, "Unable to register account."),
      });

      throw error;
    }
  },

  logout: async () => {
    await authApi.logout();

    useFinanceStore.getState().clearFinance();

    useReportStore.getState().clearReport();

    useReceiptStore.getState().clearReceipt();

    useExpenseStore.getState().clearExpenseError();

    set({
      user: null,
      isAuthenticated: false,
      isCheckingAuth: false,
      isLoggingIn: false,
      error: null,
    });
  },

  clearAuthError: () => {
    set({
      error: null,
    });
  },

  updateAccount: async (payload) => {
    set({
      isUpdatingAccount: true,
      error: null,
    });

    try {
      const result = await authApi.updateAccount(payload);

      set({
        user: result.user,
        isUpdatingAccount: false,
        error: null,
      });
    } catch (error) {
      set({
        isUpdatingAccount: false,
        error: getApiErrorMessage(error, "Unable to update account."),
      });

      throw error;
    }
  },
}));
