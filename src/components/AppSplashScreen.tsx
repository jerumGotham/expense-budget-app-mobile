import { ActivityIndicator, Text, View } from "react-native";
import { PiggyBank } from "lucide-react-native";

type Props = {
  message?: string;
};

export default function AppSplashScreen({
  message = "Loading your finances...",
}: Props) {
  return (
    <View className="flex-1 bg-[#111827] items-center justify-center px-8">
      <View className="h-24 w-24 rounded-[32px] bg-violet items-center justify-center">
        <PiggyBank color="#FFFFFF" size={46} />
      </View>

      <Text className="text-white text-3xl font-black mt-6">Lara Finance</Text>

      <Text className="text-white/60 text-center mt-2">
        Budget smarter. Save with purpose.
      </Text>

      <ActivityIndicator size="large" color="#FFFFFF" className="mt-10" />

      <Text className="text-white/60 mt-4">{message}</Text>
    </View>
  );
}
