import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import DealsStatusChart from './DealsStatusChart';

// Mock the Bar component from react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Bar: vi.fn((props) => {
    // Store the props for assertion
    global.barChartProps = props;
    return <div data-testid="mock-bar-chart">Mocked Bar Chart</div>;
  }),
}));

// Mock ChartJS registration (if it causes issues in test environment)
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
    ArcElement: vi.fn(), // Also mock ArcElement if used by other charts
}));


const mockDeals = [
  { id: 1, name: 'Deal 1', status: 'active', value: 100 },
  { id: 2, name: 'Deal 2', status: 'active', value: 200 },
  { id: 3, name: 'Deal 3', status: 'inactive', value: 300 },
  { id: 4, name: 'Deal 4', status: 'archived', value: 400 },
  { id: 5, name: 'Deal 5', status: 'active', value: 500 },
  { id: 6, name: 'Deal 6', status: 'inactive', value: 600 },
];

const emptyDeals = [];

describe('DealsStatusChart Component', () => {
  it('renders the mocked Bar chart', () => {
    render(<DealsStatusChart deals={mockDeals} />);
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
    expect(screen.getByText('Mocked Bar Chart')).toBeInTheDocument();
  });

  it('correctly processes deal data for the chart', () => {
    render(<DealsStatusChart deals={mockDeals} />);
    
    // Access the props passed to the mocked Bar component
    const props = global.barChartProps;
    expect(props).toBeDefined();
    expect(props.data.labels).toEqual(['Active', 'Inactive', 'Archived']);
    expect(props.data.datasets[0].label).toBe('Number of Deals');
    expect(props.data.datasets[0].data).toEqual([3, 2, 1]); // 3 active, 2 inactive, 1 archived
    expect(props.options.plugins.title.text).toBe('Deals by Status');
  });

  it('handles empty deals array correctly', () => {
    render(<DealsStatusChart deals={emptyDeals} />);
    
    const props = global.barChartProps;
    expect(props).toBeDefined();
    expect(props.data.labels).toEqual(['Active', 'Inactive', 'Archived']);
    expect(props.data.datasets[0].data).toEqual([0, 0, 0]);
  });

  it('uses correct background and border colors', () => {
    render(<DealsStatusChart deals={mockDeals} />);
    const props = global.barChartProps;
    expect(props.data.datasets[0].backgroundColor).toEqual([
      'rgba(75, 192, 192, 0.6)',  // Active
      'rgba(255, 206, 86, 0.6)', // Inactive
      'rgba(153, 102, 255, 0.6)', // Archived
    ]);
    expect(props.data.datasets[0].borderColor).toEqual([
      'rgba(75, 192, 192, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(153, 102, 255, 1)',
    ]);
  });
});
