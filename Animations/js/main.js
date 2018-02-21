
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
    this.timesFinished = 0;
}

Animation.prototype.drawFrame = function (game, tick, ctx, x, y, scale) {
    let lastFrame = false;
    if (!game.stop) {
        let scaleBy = scale || 1;
        this.elapsedTime += tick;
        if (this.loop) {
            if (this.isDone()) {
                this.elapsedTime = 0;
                this.timesFinished++;
            }
        } else if (this.isDone()) { //I do this so the spritesheet ends on the correct frame at the end of the single loop
            this.elapsedTime -= tick;
            lastFrame = true;
            this.timesFinished++;
        }

        let originalFrame = this.currentFrame();
        let index = originalFrame;
        let vindex = 0;
        if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
            index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
            vindex++;
        }
        while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
            index -= Math.floor(this.spriteSheet.width / this.frameWidth);
            vindex++;
        }

        let locX = x;
        let locY = y;
        let offset = vindex === 0 ? this.startX : 0;

        if (!this.reverse) {
            //console.log(index === this.frames - 1);
            if (index === (this.frames - 1) && game.moving) {
                index = originalFrame;
                this.elapsedTime = 0;
                vindex = 0;
            }
            ctx.drawImage(this.spriteSheet,
                          index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                          this.frameWidth, this.frameHeight,
                          locX, locY,
                          this.frameWidth * scaleBy,
                          this.frameHeight * scaleBy);
        } else {
            if (index === (this.frames - 1) && game.moving) {
                index = originalFrame;
                this.elapsedTime = 0;
                vindex = 0;
            }
            ctx.drawImage(this.spriteSheet,
                index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                this.frameWidth, this.frameHeight,
                locX, locY,
                this.frameWidth * scaleBy,
                this.frameHeight * scaleBy);
        }

        if (lastFrame) {
            this.elapsedTime = this.totalTime;
        }
    }
};


Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
};

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
};



let playerStartX;
let playerStartY;
let gameEngine;

//1 = forward, 2 = downward, 3 = left, 4 = right
let facingDirection;



// the "main" code begins here
let ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/Hooded_Figure_SpriteSheet.png");
ASSET_MANAGER.queueDownload("./img/Fireball_SpriteSheet.png");


ASSET_MANAGER.downloadAll(function() {


  let canvas = document.getElementById('gameWorld');
  let ctx = canvas.getContext('2d');

  facingDirection = 2;
  gameEngine = new GameEngine();

  let player = new Player(gameEngine);
  gameEngine.addEntity(player);

  //START GAME
  gameEngine.init(ctx);
  player.x = (gameEngine.surfaceWidth / 2 - 32);
  player.y = (gameEngine.surfaceHeight / 2 - 32);
  playerStartX = (gameEngine.surfaceWidth / 2 - 32);
  playerStartY = (gameEngine.surfaceHeight / 2 - 32);

  gameEngine.start();
});

