import { create } from "zustand";

import { financeApi } from "@/api/financeApi";
import { BudgetPeriod, Currency, FinanceProfile } from "@/types/finance";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
type FinanceState = {
  profile: FinanceProfile | null;

  isLoading: boolean;
  isSaving: boolean;
  isInitialized: boolean;
  error: string | null;

  initializeFinance: () => Promise<void>;
  refreshFinance: () => Promise<void>;
  saveBudget: () => Promise<void>;
  startFresh: () => Promise<void>;
  clearFinance: () => void;

  updateIncome: (income: number) => void;
  changeBudgetPeriod: (period: BudgetPeriod) => void;

  updateMonthlyStartDay: (day: number) => void;
  updateWeeklyStartDay: (day: number) => void;

  addCategory: (name: string) => void;
  removeCategory: (categoryId: string) => void;

  updateCategoryLimit: (categoryId: string, limit: number) => void;

  updateFundPercentage: (fundId: string, percentage: number) => void;
  updateCurrency: (currency: Currency) => void;

  saveFinanceSettings: (payload: {
    currency?: "USD" | "PHP";
    period?: "weekly" | "monthly";
    monthlyStartDay?: number;
    weeklyStartDay?: number;
  }) => Promise<void>;
};

const roundAmount = (value: number): number => Number(value.toFixed(2));

export const useFinanceStore = create<FinanceState>((set, get) => ({
  profile: null,

  isLoading: false,
  isSaving: false,
  isInitialized: false,
  error: null,

  initializeFinance: async () => {
    set({
      isLoading: true,
      isInitialized: false,
      error: null,
    });

    try {
      const profile = await financeApi.loadDashboardData();

      set({
        profile,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      set({
        profile: null,
        isLoading: false,
        isInitialized: false,
        error: getApiErrorMessage(error, "Unable to load finance data."),
      });

      throw error;
    }
  },

  refreshFinance: async () => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const profile = await financeApi.loadDashboardData();

      set({
        profile,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, "Unable to refresh finance data."),
      });

      throw error;
    }
  },

  saveBudget: async () => {
    const profile = get().profile;

    if (!profile) {
      throw new Error("Finance profile is not loaded.");
    }

    set({
      isSaving: true,
      error: null,
    });

    try {
      await financeApi.saveBudget(profile);

      const refreshed = await financeApi.loadDashboardData();

      set({
        profile: refreshed,
        isSaving: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      set({
        isSaving: false,
        error: getApiErrorMessage(error, "Unable to save the budget."),
      });

      throw error;
    }
  },

  startFresh: async () => {
    set({
      isSaving: true,
      error: null,
    });

    try {
      await financeApi.resetFinanceData();

      const refreshed = await financeApi.loadDashboardData();

      set({
        profile: refreshed,
        isSaving: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      set({
        isSaving: false,
        error: getApiErrorMessage(error, "Unable to reset finance data."),
      });

      throw error;
    }
  },

  clearFinance: () => {
    set({
      profile: null,
      isLoading: false,
      isSaving: false,
      isInitialized: false,
      error: null,
    });
  },

  updateIncome: (income) => {
    set((state) => {
      if (!state.profile) {
        return state;
      }

      return {
        profile: {
          ...state.profile,
          income: Math.max(income, 0),
        },
      };
    });
  },

  changeBudgetPeriod: (newPeriod) => {
    set((state) => {
      if (!state.profile) {
        return state;
      }

      const currentPeriod = state.profile.period;

      if (currentPeriod === newPeriod) {
        return state;
      }

      const multiplier =
        currentPeriod === "monthly" && newPeriod === "weekly"
          ? 12 / 52
          : 52 / 12;

      return {
        profile: {
          ...state.profile,

          period: newPeriod,

          income: roundAmount(state.profile.income * multiplier),

          categories: state.profile.categories.map((category) => ({
            ...category,

            limit: roundAmount(category.limit * multiplier),

            /*
             * Do not convert actual spending.
             * It will be recalculated from expense dates
             * after the budget is saved.
             */
            spent: category.spent,
          })),
        },
      };
    });
  },

  updateMonthlyStartDay: (day) => {
    const safeDay = Math.min(Math.max(day, 1), 28);

    set((state) => {
      if (!state.profile) {
        return state;
      }

      return {
        profile: {
          ...state.profile,
          monthlyStartDay: safeDay,
        },
      };
    });
  },

  updateWeeklyStartDay: (day) => {
    const safeDay = Math.min(Math.max(day, 0), 6);

    set((state) => {
      if (!state.profile) {
        return state;
      }

      return {
        profile: {
          ...state.profile,
          weeklyStartDay: safeDay,
        },
      };
    });
  },

  updateCategoryLimit: (categoryId, limit) => {
    set((state) => {
      if (!state.profile) {
        return state;
      }

      return {
        profile: {
          ...state.profile,

          categories: state.profile.categories.map((category) =>
            category.id === categoryId
              ? {
                  ...category,
                  limit: Math.max(limit, 0),
                }
              : category,
          ),
        },
      };
    });
  },

  addCategory: (name) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    set((state) => {
      if (!state.profile) {
        return state;
      }

      const alreadyExists = state.profile.categories.some(
        (category) =>
          category.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      );

      if (alreadyExists) {
        return state;
      }

      return {
        profile: {
          ...state.profile,

          categories: [
            ...state.profile.categories,
            {
              id: `new-${Date.now()}`,
              name: trimmedName,
              limit: 0,
              spent: 0,
              sortOrder: state.profile.categories.length + 1,
            },
          ],
        },
      };
    });
  },

  removeCategory: (categoryId) => {
    set((state) => {
      if (!state.profile) {
        return state;
      }

      return {
        profile: {
          ...state.profile,

          categories: state.profile.categories
            .filter((category) => category.id !== categoryId)
            .map((category, index) => ({
              ...category,
              sortOrder: index + 1,
            })),
        },
      };
    });
  },

  updateFundPercentage: (fundId, percentage) => {
    const safePercentage = Math.min(Math.max(percentage, 0), 100);

    set((state) => {
      if (!state.profile) {
        return state;
      }

      return {
        profile: {
          ...state.profile,

          funds: state.profile.funds.map((fund) =>
            fund.id === fundId
              ? {
                  ...fund,
                  percentage: safePercentage,
                }
              : fund,
          ),
        },
      };
    });
  },

  updateCurrency: (currency) => {
    set((state) => {
      if (!state.profile) {
        return state;
      }

      return {
        profile: {
          ...state.profile,
          currency,
        },
      };
    });
  },

  saveFinanceSettings: async (payload) => {
    set({
      isSaving: true,
      error: null,
    });

    try {
      const updated = await financeApi.updateSettings(payload);

      set((state) => {
        if (!state.profile) {
          return {
            isSaving: false,
          };
        }

        return {
          profile: {
            ...state.profile,

            currency: updated.currency,

            period: updated.period,

            monthlyStartDay: updated.monthlyStartDay,

            weeklyStartDay: updated.weeklyStartDay,
          },

          isSaving: false,
          error: null,
        };
      });
    } catch (error) {
      set({
        isSaving: false,
        error: getApiErrorMessage(error, "Unable to update finance settings."),
      });

      throw error;
    }
  },
}));
