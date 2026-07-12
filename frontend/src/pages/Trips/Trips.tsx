import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getTrips, createTrip, getTripById } from '../../api/trips';
import { getAvailableDrivers, getDriverById } from '../../api/drivers';
import { getAvailableVehicles, getVehicleById } from '../../api/vehicles';
import SearchableSelect from '../../components/SearchableSelect/SearchableSelect';
import ExpandableSearch from '../../components/ExpandableSearch/ExpandableSearch';
import './Trips.css';

const Trips = () => {
  const [activeTab, setActiveTab] = useState<'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED' | 'ALL'>('ALL');
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Details Modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTripDetails, setSelectedTripDetails] = useState<any>(null);
  const [selectedDriverDetails, setSelectedDriverDetails] = useState<any>(null);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    source: '',
    destination: '',
    planned_distance: 0,
    cargo_weight: 0,
    estimated_duration_hours: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const statusFilter = activeTab === 'ALL' ? undefined : activeTab;
      const data = await getTrips(0, 50, statusFilter);
      setTrips(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [activeTab]);

  const openCreateModal = async () => {
    setShowModal(true);
    setFormError('');
    try {
      const [drivers, vehicles] = await Promise.all([
        getAvailableDrivers(),
        getAvailableVehicles()
      ]);
      setAvailableDrivers(drivers);
      setAvailableVehicles(vehicles);
      
      // Auto-select first options if available
      setFormData(prev => ({
        ...prev,
        driver_id: drivers.length > 0 ? drivers[0].id : '',
        vehicle_id: vehicles.length > 0 ? vehicles[0].id : ''
      }));
    } catch (err: any) {
      setFormError('Failed to load available drivers or vehicles');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await createTrip(formData);
      setShowModal(false);
      setFormData({
        vehicle_id: '', driver_id: '', source: '', destination: '', 
        planned_distance: 0, cargo_weight: 0, estimated_duration_hours: 0
      });
      fetchTrips();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create trip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRowClick = async (trip: any) => {
    setDetailsModalOpen(true);
    setDetailsLoading(true);
    setSelectedTripDetails(null);
    setSelectedDriverDetails(null);
    setSelectedVehicleDetails(null);
    
    try {
      const tripDetails = await getTripById(trip.id);
      setSelectedTripDetails(tripDetails);
      
      const [driverDetails, vehicleDetails] = await Promise.all([
        getDriverById(tripDetails.driver_id),
        getVehicleById(tripDetails.vehicle_id)
      ]);
      
      setSelectedDriverDetails(driverDetails);
      setSelectedVehicleDetails(vehicleDetails);
    } catch (err) {
      console.error("Failed to load details", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="trips-page">
      <div className="page-header">
        <h1>Trip Management</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <ExpandableSearch 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search routes..."
          />
          <button className="btn-primary" style={{ height: '36px' }} onClick={openCreateModal}>+ Create Trip</button>
        </div>
      </div>

      <div className="tabs">
        {['ALL', 'DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading trips...</div>
        ) : (
          (() => {
            const filteredTrips = trips.filter(t => 
              t.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.destination?.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredTrips.length === 0) {
              return <div className="empty-state">No trips found.</div>;
            }

            return (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Cargo (kg)</th>
                  <th>Status</th>
                  <th>Distance (Est.)</th>
                  <th>Duration (Est.)</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((t) => (
                  <tr key={t.id} onClick={() => handleRowClick(t)} style={{ cursor: 'pointer' }}>
                    <td>
                      <strong>{t.source}</strong> &rarr; <strong>{t.destination}</strong>
                    </td>
                    <td>{t.cargo_weight}kg</td>
                    <td>
                      <span className={`status-badge status-${t.status.toLowerCase().replace('_', '-')}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{t.planned_distance} km</td>
                    <td>{t.estimated_duration_hours} hrs</td>
                    <td>{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            );
          })()
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Trip (Draft)</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateTrip} className="trip-form">
              {formError && <div className="error-banner">{formError}</div>}
              
              <div className="form-row">
                <div className="form-group">
                  <label>Assign Driver</label>
                  <SearchableSelect 
                    name="driver_id"
                    value={formData.driver_id} 
                    onChange={(val) => setFormData({...formData, driver_id: val})}
                    options={availableDrivers.map(d => ({
                      value: d.id,
                      label: d.name,
                      sublabel: `License: ${d.license_number} | Run Time: ${d.total_run_time_kms} km`
                    }))}
                    placeholder="Search for a driver..."
                  />
                </div>
                <div className="form-group">
                  <label>Assign Vehicle</label>
                  <SearchableSelect 
                    name="vehicle_id"
                    value={formData.vehicle_id} 
                    onChange={(val) => setFormData({...formData, vehicle_id: val})}
                    options={availableVehicles.map(v => ({
                      value: v.id,
                      label: `${v.model} (${v.registration_number})`,
                      sublabel: `Type: ${v.type}`
                    }))}
                    placeholder="Search for a vehicle..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Source Location</label>
                  <input required type="text" name="source" value={formData.source} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Destination Location</label>
                  <input required type="text" name="destination" value={formData.destination} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cargo Weight (kg)</label>
                  <input required type="number" name="cargo_weight" value={formData.cargo_weight} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Estimated Distance (km)</label>
                  <input required type="number" name="planned_distance" value={formData.planned_distance} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Estimated Duration (hours)</label>
                <input required type="number" name="estimated_duration_hours" value={formData.estimated_duration_hours} onChange={handleInputChange} step="0.5" />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailsModalOpen && (
        <div className="modal-overlay" onClick={() => setDetailsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Trip Details</h2>
              <button className="close-btn" onClick={() => setDetailsModalOpen(false)}><X size={20} /></button>
            </div>
            {detailsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading details...</div>
            ) : selectedTripDetails && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                <div className="details-card" style={{ padding: '1rem', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Trip Info</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <p style={{ margin: 0 }}><strong>Route:</strong> {selectedTripDetails.source} &rarr; {selectedTripDetails.destination}</p>
                    <p style={{ margin: 0 }}><strong>Status:</strong> {selectedTripDetails.status}</p>
                    <p style={{ margin: 0 }}><strong>Cargo:</strong> {selectedTripDetails.cargo_weight} kg</p>
                    <p style={{ margin: 0 }}><strong>Distance:</strong> {selectedTripDetails.planned_distance} km</p>
                    <p style={{ margin: 0 }}><strong>Duration:</strong> {selectedTripDetails.estimated_duration_hours} hrs</p>
                    {selectedTripDetails.actual_distance && <p style={{ margin: 0 }}><strong>Actual Distance:</strong> {selectedTripDetails.actual_distance} km</p>}
                    {selectedTripDetails.total_cost && <p style={{ margin: 0 }}><strong>Total Cost:</strong> ${selectedTripDetails.total_cost}</p>}
                  </div>
                  {selectedTripDetails.completion_notes && <p style={{ marginTop: '0.5rem', marginBottom: 0 }}><strong>Notes:</strong> {selectedTripDetails.completion_notes}</p>}
                </div>
                
                {selectedDriverDetails && (
                  <div className="details-card" style={{ padding: '1rem', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Driver Info</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <p style={{ margin: 0 }}><strong>Name:</strong> {selectedDriverDetails.name}</p>
                      <p style={{ margin: 0 }}><strong>License:</strong> {selectedDriverDetails.license_number}</p>
                      <p style={{ margin: 0 }}><strong>Phone:</strong> {selectedDriverDetails.contact_number}</p>
                    </div>
                  </div>
                )}
                
                {selectedVehicleDetails && (
                  <div className="details-card" style={{ padding: '1rem', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Vehicle Info</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <p style={{ margin: 0 }}><strong>Model:</strong> {selectedVehicleDetails.model}</p>
                      <p style={{ margin: 0 }}><strong>Registration:</strong> {selectedVehicleDetails.registration_number}</p>
                      <p style={{ margin: 0 }}><strong>Type:</strong> {selectedVehicleDetails.type}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: '2rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setDetailsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
