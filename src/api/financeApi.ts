import { apiClient } from "@/api/client";
import {
  ApiResponse,
  BackendFinanceProfile,
  BackendReport,
  CreateExpenseResponse,
  ExpenseListResponse,
} from "@/types/api";
import { FinanceProfile, OverviewFilter } from "@/types/finance";

export type SaveBudgetPayload = {
  income: number;
  currency: "USD" | "PHP";
  period: "weekly" | "monthly";

  monthlyStartDay: number;
  weeklyStartDay: number;

  categories: Array<{
    id?: string;
    name: string;
    limit: number;
    icon?: string;
    color?: string;
    sortOrder?: number;
  }>;

  funds: Array<{
    type: "savings" | "emergency" | "luxe";
    name: string;
    percentage: number;
  }>;
};

export type CreateExpensePayload = {
  title: string;
  amount: number;
  categoryId: string;
  expenseDate?: string;

  source: "manual" | "receipt";

  receiptId?: string;
  merchant?: string;
  notes?: string;
  paymentMethod?: string;
};

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export type GetExpensesParams = {
  filter?: OverviewFilter;
  date?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
};

export type GetReportParams = {
  filter: OverviewFilter;
  date?: string;
};

export type UpdateFinanceSettingsPayload = {
  currency?: "USD" | "PHP";
  period?: "weekly" | "monthly";
  monthlyStartDay?: number;
  weeklyStartDay?: number;
};

export type FinanceSettingsResponse = {
  id: string;
  income: number;
  currency: "USD" | "PHP";
  period: "weekly" | "monthly";
  monthlyStartDay: number;
  weeklyStartDay: number;
};

export const financeApi = {
  async getProfile(): Promise<BackendFinanceProfile> {
    const response =
      await apiClient.get<ApiResponse<BackendFinanceProfile>>(
        "/finance/profile",
      );

    return response.data.data;
  },

  async getExpenses(
    params: GetExpensesParams = {},
  ): Promise<ExpenseListResponse> {
    const response = await apiClient.get<ApiResponse<ExpenseListResponse>>(
      "/finance/expenses",
      {
        params: {
          filter: params.filter ?? "monthly",

          date: params.date,

          categoryId: params.categoryId,

          page: params.page ?? 1,

          pageSize: params.pageSize ?? 100,
        },
      },
    );

    return response.data.data;
  },

  async getReport(params: GetReportParams): Promise<BackendReport> {
    const response = await apiClient.get<ApiResponse<BackendReport>>(
      "/finance/reports/summary",
      {
        params: {
          filter: params.filter,

          date: params.date,
        },
      },
    );

    return response.data.data;
  },

  async loadDashboardData(): Promise<FinanceProfile> {
    const profile = await financeApi.getProfile();

    const [expensesResponse, report] = await Promise.all([
      financeApi.getExpenses({
        filter: profile.period,

        page: 1,
        pageSize: 100,
      }),

      financeApi.getReport({
        filter: profile.period,
      }),
    ]);

    const spentByCategory = new Map<string, number>(
      report.categoryBreakdown.map((category) => [category.id, category.spent]),
    );

    return {
      income: profile.income,

      currency: profile.currency,

      period: profile.period,

      monthlyStartDay: profile.monthlyStartDay,

      weeklyStartDay: profile.weeklyStartDay,

      categories: profile.categories.map((category) => ({
        id: category.id,

        name: category.name,

        limit: category.limit,

        spent: spentByCategory.get(category.id) ?? 0,

        icon: category.icon,

        color: category.color,

        sortOrder: category.sortOrder,
      })),

      funds: profile.funds.map((fund) => ({
        id: fund.id,

        name:
          fund.type === "emergency"
            ? "Emergency Fund"
            : fund.type === "luxe"
              ? "Luxe Fund"
              : "Savings",

        percentage: fund.percentage,
      })),

      expenses: expensesResponse.items.map((expense) => ({
        id: expense.id,

        title: expense.title,

        amount: expense.amount,

        categoryId: expense.categoryId,

        categoryName: expense.categoryName,

        date: expense.date,

        source: expense.source,

        receiptId: expense.receiptId,

        merchant: expense.merchant,

        notes: expense.notes,

        paymentMethod: expense.paymentMethod,
      })),
    };
  },

  async saveBudget(profile: FinanceProfile): Promise<BackendFinanceProfile> {
    const payload: SaveBudgetPayload = {
      income: profile.income,

      currency: profile.currency,

      period: profile.period,

      monthlyStartDay: profile.monthlyStartDay,

      weeklyStartDay: profile.weeklyStartDay,

      categories: profile.categories.map((category, index) => ({
        id: category.id.startsWith("new-") ? undefined : category.id,

        name: category.name,

        limit: category.limit,

        icon: category.icon ?? undefined,

        color: category.color ?? undefined,

        sortOrder: category.sortOrder ?? index + 1,
      })),

      funds: profile.funds.map((fund) => ({
        type:
          fund.name === "Emergency Fund"
            ? "emergency"
            : fund.name === "Luxe Fund"
              ? "luxe"
              : "savings",

        name: fund.name,

        percentage: fund.percentage,
      })),
    };

    const response = await apiClient.put<ApiResponse<BackendFinanceProfile>>(
      "/finance/profile",
      payload,
    );

    return response.data.data;
  },

  async createExpense(
    payload: CreateExpensePayload,
  ): Promise<CreateExpenseResponse> {
    const response = await apiClient.post<ApiResponse<CreateExpenseResponse>>(
      "/finance/expenses",
      payload,
    );

    return response.data.data;
  },

  async updateExpense(
    expenseId: string,
    payload: UpdateExpensePayload,
  ): Promise<CreateExpenseResponse> {
    const response = await apiClient.patch<ApiResponse<CreateExpenseResponse>>(
      `/finance/expenses/${expenseId}`,
      payload,
    );

    return response.data.data;
  },

  async deleteExpense(expenseId: string): Promise<void> {
    await apiClient.delete(`/finance/expenses/${expenseId}`);
  },

  async resetFinanceData(): Promise<BackendFinanceProfile> {
    const response =
      await apiClient.delete<ApiResponse<BackendFinanceProfile>>(
        "/finance/reset",
      );

    return response.data.data;
  },

  async updateSettings(
    payload: UpdateFinanceSettingsPayload,
  ): Promise<FinanceSettingsResponse> {
    const response = await apiClient.patch<
      ApiResponse<FinanceSettingsResponse>
    >("/finance/settings", payload);

    return response.data.data;
  },
};
