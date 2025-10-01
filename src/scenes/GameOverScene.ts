import Phaser from 'phaser';
import { ShareCard } from '../utils/ShareCard';
import { LanguageManager } from '../utils/LanguageManager';

export class GameOverScene extends Phaser.Scene {
  private finalScore: number = 0;
  private longestCombo: number = 0;
  private allTimeRecord: number = 0;

  constructor() {
    super({ key: 'gameover' });
  }

  init(data: { score: number; combo: number; allTimeRecord: number }): void {
    this.finalScore = data.score || 0;
    this.longestCombo = data.combo || 0;
    this.allTimeRecord = data.allTimeRecord || 0;
  }

  create(): void {
    const t = LanguageManager.getText();

    // 背景グラデーション
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e);
    graphics.fillRect(0, 0, 720, 1280);

    // 結果表示背景
    const resultBg = this.add.graphics();
    resultBg.fillStyle(0x000000, 0.4);
    resultBg.fillRoundedRect(60, 200, 600, 600, 30);

    // ゲームオーバータイトル
    this.add.text(360, 280, t.gameOver, {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
      stroke: '#ff6b9d',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // 最終スコア表示
    this.add.text(360, 380, t.finalScore, {
      fontSize: '32px',
      color: '#feca57',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(360, 430, this.finalScore.toLocaleString(), {
      fontSize: '56px',
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
      stroke: '#feca57',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // 最高コンボ表示
    this.add.text(360, 520, t.bestCombo, {
      fontSize: '32px',
      color: '#4ecdc4',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const comboSuffix = LanguageManager.getCurrentLanguage() === 'ja' ? ' コンボ' : '';
    this.add.text(360, 570, `${this.longestCombo}${comboSuffix}`, {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
      stroke: '#4ecdc4',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // All-time record display (if different from current)
    if (this.allTimeRecord > this.longestCombo) {
      this.add.text(360, 620, `${t.allTimeRecord}: ${this.allTimeRecord}${comboSuffix}`, {
        fontSize: '24px',
        color: '#feca57',
        fontFamily: 'Arial Black, sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }

    // 評価メッセージ
    const evaluationMessage = LanguageManager.getEvaluationMessage(this.finalScore);
    this.add.text(360, this.allTimeRecord > this.longestCombo ? 680 : 650, evaluationMessage, {
      fontSize: '28px',
      color: '#ff6b9d',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 装飾絵文字
    const celebrationEmojis = LanguageManager.getCelebrationEmojis(this.finalScore);
    celebrationEmojis.forEach((emoji, index) => {
      const x = 200 + index * 80;
      const baseY = this.allTimeRecord > this.longestCombo ? 750 : 720;
      const emojiText = this.add.text(x, baseY, emoji, {
        fontSize: '40px',
      }).setOrigin(0.5);

      // 跳ねるアニメーション
      this.tweens.add({
        targets: emojiText,
        y: baseY - 20,
        duration: 800,
        yoyo: true,
        repeat: -1,
        delay: index * 200,
        ease: 'Bounce.easeOut'
      });
    });

    // シェアボタン
    const buttonY = this.allTimeRecord > this.longestCombo ? 880 : 850;
    const shareButton = this.add.graphics();
    shareButton.fillStyle(0x4ecdc4, 1);
    shareButton.fillRoundedRect(80, buttonY, 250, 70, 35);
    
    const shareText = this.add.text(205, buttonY + 35, t.share, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const shareZone = this.add.zone(205, buttonY + 35, 250, 70);
    shareZone.setInteractive();

    shareZone.on('pointerover', () => {
      shareButton.clear();
      shareButton.fillStyle(0x5dd9d2, 1);
      shareButton.fillRoundedRect(80, buttonY, 250, 70, 35);
      shareText.setScale(1.1);
    });

    shareZone.on('pointerout', () => {
      shareButton.clear();
      shareButton.fillStyle(0x4ecdc4, 1);
      shareButton.fillRoundedRect(80, buttonY, 250, 70, 35);
      shareText.setScale(1);
    });

    shareZone.on('pointerdown', () => {
      this.shareScore();
    });

    // もう一度プレイボタン
    const playAgainButton = this.add.graphics();
    playAgainButton.fillStyle(0xff6b9d, 1);
    playAgainButton.fillRoundedRect(390, buttonY, 250, 70, 35);
    
    const playAgainText = this.add.text(515, buttonY + 35, t.playAgain, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const playAgainZone = this.add.zone(515, buttonY + 35, 250, 70);
    playAgainZone.setInteractive();

    playAgainZone.on('pointerover', () => {
      playAgainButton.clear();
      playAgainButton.fillStyle(0xff8fb3, 1);
      playAgainButton.fillRoundedRect(390, buttonY, 250, 70, 35);
      playAgainText.setScale(1.1);
    });

    playAgainZone.on('pointerout', () => {
      playAgainButton.clear();
      playAgainButton.fillStyle(0xff6b9d, 1);
      playAgainButton.fillRoundedRect(390, buttonY, 250, 70, 35);
      playAgainText.setScale(1);
    });

    playAgainZone.on('pointerdown', () => {
      // Ensure clean restart by stopping UI scene first
      this.scene.stop('ui');
      this.scene.start('game');
    });

    // スタート画面に戻るボタン
    const homeButtonY = buttonY + 100;
    const homeButton = this.add.graphics();
    homeButton.fillStyle(0x666666, 1);
    homeButton.fillRoundedRect(235, homeButtonY, 250, 70, 35);
    
    const homeText = this.add.text(360, homeButtonY + 35, t.backToStart, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const homeZone = this.add.zone(360, homeButtonY + 35, 250, 70);
    homeZone.setInteractive();

    homeZone.on('pointerover', () => {
      homeButton.clear();
      homeButton.fillStyle(0x888888, 1);
      homeButton.fillRoundedRect(235, homeButtonY, 250, 70, 35);
      homeText.setScale(1.1);
    });

    homeZone.on('pointerout', () => {
      homeButton.clear();
      homeButton.fillStyle(0x666666, 1);
      homeButton.fillRoundedRect(235, homeButtonY, 250, 70, 35);
      homeText.setScale(1);
    });

    homeZone.on('pointerdown', () => {
      this.scene.start('start');
    });

    // スコア表示のアニメーション
    this.tweens.add({
      targets: [this.children.getByName('scoreText')],
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private shareScore(): void {
    try {
      const shareCardDataURL = ShareCard.generateShareCard(this.finalScore, this.longestCombo, this.allTimeRecord);
      ShareCard.downloadShareCard(shareCardDataURL, `emoji-smash-score-${this.finalScore}.png`);
    } catch (error) {
      console.error('スコアシェアエラー:', error);
    }
  }
}