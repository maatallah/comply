import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3000';

export function useApi() {
    const { token } = useAuth();

    const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        return response.json();
    };

    return {
        // Obligations
        getObligations: (params?: Record<string, string>) => {
            const query = params ? `?${new URLSearchParams(params)}` : '';
            return fetchWithAuth(`/obligations${query}`);
        },
        getObligationSummary: () => fetchWithAuth('/obligations/summary'),

        // Controls
        getControls: (params?: Record<string, string>) => {
            const query = params ? `?${new URLSearchParams(params)}` : '';
            return fetchWithAuth(`/controls${query}`);
        },

        // Checks
        getChecks: (params?: Record<string, string>) => {
            const query = params ? `?${new URLSearchParams(params)}` : '';
            return fetchWithAuth(`/checks${query}`);
        },

        // Deadlines
        getDeadlines: (params?: Record<string, string>) => {
            const query = params ? `?${new URLSearchParams(params)}` : '';
            return fetchWithAuth(`/deadlines${query}`);
        },
        getDeadlineSummary: () => fetchWithAuth('/deadlines/summary'),
        completeDeadline: (id: string) =>
            fetchWithAuth(`/deadlines/${id}/complete`, { method: 'POST' }),

        // Regulations
        getRegulations: () => fetchWithAuth('/regulations'),
    };
}
