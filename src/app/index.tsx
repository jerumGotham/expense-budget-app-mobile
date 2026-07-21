import { useEffect } from "react";
import { router } from "expo-router";

import AppSplashScreen from "@/components/AppSplashScreen";
import { useAuthStore } from "@/store/authStore";
import { useFinanceStore } from "@/store/financeStore";
import { requestNotificationPermission } from "@/services/notificationService";

export default function BootstrapScreen() {
  const checkAuthentication = useAuthStore(
    (state) => state.checkAuthentication,
  );

  const initializeFinance = useFinanceStore((state) => state.initializeFinance);

  const clearFinance = useFinanceStore((state) => state.clearFinance);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await requestNotificationPermission();

        const isAuthenticated = await checkAuthentication();

        if (!isAuthenticated) {
          clearFinance();

          router.replace("/(auth)/login");

          return;
        }

        await initializeFinance();

        router.replace("/(tabs)/overview");
      } catch (error) {
        console.error("Application bootstrap failed:", error);

        clearFinance();

        router.replace("/(auth)/login");
      }
    };

    void bootstrap();
  }, [checkAuthentication, initializeFinance, clearFinance]);

  return <AppSplashScreen message="Loading your financial data..." />;
}
