import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import Screen from "@/components/Screen";
import AppSplashScreen from "@/components/AppSplashScreen";

import { useFinanceStore } from "@/store/financeStore";
import { useReportStore } from "@/store/reportStore";

import { OverviewFilter } from "@/types/finance";
import { formatMoney } from "@/utils/money";
import { getPeriodLabel } from "@/utils/period";

const FILTERS: OverviewFilter[] = ["weekly", "monthly", "yearly"];

export default function ReportsScreen() {
  const profile = useFinanceStore((state) => state.profile);

  const report = useReportStore((state) => state.report);

  const filter = useReportStore((state) => state.selectedFilter);

  const loadReport = useReportStore((state) => state.loadReport);

  const setSelectedFilter = useReportStore((state) => state.setSelectedFilter);

  const isLoading = useReportStore((state) => state.isLoadingReport);

  useEffect(() => {
    void loadReport(filter);
  }, []);

  if (!profile) {
    return <AppSplashScreen message="Loading financial report..." />;
  }

  const changeFilter = async (next: OverviewFilter) => {
    setSelectedFilter(next);

    await loadReport(next);
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-violet font-black mb-2">Reports</Text>

        <Text className="text-ink text-4xl font-black">Financial Summary</Text>

        <Text className="text-muted mt-2 mb-5 capitalize">
          Actual {filter} report from your finance data.
        </Text>

        {/* FILTER */}

        <View className="flex-row bg-white rounded-2xl p-1 mb-6 border border-[#E7DED2]">
          {FILTERS.map((item) => {
            const active = filter === item;

            return (
              <Pressable
                key={item}
                onPress={() => void changeFilter(item)}
                className={`flex-1 h-11 rounded-xl items-center justify-center ${
                  active ? "bg-violet" : "bg-white"
                }`}
              >
                <Text
                  className={`font-black capitalize ${
                    active ? "text-white" : "text-muted"
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isLoading || !report ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#5B3FFF" />

            <Text className="text-muted mt-3">Loading report...</Text>
          </View>
        ) : (
          <>
            {/* HERO */}

            <View className="rounded-[34px] bg-[#111827] p-6 mb-6">
              <Text className="text-white/70">
                Remaining {getPeriodLabel(filter)}
              </Text>

              <Text className="text-white text-4xl font-black mt-2">
                {formatMoney(report.remainingBalance, profile.currency)}
              </Text>

              <Text className="text-white/70 mt-2 text-xs">
                Income minus expenses
              </Text>
            </View>

            {/* SUMMARY */}

            <SummaryCard
              title="Income"
              value={formatMoney(report.income, profile.currency)}
            />

            <SummaryCard
              title="Budget"
              value={formatMoney(report.totalBudget, profile.currency)}
            />

            <SummaryCard
              title="Expenses"
              value={formatMoney(report.totalExpenses, profile.currency)}
              valueColor="text-danger"
            />

            <SummaryCard
              title="Planned Savings"
              value={formatMoney(report.plannedSavings, profile.currency)}
              valueColor="text-success"
            />

            <SummaryCard
              title="Budget Used"
              value={`${report.budgetUsed}%`}
              valueColor={
                report.budgetUsed >= 100
                  ? "text-danger"
                  : report.budgetUsed >= 80
                    ? "text-yellow-500"
                    : "text-success"
              }
            />

            {/* CATEGORY */}

            <Text className="text-ink text-2xl font-black mt-6 mb-3">
              Category Breakdown
            </Text>

            <View className="rounded-[30px] bg-white p-5 border border-[#E7DED2] mb-8">
              {report.categoryBreakdown.map((category, index) => (
                <View
                  key={category.id}
                  className={`py-4 ${
                    index < report.categoryBreakdown.length - 1
                      ? "border-b border-[#ECE7DF]"
                      : ""
                  }`}
                >
                  <View className="flex-row justify-between">
                    <Text className="text-ink font-black">{category.name}</Text>

                    <Text className="text-muted">
                      {formatMoney(category.spent, profile.currency)} /{" "}
                      {formatMoney(category.limit, profile.currency)}
                    </Text>
                  </View>

                  <View className="h-2.5 rounded-full bg-[#EFEAE1] overflow-hidden mt-3">
                    <View
                      className="h-full bg-violet rounded-full"
                      style={{
                        width: `${Math.min(category.percentage, 100)}%`,
                      }}
                    />
                  </View>

                  <Text className="text-muted text-xs mt-2">
                    {category.percentage}% used
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function SummaryCard({
  title,
  value,
  valueColor = "text-ink",
}: {
  title: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View className="rounded-3xl bg-white p-5 border border-[#E7DED2] mb-3">
      <Text className="text-muted">{title}</Text>

      <Text className={`text-2xl font-black mt-2 ${valueColor}`}>{value}</Text>
    </View>
  );
}
