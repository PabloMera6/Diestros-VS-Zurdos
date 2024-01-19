import ScreenController from './screenController.js';

let gameAttempts = 0;
let huecoAnterior;
let choque = false;


export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'game' });
        this.initialStage = true;
        this.intermediateStage = false;
        this.finalStage = false;
        this.scoreSent = false;
        this.scoreKey = 'scoregame3d';
        this.resetedTime = false;
    }

    init(data) {
      if (data && data.secondAttempt) {
          this.scoreKey = 'scoregame3i';
          choque = false;
          this.initialStage = true;
          this.intermediateStage = false;
          this.finalStage = false;
          this.startTime = this.time.now;
          this.resetedTime = false;
      }
   }
   


    preload() {
        this.load.image('background', 'assets/images/fondo-tubo.jpg');
        this.load.image('pajaro-arriba', 'assets/images/pajaro-alto.png');
        this.load.image('pajaro-bajo', 'assets/images/pajaro-bajo.png');
        this.load.image('pajaro-choque', 'assets/images/pajaro-choque.png');
        this.load.image('tuberia', 'assets/images/tubo-35.png');
        this.load.image('tuberia-arriba', 'assets/images/tubo-arriba.png');
        this.load.image('tuberia-abajo', 'assets/images/tubo-abajo.png');
        this.load.image('marco', 'assets/images/marco.jpg');
    }

    create() {
        this.scoreSent = false;
        this.screenController = new ScreenController(this);
        this.width = this.screenController.getWidth();
        this.height = this.screenController.getHeight();
        this.background = this.add.tileSprite(0, 0, this.width, this.height, 'background').setOrigin(0, 0);
        const bounds = this.background.getBounds(); // Obtiene el ancho y el alto de la imagen
        this.background.setTileScale(this.height / bounds.height); // Escala la imagen de fondo según el alto de la pantalla
        this.background.setTilePosition(0, bounds.height - this.height); // Posiciona la imagen de fondo para que se muestre la parte de abaj

        this.player = this.physics.add.sprite(50, 100, 'pajaro-arriba');

        // Agregar el marco
        this.add.image(this.width - 10, 10, 'marco').setOrigin(1, 0);

        // Agregar el texto del tiempo centrado sobre el marco
        this.timeText = this.add.text(this.width - 15, 15, '', {
            fontSize: '32px',
            fill: '#fff',
            id: 'time'
        }).setOrigin(1, 0);

        this.input.on('pointerdown', () => this.jump());
        this.newPipe();
        this.startTime = this.time.now;

        this.physics.world.on('worldbounds', (body) => {
            choque = true;
           });
          
           this.player.setCollideWorldBounds(true);
           this.player.body.onWorldBounds = true;

    }

    jump() {
      this.player.setTexture('pajaro-bajo');
      setTimeout(() => {
          this.player.setTexture('pajaro-arriba');
      }, 500);
      
      this.player.setVelocityY(-200);
  
    }
    
   
    newPipe() {
        const tuberia = this.physics.add.group();
        const numTubes = Math.floor(this.height / 35);
        let hueco;
        if (this.initialStage) {
            // Coloca el hueco en el centro durante los primeros 10 segundos
            const randomPosition = Math.floor(Math.random() * 3);
            switch(randomPosition) {
                case 0: // Hueco en el medio
                    hueco = Math.floor(numTubes / 2);
                    break;
                case 1: // Hueco encima
                    hueco = Math.floor(numTubes / 2) - 1;
                    break;
                case 2: // Hueco debajo
                    hueco = Math.floor(numTubes / 2) + 1;
                    break;
            }
            for (let i = 0; i <= numTubes; i++) {
            if (i !== hueco - 1 && i !== hueco + 1 && i !== hueco && i !== hueco - 2 && i !== hueco + 2 && i !== hueco - 3 && i !== hueco + 3) {
              let bloque;
              if(i == hueco - 4){
                  bloque = tuberia.create(1000, i * 35, 'tuberia-abajo');
              }else if(i == hueco + 4){
                  bloque = tuberia.create(1000, i * 35, 'tuberia-arriba');
              }
              else{
                  bloque = tuberia.create(1000, i * 35, 'tuberia');
              }
              bloque.body.allowGravity = false;
              tuberia.setVelocityX(-200);

            }
          }
        }
        else{
          if(this.intermediateStage && !this.finalStage) {
            // Después de los primeros 10 segundos, el hueco puede estar en cualquier lugar
            // Pero no más de 4 huecos por encima o por debajo del hueco anterior
            // Ni en la zona más baja y más alta de la pantalla
            hueco = Phaser.Math.Between(Math.max(2, huecoAnterior - 4), Math.min(numTubes - 1, huecoAnterior + 4));
          }else if(this.finalStage && this.intermediateStage){
            hueco = Math.floor(Math.random() * numTubes) + 1; 
          }
          
          for (let i = 0; i <= numTubes; i++) {
            if (i !== hueco - 1 && i !== hueco + 1 && i !== hueco && i !== hueco - 2 && i !== hueco + 2) {
                let bloque;
                if(i == hueco - 3){
                    bloque = tuberia.create(1200, i * 35, 'tuberia-abajo');
                }else if(i == hueco + 3){
                    bloque = tuberia.create(1200, i * 35, 'tuberia-arriba');
                }
                else{
                    bloque = tuberia.create(1200, i * 35, 'tuberia');
                }
                bloque.body.allowGravity = false;
                tuberia.setVelocityX(-250);
            }
          } 
        }

        huecoAnterior = hueco;
    
        tuberia.checkWorldBounds = true;
        tuberia.outOfBoundsKill = true;
        this.time.delayedCall(2000, this.newPipe, [], this);
        // Cambia a la segunda etapa después de los primeros 10 segundos
        this.time.delayedCall(10000, () => { this.initialStage = false; }, [], this);
        this.time.delayedCall(10000, () => { this.intermediateStage = true; }, [], this);

        // Cambia a la tercera etapa después de 30 segundos
        this.time.delayedCall(30000, () => { this.finalStage = true; }, [], this);

        this.physics.add.overlap(this.player, tuberia, this.hitPipe, null, this);
    }

    hitPipe() {
      choque = true;
    }
   

    update(time){
      this.background.tilePositionX = time*0.1;
      if(this.scoreKey == 'scoregame3i' && this.resetedTime == false) {
          this.startTime = this.time.now;
          this.resetedTime = true;
      }
      let elapsedTime;
      elapsedTime = this.time.now - this.startTime;
      if (choque) {
        this.timeText.setText('Tiempo: ${elapsedTime}');
  
        if (!this.scoreSent) {
          const finalScore = elapsedTime.toFixed(2);
          let apiUrl = '/gamesave3-a';
          if (gameAttempts == 1) {
            apiUrl = '/gamesave3-b';
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
        let elapsedTime = Math.ceil((this.time.now - this.startTime ) / 1000);
        this.timeText.setText(`${elapsedTime}`);
      }
    }
}
