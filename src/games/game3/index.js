import { Game } from './game.js';
import { CountDown } from './countDown.js';
import { IntermediateScene } from './intermediate.js';
import { Final } from './final.js';

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

const config = {
  type: Phaser.AUTO,
  width: windowWidth,
  height: windowHeight,
  scene: [CountDown, Game, IntermediateScene, Final],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  }
}


var game = new Phaser.Game(config);