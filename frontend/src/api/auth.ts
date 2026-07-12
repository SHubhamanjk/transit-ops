import { API_URL, fetchWithAuth } from './client';

export const initiateLogin = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login/initiate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420'
    },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid credentials");
  }
  return response.json();
};

export const confirmLogin = async (email: string, otp_code: string) => {
  const response = await fetch(`${API_URL}/auth/login/confirm`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420'
    },
    body: JSON.stringify({ email, otp_code })
  });
  if (!response.ok) throw new Error("Invalid OTP");
  return response.json();
};

export const forgotPassword = async (email: string) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420'
    },
    body: JSON.stringify({ email })
  });
  return response.json();
};

export const resetPassword = async (email: string, otp_code: string, new_password: string) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420'
    },
    body: JSON.stringify({ email, otp_code, new_password })
  });
  if (!response.ok) throw new Error("Invalid OTP or error resetting password");
  return response.json();
};

export const getMe = async () => {
  const response = await fetchWithAuth('/auth/me');
  if (!response.ok) throw new Error("Could not fetch user");
  return response.json();
};
