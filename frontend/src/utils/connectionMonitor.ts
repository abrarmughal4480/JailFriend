'use client';

interface ConnectionMonitorConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  onConnectionLost: () => void;
  onReconnecting: (attempt: number) => void;
  onReconnected: () => void;
  onReconnectionFailed: () => void;
}

class ConnectionMonitor {
  private config: ConnectionMonitorConfig;
  private retryCount: number = 0;
  private isReconnecting: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connectionCheckInterval: NodeJS.Timeout | null = null;
  private lastConnectionTime: number = Date.now();
  private connectionLostCallback: (() => void) | null = null;

  constructor(config: ConnectionMonitorConfig) {
    this.config = config;
  }

  /**
   * Start monitoring the connection
   */
  startMonitoring(peerConnection: RTCPeerConnection | null): void {
    if (!peerConnection) return;

    console.log('🔍 Starting connection monitoring...');
    
    // Monitor connection state changes
    peerConnection.onconnectionstatechange = () => {
      this.handleConnectionStateChange(peerConnection.connectionState);
    };

    // Monitor ICE connection state
    peerConnection.oniceconnectionstatechange = () => {
      this.handleIceConnectionStateChange(peerConnection.iceConnectionState);
    };

    // Start periodic connection health check
    this.startHealthCheck(peerConnection);
  }

  /**
   * Stop monitoring the connection
   */
  stopMonitoring(): void {
    console.log('🔍 Stopping connection monitoring...');
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }

    this.isReconnecting = false;
    this.retryCount = 0;
  }

  /**
   * Set callback for when connection is lost
   */
  setConnectionLostCallback(callback: () => void): void {
    this.connectionLostCallback = callback;
  }

  /**
   * Handle connection state changes
   */
  private handleConnectionStateChange(state: string): void {
    console.log('🔍 Connection state changed:', state);
    
    switch (state) {
      case 'connected':
        this.handleConnected();
        break;
      case 'disconnected':
      case 'failed':
        this.handleDisconnected();
        break;
      case 'connecting':
        console.log('🔄 Connection in progress...');
        break;
    }
  }

  /**
   * Handle ICE connection state changes
   */
  private handleIceConnectionStateChange(state: string): void {
    console.log('🔍 ICE connection state changed:', state);
    
    switch (state) {
      case 'connected':
      case 'completed':
        this.handleConnected();
        break;
      case 'disconnected':
      case 'failed':
        this.handleDisconnected();
        break;
      case 'checking':
        console.log('🔄 ICE connection checking...');
        break;
    }
  }

  /**
   * Handle successful connection
   */
  private handleConnected(): void {
    console.log('✅ Connection established successfully');
    this.lastConnectionTime = Date.now();
    this.retryCount = 0;
    this.isReconnecting = false;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.config.onReconnected();
  }

  /**
   * Handle connection loss
   */
  private handleDisconnected(): void {
    console.log('❌ Connection lost, attempting reconnection...');
    
    if (this.isReconnecting) {
      console.log('🔄 Already reconnecting, skipping...');
      return;
    }

    this.isReconnecting = true;
    this.config.onConnectionLost();
    
    if (this.connectionLostCallback) {
      this.connectionLostCallback();
    }

    this.attemptReconnection();
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnection(): void {
    if (this.retryCount >= this.config.maxRetries) {
      console.log('❌ Maximum reconnection attempts reached');
      this.config.onReconnectionFailed();
      this.isReconnecting = false;
      return;
    }

    this.retryCount++;
    const delay = Math.min(
      this.config.baseDelay * Math.pow(2, this.retryCount - 1),
      this.config.maxDelay
    );

    console.log(`🔄 Reconnection attempt ${this.retryCount}/${this.config.maxRetries} in ${delay}ms`);
    this.config.onReconnecting(this.retryCount);

    this.reconnectTimeout = setTimeout(() => {
      this.triggerReconnection();
    }, delay);
  }

  /**
   * Trigger the actual reconnection
   */
  private triggerReconnection(): void {
    console.log('🔄 Triggering reconnection...');
    
    // Emit a custom event that the WebRTC hook can listen to
    const event = new CustomEvent('connection-reconnect', {
      detail: {
        attempt: this.retryCount,
        maxRetries: this.config.maxRetries
      }
    });
    
    window.dispatchEvent(event);
  }

  /**
   * Start periodic health check
   */
  private startHealthCheck(peerConnection: RTCPeerConnection): void {
    this.connectionCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastConnection = now - this.lastConnectionTime;
      
      // If no connection activity for more than 30 seconds, consider it lost
      if (timeSinceLastConnection > 30000 && peerConnection.connectionState === 'connected') {
        console.log('🔍 Connection appears stale, checking health...');
        
        // Try to get connection stats to verify health
        peerConnection.getStats().then(stats => {
          let hasActiveConnection = false;
          
          stats.forEach(report => {
            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
              hasActiveConnection = true;
            }
          });
          
          if (!hasActiveConnection) {
            console.log('❌ No active connection found in stats');
            this.handleDisconnected();
          } else {
            this.lastConnectionTime = now;
          }
        }).catch(error => {
          console.log('❌ Error getting connection stats:', error);
          this.handleDisconnected();
        });
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Reset retry count (useful when connection is manually restored)
   */
  resetRetryCount(): void {
    this.retryCount = 0;
    this.isReconnecting = false;
  }

  /**
   * Get current reconnection status
   */
  getReconnectionStatus(): {
    isReconnecting: boolean;
    retryCount: number;
    maxRetries: number;
  } {
    return {
      isReconnecting: this.isReconnecting,
      retryCount: this.retryCount,
      maxRetries: this.config.maxRetries
    };
  }
}

export default ConnectionMonitor;
