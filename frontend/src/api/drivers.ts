import { API_URL, fetchWithAuth } from './client';

export const getDrivers = async (skip: number = 0, limit: number = 10, status?: string) => {
  const url = new URL(`${API_URL}/drivers/`);
  url.searchParams.append('skip', skip.toString());
  url.searchParams.append('limit', limit.toString());
  if (status) {
    url.searchParams.append('status', status);
  }
  
  const response = await fetchWithAuth(`/drivers/${url.search}`);
  if (!response.ok) throw new Error("Failed to fetch drivers");
  return response.json();
};

export const getDriverById = async (driver_id: string) => {
  const response = await fetchWithAuth(`/drivers/${driver_id}`);
  if (!response.ok) throw new Error("Failed to fetch driver details");
  return response.json();
};

export const getAvailableDrivers = async () => {
  const response = await fetchWithAuth(`/drivers/dropdown`);
  if (!response.ok) throw new Error("Failed to fetch available drivers");
  return response.json();
};

export const addDriver = async (payload: any) => {
  const response = await fetchWithAuth(`/drivers/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to add driver");
  }
  return response.json();
};
