import { Text, View } from "react-native";
import { BudgetCategory } from "@/types/finance";
import { formatMoney } from "@/utils/money";

type Props = {
  category: BudgetCategory;
  currency: "USD" | "PHP";
};

const emojiMap: Record<string, string> = {
  Food: "🍽️",
  Utilities: "💡",
  Groceries: "🛒",
  Transport: "🚗",
  Shopping: "🛍️",
};

export default function PremiumBudgetCard({ category, currency }: Props) {
  const percent = Math.round((category.spent / category.limit) * 100);
  const left = category.limit - category.spent;

  const barColor =
    percent >= 100 ? "bg-danger" : percent >= 80 ? "bg-gold" : "bg-violet";

  return (
    <View className="bg-white rounded-[30px] p-5 border border-[#ECE7DF] mb-4">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="h-12 w-12 rounded-2xl bg-[#F8F5EF] items-center justify-center mr-3">
            <Text className="text-2xl">{emojiMap[category.name] || "💰"}</Text>
          </View>

          <View>
            <Text className="text-ink text-lg font-black">{category.name}</Text>
            <Text className="text-muted text-xs mt-1">
              {formatMoney(left, currency)} left
            </Text>
          </View>
        </View>

        <Text className="text-ink font-black">{percent}%</Text>
      </View>

      <View className="mt-5">
        <View className="flex-row justify-between mb-2">
          <Text className="text-muted text-xs">Spent</Text>
          <Text className="text-muted text-xs">
            {formatMoney(category.spent, currency)} /{" "}
            {formatMoney(category.limit, currency)}
          </Text>
        </View>

        <View className="h-3 rounded-full bg-[#EFEAE1] overflow-hidden">
          <View
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </View>
      </View>
    </View>
  );
}
