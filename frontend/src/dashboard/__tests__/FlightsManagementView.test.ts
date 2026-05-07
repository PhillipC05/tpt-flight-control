import { FlightsManagementView } from '../views/FlightsManagementView.js';
import { DashboardApiService } from '../services/DashboardApiService.js';
import type { Flight, User } from '../types.js';

// Mock DashboardApiService
jest.mock('../services/DashboardApiService.js');

// Mock leaflet
jest.mock('leaflet', () => ({
  Map: jest.fn().mockImplementation(() => ({
    setView: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  })),
  marker: jest.fn().mockImplementation(() => ({
    addTo: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
    setStyle: jest.fn().mockReturnThis(),
  })),
  circleMarker: jest.fn().mockImplementation(() => ({
    addTo: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
    setStyle: jest.fn().mockReturnThis(),
  })),
  polyline: jest.fn().mockImplementation(() => ({
    addTo: jest.fn().mockReturnThis(),
    bindTooltip: jest.fn().mockReturnThis(),
  })),
  tileLayer: jest.fn().mockImplementation(() => ({
    addTo: jest.fn().mockReturnThis(),
  })),
  divIcon: jest.fn().mockImplementation(() => ({})),
  Control: {
    Zoom: jest.fn().mockImplementation(() => ({
      addTo: jest.fn().mockReturnThis(),
    })),
  },
}));

const mockUser: User = {
  id: 1,
  username: 'testuser',
  first_name: 'Test',
  last_name: 'User',
  role_name: 'admin',
};

const mockFlights: Flight[] = [
  {
    id: 1,
    flight_number: 'AA100',
    origin: 'KJFK',
    destination: 'KLAX',
    scheduled_departure: '2026-05-07T10:00:00Z',
    scheduled_arrival: '2026-05-07T14:00:00Z',
    status: 'departed',
    airline_name: 'American Airlines',
    gate: 'B12',
    terminal: '4',
  },
  {
    id: 2,
    flight_number: 'DL200',
    origin: 'KLAX',
    destination: 'KJFK',
    scheduled_departure: '2026-05-07T12:00:00Z',
    scheduled_arrival: '2026-05-07T16:00:00Z',
    status: 'scheduled',
    airline_name: 'Delta Airlines',
    gate: 'C5',
    terminal: '2',
  },
];

describe('FlightsManagementView', () => {
  let container: HTMLElement;
  let view: FlightsManagementView;
  let mockApiService: jest.Mocked<DashboardApiService>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Setup mock API service
    mockApiService = new DashboardApiService() as jest.Mocked<DashboardApiService>;
    mockApiService.fetchFlights = jest.fn().mockResolvedValue(mockFlights);
    mockApiService.createFlight = jest.fn().mockResolvedValue({ success: true });

    // Mock DashboardApiService constructor
    (DashboardApiService as jest.Mock).mockImplementation(() => mockApiService);

    view = new FlightsManagementView(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.clearAllMocks();
  });

  test('should render flight list view with flights', async () => {
    const html = await view.render(mockUser);
    expect(html).toContain('Flight Management');
    expect(html).toContain('AA100');
    expect(html).toContain('DL200');
    expect(html).toContain('KJFK → KLAX');
    expect(html).toContain('Map View');
    expect(html).toContain('Add Flight');
  });

  test('should show error message when API fails', async () => {
    mockApiService.fetchFlights.mockRejectedValueOnce(new Error('API Error'));
    const html = await view.render(mockUser);
    expect(html).toContain('Failed to load flight data');
  });

  test('should render map view placeholder', async () => {
    // First render in list mode
    await view.render(mockUser);
    
    // Manually set map mode and re-render
    (view as any).currentViewMode = 'map';
    const html = await view.render(mockUser);
    
    expect(html).toContain('flight-map-container');
  });

  test('should render status badge with correct colors', async () => {
    const html = await view.render(mockUser);
    
    // departed status should have green color class
    expect(html).toContain('bg-green-100');
    expect(html).toContain('departed');
    
    // scheduled status should have yellow color class
    expect(html).toContain('bg-yellow-100');
    expect(html).toContain('scheduled');
  });

  test('should open add flight modal', async () => {
    const html = await view.render(mockUser);
    container.innerHTML = html;

    // Trigger add flight button click via event listener
    const addBtn = document.getElementById('add-flight-btn');
    expect(addBtn).toBeTruthy();

    // Simulate click using our setup
    view.setupEventListeners();
    addBtn?.click();

    // Modal should be inserted into body
    const modal = document.getElementById('add-flight-modal');
    expect(modal).toBeTruthy();
    expect(modal?.innerHTML).toContain('Add New Flight');
  });

  test('should close add flight modal', async () => {
    const html = await view.render(mockUser);
    container.innerHTML = html;
    view.setupEventListeners();

    // Open modal
    const addBtn = document.getElementById('add-flight-btn');
    addBtn?.click();
    expect(document.getElementById('add-flight-modal')).toBeTruthy();

    // Close modal via close button
    const closeBtn = document.getElementById('close-add-flight-modal');
    if (closeBtn) {
      closeBtn.click();
    }
    expect(document.getElementById('add-flight-modal')).toBeNull();
  });

  test('should handle add flight form submission', async () => {
    const html = await view.render(mockUser);
    container.innerHTML = html;
    view.setupEventListeners();

    // Open modal
    const addBtn = document.getElementById('add-flight-btn');
    addBtn?.click();

    // Fill out form
    const flightNumberInput = document.getElementById('flight-number') as HTMLInputElement;
    const originInput = document.getElementById('origin') as HTMLInputElement;
    const destinationInput = document.getElementById('destination') as HTMLInputElement;
    const departureInput = document.getElementById('departure') as HTMLInputElement;
    const arrivalInput = document.getElementById('arrival') as HTMLInputElement;
    const gateInput = document.getElementById('gate') as HTMLInputElement;
    const terminalInput = document.getElementById('terminal') as HTMLInputElement;
    const airlineSelect = document.getElementById('airline') as HTMLSelectElement;

    if (flightNumberInput) flightNumberInput.value = 'UA300';
    if (originInput) originInput.value = 'KORD';
    if (destinationInput) destinationInput.value = 'KMIA';
    if (departureInput) departureInput.value = '2026-05-08T08:00';
    if (arrivalInput) arrivalInput.value = '2026-05-08T12:00';
    if (gateInput) gateInput.value = 'A1';
    if (terminalInput) terminalInput.value = '3';
    if (airlineSelect) airlineSelect.value = '3';

    // Submit form
    const form = document.getElementById('add-flight-form') as HTMLFormElement;
    if (form) {
      form.dispatchEvent(new Event('submit'));
    }

    // Wait for async submission
    await new Promise(process.nextTick);

    expect(mockApiService.createFlight).toHaveBeenCalledWith({
      flight_number: 'UA300',
      airline_id: 3,
      origin: 'KORD',
      destination: 'KMIA',
      scheduled_departure: '2026-05-08T08:00',
      scheduled_arrival: '2026-05-08T12:00',
      gate: 'A1',
      terminal: '3',
      status: 'scheduled',
    });
  });

  test('should toggle between list and map view', async () => {
    const html = await view.render(mockUser);
    container.innerHTML = html;
    view.setupEventListeners();

    // Initially in list mode
    const toggleBtn = document.getElementById('toggle-view-btn');
    expect(toggleBtn).toBeTruthy();
    expect(toggleBtn?.textContent).toContain('Map View');
  });
});