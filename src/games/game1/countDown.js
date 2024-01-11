import ScreenController from './screenController.js';

export class CountDown extends Phaser.Scene {
    constructor() {
        super({ key: 'countdown' });
    }

    preload() {
        this.load.image('background', 'assets/images/fondo-paisaje.jpg');
    }

    create() {
        this.screenController = new ScreenController(this);
        this.width = this.screenController.getWidth();
        this.height = this.screenController.getHeight();
        this.add.tileSprite(0, 0, this.width, this.height, 'background').setOrigin(0, 0);    
        this.countdown = 3;
        this.countdownText = this.add.text(this.width / 2, this.height / 2 - 50, this.countdown, {
            fontSize: '64px',
            fill: '#000',
        });
        this.countdownText.setOrigin(0.5);

        this.time.addEvent({
            delay: 1000,
            callback: this.updateCountdown,
            callbackScope: this,
            repeat: 2,
            onComplete: this.startGame,
        });
    }

    updateCountdown() {
        this.countdown--;
        this.countdownText.setText(this.countdown);
    }

    update() {
        if (this.countdown === 0) {
            this.scene.start('game');
        }
    }
}
