export class IntermediateScene extends Phaser.Scene {
    constructor() {
      super({ key: 'intermediate' });
    }
  
    create() {
      this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '¡Listo para el siguiente intento!\nPulsa Comenzar', {
        fontSize: '32px',
        fill: '#fff'
      }).setOrigin(0.5);
  
      this.input.once('pointerdown', function () {
        this.scene.start('countdown', { secondAttempt: true });
    }, this);
    }
  }
  