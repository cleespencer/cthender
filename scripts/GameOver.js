function GameOver(stage, renderer, game, men) {
    "use strict";
    var texture, sound;
    this.stage = stage;
    this.renderer = renderer;
    this.game = game;
    this.gamemen = men;
    this.men = [];
    this.playerfuel = 4;
    texture = PIXI.Texture.fromFrame("bg-1.png");
    this.bg1 = new PIXI.Sprite(texture, texture.width, texture.height);
    texture = PIXI.Texture.fromFrame("bg-2.png");
    this.bg2 = new PIXI.Sprite(texture, texture.width, texture.height);
    this.bg2.position.y = 540 - this.bg2.height;
    texture = PIXI.Texture.fromFrame("moon.png");
    this.moon = new PIXI.Sprite(texture, texture.width, texture.height);
    this.moon.position.x = 480 - (this.moon.width / 2);
    this.moon.position.y = 50;
    this.stage.addChild(this.bg1);
    this.stage.addChild(this.bg2);
    this.stage.addChild(this.moon);
    this.city = [];
    this.cthings = [];
    this.particlesystem = new PARTSYS.ParticleSystem();
    this.buildCity();
    this.congrats();
    this.sound = new Howl({urls: ['resources/sounds/gameover.mp3'], volume: 1.0}).play();
}

GameOver.WORLDMAX = 960;

GameOver.constructor = GameOver;
GameOver.prototype = Object.create(Object.prototype);

GameOver.prototype.congrats = function () {
    "use strict";
    var regretstext, savedtext, highscore, maxwave, hitentertext, scoretext, saved = 0, i;
    for (i = 0; i < this.gamemen.length; i++) {
        if (this.gamemen[i].status === "saved") {
            saved++;
        }
    }
    regretstext = new PIXI.Text("Game Over!", {font: "20px Play", fill: "white", align: "left"});
    regretstext.position.x = 480 - (regretstext.width / 2);
    regretstext.position.y = this.moon.position.y + this.moon.height + 5;
    this.stage.addChild(regretstext);
    scoretext = new PIXI.Text("Your final SCORE is " + this.game.score + " on WAVE " + this.game.wave,
                              {font: "20px Play", fill: "red", align: "left"});
    scoretext.position.x = 480 - (scoretext.width / 2);
    scoretext.position.y = regretstext.y + regretstext.height + 5;
    this.stage.addChild(scoretext);
    savedtext = new PIXI.Text("You only saved " + saved + " of " + this.gamemen.length + " men",
                              {font: "20px Play", fill: "white", align: "left"});
    savedtext.position.x = 480 - (savedtext.width / 2);
    savedtext.position.y = scoretext.y + scoretext.height + 5;
    this.stage.addChild(savedtext);
    hitentertext = new PIXI.Text("Are you going to let them get away with it?\nMan up and hit the 'Enter' key to continue the fight...",
                                 {font: "20px Play", fill: "white", align: "center"});
    hitentertext.position.x = 480 - (hitentertext.width / 2);
    hitentertext.position.y = savedtext.y + savedtext.height + 5;
    this.stage.addChild(hitentertext);

    if ('localStorage' in window && window['localStorage'] !== null) {
        highscore = localStorage["highscore"] || 0;
        maxwave = localStorage["maxwave"] || 1;
        if (this.game.score > highscore) {
            highscore = this.game.score;
        }
        if (this.game.wave > maxwave) {
            maxwave = this.game.wave;
        }
        localStorage["highscore"] = highscore.toString(10);
        localStorage["maxwave"] = maxwave.toString(10);
    }
};

GameOver.prototype.generateEmitter = function (x, width, height) {
    "use strict";
    var fireemitter, smokeemitter;
    fireemitter = new PARTSYS.Emitter();
    fireemitter.x = x;
    fireemitter.y = 540 - (Math.floor(Math.random() * height));
    fireemitter.area = {"xanchor": 0, "yanchor": 0, "width": width, "height": 2, "radius": 0};
    fireemitter.density = {"min": 25, "max": 50};
    fireemitter.angle = {"min": 267, "max": 273};
    fireemitter.speed = {"min": 1, "max": 2};
    fireemitter.rotation = 0;
    fireemitter.particlerotation = {"min": -5, "max": 5};
    fireemitter.lifetime = {"min": 10, "max": 15};
    fireemitter.bounded = {"x": 0, "y": 0, "width": 960, "height": 540, "type": "die"};
    fireemitter.maxparticles = 0;
    fireemitter.dienoparticles = false;

    fireemitter.onCreateParticle = this.createFireParticle.bind(this);
    fireemitter.onUpdateParticles = this.updateParticles.bind(this);
    fireemitter.onRemoveParticle = this.removeParticle.bind(this);
    this.particlesystem.addEmitter("fire" + x, fireemitter);

    smokeemitter = new PARTSYS.Emitter();
    smokeemitter.x = x;
    smokeemitter.y = fireemitter.y;
    smokeemitter.area = {"xanchor": 0, "yanchor": 0, "width": width, "height": 2, "radius": 0};
    smokeemitter.density = {"min": 2, "max": 5};
    smokeemitter.angle = {"min": 267, "max": 273};
    smokeemitter.speed = {"min": .25, "max": .5};
    smokeemitter.rotation = 0;
    smokeemitter.particlerotation = {"min": -5, "max": 5};
    smokeemitter.lifetime = {"min": 240, "max": 340};
    smokeemitter.bounded = {"x": 0, "y": 0, "width": 960, "height": 540, "type": "die"};
    smokeemitter.maxparticles = 0;
    smokeemitter.dienoparticles = false;

    smokeemitter.onCreateParticle = this.createSmokeParticle.bind(this);
    smokeemitter.onUpdateParticles = this.updateParticles.bind(this);
    smokeemitter.onRemoveParticle = this.removeParticle.bind(this);
    this.particlesystem.addEmitter("smoke" + x, smokeemitter);

};

