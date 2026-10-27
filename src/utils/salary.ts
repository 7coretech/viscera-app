/**
 * Healthcare staffing industry salary rate unit and formatting utilities.
 */

export interface SalaryObject {
  min?: number | string | null;
  max?: number | string | null;
  type?: string | null;
}

/**
 * Returns the industry-standard short rate suffix for a given compensation type.
 * e.g., HOURLY -> "/hr", WEEKLY -> "/wk", BIWEEKLY -> "/bi-wk", MONTHLY -> "/mo", ANNUAL/YEARLY -> "/yr"
 */
export const getSalaryUnit = (type?: string | null): string => {
  if (!type) return "/yr";
  const normalized = String(type).toUpperCase().replace(/[-_\s]/g, "");

  switch (normalized) {
    case "HOURLY":
    case "HR":
    case "HOUR":
      return "/hr";

    case "WEEKLY":
    case "WK":
    case "WEEK":
      return "/wk";

    case "BIWEEKLY":
    case "BIWK":
    case "BIWEEK":
    case "EVERY2WEEKS":
      return "/bi-wk";

    case "MONTHLY":
    case "MO":
    case "MONTH":
      return "/mo";

    case "DAILY":
    case "DAY":
    case "PERDIEM":
      return "/day";

    case "ANNUAL":
    case "ANNUALLY":
    case "YEARLY":
    case "YEAR":
    case "YR":
    default:
      return "/yr";
  }
};

/**
 * Formats numeric amount with commas, e.g. 2500 -> "2,500"
 */
export const formatAmount = (val?: number | string | null): string => {
  if (val == null || val === "") return "";
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return String(val);
  return num.toLocaleString("en-US");
};

/**
 * Formats a salary object into an industry standard display string.
 * Examples:
 *   { min: 65, max: 95, type: 'BIWEEKLY' } -> "$65 - $95/bi-wk"
 *   { min: 45, max: 75, type: 'HOURLY' } -> "$45 - $75/hr"
 *   { min: 2500, max: 3200, type: 'WEEKLY' } -> "$2,500 - $3,200/wk"
 *   { min: 120000, max: 140000, type: 'ANNUAL' } -> "$120,000 - $140,000/yr"
 */
export const formatSalary = (salary?: SalaryObject | null): string | null => {
  if (!salary) return null;

  const { min, max, type } = salary;
  const hasMin = min != null && min !== "" && !isNaN(Number(min));
  const hasMax = max != null && max !== "" && !isNaN(Number(max));

  if (!hasMin && !hasMax) return null;

  const unit = getSalaryUnit(type);

  if (hasMin && hasMax) {
    const minNum = Number(min);
    const maxNum = Number(max);
    if (minNum === maxNum) {
      return `$${formatAmount(minNum)}${unit}`;
    }
    return `$${formatAmount(minNum)} - $${formatAmount(maxNum)}${unit}`;
  }

  if (hasMin) {
    return `From $${formatAmount(min)}${unit}`;
  }

  if (hasMax) {
    return `Up to $${formatAmount(max)}${unit}`;
  }

  return null;
};
