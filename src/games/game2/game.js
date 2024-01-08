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
        this.bestTime = 2000;

        // Texto para mostrar el intento actual
        this.attemptText = this.add.text(400, 50, '', {
            fontSize: '24px',
            fill: '#fff',
        }).setOrigin(0.5);

        // Texto para mostrar el error
        this.errorText = this.add.text(400, 150, '', {
            fontSize: '24px',
            fill: '#fff',
        }).setOrigin(0.5);

        // Texto para mostrar el tiempo de reacción
        this.reactionTimeText = this.add.text(400, 200, '', {
            fontSize: '24px',
            fill: '#fff',
        }).setOrigin(0.5);

        // Comienza el primer intento
        this.startNewAttempt();
    }

    createLights() {
        // Si el grupo de luces no existe, lo crea
        if (!this.lightsGroup) {
            this.lightsGroup = this.add.group();
        }
    
        let lightsRemaining = 4;
    
        // Inicializa el evento para encender las luces uno por uno
        for (let i = 0; i < 4; i++) {
            this.time.delayedCall(i * 1000, () => {
                // Verifica si la escena aún está en el estado correcto para permitir la creación del globo
                if (this.scene.isActive() && lightsRemaining > 0) {
                    const light = this.lightsGroup.create(100 + i * 150, 300, 'redLight');
                    light.setAlpha(0.5);
                    light.setVisible(true);
                    lightsRemaining--;
    
                    // Si se crea el último globo, activa la interactividad del clic
                    if (lightsRemaining === 0) {
                        this.input.once('pointerdown', this.handleEarlyClick, this);
                    }
                }
            });
        }
    
        // Inicializa el evento para desaparecer los globos después de un tiempo aleatorio
        // Guarda el evento en una variable
        this.hideEvent = this.time.delayedCall(5000, () => {
            this.lightsGroup.children.iterate((light) => {
                this.lightsGroup.killAndHide(light);
            });
    
            this.startTime = this.time.now;
    
            this.input.off('pointerdown', this.handleEarlyClick, this);
            this.input.on('pointerdown', this.handleReactionClick, this);
        });
    }
    

    handleEarlyClick() {
        this.lightsGroup.clear(true, true);
        this.calculateReactionTime(2000);
        this.reactionTimeText.setText(`Espera a que desaparezcan las luces`);
        this.errorText.setText(`Ha pulsado antes de tiempo`);
        this.input.off('pointerdown', this.handleEarlyClick, this);
        this.input.off('pointerdown', this.handleReactionClick, this);
        // Detiene el evento hideEvent si está programado para ejecutarse
        if (this.hideEvent) {
            this.hideEvent.remove();
        }
        // Elimina todos los globos que existan actualmente
        if (this.lightsGroup) {
            this.lightsGroup.clear(true, true);
        
        }
        // Limpia los globos y prepara el próximo intento
        this.lightsGroup.children.each(function (child) {
            child.destroy();
        });

        // Muestra la pantalla intermedia
        this.showIntermediateScreen();
    }

    showIntermediateScreen() {

        // Crea un botón para comenzar el próximo intento
        this.nextButton = this.add.text(400, 400, 'Realizar siguiente intento', {
            fontSize: '24px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive();

        if(this.currentAttempt === this.attempts) {
            this.nextButton.setText('Finalizar');
        } else {
            this.nextButton.setText('Realizar siguiente intento');
        }

        // Cuando el jugador hace clic en el botón, oculta el mensaje de error y comienza el próximo intento
        this.nextButton.on('pointerdown', () => {
            this.nextButton.destroy();
            this.continueGame();
        }, this);
    }

    handleReactionClick() {
        const reactionTime = this.calculateReactionTime();
        this.reactionTimeText.setText(`Tiempo de Reacción: ${reactionTime} ms`);
        this.errorText.setText(`!Enhorabuena!`);

        this.input.off('pointerdown', this.handleReactionClick, this);

        if (reactionTime < this.bestTime) {
            this.bestTime = reactionTime;
        }

        this.lightsGroup.clear(true, true);
        this.showIntermediateScreen();

    }

    calculateReactionTime(time) {
        if (time) {
            return time;
        } else {
            return (this.time.now - this.startTime).toFixed(2);
        }
    }

    continueGame() {
        this.reactionTimeText.setText('');
        this.errorText.setText('');
        //this.inputGuard.visible = false;  // Desbloquea el input
        this.startNewAttempt();
    }

    startNewAttempt() {
        this.currentAttempt++;

        // Muestra el intento actual
        this.attemptText.setText(`Intento ${this.currentAttempt}/${this.attempts}`);
        this.reactionTimeText.setText('');

        // Comienza un nuevo intento si hay intentos restantes
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
        if (this.bestTime !== 2000) {
            this.add.text(400, 300, `Su mejor tiempo es de: ${this.bestTime} ms`, {
                fontSize: '32px',
                fill: '#fff',
            }).setOrigin(0.5);
        } else {
            this.add.text(400, 300, 'No ha tenido intentos exitosos, por lo que su tiempo es de 2000 ms', {
                fontSize: '32px',
                fill: '#fff',
            }).setOrigin(0.5);
        }

        // Destruye el grupo de luces
        this.lightsGroup.clear(true, true);
    }
}
