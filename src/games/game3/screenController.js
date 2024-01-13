export default class ScreenController {
    constructor(scene) {
      this.scene = scene;
      this.width = this.scene.game.config.width;
      this.height = this.scene.game.config.height;
    }
  
    getWidth() {
      return this.width;
    }
  
    getHeight() {
      return this.height;
    }
  }
  