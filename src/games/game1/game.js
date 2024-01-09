import ScreenController from './screenController.js';

export class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'game' });
  }

  preload() {
    this.load.image('background', 'assets/images/fondo.jpg');
    this.load.image('globo-b', 'assets/images/globo-bueno2.png');
    this.load.image('globo-m', 'assets/images/globo-malo2.png');
  }

  create() {
    this.screenController = new ScreenController(this);
    this.width = this.screenController.getWidth();
    this.height = this.screenController.getHeight();
    this.score = 0;
    this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.width, this.height);
    this.scoreText = this.add.text(10, 10, `Puntuación: ${this.score}`, {
      fontSize: '32px',
      fill: '#fff',
      id: 'score'
    });
    
    this.timeText = this.add.text(this.width - 50, 10, '', {
      fontSize: '32px',
      fill: '#fff',
      id: 'time'
    });
    this.timeText.setOrigin(0.5, 0);

    this.circle = this.add.sprite(this.width / 2, this.height / 2, 'globo-b');
    this.circle.setInteractive();
    this.circle.on('pointerdown', () => {
      this.score += 10;
      this.scoreText.setText(`Puntuación: ${this.score}`);
      // Cancela el evento de tiempo existente y crea uno nuevo después de 2 segundos.
      this.moveCircle();
    });

    // Crea el primer evento de tiempo.
    this.moveCircle();
    this.startTime = this.time.now;
    this.endTime = this.startTime + 20000;

    this.globoCount = 0;
    this.globoTimer = this.time.addEvent({
      delay: Phaser.Math.Between(3000, 10000),
      callback: () => {
        if (this.globoCount < 3) {
          const x = Phaser.Math.Between(50, this.width - 50);
          const y = Phaser.Math.Between(100, this.height - 50);
          const globo = this.add.sprite(x, y, 'globo-m');
          globo.setInteractive();
          globo.on('pointerdown', () => {
            this.score -= 20;
            this.scoreText.setText(`Score: ${this.score}`);
            globo.destroy();
          });
          this.globoCount++;
          this.time.delayedCall(1000, () => {
            globo.destroy();
          });
        }
      },
      loop: true
    });
  }

  moveCircle() {
    const x = Phaser.Math.Between(50, this.width - 50);
    const y = Phaser.Math.Between(50, this.height - 50);
    this.circle.setPosition(x, y);

    // Cancela cualquier evento de tiempo existente.
    if (this.moveCircleTimer) {
      this.moveCircleTimer.remove(false); // No lo elimina del bucle de eventos
    }

    // Crea un nuevo evento de tiempo que se repita cada 2 segundos.
    this.moveCircleTimer = this.time.addEvent({
      delay: 1000,
      callback: this.moveCircle,
      callbackScope: this,
      repeat: -1, // Se repite indefinidamente
    });
  }

  update() {
    const elapsedTime = this.time.now - this.startTime;
    if (elapsedTime >= 20000) {
      this.scoreText.setText(`Final Score: ${this.score}`);
      this.circle.disableInteractive();
      this.circle.setVisible(false);
      this.timeText.setText('');
      this.moveCircleTimer.remove(false);
      this.globoTimer.remove(false);
    } else {
      const remainingTime = Math.ceil((this.endTime - this.time.now) / 1000);
      this.timeText.setText(`${remainingTime}`);
    }
  }
}
