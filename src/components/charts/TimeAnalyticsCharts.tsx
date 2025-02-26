import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { it } from "date-fns/locale";
import { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { TimeEntryData } from "../TimeEntry";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

type ChartType = "line" | "groupedBar" | "stackedBar" | "userWorkload";
type DateRange = "day" | "week" | "month" | "year" | "custom";

export function TimeAnalyticsCharts({ entries, isAdmin }: { entries: TimeEntryData[]; isAdmin: boolean }) {
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [customDateRange, setCustomDateRange] = useState<{ start: Date | undefined; end: Date | undefined }>({
    start: undefined,
    end: undefined,
  });

  const { data: userProfiles } = useQuery({
    queryKey: ["userProfiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name");
      if (error) throw error;
      return data || [];
    },
  });

  const getUserFullName = (userId: string) => {
    const profile = userProfiles?.find(p => p.id === userId);
    if (!profile) return userId;
    if (!profile.first_name && !profile.last_name) return userId;
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  };

  const getDateRange = () => {
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
        return {
          start: customDateRange.start ? startOfDay(customDateRange.start) : startOfWeek(now, { locale: it }),
          end: customDateRange.end ? endOfDay(customDateRange.end) : endOfWeek(now, { locale: it }),
        };
    }
  };

  const { start, end } = getDateRange();

  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.startDate);
    return entryDate >= start && entryDate <= end;
  });

  const formatDateLabel = (date: Date) => {
    switch (dateRange) {
      case "day":
        return format(date, "HH:00");
      case "week":
        return format(date, "EEEE", { locale: it });
      case "month":
        return format(date, "dd MMM", { locale: it });
    }
  };

  const groupEntriesByTimeUnit = () => {
    const groupedData: Record<string, { dates: string[]; hours: number[]; billableHours: number[] }> = {};

    filteredEntries.forEach((entry) => {
      const entryDate = new Date(entry.startDate);
      const dateKey = formatDateLabel(entryDate);

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

  const groupEntriesByUser = () => {
    const userWorkload: Record<string, { dates: string[]; hours: number[] }> = {};

    filteredEntries.forEach((entry) => {
      const entryDate = new Date(entry.startDate);
      const dateKey = formatDateLabel(entryDate);
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

  const groupedData = groupEntriesByTimeUnit();
  const userWorkloadData = groupEntriesByUser();
  const uniqueProjects = Object.keys(groupedData);
  const uniqueUsers = Object.keys(userWorkloadData);

  const generateTimeLabels = () => {
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

  const timeLabels = generateTimeLabels();

  const projectColors = uniqueProjects.reduce((acc, project, index) => {
    const hue = (index * 137.5) % 360;
    acc[project] = `hsla(${hue}, 70%, 50%, 1)`;
    return acc;
  }, {} as Record<string, string>);

  const userColors = uniqueUsers.reduce((acc, userId, index) => {
    const hue = (index * 137.5) % 360;
    acc[userId] = `hsla(${hue}, 70%, 50%, 1)`;
    return acc;
  }, {} as Record<string, string>);

  const getChartData = () => {
    switch (chartType) {
      case "userWorkload":
        return {
          labels: timeLabels,
          datasets: uniqueUsers.map((userId) => ({
            label: getUserFullName(userId),
            data: timeLabels.map((label) => {
              const index = userWorkloadData[userId].dates.indexOf(label);
              return index !== -1 ? userWorkloadData[userId].hours[index] : 0;
            }),
            backgroundColor: userColors[userId],
            borderColor: userColors[userId],
            tension: 0.3,
            fill: false,
          })),
        };

      case "line":
        return {
          labels: timeLabels,
          datasets: uniqueProjects.map((project) => ({
            label: project,
            data: timeLabels.map((label) => {
              const index = groupedData[project].dates.indexOf(label);
              return index !== -1 ? groupedData[project].hours[index] : 0;
            }),
            borderColor: projectColors[project],
            backgroundColor: projectColors[project],
            tension: 0.3,
            fill: false,
          })),
        };

      case "groupedBar":
        return {
          labels: timeLabels,
          datasets: uniqueProjects.map((project) => ({
            label: project,
            data: timeLabels.map((label) => {
              const index = groupedData[project].dates.indexOf(label);
              return index !== -1 ? groupedData[project].hours[index] : 0;
            }),
            backgroundColor: projectColors[project],
          })),
        };

      case "stackedBar":
        return {
          labels: timeLabels,
          datasets: [
            {
              label: "Ore Billabili",
              data: timeLabels.map((label) =>
                uniqueProjects.reduce((sum, project) => {
                  const index = groupedData[project].dates.indexOf(label);
                  return sum + (index !== -1 ? groupedData[project].billableHours[index] : 0);
                }, 0)
              ),
              backgroundColor: "hsla(145, 70%, 50%, 0.7)",
            },
            {
              label: "Ore Non Billabili",
              data: timeLabels.map((label) =>
                uniqueProjects.reduce((sum, project) => {
                  const index = groupedData[project].dates.indexOf(label);
                  const totalHours = index !== -1 ? groupedData[project].hours[index] : 0;
                  const billableHours = index !== -1 ? groupedData[project].billableHours[index] : 0;
                  return sum + (totalHours - billableHours);
                }, 0)
              ),
              backgroundColor: "hsla(0, 70%, 50%, 0.7)",
            },
          ],
        };
    }
  };

  const chartOptions = {
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

  return (
    <Card className="w-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Andamento Temporale</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-4">
              {dateRange === "custom" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-[280px] justify-start text-left font-normal`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange.start ? (
                        customDateRange.end ? (
                          <>
                            {format(customDateRange.start, "dd/MM/yyyy")} -{" "}
                            {format(customDateRange.end, "dd/MM/yyyy")}
                          </>
                        ) : (
                          format(customDateRange.start, "dd/MM/yyyy")
                        )
                      ) : (
                        <span>Seleziona un intervallo</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={customDateRange.start}
                      selected={{
                        from: customDateRange.start,
                        to: customDateRange.end,
                      }}
                      onSelect={(range) => {
                        setCustomDateRange({
                          start: range?.from,
                          end: range?.to,
                        });
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              )}

              <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Giorno corrente</SelectItem>
                  <SelectItem value="week">Settimana corrente</SelectItem>
                  <SelectItem value="month">Mese corrente</SelectItem>
                  <SelectItem value="year">Anno corrente</SelectItem>
                  <SelectItem value="custom">Range personalizzato</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Analisi Temporale 📈</SelectItem>
                <SelectItem value="groupedBar">Confronto Progetti 📊</SelectItem>
                <SelectItem value="stackedBar">Efficienza 🏗️</SelectItem>
                {isAdmin && <SelectItem value="userWorkload">Carico per Utente 👥</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="h-[400px]">
          {chartType === "userWorkload" ? (
            <Line data={getChartData()} options={chartOptions} />
          ) : chartType === "line" ? (
            <Line data={getChartData()} options={chartOptions} />
          ) : (
            <Bar data={getChartData()} options={chartOptions} />
          )}
        </div>
      </div>
    </Card>
  );
}
