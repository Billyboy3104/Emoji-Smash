import Phaser from 'phaser';

export class EmojiField {
  private scene: Phaser.Scene;
  private emojis: Phaser.GameObjects.Text[][] = [];
  private emojiTypes: string[] = [];
  private radius: number;
  private readonly COLS = 6;
  private readonly ROWS = 8;
  private readonly CELL_SIZE = 90;
  private isProcessingDestruction: boolean = false;
  private availableItems: string[] = [];
  private itemButtons: Phaser.GameObjects.Container[] = [];
  private itemTypes: string[] = ['bomb', 'lightning', 'rainbow'];
  private activeFloatingItems: Phaser.GameObjects.Container[] = [];

  constructor(scene: Phaser.Scene, centerX: number, centerY: number) {
    this.scene = scene;
    
    // Determine variant based on environment variable
    const variant = import.meta.env.VITE_BUILD_VARIANT || 'A';
    
    if (variant === 'B') {
      this.emojiTypes = ['😀', '😎', '😡', '😱', '😍', '🤖'];
      this.radius = 85;
    } else {
      this.emojiTypes = ['😀', '😎', '😡', '😱', '😍'];
      this.radius = 100;
    }

    this.createField(centerX, centerY);
    this.createItemUI();
  }

  private createItemUI(): void {
    // アイテムUIは動的に生成されるため、ここでは何もしない
  }

  public addRandomItem(): void {
    const randomType = this.itemTypes[Math.floor(Math.random() * this.itemTypes.length)];
    this.spawnFloatingItem(randomType);
    console.log('アイテム生成:', randomType);
  }

