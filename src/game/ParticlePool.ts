export class ParticlePool {
  private particles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, private maxParticles: number = 100) {
    this.scene = scene;
  }

  public spawnBurst(x: number, y: number, color: string = '#ffffff', count: number = 10): void {
    // Convert hex color to number if needed
    const colorNum = typeof color === 'string' ? parseInt(color.replace('#', '0x')) : color;
    
    // Create particle emitter
    const emitter = this.scene.add.particles(x, y, 'dot', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.8, end: 0 },
      lifespan: 600,
      quantity: count,
      tint: colorNum,
      blendMode: 'ADD'
    });

    // Auto-destroy after particles fade
    this.scene.time.delayedCall(800, () => {
      emitter.destroy();
    });
  }

  public update(): void {
    // Particles are managed by Phaser's particle system
  }

  public reset(): void {
    // Clean up any remaining emitters
    this.particles.forEach(emitter => {
      if (emitter && emitter.active) {
        emitter.destroy();
      }
    });
    this.particles.length = 0;
  }
}