interface AnalyticsEvent {
  type: 'session_start' | 'retry' | 'score_submit' | 'fps_sample' | 'memory_sample' | 'error';
  payload?: any;
  timestamp?: number;
}

export class Analytics {
  private static events: AnalyticsEvent[] = [];

  public static send(event: Omit<AnalyticsEvent, 'timestamp'>): void {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);

    if (import.meta.env.DEV) {
      console.log('Analytics Event:', fullEvent);
    } else {
      // In production, this would send to your analytics service
      // Example: sendToAnalyticsService(fullEvent);
    }
  }

  public static getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  public static clearEvents(): void {
    this.events.length = 0;
  }

  // Stub for production analytics integration
  private static sendToAnalyticsService(event: AnalyticsEvent): void {
    // Implement your analytics service integration here
    // e.g., Google Analytics, Mixpanel, etc.
  }
}