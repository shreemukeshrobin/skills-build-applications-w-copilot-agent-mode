import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import DealsDashboard from './DealsDashboard';

// Mock axios
vi.mock('axios');

const mockDeals = [
    { id: 1, name: 'Active Deal 1 User 1', description: 'Desc 1', value: 100, status: 'active', assigned_to_user_id: 1, creation_date: '2023-01-01T12:00:00Z', last_updated: '2023-01-01T12:00:00Z' },
    { id: 2, name: 'Inactive Deal 2 User 2', description: 'Desc 2', value: 200, status: 'inactive', assigned_to_user_id: 2, creation_date: '2023-01-02T12:00:00Z', last_updated: '2023-01-02T12:00:00Z' },
    { id: 3, name: 'Archived Deal 3 User 1', description: 'Desc 3', value: 300, status: 'archived', assigned_to_user_id: 1, creation_date: '2023-01-03T12:00:00Z', last_updated: '2023-01-03T12:00:00Z' },
    { id: 4, name: 'Active Deal 4 User 3', description: 'Desc 4', value: 400, status: 'active', assigned_to_user_id: 3, creation_date: '2023-01-04T12:00:00Z', last_updated: '2023-01-04T12:00:00Z' },
    { id: 5, name: 'Active Deal 5 User 1', description: 'Desc 5', value: 500, status: 'active', assigned_to_user_id: 1, creation_date: '2023-01-05T12:00:00Z', last_updated: '2023-01-05T12:00:00Z' },
];

// Mock chart components
vi.mock('./DealsStatusChart', () => ({
    default: vi.fn(() => <div data-testid="deals-status-chart-mock">DealsStatusChart Mock</div>),
}));
vi.mock('./DealsValueDistributionChart', () => ({
    default: vi.fn(() => <div data-testid="deals-value-distribution-chart-mock">DealsValueDistributionChart Mock</div>),
}));


describe('DealsDashboard Component', () => {
    beforeEach(() => {
        axios.get.mockResolvedValue({ data: mockDeals });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders initial headings and mock deals correctly', async () => {
        render(<DealsDashboard />);

        // Wait for data to load and component to update
        await waitFor(() => {
            expect(screen.getByText('Active Deals')).toBeInTheDocument();
            expect(screen.getByText('Inactive Deals')).toBeInTheDocument();
            expect(screen.getByText('Archived Deals')).toBeInTheDocument();
        });

        // Check for Active Deals
        expect(screen.getByText('Active Deal 1 User 1')).toBeInTheDocument();
        expect(screen.getByText('Active Deal 4 User 3')).toBeInTheDocument();
        expect(screen.getByText('Active Deal 5 User 1')).toBeInTheDocument();

        // Check for Inactive Deals
        expect(screen.getByText('Inactive Deal 2 User 2')).toBeInTheDocument();

        // Check for Archived Deals
        expect(screen.getByText('Archived Deal 3 User 1')).toBeInTheDocument();

        // Check if chart mocks are rendered
        expect(screen.getByTestId('deals-status-chart-mock')).toBeInTheDocument();
        expect(screen.getByTestId('deals-value-distribution-chart-mock')).toBeInTheDocument();
    });

    it('filters deals when "Show only my deals" is checked and unchecked', async () => {
        render(<DealsDashboard />);
        const currentUserId = 1; // As hardcoded in DealsDashboard.jsx

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByText('Active Deal 1 User 1')).toBeInTheDocument();
        });

        const filterCheckbox = screen.getByLabelText(`Show only my deals (User ID: ${currentUserId})`);

        // --- Check the filter ---
        fireEvent.click(filterCheckbox);

        await waitFor(() => {
            // Deals assigned to user 1 should be visible
            expect(screen.getByText('Active Deal 1 User 1')).toBeInTheDocument();
            expect(screen.getByText('Active Deal 5 User 1')).toBeInTheDocument(); // Active
            expect(screen.getByText('Archived Deal 3 User 1')).toBeInTheDocument(); // Archived

            // Deals not assigned to user 1 should NOT be visible
            expect(screen.queryByText('Inactive Deal 2 User 2')).not.toBeInTheDocument();
            expect(screen.queryByText('Active Deal 4 User 3')).not.toBeInTheDocument();
        });

        // --- Uncheck the filter ---
        fireEvent.click(filterCheckbox);

        await waitFor(() => {
            // All deals should be visible again in their respective sections
            expect(screen.getByText('Active Deal 1 User 1')).toBeInTheDocument();
            expect(screen.getByText('Inactive Deal 2 User 2')).toBeInTheDocument();
            expect(screen.getByText('Archived Deal 3 User 1')).toBeInTheDocument();
            expect(screen.getByText('Active Deal 4 User 3')).toBeInTheDocument();
            expect(screen.getByText('Active Deal 5 User 1')).toBeInTheDocument();
        });
    });

    it('displays "No deals in this category." when a category has no deals', async () => {
        axios.get.mockResolvedValue({ data: [
            { id: 1, name: 'Active Only Deal', status: 'active', assigned_to_user_id: 1, value: 100 },
        ]});
        render(<DealsDashboard />);

        await waitFor(() => {
            expect(screen.getByText('Active Deals')).toBeInTheDocument();
            expect(screen.getByText('Active Only Deal')).toBeInTheDocument();
        });
        
        // Check for "No deals" message in Inactive and Archived sections
        const inactiveSection = screen.getByText('Inactive Deals').closest('.deals-section');
        expect(inactiveSection).toHaveTextContent('No deals in this category.');

        const archivedSection = screen.getByText('Archived Deals').closest('.deals-section');
        expect(archivedSection).toHaveTextContent('No deals in this category.');
    });

     it('handles API error gracefully', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        axios.get.mockRejectedValue(new Error('Network Error'));
        render(<DealsDashboard />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching deals:', expect.any(Error));
        });
        
        // Check that sections are still rendered but with no deals message
        const activeSection = screen.getByText('Active Deals').closest('.deals-section');
        expect(activeSection).toHaveTextContent('No deals in this category.');

        consoleErrorSpy.mockRestore();
    });
});
