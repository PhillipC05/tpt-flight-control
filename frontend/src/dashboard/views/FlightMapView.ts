import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Flight } from '../types.js';

interface Airport {
  icao: string;
  lat: number;
  lng: number;
  name: string;
}

const AIRPORTS: Airport[] = [
  { icao: 'KJFK', lat: 40.6413, lng: -73.7781, name: 'John F. Kennedy International Airport' },
  { icao: 'KLAX', lat: 33.9416, lng: -118.4085, name: 'Los Angeles International Airport' },
  { icao: 'KLAS', lat: 36.0801, lng: -115.1522, name: 'Harry Reid International Airport' },
  { icao: 'KSFO', lat: 37.6189, lng: -122.3750, name: 'San Francisco International Airport' },
  { icao: 'KORD', lat: 41.9742, lng: -87.9073, name: "O'Hare International Airport" },
  { icao: 'KMIA', lat: 25.7953, lng: -80.2901, name: 'Miami International Airport' },
  { icao: 'KATL', lat: 33.6367, lng: -84.4281, name: 'Hartsfield-Jackson Atlanta International Airport' },
  { icao: 'KDEN', lat: 39.8617, lng: -104.6732, name: 'Denver International Airport' },
  { icao: 'KDFW', lat: 32.8968, lng: -97.0380, name: 'Dallas/Fort Worth International Airport' },
  { icao: 'KSEA', lat: 47.4502, lng: -122.3088, name: 'Seattle-Tacoma International Airport' },
];

const AIRPORT_MAP = new Map(AIRPORTS.map(a => [a.icao, a]));

function interpolatePosition(origin: Airport, destination: Airport, progress: number): [number, number] {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const lat = origin.lat + (destination.lat - origin.lat) * clampedProgress;
  const lng = origin.lng + (destination.lng - origin.lng) * clampedProgress;
  return [lat, lng];
}

function computeFlightProgress(flight: Flight, simulatedNow?: number): number {
  const now = simulatedNow ?? Date.now();
  const departureTime = new Date(flight.scheduled_departure).getTime();
  const arrivalTime = new Date(flight.scheduled_arrival).getTime();
  const totalDuration = arrivalTime - departureTime;

  if (totalDuration <= 0) return 0;
  if (now < departureTime) return 0;
  if (now > arrivalTime) return 1;

  return (now - departureTime) / totalDuration;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'scheduled': return '#f59e0b';
    case 'boarding': return '#3b82f6';
    case 'departed': return '#10b981';
    case 'arrived': return '#6b7280';
    case 'delayed': return '#ef4444';
    default: return '#8b5cf6';
  }
}

function getStatusBorderColor(status: string): string {
  switch (status) {
    case 'scheduled': return '#d97706';
    case 'boarding': return '#2563eb';
    case 'departed': return '#059669';
    case 'arrived': return '#4b5563';
    case 'delayed': return '#dc2626';
    default: return '#7c3aed';
  }
}

export class FlightMapView {
  private map: L.Map | null = null;
  private flightMarkers: L.CircleMarker[] = [];
  private routeLines: L.Polyline[] = [];
  private airportMarkers: L.Marker[] = [];
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  private cachedFlights: Flight[] = [];
  private simulationTimeOffset: number = 0;

  constructor(_container: HTMLElement) {
    // container is stored internally by the caller
  }

