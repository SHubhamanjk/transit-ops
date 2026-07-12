import React from 'react';
import './Settings.css';

const rbacData = [
  { id: 1, role: 'Fleet Manager', fleet: '✓', drivers: '✓', trips: '-', fuel: '-', analytics: '✓' },
  { id: 2, role: 'Dispatcher', fleet: 'view', drivers: '-', trips: '✓', fuel: '-', analytics: '-' },
  { id: 3, role: 'Safety Officer', fleet: '-', drivers: '✓', trips: 'view', fuel: '-', analytics: '-' },
  { id: 4, role: 'Financial Analyst', fleet: 'view', drivers: '-', trips: '-', fuel: '✓', analytics: '✓' },
];

const Settings: React.FC = () => {
  return (
    <div className="settings-container">
      <div className="settings-left">
        <h3 className="section-title">GENERAL</h3>
        <form className="settings-form">
          <div className="form-group">
            <label>DEPOT NAME</label>
            <input type="text" className="form-input" defaultValue="Gandhinagar Depot GJ4" />
          </div>
          <div className="form-group">
            <label>CURRENCY</label>
            <input type="text" className="form-input" defaultValue="INR (Rs)" />
          </div>
          <div className="form-group">
            <label>DISTANCE UNIT</label>
            <input type="text" className="form-input" defaultValue="Kilometers" />
          </div>
          <button type="button" className="btn-primary settings-save-btn">Save changes</button>
        </form>
      </div>

      <div className="settings-right">
        <h3 className="section-title">ROLE-BASED ACCESS (RBAC)</h3>
        <table className="data-table rbac-table">
          <thead>
            <tr>
              <th>ROLE</th>
              <th>FLEET</th>
              <th>DRIVERS</th>
              <th>TRIPS</th>
              <th>FUEL/EXP.</th>
              <th>ANALYTICS</th>
            </tr>
          </thead>
          <tbody>
            {rbacData.map(row => (
              <tr key={row.id}>
                <td className="font-medium text-white">{row.role}</td>
                <td>{row.fleet}</td>
                <td>{row.drivers}</td>
                <td>{row.trips}</td>
                <td>{row.fuel}</td>
                <td>{row.analytics}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;
