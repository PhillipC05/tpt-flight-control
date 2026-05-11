import './style.css'
import { AuthManager, AuthUI } from './auth.js'
import { DashboardManager } from './dashboard/DashboardManager.js'
import { ThemeManager } from './services/ThemeManager.js'

ThemeManager.getInstance();

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}



// Global error handling
window.addEventListener('error', (_event) => {
  console.error('Global error occurred');
  // Could send to monitoring service
});

window.addEventListener('unhandledrejection', (_event) => {
  console.error('Unhandled promise rejection occurred');
  // Could send to monitoring service
});



// App initialization
class FlightControlApp {
  private app: HTMLElement;
  private auth: AuthManager;
  private authUI: AuthUI;
  private dashboard: DashboardManager;
  constructor() {
    this.app = document.querySelector<HTMLDivElement>('#app')!;
    this.auth = AuthManager.getInstance();
    this.authUI = new AuthUI(this.app);
    this.dashboard = new DashboardManager(this.app);
    this.init().catch(error => {
      console.error('[FlightControlApp] Failed to initialize app:', error);
    });
  }

  private async init() {
    const authenticated = this.auth.isAuthenticated();
    if (authenticated) {
      await this.showDashboard();
    } else {
      this.showLogin();
    }
  }

  private async showDashboard() {
    try {
      await this.dashboard.render();
    } catch (error) {
      console.error('[FlightControlApp] showDashboard() error:', error);
      throw error;
    }
  }

  private showLogin() {
    this.authUI.renderLoginForm();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new FlightControlApp();
});
