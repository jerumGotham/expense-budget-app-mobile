import {
  BudgetPeriod,
  Currency,
  ExpenseSource,
  OverviewFilter,
} from "@/types/finance";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  details?: unknown;
};

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

export type BackendCategory = {
  id: string;
  name: string;
  limit: number;
  icon?: string | null;
  color?: string | null;
  sortOrder?: number;
};

export type BackendFund = {
  id: string;
  type: "savings" | "emergency" | "luxe";
  name: string;
  percentage: number;
};

export type BackendExpense = {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  date: string;
  source: ExpenseSource;
  receiptId?: string | null;
  merchant?: string | null;
  notes?: string | null;
  paymentMethod?: string | null;
};

export type ExpenseListResponse = {
  items: BackendExpense[];

  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type BackendReportCategory = {
  id: string;
  name: string;
  limit: number;
  spent: number;
  percentage: number;
};

export type BackendReport = {
  filter: OverviewFilter;
  start: string;
  end: string;
  income: number;
  totalBudget: number;
  totalExpenses: number;
  plannedSavings: number;
  remainingBalance: number;
  budgetUsed: number;
  categoryBreakdown: BackendReportCategory[];
};

export type BudgetAlert = {
  id: string;
  type: "near_limit" | "over_limit";
  title: string;
  body: string;
  categoryId: string;
  percentage: number;
};

export type CreateExpenseResponse = {
  expense: BackendExpense;
  alerts: BudgetAlert[];
};

export type ReceiptScanResponse = {
  receiptId: string;
  title: string;
  merchant: string | null;
  amount: number | null;
  currency: string | null;
  expenseDate: string | null;
  suggestedCategoryId: string | null;
  suggestedCategoryName: string | null;
  confidence: number;
  rawText?: string;
};

export type BackendFinanceProfile = {
  income: number;
  currency: Currency;
  period: BudgetPeriod;

  monthlyStartDay: number;
  weeklyStartDay: number;

  categories: BackendCategory[];
  funds: BackendFund[];
};
