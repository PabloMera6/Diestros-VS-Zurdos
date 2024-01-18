import ScreenController from './screenController.js';

let gameAttempts = 0;

export class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'game' });
    this.scoreSent = false;
    this.scoreKey = 'scoregame1d';
    this.resetedTime = false;
  }

  init(data) {
    if (data && data.secondAttempt) {
      this.scoreKey = 'scoregame1i';   
    }
  }

  preload() {
    this.load.image('background', 'assets/images/fondo-paisaje.jpg');
    this.load.image('globo-b', 'assets/images/globo-bueno.png');
    this.load.image('globo-m', 'assets/images/globo-malo.png');
    this.load.image('marco', 'assets/images/marco.jpg');
  }

  create() {
    this.scoreSent = false;

    this.screenController = new ScreenController(this);
    this.width = this.screenController.getWidth();
    this.height = this.screenController.getHeight();
    this.score = 0;

    this.add.image(this.width / 2, this.height / 2, 'background').setOrigin(0.5, 0.5).setDisplaySize(this.width, this.height);
    this.scoreText = this.add.text(10, 15, `Puntuación: ${this.score}`, {
      fontSize: '32px',
      fill: '#000',
      backgroundColor: '#DBE7C9',
      id: 'score'
    });

    // Agregar el marco
    this.add.image(this.width - 10, 10, 'marco').setOrigin(1, 0);

    // Agregar el texto del tiempo centrado sobre el marco
    this.timeText = this.add.text(this.width - 15, 15, '', {
        fontSize: '32px',
        fill: '#fff',
        id: 'time'
    }).setOrigin(1, 0);


    this.circle = this.add.sprite(this.width / 2, this.height / 2, 'globo-b');
    this.circle.setInteractive();
    this.circle.on('pointerdown', () => {
      this.score += 10;
      this.scoreText.setText(`Puntuación: ${this.score}`);
      this.moveCircle();
    });

    this.moveCircle();
    this.startTime = this.time.now;
    this.endTime = this.startTime + 20000;

    this.globoCount = 0;
    this.globoTimer = this.time.addEvent({
      delay: Phaser.Math.Between(3000, 10000),
      callback: () => {
        if (this.globoCount < 3) {
          const globo = this.createGloboWithoutCollision();
          if (globo) {
            this.globoCount++;
            this.time.delayedCall(1000, () => {
              globo.destroy();
            });
          }
        }
      },
      loop: true
    });
  }

  createGloboWithoutCollision() {
    const x = Phaser.Math.Between(50, this.width - 50);
    const y = Phaser.Math.Between(100, this.height - 50);

    if (!Phaser.Geom.Intersects.RectangleToRectangle(this.circle.getBounds(), new Phaser.Geom.Rectangle(x, y, 100, 100))) {
      const globo = this.add.sprite(x, y, 'globo-m');
      globo.setInteractive();
      globo.on('pointerdown', () => {
        this.score -= 20;
        this.scoreText.setText(`Puntuación: ${this.score}`);
        globo.destroy();
      });
      return globo;
    }

    return null;
  }

  moveCircle() {
    const x = Phaser.Math.Between(50, this.width - 50);
    const y = Phaser.Math.Between(50, this.height - 50);
    this.circle.setPosition(x, y);

    if (this.moveCircleTimer) {
      this.moveCircleTimer.remove(false);
    }

    this.moveCircleTimer = this.time.addEvent({
      delay: 1000,
      callback: this.moveCircle,
      callbackScope: this,
      repeat: -1,
    });
  }

  update() {
    if(this.scoreKey == 'scoregame1i' && this.resetedTime == false) {
      this.startTime = this.time.now;
      this.endTime = this.startTime + 20000
      this.resetedTime = true;
    }
    let elapsedTime;
    elapsedTime = this.time.now - this.startTime;
    if (elapsedTime >= 20000) {
      this.circle.disableInteractive();
      this.circle.setVisible(false);
      this.timeText.setText('');
      this.moveCircleTimer.remove(false);
      this.globoTimer.remove(false);

      if (!this.scoreSent) {
        const finalScore = this.score;
        let apiUrl = '/gamesave1-a';
        if (gameAttempts == 1) {
          apiUrl = '/gamesave1-b';
        }
        const requestBody = {};
        requestBody[this.scoreKey] = finalScore;

        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })
          .then(response => response.json())
          .then(data => {
            console.log(data.message);
          })
      .catch(error => {
            console.error('Error al enviar la puntuación:', error);
          });

        this.scoreSent = true;
        gameAttempts++;

        if (gameAttempts < 2) {
          this.scene.start('intermediate', { score1: finalScore });
        } else {
          this.scene.start('final', { score2: finalScore });
        }
      }
    } else {
      const remainingTime = Math.ceil((this.endTime - this.time.now) / 1000);
      this.timeText.setText(`${remainingTime}`);
    }
  }
}
