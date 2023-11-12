export class CountDown extends Phaser.Scene {
    constructor() {
      super({ key: 'countdown' });
    }
  
    create() {
      this.countdown = 3; // Inicia con 3 segundos
      this.countdownText = this.add.text(400, 300, this.countdown, { fontSize: '64px', fill: '#fff' });
      this.countdownText.setOrigin(0.5);
  
      this.time.addEvent({
        delay: 1000,
        callback: this.updateCountdown,
        callbackScope: this,
        repeat: 2, // Repite 2 veces para un total de 3 segundos
        onComplete: this.startGame, // Cuando se complete, inicia el juego
      });
    }
  
    updateCountdown() {
      this.countdown--;
      this.countdownText.setText(this.countdown);
    }
  
    update(){
      if(this.countdown == 0){
        this.scene.start('game'); }
    
  }
}