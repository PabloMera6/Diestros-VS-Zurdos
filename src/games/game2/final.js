import ScreenController from './screenController.js';

export class Final extends Phaser.Scene {
  constructor() {
    super({ key: 'final' });
  }

  puntuacion = 0;

  init(data) {
    // Verifica si la propiedad secondAttempt está presente en los datos
    if (data && data.score2) {
      this.puntuacion = data.score2;
    }
  }

  preload() {
    this.load.image('background', 'assets/images/fondo-coche1.jpg');
  }

  create() {
    this.screenController = new ScreenController(this);
    this.width = this.screenController.getWidth();
    this.height = this.screenController.getHeight();
    this.add.image(this.width / 2, this.height / 2, 'background').setOrigin(0.5, 0.5).setDisplaySize(this.width, this.height);

    const congratsTextStyle = {
      fontSize: '36px',
      fill: '#000',
      backgroundColor: '#DBE7C9',
      wordWrap: { width: this.width - 40 },
      align: 'center',
    };

    const congratsText = this.add
      .text(this.width / 2, this.height / 4, `¡Enhorabuena! Su puntuación con la mano izquierda es ${this.puntuacion}`, congratsTextStyle)
      .setOrigin(0.5, 0.5);

    const instructionTextStyle = {
      fontSize: '24px',
      fill: '#000',
      backgroundColor: '#DBE7C9',
      wordWrap: { width: this.width - 40 },
      align: 'center',
    };

    const instructionText = this.add
      .text(this.width / 2, this.height / 2, 'Pulse aquí para ver los resultados finales', instructionTextStyle)
      .setOrigin(0.5, 0.5);

    instructionText.setInteractive().on('pointerdown', function () {
      window.location.href = '/resultados2';
    }, this);
  }
}
  