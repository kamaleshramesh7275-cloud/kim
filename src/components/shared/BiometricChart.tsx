"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BiometricChartProps {
  data: number[];
  labels: string[];
  title?: string;
  color?: string;
}

export function BiometricChart({ data, labels, title, color = "rgb(99, 102, 241)" }: BiometricChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: "Recovery Score",
        data,
        borderColor: color,
        backgroundColor: color.replace(")", ", 0.2)").replace("rgb", "rgba"),
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
