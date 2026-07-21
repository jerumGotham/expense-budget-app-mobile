import { Text, View } from "react-native";
import { Fund } from "@/types/finance";
import { formatMoney } from "@/utils/money";

type Props = {
  fund: Fund;
  autoSavings: number;
  currency: "USD" | "PHP";
};

export default function FundCard({ fund, autoSavings, currency }: Props) {
  const amount = (autoSavings * fund.percentage) / 100;

  return (
    <View className="rounded-3xl bg-white p-5 border border-[#E7DED2] mb-3">
      <View className="flex-row justify-between">
        <View>
          <Text className="text-ink font-black text-base">{fund.name}</Text>
          <Text className="text-muted text-xs mt-1">
            {fund.percentage}% of auto savings
          </Text>
        </View>

        <Text className="text-violet font-black">
          {formatMoney(amount, currency)}
        </Text>
      </View>

      <View className="h-2.5 rounded-full bg-[#EFE7DD] overflow-hidden mt-4">
        <View
          className="h-full rounded-full bg-gold"
          style={{ width: `${Math.min(fund.percentage, 100)}%` }}
        />
      </View>
    </View>
  );
}
