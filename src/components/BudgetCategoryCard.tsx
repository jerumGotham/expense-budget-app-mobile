import { Text, View } from "react-native";
import { BudgetCategory } from "@/types/finance";
import { formatMoney } from "@/utils/money";

type Props = {
  category: BudgetCategory;
  currency: "USD" | "PHP";
};

export default function BudgetCategoryCard({ category, currency }: Props) {
  const percent = Math.round((category.spent / category.limit) * 100);

  return (
    <View className="mb-5">
      <View className="flex-row justify-between mb-2">
        <Text className="font-black text-ink">{category.name}</Text>
        <Text className="text-muted text-xs">
          {formatMoney(category.spent, currency)} /{" "}
          {formatMoney(category.limit, currency)}
        </Text>
      </View>

      <View className="h-2.5 rounded-full bg-[#EFE7DD] overflow-hidden">
        <View
          className={`h-full rounded-full ${
            percent >= 100
              ? "bg-danger"
              : percent >= 80
                ? "bg-gold"
                : "bg-violet"
          }`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </View>

      <Text className="text-muted text-xs mt-1">{percent}% used</Text>
    </View>
  );
}
