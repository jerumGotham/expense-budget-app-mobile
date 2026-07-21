import { useState } from "react";
import {
  Alert,
  InputAccessoryView,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  AlertTriangle,
  CalendarDays,
  CircleDollarSign,
  PiggyBank,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react-native";

import AppSplashScreen from "@/components/AppSplashScreen";
import Screen from "@/components/Screen";

import { useFinanceStore } from "@/store/financeStore";

import { BudgetPeriod } from "@/types/finance";

import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { formatMoney } from "@/utils/money";
import { getPeriodLabel } from "@/utils/period";

const BUDGET_PERIODS: BudgetPeriod[] = ["weekly", "monthly"];

/**
 * The backend currently accepts monthlyStartDay from 1 to 28.
 * This avoids invalid dates during February and shorter months.
 */
const MONTHLY_START_DAYS = [1, 7, 14, 21, 25, 28];

const WEEK_DAYS = [
  {
    label: "Sunday",
    shortLabel: "Sun",
    value: 0,
  },
  {
    label: "Monday",
    shortLabel: "Mon",
    value: 1,
  },
  {
    label: "Tuesday",
    shortLabel: "Tue",
    value: 2,
  },
  {
    label: "Wednesday",
    shortLabel: "Wed",
    value: 3,
  },
  {
    label: "Thursday",
    shortLabel: "Thu",
    value: 4,
  },
  {
    label: "Friday",
    shortLabel: "Fri",
    value: 5,
  },
  {
    label: "Saturday",
    shortLabel: "Sat",
    value: 6,
  },
];

const KEYBOARD_ACCESSORY_ID = "budget-number-keyboard";

export default function BudgetScreen() {
  /*
   * All hooks must be called before the profile null return.
   */

  const profile = useFinanceStore((state) => state.profile);

  const updateIncome = useFinanceStore((state) => state.updateIncome);

  const changeBudgetPeriod = useFinanceStore(
    (state) => state.changeBudgetPeriod,
  );

  const updateMonthlyStartDay = useFinanceStore(
    (state) => state.updateMonthlyStartDay,
  );

  const updateWeeklyStartDay = useFinanceStore(
    (state) => state.updateWeeklyStartDay,
  );

  const addCategory = useFinanceStore((state) => state.addCategory);

  const removeCategory = useFinanceStore((state) => state.removeCategory);

  const updateCategoryLimit = useFinanceStore(
    (state) => state.updateCategoryLimit,
  );

  const updateFundPercentage = useFinanceStore(
    (state) => state.updateFundPercentage,
  );

  const saveBudget = useFinanceStore((state) => state.saveBudget);

  const isSaving = useFinanceStore((state) => state.isSaving);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");

  if (!profile) {
    return <AppSplashScreen message="Loading financial data..." />;
  }

  const totalCategoryBudget = profile.categories.reduce(
    (sum, category) => sum + category.limit,
    0,
  );

  const rawPlannedSavings = profile.income - totalCategoryBudget;

  const plannedSavings = Math.max(rawPlannedSavings, 0);

  const overallocatedAmount = Math.max(totalCategoryBudget - profile.income, 0);

  const totalFundPercentage = profile.funds.reduce(
    (sum, fund) => sum + fund.percentage,
    0,
  );

  const isFundSplitValid = totalFundPercentage === 100;

  const canUseSavingsSplit = overallocatedAmount === 0 && plannedSavings > 0;

  const canSave =
    profile.income > 0 &&
    profile.categories.length > 0 &&
    overallocatedAmount === 0 &&
    isFundSplitValid &&
    !isSaving;

  const periodLabel = getPeriodLabel(profile.period);

  const currencySymbol = profile.currency === "USD" ? "$" : "₱";

  const selectedWeeklyDay =
    WEEK_DAYS.find((day) => day.value === profile.weeklyStartDay)?.label ??
    "Monday";

  const handleIncomeChange = (value: string) => {
    const normalizedValue = normalizeDecimalInput(value);

    updateIncome(Number(normalizedValue || 0));
  };

  const handleCategoryChange = (categoryId: string, value: string) => {
    const normalizedValue = normalizeDecimalInput(value);

    updateCategoryLimit(categoryId, Number(normalizedValue || 0));
  };

  const handleFundPercentageChange = (fundId: string, value: string) => {
    const normalizedValue = value.replace(/[^0-9]/g, "");

    const percentage = Math.min(Number(normalizedValue || 0), 100);

    updateFundPercentage(fundId, percentage);
  };

  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim();

    if (!trimmedName) {
      Alert.alert(
        "Category name required",
        "Enter a name for the expense category.",
      );

      return;
    }

    const alreadyExists = profile.categories.some(
      (category) =>
        category.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );

    if (alreadyExists) {
      Alert.alert(
        "Category already exists",
        "Choose a different category name.",
      );

      return;
    }

    addCategory(trimmedName);

    setNewCategoryName("");
    setCategoryModalVisible(false);
  };

  const closeCategoryModal = () => {
    Keyboard.dismiss();
    setNewCategoryName("");
    setCategoryModalVisible(false);
  };

  const confirmRemoveCategory = (categoryId: string, categoryName: string) => {
    Alert.alert(
      "Remove category?",
      `${categoryName} will be removed from this budget plan.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeCategory(categoryId);
          },
        },
      ],
    );
  };

  const handleSaveBudget = async () => {
    Keyboard.dismiss();

    if (profile.income <= 0) {
      Alert.alert("Invalid income", "Enter an income greater than zero.");

      return;
    }

    if (profile.categories.length === 0) {
      Alert.alert(
        "No categories",
        "Add at least one expense category before saving your budget.",
      );

      return;
    }

    const emptyCategory = profile.categories.find(
      (category) => !category.name.trim(),
    );

    if (emptyCategory) {
      Alert.alert("Invalid category", "Every category must have a name.");

      return;
    }

    if (overallocatedAmount > 0) {
      Alert.alert(
        "Budget exceeds income",
        `Reduce your category budgets by ${formatMoney(
          overallocatedAmount,
          profile.currency,
        )} before saving.`,
      );

      return;
    }

    if (!isFundSplitValid) {
      Alert.alert(
        "Invalid savings allocation",
        `Savings allocation must equal 100%. It is currently ${totalFundPercentage}%.`,
      );

      return;
    }

    try {
      await saveBudget();

      Alert.alert(
        "Budget saved",
        `Your ${profile.period} budget plan was saved successfully.`,
      );
    } catch (error) {
      console.error("Save budget error:", error);

      Alert.alert(
        "Unable to save budget",
        getApiErrorMessage(error, "Review your budget details and try again."),
      );
    }
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 70,
        }}
      >
        <Text className="text-violet font-black mb-2">Budget Setup</Text>

        <Text className="text-ink text-4xl font-black">Budget Plan</Text>

        <Text className="text-muted mt-2 mb-6 leading-5">
          Set your income, add spending categories, choose when your budget
          period starts, and allocate your planned savings.
        </Text>

        {/* Income */}

        <View className="rounded-[30px] bg-white p-5 border border-[#E7DED2] mb-5">
          <View className="flex-row items-center mb-3">
            <View className="h-10 w-10 rounded-2xl bg-[#F3F0FF] items-center justify-center mr-3">
              <CircleDollarSign color="#5B3FFF" size={22} />
            </View>

            <View className="flex-1">
              <Text className="text-ink font-black">Income</Text>

              <Text className="text-muted text-xs mt-1 capitalize">
                Income available each {periodLabel}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center h-14 rounded-2xl bg-[#F7F2EC] px-4">
            <Text className="text-muted font-black mr-2">{currencySymbol}</Text>

            <TextInput
              value={formatInputValue(profile.income)}
              onChangeText={handleIncomeChange}
              editable={!isSaving}
              keyboardType="decimal-pad"
              inputAccessoryViewID={
                Platform.OS === "ios" ? KEYBOARD_ACCESSORY_ID : undefined
              }
              className="flex-1 text-ink text-lg font-black"
              placeholder="4000"
              placeholderTextColor="#AAA39A"
            />
          </View>

          <Text className="text-muted text-xs mt-2 capitalize">
            Example: {formatMoney(4000, profile.currency)} per {periodLabel}
          </Text>
        </View>

        {/* Budget period */}

        <View className="rounded-[30px] bg-white p-5 border border-[#E7DED2] mb-5">
          <Text className="text-ink font-black mb-1">Budget Period</Text>

          <Text className="text-muted text-xs mb-4">
            Choose how often your income and category budgets repeat.
          </Text>

          <View className="flex-row gap-3">
            {BUDGET_PERIODS.map((period) => {
              const isSelected = profile.period === period;

              return (
                <Pressable
                  key={period}
                  disabled={isSaving}
                  onPress={() => changeBudgetPeriod(period)}
                  className={`flex-1 h-12 rounded-2xl items-center justify-center ${
                    isSelected ? "bg-violet" : "bg-[#F7F2EC]"
                  } ${isSaving ? "opacity-60" : ""}`}
                >
                  <Text
                    className={`font-black capitalize ${
                      isSelected ? "text-white" : "text-ink"
                    }`}
                  >
                    {period}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="text-muted text-xs mt-3 leading-5">
            Income and category limits are converted automatically when changing
            periods.
          </Text>
        </View>

        {/* Reset schedule */}

        <View className="rounded-[30px] bg-white p-5 border border-[#E7DED2] mb-5">
          <View className="flex-row items-center mb-4">
            <View className="h-10 w-10 rounded-2xl bg-[#F3F0FF] items-center justify-center mr-3">
              <CalendarDays color="#5B3FFF" size={22} />
            </View>

            <View className="flex-1">
              <Text className="text-ink font-black">Budget Reset Schedule</Text>

              <Text className="text-muted text-xs mt-1">
                Choose when a new spending period begins.
              </Text>
            </View>
          </View>

          {profile.period === "monthly" ? (
            <>
              <Text className="text-muted text-xs mb-3">
                Start day of every month
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {MONTHLY_START_DAYS.map((day) => {
                  const selected = profile.monthlyStartDay === day;

                  return (
                    <Pressable
                      key={day}
                      disabled={isSaving}
                      onPress={() => updateMonthlyStartDay(day)}
                      className={`h-11 min-w-11 px-3 rounded-xl items-center justify-center ${
                        selected ? "bg-violet" : "bg-[#F7F2EC]"
                      }`}
                    >
                      <Text
                        className={`font-black ${
                          selected ? "text-white" : "text-ink"
                        }`}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View className="rounded-2xl bg-[#F7F2EC] px-4 py-3 mt-4">
                <Text className="text-ink font-black">
                  Starts every day {profile.monthlyStartDay}
                </Text>

                <Text className="text-muted text-xs mt-1 leading-5">
                  Previous transactions stay in history. Only the active
                  reporting period changes.
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text className="text-muted text-xs mb-3">
                Start day of every week
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {WEEK_DAYS.map((day) => {
                  const selected = profile.weeklyStartDay === day.value;

                  return (
                    <Pressable
                      key={day.value}
                      disabled={isSaving}
                      onPress={() => updateWeeklyStartDay(day.value)}
                      className={`h-11 px-3 rounded-xl items-center justify-center ${
                        selected ? "bg-violet" : "bg-[#F7F2EC]"
                      }`}
                    >
                      <Text
                        className={`font-black ${
                          selected ? "text-white" : "text-ink"
                        }`}
                      >
                        {day.shortLabel}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View className="rounded-2xl bg-[#F7F2EC] px-4 py-3 mt-4">
                <Text className="text-ink font-black">
                  Starts every {selectedWeeklyDay}
                </Text>

                <Text className="text-muted text-xs mt-1 leading-5">
                  Current totals are calculated until the next weekly start
                  date.
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Planned savings */}

        <View
          className={`rounded-[30px] p-5 mb-6 ${
            overallocatedAmount > 0 ? "bg-danger" : "bg-[#111827]"
          }`}
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-white/70 text-sm">
                Planned Automatic Savings
              </Text>

              <Text className="text-white text-4xl font-black mt-2">
                {formatMoney(plannedSavings, profile.currency)}
              </Text>
            </View>

            <View className="h-12 w-12 rounded-2xl bg-white/15 items-center justify-center">
              {overallocatedAmount > 0 ? (
                <AlertTriangle color="#FFFFFF" size={24} />
              ) : (
                <PiggyBank color="#FFFFFF" size={24} />
              )}
            </View>
          </View>

          {overallocatedAmount > 0 ? (
            <>
              <Text className="text-white font-black mt-4">
                Budget exceeds income
              </Text>

              <Text className="text-white/80 text-xs mt-1 leading-5">
                Reduce category limits by{" "}
                {formatMoney(overallocatedAmount, profile.currency)} before
                saving.
              </Text>
            </>
          ) : (
            <Text className="text-white/60 text-xs mt-3 leading-5">
              Income minus all category budget limits.
            </Text>
          )}
        </View>

        {/* Categories heading */}

        <View className="flex-row justify-between items-center">
          <View className="flex-1 pr-4">
            <Text className="text-ink text-2xl font-black">
              Expense Categories
            </Text>

            <Text className="text-muted text-xs mt-1">
              Set your planned spending limit for each category.
            </Text>
          </View>

          <Pressable
            disabled={isSaving}
            onPress={() => setCategoryModalVisible(true)}
            className="h-11 px-4 rounded-2xl bg-violet flex-row items-center justify-center"
          >
            <Plus color="#FFFFFF" size={18} />

            <Text className="text-white font-black ml-2">Add</Text>
          </Pressable>
        </View>

        <View className="h-4" />

        {/* Categories */}

        {profile.categories.length === 0 ? (
          <View className="rounded-[28px] bg-white p-6 border border-[#E7DED2] mb-4 items-center">
            <Text className="text-4xl">🗂️</Text>

            <Text className="text-ink font-black text-lg mt-3">
              No expense categories
            </Text>

            <Text className="text-muted text-xs text-center mt-2 leading-5">
              Add Food, Groceries, Utilities, Transport, or any category you
              want to monitor.
            </Text>

            <Pressable
              onPress={() => setCategoryModalVisible(true)}
              className="h-12 px-5 rounded-2xl bg-violet flex-row items-center justify-center mt-5"
            >
              <Plus color="#FFFFFF" size={18} />

              <Text className="text-white font-black ml-2">
                Add First Category
              </Text>
            </Pressable>
          </View>
        ) : (
          profile.categories.map((category) => (
            <View
              key={category.id}
              className="rounded-[28px] bg-white p-5 border border-[#E7DED2] mb-3"
            >
              <View className="flex-row items-center">
                <View className="flex-1 pr-3">
                  <Text className="text-ink font-black text-base">
                    {category.name}
                  </Text>

                  <Text className="text-muted text-xs mt-1">
                    Spent: {formatMoney(category.spent, profile.currency)}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Text className="text-muted font-bold mr-1">
                    {currencySymbol}
                  </Text>

                  <TextInput
                    value={formatInputValue(category.limit)}
                    onChangeText={(value) =>
                      handleCategoryChange(category.id, value)
                    }
                    editable={!isSaving}
                    keyboardType="decimal-pad"
                    inputAccessoryViewID={
                      Platform.OS === "ios" ? KEYBOARD_ACCESSORY_ID : undefined
                    }
                    className="w-24 h-12 rounded-2xl bg-[#F7F2EC] px-3 text-right text-ink font-black"
                    placeholder="0"
                    placeholderTextColor="#AAA39A"
                  />

                  <Pressable
                    disabled={isSaving}
                    onPress={() =>
                      confirmRemoveCategory(category.id, category.name)
                    }
                    className="h-11 w-11 rounded-2xl bg-[#FFF1F1] items-center justify-center ml-2"
                  >
                    <Trash2 color="#E5484D" size={19} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Summary */}

        <View className="rounded-[28px] bg-white p-5 border border-[#E7DED2] mt-2 mb-6">
          <SummaryRow
            label="Total category budget"
            value={formatMoney(totalCategoryBudget, profile.currency)}
          />

          <SummaryRow
            label={`${periodLabel} income`}
            value={formatMoney(profile.income, profile.currency)}
          />

          <SummaryRow
            label="Planned savings"
            value={formatMoney(plannedSavings, profile.currency)}
            valueClassName="text-success"
            isLast
          />
        </View>

        {/* Savings split */}

        <Text className="text-ink text-2xl font-black">Savings Split</Text>

        <Text className="text-muted text-xs mt-1 mb-4 leading-5">
          Divide planned savings among regular savings, emergency fund, and luxe
          fund.
        </Text>

        <View
          className={`rounded-2xl px-4 py-3 mb-4 ${
            isFundSplitValid ? "bg-[#ECFDF3]" : "bg-[#FFF4E5]"
          }`}
        >
          <Text
            className={`font-black ${
              isFundSplitValid ? "text-success" : "text-[#B86E00]"
            }`}
          >
            Total allocation: {totalFundPercentage}%
          </Text>

          <Text
            className={`text-xs mt-1 ${
              isFundSplitValid ? "text-success" : "text-[#B86E00]"
            }`}
          >
            {isFundSplitValid
              ? "Your planned savings are fully allocated."
              : "Adjust the percentages so the total equals 100%."}
          </Text>
        </View>

        {profile.funds.map((fund) => {
          const amount = (plannedSavings * fund.percentage) / 100;

          return (
            <View
              key={fund.id}
              className={`rounded-[28px] bg-white p-5 border mb-3 ${
                canUseSavingsSplit
                  ? "border-[#E7DED2]"
                  : "border-[#EFEAE1] opacity-60"
              }`}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1 pr-4">
                  <Text className="text-ink font-black text-base">
                    {fund.name}
                  </Text>

                  <Text className="text-violet font-black mt-1">
                    {formatMoney(amount, profile.currency)}
                  </Text>

                  <Text className="text-muted text-xs mt-1 capitalize">
                    Per {periodLabel}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <TextInput
                    value={String(fund.percentage)}
                    onChangeText={(value) =>
                      handleFundPercentageChange(fund.id, value)
                    }
                    editable={canUseSavingsSplit && !isSaving}
                    keyboardType="number-pad"
                    inputAccessoryViewID={
                      Platform.OS === "ios" ? KEYBOARD_ACCESSORY_ID : undefined
                    }
                    maxLength={3}
                    className="w-20 h-12 rounded-2xl bg-[#F7F2EC] px-3 text-right text-ink font-black"
                    placeholder="0"
                    placeholderTextColor="#AAA39A"
                  />

                  <Text className="text-ink font-black ml-2">%</Text>
                </View>
              </View>
            </View>
          );
        })}

        {!canUseSavingsSplit && (
          <View className="rounded-2xl bg-[#FFF4E5] px-4 py-3 mt-1 mb-4">
            <Text className="text-[#B86E00] font-black">
              Savings split unavailable
            </Text>

            <Text className="text-[#B86E00] text-xs mt-1 leading-5">
              Add income and keep category budgets below that income before
              allocating savings.
            </Text>
          </View>
        )}

        {/* Save */}

        <Pressable
          disabled={!canSave}
          onPress={() => {
            void handleSaveBudget();
          }}
          className={`h-14 rounded-2xl flex-row items-center justify-center mt-5 ${
            canSave ? "bg-violet" : "bg-[#D7D2CB]"
          }`}
        >
          <Save color="#FFFFFF" size={20} />

          <Text className="text-white font-black ml-2">
            {isSaving ? "Saving Budget..." : "Save Budget Plan"}
          </Text>
        </Pressable>

        {!canSave && !isSaving && (
          <Text className="text-muted text-xs text-center mt-3 leading-5">
            Enter a valid income, add at least one category, keep budgets within
            your income, and ensure savings allocations total 100%.
          </Text>
        )}
      </ScrollView>

      {/* Add category modal */}

      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCategoryModal}
      >
        <Pressable
          onPress={closeCategoryModal}
          className="flex-1 bg-black/40 justify-end"
        >
          <Pressable
            onPress={() => undefined}
            className="rounded-t-[34px] bg-cream px-5 pt-6 pb-10"
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-4">
                <Text className="text-ink text-3xl font-black">
                  Add Category
                </Text>

                <Text className="text-muted mt-2">
                  Create a category for your planned expenses.
                </Text>
              </View>

              <Pressable
                onPress={closeCategoryModal}
                className="h-11 w-11 rounded-full bg-white items-center justify-center"
              >
                <X color="#161616" size={21} />
              </Pressable>
            </View>

            <Text className="text-ink font-black mt-6 mb-2">Category name</Text>

            <TextInput
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
              maxLength={60}
              placeholder="Example: Groceries"
              placeholderTextColor="#AAA39A"
              returnKeyType="done"
              onSubmitEditing={handleAddCategory}
              className="h-14 rounded-2xl bg-white border border-[#E7DED2] px-4 text-ink"
            />

            <Pressable
              onPress={handleAddCategory}
              className="h-14 rounded-2xl bg-violet flex-row items-center justify-center mt-5"
            >
              <Plus color="#FFFFFF" size={20} />

              <Text className="text-white font-black ml-2">Add Category</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* iOS numeric keyboard toolbar */}

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={KEYBOARD_ACCESSORY_ID}>
          <View className="h-12 bg-white border-t border-[#E7DED2] flex-row items-center justify-end px-5">
            <Pressable onPress={() => Keyboard.dismiss()} className="px-3 py-2">
              <Text className="text-violet font-black">Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </Screen>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName = "text-ink",
  isLast = false,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row justify-between py-3 ${
        isLast ? "" : "border-b border-[#EFEAE1]"
      }`}
    >
      <Text className="text-muted font-bold capitalize">{label}</Text>

      <Text className={`font-black ${valueClassName}`}>{value}</Text>
    </View>
  );
}

function normalizeDecimalInput(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");

  const [whole = "", ...decimalParts] = cleaned.split(".");

  if (decimalParts.length === 0) {
    return whole;
  }

  return `${whole}.${decimalParts.join("").slice(0, 2)}`;
}

function formatInputValue(value: number): string {
  if (!Number.isFinite(value) || value === 0) {
    return "";
  }

  return Number(value.toFixed(2)).toString();
}
