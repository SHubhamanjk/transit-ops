import React, { useState, useEffect } from 'react';
import { getVehicles, addVehicle } from '../../api/vehicles';
import './Fleet.css';

const Fleet = () => {
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED' | 'ALL'>('ALL');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    registration_number: '',
    model: '',
    type: 'TRUCK',
    max_load_capacity: 0,
    odometer: 0,
    acquisition_cost: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const statusFilter = activeTab === 'ALL' ? undefined : activeTab;
      const data = await getVehicles(0, 50, statusFilter);
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await addVehicle(formData);
      setShowModal(false);
      setFormData({
        registration_number: '', model: '', type: 'TRUCK', max_load_capacity: 0, odometer: 0, acquisition_cost: 0
      });
      fetchVehicles();
    } catch (err: any) {
      setFormError(err.message || 'Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fleet-page">
      <div className="page-header">
        <h1>Fleet Management</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Vehicle</button>
      </div>

      <div className="tabs">
        {['ALL', 'AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'].map((tab) => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">No vehicles found for this filter.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Model</th>
                <th>Type</th>
                <th>Status</th>
                <th>Odometer (km)</th>
                <th>Capacity (kg)</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td>{v.registration_number}</td>
                  <td>{v.model}</td>
                  <td>{v.type}</td>
                  <td>
                    <span className={`status-badge status-${v.status.toLowerCase().replace('_', '-')}`}>
                      {v.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{v.odometer.toLocaleString()}</td>
                  <td>{v.max_load_capacity.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Register New Vehicle</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddVehicle} className="vehicle-form">
              {formError && <div className="error-banner">{formError}</div>}
              
              <div className="form-row">
                <div className="form-group">
                  <label>Registration Number</label>
                  <input required type="text" name="registration_number" value={formData.registration_number} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Model</label>
                  <input required type="text" name="model" value={formData.model} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange}>
                    <option value="TRUCK">Truck</option>
                    <option value="VAN">Van</option>
                    <option value="BUS">Bus</option>
                    <option value="SEDAN">Sedan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Acquisition Cost ($)</label>
                  <input required type="number" name="acquisition_cost" value={formData.acquisition_cost} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Load Capacity (kg)</label>
                  <input required type="number" name="max_load_capacity" value={formData.max_load_capacity} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Initial Odometer (km)</label>
                  <input required type="number" name="odometer" value={formData.odometer} onChange={handleInputChange} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fleet;
