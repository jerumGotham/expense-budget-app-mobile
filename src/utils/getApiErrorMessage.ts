export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const requestError = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    return requestError.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
