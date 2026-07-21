import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: {
          backgroundColor: "#F7F3ED",
        },
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}
