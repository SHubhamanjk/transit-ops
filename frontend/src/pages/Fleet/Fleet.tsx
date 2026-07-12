import React from 'react';
import './Fleet.css';

const vehicleData = [
  { regNo: 'GJ01AB4523', name: 'VAN-05', type: 'Van', capacity: '500 kg', odometer: '74,000', cost: '6,20,000', status: 'Available', statusColor: 'green' },
  { regNo: 'GJ01AB9987', name: 'TRUCK-11', type: 'Truck', capacity: '5 Ton', odometer: '182,000', cost: '24,50,000', status: 'On Trip', statusColor: 'blue' },
  { regNo: 'GJ01AB1120', name: 'MINI-03', type: 'Mini', capacity: '1 Ton', odometer: '66,000', cost: '4,10,000', status: 'In Shop', statusColor: 'orange' },
  { regNo: 'GJ01AB0089', name: 'VAN-09', type: 'Van', capacity: '750 kg', odometer: '241,900', cost: '5,90,000', status: 'Retired', statusColor: 'red' },
];

const Fleet: React.FC = () => {
  return (
    <div className="fleet-container">
      <div className="fleet-header-actions">
        <div className="fleet-filters">
          <select className="filter-select">
            <option>Type: All</option>
          </select>
          <select className="filter-select">
            <option>Status: All</option>
          </select>
          <input type="text" className="search-input" placeholder="Search reg. no..." />
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1.5rem' }}>
          + Add Vehicle
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>REG. NO. (UNIQUE)</th>
              <th>NAME/MODEL</th>
              <th>TYPE</th>
              <th>CAPACITY</th>
              <th>ODOMETER</th>
              <th>ACQ. COST</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {vehicleData.map((vehicle) => (
              <tr key={vehicle.regNo}>
                <td>{vehicle.regNo}</td>
                <td>{vehicle.name}</td>
                <td>{vehicle.type}</td>
                <td>{vehicle.capacity}</td>
                <td>{vehicle.odometer}</td>
                <td>{vehicle.cost}</td>
                <td>
                  <span className={`status-badge bg-${vehicle.statusColor}`}>
                    {vehicle.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="fleet-rules">
        Rule: Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatcher
      </div>
    </div>
  );
};

export default Fleet;
