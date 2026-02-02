import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3000';

export function useApi() {
    const { token, refreshAccessToken, logout } = useAuth();

    const fetchWithAuth = async (endpoint: string, options: RequestInit = {}, isRetry = false): Promise<any> => {
        // Get current token from localStorage in case it was refreshed
        const currentToken = localStorage.getItem('token') || token;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (currentToken) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${currentToken}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Handle 401 - try to refresh token once
        if (response.status === 401 && !isRetry) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Retry the request with new token
                return fetchWithAuth(endpoint, options, true);
            } else {
                // Refresh failed, logout user
                logout();
                return { success: false, error: { code: 'SESSION_EXPIRED', message: 'Session expirée' } };
            }
        }

        // Handle empty responses (e.g., 204 No Content)
        const text = await response.text();
        if (!text) {
            return { success: response.ok };
        }

        try {
            return JSON.parse(text);
        } catch {
            // If JSON parsing fails, return basic response info
            return { success: response.ok, error: { message: text } };
        }
    };

    return {
        // ============ REGULATIONS ============
        getRegulations: () => fetchWithAuth('/regulations'),
        createRegulation: (data: Record<string, unknown>) =>
            fetchWithAuth('/regulations', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        updateRegulation: (id: string, data: Record<string, unknown>) =>
            fetchWithAuth(`/regulations/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        deleteRegulation: (id: string) =>
            fetchWithAuth(`/regulations/${id}`, { method: 'DELETE' }),

        // ============ OBLIGATIONS ============
        getObligations: (params?: Record<string, string>) => {
            const query = params ? `?${new URLSearchParams(params)}` : '';
            return fetchWithAuth(`/obligations${query}`);
        },
        getObligationSummary: () => fetchWithAuth('/obligations/summary'),
        createObligation: (data: Record<string, unknown>) =>
            fetchWithAuth('/obligations', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        updateObligation: (id: string, data: Record<string, unknown>) =>
            fetchWithAuth(`/obligations/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        deleteObligation: (id: string) =>
            fetchWithAuth(`/obligations/${id}`, { method: 'DELETE' }),
        subscribeToTier1: () =>
            fetchWithAuth('/obligations/subscribe-tier1', { method: 'POST' }),

        // ============ CONTROLS ============
        getControls: (params?: Record<string, string>) => {
            const query = params ? `?${new URLSearchParams(params)}` : '';
            return fetchWithAuth(`/controls${query}`);
        },
        createControl: (data: Record<string, unknown>) =>
            fetchWithAuth('/controls', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        updateControl: (id: string, data: Record<string, unknown>) =>
            fetchWithAuth(`/controls/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        deleteControl: (id: string) =>
            fetchWithAuth(`/controls/${id}`, { method: 'DELETE' }),

        // ============ CHECKS ============
        getChecks: (params?: Record<string, string>) => {
            const query = params ? `?${new URLSearchParams(params)}` : '';
            return fetchWithAuth(`/checks${query}`);
        },

        // ============ DEADLINES ============
        getDeadlines: (params?: Record<string, string>) => {
            const query = params ? `?${new URLSearchParams(params)}` : '';
            return fetchWithAuth(`/deadlines${query}`);
        },
        getDeadlineSummary: () => fetchWithAuth('/deadlines/summary'),
        createDeadline: (data: Record<string, unknown>) =>
            fetchWithAuth('/deadlines', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        updateDeadline: (id: string, data: Record<string, unknown>) =>
            fetchWithAuth(`/deadlines/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        deleteDeadline: (id: string) =>
            fetchWithAuth(`/deadlines/${id}`, { method: 'DELETE' }),
        completeDeadline: (id: string) =>
            fetchWithAuth(`/deadlines/${id}/complete`, { method: 'POST' }),
    };
}
