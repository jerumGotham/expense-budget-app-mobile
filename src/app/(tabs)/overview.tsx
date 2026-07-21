import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  CalendarDays,
  Camera,
  Plus,
  Target,
  WalletCards,
} from "lucide-react-native";
import { router } from "expo-router";

import Screen from "@/components/Screen";
import HeroBalanceCard from "@/components/HeroBalanceCard";
import QuickActionCard from "@/components/QuickActionCard";
import PremiumBudgetCard from "@/components/PremiumBudgetCard";
import FundCard from "@/components/FundCard";

import { useFinanceStore } from "@/store/financeStore";
import { formatMoney } from "@/utils/money";
import { convertPeriodAmount, getPeriodLabel } from "@/utils/period";
import { BudgetCategory, OverviewFilter } from "@/types/finance";
import AppSplashScreen from "@/components/AppSplashScreen";

const OVERVIEW_FILTERS: OverviewFilter[] = ["weekly", "monthly", "yearly"];

export default function OverviewScreen() {
  const profile = useFinanceStore((state) => state.profile);

  const [filter, setFilter] = useState<OverviewFilter>("monthly");

  if (!profile) {
    return <AppSplashScreen message="Loading financial data..." />;
  }

  const baseTotalSpent = profile.categories.reduce(
    (sum, category) => sum + category.spent,
    0,
  );

  const baseTotalBudget = profile.categories.reduce(
    (sum, category) => sum + category.limit,
    0,
  );

  const income = convertPeriodAmount(profile.income, profile.period, filter);

  const totalSpent = convertPeriodAmount(
    baseTotalSpent,
    profile.period,
    filter,
  );

  const totalBudget = convertPeriodAmount(
    baseTotalBudget,
    profile.period,
    filter,
  );

  const remainingBalance = income - totalSpent;

  const plannedSavings = Math.max(income - totalBudget, 0);

  const budgetPercent =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const convertedCategories: BudgetCategory[] = profile.categories.map(
    (category) => ({
      ...category,
      limit: convertPeriodAmount(category.limit, profile.period, filter),
      spent: convertPeriodAmount(category.spent, profile.period, filter),
    }),
  );

  const periodLabel = getPeriodLabel(filter);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View className="mb-5">
          <Text className="text-violet font-black text-base">Lara Finance</Text>

          <Text className="text-ink text-4xl font-black mt-2">
            Money Overview
          </Text>

          <View className="flex-row items-center mt-2">
            <CalendarDays color="#7B746B" size={15} />

            <Text className="text-muted ml-2 capitalize">
              {profile.period} budget shown as a {filter} view
            </Text>
          </View>
        </View>

        <View className="flex-row bg-white rounded-2xl p-1 mb-5 border border-[#E7DED2]">
          {OVERVIEW_FILTERS.map((item) => {
            const isSelected = filter === item;

            return (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                className={`flex-1 h-11 rounded-xl items-center justify-center ${
                  isSelected ? "bg-violet" : "bg-white"
                }`}
              >
                <Text
                  className={`font-black capitalize ${
                    isSelected ? "text-white" : "text-muted"
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <HeroBalanceCard
          income={income}
          expenses={totalSpent}
          remaining={remainingBalance}
          savings={plannedSavings}
          budgetPercent={budgetPercent}
          currency={profile.currency}
        />

        <View className="rounded-3xl bg-white border border-[#ECE7DF] px-5 py-4 mb-6">
          <Text className="text-muted text-xs font-bold">
            PLANNED SAVINGS FOR THIS {periodLabel.toUpperCase()}
          </Text>

          <Text className="text-ink text-2xl font-black mt-1">
            {formatMoney(plannedSavings, profile.currency)}
          </Text>

          <Text className="text-muted text-xs mt-1">
            Income minus all category budget limits
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-between gap-y-4 mb-7">
          <QuickActionCard
            title="Add Expense"
            subtitle="Manual entry"
            icon={<Plus color="#5B3FFF" size={24} />}
            onPress={() => router.push("/expenses")}
          />

          <QuickActionCard
            title="Scan Receipt"
            subtitle="Auto detect"
            icon={<Camera color="#5B3FFF" size={24} />}
            onPress={() => router.push("/expenses")}
          />

          <QuickActionCard
            title="Budget"
            subtitle={formatMoney(totalBudget, profile.currency)}
            icon={<WalletCards color="#5B3FFF" size={24} />}
            onPress={() => router.push("/budget")}
          />

          <QuickActionCard
            title="Funds"
            subtitle={formatMoney(plannedSavings, profile.currency)}
            icon={<Target color="#5B3FFF" size={24} />}
            onPress={() => router.push("/budget")}
          />
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-ink text-2xl font-black">
              Category Budgets
            </Text>

            <Text className="text-muted text-xs mt-1 capitalize">
              Estimated {filter} values
            </Text>
          </View>

          <Pressable onPress={() => router.push("/budget")}>
            <Text className="text-violet font-black">Edit</Text>
          </Pressable>
        </View>

        {convertedCategories.map((category) => (
          <PremiumBudgetCard
            key={category.id}
            category={category}
            currency={profile.currency}
          />
        ))}

        <Text className="text-ink text-2xl font-black mt-4 mb-1">
          Savings Funds
        </Text>

        <Text className="text-muted text-xs mb-4 capitalize">
          Allocation for this {periodLabel}
        </Text>

        {profile.funds.map((fund) => (
          <FundCard
            key={fund.id}
            fund={fund}
            autoSavings={plannedSavings}
            currency={profile.currency}
          />
        ))}

        <View className="flex-row justify-between items-center mt-5 mb-4">
          <View>
            <Text className="text-ink text-2xl font-black">
              Recent Transactions
            </Text>

            <Text className="text-muted text-xs mt-1">
              Latest recorded expenses
            </Text>
          </View>

          <Pressable onPress={() => router.push("/expenses")}>
            <Text className="text-violet font-black">View all</Text>
          </Pressable>
        </View>

        <View className="bg-white rounded-[30px] p-5 border border-[#ECE7DF] mb-10">
          {profile.expenses.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-4xl">🧾</Text>

              <Text className="text-ink font-black mt-3">No expenses yet</Text>

              <Text className="text-muted text-xs mt-1 text-center">
                Add an expense manually or scan a receipt.
              </Text>
            </View>
          ) : (
            profile.expenses.slice(0, 5).map((expense, index) => (
              <View
                key={expense.id}
                className={`flex-row justify-between items-center py-4 ${
                  index < Math.min(profile.expenses.length, 5) - 1
                    ? "border-b border-[#EFEAE1]"
                    : ""
                }`}
              >
                <View className="flex-row items-center flex-1 pr-3">
                  <View className="h-11 w-11 rounded-2xl bg-[#F8F5EF] items-center justify-center mr-3">
                    <Text className="text-xl">💸</Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-ink font-black" numberOfLines={1}>
                      {expense.title}
                    </Text>

                    <Text className="text-muted text-xs mt-1" numberOfLines={1}>
                      {expense.categoryName} · {expense.source}
                    </Text>
                  </View>
                </View>

                <Text className="text-danger font-black">
                  -{formatMoney(expense.amount, profile.currency)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
