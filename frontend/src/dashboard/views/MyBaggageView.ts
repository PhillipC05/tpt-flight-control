import { DashboardApiService } from '../services/DashboardApiService.js';
import type { User } from '../types.js';

interface BaggageItem {
  id: number;
  tag_number: string;
  flight_number: string;
  origin: string;
  destination: string;
  status: 'checked-in' | 'loaded' | 'in-transit' | 'arrived' | 'claim-ready' | 'claimed' | 'delayed' | 'lost';
  weight_kg?: number;
  description?: string;
  claim_belt?: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { badge: string; icon: string; label: string }> = {
  'checked-in':   { badge: 'bg-gray-100 text-gray-800',    icon: '🏷️',  label: 'Checked In' },
  'loaded':       { badge: 'bg-blue-100 text-blue-800',    icon: '✈️',  label: 'Loaded' },
  'in-transit':   { badge: 'bg-purple-100 text-purple-800', icon: '🔄', label: 'In Transit' },
  'arrived':      { badge: 'bg-teal-100 text-teal-800',    icon: '📍',  label: 'Arrived' },
  'claim-ready':  { badge: 'bg-green-100 text-green-800',  icon: '✅',  label: 'Ready to Claim' },
  'claimed':      { badge: 'bg-gray-100 text-gray-600',    icon: '🎒',  label: 'Claimed' },
  'delayed':      { badge: 'bg-orange-100 text-orange-800', icon: '⏳', label: 'Delayed' },
  'lost':         { badge: 'bg-red-100 text-red-800',      icon: '❗',  label: 'Lost / Missing' },
};

export class MyBaggageView {
  private apiService: DashboardApiService;

  constructor(_container: HTMLElement) {
    this.apiService = new DashboardApiService();
  }

  async render(user: User): Promise<string> {
    let bags: BaggageItem[] = [];
    let loadError = false;

    try {
      const data = await this.apiService.callApi(`/api/baggage.php?passenger_id=${user.id}`);
      bags = data.baggage || [];
    } catch {
      loadError = true;
    }

    const active   = bags.filter(b => !['claimed'].includes(b.status)).length;
    const readyClaim = bags.filter(b => b.status === 'claim-ready').length;
    const delayed  = bags.filter(b => b.status === 'delayed' || b.status === 'lost').length;

    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold fc-text-primary">My Baggage</h2>
          <button id="refresh-baggage-btn"
            class="px-4 py-2 fc-card border fc-divider rounded-lg fc-text-secondary hover:fc-text-primary text-sm font-medium transition-colors">
            ↻ Refresh
          </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4">
          ${this.statCard('Active Bags',    active.toString(),     'text-blue-400')}
          ${this.statCard('Ready to Claim', readyClaim.toString(), 'text-green-400')}
          ${this.statCard('Delayed / Lost', delayed.toString(),    delayed > 0 ? 'text-red-400' : 'text-gray-400')}
        </div>

        <!-- Bag list -->
        ${loadError
          ? `<div class="fc-card rounded-xl p-8 text-center fc-text-muted">
              Unable to load baggage information. Backend endpoint may not be configured yet.
             </div>`
          : bags.length === 0
            ? `<div class="fc-card rounded-xl p-10 text-center">
                <div class="text-5xl mb-4">🧳</div>
                <div class="fc-text-primary font-medium text-lg">No baggage found</div>
                <div class="fc-text-muted text-sm mt-2">
                  Bags will appear here once you have active bookings with checked luggage.
                </div>
              </div>`
            : `<div class="space-y-3">
                ${bags.map(b => this.renderBagCard(b)).join('')}
              </div>`
        }

        <!-- Help notice -->
        <div class="fc-card rounded-xl p-4 border fc-divider flex items-start gap-3">
          <span class="text-xl shrink-0">ℹ️</span>
          <div class="text-sm fc-text-muted">
            <span class="fc-text-secondary font-medium">Lost or delayed bag?</span>
            Contact your airline's baggage service desk or visit the baggage claim area.
            For immediate assistance, call the airport info line.
          </div>
        </div>
      </div>
    `;
  }

  private statCard(label: string, value: string, colorClass: string): string {
    return `
      <div class="fc-card rounded-xl p-4 border fc-divider text-center">
        <div class="text-2xl font-bold ${colorClass}">${value}</div>
        <div class="text-xs fc-text-muted mt-1">${label}</div>
      </div>
    `;
  }

  private renderBagCard(bag: BaggageItem): string {
    const cfg  = STATUS_CONFIG[bag.status] ?? { badge: 'bg-gray-100 text-gray-800', icon: '🧳', label: bag.status };
    const time = new Date(bag.updated_at).toLocaleString();

    return `
      <div class="fc-card rounded-xl p-5 border fc-divider">
        <div class="flex items-start gap-4">
          <div class="text-3xl shrink-0">${cfg.icon}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span class="font-semibold fc-text-primary font-mono">${bag.tag_number}</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}">${cfg.label}</span>
            </div>
            <div class="text-sm fc-text-secondary mb-2">
              ${bag.flight_number} · ${bag.origin} → ${bag.destination}
            </div>
            ${bag.description ? `<div class="text-xs fc-text-muted mb-2">${bag.description}</div>` : ''}
            <div class="flex items-center gap-4 text-xs fc-text-muted flex-wrap">
              ${bag.weight_kg != null ? `<span>⚖️ ${bag.weight_kg} kg</span>` : ''}
              ${bag.claim_belt ? `<span>🛄 Belt ${bag.claim_belt}</span>` : ''}
              <span>Updated ${time}</span>
            </div>
          </div>
        </div>
        ${bag.status === 'claim-ready'
          ? `<div class="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 font-medium">
              ✅ Your bag is ready for collection at Belt ${bag.claim_belt ?? '—'}
             </div>`
          : ''}
        ${bag.status === 'lost'
          ? `<div class="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              ❗ This bag has been reported as missing. Please visit the Baggage Services desk with your claim tag.
             </div>`
          : ''}
      </div>
    `;
  }

  setupEventListeners(): void {
    document.getElementById('refresh-baggage-btn')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'my-baggage' } }));
    });
  }
}
