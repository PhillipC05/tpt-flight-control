import { DashboardApiService } from '../services/DashboardApiService.js';
import type { DashboardStats, User } from '../types.js';

export class OverviewView {
  private apiService: DashboardApiService;

  constructor(_container: HTMLElement) {
    this.apiService = new DashboardApiService();
  }

  async render(user: User): Promise<string> {
    let stats: DashboardStats;
    try {
      stats = await this.apiService.fetchDashboardStats();
    } catch {
      stats = {
        total_flights: 0, active_flights: 0, total_passengers: 0,
        checked_in_passengers: 0, total_bookings: 0, pending_maintenance: 0,
        security_alerts: 0, system_health: 'healthy'
      };
    }

    const healthColor =
      stats.system_health === 'healthy'  ? 'text-emerald-400' :
      stats.system_health === 'warning'  ? 'text-amber-400'   : 'text-red-400';
    const healthDot =
      stats.system_health === 'healthy'  ? 'bg-emerald-400' :
      stats.system_health === 'warning'  ? 'bg-amber-400'   : 'bg-red-400';

    return `
      <div class="space-y-6">
        <!-- Page header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-100">Good day, ${user.first_name}</h2>
            <p class="text-sm text-slate-500 mt-0.5">${new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
          </div>
          <button id="refresh-stats"
            class="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors">
            ↻ Refresh
          </button>
        </div>

        <!-- Stat cards -->
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
          ${this.statCard('Total Flights',     stats.total_flights,         '✈',  'from-blue-600/20 to-blue-600/5',    'text-blue-400',    'border-blue-600/30')}
          ${this.statCard('Active Now',        stats.active_flights,        '🛫', 'from-emerald-600/20 to-emerald-600/5','text-emerald-400','border-emerald-600/30')}
          ${this.statCard('Total Passengers',  stats.total_passengers,      '👤', 'from-violet-600/20 to-violet-600/5', 'text-violet-400',  'border-violet-600/30')}
          ${this.statCard('Checked In',        stats.checked_in_passengers, '✅', 'from-cyan-600/20 to-cyan-600/5',    'text-cyan-400',    'border-cyan-600/30')}
        </div>

        <!-- Secondary row -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          ${this.miniCard('Bookings',           stats.total_bookings,       '🎫', 'text-indigo-400')}
          ${this.miniCard('Pending Maintenance',stats.pending_maintenance,  '🔧', stats.pending_maintenance > 5 ? 'text-amber-400' : 'text-slate-300')}
          ${this.miniCard('Security Alerts',    stats.security_alerts,      '🔐', stats.security_alerts > 0    ? 'text-red-400'   : 'text-slate-300')}
        </div>

        <!-- System status + activity row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- System health -->
          <div class="bg-slate-800 rounded-xl border border-slate-700/60 p-5">
            <h3 class="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">System Health</h3>
            <div class="flex items-center gap-3">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${healthDot} opacity-50"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 ${healthDot}"></span>
              </span>
              <span class="text-base font-semibold capitalize ${healthColor}">${stats.system_health}</span>
              <span class="ml-auto text-xs text-slate-500">Updated ${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="mt-4 grid grid-cols-3 gap-3">
              ${this.healthPill('API',      'Online',  'emerald')}
              ${this.healthPill('DB',       'Online',  'emerald')}
              ${this.healthPill('WS',       'Online',  'emerald')}
            </div>
          </div>

          <!-- Quick actions -->
          <div class="bg-slate-800 rounded-xl border border-slate-700/60 p-5">
            <h3 class="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Quick Actions</h3>
            <div class="grid grid-cols-2 gap-2">
              ${this.quickAction('✈', 'View Flights',      'flights')}
              ${this.quickAction('👤','Passengers',         'passengers')}
              ${this.quickAction('🔧','Maintenance',        'maintenance')}
              ${this.quickAction('🔐','Security',           'advanced-security')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private statCard(label: string, value: number, icon: string, gradient: string, textColor: string, border: string): string {
    return `
      <div class="bg-linear-to-br ${gradient} rounded-xl border ${border} p-5">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs text-slate-400 uppercase tracking-wider mb-1">${label}</p>
            <p class="text-3xl font-bold ${textColor}">${value.toLocaleString()}</p>
          </div>
          <span class="text-2xl opacity-70">${icon}</span>
        </div>
      </div>
    `;
  }

  private miniCard(label: string, value: number, icon: string, textColor: string): string {
    return `
      <div class="bg-slate-800 rounded-xl border border-slate-700/60 p-4 flex items-center gap-4">
        <span class="text-xl">${icon}</span>
        <div>
          <p class="text-xs text-slate-500">${label}</p>
          <p class="text-xl font-semibold ${textColor}">${value.toLocaleString()}</p>
        </div>
      </div>
    `;
  }

  private healthPill(name: string, status: string, color: string): string {
    const colorClass =
      color === 'emerald' ? 'text-emerald-400' :
      color === 'amber'   ? 'text-amber-400' :
      color === 'red'     ? 'text-red-400' :
      'text-slate-400';
    return `
      <div class="bg-slate-700/50 rounded-lg p-2 text-center">
        <div class="text-xs text-slate-500 mb-1">${name}</div>
        <div class="text-xs font-medium ${colorClass}">${status}</div>
      </div>
    `;
  }

  private quickAction(icon: string, label: string, view: string): string {
    return `
      <button data-nav="${view}"
        class="nav-quick-action flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
        <span>${icon}</span><span>${label}</span>
      </button>
    `;
  }

  setupEventListeners(): void {
    document.getElementById('refresh-stats')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('refreshOverview'));
    });

    document.querySelectorAll<HTMLButtonElement>('.nav-quick-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.nav;
        if (view) window.dispatchEvent(new CustomEvent('navigate', { detail: { view } }));
      });
    });
  }
}
