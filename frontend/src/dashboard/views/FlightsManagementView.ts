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
            <h2 class="text-xl font-semibold text-slate-100">Flight Management</h2>
            <div class="flex items-center gap-2">
              <input type="text" id="flight-search" placeholder="Search flights..."
                     class="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <button id="toggle-view-btn" class="px-4 py-2 rounded-lg font-medium transition-colors ${
                this.currentViewMode === 'list'
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }">
                ${this.currentViewMode === 'list' ? '🗺 Map View' : '📋 List View'}
              </button>
              <button id="add-flight-btn" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors">
                Add Flight
              </button>
            </div>
          </div>

          ${this.currentViewMode === 'list' ? this.renderListView(flights) : this.renderMapView()}
        </div>
      `;
    } catch (error) {
      console.error('Failed to load flights:', error);
      return '<div class="text-center text-red-400 py-8">Failed to load flight data</div>';
    }
  }

  private sanitize(str: string): string {
    const el = document.createElement('div');
    el.textContent = str;
    return el.innerHTML;
  }

  private renderListView(flights: Flight[]): string {
    const statusColors: Record<string, string> = {
      scheduled: 'bg-yellow-900/30 text-yellow-300',
      boarding: 'bg-blue-900/30 text-blue-300',
      departed: 'bg-emerald-900/30 text-emerald-300',
      arrived: 'bg-slate-600/30 text-slate-300',
      cancelled: 'bg-red-900/30 text-red-300',
    };

    return `
      <div class="bg-slate-800 border border-slate-700/60 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table id="flights-table" class="min-w-full divide-y divide-slate-700/60">
            <thead class="bg-slate-800/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Flight</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Route</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Departure</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Gate</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/60">
              ${flights.map(flight => `
                <tr class="hover:bg-slate-700/30 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-slate-200">${this.sanitize(flight.flight_number)}</div>
                    <div class="text-sm text-slate-400">${this.sanitize(flight.airline_name || '')}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    ${this.sanitize(flight.origin)} → ${this.sanitize(flight.destination)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    ${new Date(flight.scheduled_departure).toLocaleString()}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[flight.status] || 'bg-slate-600/30 text-slate-300'}">
                      ${this.sanitize(flight.status)}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    ${this.sanitize(flight.gate || 'Not assigned')}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-400 hover:text-blue-300 mr-3 transition-colors">Edit</button>
                    <button class="text-red-400 hover:text-red-300 transition-colors">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
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
    if (!this.cachedUser) return;
    const content = document.getElementById('dashboard-content');
    if (!content) return;
    content.innerHTML = await this.render(this.cachedUser);
    this.setupEventListeners();
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
      <div id="add-flight-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-slate-800 border border-slate-700/60 p-6 rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-slate-100">Add New Flight</h3>
            <button id="close-add-flight-modal" class="text-slate-400 hover:text-white text-2xl transition-colors">&times;</button>
          </div>
          <form id="add-flight-form">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Flight Number</label>
                <input type="text" id="flight-number" required class="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Airline</label>
                <select id="airline" required class="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                  <label class="block text-sm font-medium text-slate-300 mb-1">Origin</label>
                  <input type="text" id="origin" placeholder="e.g., LAX" required class="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-1">Destination</label>
                  <input type="text" id="destination" placeholder="e.g., JFK" required class="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-1">Departure</label>
                  <input type="datetime-local" id="departure" required class="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-1">Arrival</label>
                  <input type="datetime-local" id="arrival" required class="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-1">Gate</label>
                  <input type="text" id="gate" class="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-1">Terminal</label>
                  <input type="text" id="terminal" class="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
              </div>
              <div class="flex gap-3 pt-4">
                <button type="submit" class="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-500 font-medium transition-colors">
                  Create Flight
                </button>
                <button type="button" id="cancel-add-flight" class="flex-1 bg-slate-700 text-slate-300 py-2.5 px-4 rounded-lg hover:bg-slate-600 font-medium transition-colors">
                  Cancel
                </button>
              </div>
              <div id="add-flight-error" class="mt-2 p-2 bg-red-900/30 border border-red-700 text-red-300 rounded hidden">
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