  async render(): Promise<string> {
    return `
      <div class="h-150 bg-gray-200 rounded-lg shadow-lg relative">
        <div class="absolute top-4 left-4 z-1000 bg-white p-3 rounded-lg shadow-md">
          <h3 class="font-bold mb-2">Live Flight Tracking</h3>
          <div class="flex items-center gap-2 mb-2">
            <span class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
            <span class="text-xs text-gray-600">Live</span>
          </div>
          <div class="text-xs text-gray-500">
            <span id="flight-count">0</span> active flights
          </div>
        </div>
        <div class="absolute top-4 right-4 z-1000 flex flex-col gap-2">
          <button id="map-zoom-in" class="bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 text-lg leading-none" title="Zoom in">+</button>
          <button id="map-zoom-out" class="bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 text-lg leading-none" title="Zoom out">−</button>
          <button id="map-reset-view" class="bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 text-sm" title="Reset view">⟲</button>
        </div>
        <div id="flight-map" class="w-full h-full"></div>
        <div id="map-legend" class="absolute bottom-4 left-4 z-1000 bg-white p-2 rounded-lg shadow-md text-xs">
          <div class="flex items-center gap-2 mb-1">
            <span class="w-3 h-3 rounded-full bg-blue-500"></span> Airport
          </div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-3 h-3 rounded-full bg-green-500"></span> Departed
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-yellow-500"></span> Scheduled/Boarding
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners(): void {
    // Zoom controls
    document.getElementById('map-zoom-in')?.addEventListener('click', () => {
      if (this.map) this.map.zoomIn();
    });
    document.getElementById('map-zoom-out')?.addEventListener('click', () => {
      if (this.map) this.map.zoomOut();
    });
    document.getElementById('map-reset-view')?.addEventListener('click', () => {
      if (this.map) this.map.setView([39.8283, -98.5795], 4);
    });
  }

  initMap(flights: Flight[]) {
    this.cleanup();
    this.cachedFlights = flights;

    // Center on US
    this.map = L.map('flight-map', {
      center: [39.8283, -98.5795],
      zoom: 4,
      zoomControl: false,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(this.map);

    this.addAirportMarkers();
    this.addFlightRoutes(flights);
    this.addLiveFlightPositions(flights);
    this.updateFlightCount(flights);

    // Simulate real-time updates every 5 seconds with simulated progress
    this.updateInterval = setInterval(() => {
      this.simulationTimeOffset += 30000; // Advance 30 seconds each tick
      this.updateLivePositions(this.cachedFlights);
    }, 5000);
  }

  private updateFlightCount(flights: Flight[]) {
    const countEl = document.getElementById('flight-count');
    if (countEl) {
      const activeFlights = flights.filter(f => f.status === 'departed' || f.status === 'boarding');
      countEl.textContent = String(activeFlights.length);
    }
  }

  private cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.flightMarkers = [];
    this.routeLines = [];
    this.airportMarkers = [];
    this.simulationTimeOffset = 0;
  }

  destroy() {
    this.cleanup();
  }

  private addAirportMarkers() {
    AIRPORTS.forEach(airport => {
      const marker = L.marker([airport.lat, airport.lng], {
        icon: L.divIcon({
          className: 'airport-marker',
          html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>`,
          iconSize: [8, 8],
          iconAnchor: [4, 4],
          popupAnchor: [0, -10]
        })
      }).addTo(this.map!)
        .bindPopup(`
          <div class="font-bold">${airport.name}</div>
          <div class="text-sm text-gray-600">${airport.icao}</div>
          <div class="text-xs text-gray-500">${airport.lat.toFixed(4)}, ${airport.lng.toFixed(4)}</div>
        `);

      this.airportMarkers.push(marker);
    });
  }

  private addFlightRoutes(flights: Flight[]) {
    flights.forEach(flight => {
      const originAirport = AIRPORT_MAP.get(flight.origin);
      const destAirport = AIRPORT_MAP.get(flight.destination);

      if (originAirport && destAirport) {
        // Great circle approximation with intermediate points
        const latlngs: [number, number][] = [];
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const lat = originAirport.lat + (destAirport.lat - originAirport.lat) * t;
          const lng = originAirport.lng + (destAirport.lng - originAirport.lng) * t;
          latlngs.push([lat, lng]);
        }

        const line = L.polyline(latlngs, {
          color: '#3b82f6',
          weight: 2,
          opacity: 0.4,
          dashArray: '8, 6'
        }).addTo(this.map!);

        // Add tooltip showing flight info
        line.bindTooltip(`${flight.flight_number}: ${flight.origin} → ${flight.destination}`, {
          sticky: true,
          opacity: 0.9
        });

        this.routeLines.push(line);
      }
    });
  }

  private addLiveFlightPositions(flights: Flight[]) {
    flights.forEach((flight) => {
      const originAirport = AIRPORT_MAP.get(flight.origin);
      const destAirport = AIRPORT_MAP.get(flight.destination);

      if (originAirport && destAirport) {
        const simulatedNow = Date.now() + this.simulationTimeOffset;
        const progress = computeFlightProgress(flight, simulatedNow);
        const [lat, lng] = interpolatePosition(originAirport, destAirport, progress);

        const isActive = progress > 0 && progress < 1 && flight.status !== 'arrived';
        const color = isActive ? getStatusColor(flight.status) : '#6b7280';
        const borderColor = isActive ? getStatusBorderColor(flight.status) : '#4b5563';
        const radius = isActive ? 8 : 6;
        const opacity = isActive ? 1 : 0.5;

        const marker = L.circleMarker([lat, lng], {
          radius: radius,
          fillColor: color,
          color: borderColor,
          weight: isActive ? 2 : 1,
          opacity: opacity,
          fillOpacity: isActive ? 0.8 : 0.4
        }).addTo(this.map!)
          .bindPopup(`
            <div class="font-bold">${flight.flight_number}</div>
            <div>${flight.origin} → ${flight.destination}</div>
            <div>Status: <span class="font-semibold">${flight.status}</span></div>
            <div class="text-xs text-gray-500">Progress: ${(progress * 100).toFixed(0)}%</div>
            <div class="text-xs text-gray-500">Position: ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
          `);

        // Add pulsing effect for active flights via DOM element class
        if (isActive && marker.getElement()) {
          marker.getElement()!.classList.add('flight-marker-active');
        }

        this.flightMarkers.push(marker);
      }
    });
  }

  private updateLivePositions(flights: Flight[]) {
    // Remove old markers
    this.flightMarkers.forEach(marker => this.map!.removeLayer(marker));
    this.flightMarkers = [];

    // Re-add markers with updated positions
    flights.forEach((flight) => {
      const originAirport = AIRPORT_MAP.get(flight.origin);
      const destAirport = AIRPORT_MAP.get(flight.destination);

      if (originAirport && destAirport) {
        const simulatedNow = Date.now() + this.simulationTimeOffset;
        const progress = computeFlightProgress(flight, simulatedNow);
        const [lat, lng] = interpolatePosition(originAirport, destAirport, progress);

        const isActive = progress > 0 && progress < 1 && flight.status !== 'arrived';
        const color = isActive ? getStatusColor(flight.status) : '#6b7280';
        const borderColor = isActive ? getStatusBorderColor(flight.status) : '#4b5563';
        const radius = isActive ? 8 : 6;
        const opacity = isActive ? 1 : 0.5;

        const marker = L.circleMarker([lat, lng], {
          radius: radius,
          fillColor: color,
          color: borderColor,
          weight: isActive ? 2 : 1,
          opacity: opacity,
          fillOpacity: isActive ? 0.8 : 0.4
        }).addTo(this.map!)
          .bindPopup(`
            <div class="font-bold">${flight.flight_number}</div>
            <div>${flight.origin} → ${flight.destination}</div>
            <div>Status: <span class="font-semibold">${flight.status}</span></div>
            <div class="text-xs text-gray-500">Progress: ${(progress * 100).toFixed(0)}%</div>
            <div class="text-xs text-gray-500">Position: ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
          `);

        // Add pulsing effect for active flights via DOM element class
        if (isActive && marker.getElement()) {
          marker.getElement()!.classList.add('flight-marker-active');
        }

        this.flightMarkers.push(marker);
      }
    });

    // Update active flight count
    this.updateFlightCount(flights);
  }
}