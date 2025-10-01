import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor(){ super('boot'); }

  preload(){
    // No external assets; create a tiny circle texture for particles
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 8);
    g.generateTexture('dot', 16, 16);
  }

  create(){
    this.scene.start('start');
  }
}