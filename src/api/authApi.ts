import AsyncStorage from "@react-native-async-storage/async-storage";

import { ACCESS_TOKEN_KEY, apiClient } from "@/api/client";
import { ApiResponse, AuthResponse, AuthUser } from "@/types/api";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name?: string;
  email: string;
  password: string;
};

export type UpdateAccountPayload = {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
};

export type UpdateAccountResponse = {
  user: AuthUser;
};

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      payload,
    );

    const auth = response.data.data;

    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);

    return auth;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      payload,
    );

    const auth = response.data.data;

    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);

    return auth;
  },

  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  async updateAccount(
    payload: UpdateAccountPayload,
  ): Promise<UpdateAccountResponse> {
    const response = await apiClient.patch<ApiResponse<UpdateAccountResponse>>(
      "/auth/account",
      payload,
    );

    return response.data.data;
  },
};
