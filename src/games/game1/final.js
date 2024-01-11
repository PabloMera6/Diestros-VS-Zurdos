export class Final extends Phaser.Scene {
    constructor() {
      super({ key: 'final' });
    }
  
    create() {
      this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '¡Enhorabuena, has terminado!', {
        fontSize: '32px',
        fill: '#fff'
      }).setOrigin(0.5);
    }
  }
  