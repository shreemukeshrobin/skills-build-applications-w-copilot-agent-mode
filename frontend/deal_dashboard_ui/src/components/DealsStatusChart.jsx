import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DealsStatusChart = ({ deals }) => {
  const countByStatus = deals.reduce((acc, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1;
    return acc;
  }, {});

  const countActive = countByStatus['active'] || 0;
  const countInactive = countByStatus['inactive'] || 0;
  const countArchived = countByStatus['archived'] || 0;

  const chartData = {
    labels: ['Active', 'Inactive', 'Archived'],
    datasets: [
      {
        label: 'Number of Deals',
        data: [countActive, countInactive, countArchived],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',  // Active
          'rgba(255, 206, 86, 0.6)', // Inactive
          'rgba(153, 102, 255, 0.6)', // Archived (Changed from red for better distinction from inactive)
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Deals by Status',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
    },
  };

  return <Bar data={chartData} options={chartOptions} />;
};

export default DealsStatusChart;
