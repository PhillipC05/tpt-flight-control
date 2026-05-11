import { DashboardApiService } from '../services/DashboardApiService.js';
import type { User } from '../types.js';

interface SecurityAlert {
  id: number;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  reported_by?: string;
  created_at: string;
  resolved_at?: string;
}

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high:     'bg-orange-100 text-orange-800',
  medium:   'bg-yellow-100 text-yellow-800',
  low:      'bg-green-100 text-green-800',
};

const STATUS_BADGE: Record<string, string> = {
  open:          'bg-red-100 text-red-800',
  investigating: 'bg-blue-100 text-blue-800',
  resolved:      'bg-green-100 text-green-800',
};

const SEVERITY_ICON: Record<string, string> = {
  critical: '🔴',
  high:     '🟠',
  medium:   '🟡',
  low:      '🟢',
};

export class SecurityManagementView {
  private apiService: DashboardApiService;

  constructor(_container: HTMLElement) {
    this.apiService = new DashboardApiService();
  }

  async render(_user: User): Promise<string> {
    let alerts: SecurityAlert[] = [];
    let loadError = false;

    try {
      const data = await this.apiService.callApi('/api/security.php?action=alerts');
      alerts = data.alerts || [];
    } catch {
      loadError = true;
    }

    const open         = alerts.filter(a => a.status === 'open').length;
    const investigating = alerts.filter(a => a.status === 'investigating').length;
    const critical      = alerts.filter(a => a.severity === 'critical').length;
    const resolved      = alerts.filter(a => a.status === 'resolved').length;

    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold fc-text-primary">Security Management</h2>
          <button id="report-incident-btn"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
            Report Incident
          </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${this.statCard('Open Alerts',    open.toString(),         'text-red-400')}
          ${this.statCard('Investigating',  investigating.toString(), 'text-blue-400')}
          ${this.statCard('Critical',       critical.toString(),      'text-orange-400')}
          ${this.statCard('Resolved Today', resolved.toString(),      'text-green-400')}
        </div>

        <!-- Filter bar -->
        <div class="flex items-center gap-3 flex-wrap">
          <select id="security-status-filter"
            class="px-3 py-2 fc-card border fc-divider rounded-lg text-sm fc-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
          <select id="security-severity-filter"
            class="px-3 py-2 fc-card border fc-divider rounded-lg text-sm fc-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <!-- Alert list -->
        ${loadError
          ? '<div class="fc-card rounded-xl p-8 text-center fc-text-muted">Unable to load security alerts. Backend endpoint may not be configured yet.</div>'
          : alerts.length === 0
            ? `<div class="fc-card rounded-xl p-8 text-center">
                <div class="text-4xl mb-3">🛡️</div>
                <div class="fc-text-primary font-medium">No active security alerts</div>
                <div class="fc-text-muted text-sm mt-1">All systems secure</div>
              </div>`
            : `<div id="security-alert-list" class="space-y-3">
                ${alerts.map(a => this.renderAlertCard(a)).join('')}
              </div>`
        }
      </div>
    `;
  }

  private statCard(label: string, value: string, colorClass: string): string {
    return `
      <div class="fc-card rounded-xl p-4 border fc-divider">
        <div class="text-2xl font-bold ${colorClass}">${value}</div>
        <div class="text-sm fc-text-muted mt-1">${label}</div>
      </div>
    `;
  }

  private renderAlertCard(alert: SecurityAlert): string {
    const sevCls  = SEVERITY_BADGE[alert.severity]  ?? 'bg-gray-100 text-gray-800';
    const statCls = STATUS_BADGE[alert.status]       ?? 'bg-gray-100 text-gray-800';
    const icon    = SEVERITY_ICON[alert.severity]    ?? '⚪';
    const time    = new Date(alert.created_at).toLocaleString();

    return `
      <div class="fc-card rounded-xl p-5 border fc-divider security-alert-card"
           data-status="${alert.status}" data-severity="${alert.severity}">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <span class="text-xl shrink-0 mt-0.5">${icon}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="text-sm font-semibold fc-text-primary">${alert.alert_type}</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-medium ${sevCls}">${alert.severity}</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-medium ${statCls}">${alert.status}</span>
              </div>
              <p class="text-sm fc-text-muted">${alert.description}</p>
              <div class="flex items-center gap-4 mt-2 text-xs fc-text-muted flex-wrap">
                <span>📍 ${alert.location}</span>
                ${alert.reported_by ? `<span>👤 ${alert.reported_by}</span>` : ''}
                <span>🕐 ${time}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            ${alert.status === 'open'
              ? `<button class="investigate-alert text-xs px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                         data-id="${alert.id}">Investigate</button>`
              : ''}
            ${alert.status !== 'resolved'
              ? `<button class="resolve-alert text-xs px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
                         data-id="${alert.id}">Resolve</button>`
              : ''}
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners(): void {
    document.getElementById('report-incident-btn')?.addEventListener('click', () => {
      this.openReportModal();
    });

    const statusFilter   = document.getElementById('security-status-filter')   as HTMLSelectElement;
    const severityFilter = document.getElementById('security-severity-filter') as HTMLSelectElement;

    const applyFilter = () => {
      const status   = statusFilter?.value   ?? '';
      const severity = severityFilter?.value ?? '';
      document.querySelectorAll<HTMLElement>('.security-alert-card').forEach(card => {
        const matchStatus   = !status   || card.dataset.status   === status;
        const matchSeverity = !severity || card.dataset.severity === severity;
        card.style.display = matchStatus && matchSeverity ? '' : 'none';
      });
    };

    statusFilter?.addEventListener('change', applyFilter);
    severityFilter?.addEventListener('change', applyFilter);

    document.querySelectorAll('.investigate-alert').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = (e.target as HTMLElement).dataset.id;
        if (!id) return;
        try {
          await this.apiService.callApi(`/api/security.php?action=investigate&id=${id}`, 'POST');
          window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'security' } }));
        } catch { alert('Failed to update alert.'); }
      });
    });

    document.querySelectorAll('.resolve-alert').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = (e.target as HTMLElement).dataset.id;
        if (!id) return;
        try {
          await this.apiService.callApi(`/api/security.php?action=resolve&id=${id}`, 'POST');
          window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'security' } }));
        } catch { alert('Failed to resolve alert.'); }
      });
    });
  }

  private openReportModal(): void {
    const html = `
      <div id="report-incident-modal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div class="fc-card rounded-2xl w-full max-w-md shadow-2xl">
          <div class="flex items-center justify-between p-5 border-b fc-divider">
            <h3 class="text-lg font-bold fc-text-primary">Report Security Incident</h3>
            <button id="close-report-modal" class="fc-text-muted hover:fc-text-primary text-xl">&times;</button>
          </div>
          <form id="report-incident-form" class="p-5 space-y-4">
            <div>
              <label class="block text-sm font-medium fc-text-secondary mb-1">Incident Type</label>
              <input type="text" id="sec-type" placeholder="e.g., Unauthorized Access, Suspicious Package…" required
                class="w-full px-3 py-2 fc-card border fc-divider rounded-lg text-sm fc-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium fc-text-secondary mb-1">Description</label>
              <textarea id="sec-description" rows="3" required
                class="w-full px-3 py-2 fc-card border fc-divider rounded-lg text-sm fc-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium fc-text-secondary mb-1">Severity</label>
                <select id="sec-severity"
                  class="w-full px-3 py-2 fc-card border fc-divider rounded-lg text-sm fc-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium fc-text-secondary mb-1">Location</label>
                <input type="text" id="sec-location" placeholder="Terminal, Gate…" required
                  class="w-full px-3 py-2 fc-card border fc-divider rounded-lg text-sm fc-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit"
                class="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 text-sm">
                Report Incident
              </button>
              <button type="button" id="cancel-report-modal"
                class="flex-1 py-2 fc-card border fc-divider rounded-lg fc-text-secondary hover:fc-text-primary text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    const close = () => document.getElementById('report-incident-modal')?.remove();
    document.getElementById('close-report-modal')?.addEventListener('click', close);
    document.getElementById('cancel-report-modal')?.addEventListener('click', close);

    document.getElementById('report-incident-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        alert_type:  (document.getElementById('sec-type')        as HTMLInputElement).value,
        description: (document.getElementById('sec-description') as HTMLTextAreaElement).value,
        severity:    (document.getElementById('sec-severity')    as HTMLSelectElement).value,
        location:    (document.getElementById('sec-location')    as HTMLInputElement).value,
        status: 'open',
      };
      try {
        await this.apiService.callApi('/api/security.php?action=report', 'POST', payload);
        close();
        window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'security' } }));
      } catch {
        alert('Failed to report incident.');
      }
    });
  }
}
