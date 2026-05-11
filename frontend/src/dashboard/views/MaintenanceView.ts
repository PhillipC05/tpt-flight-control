import { DashboardApiService } from '../services/DashboardApiService.js';
import type { User } from '../types.js';

interface MaintenanceTask {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'deferred';
  assigned_to?: string;
  location?: string;
  scheduled_date?: string;
  completed_date?: string;
  created_at: string;
}

const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high:     'bg-orange-100 text-orange-800',
  medium:   'bg-yellow-100 text-yellow-800',
  low:      'bg-green-100 text-green-800',
};

const STATUS_BADGE: Record<string, string> = {
  pending:     'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed:   'bg-green-100 text-green-800',
  deferred:    'bg-purple-100 text-purple-800',
};

export class MaintenanceView {
  private apiService: DashboardApiService;

  constructor(_container: HTMLElement) {
    this.apiService = new DashboardApiService();
  }

  async render(_user: User): Promise<string> {
    let tasks: MaintenanceTask[] = [];
    let loadError = false;

    try {
      const data = await this.apiService.callApi('/api/maintenance.php?action=list');
      tasks = data.tasks || [];
    } catch {
      loadError = true;
    }

    const pending    = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const critical   = tasks.filter(t => t.priority === 'critical').length;
    const completed  = tasks.filter(t => t.status === 'completed').length;

    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold fc-text-primary">Maintenance Management</h2>
          <button id="add-maintenance-btn"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            + New Task
          </button>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${this.statCard('Pending',      pending.toString(),     'text-yellow-400')}
          ${this.statCard('In Progress',  inProgress.toString(),  'text-blue-400')}
          ${this.statCard('Critical',     critical.toString(),    'text-red-400')}
          ${this.statCard('Completed',    completed.toString(),   'text-green-400')}
        </div>

        <!-- Filter bar -->
        <div class="flex items-center gap-3 flex-wrap">
          <select id="maintenance-status-filter"
            class="px-3 py-2 fc-card border fc-divider rounded-lg text-sm fc-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="deferred">Deferred</option>
          </select>
          <select id="maintenance-priority-filter"
            class="px-3 py-2 fc-card border fc-divider rounded-lg text-sm fc-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <!-- Task list -->
        ${loadError
          ? '<div class="fc-card rounded-xl p-8 text-center fc-text-muted">Unable to load maintenance tasks. Backend endpoint may not be configured yet.</div>'
          : tasks.length === 0
            ? '<div class="fc-card rounded-xl p-8 text-center fc-text-muted">No maintenance tasks found.</div>'
            : `<div id="maintenance-task-list" class="space-y-3">
                ${tasks.map(t => this.renderTaskCard(t)).join('')}
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

  private renderTaskCard(task: MaintenanceTask): string {
    const priorityCls = PRIORITY_BADGE[task.priority] ?? 'bg-gray-100 text-gray-800';
    const statusCls   = STATUS_BADGE[task.status]   ?? 'bg-gray-100 text-gray-800';
    const date = task.scheduled_date
      ? new Date(task.scheduled_date).toLocaleDateString()
      : 'Not scheduled';

    return `
      <div class="fc-card rounded-xl p-5 border fc-divider maintenance-task-card"
           data-status="${task.status}" data-priority="${task.priority}">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span class="text-sm font-semibold fc-text-primary">${task.title}</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium ${priorityCls}">
                ${task.priority}
              </span>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium ${statusCls}">
                ${task.status}
              </span>
            </div>
            <p class="text-sm fc-text-muted truncate">${task.description || 'No description'}</p>
            <div class="flex items-center gap-4 mt-2 text-xs fc-text-muted flex-wrap">
              ${task.location ? `<span>📍 ${task.location}</span>` : ''}
              ${task.assigned_to ? `<span>👤 ${task.assigned_to}</span>` : ''}
              <span>📅 ${date}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button class="edit-maintenance-task text-xs px-3 py-1.5 rounded-lg fc-card border fc-divider fc-text-secondary hover:fc-accent-bg transition-colors"
                    data-id="${task.id}">Edit</button>
            ${task.status !== 'completed'
              ? `<button class="complete-maintenance-task text-xs px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
                         data-id="${task.id}">Complete</button>`
              : ''}
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners(): void {
    document.getElementById('add-maintenance-btn')?.addEventListener('click', () => {
      this.openAddTaskModal();
    });

    const statusFilter = document.getElementById('maintenance-status-filter') as HTMLSelectElement;
    const priorityFilter = document.getElementById('maintenance-priority-filter') as HTMLSelectElement;

    const applyFilter = () => {
      const status = statusFilter?.value ?? '';
      const priority = priorityFilter?.value ?? '';
      document.querySelectorAll<HTMLElement>('.maintenance-task-card').forEach(card => {
        const matchStatus   = !status   || card.dataset.status   === status;
        const matchPriority = !priority || card.dataset.priority === priority;
        card.style.display = matchStatus && matchPriority ? '' : 'none';
      });
    };

    statusFilter?.addEventListener('change', applyFilter);
    priorityFilter?.addEventListener('change', applyFilter);

    document.querySelectorAll('.complete-maintenance-task').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = (e.target as HTMLElement).dataset.id;
        if (!id) return;
        try {
          await this.apiService.callApi(`/api/maintenance.php?action=complete&id=${id}`, 'POST');
          window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'maintenance' } }));
        } catch {
          alert('Failed to mark task as complete.');
        }
      });
    });
  }

  private openAddTaskModal(): void {
    const html = `
      <div id="add-maintenance-modal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div class="fc-card rounded-2xl w-full max-w-md shadow-2xl">
          <div class="flex items-center justify-between p-5 border-b fc-divider">
            <h3 class="text-lg font-bold fc-text-primary">New Maintenance Task</h3>
            <button id="close-maintenance-modal" class="fc-text-muted hover:fc-text-primary text-xl">&times;</button>
          </div>
          <form id="add-maintenance-form" class="p-5 space-y-4">
            <div>
              <label class="block text-sm font-medium fc-text-secondary mb-1">Title</label>
              <input type="text" id="maint-title" required
                class="w-full px-3 py-2 fc-card border fc-divider rounded-lg text-sm fc-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium fc-text-secondary mb-1">Description</label>
              <textarea id="maint-description" rows="2"
                class="w-full px-3 py-2 fc-card border fc-divider rounded-lg text-sm fc-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium fc-text-secondary mb-1">Priority</label>
                <select id="maint-priority"
                  class="w-full px-3 py-2 fc-card border fc-divider rounded-lg text-sm fc-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium fc-text-secondary mb-1">Location</label>
                <input type="text" id="maint-location" placeholder="Gate, Terminal…"
                  class="w-full px-3 py-2 fc-card border fc-divider rounded-lg text-sm fc-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium fc-text-secondary mb-1">Scheduled Date</label>
              <input type="date" id="maint-date"
                class="w-full px-3 py-2 fc-card border fc-divider rounded-lg text-sm fc-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit"
                class="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm">
                Create Task
              </button>
              <button type="button" id="cancel-maintenance-modal"
                class="flex-1 py-2 fc-card border fc-divider rounded-lg fc-text-secondary hover:fc-text-primary text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    const close = () => document.getElementById('add-maintenance-modal')?.remove();
    document.getElementById('close-maintenance-modal')?.addEventListener('click', close);
    document.getElementById('cancel-maintenance-modal')?.addEventListener('click', close);

    document.getElementById('add-maintenance-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        title:          (document.getElementById('maint-title')       as HTMLInputElement).value,
        description:    (document.getElementById('maint-description') as HTMLTextAreaElement).value,
        priority:       (document.getElementById('maint-priority')    as HTMLSelectElement).value,
        location:       (document.getElementById('maint-location')    as HTMLInputElement).value,
        scheduled_date: (document.getElementById('maint-date')        as HTMLInputElement).value,
        status: 'pending',
      };
      try {
        await this.apiService.callApi('/api/maintenance.php?action=create', 'POST', payload);
        close();
        window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'maintenance' } }));
      } catch {
        alert('Failed to create maintenance task.');
      }
    });
  }
}
