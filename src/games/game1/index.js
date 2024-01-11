import { Game } from './game.js';
import { CountDown } from './countDown.js';

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

const config = {
  type: Phaser.AUTO,
  width: windowWidth,
  height: windowHeight,
  scene: [CountDown, Game],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false
    }
  }
}


var game = new Phaser.Game(config);