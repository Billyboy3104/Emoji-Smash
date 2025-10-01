import Phaser from 'phaser';
import { EmojiField } from '../game/EmojiField';
import { ComboMeter } from '../game/ComboMeter';
import { ParticlePool } from '../game/ParticlePool';
import { Analytics } from '../analytics/Analytics';
import { TestBot } from '../test/TestBot';
import { PerfProbe } from '../test/PerfProbe';

export class GameScene extends Phaser.Scene {
  private emojiField!: EmojiField;
  private timer: number = 20;
  private timerEvent!: Phaser.Time.TimerEvent;
  private comboMeter!: ComboMeter;
  private backgroundGraphics!: Phaser.GameObjects.Graphics;
  private backgroundTween!: Phaser.Tweens.Tween;
  private currentScore: number = 0;
  private particlePool!: ParticlePool;
  private gameEnded: boolean = false;
  private testBot?: TestBot;
  private perfProbe?: PerfProbe;

  constructor() {
    super({ key: 'game' });
  }

  create(): void {
    // Create static pop background
    this.createStaticBackground();
    
    // Reset score at the start of each game session
    this.currentScore = 0;
    this.gameEnded = false;
    
    // Start UI scene as overlay
    this.scene.launch('ui');

    // Initialize game components
    this.comboMeter = new ComboMeter(this.game.events);
    this.comboMeter.resetForNewGame(); // Ensure combo is reset for new game
    this.particlePool = new ParticlePool(this);
    
    // Create emoji field
    this.emojiField = new EmojiField(this, 360, 640);

    // Set up unified input handling
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleTap(pointer.x, pointer.y);
    });

    // Start timer
    // Add small delay to ensure UIScene is fully initialized
    this.time.delayedCall(100, () => {
      this.startTimer();
    });

    // Analytics
    Analytics.send({ type: 'session_start' });

    // Listen for combo events
    this.game.events.on('combo:big', this.onBigCombo, this);
    this.game.events.on('combo:huge', this.onHugeCombo, this);
    this.events.on('item:used', this.onItemUsed, this);

    // Initialize TestBot if URL parameter is present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('bot') === '1') {
      this.testBot = new TestBot((x, y) => this.handleTap(x, y), { interval: 150 });
      this.testBot.start();
      console.log('🤖 TestBot activated!');
    }

    // Initialize PerfProbe
    this.perfProbe = new PerfProbe();
    this.perfProbe.start();

    // Global error handling
    window.addEventListener('error', (event) => {
      Analytics.send({
        type: 'error',
        payload: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });
  }

  private handleTap(x: number, y: number): void {
    this.emojiField.onTap(x, y, (destroyedCount: number) => {
      this.onEmojiDestroyed(destroyedCount);
    });
  }

  private createStaticBackground(): void {
    this.backgroundGraphics = this.add.graphics();
    
    // Create static colorful background circles
    const colors = [
      0xff6b9d, // Pink
      0x4ecdc4, // Teal
      0x45b7d1, // Blue
      0x96ceb4, // Green
      0xfeca57, // Yellow
      0xff9ff3, // Purple
    ];

    // Create static background circles
    for (let i = 0; i < 8; i++) {
      const color = colors[i % colors.length];
      const x = Math.random() * 720;
      const y = Math.random() * 1280;
      const radius = 100 + Math.random() * 150;
      
      this.backgroundGraphics.fillStyle(color, 0.3);
      this.backgroundGraphics.fillCircle(x, y, radius);
    }
  }
  
  private startTimer(): void {
    this.timer = 30;
    this.game.events.emit('timer:update', this.timer);

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      repeat: this.timer - 1,
      callback: () => {
        this.timer--;
        this.game.events.emit('timer:update', this.timer);

        if (this.timer <= 0) {
          this.endGame();
        }
      }
    });
  }

  private onEmojiDestroyed(destroyedCount: number): void {
    if (destroyedCount > 0) {
      // Update combo first
      this.comboMeter.updateCombo(destroyedCount);
      
      // コンボに基づく追加エフェクト
      const currentCombo = this.comboMeter.getCurrentCombo();
      
      // アイテム取得チェック（4コンボ以上で取得）
      if (currentCombo >= 4) {
        this.emojiField.addRandomItem();
      }
      
      // Add screen flash effect for large groups
      if (destroyedCount >= 4) {
        // Add particle burst for big groups
        this.particlePool.spawnBurst(
          360 + (Math.random() - 0.5) * 200,
          640 + (Math.random() - 0.5) * 200,
          '#feca57',
          destroyedCount * 2
        );
        
        // Add screen shake for extra impact
        const shakeIntensity = 0.02 + (currentCombo * 0.005); // コンボが高いほど強い揺れ
        this.cameras.main.shake(300, Math.min(shakeIntensity, 0.1));
      }
      
      // Calculate score (コンボボーナス追加)
      const basePoints = destroyedCount * destroyedCount * 10;
      const comboBonus = currentCombo > 0 ? currentCombo * 50 : 0;
      const points = basePoints + comboBonus;
      this.currentScore += points;
      this.game.events.emit('score:add', points);

      // Apply slow motion effect for large groups
      if (destroyedCount >= 6 || currentCombo >= 8) {
        this.applySloMo();
        
        // Massive particle burst
        this.particlePool.spawnBurst(360, 640, '#ff6b9d', 20);
      }
    }
  }


  private onBigCombo(combo: number): void {
    // Screen shake intensity based on combo
    const intensity = Math.min(0.02 + (combo * 0.003), 0.08);
    this.cameras.main.shake(400, intensity);
    
    // Particle burst
    this.particlePool.spawnBurst(360, 400, '#4ecdc4', combo * 2);
    
    // Optional haptic feedback (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  }

  private onHugeCombo(combo: number): void {
    // Massive screen shake
    this.cameras.main.shake(600, 0.1);
    
    // Multiple particle bursts
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 100, () => {
        this.particlePool.spawnBurst(360, 640, '#ff6b9d', 15);
      });
    }
  }

  private applySloMo(): void {
    this.physics.world.timeScale = 0.6;
    this.time.timeScale = 0.6;

    this.time.delayedCall(700, () => {
      this.physics.world.timeScale = 1;
      this.time.timeScale = 1;
    });
  }

  private onItemUsed(data: { type: string; destroyedCount: number }): void {
    console.log('アイテム使用完了:', data.type, '破壊数:', data.destroyedCount);
    
    if (data.destroyedCount > 0) {
      // アイテム使用によるスコア加算
      const itemBonus = data.destroyedCount * 20; // アイテムボーナス
      this.currentScore += itemBonus;
      this.game.events.emit('score:add', itemBonus);
      
      // 特殊エフェクト
      this.cameras.main.flash(150, 255, 255, 255, false);
      this.particlePool.spawnBurst(360, 640, '#feca57', data.destroyedCount);
    }
  }

  private endGame(): void {
    if (this.gameEnded) return;
    this.gameEnded = true;
    
    const longestCombo = this.comboMeter.getLongestCombo();
    const allTimeRecord = this.comboMeter.getAllTimeRecord();
    
    Analytics.send({ 
      type: 'score_submit', 
      payload: { score: this.currentScore, combo: longestCombo } 
    });

    // Stop UI scene and start game over scene
    this.scene.stop('ui');
    this.scene.start('gameover', { 
      score: this.currentScore, 
      combo: longestCombo,
      allTimeRecord: allTimeRecord
    });
  }

  shutdown(): void {
    // Stop TestBot and PerfProbe
    if (this.testBot) {
      this.testBot.stop();
    }
    if (this.perfProbe) {
      this.perfProbe.stop();
    }

    if (this.timerEvent) {
      this.timerEvent.destroy();
    }
    if (this.backgroundTween) {
      this.backgroundTween.destroy();
    }
    
    // Clean up event listeners
    this.game.events.off('combo:big', this.onBigCombo, this);
    this.game.events.off('combo:huge', this.onHugeCombo, this);
    this.events.off('item:used', this.onItemUsed, this);
    
    // Reset particle pool
    if (this.particlePool) {
      this.particlePool.reset();
    }
  }
}