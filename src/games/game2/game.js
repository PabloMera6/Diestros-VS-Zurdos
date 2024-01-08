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

        // Elemento invisible para bloquear el input durante ciertos momentos
        this.inputGuard = this.add.rectangle(-100, -100, 1, 1);
        this.inputGuard.visible = false;
        this.inputGuard.setInteractive();

        // Texto para mostrar el intento actual
        this.attemptText = this.add.text(400, 50, '', {
            fontSize: '24px',
            fill: '#fff',
        }).setOrigin(0.5);

        // Texto para mostrar el tiempo de reacción
        this.reactionTimeText = this.add.text(400, 200, '', {
            fontSize: '24px',
            fill: '#fff',
        }).setOrigin(0.5);

        // Texto para el siguiente intento
        this.nextAttemptText = this.add.text(400, 400, '', {
            fontSize: '20px',
            fill: '#fff',
        }).setOrigin(0.5);
        this.nextAttemptText.setInteractive();
        this.nextAttemptText.on('pointerdown', this.continueGame, this);
        this.nextAttemptText.setVisible(false);

        // Comienza el primer intento
        this.startNewAttempt();
    }

    createLights() {
        // Si el grupo de luces no existe, lo crea
        if (!this.lightsGroup) {
            this.lightsGroup = this.add.group();
        }

        // Inicializa el evento para encender las luces uno por uno
        for (let i = 0; i < 4; i++) {
            this.time.delayedCall(i * 1000, () => {
                const light = this.lightsGroup.create(100 + i * 150, 300, 'redLight');
                light.setAlpha(0.5);
                light.setVisible(true);
            });
        }

        // Usa el método once en lugar de on
        this.input.on('pointerdown', this.handleEarlyClick, this);

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
        // Bloquea el input y muestra el mensaje de error
        this.inputGuard.visible = true;
        this.lightsGroup.clear(true, true);
        this.calculateReactionTime(2000);
        this.reactionTimeText.setText(`Tiempo de Reacción: 2000 ms`);
        this.reactionTimeText.setPosition(400, 200);
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

        // Cuando el jugador hace clic en el botón, oculta el mensaje de error y comienza el próximo intento
        this.nextButton.on('pointerdown', () => {
            this.nextButton.destroy();
            this.inputGuard.visible = false;  // Desbloquea el input
            this.continueGame();
        }, this);
    }

    handleReactionClick() {
        const reactionTime = this.calculateReactionTime();
        this.reactionTimeText.setText(`Tiempo de Reacción: ${reactionTime} ms`);

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
            return this.time.now - this.startTime;
        }
    }

    continueGame() {
        this.reactionTimeText.setText('');
        this.nextAttemptText.setVisible(false);
        this.inputGuard.visible = false;  // Desbloquea el input
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
