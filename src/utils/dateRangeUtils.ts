
import { endOfDay, endOfMonth, endOfWeek, endOfYear, startOfDay, startOfMonth, startOfWeek, startOfYear, format } from "date-fns";
import { it } from "date-fns/locale";
import { DateRange } from "@/types/chart";

export const getDateRange = (dateRange: DateRange, customDateRange: { start: Date | undefined; end: Date | undefined }) => {
  const now = new Date();
  switch (dateRange) {
    case "day":
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };
    case "week":
      return {
        start: startOfWeek(now, { locale: it }),
        end: endOfWeek(now, { locale: it }),
      };
    case "month":
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
    case "year":
      const yearStart = startOfYear(now);
      const yearEnd = endOfYear(now);
      return {
        start: yearStart,
        end: yearEnd,
      };
    case "custom":
      return {
        start: customDateRange.start ? startOfDay(customDateRange.start) : startOfWeek(now, { locale: it }),
        end: customDateRange.end ? endOfDay(customDateRange.end) : endOfWeek(now, { locale: it }),
      };
  }
};

export const formatDateLabel = (date: Date, dateRange: DateRange) => {
  switch (dateRange) {
    case "day":
      return format(date, "HH:00");
    case "week":
      return format(date, "EEEE", { locale: it });
    case "month":
      return format(date, "dd MMM", { locale: it });
    case "year":
      return format(date, "MMM", { locale: it });
    default:
      return format(date, "dd MMM", { locale: it });
  }
};

export const generateTimeLabels = (start: Date, end: Date, dateRange: DateRange) => {
  const labels: string[] = [];
  let current = new Date(start);

  while (current <= end) {
    switch (dateRange) {
      case "day":
        labels.push(format(current, "HH:00"));
        current = new Date(current.setHours(current.getHours() + 1));
        break;
      case "week":
        labels.push(format(current, "EEEE", { locale: it }));
        current = new Date(current.setDate(current.getDate() + 1));
        break;
      case "month":
        labels.push(format(current, "dd MMM", { locale: it }));
        current = new Date(current.setDate(current.getDate() + 1));
        break;
    }
  }
  return labels;
};

