import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DealsDashboard.css';
import DealsStatusChart from './DealsStatusChart';
import DealsValueDistributionChart from './DealsValueDistributionChart';

const DealsDashboard = () => {
    const [allDeals, setAllDeals] = useState([]);
    const [displayedDeals, setDisplayedDeals] = useState([]);
    const [myDealsOnly, setMyDealsOnly] = useState(false);
    const currentUserId = 1; // Hardcoded user ID

    useEffect(() => {
        axios.get('/api/deals/')
            .then(response => {
                setAllDeals(response.data);
            })
            .catch(error => {
                console.error('Error fetching deals:', error);
            });
    }, []);

    useEffect(() => {
        let filtered = allDeals;
        if (myDealsOnly) {
            filtered = filtered.filter(deal => deal.assigned_to_user_id === currentUserId);
        }
        setDisplayedDeals(filtered);
    }, [allDeals, myDealsOnly, currentUserId]);

    const toggleMyDealsFilter = () => {
        setMyDealsOnly(!myDealsOnly);
    };

    const renderDealsSection = (deals, title) => (
        <div className="deals-section">
            <h2>{title}</h2>
            {deals.length === 0 ? <p>No deals in this category.</p> : (
                <ul className="deals-list">
                    {deals.map(deal => (
                        <li key={deal.id} className={`deal-item status-${deal.status}`}>
                            <h3>{deal.name}</h3>
                            <p><strong>Description:</strong> {deal.description || 'N/A'}</p>
                            <p><strong>Value:</strong> ${deal.value}</p>
                            <p><strong>Status:</strong> {deal.status}</p>
                            <p><strong>Assigned to User ID:</strong> {deal.assigned_to_user_id}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    const activeDeals = displayedDeals.filter(deal => deal.status === 'active');
    const inactiveDeals = displayedDeals.filter(deal => deal.status === 'inactive');
    const archivedDeals = displayedDeals.filter(deal => deal.status === 'archived');

    return (
        <div className="deals-dashboard">
            <h1>Deals Dashboard</h1>
            <div className="filter-controls">
                <label>
                    <input
                        type="checkbox"
                        checked={myDealsOnly}
                        onChange={toggleMyDealsFilter}
                    />
                    Show only my deals (User ID: {currentUserId})
                </label>
            </div>

            <div className="charts-container">
                <div className="chart-wrapper">
                    <DealsStatusChart deals={displayedDeals} />
                </div>
                <div className="chart-wrapper">
                    <DealsValueDistributionChart deals={displayedDeals} />
                </div>
            </div>

            {renderDealsSection(activeDeals, 'Active Deals')}
            {renderDealsSection(inactiveDeals, 'Inactive Deals')}
            {renderDealsSection(archivedDeals, 'Archived Deals')}
            {/* Removed the "All Deals (Filtered)" section as charts provide overview */}
        </div>
    );
};

export default DealsDashboard;
