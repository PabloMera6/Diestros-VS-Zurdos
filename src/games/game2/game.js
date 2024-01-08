export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'game' });
    }
  
    preload() {
        this.load.image('redLight', 'assets/images/globo-bueno.png');
    }
  
    create() {
        this.attempts = 3;
        this.currentAttempt = 0;
        this.bestTime = Number.MAX_SAFE_INTEGER;
        this.inputGuard = this.add.rectangle(-100, -100, 1, 1);
        this.inputGuard.visible = false;
        this.inputGuard.setInteractive();
        this.attemptText = this.add.text(400, 50, '', {
            fontSize: '24px',
            fill: '#fff',
        }).setOrigin(0.5);
        this.reactionTimeText = this.add.text(400, 200, '', {
            fontSize: '24px',
            fill: '#fff',
        }).setOrigin(0.5);
        this.nextAttemptText = this.add.text(400, 400, '', {
            fontSize: '20px',
            fill: '#fff',
        }).setOrigin(0.5);
        this.nextAttemptText.setInteractive();
        this.nextAttemptText.on('pointerdown', this.continueGame, this);
        this.nextAttemptText.setVisible(false);
        this.startNewAttempt();
    }
  
    createLights() {
        if (!this.lightsGroup) {
            this.lightsGroup = this.add.group();
        }
        for (let i = 0; i < 4; i++) {
            this.time.delayedCall(i * 1000, () => {
                const light = this.lightsGroup.create(100 + i * 150, 300, 'redLight');
                light.setAlpha(0.5);
                light.setVisible(true);
            });
        }
        // Usa el método once en lugar de on
        this.input.once('pointerdown', this.handleEarlyClick, this);
        this.hideEvent = this.time.delayedCall(5000, () => {
            this.lightsGroup.children.iterate((light) => {
                this.lightsGroup.killAndHide(light);
            });
  
            this.startTime = this.time.now;
  
            this.nextAttemptText.setText('Realizar el siguiente intento');
            this.nextAttemptText.setVisible(true);
  
            this.input.off('pointerdown', this.handleEarlyClick, this);
  
            this.input.on('pointerdown', this.handleReactionClick, this);
        });
    }
    
    handleEarlyClick() {
        this.reactionTimeText.setText(`Has perdido un intento`);
        this.reactionTimeText.setPosition(400, 150);
        this.lightsGroup.clear(true, true);
        this.calculateReactionTime(2000);
        this.reactionTimeText.setText(`Tiempo de Reacción: 2000 ms`);
        this.reactionTimeText.setPosition(400, 200);
        this.nextAttemptText.setText('Realizar el siguiente intento');
        this.nextAttemptText.setVisible(true);
        this.nextAttemptText.setPosition(400, 400);
        this.input.off('pointerdown', this.handleEarlyClick, this);
        // Elimina la línea que resta un intento
        // this.currentAttempt--;  
        this.input.disable(this.inputGuard);
        this.hideEvent.remove();
     
        // Limpia los globos y prepara el próximo intento
        this.lightsGroup.children.each(function(child){
            child.destroy();
        });
        
        this.showIntermediateScreen();
    }
   
    showIntermediateScreen() {
        // Muestra un mensaje de error
        this.errorMessage = this.add.text(400, 300, '¡Clic demasiado pronto! Intenta de nuevo.', {
            fontSize: '24px',
            fill: '#fff',
        }).setOrigin(0.5);
     
        // Crea un botón para comenzar el próximo intento
        this.nextButton = this.add.text(400, 400, 'Continuar', {
            fontSize: '24px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive();
     
        // Cuando el jugador hace clic en el botón, oculta el mensaje de error y comienza el próximo intento
        this.nextButton.on('pointerdown', () => {
            this.errorMessage.destroy();
            this.nextButton.destroy();
            this.startNewAttempt();
        }, this);
     }
     
    
    handleReactionClick() {
        const reactionTime = this.calculateReactionTime();
        this.reactionTimeText.setText(`Tiempo de Reacción: ${reactionTime} ms`);
        this.nextAttemptText.setText('Realizar el siguiente intento');
        this.nextAttemptText.setVisible(true);
    
        this.input.off('pointerdown', this.handleReactionClick, this);
    
        if (reactionTime < this.bestTime) {
            this.bestTime = reactionTime;
        }
    
        this.lightsGroup.clear(true, true);
    }
    
    
    calculateReactionTime(time) {
          if (time) {
              return time;
          }
          else{
              return this.time.now - this.startTime;
          }
    }
    
    continueGame() {
        this.reactionTimeText.setText('');
        this.nextAttemptText.setVisible(false);
        this.input.enable(this.inputGuard);
        this.startNewAttempt();
    }
    
    startNewAttempt() {
        this.currentAttempt++;
        this.attemptText.setText(`Intento ${this.currentAttempt}/${this.attempts}`);
        this.reactionTimeText.setText('');
    
        if (this.currentAttempt <= this.attempts) {
            this.createLights();
        } else {
            this.endGame();
        }
    }
  
    endGame() {
        // Oculta el texto del intento actual
        this.attemptText.setVisible(false);
  
        // Muestra el mejor tiempo al final del juego
        if (this.bestTime !== Number.MAX_SAFE_INTEGER) {
            this.add.text(400, 300, `Mejor Tiempo: ${this.bestTime}ms`, {
                fontSize: '32px',
                fill: '#fff',
            }).setOrigin(0.5);
        } else {
            this.add.text(400, 300, 'Sin intentos exitosos', {
                fontSize: '32px',
                fill: '#fff',
            }).setOrigin(0.5);
        }
  
        // Destruye el grupo de luces
        this.lightsGroup.clear(true, true);
    }
  }
  