import { create } from "zustand";

import { financeApi } from "@/api/financeApi";
import { BackendReport } from "@/types/api";
import { OverviewFilter } from "@/types/finance";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

type ReportState = {
  report: BackendReport | null;

  selectedFilter: OverviewFilter;

  isLoadingReport: boolean;
  error: string | null;

  setSelectedFilter: (filter: OverviewFilter) => void;

  loadReport: (filter?: OverviewFilter, date?: string) => Promise<void>;

  clearReport: () => void;
};

export const useReportStore = create<ReportState>((set, get) => ({
  report: null,

  selectedFilter: "monthly",

  isLoadingReport: false,
  error: null,

  setSelectedFilter: (filter) => {
    set({
      selectedFilter: filter,
    });
  },

  loadReport: async (filter, date) => {
    const selectedFilter = filter ?? get().selectedFilter;

    set({
      selectedFilter,
      isLoadingReport: true,
      error: null,
    });

    try {
      const report = await financeApi.getReport({
        filter: selectedFilter,
        date,
      });

      set({
        report,
        isLoadingReport: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoadingReport: false,
        error: getApiErrorMessage(error, "Unable to load report."),
      });

      throw error;
    }
  },

  clearReport: () => {
    set({
      report: null,
      selectedFilter: "monthly",
      isLoadingReport: false,
      error: null,
    });
  },
}));
