import { authApi } from "@/api/authApi";

export async function bootstrapPrototypeUser(): Promise<void> {
  const existingToken = await authApi.getStoredToken();

  if (existingToken) {
    return;
  }

  await authApi.login({
    email: "lara@example.com",
    password: "Password123!",
  });
}
