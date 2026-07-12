import React from 'react';
import './Maintenance.css';

const serviceLogs = [
  { id: 1, vehicle: 'VAN-05', service: 'Oil Change', cost: '2,500', status: 'In Shop', statusColor: 'amber' },
  { id: 2, vehicle: 'TRUCK-11', service: 'Engine Repair', cost: '18,000', status: 'Completed', statusColor: 'green' },
  { id: 3, vehicle: 'MINI-03', service: 'Tyre Replace', cost: '6,200', status: 'In Shop', statusColor: 'amber' },
];

const Maintenance: React.FC = () => {
  return (
    <div className="maintenance-container">
      {/* Split Layout */}
      <div className="maintenance-left">
        <h3 className="section-title">LOG SERVICE RECORD</h3>
        <form className="maintenance-form">
          <div className="form-group">
            <label>VEHICLE</label>
            <input type="text" className="form-input" defaultValue="VAN-05" />
          </div>
          <div className="form-group">
            <label>SERVICE TYPE</label>
            <input type="text" className="form-input" defaultValue="Oil Change" />
          </div>
          <div className="form-group">
            <label>COST</label>
            <input type="text" className="form-input" defaultValue="2500" />
          </div>
          <div className="form-group">
            <label>DATE</label>
            <input type="text" className="form-input" defaultValue="07/07/2026" />
          </div>
          <div className="form-group">
            <label>STATUS</label>
            <select className="form-input">
              <option>Active</option>
              <option>Completed</option>
            </select>
          </div>

          <button type="button" className="btn-primary w-full mt-4">Save</button>
        </form>

        <div className="maintenance-legend mt-6">
          <div className="legend-row">
            <span className="text-green">Available</span>
            <div className="legend-arrow-container">
              <div className="legend-arrow-text">creating active record</div>
              <div className="legend-arrow">⟶</div>
            </div>
            <span className="text-amber">In Shop</span>
          </div>
          <div className="legend-row">
            <span className="text-amber">In Shop</span>
            <div className="legend-arrow-container">
              <div className="legend-arrow-text">closing record (or retired)</div>
              <div className="legend-arrow">⟶</div>
            </div>
            <span className="text-green">Available</span>
          </div>
          <p className="legend-note mt-4">Note: In Shop vehicles are removed from the dispatch pool.</p>
        </div>
      </div>

      <div className="maintenance-right">
        <h3 className="section-title">SERVICE LOG</h3>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>VEHICLE</th>
              <th>SERVICE</th>
              <th>COST</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {serviceLogs.map(log => (
              <tr key={log.id}>
                <td>{log.vehicle}</td>
                <td>{log.service}</td>
                <td>{log.cost}</td>
                <td>
                  <span className={`status-badge bg-${log.statusColor}`}>{log.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Maintenance;
