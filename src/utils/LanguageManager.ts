export type Language = 'ja' | 'en';

interface LanguageTexts {
  // Start Scene
  gameTitle: string;
  gameSubtitle: string;
  gameRules: string;
  rules: string[];
  itemEffects: string;
  items: string[];
  startGame: string;
  
  // Game UI
  score: string;
  time: string;
  combo: string;
  
  // Game Over Scene
  gameOver: string;
  finalScore: string;
  bestCombo: string;
  allTimeRecord: string;
  share: string;
  playAgain: string;
  backToStart: string;
  
  // Evaluation messages
  evaluations: {
    master: string;
    expert: string;
    advanced: string;
    intermediate: string;
    beginner: string;
    practice: string;
  };
}

const texts: Record<Language, LanguageTexts> = {
  ja: {
    gameTitle: 'Emoji Smash',
    gameSubtitle: '絵文字パズルゲーム',
    gameRules: '🎮 ゲームルール',
    rules: [
      '⏰ 制限時間は20秒',
      '👆 同じ絵文字をタップして消そう',
      '⭐ 2個以上つながると消える',
      '🔥 たくさん消すほど高得点',
      '⚡ コンボを繋げてボーナス',
      '🎁 4コンボ以上でアイテム出現'
    ],
    itemEffects: '🎁 アイテム効果',
    items: [
      '💣 爆弾: ランダムな3x3範囲を破壊',
      '⚡ 雷: ランダムな3列を一掃',
      '🌈 虹: 最も多い絵文字タイプを全消去'
    ],
    startGame: 'ゲーム開始',
    score: 'スコア',
    time: '時間',
    combo: 'コンボ',
    gameOver: 'ゲーム終了！',
    finalScore: 'スコア',
    bestCombo: '最高コンボ',
    allTimeRecord: '歴代最高記録',
    share: '📸 シェア',
    playAgain: '🎮 もう一度',
    backToStart: '🏠 スタート画面',
    evaluations: {
      master: '🏆 素晴らしい！マスター級！',
      expert: '⭐ とても上手！エキスパート！',
      advanced: '👍 いい感じ！上級者！',
      intermediate: '😊 なかなか良い！中級者！',
      beginner: '🙂 まずまず！初級者！',
      practice: '😅 練習あるのみ！頑張って！'
    }
  },
  en: {
    gameTitle: 'Emoji Smash',
    gameSubtitle: 'Emoji Puzzle Game',
    gameRules: '🎮 Game Rules',
    rules: [
      '⏰ Time limit: 30 seconds',
      '👆 Tap same emojis to clear them',
      '⭐ Connect 2+ emojis to clear',
      '🔥 More emojis = higher score',
      '⚡ Chain combos for bonus',
      '🎁 4+ combos spawn items'
    ],
    itemEffects: '🎁 Item Effects',
    items: [
      '💣 Bomb: Destroys random 3x3 area',
      '⚡ Lightning: Clears 3 random columns',
      '🌈 Rainbow: Clears most common emoji type'
    ],
    startGame: 'Start Game',
    score: 'Score',
    time: 'Time',
    combo: 'Combo',
    gameOver: 'Game Over!',
    finalScore: 'Score',
    bestCombo: 'Best Combo',
    allTimeRecord: 'All-Time Record',
    share: '📸 Share',
    playAgain: '🎮 Play Again',
    backToStart: '🏠 Main Menu',
    evaluations: {
      master: '🏆 Amazing! Master Level!',
      expert: '⭐ Excellent! Expert Level!',
      advanced: '👍 Great! Advanced Level!',
      intermediate: '😊 Good! Intermediate Level!',
      beginner: '🙂 Not bad! Beginner Level!',
      practice: '😅 Keep practicing! You can do it!'
    }
  }
};

export class LanguageManager {
  private static currentLanguage: Language = 'en';
  
  public static setLanguage(language: Language): void {
    this.currentLanguage = language;
    localStorage.setItem('emoji-smash-language', language);
  }
  
  public static getCurrentLanguage(): Language {
    return this.currentLanguage;
  }
  
  public static loadLanguage(): void {
    const saved = localStorage.getItem('emoji-smash-language') as Language;
    if (saved && (saved === 'ja' || saved === 'en')) {
      this.currentLanguage = saved;
    } else {
      // Set default to English if no saved preference
      this.currentLanguage = 'en';
    }
  }
  
  public static getText(): LanguageTexts {
    return texts[this.currentLanguage];
  }
  
  public static getEvaluationMessage(score: number): string {
    const t = this.getText();
    if (score >= 5000) return t.evaluations.master;
    if (score >= 3000) return t.evaluations.expert;
    if (score >= 1500) return t.evaluations.advanced;
    if (score >= 800) return t.evaluations.intermediate;
    if (score >= 300) return t.evaluations.beginner;
    return t.evaluations.practice;
  }
  
  public static getCelebrationEmojis(score: number): string[] {
    if (score >= 3000) return ['🎉', '🏆', '⭐', '🎊', '👑'];
    if (score >= 1500) return ['🎉', '⭐', '😎', '🎊', '🔥'];
    if (score >= 800) return ['😊', '👍', '⭐', '🎉', '😄'];
    return ['😅', '💪', '🎯', '📈', '🚀'];
  }
}