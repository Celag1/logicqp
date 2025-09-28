// Cliente personalizado para PostgREST
const POSTGREST_URL = 'http://127.0.0.1:54321';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export class PostgRESTClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string = POSTGREST_URL, apiKey: string = API_KEY) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  async get(endpoint: string, params: Record<string, string> = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Prefer': 'return=minimal'
      }
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Métodos específicos para profiles
  async getProfile(id: string) {
    return this.get(`/profiles?id=eq.${id}&limit=1`);
  }

  async updateProfile(id: string, data: any) {
    return this.patch(`/profiles?id=eq.${id}`, data);
  }

  async getProfileField(id: string, field: string) {
    return this.get(`/profiles?select=${field}&id=eq.${id}&limit=1`);
  }
}

export const postgrestClient = new PostgRESTClient();
