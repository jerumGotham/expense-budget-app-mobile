import { create } from "zustand";

import {
  requestNotificationPermission,
  sendBudgetWarning,
} from "@/services/notificationService";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

type NotificationState = {
  hasPermission: boolean;
  isRequestingPermission: boolean;
  error: string | null;

  initializeNotifications: () => Promise<boolean>;

  showBudgetWarning: (
    categoryName: string,
    percentage: number,
  ) => Promise<void>;

  clearNotificationError: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  hasPermission: false,
  isRequestingPermission: false,
  error: null,

  initializeNotifications: async () => {
    set({
      isRequestingPermission: true,
      error: null,
    });

    try {
      const result = await requestNotificationPermission();

      /*
       * This supports either a boolean-returning
       * permission function or one that returns void.
       */
      const hasPermission = typeof result === "boolean" ? result : true;

      set({
        hasPermission,
        isRequestingPermission: false,
        error: null,
      });

      return hasPermission;
    } catch (error) {
      set({
        hasPermission: false,
        isRequestingPermission: false,
        error: getApiErrorMessage(error, "Unable to enable notifications."),
      });

      return false;
    }
  },

  showBudgetWarning: async (categoryName, percentage) => {
    try {
      await sendBudgetWarning(categoryName, percentage);
    } catch (error) {
      set({
        error: getApiErrorMessage(error, "Unable to show budget warning."),
      });
    }
  },

  clearNotificationError: () => {
    set({
      error: null,
    });
  },
}));
