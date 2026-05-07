import { AuthManager } from '../../auth.js';
import type { DashboardStats, Flight, Booking, Passenger } from '../types.js';

export class DashboardApiService {
  private auth: AuthManager;

  constructor() {
    this.auth = AuthManager.getInstance();
  }

  async fetchDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await this.auth.authenticatedFetch('/api/analytics.php?action=stats');
      const data = await response.json();
      return data.stats || {
        total_flights: 0,
        active_flights: 0,
        total_passengers: 0,
        checked_in_passengers: 0,
        total_bookings: 0,
        pending_maintenance: 0,
        security_alerts: 0,
        system_health: 'healthy'
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  }

async fetchFlights(): Promise<Flight[]> {
    try {
      const response = await this.auth.authenticatedFetch('/api/flights.php?action=list&page=1&limit=20');
      const data = await response.json();
      return data.flights || [];
    } catch (error) {
      console.error('Failed to fetch flights:', error);
      throw error;
    }
  }

  async fetchPassengers(page: number = 1, limit: number = 50, search?: string): Promise<Passenger[]> {
    try {
      let url = `/api/passengers.php?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const response = await this.auth.authenticatedFetch(url);
      const data = await response.json();
      return data.passengers || [];
    } catch (error) {
      console.error('Failed to fetch passengers:', error);
      throw error;
    }
  }

  async fetchUserBookings(userId: number): Promise<Booking[]> {
    try {
      const response = await this.auth.authenticatedFetch(`/api/bookings.php?passenger_id=${userId}`);
      const data = await response.json();
      return data.bookings || [];
    } catch (error) {
      console.error('Failed to fetch user bookings:', error);
      throw error;
    }
  }

  async searchFlights(searchTerm: string): Promise<Flight[]> {
    try {
      const response = await this.auth.authenticatedFetch(`/api/flights.php?action=search&search=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      return data.flights || [];
    } catch (error) {
      console.error('Failed to search flights:', error);
      throw error;
    }
  }

  async getActiveFlights(): Promise<Flight[]> {
    try {
      const response = await this.auth.authenticatedFetch('/api/flights.php?action=active');
      const data = await response.json();
      return data.flights || [];
    } catch (error) {
      console.error('Failed to fetch active flights:', error);
      throw error;
    }
  }

async callApi(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    try {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(body);
      }

      const response = await this.auth.authenticatedFetch(endpoint, config);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async createFlight(flightData: {
    flight_number: string;
    airline_id: number;
    origin: string;
    destination: string;
    scheduled_departure: string;
    scheduled_arrival: string;
    status?: string;
    gate?: string;
    terminal?: string;
  }): Promise<any> {
    try {
      const response = await this.auth.authenticatedFetch('/api/flights.php?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flightData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create flight:', error);
      throw error;
    }
  }

  async updateFlight(flightId: number, flightData: Partial<Flight>): Promise<any> {
    try {
      const response = await this.auth.authenticatedFetch('/api/flights.php?action=update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: flightId, ...flightData }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to update flight:', error);
      throw error;
    }
  }

  async deleteFlight(flightId: number): Promise<any> {
    try {
      const response = await this.auth.authenticatedFetch('/api/flights.php?action=delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: flightId }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to delete flight:', error);
      throw error;
    }
  }

  async assignGate(flightId: number, gate: string): Promise<any> {
    try {
      const response = await this.auth.authenticatedFetch('/api/flights.php?action=assign_gate', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flight_id: flightId, gate }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to assign gate:', error);
      throw error;
    }
  }

  async assignTerminal(flightId: number, terminal: string): Promise<any> {
    try {
      const response = await this.auth.authenticatedFetch('/api/flights.php?action=assign_terminal', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flight_id: flightId, terminal }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to assign terminal:', error);
      throw error;
    }
  }
}
