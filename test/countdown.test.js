import { CountDown } from '../src/games/game1/countDown.js';
import { Game } from '../src/games/game1/game.js';
import Phaser from '../src/phaser.js';



describe('Pruebas para el countdown', () => {

    it('CountDown scene is created correctly', () => {
        const countDownScene = new CountDown();
        expect(countDownScene).toBeInstanceOf(CountDown);
        expect(countDownScene).toBeInstanceOf(Phaser.Scene);
    });

    it('init method is called correctly', () => {
        const countDownScene = new CountDown();
        const data = { secondAttempt: true };
        countDownScene.init(data);
        expect(countDownScene.secondAttempt).toBe(true);
    });

    it('preload method is called correctly', () => {
        const countDownScene = new CountDown();
        const game = new Game();
        countDownScene.preload.call(countDownScene, game);
        expect(countDownScene.load).toHaveBeenCalled();
    });

    it('create method is called correctly', () => {
        const countDownScene = new CountDown();
        const game = new Game();
        countDownScene.create.call(countDownScene, game);
        expect(countDownScene.add).toHaveBeenCalled();
        expect(countDownScene.time.addEvent).toHaveBeenCalled();
    });

    it('updateCountdown method is called correctly', () => {
        const countDownScene = new CountDown();
        countDownScene.countdown = 3;
        countDownScene.updateCountdown();
        expect(countDownScene.countdown).toBe(2);
    });

    it('update method is called correctly', () => {
        const countDownScene = new CountDown();
        countDownScene.countdown = 0;
        countDownScene.update();
        expect(countDownScene.scene.start).toHaveBeenCalled();
    });
    
});
