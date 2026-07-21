import { apiClient } from "@/api/client";
import { ApiResponse, ReceiptScanResponse } from "@/types/api";

type ScanReceiptInput = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export const receiptApi = {
  async scanReceipt(input: ScanReceiptInput): Promise<ReceiptScanResponse> {
    const formData = new FormData();

    formData.append("receipt", {
      uri: input.uri,

      name: input.fileName ?? `receipt-${Date.now()}.jpg`,

      type: input.mimeType ?? "image/jpeg",
    } as unknown as Blob);

    const response = await apiClient.post<ApiResponse<ReceiptScanResponse>>(
      "/receipts/upload",
      formData,
      {
        timeout: 120000,

        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.data;
  },
};
