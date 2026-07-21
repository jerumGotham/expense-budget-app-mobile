export type BudgetPeriod = "weekly" | "monthly";

export type OverviewFilter = "weekly" | "monthly" | "yearly";

export type Currency = "USD" | "PHP";

export type BudgetCategory = {
  id: string;
  name: string;
  limit: number;
  spent: number;
  icon?: string | null;
  color?: string | null;
  sortOrder?: number;
};

export type FundName = "Savings" | "Emergency Fund" | "Luxe Fund";

export type Fund = {
  id: string;
  name: FundName;
  percentage: number;
};

export type ExpenseSource = "manual" | "receipt";

export type Expense = {
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
export type FinanceProfile = {
  income: number;
  currency: Currency;
  period: BudgetPeriod;

  monthlyStartDay: number;
  weeklyStartDay: number;

  categories: BudgetCategory[];
  funds: Fund[];
  expenses: Expense[];
};
