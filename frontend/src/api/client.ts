export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const getTokens = () => {
  const access = localStorage.getItem('access_token');
  const refresh = localStorage.getItem('refresh_token');
  return { access, refresh };
};

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRerefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
};

const addRefreshSubscriber = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  let { access } = getTokens();
  
  const headers = new Headers(options.headers);
  if (access) {
    headers.set('Authorization', `Bearer ${access}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Bypass ngrok browser warning
  headers.set('ngrok-skip-browser-warning', '69420');

  const config: RequestInit = {
    ...options,
    headers
  };

  let response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.status === 401) {
    const { refresh } = getTokens();
    if (!refresh) {
      clearTokens();
      throw new Error("Unauthorized");
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420'
          },
          body: JSON.stringify({ refresh_token: refresh })
        });
        
        if (!refreshResponse.ok) {
          throw new Error("Refresh failed");
        }
        
        const data = await refreshResponse.json();
        setTokens(data.access_token, data.refresh_token);
        access = data.access_token;
        onRerefreshed(access);
      } catch (err) {
        clearTokens();
        refreshSubscribers = [];
        throw err;
      } finally {
        isRefreshing = false;
        refreshSubscribers = [];
      }
    } else {
      // Wait for refresh to complete
      access = await new Promise((resolve) => {
        addRefreshSubscriber((token) => resolve(token));
      });
    }

    // Retry original request
    headers.set('Authorization', `Bearer ${access}`);
    return fetch(`${API_URL}${endpoint}`, { ...options, headers });
  }

  return response;
};
