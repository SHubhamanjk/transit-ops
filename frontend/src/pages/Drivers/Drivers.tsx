import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getDrivers, addDriver } from '../../api/drivers';
import ExpandableSearch from '../../components/ExpandableSearch/ExpandableSearch';
import './Drivers.css';

const Drivers = () => {
  const [activeTab, setActiveTab] = useState<'ON_TRIP' | 'AVAILABLE' | 'OFF_DUTY' | 'ALL'>('ALL');
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    license_number: '',
    license_category: 'Class A',
    license_expiry_date: '',
    contact_number: '',
    create_user_login: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchDrivers = async () => {
    setLoading(true);
    setError('');
    try {
      const statusFilter = activeTab === 'ALL' ? undefined : activeTab;
      const data = await getDrivers(0, 50, statusFilter);
      setDrivers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const payload: any = { ...formData, user_id: null };
      if (!payload.create_user_login) {
        payload.email = null;
        payload.password = null;
      }
      
      await addDriver(payload);
      setShowModal(false);
      setFormData({
        name: '', email: '', password: '', license_number: '', 
        license_category: 'Class A', license_expiry_date: '', 
        contact_number: '', create_user_login: true
      });
      fetchDrivers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to add driver');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="drivers-page">
      <div className="page-header">
        <h1>Driver Management</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <ExpandableSearch 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search drivers..."
          />
          <button className="btn-primary" style={{ height: '36px' }} onClick={() => setShowModal(true)}>+ Add Driver</button>
        </div>
      </div>

      <div className="tabs">
        {['ALL', 'AVAILABLE', 'ON_TRIP', 'OFF_DUTY'].map((tab) => (
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
          <div className="loading-state">Loading drivers...</div>
        ) : (
          (() => {
            const filteredDrivers = drivers.filter(d => 
              d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              d.license_number?.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredDrivers.length === 0) {
              return <div className="empty-state">No drivers found.</div>;
            }

            return (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>License</th>
                  <th>Status</th>
                  <th>Total Run Time (km)</th>
                  <th>Safety Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.license_number} ({d.license_category})</td>
                    <td>
                      <span className={`status-badge status-${d.status.toLowerCase()}`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{d.total_run_time_kms} km</td>
                    <td>{d.safety_score}%</td>
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
              <h2>Add New Driver</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddDriver} className="driver-form">
              {formError && <div className="error-banner">{formError}</div>}
              
              <div className="form-group">
                <label>Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>License Number</label>
                  <input required type="text" name="license_number" value={formData.license_number} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="license_category" value={formData.license_category} onChange={handleInputChange}>
                    <option value="Class A">Class A</option>
                    <option value="Class B">Class B</option>
                    <option value="Class C">Class C</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input required type="date" name="license_expiry_date" value={formData.license_expiry_date} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input required type="text" name="contact_number" value={formData.contact_number} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="create_user_login" checked={formData.create_user_login} onChange={handleInputChange} />
                  Create Web Portal / App Login Account
                </label>
              </div>

              {formData.create_user_login && (
                <div className="auth-fields">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Temporary Password</label>
                    <input required type="text" name="password" value={formData.password} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
