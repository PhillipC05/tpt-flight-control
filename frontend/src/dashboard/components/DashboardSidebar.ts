import type { DashboardView, MenuItem, User } from '../types.js';

interface MenuGroup { label: string; items: MenuItem[]; }

export class DashboardSidebar {
  private container: HTMLElement;
  private currentView: DashboardView;
  private onViewChange: (view: DashboardView) => void;

  constructor(container: HTMLElement, currentView: DashboardView, onViewChange: (view: DashboardView) => void) {
    this.container = container;
    this.currentView = currentView;
    this.onViewChange = onViewChange;
  }

  render(user: User): string {
    const groups = this.getMenuGroups(user.role_name);

    return `
      <nav class="fc-sidebar w-56 min-h-full flex flex-col shrink-0">
        <div class="flex-1 overflow-y-auto py-3 space-y-4">
          ${groups.map(group => `
            <div>
              ${group.label ? `
                <p class="px-4 mb-1 text-xs font-semibold fc-text-muted uppercase tracking-widest">${group.label}</p>
              ` : ''}
              <ul>
                ${group.items.map(item => `
                  <li>
                    <button id="${item.id}-btn"
                      class="fc-nav-item ${this.currentView === item.id ? 'active' : ''}">
                      <span class="text-sm w-4 text-center shrink-0">${item.icon}</span>
                      <span>${item.label}</span>
                    </button>
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <div class="p-4 border-t fc-divider">
          <p class="text-xs fc-text-muted text-center">TPT Flight Control v1.0</p>
        </div>
      </nav>
    `;
  }

  private getMenuGroups(role: string): MenuGroup[] {
    const groups: MenuGroup[] = [
      { label: '', items: [{ id: 'overview', label: 'Overview', icon: '◎' }] }
    ];

    if (role === 'admin' || role === 'operator') {
      groups.push({
        label: 'Operations',
        items: [
          { id: 'flights',      label: 'Flights',      icon: '✈' },
          { id: 'passengers',   label: 'Passengers',   icon: '👤' },
          { id: 'maintenance',  label: 'Maintenance',  icon: '🔧' },
        ]
      });
      groups.push({
        label: 'Infrastructure',
        items: [
          { id: 'infrastructure', label: 'Infrastructure', icon: '🏗' },
          { id: 'drones',         label: 'Drones',         icon: '🚁' },
          { id: 'customs',        label: 'Customs & Border',icon: '🛂' },
        ]
      });
      groups.push({
        label: 'Intelligence',
        items: [
          { id: 'advanced-security',      label: 'Security',          icon: '🔐' },
          { id: 'ai-conflict-prediction', label: 'AI Conflict',        icon: '🤖' },
          { id: 'virtual-assistant',      label: 'Virtual Assistant',  icon: '🎙' },
        ]
      });
      groups.push({
        label: 'System',
        items: [
          { id: 'module-management', label: 'Modules',  icon: '⚙' },
          { id: 'security',          label: 'Security', icon: '🔒' },
        ]
      });
    }

    if (role === 'passenger') {
      groups.push({
        label: 'My Travel',
        items: [
          { id: 'my-bookings', label: 'My Bookings', icon: '🎫' },
          { id: 'my-baggage',  label: 'My Baggage',  icon: '🧳' },
        ]
      });
    }

    return groups;
  }

  setupEventListeners(): void {
    const allIds: DashboardView[] = [
      'overview', 'flights', 'passengers', 'infrastructure', 'infrastructure-reports',
      'drones', 'drone-reports', 'customs', 'customs-reports', 'advanced-security',
      'advanced-security-reports', 'ai-conflict-prediction', 'ai-reports',
      'virtual-assistant', 'module-management', 'maintenance', 'security',
      'my-bookings', 'my-baggage',
    ];
    allIds.forEach(id => {
      document.getElementById(`${id}-btn`)?.addEventListener('click', () => {
        this.currentView = id;
        this.onViewChange(id);
      });
    });
  }

  updateCurrentView(view: DashboardView): void {
    this.currentView = view;
  }
}
