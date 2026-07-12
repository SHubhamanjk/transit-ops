import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { fetchWithAuth } from '../../api/client';
import { getAvailableVehicles } from '../../api/vehicles';
import SearchableSelect from '../../components/SearchableSelect/SearchableSelect';
import ExpandableSearch from '../../components/ExpandableSearch/ExpandableSearch';
import './Maintenance.css';

const Maintenance = () => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ALL');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    estimated_duration_hours: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/maintenance/?skip=0&limit=50';
      if (activeTab !== 'ALL') {
        url += `&status=${activeTab}`;
      }
      const response = await fetchWithAuth(url);
      if (!response.ok) throw new Error("Failed to load maintenance logs");
      setLogs(await response.json());
    } catch (err: any) {
      setError(err.message || 'Failed to load maintenance logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  const openCreateModal = async () => {
    setShowModal(true);
    setFormError('');
    try {
      const vehicles = await getAvailableVehicles();
      setAvailableVehicles(vehicles);
      
      if (vehicles.length > 0) {
        setFormData(prev => ({ ...prev, vehicle_id: vehicles[0].id }));
      }
    } catch (err: any) {
      setFormError('Failed to load available vehicles');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const response = await fetchWithAuth('/maintenance/', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to log maintenance");
      }
      
      setShowModal(false);
      setFormData({
        vehicle_id: '', description: '', 
        start_date: new Date().toISOString().split('T')[0], estimated_duration_hours: 0
      });
      fetchLogs();
    } catch (err: any) {
      setFormError(err.message || 'Failed to log maintenance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="maintenance-page">
      <div className="page-header">
        <h1>Maintenance Logs</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <ExpandableSearch 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search logs..."
          />
          <button className="btn-primary" style={{ height: '36px' }} onClick={openCreateModal}>+ Log Maintenance</button>
        </div>
      </div>

      <div className="tabs">
        {['ALL', 'ACTIVE', 'COMPLETED'].map((tab) => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab === 'ACTIVE' ? 'Pending' : tab === 'COMPLETED' ? 'History' : 'All'}
          </button>
        ))}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading logs...</div>
        ) : (
          (() => {
            const filteredLogs = logs.filter(log => 
              log.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredLogs.length === 0) {
              return <div className="empty-state">No maintenance records found.</div>;
            }

            return (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Cost (Est)</th>
                  <th>Final Cost</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.description}</td>
                    <td>
                      <span className={`status-badge status-${log.status.toLowerCase().replace('_', '-')}`}>
                        {log.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{new Date(log.start_date).toLocaleDateString()}</td>
                    <td>${log.estimated_cost.toLocaleString()}</td>
                    <td>{log.final_cost ? `$${log.final_cost.toLocaleString()}` : '-'}</td>
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
              <h2>Schedule Maintenance</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateMaintenance} className="maintenance-form">
              {formError && <div className="error-banner">{formError}</div>}
              
              <div className="form-group">
                <label>Select Vehicle</label>
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

              <div className="form-group">
                <label>Issue Description</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3}></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input required type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Estimated Duration (Hours)</label>
                  <input required type="number" name="estimated_duration_hours" value={formData.estimated_duration_hours} onChange={handleInputChange} step="0.5" />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Scheduling...' : 'Schedule Maintenance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
