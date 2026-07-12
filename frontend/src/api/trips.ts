import { API_URL, fetchWithAuth } from './client';

export const getTrips = async (skip: number = 0, limit: number = 10, status_filter?: string) => {
  const url = new URL(`${API_URL}/trips/`);
  url.searchParams.append('skip', skip.toString());
  url.searchParams.append('limit', limit.toString());
  if (status_filter) {
    url.searchParams.append('status_filter', status_filter);
  }
  
  const response = await fetchWithAuth(`/trips/${url.search}`);
  if (!response.ok) throw new Error("Failed to fetch trips");
  return response.json();
};

export const createTrip = async (payload: any) => {
  const response = await fetchWithAuth(`/trips/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create trip");
  }
  return response.json();
};

export const completeTrip = async (trip_id: string, payload: {
  actual_distance: number;
  actual_duration_hours: number;
  fuel_consumed: number;
  total_cost: number;
  completion_notes?: string;
}) => {
  const response = await fetchWithAuth(`/trips/${trip_id}/complete`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Failed to complete trip");
  return response.json();
};

export const dispatchTrip = async (trip_id: string) => {
  const response = await fetchWithAuth(`/trips/${trip_id}/dispatch`, {
    method: 'PUT'
  });
  if (!response.ok) throw new Error("Failed to dispatch trip");
  return response.json();
};
