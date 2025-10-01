import Phaser from 'phaser';
import { LanguageManager } from '../utils/LanguageManager';

export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'start' });
  }

  create(): void {
    // Load saved language
    LanguageManager.loadLanguage();
    const t = LanguageManager.getText();

    // 背景グラデーション
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x667eea, 0x667eea, 0x764ba2, 0x764ba2);
    graphics.fillRect(0, 0, 720, 1280);

    // Language toggle button
    const currentLang = LanguageManager.getCurrentLanguage();
    const langButton = this.add.graphics();
    langButton.fillStyle(0x4ecdc4, 1);
    langButton.fillRoundedRect(580, 50, 80, 40, 20);
    
    const langText = this.add.text(620, 70, currentLang.toUpperCase(), {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const langZone = this.add.zone(620, 70, 80, 40);
    langZone.setInteractive();
    
    langZone.on('pointerdown', () => {
      const newLang = currentLang === 'ja' ? 'en' : 'ja';
      LanguageManager.setLanguage(newLang);
      this.scene.restart();
    });

    // タイトル
    this.add.text(360, 200, t.gameTitle, {
      fontSize: '64px',
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
      stroke: '#ff6b9d',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // サブタイトル
    this.add.text(360, 280, t.gameSubtitle, {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // ルール説明背景
    const rulesBg = this.add.graphics();
    rulesBg.fillStyle(0x000000, 0.3);
    rulesBg.fillRoundedRect(60, 350, 600, 500, 20);

    // ルールタイトル
    this.add.text(360, 390, t.gameRules, {
      fontSize: '38px',
      color: '#feca57',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // ルール説明
    t.rules.forEach((rule, index) => {
      this.add.text(90, 450 + index * 60, rule, {
        fontSize: currentLang === 'ja' ? '26px' : '24px',
        color: '#ffffff',
        fontFamily: currentLang === 'ja' ? 'Arial, sans-serif' : 'Arial Black, sans-serif',
        fontStyle: 'bold',
      });
    });

    // アイテム効果説明背景
    const itemsBg = this.add.graphics();
    itemsBg.fillStyle(0x000000, 0.3);
    itemsBg.fillRoundedRect(60, 870, 600, 200, 20);

    // アイテム説明
    this.add.text(360, 900, t.itemEffects, {
      fontSize: '34px',
      color: '#4ecdc4',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    t.items.forEach((item, index) => {
      this.add.text(90, 940 + index * 45, item, {
        fontSize: currentLang === 'ja' ? '22px' : '22px',
        color: '#ffffff',
        fontFamily: currentLang === 'ja' ? 'Arial, sans-serif' : 'Arial Black, sans-serif',
        fontStyle: currentLang === 'ja' ? 'bold' : 'normal',
      });
    });

    // スタートボタン
    const startButton = this.add.graphics();
    startButton.fillStyle(0xff6b9d, 1);
    startButton.fillRoundedRect(210, 1120, 300, 80, 40);
    
    const startText = this.add.text(360, 1160, t.startGame, {
      fontSize: '34px',
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // ボタンのインタラクティブ設定
    const buttonZone = this.add.zone(360, 1160, 300, 80);
    buttonZone.setInteractive();
    
    // ホバーエフェクト
    buttonZone.on('pointerover', () => {
      startButton.clear();
      startButton.fillStyle(0xff8fb3, 1);
      startButton.fillRoundedRect(210, 1120, 300, 80, 40);
      startText.setScale(1.1);
    });

    buttonZone.on('pointerout', () => {
      startButton.clear();
      startButton.fillStyle(0xff6b9d, 1);
      startButton.fillRoundedRect(210, 1120, 300, 80, 40);
      startText.setScale(1);
    });

    // クリックでゲーム開始
    buttonZone.on('pointerdown', () => {
      this.scene.start('game');
    });

    // 装飾的な絵文字
    const decorEmojis = ['😀', '😎', '😡', '😱', '😍'];
    for (let i = 0; i < 35; i++) {
      const emoji = decorEmojis[Math.floor(Math.random() * decorEmojis.length)];
      const x = 50 + Math.random() * 620;
      const y = 50 + Math.random() * 1180;
      
      const emojiText = this.add.text(x, y, emoji, {
        fontSize: '32px',
      }).setOrigin(0.5).setAlpha(0.3);

      // ゆっくり回転
      this.tweens.add({
        targets: emojiText,
        rotation: Math.PI * 2,
        duration: 8000 + Math.random() * 4000,
        repeat: -1,
        ease: 'Linear'
      });
    }
  }
}