import { DashboardApiService } from '../services/DashboardApiService.js';
import { FlightMapView } from './FlightMapView.js';
import type { Flight, User } from '../types.js';

type ViewMode = 'list' | 'map';

export class FlightsManagementView {
  private apiService: DashboardApiService;
  private currentViewMode: ViewMode = 'list';
  private mapView: FlightMapView | null = null;
  private cachedFlights: Flight[] = [];
  private cachedUser: User | null = null;

  constructor(_container: HTMLElement) {
    this.apiService = new DashboardApiService();
  }

  async render(user: User): Promise<string> {
    try {
      this.cachedUser = user;
      const flights = await this.apiService.fetchFlights();
      this.cachedFlights = flights;

      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Flight Management</h2>
            <div class="flex items-center space-x-2">
              <input type="text" id="flight-search" placeholder="Search flights..."
                     class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <button id="toggle-view-btn" class="px-4 py-2 rounded-md font-medium transition-colors ${
                this.currentViewMode === 'list'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }">
                ${this.currentViewMode === 'list' ? '🗺 Map View' : '📋 List View'}
              </button>
              <button id="add-flight-btn" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Add Flight
              </button>
            </div>
          </div>

          ${this.currentViewMode === 'list' ? this.renderListView(flights) : this.renderMapView()}
        </div>
      `;
    } catch (error) {
      console.error('Failed to load flights:', error);
      return '<div class="text-center text-red-500">Failed to load flight data</div>';
    }
  }

  private renderListView(flights: Flight[]): string {
    return `
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table id="flights-table" class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flight</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gate</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${flights.map(flight => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">${flight.flight_number}</div>
                  <div class="text-sm text-gray-500">${flight.airline_name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${flight.origin} → ${flight.destination}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${new Date(flight.scheduled_departure).toLocaleString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    flight.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                    flight.status === 'boarding' ? 'bg-blue-100 text-blue-800' :
                    flight.status === 'departed' ? 'bg-green-100 text-green-800' :
                    flight.status === 'arrived' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }">
                    ${flight.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${flight.gate || 'Not assigned'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button class="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  private renderMapView(): string {
    return `<div id="flight-map-container"></div>`;
  }

  setupEventListeners(): void {
    // Flight search - filter the cached flights by flight number, airline, or route
    const flightSearch = document.getElementById('flight-search') as HTMLInputElement;
    if (flightSearch) {
      flightSearch.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value.toLowerCase().trim();
        const tableBody = document.querySelector('#flights-table tbody');
        if (!tableBody) return;

        if (!query) {
          // Show all rows
          tableBody.querySelectorAll('tr').forEach(tr => tr.style.display = '');
          return;
        }

        tableBody.querySelectorAll('tr').forEach(tr => {
          const text = tr.textContent?.toLowerCase() || '';
          tr.style.display = text.includes(query) ? '' : 'none';
        });
      });
    }

    // Add flight button
    const addFlightBtn = document.getElementById('add-flight-btn');
    if (addFlightBtn) {
      addFlightBtn.addEventListener('click', this.openAddFlightModal.bind(this));
    }

    // Toggle view button
    const toggleBtn = document.getElementById('toggle-view-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.currentViewMode = this.currentViewMode === 'list' ? 'map' : 'list';
        this.reRenderView();
      });
    }

    // Initialize map if in map mode
    if (this.currentViewMode === 'map') {
      this.initMapView();
    }
  }

  private async reRenderView(): Promise<void> {
    if (this.cachedUser) {
      await this.render(this.cachedUser);
      this.setupEventListeners();
    }
  }

  private initMapView(): void {
    const mapContainer = document.getElementById('flight-map-container');
    if (!mapContainer) return;

    if (!this.mapView) {
      this.mapView = new FlightMapView(mapContainer);
    }

    // Re-render map content inside container
    this.mapView.render().then(html => {
      mapContainer.innerHTML = html;
      this.mapView!.setupEventListeners();
      setTimeout(() => {
        this.mapView!.initMap(this.cachedFlights);
      }, 100);
    });
  }

  private openAddFlightModal() {
    const modalHtml = `
      <div id="add-flight-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">Add New Flight</h3>
            <button id="close-add-flight-modal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          <form id="add-flight-form">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
                <input type="text" id="flight-number" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Airline</label>
                <select id="airline" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Airline</option>
                  <option value="1">Delta Airlines</option>
                  <option value="2">American Airlines</option>
                  <option value="3">United Airlines</option>
                  <option value="4">Southwest Airlines</option>
                  <option value="5">Alaska Airlines</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                  <input type="text" id="origin" placeholder="e.g., LAX" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                  <input type="text" id="destination" placeholder="e.g., JFK" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Departure</label>
                  <input type="datetime-local" id="departure" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Arrival</label>
                  <input type="datetime-local" id="arrival" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Gate</label>
                  <input type="text" id="gate" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Terminal</label>
                  <input type="text" id="terminal" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
              </div>
              <div class="flex space-x-3 pt-4">
                <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
                  Create Flight
                </button>
                <button type="button" id="cancel-add-flight" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium">
                  Cancel
                </button>
              </div>
              <div id="add-flight-error" class="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded hidden">
                Error creating flight. Please try again.
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Close modal
    const closeBtn = document.getElementById('close-add-flight-modal');
    const cancelBtn = document.getElementById('cancel-add-flight');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeAddFlightModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeAddFlightModal());
    
    // Submit form
    const form = document.getElementById('add-flight-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', this.handleAddFlightSubmit.bind(this));
    }
  }

  private closeAddFlightModal() {
    const modal = document.getElementById('add-flight-modal');
    if (modal) {
      modal.remove();
    }
  }

  private async handleAddFlightSubmit(e: Event) {
    e.preventDefault();
    
    const formData = {
      flight_number: (document.getElementById('flight-number') as HTMLInputElement)?.value || '',
      airline_id: parseInt((document.getElementById('airline') as HTMLSelectElement)?.value || '0'),
      origin: (document.getElementById('origin') as HTMLInputElement)?.value || '',
      destination: (document.getElementById('destination') as HTMLInputElement)?.value || '',
      scheduled_departure: (document.getElementById('departure') as HTMLInputElement)?.value || '',
      scheduled_arrival: (document.getElementById('arrival') as HTMLInputElement)?.value || '',
      gate: (document.getElementById('gate') as HTMLInputElement)?.value || '',
      terminal: (document.getElementById('terminal') as HTMLInputElement)?.value || '',
      status: 'scheduled'
    };

    try {
      await this.apiService.createFlight(formData);
      this.closeAddFlightModal();
      // Refresh flights list
      window.dispatchEvent(new CustomEvent('refreshFlights'));
    } catch (error) {
      console.error('Failed to create flight:', error);
      alert('Failed to create flight. Please check the form and try again.');
    }
  }
}

