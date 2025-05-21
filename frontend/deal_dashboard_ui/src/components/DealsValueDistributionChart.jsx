import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const DealsValueDistributionChart = ({ deals }) => {
  const valueByStatus = deals.reduce((acc, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + parseFloat(deal.value);
    return acc;
  }, {});

  const valueActive = valueByStatus['active'] || 0;
  const valueInactive = valueByStatus['inactive'] || 0;
  const valueArchived = valueByStatus['archived'] || 0;

  const chartData = {
    labels: ['Active Deals Value', 'Inactive Deals Value', 'Archived Deals Value'],
    datasets: [
      {
        data: [valueActive, valueInactive, valueArchived],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',  // Active
          'rgba(255, 206, 86, 0.7)', // Inactive
          'rgba(153, 102, 255, 0.7)', // Archived
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
        text: 'Total Value of Deals by Status',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
            }
            return label;
          }
        }
      }
    },
  };

  return <Pie data={chartData} options={chartOptions} />;
};

export default DealsValueDistributionChart;
