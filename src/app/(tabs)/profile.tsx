import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Pencil,
  RotateCcw,
  Save,
  UserRound,
  WalletCards,
  X,
} from "lucide-react-native";
import { router } from "expo-router";

import AppSplashScreen from "@/components/AppSplashScreen";
import Screen from "@/components/Screen";

import { useAuthStore } from "@/store/authStore";
import { useFinanceStore } from "@/store/financeStore";

import { BudgetPeriod, Currency } from "@/types/finance";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

const BUDGET_PERIODS: BudgetPeriod[] = ["weekly", "monthly"];

const CURRENCIES: Array<{
  value: Currency;
  label: string;
  symbol: string;
}> = [
  {
    value: "USD",
    label: "US Dollar",
    symbol: "$",
  },
  {
    value: "PHP",
    label: "Philippine Peso",
    symbol: "₱",
  },
];

const MONTHLY_START_DAYS = [1, 7, 14, 21, 25, 28];

const WEEK_DAYS = [
  { label: "Sunday", shortLabel: "Sun", value: 0 },
  { label: "Monday", shortLabel: "Mon", value: 1 },
  { label: "Tuesday", shortLabel: "Tue", value: 2 },
  { label: "Wednesday", shortLabel: "Wed", value: 3 },
  { label: "Thursday", shortLabel: "Thu", value: 4 },
  { label: "Friday", shortLabel: "Fri", value: 5 },
  { label: "Saturday", shortLabel: "Sat", value: 6 },
];

type EditMode =
  | "name"
  | "password"
  | "currency"
  | "period"
  | "monthlyStart"
  | "weeklyStart"
  | null;

