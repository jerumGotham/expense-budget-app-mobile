import { BudgetPeriod, OverviewFilter } from "@/types/finance";

const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;
const AVERAGE_WEEKS_PER_MONTH = WEEKS_PER_YEAR / MONTHS_PER_YEAR;

export function getPeriodMultiplier(
  sourcePeriod: BudgetPeriod,
  targetPeriod: OverviewFilter,
): number {
  if (sourcePeriod === "weekly") {
    switch (targetPeriod) {
      case "weekly":
        return 1;

      case "monthly":
        return AVERAGE_WEEKS_PER_MONTH;

      case "yearly":
        return WEEKS_PER_YEAR;

      default:
        return 1;
    }
  }

  switch (targetPeriod) {
    case "weekly":
      return MONTHS_PER_YEAR / WEEKS_PER_YEAR;

    case "monthly":
      return 1;

    case "yearly":
      return MONTHS_PER_YEAR;

    default:
      return 1;
  }
}

export function convertPeriodAmount(
  value: number,
  sourcePeriod: BudgetPeriod,
  targetPeriod: OverviewFilter,
): number {
  return value * getPeriodMultiplier(sourcePeriod, targetPeriod);
}

export function getPeriodLabel(period: BudgetPeriod | OverviewFilter): string {
  switch (period) {
    case "weekly":
      return "week";

    case "monthly":
      return "month";

    case "yearly":
      return "year";

    default:
      return "period";
  }
}
