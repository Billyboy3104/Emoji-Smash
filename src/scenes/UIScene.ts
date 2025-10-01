import Phaser from 'phaser';
import { LanguageManager } from '../utils/LanguageManager';

export class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private score: number = 0;
  private comboText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'ui' });
  }

  create(): void {
    const t = LanguageManager.getText();

    // Reset score when UI scene is created
    this.score = 0;

    // Add colorful UI background
    const uiBackground = this.add.graphics();
    uiBackground.fillStyle(0x000000, 0.3);
    uiBackground.fillRoundedRect(50, 50, 620, 150, 20);
    
    // Create score display
    this.scoreText = this.add.text(360, 90, `${t.score}: 0`, {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
      stroke: '#ff6b9d',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Create timer display
    this.timerText = this.add.text(360, 140, `${t.time}: 30`, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
      stroke: '#4ecdc4',
      strokeThickness: 3,
    }).setOrigin(0.5);
    
    // Create combo display
    this.comboText = this.add.text(360, 180, `${t.combo}: 0`, {
      fontSize: '24px',
      color: '#feca57',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Listen for game events
    this.game.events.on('score:add', this.onScoreAdd, this);
    this.game.events.on('timer:update', this.onTimerUpdate, this);
    this.game.events.on('combo:update', this.onComboUpdate, this);
    
    // Add pulsing animation to score text
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private onScoreAdd(points: number): void {
    const t = LanguageManager.getText();
    this.score += points;
    this.scoreText.setText(`${t.score}: ${this.score}`);
    
    // Add score popup animation
    const scorePopup = this.add.text(360, 90, `+${points}`, {
      fontSize: '24px',
      color: '#feca57',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: scorePopup,
      y: 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => scorePopup.destroy()
    });
  }

  private onTimerUpdate(timeLeft: number): void {
    const t = LanguageManager.getText();
    this.timerText.setText(`${t.time}: ${timeLeft}`);
    
    // Change color when time is running out
    if (timeLeft <= 5) {
      this.timerText.setColor('#ff4444');
      this.timerText.setStroke('#ffffff', 3);
      // Add urgent pulsing
      this.tweens.add({
        targets: this.timerText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      });
    } else if (timeLeft <= 10) {
      this.timerText.setColor('#ffaa44');
      this.timerText.setStroke('#4ecdc4', 3);
    } else {
      this.timerText.setColor('#ffffff');
      this.timerText.setStroke('#4ecdc4', 3);
    }
  }
  
  private onComboUpdate(combo: number): void {
    const t = LanguageManager.getText();
    this.comboText.setText(`${t.combo}: ${combo}`);
    
    if (combo > 0) {
      // コンボが高いほど派手なエフェクト
      const intensity = Math.min(combo / 10, 2); // 最大2倍まで
      const scale = 1.2 + (intensity * 0.3); // スケール効果を控えめに
      
      // Add combo celebration animation
      this.tweens.add({
        targets: this.comboText,
        scaleX: scale,
        scaleY: scale,
        duration: 200, // 少し長めにしてスムーズに
        yoyo: true,
        ease: 'Sine.easeInOut' // より滑らかなイージング
      });
      
      // 高コンボ時の色変化
      if (combo >= 10) {
        this.comboText.setColor('#ff6b9d'); // ピンク
      } else if (combo >= 5) {
        this.comboText.setColor('#4ecdc4'); // ティール
      } else {
        this.comboText.setColor('#feca57'); // イエロー
      }
    }
  }

  shutdown(): void {
    // Clean up event listeners
    this.game.events.off('score:add', this.onScoreAdd, this);
    this.game.events.off('timer:update', this.onTimerUpdate, this);
    this.game.events.off('combo:update', this.onComboUpdate, this);
  }
}