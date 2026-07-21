import { ReactNode } from "react";
import { Pressable, Text } from "react-native";

type Props = {
  title: string;
  icon?: ReactNode;
  onPress: () => void;
};

export default function PrimaryButton({ title, icon, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="h-14 rounded-2xl bg-violet flex-row items-center justify-center gap-2"
    >
      {icon}
      <Text className="text-white font-black text-base">{title}</Text>
    </Pressable>
  );
}
