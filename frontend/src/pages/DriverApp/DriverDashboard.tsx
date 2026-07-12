import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navigation, MapPin, Package, CheckCircle2, X, Play, Clock } from 'lucide-react';
import { getTrips, completeTrip, dispatchTrip } from '../../api/trips';

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'DISPATCHED';

  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [actualDistance, setActualDistance] = useState('');
  const [actualDuration, setActualDuration] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const data = await getTrips(0, 50, filter);
      setTrips(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [filter]);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId) return;
    
    setIsSubmitting(true);
    try {
      await completeTrip(selectedTripId, {
        actual_distance: parseFloat(actualDistance),
        actual_duration_hours: parseFloat(actualDuration),
        fuel_consumed: parseFloat(fuelConsumed),
        total_cost: parseFloat(totalCost),
        completion_notes: notes
      });
      setSelectedTripId(null);
      fetchTrips(); // refresh list
    } catch (err) {
      alert("Error completing trip.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilterTitle = () => {
    if (filter === 'DRAFT') return 'Assigned Trips';
    if (filter === 'DISPATCHED') return 'Active Trips';
    if (filter === 'COMPLETED') return 'Past Trips';
    if (filter === 'CANCELLED') return 'Cancelled Trips';
    return 'Trips';
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#0f172a' }}>Hello, {user?.name}</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Here are your {getFilterTitle().toLowerCase()}</p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading trips...</div>
      ) : trips.length === 0 ? (
        <div style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
          <Navigation size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto', display: 'block' }} />
          No {getFilterTitle().toLowerCase()} found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {trips.map(trip => (
            <div key={trip.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: filter === 'DISPATCHED' ? '#3b82f6' : '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                    {trip.status}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '600' }}>
                    <MapPin size={16} color="#ef4444" />
                    {trip.source} &rarr; {trip.destination}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Est. Distance</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{trip.planned_distance} km</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Est. Time</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}><Clock size={14} style={{display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px'}}/>{trip.estimated_duration_hours} hrs</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Cargo Weight</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}><Package size={14} style={{display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px'}}/>{trip.cargo_weight} kg</div>
                </div>
              </div>

              {filter === 'DRAFT' && (
                <button 
                  onClick={async () => {
                    try {
                      await dispatchTrip(trip.id);
                      window.location.search = '?filter=DISPATCHED';
                    } catch (err) {
                      alert('Failed to dispatch trip');
                    }
                  }}
                  style={{ width: '100%', padding: '12px', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}
                >
                  <Play size={18} />
                  Start Trip (Dispatch)
                </button>
              )}

              {filter === 'DISPATCHED' && (
                <button 
                  onClick={() => setSelectedTripId(trip.id)}
                  style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <CheckCircle2 size={18} />
                  Complete Trip
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Complete Trip Modal Overlay */}
      {selectedTripId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', width: '100%', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', maxHeight: '90vh', overflowY: 'auto', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Complete Trip</h2>
              <button onClick={() => setSelectedTripId(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleComplete} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Actual Distance (km)</label>
                <input type="number" step="0.01" required value={actualDistance} onChange={e => setActualDistance(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} placeholder="e.g. 150.5" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Actual Duration (Hours)</label>
                <input type="number" step="0.01" required value={actualDuration} onChange={e => setActualDuration(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} placeholder="e.g. 4.5" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Fuel Consumed (Liters)</label>
                <input type="number" step="0.01" required value={fuelConsumed} onChange={e => setFuelConsumed(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} placeholder="e.g. 40" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Total Cost (Fuel + Tolls + Other)</label>
                <input type="number" step="0.01" required value={totalCost} onChange={e => setTotalCost(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} placeholder="e.g. 450.00" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Notes (Optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', minHeight: '80px' }} placeholder="Any issues during the trip?"></textarea>
              </div>
              
              <button type="submit" disabled={isSubmitting} style={{ marginTop: '8px', width: '100%', padding: '16px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                {isSubmitting ? 'Submitting...' : 'Submit & Complete'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default DriverDashboard;
