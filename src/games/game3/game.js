import ScreenController from './screenController.js';

let gameAttempts = 0;

export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'game' });
        this.initialStage = true;
    }

    preload() {
        this.load.image('background', 'assets/images/fondo-pajaro.jpg');
        this.load.image('pajaro', 'assets/images/pajaro-alto.png');
        this.load.image('tuberia', 'assets/images/tubo.png');
        this.load.image('tuberia-arriba', 'assets/images/tubo-arriba.png');
        this.load.image('tuberia-abajo', 'assets/images/tubo-abajo.png');
    }

    create() {
        this.screenController = new ScreenController(this);
        this.width = this.screenController.getWidth();
        this.height = this.screenController.getHeight();
        this.fondo = this.add.image(this.width / 2, this.height / 2, 'background').setOrigin(0.5, 0.5).setDisplaySize(this.width, this.height).setScrollFactor(0);
        this.player = this.physics.add.sprite(50, 100, 'pajaro');

        this.input.on('pointerdown', () => this.jump());
        this.newPipe();

        this.physics.world.on('worldbounds', (body) => {
            this.scene.start('IntermediateScene', { score: elapsedSeconds });
           });
          
           this.player.setCollideWorldBounds(true);
           this.player.body.onWorldBounds = true;

    }

    jump() {
        if (!this.initialStage) {
            this.player.setVelocityY(-250); // Aumenta la velocidad del pájaro después de los primeros 10 segundos
        } else {
            this.player.setVelocityY(-200);
        }
    }

    newPipe() {
        const tuberia = this.physics.add.group();
        const numTubes = Math.floor(this.height / 70);
        let hueco;
        if (this.initialStage) {
            // Coloca el hueco en el centro durante los primeros 10 segundos
            hueco = Math.floor(numTubes / 2);
        } else {
            // Después de los primeros 10 segundos, el hueco puede estar en cualquier lugar
            hueco = Math.floor(Math.random() * numTubes) + 1;         
        }

        for (let i = 0; i <= numTubes; i++) {
            if (i !== hueco - 1 && i !== hueco + 1 && i !== hueco) {
                let bloque;
                if(i == hueco - 2){
                    bloque = tuberia.create(960, i * 70, 'tuberia-abajo');
                }else if(i == hueco + 2){
                    bloque = tuberia.create(960, i * 70, 'tuberia-arriba');
                }
                else{
                    bloque = tuberia.create(960, i * 70, 'tuberia');
                }
                bloque.body.allowGravity = false;
            }
        }
      
        tuberia.setVelocityX(-200);
        tuberia.checkWorldBounds = true;
        tuberia.outOfBoundsKill = true;
        this.time.delayedCall(2000, this.newPipe, [], this);
        // Cambia a la segunda etapa después de los primeros 10 segundos
        this.time.delayedCall(10000, () => { this.initialStage = false; }, [], this);
        this.physics.add.overlap(this.player, tuberia, this.hitPipe, null, this);
    }
      
     
    

    hitPipe() {
        alert('gameover');
    }

    update(time){
        this.fondo.tilePositionX = time*0.1;
    }
}
