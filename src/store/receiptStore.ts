import { create } from "zustand";

import { receiptApi } from "@/api/receiptApi";
import { ReceiptScanResponse } from "@/types/api";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

type ScanReceiptInput = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

type ReceiptState = {
  receiptImageUri: string | null;
  scanResult: ReceiptScanResponse | null;

  isScanning: boolean;
  error: string | null;

  scanReceipt: (input: ScanReceiptInput) => Promise<ReceiptScanResponse>;

  setReceiptImageUri: (uri: string | null) => void;

  clearReceipt: () => void;
};

export const useReceiptStore = create<ReceiptState>((set) => ({
  receiptImageUri: null,
  scanResult: null,

  isScanning: false,
  error: null,

  scanReceipt: async (input) => {
    set({
      receiptImageUri: input.uri,
      scanResult: null,
      isScanning: true,
      error: null,
    });

    try {
      const result = await receiptApi.scanReceipt(input);

      set({
        scanResult: result,
        isScanning: false,
        error: null,
      });

      return result;
    } catch (error) {
      set({
        scanResult: null,
        isScanning: false,
        error: getApiErrorMessage(error, "Unable to scan the receipt."),
      });

      throw error;
    }
  },

  setReceiptImageUri: (uri) => {
    set({
      receiptImageUri: uri,
    });
  },

  clearReceipt: () => {
    set({
      receiptImageUri: null,
      scanResult: null,
      isScanning: false,
      error: null,
    });
  },
}));