  private spawnFloatingItem(itemType: string): void {
    const iconMap: { [key: string]: string } = {
      'bomb': '💣',
      'lightning': '⚡',
      'rainbow': '🌈'
    };
    
    // プレイフィールド内のランダムな位置に配置
    const fieldStartX = 360 - (this.COLS * this.CELL_SIZE) / 2;
    const fieldEndX = 360 + (this.COLS * this.CELL_SIZE) / 2;
    const fieldStartY = 640 - (this.ROWS * this.CELL_SIZE) / 2 + 100;
    const fieldEndY = 640 + (this.ROWS * this.CELL_SIZE) / 2 + 100;
    
    // 既存のアイテムと重ならない位置を探す
    let x, y;
    let attempts = 0;
    do {
      x = fieldStartX + Math.random() * (fieldEndX - fieldStartX);
      y = fieldStartY + Math.random() * (fieldEndY - fieldStartY);
      attempts++;
    } while (this.isPositionOccupied(x, y) && attempts < 10);
    
    const itemBg = this.scene.add.graphics();
    itemBg.fillStyle(0xffffff, 0.9);
    itemBg.fillCircle(0, 0, 45);
    
    itemBg.lineStyle(4, 0xfeca57, 1);
    itemBg.strokeCircle(0, 0, 45);
    
    const itemIcon = this.scene.add.text(0, 0, iconMap[itemType], {
      fontSize: '48px'
    }).setOrigin(0.5);
    
    const itemContainer = this.scene.add.container(x, y, [itemBg, itemIcon]);
    this.activeFloatingItems.push(itemContainer);
    
    // 浮遊アニメーション
    this.scene.tweens.add({
      targets: itemContainer,
      y: y - 15,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // 光るアニメーション
    this.scene.tweens.add({
      targets: itemBg,
      alpha: 0.7,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // 回転アニメーション
    this.scene.tweens.add({
      targets: itemIcon,
      rotation: Math.PI * 2,
      duration: 8000,
      repeat: -1,
      ease: 'Linear'
    });
    
    const zone = this.scene.add.zone(x, y, 90, 90);
    zone.setInteractive();
    
    zone.on('pointerover', () => {
      itemContainer.setScale(1.2);
    });
    
    zone.on('pointerout', () => {
      itemContainer.setScale(1.0);
    });
    
    zone.on('pointerdown', () => {
      this.activateItem(itemType, (destroyedCount: number) => {
        this.scene.events.emit('item:used', { type: itemType, destroyedCount });
      });
      
      // アイテムをリストから削除
      const index = this.activeFloatingItems.indexOf(itemContainer);
      if (index > -1) {
        this.activeFloatingItems.splice(index, 1);
      }
      
      itemContainer.destroy();
      zone.destroy();
    });
    
    // 15秒後に自動消滅
    this.scene.time.delayedCall(15000, () => {
      if (itemContainer && itemContainer.active) {
        const index = this.activeFloatingItems.indexOf(itemContainer);
        if (index > -1) {
          this.activeFloatingItems.splice(index, 1);
        }
        itemContainer.destroy();
      }
      if (zone && zone.active) {
        zone.destroy();
      }
    });
  }

  private isPositionOccupied(x: number, y: number): boolean {
    const minDistance = 100; // 最小距離
    
    for (const item of this.activeFloatingItems) {
      const distance = Math.sqrt(Math.pow(item.x - x, 2) + Math.pow(item.y - y, 2));
      if (distance < minDistance) {
        return true;
      }
    }
    
    return false;
  }

  private createField(centerX: number, centerY: number): void {
    const startX = centerX - (this.COLS * this.CELL_SIZE) / 2 + this.CELL_SIZE / 2;
    const startY = centerY - (this.ROWS * this.CELL_SIZE) / 2 + this.CELL_SIZE / 2 + 100;

    for (let row = 0; row < this.ROWS; row++) {
      this.emojis[row] = [];
      for (let col = 0; col < this.COLS; col++) {
        const x = startX + col * this.CELL_SIZE;
        const y = startY + row * this.CELL_SIZE;
        
        const randomEmoji = this.emojiTypes[Math.floor(Math.random() * this.emojiTypes.length)];
        
        const emojiText = this.scene.add.text(x, y, randomEmoji, {
          fontSize: '66.5px',
        }).setOrigin(0.5);

        this.emojis[row][col] = emojiText;
      }
    }
  }

  public onTap(x: number, y: number, onDestroyed: (count: number) => void): void {
    // Prevent multiple simultaneous destruction processes
    if (this.isProcessingDestruction) return;
    
    const clickedEmoji = this.findEmojiAtPosition(x, y);
    if (!clickedEmoji) return;

    const { row, col } = clickedEmoji;
    if (!this.emojis[row][col]) return;
    
    const emojiType = this.emojis[row][col].text;
    
    // Find all connected emojis of the same type
    const toDestroy = this.findConnectedEmojis(row, col, emojiType);
    
    if (toDestroy.length >= 2) { // Minimum 2 to destroy
      this.isProcessingDestruction = true;
      
      // Play satisfying destroy animation
      this.playDestroyAnimation(toDestroy, () => {
        // Apply gravity (make emojis fall down)
        this.applyGravity();

        // Fill empty spaces with new emojis
        this.scene.time.delayedCall(200, () => {
          this.fillEmptySpaces();
          this.isProcessingDestruction = false;
          onDestroyed(toDestroy.length);
        });
      });
    }
  }

  public activateItem(itemType: string, onDestroyed: (count: number) => void): void {
    // Prevent multiple simultaneous destruction processes
    if (this.isProcessingDestruction) {
      console.warn('Item activation blocked: destruction in progress');
      return;
    }
    
    let destroyedCount = 0;
    const toDestroy: { row: number; col: number }[] = [];

    console.log('Processing item type:', itemType); // デバッグ用ログ

    switch (itemType) {
      case 'bomb':
        toDestroy.push(...this.activateBomb());
        break;
      case 'lightning':
        toDestroy.push(...this.activateLightning());
        break;
      case 'rainbow':
        toDestroy.push(...this.activateRainbow());
        break;
      default:
        console.warn('Unknown item type:', itemType);
        return;
    }

    destroyedCount = toDestroy.length;
    console.log('Items to destroy:', destroyedCount); // デバッグ用ログ

    // エフェクト後の処理
    if (destroyedCount > 0) {
      this.isProcessingDestruction = true;
      
      // アイテムエフェクトと破壊アニメーションを実行
      this.playDestroyAnimation(toDestroy, () => {
        this.applyGravity();
        this.scene.time.delayedCall(350, () => {
          this.fillEmptySpaces();
          this.isProcessingDestruction = false;
          onDestroyed(destroyedCount);
        });
      });
    } else {
      console.warn('No items to destroy');
      onDestroyed(0);
    }
  }

  private findEmojiAtPosition(x: number, y: number): { row: number; col: number } | null {
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const emoji = this.emojis[row][col];
        if (!emoji) continue;

        const bounds = emoji.getBounds();
        if (bounds.contains(x, y)) {
          return { row, col };
        }
      }
    }
    return null;
  }

  private findConnectedEmojis(startRow: number, startCol: number, emojiType: string): { row: number; col: number }[] {
    const visited = new Set<string>();
    const toDestroy: { row: number; col: number }[] = [];

    // Validate starting position
    if (!this.emojis[startRow] || !this.emojis[startRow][startCol]) {
      return [];
    }

    const queue = [{ row: startRow, col: startCol }];
    visited.add(`${startRow},${startCol}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentEmoji = this.emojis[current.row][current.col];
      
      if (!currentEmoji || currentEmoji.text !== emojiType) continue;

      // Add current emoji to destroy list
      toDestroy.push(current);

      // Check all 4 adjacent neighbors (up, down, left, right)
      const neighbors = [
        { row: current.row - 1, col: current.col }, // up
        { row: current.row + 1, col: current.col }, // down
        { row: current.row, col: current.col - 1 }, // left
        { row: current.row, col: current.col + 1 }, // right
      ];

      for (const neighbor of neighbors) {
        const key = `${neighbor.row},${neighbor.col}`;
        if (!visited.has(key) && 
            neighbor.row >= 0 && neighbor.row < this.ROWS &&
            neighbor.col >= 0 && neighbor.col < this.COLS &&
            this.emojis[neighbor.row][neighbor.col] &&
            this.emojis[neighbor.row][neighbor.col].text === emojiType) {
          visited.add(key);
          queue.push(neighbor);
        }
      }
    }

    return toDestroy;
  }

  private applyGravity(): void {
    // Calculate consistent positioning
    const startX = 360 - (this.COLS * this.CELL_SIZE) / 2 + this.CELL_SIZE / 2;
    const startY = 640 - (this.ROWS * this.CELL_SIZE) / 2 + this.CELL_SIZE / 2 + 100;

    for (let col = 0; col < this.COLS; col++) {
      let writeIndex = this.ROWS - 1;
      
      for (let row = this.ROWS - 1; row >= 0; row--) {
        if (this.emojis[row] && this.emojis[row][col] && this.emojis[row][col] !== null) {
          if (writeIndex !== row) {
            this.emojis[writeIndex][col] = this.emojis[row][col];
            this.emojis[row][col] = null as any;
          }
          
          // Update position for all emojis to ensure consistency
          const correctX = startX + col * this.CELL_SIZE;
          const correctY = startY + writeIndex * this.CELL_SIZE;
          
          // Clear any existing tweens before applying new ones
          this.scene.tweens.killTweensOf(this.emojis[writeIndex][col]);
          
          // Animate to correct position
          this.scene.tweens.add({
            targets: this.emojis[writeIndex][col],
            x: correctX,
            y: correctY,
            duration: 300,
            ease: 'Bounce.easeOut'
          });
          
          writeIndex--;
        }
      }
    }
  }

  private fillEmptySpaces(): void {
    const startX = 360 - (this.COLS * this.CELL_SIZE) / 2 + this.CELL_SIZE / 2;
    const startY = 640 - (this.ROWS * this.CELL_SIZE) / 2 + this.CELL_SIZE / 2 + 100;

    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        if (!this.emojis[row] || !this.emojis[row][col]) {
          // Ensure row array exists
          if (!this.emojis[row]) {
            this.emojis[row] = [];
          }
          
          const x = startX + col * this.CELL_SIZE;
          const y = startY + row * this.CELL_SIZE;
          
          const randomEmoji = this.emojiTypes[Math.floor(Math.random() * this.emojiTypes.length)];
          
          // Create emoji above the screen and animate it falling down
          this.emojis[row][col] = this.scene.add.text(x, y - 200, randomEmoji, {
            fontSize: '66.5px',
          }).setOrigin(0.5);
          
          // Animate the new emoji falling into place
          this.scene.tweens.add({
            targets: this.emojis[row][col],
            y: y,
            duration: 400 + row * 50, // Stagger based on row
            ease: 'Bounce.easeOut'
          });
        }
      }
    }
  }

  private playDestroyAnimation(toDestroy: { row: number; col: number }[], onComplete: () => void): void {
    if (toDestroy.length === 0) {
      onComplete();
      return;
    }
    
    let completedAnimations = 0;
    const totalAnimations = toDestroy.length;

    toDestroy.forEach(({ row, col }, index) => {
      const emoji = this.emojis[row][col];
      if (!emoji) {
        completedAnimations++;
        if (completedAnimations === totalAnimations) {
          this.scene.time.delayedCall(50, () => {
            onComplete();
          });
        }
        return;
      }

      // Create explosion particles around the emoji
      this.createExplosionParticles(emoji.x, emoji.y);

      // Stagger the animations slightly for a wave effect
      const delay = index * 50;

      // Clear any existing tweens on this emoji
      this.scene.tweens.killTweensOf(emoji);

      // Scale up and fade out animation
      this.scene.tweens.add({
        targets: emoji,
        scaleX: 2.5,
        scaleY: 2.5,
        alpha: 0,
        rotation: Math.PI * 2,
        delay: delay,
        duration: 400,
        ease: 'Back.easeIn',
        onComplete: () => {
          if (emoji && emoji.active) {
            emoji.destroy();
          }
          this.emojis[row][col] = null as any;
          
          completedAnimations++;
          if (completedAnimations === totalAnimations) {
            // Add delay to ensure all animations complete before gravity
            this.scene.time.delayedCall(50, () => {
              onComplete();
            });
          }
        }
      });

      // Add a bounce effect before destruction
      this.scene.tweens.add({
        targets: emoji,
        scaleX: 1.3,
        scaleY: 1.3,
        delay: delay,
        duration: 80,
        ease: 'Back.easeOut',
        yoyo: true
      });
    });
  }

  private createExplosionParticles(centerX: number, centerY: number): void {
    const particleCount = 8;
    const colors = ['💥', '✨', '⭐', '💫', '🌟'];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 60 + Math.random() * 40;
      const targetX = centerX + Math.cos(angle) * distance;
      const targetY = centerY + Math.sin(angle) * distance;

      const particle = this.scene.add.text(centerX, centerY, 
        colors[Math.floor(Math.random() * colors.length)], {
        fontSize: '20px'
      }).setOrigin(0.5);

      // Particle explosion animation
      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });

      // Add scale and rotation to particles
      this.scene.tweens.add({
        targets: particle,
        scaleX: 0.3,
        scaleY: 0.3,
        rotation: Math.PI * 4,
        duration: 800,
        ease: 'Power1'
      });
    }
  }

  private activateBomb(): { row: number; col: number }[] {
    const toDestroy: { row: number; col: number }[] = [];
    
    // ランダムな中心点を選択
    const centerRow = Math.floor(Math.random() * this.ROWS);
    const centerCol = Math.floor(Math.random() * this.COLS);

    console.log('Bomb center:', centerRow, centerCol); // デバッグ用ログ
    // 3x3の範囲で破壊
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        if (Math.abs(row - centerRow) <= 1 && Math.abs(col - centerCol) <= 1) {
          // 存在するemoji のみ破壊対象に追加
          if (this.emojis[row] && this.emojis[row][col]) {
            toDestroy.push({ row, col });
          }
        }
      }
    }

    // 爆発エフェクト
    const centerEmoji = this.emojis[centerRow] && this.emojis[centerRow][centerCol];
    if (centerEmoji) {
      this.createBombExplosion(centerEmoji.x, centerEmoji.y);
    } else {
      // 中心がない場合は画面中央で爆発エフェクト
      this.createBombExplosion(360, 640);
    }

    return toDestroy;
  }

  private activateLightning(): { row: number; col: number }[] {
    const toDestroy: { row: number; col: number }[] = [];

    // ランダムな縦列を3つ選んで破壊
    const selectedCols = new Set<number>();
    while (selectedCols.size < 3) {
      selectedCols.add(Math.floor(Math.random() * this.COLS));
    }

    console.log('Lightning columns:', Array.from(selectedCols)); // デバッグ用ログ
    selectedCols.forEach(col => {
      for (let row = 0; row < this.ROWS; row++) {
        if (this.emojis[row] && this.emojis[row][col]) {
          toDestroy.push({ row, col });
        }
      }
    });

    // 雷エフェクト
    this.createLightningEffect(Array.from(selectedCols));

    return toDestroy;
  }

  private activateRainbow(): { row: number; col: number }[] {
    const toDestroy: { row: number; col: number }[] = [];

    // 最も多い絵文字タイプを見つけて全て破壊
    const emojiCount: { [key: string]: { row: number; col: number }[] } = {};
    
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const emoji = this.emojis[row] && this.emojis[row][col];
        if (emoji) {
          const type = emoji.text;
          if (!emojiCount[type]) {
            emojiCount[type] = [];
          }
          emojiCount[type].push({ row, col });
        }
      }
    }

    // 最も多いタイプを選択
    let maxCount = 0;
    let targetType = '';
    for (const [type, positions] of Object.entries(emojiCount)) {
      if (positions.length > maxCount) {
        maxCount = positions.length;
        targetType = type;
      }
    }

    console.log('Rainbow target type:', targetType, 'count:', maxCount); // デバッグ用ログ
    if (targetType) {
      toDestroy.push(...emojiCount[targetType]);
    }

    // レインボーエフェクト
    this.createRainbowEffect();

    return toDestroy;
  }

  private createBombExplosion(centerX: number, centerY: number): void {
    // モバイル環境での安定性チェック
    if (!this.scene || !this.scene.add) {
      console.warn('Scene not available for bomb explosion');
      return;
    }
    
    // 大きな爆発エフェクト
    const explosionEmojis = ['💥', '🔥', '💢', '⚡'];
    
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 80 + Math.random() * 60;
      const targetX = centerX + Math.cos(angle) * distance;
      const targetY = centerY + Math.sin(angle) * distance;

      try {
        const explosion = this.scene.add.text(centerX, centerY, 
          explosionEmojis[Math.floor(Math.random() * explosionEmojis.length)], {
          fontSize: '40px'
        }).setOrigin(0.5);

        this.scene.tweens.add({
          targets: explosion,
          x: targetX,
          y: targetY,
          alpha: 0,
          duration: 1200,
          ease: 'Power2',
          onComplete: () => {
            if (explosion && explosion.active) {
              explosion.destroy();
            }
          }
        });
        
        // 別途スケールアニメーション
        this.scene.tweens.add({
          targets: explosion,
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 600,
          ease: 'Power2'
        });
      } catch (error) {
        console.error('Error creating bomb explosion:', error);
      }
    }
  }

  private createLightningEffect(cols: number[]): void {
    // モバイル環境での安定性チェック
    if (!this.scene || !this.scene.add) {
      console.warn('Scene not available for lightning effect');
      return;
    }
    
    cols.forEach(col => {
      const startX = 360 - (this.COLS * this.CELL_SIZE) / 2 + this.CELL_SIZE / 2 + col * this.CELL_SIZE;
      
      // 縦の雷エフェクト
      for (let i = 0; i < 8; i++) {
        try {
          const lightning = this.scene.add.text(startX, 300 + i * 100, '⚡', {
            fontSize: '48px',
            color: '#ffff00'
          }).setOrigin(0.5);

          this.scene.tweens.add({
            targets: lightning,
            alpha: 0,
            duration: 1000,
            delay: i * 50,
            ease: 'Power2',
            onComplete: () => {
              if (lightning && lightning.active) {
                lightning.destroy();
              }
            }
          });
          
          // 別途スケールアニメーション
          this.scene.tweens.add({
            targets: lightning,
            scaleX: 1.8,
            scaleY: 1.8,
            duration: 500,
            delay: i * 50,
            ease: 'Power2'
          });
        } catch (error) {
          console.error('Error creating lightning effect:', error);
        }
      }
    });
  }

  private createRainbowEffect(): void {
    // モバイル環境での安定性チェック
    if (!this.scene || !this.scene.add) {
      console.warn('Scene not available for rainbow effect');
      return;
    }
    
    const rainbowColors = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'];
    
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 720;
      const y = Math.random() * 1280;
      const color = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
      
      try {
        const rainbow = this.scene.add.text(x, y, color, {
          fontSize: '32px'
        }).setOrigin(0.5);

        this.scene.tweens.add({
          targets: rainbow,
          y: y - 200,
          alpha: 0,
          duration: 1500,
          ease: 'Power2',
          onComplete: () => {
            if (rainbow && rainbow.active) {
              rainbow.destroy();
            }
          }
        });
        
        // 別途スケールアニメーション
        this.scene.tweens.add({
          targets: rainbow,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 750,
          ease: 'Power2'
        });
      } catch (error) {
        console.error('Error creating rainbow effect:', error);
      }
    }
  }
}