GameOver.prototype.createFireParticle = function (particle) {
    "use strict";
    var texture = PIXI.Texture.fromFrame("explodicle.png");
    particle.sprite = new PIXI.Sprite(texture, 32, 32);
    particle.sprite.position.x = particle.position.x;
    particle.sprite.position.y = particle.position.y;
    particle.sprite.anchor.x = .5;
    particle.sprite.anchor.y = .5;
    this.stage.addChild(particle.sprite);
};

GameOver.prototype.createSmokeParticle = function (particle) {
    "use strict";
    var texture = PIXI.Texture.fromFrame("smokicle.png");
    particle.sprite = new PIXI.Sprite(texture, 32, 32);
    particle.sprite.position.x = particle.position.x;
    particle.sprite.position.y = particle.position.y;
    particle.sprite.anchor.x = .5;
    particle.sprite.anchor.y = .5;
    this.stage.addChild(particle.sprite);
};

GameOver.prototype.updateParticles = function (emitter, particles) {
    "use strict";
    var i, particle;
    for (i = 0; i < particles.length; i++) {
        particle = particles[i];
        particle.visible = true;
        particle.sprite.position.x = particle.position.x;
        particle.sprite.position.y = particle.position.y;
        particle.sprite.rotation = PARTSYS.degreesToRadians(particle.angle);
    }
};

GameOver.prototype.removeParticle = function (particle) {
    "use strict";
    this.stage.removeChild(particle.sprite);
    particle.sprite = null;
};

GameOver.prototype.buildCity = function () {
    "use strict";
    var x = 0, buildingtype, building, manx, many, man, i, cthing, y;
    while (x < GameOver.WORLDMAX) {
        buildingtype = Math.ceil(Math.random() * 3) - 1;
        if (GameOver.WORLDMAX - x < 160) {
            buildingtype = 0;
        }
        if (buildingtype === 0) {
            building = new BuildingObject("building03x1.png", 80, 156,
                                          GameOver.WORLDMAX, 540, 960, 540, x, 540 - 156);
            this.generateEmitter(x, 80, 156);
            x += 80;
        }
        else if (buildingtype === 1) {
            building = new BuildingObject("building02x1.png", 80, 188,
                                          GameOver.WORLDMAX, 540, 960, 540, x, 540 - 188);
            this.generateEmitter(x, 80, 188);
            x += 80;
        }
        else {
            building = new BuildingObject("building01x2.png", 160, 125,
                                          GameOver.WORLDMAX, 540, 960, 540, x, 540 - 125);
            this.generateEmitter(x, 160, 125);
            x += 160;

        }
        if (Math.random() < .75) {
            manx = building.worldx + Math.floor(building.width / 2) - 6;
            many = building.worldy - 24;
            man = new ManObject(this, GameWorld.WORLDMAX, 540, 960, 540, manx, many);
            this.stage.addChild(man);
            this.men.push({"sprite": man, "flyingsprite": null, "status": "standing", "fallheight": null});
        }
        this.stage.addChild(building);
        this.city.push(building);
    }
    for (i = 0; i < 10; i++) {
        x = Math.floor(Math.random() * 900);
        y = Math.floor(Math.random() * 300);
        cthing = new Cthing(this, this.stage, GameOver.WORLDMAX, 540, 960, 540, x, y);
        this.cthings.push(cthing);
        this.stage.addChild(cthing);
    }
};

GameOver.prototype.cleanup = function () {
    "use strict";
    this.sound.stop();
};

GameOver.prototype.status = function () {
    "use strict";
    return true;
};

GameOver.prototype.secondTick = function (e) {
    "use strict";
    var i;
    for (i = 0; i < this.cthings.length; i++) {
        this.cthings[i].everySecond(e);
    }

};

GameOver.prototype.update = function (dt) {
    "use strict";
    var i;
    for (i = 0; i < this.city.length; i++) {
        this.city[i].update(0);
    }
    for (i = 0; i < this.men.length; i++) {
        this.men[i].sprite.update(0, this.men[i], null, dt);
    }
    for (i = 0; i < this.cthings.length; i++) {
        this.cthings[i].update(0, dt);
    }
    this.particlesystem.update(dt);
    this.renderer.render(this.stage);
};

GameOver.prototype.checkKeyUp = function (key) {
    "use strict";

};

GameOver.prototype.checkKeyDown = function (key) {
    "use strict";

};