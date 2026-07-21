import { Text, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Wallet } from "lucide-react-native";
import { formatMoney } from "@/utils/money";

type Props = {
  income: number;
  expenses: number;
  remaining: number;
  savings: number;
  budgetPercent: number;
  currency: "USD" | "PHP";
};

export default function HeroBalanceCard({
  income,
  expenses,
  remaining,
  savings,
  budgetPercent,
  currency,
}: Props) {
  return (
    <LinearGradient colors={["#111827", "#4F46E5"]} style={styles.card}>
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-white/70 text-sm">Remaining Balance</Text>
          <Text className="text-white text-5xl font-black mt-2">
            {formatMoney(remaining, currency)}
          </Text>
        </View>

        <View className="h-14 w-14 rounded-full bg-white/15 items-center justify-center">
          <Wallet color="#FFFFFF" size={28} />
        </View>
      </View>

      <View className="mt-8">
        <View className="h-3 rounded-full bg-white/20 overflow-hidden">
          <View
            className="h-full rounded-full bg-white"
            style={{ width: `${Math.min(budgetPercent, 100)}%` }}
          />
        </View>

        <Text className="text-white/80 text-xs mt-2">
          {budgetPercent}% of budget used
        </Text>
      </View>

      <View className="flex-row justify-between mt-8">
        <MiniStat label="Income" value={formatMoney(income, currency)} />
        <MiniStat label="Expenses" value={formatMoney(expenses, currency)} />
        <MiniStat label="Savings" value={formatMoney(savings, currency)} />
      </View>
    </LinearGradient>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-white/60 text-xs">{label}</Text>
      <Text className="text-white font-black mt-1">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 36,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
});
