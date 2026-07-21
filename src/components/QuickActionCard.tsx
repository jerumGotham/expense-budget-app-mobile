import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  onPress?: () => void;
};

export default function QuickActionCard({
  title,
  subtitle,
  icon,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[48%] bg-white rounded-[28px] p-5 border border-[#ECE7DF]"
    >
      <View className="h-12 w-12 rounded-2xl bg-[#F3F0FF] items-center justify-center mb-4">
        {icon}
      </View>

      <Text className="text-ink font-black text-base">{title}</Text>
      <Text className="text-muted text-xs mt-1">{subtitle}</Text>
    </Pressable>
  );
}
