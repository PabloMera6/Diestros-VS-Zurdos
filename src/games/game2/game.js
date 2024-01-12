import ScreenController from './screenController.js';

let gameAttempts = 0;

export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'game' });
        this.scoreSent = false;
        this.scoreKey = 'scoregame2-d'; // Por defecto
    }

    init(data) {
        if (data && data.secondAttempt) {
          this.scoreKey = 'scoregame2-i';   
        }
    }

    preload() {
        this.load.image('background', 'assets/images/fondo-coche1.jpg');
        this.load.image('redLight', 'assets/images/semaforo (1).png');
    }

    create() {
        this.screenController = new ScreenController(this);
        this.width = this.screenController.getWidth();
        this.height = this.screenController.getHeight();
        this.attempts = 3;
        this.currentAttempt = 0;
        this.bestTime = 2000;
        this.add.image(this.width / 2, this.height / 2, 'background').setOrigin(0.5, 0.5).setDisplaySize(this.width, this.height);

        // Texto para mostrar el intento actual
        this.attemptText = this.add.text(this.width / 2, 50, '', {
            fontSize: '24px',
            fill: '#fff',
        }).setOrigin(0.5);

        // Texto para mostrar el error
        this.errorText = this.add.text(this.width / 2, this.height / 2, '', {
            fontSize: '24px',
            fill: '#fff',
        }).setOrigin(0.5);

        // Texto para mostrar el tiempo de reacción
        this.reactionTimeText = this.add.text(this.width / 2, this.height / 4, '', {
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
    
        // Ajusta las coordenadas de posición para que los globos aparezcan en el centro de la pantalla y desde el píxel 100
        const centerX = this.width / 2;
        const availableHeight = this.height - 300;  // Altura disponible después del píxel 100
        const startY = 150;
    
        // Inicializa el evento para encender las luces uno por uno
        for (let i = 0; i < 4; i++) {
            this.time.delayedCall(i * 1000, () => {
                // Verifica si la escena aún está en el estado correcto para permitir la creación del globo
                if (this.scene.isActive() && lightsRemaining > 0) {
                    const light = this.lightsGroup.create(centerX, startY + (i / 3) * availableHeight, 'redLight');
                    light.setAlpha(1);
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
        this.nextButton = this.add.text(this.width / 2, this.height / 2, 'Realizar siguiente intento', {
            fontSize: '24px',
            fill: '#000',
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
        /*if (this.bestTime !== 2000) {
            this.add.text(this.width / 2, this.height / 2, `Su mejor tiempo es de: ${this.bestTime} ms`, {
                fontSize: '32px',
                fill: '#fff',
            }).setOrigin(0.5);
        } else {
            this.add.text(this.width / 2, this.height / 2, 'No ha tenido intentos exitosos, por lo que su tiempo es de 2000 ms', {
                fontSize: '32px',
                fill: '#fff',
            }).setOrigin(0.5);
        }*/

        const finalScore = this.bestTime;
        let apiUrl = '/gamesave2-a';
        if (gameAttempts == 1) {
          apiUrl = '/gamesave2-b';
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

        // Destruye el grupo de luces
        this.lightsGroup.clear(true, true);

        gameAttempts++;

        if (gameAttempts < 2) {
          this.scene.start('intermediate', { score1: finalScore });
        } else {
          this.scene.start('final', { score2: finalScore });
        }
    }
}
