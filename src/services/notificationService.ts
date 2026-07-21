import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();

  if (current.status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }
}

export async function sendBudgetWarning(categoryName: string, percent: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: percent >= 100 ? "Budget exceeded" : "Budget warning",
      body:
        percent >= 100
          ? `You are over your ${categoryName} budget.`
          : `You already used ${percent}% of your ${categoryName} budget.`,
    },
    trigger: null,
  });
}
