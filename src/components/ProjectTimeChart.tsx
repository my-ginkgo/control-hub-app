
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TimeEntry } from '@/types/TimeEntry';

interface ProjectTimeChartProps {
  entries: TimeEntry[];
}

export function ProjectTimeChart({ entries }: ProjectTimeChartProps) {
  const data = entries.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(),
    hours: entry.hours,
    billableHours: entry.billableHours
  }));

  return (
    <div className="w-full h-[400px]">
      <LineChart
        width={800}
        height={400}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="hours" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="billableHours" stroke="#82ca9d" />
      </LineChart>
    </div>
  );
}
