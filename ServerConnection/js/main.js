
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
        //console.log("drawing frame");
        let scaleBy = scale || 1;
        this.elapsedTime += tick;
        if (this.loop) {
            if (this.isDone()) {
                this.elapsedTime = 0;
                this.timesFinished++;
            }
        } else if (this.isDone()) {
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
}




Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}


function buttonClick (label) {
    if (label === "Pause") {
        $("#pause").text("Resume");
        gameEngine.isPaused = true;
        $('#step').removeAttr('disabled');
    } else {
        $("#pause").text("Pause");
        gameEngine.isPaused = false;
        $('#step').attr('disabled','disabled');
    }
}

function startStep () {
    gameEngine.isStepping = true;
    $('#pause').attr('disabled','disabled');
    $('#step').attr('disabled','disabled');
}

function endStep () {
    gameEngine.isStepping = false;
    $('#pause').removeAttr('disabled');
    $('#step').removeAttr('disabled');
}

function changeTemp (direction) {
    gameEngine.changeTemp(direction);
}

function restart () {
    gameEngine.restart();
}

function changeStartingResources() {
    let val = $("#startingResources").val();
    if (!isNaN(val)) {
        restart();
        gameEngine.simulation.startingResourcesAvailable = val;
        gameEngine.simulation.splittingChance = gameEngine.simulation.adjustSplittingChance();
        gameEngine.simulation.currentResourcesAvailable = gameEngine.simulation.startingResourcesAvailable;
        $("#startingResources").val(gameEngine.simulation.startingResourcesAvailable);
    }
}

function changeMinutesUntilSplit () {
    let val = $("#minutesUntilSplit").val();
    if (!isNaN(val)) {
        restart();
        gameEngine.simulation.minutesUntilSplit = val;
        $("#minutesUntilSplit").val(gameEngine.simulation.minutesUntilSplit);
    }
}

let socket = io.connect("http://24.16.255.56:8888");

socket.on("load", function(data) {
    let simulation = data.simulation;
    gameEngine.restart();
    gameEngine.simulation.minutesUntilSplit = simulation.minutesToSplit;
    gameEngine.simulation.livingBacteriaCount = simulation.livingBacteriaCount;
    gameEngine.simulation.deadBacteriaCount = simulation.deadBacteriaCount;
    gameEngine.simulation.genCount = simulation.generationCount;
    gameEngine.simulation.currentResourcesAvailable = simulation.remainingResources;
    gameEngine.simulation.temperature = simulation.temperature;
    for (let b of simulation.bacteria) {
        let bac = new Bacteria(gameEngine, gameEngine.simulation, b.x, b.y, b.width, b.height, 0, {r:0, g:0, b:0});
        bac.width = b.width;
        bac.height = b.height;
        bac.originalWidth = b.originalWidth;
        bac.originalHeight = b.originalHeight;
        bac.maxWidth = b.maxWidth;
        bac.maxHeight = b.maxHeight;
        bac.deathTimer = b.deathTimer;
        bac.color = b.color;
        bac.finalXGrowStep = b.finalXGrowStep;
        bac.finalYGrowStep = b.finalYGrowStep;
        gameEngine.simulation.bacteria.push(bac);
        gameEngine.addEntity(bac);
    }
});

function saveSimulation () {
    let bacteria = [];
    for (let b of gameEngine.simulation.bacteria) {
        let obj = {
            x: b.x,
            y: b.y,
            originalWidth: b.originalWidth,
            originalHeight: b.originalHeight,
            height: b.height,
            width: b.width,
            maxWidth: b.maxWidth,
            maxHeight: b.maxHeight,
            finalXGrowStep: b.finalXGrowStep,
            finalYGrowStep: b.finalYGrowStep,
            deathTimer: b.deathTimer,
            color: b.color
        };

        bacteria.push(obj);
    }

    let simData = {
        studentname: "Connor Lundberg",
        statename: "Simulation Data",
        simulation: {
            minutesToSplit: gameEngine.simulation.minutesUntilSplit,
            livingBacteriaCount: gameEngine.simulation.bacteria.length,
            deadBacteriaCount: gameEngine.simulation.numberOfDead,
            generationCount: gameEngine.simulation.genCount,
            remainingResources: gameEngine.simulation.currentResourcesAvailable,
            temperature: gameEngine.simulation.temperature,
            bacteria: bacteria
        }
    };

    socket.emit("save", simData);
}

function loadSimulation () {
    console.log("Called load");
    socket.emit("load", {studentname: "Connor Lundberg", statename: "Simulation Data"})
}

let gameEngine;


// the "main" code begins here
let ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("../img/images.jpg");

ASSET_MANAGER.downloadAll(function() {

  let canvas = document.getElementById('gameWorld');
  let ctx = canvas.getContext('2d');

  //LOAD ENTITIES
  gameEngine = new GameEngine();

  gameEngine.init(ctx);
  gameEngine.start();
  gameEngine.beginSimulation();
  $("#startingResources").val(gameEngine.simulation.startingResourcesAvailable);
  $("#minutesUntilSplit").val(gameEngine.simulation.minutesUntilSplit);
});
