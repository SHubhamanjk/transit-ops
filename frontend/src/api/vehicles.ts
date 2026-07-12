import { API_URL, fetchWithAuth } from './client';

export const getVehicles = async (skip: number = 0, limit: number = 10, status?: string) => {
  const url = new URL(`${API_URL}/vehicles/`);
  url.searchParams.append('skip', skip.toString());
  url.searchParams.append('limit', limit.toString());
  if (status) {
    url.searchParams.append('status', status);
  }
  
  const response = await fetchWithAuth(`/vehicles/${url.search}`);
  if (!response.ok) throw new Error("Failed to fetch vehicles");
  return response.json();
};

export const getAvailableVehicles = async () => {
  const response = await fetchWithAuth(`/vehicles/dropdown`);
  if (!response.ok) throw new Error("Failed to fetch available vehicles");
  return response.json();
};

export const addVehicle = async (payload: any) => {
  const response = await fetchWithAuth(`/vehicles/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to add vehicle");
  }
  return response.json();
};
