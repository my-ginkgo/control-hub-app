
import { endOfDay, endOfMonth, endOfWeek, endOfYear, startOfDay, startOfMonth, startOfWeek, startOfYear, format, eachDayOfInterval, eachMonthOfInterval } from "date-fns";
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
      return {
        start: startOfYear(now),
        end: endOfYear(now),
      };
    case "custom":
      if (!customDateRange.start || !customDateRange.end) {
        return {
          start: startOfWeek(now, { locale: it }),
          end: endOfWeek(now, { locale: it }),
        };
      }
      return {
        start: startOfDay(customDateRange.start),
        end: endOfDay(customDateRange.end),
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
  
  switch (dateRange) {
    case "day": {
      let current = new Date(start);
      while (current <= end) {
        labels.push(format(current, "HH:00"));
        current = new Date(current.setHours(current.getHours() + 1));
      }
      break;
    }
    case "week": {
      const days = eachDayOfInterval({ start, end });
      days.forEach(day => {
        labels.push(format(day, "EEEE", { locale: it }));
      });
      break;
    }
    case "month": {
      const days = eachDayOfInterval({ start, end });
      days.forEach(day => {
        labels.push(format(day, "dd MMM", { locale: it }));
      });
      break;
    }
    case "year": {
      const months = eachMonthOfInterval({ start, end });
      months.forEach(month => {
        labels.push(format(month, "MMM", { locale: it }));
      });
      break;
    }
    case "custom": {
      const days = eachDayOfInterval({ start, end });
      days.forEach(day => {
        labels.push(format(day, "dd MMM", { locale: it }));
      });
      break;
    }
  }
  
  return labels;
};
