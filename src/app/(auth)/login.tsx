import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  PiggyBank,
  ShieldCheck,
} from "lucide-react-native";
import { router } from "expo-router";

import { useAuthStore } from "@/store/authStore";
import { useFinanceStore } from "@/store/financeStore";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);

  const isLoggingIn = useAuthStore((state) => state.isLoggingIn);

  const initializeFinance = useFinanceStore((state) => state.initializeFinance);

  const [email, setEmail] = useState("lara@example.com");
  const [password, setPassword] = useState("P@ssw0rd");

  const [showPassword, setShowPassword] = useState(false);

  const canSubmit =
    email.trim().length > 0 && password.length > 0 && !isLoggingIn;

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      Alert.alert("Missing details", "Enter your email address and password.");

      return;
    }

    try {
      await login(normalizedEmail, password);

      await initializeFinance();

      router.replace("/(tabs)/overview");
    } catch (error) {
      Alert.alert(
        "Unable to sign in",
        getApiErrorMessage(
          error,
          "The email or password you entered is incorrect.",
        ),
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#F7F3ED]"
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 48,
        }}
      >
        <View className="items-center mb-10">
          <View className="h-24 w-24 rounded-[32px] bg-violet items-center justify-center shadow-lg">
            <PiggyBank color="#FFFFFF" size={46} />
          </View>

          <Text className="text-violet font-black text-base mt-5">
            Lara Finance
          </Text>

          <Text className="text-ink text-4xl font-black text-center mt-3">
            Welcome back
          </Text>

          <Text className="text-muted text-center mt-3 leading-6 px-4">
            Sign in to manage your budget, track spending, and grow your
            savings.
          </Text>
        </View>

        <View className="rounded-[32px] bg-white border border-[#E7DED2] p-5">
          <Text className="text-ink font-black mb-2">Email address</Text>

          <View className="h-14 flex-row items-center rounded-2xl bg-[#F8F5F0] border border-[#EEE7DD] px-4">
            <Mail color="#7B746B" size={20} />

            <TextInput
              value={email}
              onChangeText={setEmail}
              editable={!isLoggingIn}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="you@example.com"
              placeholderTextColor="#AAA39A"
              className="flex-1 ml-3 text-ink text-base"
              returnKeyType="next"
            />
          </View>

          <Text className="text-ink font-black mt-5 mb-2">Password</Text>

          <View className="h-14 flex-row items-center rounded-2xl bg-[#F8F5F0] border border-[#EEE7DD] px-4">
            <LockKeyhole color="#7B746B" size={20} />

            <TextInput
              value={password}
              onChangeText={setPassword}
              editable={!isLoggingIn}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="password"
              placeholder="Enter your password"
              placeholderTextColor="#AAA39A"
              className="flex-1 ml-3 text-ink text-base"
              returnKeyType="done"
              onSubmitEditing={() => {
                if (canSubmit) {
                  void handleLogin();
                }
              }}
            />

            <Pressable
              disabled={isLoggingIn}
              onPress={() => setShowPassword((current) => !current)}
              hitSlop={10}
            >
              {showPassword ? (
                <EyeOff color="#7B746B" size={21} />
              ) : (
                <Eye color="#7B746B" size={21} />
              )}
            </Pressable>
          </View>

          <Pressable
            disabled={!canSubmit}
            onPress={() => {
              void handleLogin();
            }}
            className={`h-14 rounded-2xl flex-row items-center justify-center mt-6 ${
              canSubmit ? "bg-violet" : "bg-[#CFC8F8]"
            }`}
          >
            {isLoggingIn ? (
              <>
                <ActivityIndicator color="#FFFFFF" size="small" />

                <Text className="text-white font-black text-base ml-3">
                  Signing in...
                </Text>
              </>
            ) : (
              <Text className="text-white font-black text-base">Sign In</Text>
            )}
          </Pressable>
        </View>

        <View className="flex-row items-center justify-center mt-6">
          <ShieldCheck color="#7B746B" size={16} />

          <Text className="text-muted text-xs ml-2">
            Your financial information is protected.
          </Text>
        </View>
        {/* 
        {__DEV__ && (
          <Pressable
            onPress={() => {
              setEmail("lara@example.com");
              setPassword("Password123!");
            }}
            className="items-center justify-center mt-5 py-3"
          >
            <Text className="text-violet font-black text-sm">
              Use development account
            </Text>
          </Pressable>
        )} */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
