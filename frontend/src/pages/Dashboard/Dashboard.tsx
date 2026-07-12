import React from 'react';
import './Dashboard.css';

const summaryData = [
  { label: 'ACTIVE VEHICLES', value: '53', color: 'blue' },
  { label: 'AVAILABLE VEHICLES', value: '42', color: 'green' },
  { label: 'VEHICLES IN MAINTENANCE', value: '05', color: 'orange' },
  { label: 'ACTIVE TRIPS', value: '18', color: 'blue' },
  { label: 'PENDING TRIPS', value: '09', color: 'blue' },
  { label: 'DRIVERS ON DUTY', value: '26', color: 'blue' },
  { label: 'FLEET UTILIZATION', value: '81%', color: 'green' },
];

const recentTrips = [
  { id: 'TR001', vehicle: 'VAN-05', driver: 'Alex', status: 'On Trip', statusColor: 'blue', eta: '45 min' },
  { id: 'TR002', vehicle: 'TRK-12', driver: 'John', status: 'Completed', statusColor: 'green', eta: '--' },
  { id: 'TR003', vehicle: 'MINI-08', driver: 'Priya', status: 'Dispatched', statusColor: 'blue', eta: '1h 10m' },
  { id: 'TR004', vehicle: '--', driver: '--', status: 'Draft', statusColor: 'neutral', eta: 'Awaiting vehicle' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      {/* Filters */}
      <div className="dashboard-filters">
        <span className="filter-label">FILTERS</span>
        <select className="filter-select">
          <option>Vehicle Type: All</option>
        </select>
        <select className="filter-select">
          <option>Status: All</option>
        </select>
        <select className="filter-select">
          <option>Region: All</option>
        </select>
      </div>

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
        <div className="recent-trips-section">
          <h3 className="section-title">RECENT TRIPS</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>TRIP</th>
                <th>VEHICLE</th>
                <th>DRIVER</th>
                <th>STATUS</th>
                <th>ETA</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((trip) => (
                <tr key={trip.id}>
                  <td>{trip.id}</td>
                  <td>{trip.vehicle}</td>
                  <td>{trip.driver}</td>
                  <td>
                    <span className={`status-badge bg-${trip.statusColor}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td>{trip.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vehicle Status */}
        <div className="vehicle-status-section">
          <h3 className="section-title">VEHICLE STATUS</h3>
          
          <div className="status-bar-container">
            <div className="status-bar-label">Available</div>
            <div className="status-bar-track">
              <div className="status-bar-fill bg-green" style={{ width: '70%' }}></div>
            </div>
          </div>
          
          <div className="status-bar-container">
            <div className="status-bar-label">On Trip</div>
            <div className="status-bar-track">
              <div className="status-bar-fill bg-blue" style={{ width: '30%' }}></div>
            </div>
          </div>
          
          <div className="status-bar-container">
            <div className="status-bar-label">In Shop</div>
            <div className="status-bar-track">
              <div className="status-bar-fill bg-orange" style={{ width: '10%' }}></div>
            </div>
          </div>
          
          <div className="status-bar-container">
            <div className="status-bar-label">Retired</div>
            <div className="status-bar-track">
              <div className="status-bar-fill bg-red" style={{ width: '5%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
