export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'game' });
    }

    preload() {
        this.load.image('fondo', 'assets/images/fondo.jpg');
        this.load.image('pajaro', 'assets/images/pc.png');
    }

    create() {
        this.fondo = this.add.tileSprite(480, 320, 960, 640, 'fondo').setScrollFactor(0);
        this.player = this.physics.add.sprite(50, 100, 'pajaro');

        this.anims.create({
            key: 'vuelo',
            frames: this.anims.generateFrameNumbers('hero', {start: 0, end: 1}),
            frameRate: 10,
            repeat: -1,
        });
        this.player.play('fly');

        this.input.on('pointerdown', () => this.jump());
        this.newPipe();

        this.physics.world.on('worldbounds', (body) => {
            this.scene.start('Lose');
           });
          
           this.player.setCollideWorldBounds(true);
           this.player.body.onWorldBounds = true;

    }

    jump() {
        this.player.setVelocityY(-200);
    }

    newPipe() {
        //Una tubería un grupo de cubos
        /*const random = Math.floor(Math.random() * 2);
        for (let i = 0; i < 8; i++) {
            //El agujero son cuatro casillas
            if (i !== gap && i !== gap + 1 && i !== gap - 1) {
            let cube;
            if (i == gap - 2) {
                cube = pipe.create(960, i * 100, `pipeUp${random}`);
            } else if (i == gap + 2) {
                cube = pipe.create(960, i * 100, `pipeDown${random}`);
            } else {
                cube = pipe.create(960, i * 100, `pipe${random}`);
            }
            cube.body.allowGravity = false;
            }
        }*/
        const pipe = this.physics.add.group();
        //Cada tubería tendrá un hueco (zona en la que no hay cubos) por dónde pasará el super héroe
        const gap = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < 8; i++) {
            //El hueco estará compuesto por dos posiciones en las que no hay cubos, por eso ponemos hueco +1
            if (i !== gap && i !== gap + 1 && i !== gap - 1) {
                const cube = pipe.create(960, i * 100, 'pipe0');
                cube.body.allowGravity = false;
            }
        }

        pipe.setVelocityX(-200);
        //Detectaremos cuando las columnas salen de la pantalla...
        pipe.checkWorldBounds = true;
        //... y con la siguiente línea las eliminaremos
        pipe.outOfBoundsKill = true;
        //Cada 1000 milisegundos llamaremos de nuevo a esta función para que genere una nueva columna
        this.time.delayedCall(1000, this.newPipe, [], this);
        this.physics.add.overlap(this.player, pipe, this.hitPipe, null, this);

    }

    hitPipe() {
        alert('gameover');
    }

    update(time){
        this.fondo.tilePositionX = time*0.1;
    }
}
