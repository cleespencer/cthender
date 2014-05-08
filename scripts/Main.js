var frametime = 1000 / 60;

function timeStamp() {
    "use strict";
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

function Main(saferenderer, gamevolume) {
    "use strict";
    this.stats = new Stats();
    this.stats.setMode(1);
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0px';
    this.stats.domElement.style.top = '0px';
    document.getElementById('gamediv').appendChild(this.stats.domElement);

    this.stage = new PIXI.Stage(0x000000);
    if (saferenderer) {
        this.renderer = new PIXI.CanvasRenderer(
            960,
            595,
            document.getElementById("game-canvas")
        );

    } else {
        this.renderer = PIXI.autoDetectRenderer(
            960,
            595,
            document.getElementById("game-canvas")
        );
    }
    this.renderer.view.className = "rendererView";
    this.wave = 1;
    this.score = 0;
    this.secondTickInterval = null;
    this.firstinit = true;
    this.gameworld = null;
    this.everySecond = null;
    if (!Howler.usingWebAudio) {
        Howler.mute();
    } else {
        Howler.volume(gamevolume);
    }
    this.loadSpriteSheet();
}

Main.constructor = Main;
Main.prototype = Object.create(Object.prototype);

Main.prototype.update = function () {
    "use strict";
    var now, dt, secondcheck;
    if (document.hidden) {
        this.lasttimestamp = null;
        return;
    }
    now = timeStamp();
    if (this.lasttimestamp === null) {
        this.lasttimestamp = now;
    }
    if (this.secondTickInterval === null) {
        this.secondTickInterval = now;
        secondcheck = 1000;
    } else {
        secondcheck = now - this.secondTickInterval;
    }
    if (secondcheck >= 1000) {
        this.secondTickInterval = timeStamp() - (secondcheck - 1000);
        this.everySecond(secondcheck);
    }
    dt = now - this.lasttimestamp;
    this.lasttimestamp = now;
    this.accumulator += dt;

    this.stats.begin();
    while (this.accumulator >= dt) {
        this.gameworld.update(dt);
        this.accumulator -= dt;
        if (dt === 0) {
            break;
        }
    }
    this.status.update();
    this.stats.end();
    requestAnimFrame(this.update.bind(this));
};

Main.prototype.loadSpriteSheet = function () {
    "use strict";
    var assetsToLoad = ["resources/buildings.json"];
    var loader = new PIXI.AssetLoader(assetsToLoad);
    loader.onComplete = this.spriteSheetLoaded.bind(this);
    loader.load();
};

Main.prototype.newWave = function () {
    "use strict";
    this.everySecond = this.everyWaveSecond;
    if (this.gameworld) {
        this.wave++;
        this.status.cleanup();
        this.gameworld.cleanup();
        this.stage.removeChildren();
    }
    this.gameworld = new GameWorld(this.stage, this.renderer, this);
    this.status = new Status(this.stage, this, this.gameworld);
    this.lasttimestamp = null;
    this.secondTickInterval = null;
    this.accumulator = 0;
};

Main.prototype.newIntermission = function () {
    "use strict";
    var men, intermissiontype, menneeded, i, saved = 0;
    for (i = 0; i < this.gameworld.men.length; i++) {
        if (this.gameworld.men[i].status === "saved") {
            saved++;
        }
    }
    menneeded = Math.floor(this.gameworld.men.length * (Math.floor(50 + (this.wave / 5) * 5) / 100));
    this.everySecond = this.everyIntermissionSecond;
    if (this.gameworld) {
        men = this.gameworld.men;
        this.status.cleanup();
        this.gameworld.cleanup();
        this.stage.removeChildren();
    }
    intermissiontype = saved >= menneeded;
    if (intermissiontype) {
        this.gameworld = new Intermission(this.stage, this.renderer, this, men);
    } else {
        this.gameworld = new GameOver(this.stage, this.renderer, this, men);
        this.wave = 0;
        this.score = 0;
    }
    this.status = new Status(this.stage, this, this.gameworld);
    this.lasttimestamp = null;
    this.secondTickInterval = null;
    this.accumulator = 0;
};

Main.prototype.spriteSheetLoaded = function () {
    "use strict";
    this.newWave();
    window.onkeydown = this.checkKeyDown.bind(this);
    window.onkeyup = this.checkKeyUp.bind(this);
    requestAnimFrame(this.update.bind(this));
};

Main.prototype.everyIntermissionSecond = function (e) {
    "use strict";
    this.gameworld.secondTick(e);
    this.status.statusTick(e);
    if (!this.gameworld.status()) {
        this.newWave();
    }
};

Main.prototype.everyWaveSecond = function (e) {
    "use strict";
    this.gameworld.secondTick(e);
    this.status.statusTick(e);
    if (!this.gameworld.status()) {
        this.newIntermission();
    }
};

Main.prototype.checkKeyUp = function (e) {
    "use strict";
    var key = window.event ? event.keyCode : e.keyCode;
    if (Howler.usingWebAudio) {
        if (key == 86) { // v = volume up;
            Howler.volume(Howler.volume() + .1);
        }
        if (key == 66) { // b = volume down;
            Howler.volume(Howler.volume() - .1);
        }
    }
    if (key === 13 && (this.gameworld instanceof Intermission || this.gameworld instanceof GameOver)) {
        this.newWave();
        return;
    }
    this.gameworld.checkKeyUp(key);
};

Main.prototype.checkKeyDown = function (e) {
    "use strict";
    var key = window.event ? event.keyCode : e.keyCode;
    this.gameworld.checkKeyDown(key);
    e.preventDefault();
};
