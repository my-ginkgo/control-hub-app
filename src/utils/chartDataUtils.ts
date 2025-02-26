
import { TimeEntryData } from "@/components/TimeEntry";
import { ChartType } from "@/types/chart";
import { formatDateLabel } from "./dateRangeUtils";

export const groupEntriesByTimeUnit = (filteredEntries: TimeEntryData[]) => {
  const groupedData: Record<string, { dates: string[]; hours: number[]; billableHours: number[] }> = {};

  filteredEntries.forEach((entry) => {
    const entryDate = new Date(entry.startDate);
    const dateKey = formatDateLabel(entryDate, "month"); // Default to month format

    if (!groupedData[entry.project]) {
      groupedData[entry.project] = {
        dates: [],
        hours: [],
        billableHours: [],
      };
    }

    const projectData = groupedData[entry.project];
    const existingIndex = projectData.dates.indexOf(dateKey);

    if (existingIndex === -1) {
      projectData.dates.push(dateKey);
      projectData.hours.push(entry.hours);
      projectData.billableHours.push(entry.billableHours);
    } else {
      projectData.hours[existingIndex] += entry.hours;
      projectData.billableHours[existingIndex] += entry.billableHours;
    }
  });

  return groupedData;
};

export const groupEntriesByUser = (filteredEntries: TimeEntryData[]) => {
  const userWorkload: Record<string, { dates: string[]; hours: number[] }> = {};

  filteredEntries.forEach((entry) => {
    const entryDate = new Date(entry.startDate);
    const dateKey = formatDateLabel(entryDate, "month"); // Default to month format
    const userId = entry.assignedUserId;

    if (!userWorkload[userId]) {
      userWorkload[userId] = {
        dates: [],
        hours: [],
      };
    }

    const userData = userWorkload[userId];
    const existingIndex = userData.dates.indexOf(dateKey);

    if (existingIndex === -1) {
      userData.dates.push(dateKey);
      userData.hours.push(entry.hours);
    } else {
      userData.hours[existingIndex] += entry.hours;
    }
  });

  return userWorkload;
};

export const generateColors = (items: string[]) => {
  return items.reduce((acc, item, index) => {
    const hue = (index * 137.5) % 360;
    acc[item] = `hsla(${hue}, 70%, 50%, 1)`;
    return acc;
  }, {} as Record<string, string>);
};

export const getChartOptions = (chartType: ChartType) => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        stacked: chartType === "stackedBar",
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        stacked: chartType === "stackedBar",
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };
};

