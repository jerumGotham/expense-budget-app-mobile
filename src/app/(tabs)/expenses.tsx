import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { CheckCircle2, Plus, Upload, X } from "lucide-react-native";

import AppSplashScreen from "@/components/AppSplashScreen";
import PrimaryButton from "@/components/PrimaryButton";
import Screen from "@/components/Screen";

import { useExpenseStore } from "@/store/expenseStore";
import { useFinanceStore } from "@/store/financeStore";
import { useReceiptStore } from "@/store/receiptStore";

import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { formatMoney } from "@/utils/money";

export default function ExpensesScreen() {
  /*
   * All hooks must run before any conditional return.
   */
  const profile = useFinanceStore((state) => state.profile);

  const createExpense = useExpenseStore((state) => state.createExpense);

  const isSaving = useExpenseStore((state) => state.isSavingExpense);

  const scanReceipt = useReceiptStore((state) => state.scanReceipt);

  const isScanning = useReceiptStore((state) => state.isScanning);

  const clearReceipt = useReceiptStore((state) => state.clearReceipt);

  const [visible, setVisible] = useState(false);

  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const [receiptId, setReceiptId] = useState<string | null>(null);

  const [scanConfidence, setScanConfidence] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  /*
   * Do not initialize this using profile before the null check.
   */
  const [categoryId, setCategoryId] = useState("");

  const [expenseDate, setExpenseDate] = useState<string | null>(null);

  /*
   * Select the first category after the profile becomes available.
   */
  useEffect(() => {
    if (profile && !categoryId && profile.categories.length > 0) {
      setCategoryId(profile.categories[0]?.id ?? "");
    }
  }, [profile, categoryId]);

  if (!profile) {
    return <AppSplashScreen message="Loading financial data..." />;
  }

  const selectedCategory = profile.categories.find(
    (category) => category.id === categoryId,
  );

  const hasCategories = profile.categories.length > 0;

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setReceiptImage(null);
    setReceiptId(null);
    setScanConfidence(null);
    setExpenseDate(null);

    setCategoryId(profile.categories[0]?.id ?? "");

    clearReceipt();
  };

  const closeModal = () => {
    if (isSaving || isScanning) {
      return;
    }

    resetForm();
    setVisible(false);
  };

  const openModal = () => {
    if (!hasCategories) {
      Alert.alert(
        "No expense categories",
        "Create and save at least one budget category before adding an expense.",
      );

      return;
    }

    setCategoryId(profile.categories[0]?.id ?? "");

    setVisible(true);
  };

  const pickReceipt = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Allow photo library access to select a receipt.",
        );

        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.9,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset) {
        return;
      }

      setReceiptImage(asset.uri);
      setScanConfidence(null);

      const extracted = await scanReceipt({
        uri: asset.uri,
        fileName: asset.fileName ?? `receipt-${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
      });

      setReceiptId(extracted.receiptId);

      setTitle(extracted.title || extracted.merchant || "Receipt Purchase");

      if (extracted.amount !== null) {
        setAmount(String(extracted.amount));
      }

      if (extracted.expenseDate) {
        setExpenseDate(extracted.expenseDate);
      }

      const categoryExists =
        extracted.suggestedCategoryId &&
        profile.categories.some(
          (category) => category.id === extracted.suggestedCategoryId,
        );

      if (categoryExists && extracted.suggestedCategoryId) {
        setCategoryId(extracted.suggestedCategoryId);
      }

      setScanConfidence(extracted.confidence);

      Alert.alert(
        "Receipt scanned",
        "Please review the extracted details before saving.",
      );
    } catch (error) {
      console.error("Receipt scan error:", error);

      Alert.alert(
        "Unable to scan receipt",
        getApiErrorMessage(
          error,
          "Use a clearer receipt photo or enter the expense manually.",
        ),
      );
    }
  };

  const saveExpense = async () => {
    const normalizedTitle = title.trim();

    const parsedAmount = Number(amount);

    if (!normalizedTitle) {
      Alert.alert("Missing title", "Enter the merchant or expense title.");

      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid amount", "Enter an amount greater than zero.");

      return;
    }

    if (!selectedCategory) {
      Alert.alert("Missing category", "Select an expense category.");

      return;
    }

    try {
      await createExpense({
        title: normalizedTitle,
        amount: parsedAmount,

        categoryId: selectedCategory.id,

        categoryName: selectedCategory.name,

        source: receiptId ? "receipt" : "manual",

        receiptId: receiptId ?? undefined,

        expenseDate: expenseDate ?? new Date().toISOString(),

        merchant: receiptId ? normalizedTitle : undefined,
      });

      resetForm();
      setVisible(false);

      Alert.alert(
        "Expense saved",
        "Your overview, report, and category spending were updated.",
      );
    } catch (error) {
      console.error("Create expense error:", error);

      Alert.alert(
        "Unable to save expense",
        getApiErrorMessage(error, "Please check your details and connection."),
      );
    }
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <Text className="text-violet font-black mb-2">Track Spending</Text>

        <Text className="text-ink text-4xl font-black">Expenses</Text>

        <Text className="text-muted mt-2 mb-6">
          Add expenses manually or scan a receipt to automatically fill the
          details.
        </Text>

        <View className="rounded-[34px] bg-white p-6 border border-[#E7DED2] mb-6">
          <Text className="text-ink text-2xl font-black">Quick Expense</Text>

          <Text className="text-muted mt-2 mb-5 leading-5">
            Every saved expense updates your current budget period and checks
            the category limit.
          </Text>

          <PrimaryButton
            title="Add Expense"
            icon={<Plus color="#FFFFFF" size={20} />}
            onPress={openModal}
          />
        </View>

        <Text className="text-ink text-2xl font-black mb-3">
          Recent Expenses
        </Text>

        <View className="rounded-3xl bg-white p-5 border border-[#E7DED2]">
          {profile.expenses.length === 0 ? (
            <View className="items-center py-9">
              <Text className="text-4xl">🧾</Text>

              <Text className="text-ink font-black mt-3">No expenses yet</Text>

              <Text className="text-muted text-xs text-center mt-2">
                Add an expense manually or scan your first receipt.
              </Text>
            </View>
          ) : (
            profile.expenses.map((expense, index) => (
              <View
                key={expense.id}
                className={`flex-row justify-between items-center py-4 ${
                  index < profile.expenses.length - 1
                    ? "border-b border-[#E7DED2]"
                    : ""
                }`}
              >
                <View className="flex-1 pr-4">
                  <Text className="text-ink font-black" numberOfLines={1}>
                    {expense.title}
                  </Text>

                  <Text
                    className="text-muted text-xs mt-1 capitalize"
                    numberOfLines={1}
                  >
                    {expense.categoryName} · {expense.source}
                  </Text>
                </View>

                <Text className="text-danger font-black">
                  -{formatMoney(expense.amount, profile.currency)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-cream">
          <ScrollView
            className="flex-1 px-5"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingTop: 28,
              paddingBottom: 50,
            }}
          >
            <View className="flex-row justify-between items-start mb-5">
              <View className="flex-1 pr-4">
                <Text className="text-ink text-4xl font-black">
                  New Expense
                </Text>

                <Text className="text-muted mt-2">
                  Enter the details manually or upload a receipt.
                </Text>
              </View>

              <Pressable
                disabled={isSaving || isScanning}
                onPress={closeModal}
                className="h-11 w-11 rounded-full bg-white items-center justify-center"
              >
                <X color="#161616" size={22} />
              </Pressable>
            </View>

            <Pressable
              disabled={isScanning || isSaving}
              onPress={() => {
                void pickReceipt();
              }}
              className="h-52 rounded-[30px] bg-white border border-[#E7DED2] items-center justify-center mb-5 overflow-hidden"
            >
              {receiptImage ? (
                <>
                  <Image
                    source={{
                      uri: receiptImage,
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />

                  {isScanning && (
                    <View className="absolute inset-0 bg-black/60 items-center justify-center">
                      <ActivityIndicator size="large" color="#FFFFFF" />

                      <Text className="text-white font-black mt-3">
                        Reading receipt...
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <View className="h-14 w-14 rounded-2xl bg-[#F3F0FF] items-center justify-center">
                    <Upload color="#5B3FFF" size={28} />
                  </View>

                  <Text className="text-ink font-black mt-3">
                    Upload Receipt
                  </Text>

                  <Text className="text-muted text-xs mt-1">
                    Parsed by your local backend OCR
                  </Text>
                </>
              )}
            </Pressable>

            {receiptId && !isScanning && (
              <View className="flex-row items-center rounded-2xl bg-[#ECFDF3] px-4 py-3 mb-5">
                <CheckCircle2 color="#1F9D55" size={20} />

                <View className="flex-1 ml-3">
                  <Text className="text-success font-black">
                    Receipt processed
                  </Text>

                  {scanConfidence !== null && (
                    <Text className="text-success text-xs mt-1">
                      OCR confidence: {Math.round(scanConfidence * 100)}%
                    </Text>
                  )}
                </View>
              </View>
            )}

            <Text className="text-ink font-black mb-2">Merchant or title</Text>

            <TextInput
              value={title}
              onChangeText={setTitle}
              editable={!isSaving && !isScanning}
              placeholder="Example: Grocery Store"
              placeholderTextColor="#AAA39A"
              className="h-14 rounded-2xl bg-white px-4 mb-4 border border-[#E7DED2] text-ink"
            />

            <Text className="text-ink font-black mb-2">Amount</Text>

            <TextInput
              value={amount}
              onChangeText={(value) => setAmount(normalizeDecimalInput(value))}
              editable={!isSaving && !isScanning}
              placeholder="0.00"
              placeholderTextColor="#AAA39A"
              keyboardType="decimal-pad"
              className="h-14 rounded-2xl bg-white px-4 mb-4 border border-[#E7DED2] text-ink"
            />

            <Text className="text-ink font-black mb-2">Category</Text>

            <View className="flex-row flex-wrap gap-2 mb-6">
              {profile.categories.map((category) => {
                const selected = category.id === categoryId;

                return (
                  <Pressable
                    key={category.id}
                    disabled={isSaving || isScanning}
                    onPress={() => setCategoryId(category.id)}
                    className={`px-4 h-11 rounded-2xl items-center justify-center border ${
                      selected
                        ? "bg-violet border-violet"
                        : "bg-white border-[#E7DED2]"
                    }`}
                  >
                    <Text
                      className={`font-black ${
                        selected ? "text-white" : "text-ink"
                      }`}
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <PrimaryButton
              title={isSaving ? "Saving..." : "Save Expense"}
              onPress={() => {
                if (!isSaving && !isScanning) {
                  void saveExpense();
                }
              }}
            />

            <Pressable
              disabled={isSaving || isScanning}
              onPress={closeModal}
              className="h-14 items-center justify-center"
            >
              <Text className="text-muted font-black">Cancel</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}

function normalizeDecimalInput(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");

  const [whole = "", ...parts] = cleaned.split(".");

  if (parts.length === 0) {
    return whole;
  }

  return `${whole}.${parts.join("").slice(0, 2)}`;
}
