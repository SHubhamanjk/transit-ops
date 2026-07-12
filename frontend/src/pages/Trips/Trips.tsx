import React, { useState } from 'react';
import { X } from 'lucide-react';
import './Trips.css';

const liveTrips = [
  { id: 'TR001', vehicle: 'VAN-05', driver: 'ALEX', source: 'Gandhinagar Depot', dest: 'Ahmedabad Hub', status: 'Dispatched', statusColor: 'blue', time: '45 min' },
  { id: 'TR004', vehicle: 'TRUCK-04', driver: 'SURESH', source: 'Vatva Industrial Area', dest: 'Sanand Warehouse', status: 'Draft', statusColor: 'neutral', time: 'Awaiting driver' },
  { id: 'TR006', vehicle: 'Unassigned', driver: '', source: 'Mansa', dest: 'Kalol Depot', status: 'Cancelled', statusColor: 'red', time: 'Vehicle went to shop' },
];

const Trips: React.FC = () => {
  const [cargoWeight, setCargoWeight] = useState('700');
  const vehicleCapacity = 500;
  
  const exceededBy = parseInt(cargoWeight) - vehicleCapacity;
  const isError = exceededBy > 0;

  return (
    <div className="trips-container">
      {/* Split Layout */}
      <div className="trips-left">
        <h3 className="section-title">TRIP LIFECYCLE</h3>
        <div className="lifecycle-stepper">
          <div className="step active">
            <div className="step-dot bg-green"></div>
            <span>Draft</span>
          </div>
          <div className="step-line active"></div>
          <div className="step active">
            <div className="step-dot bg-blue"></div>
            <span>Dispatched</span>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-dot bg-neutral"></div>
            <span>Completed</span>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-dot bg-neutral"></div>
            <span>Cancelled</span>
          </div>
        </div>

        <h3 className="section-title" style={{ marginTop: '2rem' }}>CREATE TRIP</h3>
        <form className="create-trip-form">
          <div className="form-group">
            <label>SOURCE</label>
            <input type="text" className="form-input" defaultValue="Gandhinagar Depot" />
          </div>
          <div className="form-group">
            <label>DESTINATION</label>
            <input type="text" className="form-input" defaultValue="Ahmedabad Hub" />
          </div>
          <div className="form-group">
            <label>VEHICLE (AVAILABLE ONLY)</label>
            <select className="form-input">
              <option>VAN-05 - 500 kg capacity</option>
            </select>
          </div>
          <div className="form-group">
            <label>DRIVER (AVAILABLE ONLY)</label>
            <select className="form-input">
              <option>Alex</option>
            </select>
          </div>
          <div className="form-group">
            <label>CARGO WEIGHT (KG)</label>
            <input 
              type="number" 
              className={`form-input ${isError ? 'input-error' : ''}`} 
              value={cargoWeight} 
              onChange={(e) => setCargoWeight(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>PLANNED DISTANCE (KM)</label>
            <input type="number" className="form-input" defaultValue="38" />
          </div>

          {isError && (
            <div className="capacity-error">
              <p>Vehicle Capacity: {vehicleCapacity} kg</p>
              <p>Cargo Weight: {cargoWeight} kg</p>
              <p className="error-text">
                <X size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                Capacity exceeded by {exceededBy} kg — dispatch blocked
              </p>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-primary" disabled={isError}>Dispatch {isError && '(disabled)'}</button>
            <button type="button" className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>

      <div className="trips-right">
        <h3 className="section-title">LIVE BOARD</h3>
        
        <div className="live-board-list">
          {liveTrips.map(trip => (
            <div className="trip-card" key={trip.id}>
              <div className="trip-card-header">
                <span className="trip-id">{trip.id}</span>
                <span className="trip-assignment">
                  {trip.vehicle} {trip.driver ? `/ ${trip.driver}` : ''}
                </span>
              </div>
              <div className="trip-route">
                {trip.source} → {trip.dest}
              </div>
              <div className="trip-card-footer">
                <span className={`status-badge bg-${trip.statusColor}`}>{trip.status}</span>
                <span className="trip-time">{trip.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="trips-rules">
          On Complete: odometer → fuel log → expenses → Vehicle & Driver Available
        </div>
      </div>
    </div>
  );
};

export default Trips;
