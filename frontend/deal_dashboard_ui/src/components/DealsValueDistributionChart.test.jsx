import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import DealsValueDistributionChart from './DealsValueDistributionChart';

// Mock the Pie component from react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Pie: vi.fn((props) => {
    // Store the props for assertion
    global.pieChartProps = props;
    return <div data-testid="mock-pie-chart">Mocked Pie Chart</div>;
  }),
}));

// Mock ChartJS registration (already mocked in DealsStatusChart.test.jsx, but good to have here too for standalone test runs)
vi.mock('chart.js', () => ({
    Chart: {
        register: vi.fn(),
    },
    CategoryScale: vi.fn(),
    LinearScale: vi.fn(),
    BarElement: vi.fn(),
    Title: vi.fn(),
    Tooltip: vi.fn(),
    Legend: vi.fn(),
    ArcElement: vi.fn(),
}));

const mockDeals = [
  { id: 1, name: 'Deal 1', status: 'active', value: '100.00' }, // Ensure value is string like from API/model
  { id: 2, name: 'Deal 2', status: 'active', value: '200.50' },
  { id: 3, name: 'Deal 3', status: 'inactive', value: '300.00' },
  { id: 4, name: 'Deal 4', status: 'archived', value: '400.25' },
  { id: 5, name: 'Deal 5', status: 'active', value: '50.00' },
  { id: 6, name: 'Deal 6', status: 'inactive', value: '60.75' },
];

const emptyDeals = [];

describe('DealsValueDistributionChart Component', () => {
  it('renders the mocked Pie chart', () => {
    render(<DealsValueDistributionChart deals={mockDeals} />);
    expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
    expect(screen.getByText('Mocked Pie Chart')).toBeInTheDocument();
  });

  it('correctly processes deal data for the chart, summing values by status', () => {
    render(<DealsValueDistributionChart deals={mockDeals} />);
    
    const props = global.pieChartProps;
    expect(props).toBeDefined();
    expect(props.data.labels).toEqual(['Active Deals Value', 'Inactive Deals Value', 'Archived Deals Value']);
    expect(props.data.datasets[0].data).toEqual([
      100.00 + 200.50 + 50.00, // Sum of active deals
      300.00 + 60.75,        // Sum of inactive deals
      400.25                 // Sum of archived deals
    ]);
    expect(props.options.plugins.title.text).toBe('Total Value of Deals by Status');
  });

  it('handles empty deals array correctly', () => {
    render(<DealsValueDistributionChart deals={emptyDeals} />);
    
    const props = global.pieChartProps;
    expect(props).toBeDefined();
    expect(props.data.labels).toEqual(['Active Deals Value', 'Inactive Deals Value', 'Archived Deals Value']);
    expect(props.data.datasets[0].data).toEqual([0, 0, 0]);
  });

  it('uses correct background and border colors', () => {
    render(<DealsValueDistributionChart deals={mockDeals} />);
    const props = global.pieChartProps;
    expect(props.data.datasets[0].backgroundColor).toEqual([
      'rgba(75, 192, 192, 0.7)',  // Active
      'rgba(255, 206, 86, 0.7)', // Inactive
      'rgba(153, 102, 255, 0.7)', // Archived
    ]);
    expect(props.data.datasets[0].borderColor).toEqual([
      'rgba(75, 192, 192, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(153, 102, 255, 1)',
    ]);
  });

  it('has a tooltip formatter for currency', () => {
    render(<DealsValueDistributionChart deals={mockDeals} />);
    const props = global.pieChartProps;
    const mockTooltipContext = {
        label: 'Active Deals Value',
        parsed: 350.50
    };
    const formattedLabel = props.options.plugins.tooltip.callbacks.label(mockTooltipContext);
    // Check if it contains the currency symbol and formatted number
    expect(formattedLabel).toContain('$');
    expect(formattedLabel).toContain('350.50'); 
  });
});
