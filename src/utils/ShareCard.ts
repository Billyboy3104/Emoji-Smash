export class ShareCard {
  public static generateShareCard(score: number, combo: number, allTimeRecord?: number): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = 600;
    canvas.height = 400;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Emoji Smash', canvas.width / 2, 80);

    // Score
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, 180);

    // Combo
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText(`Best Combo: ${combo}`, canvas.width / 2, 240);

    // All-time record (if different)
    if (allTimeRecord && allTimeRecord > combo) {
      ctx.font = '28px Arial';
      ctx.fillStyle = '#feca57';
      ctx.fillText(`All-Time Record: ${allTimeRecord}`, canvas.width / 2, 280);
    }

    // Footer
    ctx.font = '24px Arial';
    ctx.fillStyle = '#888888';
    const footerY = allTimeRecord && allTimeRecord > combo ? 340 : 320;
    ctx.fillText('Play Emoji Smash!', canvas.width / 2, footerY);

    // Add some emoji decoration
    ctx.font = '60px Arial';
    const emojiY = allTimeRecord && allTimeRecord > combo ? 380 : 360;
    ctx.fillText('😀🎮😎', canvas.width / 2, emojiY);

    return canvas.toDataURL('image/png');
  }

  public static downloadShareCard(dataURL: string, filename: string = 'emoji-smash-score.png'): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}