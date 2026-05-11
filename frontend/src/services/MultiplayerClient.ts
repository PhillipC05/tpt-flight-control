/**
 * Multiplayer Client
 * Frontend client for collaborative scenario operations
 */

import { ApiService } from './ApiService.js';

export interface MultiplayerSession {
  id: number;
  session_name: string;
  join_code: string;
  max_players: number;
  status: 'waiting' | 'playing' | 'finished';
  scenario_id: number;
  scenario_name: string;
  player_count: number;
  is_private: boolean;
  created_at: string;
  started_at?: string;
  settings: any;
}

export interface MultiplayerPlayer {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: 'host' | 'player';
  player_state: any;
  joined_at: string;
}

export interface MultiplayerEvent {
  id: number;
  event_type: string;
  event_data: any;
  sender_id: number;
  created_at: string;
}

export class MultiplayerClient {
  private apiService: ApiService;
  private currentSessionId: number | null = null;
  private lastEventId: number = 0;
  private pollInterval: number | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();
  private players: Map<number, MultiplayerPlayer> = new Map();

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  /**
   * Create new multiplayer session
   */
  async createSession(scenarioId: number, sessionName: string, maxPlayers = 4, isPrivate = false, settings = {}): Promise<{ session_id: number; session_code: string }> {
    const response = await this.apiService.post<{ session_id: number; session_code: string }>('/multiplayer?action=create', {
      scenario_id: scenarioId,
      session_name: sessionName,
      max_players: maxPlayers,
      is_private: isPrivate,
      settings
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create session');
    }

    this.currentSessionId = response.data.session_id;
    this.startEventPolling();
    
    return {
      session_id: response.data.session_id,
      session_code: response.data.session_code
    };
  }

  /**
   * Join existing session with code
   */
  async joinSession(sessionCode: string): Promise<number> {
    const response = await this.apiService.post<{ session_id: number }>('/multiplayer?action=join', {
      session_code: sessionCode
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to join session');
    }

    this.currentSessionId = response.data.session_id;
    this.startEventPolling();
    
    return response.data.session_id;
  }

  /**
   * Leave current session
   */
  async leaveSession(): Promise<void> {
    if (!this.currentSessionId) return;

    await this.apiService.post('/multiplayer?action=leave', {
      session_id: this.currentSessionId
    });

    this.stopEventPolling();
    this.currentSessionId = null;
    this.players.clear();
    this.lastEventId = 0;
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(): Promise<MultiplayerSession[]> {
    const response = await this.apiService.get<{ sessions: MultiplayerSession[] }>('/multiplayer?action=sessions');
    if (!response.success || !response.data) {
      return [];
    }
    return response.data.sessions;
  }

  /**
   * Get current session details
   */
  async getSessionDetails(): Promise<MultiplayerSession> {
    if (!this.currentSessionId) throw new Error('Not in session');
    
    const response = await this.apiService.get<MultiplayerSession>(`/multiplayer?action=session&id=${this.currentSessionId}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get session details');
    }
    return response.data;
  }

  /**
   * Get session players
   */
  async getPlayers(): Promise<MultiplayerPlayer[]> {
    if (!this.currentSessionId) throw new Error('Not in session');
    
    const response = await this.apiService.get<{ players: MultiplayerPlayer[] }>(`/multiplayer?action=players&session_id=${this.currentSessionId}`);
    if (!response.success || !response.data) {
      return [];
    }
    
    response.data.players.forEach((player: MultiplayerPlayer) => {
      this.players.set(player.user_id, player);
    });

    return response.data.players;
  }

  /**
   * Send event to session
   */
  async sendEvent(eventType: string, eventData: any, targetPlayers?: number[]): Promise<number> {
    if (!this.currentSessionId) throw new Error('Not in session');

    const response = await this.apiService.post<{ event_id: number }>('/multiplayer?action=send_event', {
      session_id: this.currentSessionId,
      event_type: eventType,
      event_data: eventData,
      target_players: targetPlayers
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to send event');
    }

    return response.data.event_id;
  }

  /**
   * Update player state
   */
  async updatePlayerState(playerState: any): Promise<void> {
    if (!this.currentSessionId) throw new Error('Not in session');

    await this.apiService.post('/multiplayer?action=update_player', {
      session_id: this.currentSessionId,
      player_state: playerState
    });
  }

  /**
   * Start scenario
   */
  async startScenario(): Promise<void> {
    if (!this.currentSessionId) throw new Error('Not in session');

    await this.apiService.post('/multiplayer?action=start_scenario', {
      session_id: this.currentSessionId
    });
  }

  /**
   * End scenario
   */
  async endScenario(): Promise<void> {
    if (!this.currentSessionId) throw new Error('Not in session');

    await this.apiService.post('/multiplayer?action=end_scenario', {
      session_id: this.currentSessionId
    });
  }

  /**
   * Get user status
   */
  async getUserStatus(): Promise<{ in_session: boolean; session_id: number | null; role: string | null }> {
    const response = await this.apiService.get<{ in_session: boolean; session_id: number | null; role: string | null }>('/multiplayer?action=status');
    if (!response.success || !response.data) {
      return { in_session: false, session_id: null, role: null };
    }
    return response.data;
  }

  /**
   * Register event handler
   */
  on(eventType: string, handler: Function): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Remove event handler
   */
  off(eventType: string, handler: Function): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Start event polling
   */
  private startEventPolling(): void {
    if (this.pollInterval) return;

    this.pollInterval = window.setInterval(async () => {
      try {
        await this.pollEvents();
      } catch (error) {
        console.error('Multiplayer polling error:', error);
      }
    }, 1000);
  }

  /**
   * Stop event polling
   */
  private stopEventPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Poll for new events
   */
  private async pollEvents(): Promise<void> {
    if (!this.currentSessionId) return;

    const response = await this.apiService.get<{ events: MultiplayerEvent[] }>(
      `/multiplayer?action=events&session_id=${this.currentSessionId}&last_event_id=${this.lastEventId}`
    );

    if (!response.success || !response.data) return;

    for (const event of response.data.events) {
      this.lastEventId = Math.max(this.lastEventId, event.id);
      this.emitEvent(event);
    }
  }

  /**
   * Emit event to handlers
   */
  private emitEvent(event: MultiplayerEvent): void {
    // Global event handlers
    const globalHandlers = this.eventHandlers.get('*') || [];
    globalHandlers.forEach(handler => handler(event));

    // Specific event handlers
    const typeHandlers = this.eventHandlers.get(event.event_type) || [];
    typeHandlers.forEach(handler => handler(event));
  }

  /**
   * Get current session id
   */
  getSessionId(): number | null {
    return this.currentSessionId;
  }

  /**
   * Check if connected
   */
  isInSession(): boolean {
    return this.currentSessionId !== null;
  }

  /**
   * Cleanup client
   */
  destroy(): void {
    this.stopEventPolling();
    this.eventHandlers.clear();
    this.players.clear();
    this.currentSessionId = null;
  }
}