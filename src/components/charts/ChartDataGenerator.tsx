
import { TimeEntryData } from "@/components/TimeEntry";
import { ChartType } from "@/types/chart";
import { generateTimeLabels } from "@/utils/dateRangeUtils";
import { groupEntriesByTimeUnit, groupEntriesByUser, generateColors } from "@/utils/chartDataUtils";

interface ChartDataGeneratorProps {
  timeLabels: string[];
  chartType: ChartType;
  filteredEntries: TimeEntryData[];
  getUserFullName: (userId: string) => string;
}

export function generateChartData({
  timeLabels,
  chartType,
  filteredEntries,
  getUserFullName,
}: ChartDataGeneratorProps) {
  const groupedData = groupEntriesByTimeUnit(filteredEntries);
  const userWorkloadData = groupEntriesByUser(filteredEntries);
  
  const uniqueProjects = Object.keys(groupedData);
  const uniqueUsers = Object.keys(userWorkloadData);
  
  const projectColors = generateColors(uniqueProjects);
  const userColors = generateColors(uniqueUsers);

  switch (chartType) {
    case "billableEfficiency":
      return {
        labels: uniqueProjects,
        datasets: [
          {
            label: "Efficienza Fatturabile (%)",
            data: uniqueProjects.map((project) => {
              const totalHours = groupedData[project].hours.reduce((sum, h) => sum + h, 0);
              const billableHours = groupedData[project].billableHours.reduce((sum, h) => sum + h, 0);
              return totalHours > 0 ? ((billableHours / totalHours) * 100).toFixed(1) : 0;
            }),
            backgroundColor: Object.values(projectColors),
            borderColor: Object.values(projectColors),
          },
        ],
      };

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
}

