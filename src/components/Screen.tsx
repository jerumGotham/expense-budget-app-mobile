import { ReactNode } from "react";
import { View } from "react-native";

export default function Screen({ children }: { children: ReactNode }) {
  return <View className="flex-1 bg-[#F7F3ED] px-5 pt-16">{children}</View>;
}