export default function ProfileScreen() {
  /*
   * Keep all hooks above the profile early return.
   */
  const user = useAuthStore((state) => state.user);

  const logout = useAuthStore((state) => state.logout);

  const updateAccount = useAuthStore((state) => state.updateAccount);

  const isUpdatingAccount = useAuthStore((state) => state.isUpdatingAccount);

  const profile = useFinanceStore((state) => state.profile);
  const saveFinanceSettings = useFinanceStore(
    (state) => state.saveFinanceSettings,
  );

  const startFresh = useFinanceStore((state) => state.startFresh);

  const changeBudgetPeriod = useFinanceStore(
    (state) => state.changeBudgetPeriod,
  );

  const updateCurrency = useFinanceStore((state) => state.updateCurrency);

  const updateMonthlyStartDay = useFinanceStore(
    (state) => state.updateMonthlyStartDay,
  );

  const updateWeeklyStartDay = useFinanceStore(
    (state) => state.updateWeeklyStartDay,
  );

  const isSaving = useFinanceStore((state) => state.isSaving);

  const [editMode, setEditMode] = useState<EditMode>(null);

  const [name, setName] = useState(user?.name ?? "");

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!profile) {
    return <AppSplashScreen message="Loading profile..." />;
  }

  const selectedWeeklyDay =
    WEEK_DAYS.find((day) => day.value === profile.weeklyStartDay)?.label ??
    "Monday";

  const selectedCurrency =
    CURRENCIES.find((currency) => currency.value === profile.currency) ??
    CURRENCIES[0];

  const isBusy = isSaving || isUpdatingAccount;

  const closeEditor = () => {
    setEditMode(null);

    setName(user?.name ?? "");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const saveName = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Invalid name", "Enter your name before saving.");

      return;
    }

    try {
      await updateAccount({
        name: trimmedName,
      });

      setEditMode(null);

      Alert.alert("Profile updated", "Your name was updated successfully.");
    } catch (error) {
      Alert.alert(
        "Unable to update profile",
        getApiErrorMessage(error, "Your name could not be updated."),
      );
    }
  };

  const savePassword = async () => {
    if (!currentPassword) {
      Alert.alert("Current password required", "Enter your current password.");

      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(
        "Password too short",
        "Your new password must contain at least 8 characters.",
      );

      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Passwords do not match",
        "Confirm your new password correctly.",
      );

      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert(
        "Choose another password",
        "Your new password must be different from your current password.",
      );

      return;
    }

    try {
      await updateAccount({
        currentPassword,
        newPassword,
      });

      closeEditor();

      Alert.alert(
        "Password updated",
        "Your password was changed successfully.",
      );
    } catch (error) {
      Alert.alert(
        "Unable to change password",
        getApiErrorMessage(error, "Check your current password and try again."),
      );
    }
  };

  const saveFinanceSettingsBtn = async () => {
    if (!editMode) {
      return;
    }

    try {
      switch (editMode) {
        case "currency":
          await saveFinanceSettings({
            currency: profile.currency,
          });
          break;

        case "period":
          await saveFinanceSettings({
            period: profile.period,
          });
          break;

        case "monthlyStart":
          await saveFinanceSettings({
            monthlyStartDay: profile.monthlyStartDay,
          });
          break;

        case "weeklyStart":
          await saveFinanceSettings({
            weeklyStartDay: profile.weeklyStartDay,
          });
          break;

        default:
          return;
      }

      setEditMode(null);

      Alert.alert(
        "Settings saved",
        "Your budget settings were updated successfully.",
      );
    } catch (error) {
      Alert.alert(
        "Unable to save settings",
        getApiErrorMessage(error, "Your budget settings could not be updated."),
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();

      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert(
        "Unable to log out",
        getApiErrorMessage(error, "Please try again."),
      );
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Log out?",
      "You can sign in again to access your saved finance data.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            void handleLogout();
          },
        },
      ],
    );
  };

  const confirmStartFresh = () => {
    Alert.alert(
      "Start fresh?",
      "This permanently removes your categories, expenses, receipts, alerts, and report history. Your account and login details will remain active.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Finance Data",
          style: "destructive",
          onPress: async () => {
            try {
              await startFresh();

              Alert.alert(
                "Finance data reset",
                "Create a new budget plan to continue.",
              );

              router.replace("/(tabs)/budget");
            } catch (error) {
              console.error("Reset finance data error:", error);

              Alert.alert(
                "Reset failed",
                getApiErrorMessage(error, "Unable to reset your finance data."),
              );
            }
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 60,
        }}
      >
        <Text className="text-violet font-black mb-2">Account</Text>

        <Text className="text-ink text-4xl font-black">Profile</Text>

        <Text className="text-muted mt-2">
          Manage your personal information and budget preferences.
        </Text>

        {/* User profile */}

        <View className="rounded-[30px] bg-white border border-[#E7DED2] p-5 mt-6">
          <View className="flex-row items-center">
            <View className="h-16 w-16 rounded-[22px] bg-[#F3F0FF] items-center justify-center">
              <UserRound color="#5B3FFF" size={30} />
            </View>

            <View className="flex-1 ml-4">
              <Text className="text-ink text-xl font-black">
                {user?.name ?? "Lara Finance User"}
              </Text>

              <Text className="text-muted mt-1">
                {user?.email ?? "No email available"}
              </Text>
            </View>

            <Pressable
              disabled={isBusy}
              onPress={() => {
                setName(user?.name ?? "");
                setEditMode("name");
              }}
              className="h-11 w-11 rounded-2xl bg-[#F3F0FF] items-center justify-center"
            >
              <Pencil color="#5B3FFF" size={19} />
            </Pressable>
          </View>
        </View>

        {/* Account settings */}

        <Text className="text-ink text-2xl font-black mt-7 mb-3">
          Account Settings
        </Text>

        <View className="rounded-[28px] bg-white border border-[#E7DED2] px-5">
          <SettingButton
            icon={<UserRound color="#5B3FFF" size={20} />}
            label="Name"
            value={user?.name ?? "Not set"}
            onPress={() => {
              setName(user?.name ?? "");
              setEditMode("name");
            }}
          />

          <SettingButton
            icon={<KeyRound color="#5B3FFF" size={20} />}
            label="Password"
            value="Change password"
            onPress={() => setEditMode("password")}
            hideBorder
          />
        </View>

        {/* Budget settings */}

        <Text className="text-ink text-2xl font-black mt-7 mb-3">
          Budget Settings
        </Text>

        <View className="rounded-[28px] bg-white border border-[#E7DED2] px-5">
          <SettingButton
            icon={<WalletCards color="#5B3FFF" size={20} />}
            label="Budget period"
            value={profile.period}
            onPress={() => setEditMode("period")}
          />

          <SettingButton
            icon={<CircleDollarSign color="#5B3FFF" size={20} />}
            label="Currency"
            value={`${selectedCurrency.symbol} ${selectedCurrency.value}`}
            onPress={() => setEditMode("currency")}
          />

          <SettingButton
            icon={<CalendarDays color="#5B3FFF" size={20} />}
            label="Monthly start day"
            value={`Day ${profile.monthlyStartDay}`}
            onPress={() => setEditMode("monthlyStart")}
          />

          <SettingButton
            icon={<CalendarDays color="#5B3FFF" size={20} />}
            label="Weekly start day"
            value={selectedWeeklyDay}
            onPress={() => setEditMode("weeklyStart")}
            hideBorder
          />
        </View>

        {/* Dangerous actions */}

        <Text className="text-ink text-2xl font-black mt-7 mb-3">
          Account Actions
        </Text>

        <Pressable
          disabled={isBusy}
          onPress={confirmStartFresh}
          className={`h-14 rounded-2xl border border-danger flex-row items-center justify-center ${
            isBusy ? "opacity-50" : ""
          }`}
        >
          {isSaving ? (
            <ActivityIndicator color="#E5484D" size="small" />
          ) : (
            <RotateCcw color="#E5484D" size={20} />
          )}

          <Text className="text-danger font-black ml-2">
            {isSaving ? "Resetting..." : "Start Fresh"}
          </Text>
        </Pressable>

        <Pressable
          disabled={isBusy}
          onPress={confirmLogout}
          className={`h-14 rounded-2xl bg-[#111827] flex-row items-center justify-center mt-3 ${
            isBusy ? "opacity-50" : ""
          }`}
        >
          <LogOut color="#FFFFFF" size={20} />

          <Text className="text-white font-black ml-2">Log Out</Text>
        </Pressable>
      </ScrollView>

      {/* Edit modal */}

      <Modal
        visible={editMode !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditor}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 bg-cream"
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 28,
              paddingBottom: 50,
            }}
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-4">
                <Text className="text-ink text-3xl font-black">
                  {getEditorTitle(editMode)}
                </Text>

                <Text className="text-muted mt-2">
                  {getEditorDescription(editMode)}
                </Text>
              </View>

              <Pressable
                disabled={isBusy}
                onPress={closeEditor}
                className="h-11 w-11 rounded-full bg-white items-center justify-center"
              >
                <X color="#161616" size={21} />
              </Pressable>
            </View>

            {editMode === "name" && (
              <>
                <Text className="text-ink font-black mt-7 mb-2">Full name</Text>

                <TextInput
                  value={name}
                  onChangeText={setName}
                  editable={!isBusy}
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={80}
                  placeholder="Enter your name"
                  placeholderTextColor="#AAA39A"
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    void saveName();
                  }}
                  className="h-14 rounded-2xl bg-white border border-[#E7DED2] px-4 text-ink"
                />

                <SaveButton
                  title="Save Name"
                  isLoading={isUpdatingAccount}
                  disabled={!name.trim() || isBusy}
                  onPress={() => {
                    void saveName();
                  }}
                />
              </>
            )}

            {editMode === "password" && (
              <>
                <PasswordInput
                  label="Current password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  visible={showCurrentPassword}
                  onToggle={() => setShowCurrentPassword((current) => !current)}
                  editable={!isBusy}
                  marginTop
                />

                <PasswordInput
                  label="New password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  visible={showNewPassword}
                  onToggle={() => setShowNewPassword((current) => !current)}
                  editable={!isBusy}
                />

                <PasswordInput
                  label="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  visible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((current) => !current)}
                  editable={!isBusy}
                />

                <Text className="text-muted text-xs mt-2 leading-5">
                  Use at least 8 characters. A mix of letters, numbers, and
                  symbols is recommended.
                </Text>

                <SaveButton
                  title="Change Password"
                  isLoading={isUpdatingAccount}
                  disabled={
                    !currentPassword ||
                    newPassword.length < 8 ||
                    newPassword !== confirmPassword ||
                    isBusy
                  }
                  onPress={() => {
                    void savePassword();
                  }}
                />
              </>
            )}

            {editMode === "currency" && (
              <>
                <Text className="text-ink font-black mt-7 mb-3">
                  Select currency
                </Text>

                {CURRENCIES.map((currency) => {
                  const selected = profile.currency === currency.value;

                  return (
                    <Pressable
                      key={currency.value}
                      disabled={isBusy}
                      onPress={() => updateCurrency(currency.value)}
                      className={`rounded-[24px] border px-5 py-4 mb-3 flex-row items-center ${
                        selected
                          ? "bg-[#F3F0FF] border-violet"
                          : "bg-white border-[#E7DED2]"
                      }`}
                    >
                      <View className="h-12 w-12 rounded-2xl bg-white items-center justify-center">
                        <Text className="text-violet text-xl font-black">
                          {currency.symbol}
                        </Text>
                      </View>

                      <View className="flex-1 ml-4">
                        <Text className="text-ink font-black">
                          {currency.label}
                        </Text>

                        <Text className="text-muted text-xs mt-1">
                          {currency.value}
                        </Text>
                      </View>

                      <View
                        className={`h-5 w-5 rounded-full border-2 ${
                          selected
                            ? "border-violet bg-violet"
                            : "border-[#C9C2B8]"
                        }`}
                      />
                    </Pressable>
                  );
                })}

                <SaveButton
                  title="Save Currency"
                  isLoading={isSaving}
                  disabled={isBusy}
                  onPress={() => {
                    void saveFinanceSettingsBtn();
                  }}
                />
              </>
            )}

            {editMode === "period" && (
              <>
                <Text className="text-ink font-black mt-7 mb-3">
                  Select budget period
                </Text>

                <View className="flex-row gap-3">
                  {BUDGET_PERIODS.map((period) => {
                    const selected = profile.period === period;

                    return (
                      <Pressable
                        key={period}
                        disabled={isBusy}
                        onPress={() => changeBudgetPeriod(period)}
                        className={`flex-1 h-14 rounded-2xl items-center justify-center ${
                          selected
                            ? "bg-violet"
                            : "bg-white border border-[#E7DED2]"
                        }`}
                      >
                        <Text
                          className={`font-black capitalize ${
                            selected ? "text-white" : "text-ink"
                          }`}
                        >
                          {period}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View className="rounded-2xl bg-[#FFF4E5] px-4 py-3 mt-4">
                  <Text className="text-[#B86E00] text-xs leading-5">
                    Changing the period converts your income and category limits
                    between monthly and weekly values.
                  </Text>
                </View>

                <SaveButton
                  title="Save Budget Period"
                  isLoading={isSaving}
                  disabled={isBusy}
                  onPress={() => {
                    void saveFinanceSettingsBtn();
                  }}
                />
              </>
            )}

            {editMode === "monthlyStart" && (
              <>
                <Text className="text-ink font-black mt-7 mb-3">
                  Monthly start day
                </Text>

                <View className="flex-row flex-wrap gap-3">
                  {MONTHLY_START_DAYS.map((day) => {
                    const selected = profile.monthlyStartDay === day;

                    return (
                      <Pressable
                        key={day}
                        disabled={isBusy}
                        onPress={() => updateMonthlyStartDay(day)}
                        className={`h-14 min-w-14 px-4 rounded-2xl items-center justify-center ${
                          selected
                            ? "bg-violet"
                            : "bg-white border border-[#E7DED2]"
                        }`}
                      >
                        <Text
                          className={`font-black ${
                            selected ? "text-white" : "text-ink"
                          }`}
                        >
                          {day}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text className="text-muted text-xs mt-4 leading-5">
                  A monthly start day from 1 to 28 works consistently for every
                  month, including February.
                </Text>

                <SaveButton
                  title="Save Monthly Start Day"
                  isLoading={isSaving}
                  disabled={isBusy}
                  onPress={() => {
                    void saveFinanceSettingsBtn();
                  }}
                />
              </>
            )}

            {editMode === "weeklyStart" && (
              <>
                <Text className="text-ink font-black mt-7 mb-3">
                  Weekly start day
                </Text>

                {WEEK_DAYS.map((day) => {
                  const selected = profile.weeklyStartDay === day.value;

                  return (
                    <Pressable
                      key={day.value}
                      disabled={isBusy}
                      onPress={() => updateWeeklyStartDay(day.value)}
                      className={`h-14 rounded-2xl px-4 mb-3 flex-row items-center justify-between ${
                        selected
                          ? "bg-[#F3F0FF] border border-violet"
                          : "bg-white border border-[#E7DED2]"
                      }`}
                    >
                      <Text className="text-ink font-black">{day.label}</Text>

                      <View
                        className={`h-5 w-5 rounded-full border-2 ${
                          selected
                            ? "border-violet bg-violet"
                            : "border-[#C9C2B8]"
                        }`}
                      />
                    </Pressable>
                  );
                })}

                <SaveButton
                  title="Save Weekly Start Day"
                  isLoading={isSaving}
                  disabled={isBusy}
                  onPress={() => {
                    void saveFinanceSettingsBtn();
                  }}
                />
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

function SettingButton({
  icon,
  label,
  value,
  onPress,
  hideBorder = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress: () => void;
  hideBorder?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center py-4 ${
        hideBorder ? "" : "border-b border-[#EFEAE1]"
      }`}
    >
      <View className="h-10 w-10 rounded-2xl bg-[#F3F0FF] items-center justify-center">
        {icon}
      </View>

      <View className="flex-1 ml-3">
        <Text className="text-muted text-xs">{label}</Text>

        <Text className="text-ink font-black capitalize mt-1" numberOfLines={1}>
          {value}
        </Text>
      </View>

      <ChevronRight color="#9A938A" size={20} />
    </Pressable>
  );
}

function PasswordInput({
  label,
  value,
  onChangeText,
  visible,
  onToggle,
  editable,
  marginTop = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  editable: boolean;
  marginTop?: boolean;
}) {
  return (
    <View className={marginTop ? "mt-7" : "mt-4"}>
      <Text className="text-ink font-black mb-2">{label}</Text>

      <View className="h-14 rounded-2xl bg-white border border-[#E7DED2] px-4 flex-row items-center">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={label}
          placeholderTextColor="#AAA39A"
          className="flex-1 text-ink"
        />

        <Pressable disabled={!editable} onPress={onToggle} hitSlop={10}>
          {visible ? (
            <EyeOff color="#7B746B" size={20} />
          ) : (
            <Eye color="#7B746B" size={20} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

function SaveButton({
  title,
  isLoading,
  disabled,
  onPress,
}: {
  title: string;
  isLoading: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`h-14 rounded-2xl flex-row items-center justify-center mt-7 ${
        disabled ? "bg-[#D7D2CB]" : "bg-violet"
      }`}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Save color="#FFFFFF" size={20} />
      )}

      <Text className="text-white font-black ml-2">
        {isLoading ? "Saving..." : title}
      </Text>
    </Pressable>
  );
}

function getEditorTitle(editMode: EditMode): string {
  switch (editMode) {
    case "name":
      return "Edit Name";

    case "password":
      return "Change Password";

    case "currency":
      return "Choose Currency";

    case "period":
      return "Budget Period";

    case "monthlyStart":
      return "Monthly Schedule";

    case "weeklyStart":
      return "Weekly Schedule";

    default:
      return "Edit Settings";
  }
}

function getEditorDescription(editMode: EditMode): string {
  switch (editMode) {
    case "name":
      return "Update the name shown on your account.";

    case "password":
      return "Confirm your current password and choose a secure new one.";

    case "currency":
      return "Choose the currency used throughout your finance dashboard.";

    case "period":
      return "Choose whether your budget repeats weekly or monthly.";

    case "monthlyStart":
      return "Choose which day starts your monthly reporting period.";

    case "weeklyStart":
      return "Choose which weekday begins your weekly reporting period.";

    default:
      return "";
  }
}
