import React from 'react';
import './Drivers.css';

const driversData = [
  { name: 'Alex', license: 'DL-88213', category: 'LMV', expiry: '12/2028', contact: '98765xxxx', completion: '96%', safety: 'Available', safetyColor: 'green', status: 'Available', statusColor: 'green' },
  { name: 'John', license: 'DL-44120', category: 'HMV', expiry: '03/2025 EXPIRE', contact: '98220xxxx', completion: '81%', safety: 'Suspended', safetyColor: 'orange', status: 'Suspended', statusColor: 'orange' },
  { name: 'Priya', license: 'DL-77031', category: 'LMV', expiry: '08/2027', contact: '99110xxxx', completion: '99%', safety: 'On Trip', safetyColor: 'blue', status: 'On Trip', statusColor: 'blue' },
  { name: 'Suresh', license: 'DL-90045', category: 'HMV', expiry: '01/2027', contact: '97440xxxx', completion: '88%', safety: 'Available', safetyColor: 'green', status: 'Off Duty', statusColor: 'neutral' },
];

const Drivers: React.FC = () => {
  return (
    <div className="drivers-container">
      <div className="drivers-header-actions">
        <div className="drivers-filters">
          <input type="text" className="search-input" placeholder="Search..." />
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1.5rem' }}>
          + Add Driver
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>DRIVER</th>
              <th>LICENSE NO.</th>
              <th>CATEGORY</th>
              <th>EXPIRY</th>
              <th>CONTACT</th>
              <th>TRIP COMPL.</th>
              <th>SAFETY</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {driversData.map((driver, index) => (
              <tr key={index}>
                <td>{driver.name}</td>
                <td>{driver.license}</td>
                <td>{driver.category}</td>
                <td>{driver.expiry}</td>
                <td>{driver.contact}</td>
                <td>{driver.completion}</td>
                <td>
                  <span className={`status-badge-outline border-${driver.safetyColor}`}>
                    {driver.safety}
                  </span>
                </td>
                <td>
                  <span className={`status-badge bg-${driver.statusColor}`}>
                    {driver.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="toggle-stats">
        <div className="toggle-label">TOGGLE STATS</div>
        <div className="toggle-buttons">
          <button className="toggle-btn bg-green">Available</button>
          <button className="toggle-btn bg-blue">On Trip</button>
          <button className="toggle-btn bg-neutral">Off Duty</button>
          <button className="toggle-btn bg-orange">Suspended</button>
        </div>
      </div>
      
      <div className="drivers-rules">
        Rule: Expired license or Suspended status → blocked from trip assignment
      </div>
    </div>
  );
};

export default Drivers;
