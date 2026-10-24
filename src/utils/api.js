/**
 * HerHealth AI — Centralized API Client
 *
 * Handles all backend communication with consistent error handling,
 * loading states, and configurable base URL.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      throw new ApiError(
        errorData.detail || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      'Unable to connect to the server. Please check your connection.',
      0,
      null
    );
  }
}

// ─── Symptom Endpoints ────────────────────────────────

export async function createSymptom(data) {
  return request('/api/symptoms', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getSymptoms(limit = 500) {
  return request(`/api/symptoms?limit=${limit}`);
}

export async function deleteSymptom(id) {
  return request(`/api/symptoms/${id}`, { method: 'DELETE' });
}

// ─── Insights ─────────────────────────────────────────

export async function getInsights() {
  return request('/api/insights');
}

// ─── Report ───────────────────────────────────────────

export async function getReportSummary() {
  return request('/api/reports/summary');
}

// ─── Health Check ─────────────────────────────────────

export async function healthCheck() {
  return request('/api/health');
}

// ─── AI Chat ──────────────────────────────────────────

export async function sendChatMessage(message, history = []) {
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}

export { ApiError, API_BASE };
