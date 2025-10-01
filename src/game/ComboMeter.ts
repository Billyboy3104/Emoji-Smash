export class ComboMeter {
  private currentCombo: number = 0;
  private longestCombo: number = 0;
  private allTimeRecord: number = 0;
  private gameEvents: Phaser.Events.EventEmitter;

  constructor(gameEvents?: Phaser.Events.EventEmitter) {
    this.gameEvents = gameEvents || new Phaser.Events.EventEmitter();
  }

  public updateCombo(destroyedCount: number): void {
    // Validate input
    if (typeof destroyedCount !== 'number' || destroyedCount < 0) {
      console.warn('Invalid destroyedCount:', destroyedCount);
      return;
    }
    
    if (destroyedCount >= 2) {
      this.currentCombo++;
      this.longestCombo = Math.max(this.longestCombo, this.currentCombo);
      this.allTimeRecord = Math.max(this.allTimeRecord, this.currentCombo);
      if (this.gameEvents) {
        this.gameEvents.emit('combo:update', this.currentCombo);
        
        // Emit special events for big combos
        if (this.currentCombo >= 12) {
          this.gameEvents.emit('combo:big', this.currentCombo);
        }
        if (this.currentCombo >= 20) {
          this.gameEvents.emit('combo:huge', this.currentCombo);
        }
      }
    } else {
      // コンボが途切れた場合のみリセット
      this.currentCombo = 0;
      if (this.gameEvents) {
        this.gameEvents.emit('combo:update', this.currentCombo);
      }
    }
  }

  public resetCombo(): void {
    this.currentCombo = 0;
    if (this.gameEvents) {
      this.gameEvents.emit('combo:update', this.currentCombo);
    }
  }

  public getCurrentCombo(): number {
    return this.currentCombo;
  }

  public getLongestCombo(): number {
    return this.longestCombo;
  }

  public getAllTimeRecord(): number {
    return this.allTimeRecord;
  }

  public reset(): void {
    this.currentCombo = 0;
    this.longestCombo = 0;
    // Don't reset all-time record
    if (this.gameEvents) {
      this.gameEvents.emit('combo:update', this.currentCombo);
    }
  }

  public resetForNewGame(): void {
    this.currentCombo = 0;
    this.longestCombo = 0;
    // Keep all-time record intact
    if (this.gameEvents) {
      this.gameEvents.emit('combo:update', this.currentCombo);
    }
  }
}