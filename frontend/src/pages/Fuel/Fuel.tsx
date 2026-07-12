import React from 'react';
import './Fuel.css';

const fuelLogs = [
  { id: 1, vehicle: 'VAN-05', date: '05 Jul 2026', liters: '42 L', cost: '3,150' },
  { id: 2, vehicle: 'TRUCK-11', date: '06 Jul 2026', liters: '110 L', cost: '8,400' },
  { id: 3, vehicle: 'MINI-08', date: '06 Jul 2026', liters: '28 L', cost: '2,050' },
];

const otherExpenses = [
  { id: 1, trip: 'TR001', vehicle: 'VAN-05', toll: '120', other: '0', maint: '0', totalStatus: 'Available', statusColor: 'green' },
  { id: 2, trip: 'TR002', vehicle: 'TRK-12', toll: '340', other: '150', maint: '18,000', totalStatus: 'Completed', statusColor: 'green' },
];

const Fuel: React.FC = () => {
  return (
    <div className="fuel-container">
      <div className="fuel-header-row">
        <h3 className="section-title">FUEL LOGS</h3>
        <div className="fuel-actions">
          <button type="button" className="btn-primary">+ Log Fuel</button>
          <button type="button" className="btn-primary">+ Add Expense</button>
        </div>
      </div>
      
      <table className="data-table mb-8">
        <thead>
          <tr>
            <th>VEHICLE</th>
            <th>DATE</th>
            <th>LITERS</th>
            <th>FUEL COST</th>
          </tr>
        </thead>
        <tbody>
          {fuelLogs.map(log => (
            <tr key={log.id}>
              <td>{log.vehicle}</td>
              <td>{log.date}</td>
              <td>{log.liters}</td>
              <td>{log.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="section-title">OTHER EXPENSES (TOLL / MISC)</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>TRIP</th>
            <th>VEHICLE</th>
            <th>TOLL</th>
            <th>OTHER</th>
            <th>MAINT. (LINKED)</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {otherExpenses.map(exp => (
            <tr key={exp.id}>
              <td>{exp.trip}</td>
              <td>{exp.vehicle}</td>
              <td>{exp.toll}</td>
              <td>{exp.other}</td>
              <td>{exp.maint}</td>
              <td>
                <span className={`status-badge bg-${exp.statusColor}`}>{exp.totalStatus}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="fuel-total-row">
        <span>TOTAL OPERATIONAL COST (AUTO) = FUEL + MAINT</span>
        <span className="fuel-total-value">34,070</span>
      </div>
    </div>
  );
};

export default Fuel;
