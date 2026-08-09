/**
 * Unified API Client Architecture for CivTax AI
 * 
 * Supports two interchangeable runtime modes:
 * 1. CSV Data Layer (Current temporary data source via csvDataLoader)
 * 2. FastAPI + PostgreSQL Backend (Set VITE_USE_BACKEND=true & VITE_API_URL)
 * 
 * UI components interact exclusively with this service layer, meaning
 * switching from CSV to FastAPI/PostgreSQL requires ZERO changes to UI code.
 */

import { csvDataLoader } from './csvDataLoader';

// Defaults to live FastAPI backend at http://localhost:8000/api/v1
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
      const url = new URL(`${this.baseUrl}${endpoint}`);
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
      return await res.json();
    }
    // Handled by service layer in CSV mode
    return null;
  }

  async post(endpoint, body = {}) {
    if (this.useBackend) {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
      return await res.json();
    }
    return null;
  }

  async put(endpoint, body = {}) {
    if (this.useBackend) {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
      return await res.json();
    }
    return null;
  }

  async delete(endpoint) {
    if (this.useBackend) {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
      return await res.json();
    }
    return null;
  }
}

export const apiClient = new ApiClient();
