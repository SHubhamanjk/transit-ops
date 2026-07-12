import React, { useState, useEffect } from 'react';
import { getKPIs } from '../../api/dashboard';
import { getTrips } from '../../api/trips';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<any>({});
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [kpiData, tripsData] = await Promise.all([
          getKPIs(),
          getTrips(0, 5) // Fetch 5 most recent trips
        ]);
        setKpis(kpiData);
        setRecentTrips(tripsData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalVehicles = kpis.total_vehicles || 0;
  const availableVehicles = kpis.active_vehicles || 0;
  const inShopVehicles = kpis.vehicles_in_shop || 0;
  const onTripVehicles = kpis.vehicles_on_trip || 0;
  const retiredVehicles = totalVehicles - availableVehicles - inShopVehicles - onTripVehicles;

  const totalDrivers = kpis.total_drivers || 0;
  const availableDrivers = kpis.active_drivers || 0;
  const onTripDrivers = kpis.drivers_on_trip || 0;
  const offDutyDrivers = kpis.drivers_off_duty || 0;
  const suspendedDrivers = kpis.suspended_drivers || 0;

  const formatCurrency = (val: number) => `$${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const summaryData = [
    { label: 'TOTAL VEHICLES', value: totalVehicles, color: 'blue' },
    { label: 'TOTAL TRIPS', value: kpis.total_trips || 0, color: 'green' },
    { label: 'ACTIVE TRIPS', value: kpis.active_trips || 0, color: 'blue' },
    { label: 'TOTAL DRIVERS', value: totalDrivers, color: 'blue' },
    { label: 'DRIVERS ON DUTY', value: onTripDrivers, color: 'green' },
    { label: 'TOTAL OP. COST', value: formatCurrency(kpis.total_operational_cost), color: 'orange' },
    { label: 'TRIP COSTS', value: formatCurrency(kpis.total_trip_cost), color: 'blue' },
    { label: 'MAINTENANCE COST', value: formatCurrency(kpis.total_maintenance_cost), color: 'red' },
  ];

  if (loading) return <div className="dashboard-container"><div className="loading-state">Loading dashboard...</div></div>;

  return (
    <div className="dashboard-container">
      {/* Summary Cards */}
      <div className="summary-cards">
        {summaryData.map((item, index) => (
          <div key={index} className={`summary-card border-${item.color}`}>
            <div className="card-label">{item.label}</div>
            <div className="card-value">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent Trips */}
        <div className="recent-trips-section" style={{ gridColumn: 'span 2' }}>
          <h3 className="section-title">RECENT TRIPS</h3>
          {recentTrips.length === 0 ? (
            <div className="empty-state">No recent trips found.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>TRIP</th>
                  <th>DRIVER ID</th>
                  <th>STATUS</th>
                  <th>DISTANCE</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td title={trip.id}>{trip.id.substring(0, 8)}...</td>
                    <td title={trip.driver_id}>{trip.driver_id.substring(0, 8)}...</td>
                    <td>
                      <span className={`status-badge status-${trip.status.toLowerCase().replace('_', '-')}`}>
                        {trip.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{trip.estimated_distance} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Vehicle Status */}
        <div className="vehicle-status-section">
          <h3 className="section-title">VEHICLE STATUS</h3>
          
          <div className="status-bar-container">
            <div className="status-bar-label">Available ({availableVehicles})</div>
            <div className="status-bar-track">
              <div className="status-bar-fill bg-green" style={{ width: `${totalVehicles ? (availableVehicles / totalVehicles) * 100 : 0}%` }}></div>
            </div>
          </div>
          
          <div className="status-bar-container">
            <div className="status-bar-label">On Trip ({onTripVehicles})</div>
            <div className="status-bar-track">
              <div className="status-bar-fill bg-blue" style={{ width: `${totalVehicles ? (onTripVehicles / totalVehicles) * 100 : 0}%` }}></div>
            </div>
          </div>
          
          <div className="status-bar-container">
            <div className="status-bar-label">In Shop ({inShopVehicles})</div>
            <div className="status-bar-track">
              <div className="status-bar-fill bg-orange" style={{ width: `${totalVehicles ? (inShopVehicles / totalVehicles) * 100 : 0}%` }}></div>
            </div>
          </div>
          
          <div className="status-bar-container">
            <div className="status-bar-label">Retired ({retiredVehicles})</div>
            <div className="status-bar-track">
              <div className="status-bar-fill bg-red" style={{ width: `${totalVehicles ? (retiredVehicles / totalVehicles) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Driver Status */}
        <div className="vehicle-status-section">
          <h3 className="section-title">DRIVER STATUS</h3>
          
          <div className="status-bar-container">
            <div className="status-bar-label">Available ({availableDrivers})</div>
            <div className="status-bar-track">
              <div className="status-bar-fill bg-green" style={{ width: `${totalDrivers ? (availableDrivers / totalDrivers) * 100 : 0}%` }}></div>
            </div>
          </div>
          
          <div className="status-bar-container">
            <div className="status-bar-label">On Trip ({onTripDrivers})</div>
            <div className="status-bar-track">
              <div className="status-bar-fill bg-blue" style={{ width: `${totalDrivers ? (onTripDrivers / totalDrivers) * 100 : 0}%` }}></div>
            </div>
          </div>
          
          <div className="status-bar-container">
            <div className="status-bar-label">Off Duty ({offDutyDrivers})</div>
            <div className="status-bar-track">
              <div className="status-bar-fill bg-neutral" style={{ width: `${totalDrivers ? (offDutyDrivers / totalDrivers) * 100 : 0}%` }}></div>
            </div>
          </div>
          
          <div className="status-bar-container">
            <div className="status-bar-label">Suspended ({suspendedDrivers})</div>
            <div className="status-bar-track">
              <div className="status-bar-fill bg-red" style={{ width: `${totalDrivers ? (suspendedDrivers / totalDrivers) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
