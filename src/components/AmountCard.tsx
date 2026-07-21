import { ReactNode } from "react";
import { Text, View } from "react-native";

type Props = {
  label: string;
  value: string;
  icon?: ReactNode;
};

export default function AmountCard({ label, value, icon }: Props) {
  return (
    <View className="w-[48%] rounded-3xl bg-white p-4 border border-[#E7DED2]">
      <View className="h-10 w-10 rounded-full bg-[#F3EFE8] items-center justify-center mb-3">
        {icon}
      </View>

      <Text className="text-muted text-xs">{label}</Text>
      <Text className="text-ink text-xl font-black mt-1">{value}</Text>
    </View>
  );
}
