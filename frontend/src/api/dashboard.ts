import { API_URL, fetchWithAuth } from './client';

export const getKPIs = async () => {
  const response = await fetchWithAuth(`/dashboard/kpis`);
  if (!response.ok) throw new Error("Failed to fetch KPIs");
  return response.json();
};

export const getReports = async () => {
  const response = await fetchWithAuth(`/dashboard/reports`);
  if (!response.ok) throw new Error("Failed to fetch reports");
  return response.json();
};
