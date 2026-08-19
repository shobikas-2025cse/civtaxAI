/**
 * Unified API Client Architecture for CivTax AI
 * 
 * Supports two interchangeable runtime modes:
 * 1. FastAPI + SQLite/PostgreSQL Backend (when running at http://localhost:8000/api/v1)
 * 2. Pre-bundled Municipal Dataset (Instant automatic fallback when backend is offline)
 * 
 * UI components interact seamlessly with this service layer without needing any changes.
 */

import { csvDataLoader } from './csvDataLoader';

// Defaults to live FastAPI backend at http://localhost:8000/api/v1 with auto-fallback
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND !== 'false';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  constructor() {
    this.useBackend = USE_BACKEND;
    this.baseUrl = API_BASE_URL;
  }

  getHeaders() {
    const token = localStorage.getItem('civtax_auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  async get(endpoint, params = {}) {
    if (this.useBackend) {
      try {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
          }
        });
        const res = await fetch(url.toString(), {
          method: 'GET',
          headers: this.getHeaders()
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        // Backend server is offline or unreachable - return null to trigger graceful fallback
        return null;
      }
    }
    return null;
  }

  async post(endpoint, body = {}) {
    if (this.useBackend) {
      try {
        const res = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(body)
        });
        if (res.ok) {
          return await res.json();
        } else {
          const errData = await res.json().catch(() => ({ detail: `HTTP ${res.status}: ${res.statusText}` }));
          const msg = errData.detail || `Payment request failed with status ${res.status}`;
          throw new Error(msg);
        }
      } catch (err) {
        if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
          throw err;
        }
        return null;
      }
    }
    return null;
  }

  async put(endpoint, body = {}) {
    if (this.useBackend) {
      try {
        const res = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(body)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  async delete(endpoint) {
    if (this.useBackend) {
      try {
        const res = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'DELETE',
          headers: this.getHeaders()
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        return null;
      }
    }
    return null;
  }
}

export const apiClient = new ApiClient();
