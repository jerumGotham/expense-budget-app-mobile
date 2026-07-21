import { Platform } from "react-native";

const IOS_SIMULATOR_URL = "http://192.168.1.7:4000/api";
const ANDROID_EMULATOR_URL = "http://10.0.2.2:4000/api";

/**
 * Replace this with your Mac's local IP when using a physical device.
 *
 * Example:
 * http://192.168.1.10:4000/api
 */
const PHYSICAL_DEVICE_URL = "http://192.168.1.10:4000/api";

const USE_PHYSICAL_DEVICE = false;

export const API_BASE_URL = USE_PHYSICAL_DEVICE
  ? PHYSICAL_DEVICE_URL
  : Platform.OS === "android"
    ? ANDROID_EMULATOR_URL
    : IOS_SIMULATOR_URL;
