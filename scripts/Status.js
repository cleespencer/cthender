function Status(stage, game, world) {
    "use strict";
    var texture, thrust, emitter;
    this.stage = stage;
    this.game = game;
    this.world = world;
    this.particlesystem = new PARTSYS.ParticleSystem();
    this.g = new PIXI.Graphics();
    this.stage.addChild(this.g);
    this.g.x = 0;
    this.g.y = this.world.viewheight;
    this.g.width = this.world.viewwidth;
    this.g.height = 50;
    this.g.lineStyle(2, 0xFFFFFF, 1);
    this.g.beginFill(0xFFFFFF);
    this.g.moveTo(0, 0);
    this.g.lineTo(this.world.viewwidth, 0);
    this.g.endFill();

    thrust = new PIXI.Text("Thrust", {font: "20px Play", fill: "white", align: "left"});
    thrust.position.x = this.world.viewwidth - 200;
    thrust.position.y = 5;
    this.thrustbar = new PIXI.Graphics();
    this.thrustbar.x = thrust.position.x + thrust.width + 5;
    this.thrustbar.y = thrust.position.y;
    this.thrustbar.width = 160;
    this.thrustbar.height = thrust.height;
    this.g.addChild(thrust);
    this.g.addChild(this.thrustbar);
    this.cachethrust = null;

    this.menleft = new PIXI.Text("99", {font: "20px Play", fill: "white", align: "left"});
    this.menleft.position.x = this.world.viewwidth - 300;
    this.menleft.position.y = 35;
    this.mensaved = new PIXI.Text("99", {font: "20px Play", fill: "white", align: "left"});
    this.mensaved.position.x = this.world.viewwidth - 200;
    this.mensaved.position.y = 35;
    this.mendead = new PIXI.Text("99", {font: "20px Play", fill: "white", align: "left"});
    this.mendead.position.x = this.world.viewwidth - 100;
    this.mendead.position.y = 35;
    this.g.addChild(this.menleft);
    this.g.addChild(this.mensaved);
    this.g.addChild(this.mendead);
    texture = PIXI.Texture.fromFrame("man_standing_1.png");
    this.manleftsprite = new PIXI.Sprite(texture, 12, 24);
    this.manleftsprite.position.x = this.menleft.position.x + this.menleft.width + 5;
    this.manleftsprite.position.y = this.menleft.position.y + (this.menleft.height / 2) - (this.manleftsprite.height / 2);
    this.manleftaction = {"acting": false, "increment": 0, "delta": .1,
        "frames"                  : ["man_standing_1.png", "man_jumping_1.png", "man_jumping_2.png",
            "man_jumping_3.png", "man_jumping_4.png", "man_jumping_5.png"]};
    this.manleftsprite.scale.x = .75;
    this.manleftsprite.scale.y = .75;
    texture = PIXI.Texture.fromFrame("man_standing_1.png");
    this.mansavedsprite = new PIXI.Sprite(texture, 12, 24);
    this.mansavedsprite.position.x = this.mensaved.position.x + this.mensaved.width + 5;
    this.mansavedsprite.position.y = this.mensaved.position.y + (this.mensaved.height / 2) - (this.mansavedsprite.height / 2);
    this.mansavedaction = {"acting": false, "increment": 0, "delta": .1,
        "frames"                   : ["man_standing_1.png", "man_saluting_1.png", "man_saluting_2.png",
            "man_saluting_3.png", "man_saluting_4.png", "man_saluting_5.png",
            "man_saluting_6.png"]};
    this.mansavedsprite.scale.x = .75;
    this.mansavedsprite.scale.y = .75;

    texture = PIXI.Texture.fromFrame("man_standing_1.png");
    this.mandeadsprite = new PIXI.Sprite(texture, 12, 24);
    this.mandeadsprite.position.x = this.mendead.position.x + this.mendead.width + 5;
    this.mandeadsprite.position.y = this.mendead.position.y + (this.mendead.height / 2) - (this.mandeadsprite.height / 2);
    this.mandeadsprite.scale.x = .75;
    this.mandeadsprite.scale.y = .75;

    this.mandeadaction = {"acting": false,
        "increment"               : 0,
        "delta"                   : .1,
        "frames"                  : ["man_splat_1.png", "man_splat_2.png", "man_splat_3.png", "man_splat_4.png", "man_splat_5.png",
            "man_limb.png", "man_limb.png", "man_limb.png", "man_limb.png", "man_head.png"]};

    this.g.addChild(this.manleftsprite);
    this.g.addChild(this.mansavedsprite);
    this.g.addChild(this.mandeadsprite);

    this.wave = new PIXI.Text("Wave: 999", {font: "20px Play", fill: "white", align: "left"});
    this.wave.position.x = 5;
    this.wave.position.y = 5;
    this.score = new PIXI.Text("Score: 0", {font: "20px Play", fill: "white", align: "left"});
    this.score.position.x = 5;
    this.score.position.y = this.wave.height + 10;
/*    this.playerpos = new PIXI.Text("Position", {font: "20px Play", fill: "white", align: "left"});
    this.playerpos.position.x = this.wave.position.x + this.wave.width + 5;
    this.playerpos.position.y = 5;*/
    this.g.addChild(this.wave);
    this.g.addChild(this.score);
    //this.g.addChild(this.playerpos);
    this.update();
    this.updateMen();
    this.updateWave();
    this.updateScore();
}

Status.constructor = Status;
Status.prototype = Object.create(Object.prototype);

Status.prototype.cleanup = function () {
    "use strict";
    if (this.particlesystem.getEmitter("scoreblooie")) {
        this.particlesystem.removeEmitter("scoreblooie");
    }
    this.g.removeChildren();
    this.g.clear();
};

Status.prototype.cleanupTheDead = function () {
    "use strict";
    this.mandeadsprite.visible = true;
    this.mandeadaction.acting = false;
};

Status.prototype.createParticle = function (particle) {
    "use strict";
    var texture = PIXI.Texture.fromFrame(this.mandeadaction.frames[Math.floor(Math.random() * this.mandeadaction.frames.length)]);
    particle.sprite = new PIXI.Sprite(texture, 32, 32);
    particle.sprite.position.x = particle.position.x;
    particle.sprite.position.y = particle.position.y;
    particle.sprite.anchor.x = .5;
    particle.sprite.anchor.y = .5;
    this.g.addChild(particle.sprite);
};

Status.prototype.updateParticles = function (emitter, particles) {
    "use strict";
    var i, particle;
    for (i = 0; i < particles.length; i++) {
        particle = particles[i];
        particle.sprite.position.x = particle.position.x;
        particle.sprite.position.y = particle.position.y;
        particle.sprite.rotation = PARTSYS.degreesToRadians(particle.angle);
    }
};

Status.prototype.removeParticle = function (particle) {
    "use strict";
    this.g.removeChild(particle.sprite);
    particle.sprite = null;
};

Status.prototype.updateThrust = function () {
    "use strict";
    var fuel;
    if (!this.world.player) {
        fuel = 4;
    } else {
        fuel = this.world.player.playerfuel;
    }
    if (this.cachethrust === fuel) {
        return;
    }
    this.cachethrust = fuel;
    var thrustpixels = (fuel - 1) * 40;
    this.thrustbar.clear();
    this.thrustbar.lineStyle(1, 0xFF0000, 1);
    this.thrustbar.beginFill(0xFF0000);
    this.thrustbar.drawRect(0, 0, thrustpixels, this.thrustbar.height);
    this.thrustbar.endFill();
};

Status.prototype.actMen = function (sprite, action) {
    "use strict";
    var texture;
    if (!action.acting) {
        return;
    }
    action.increment += action.delta;
    if (action.increment >= action.frames.length) {
        action.increment = action.frames.length - 1;
        action.delta = -action.delta;
    }
    if (action.increment < 0) {
        action.acting = false;
        action.increment = 0;
        action.delta = .1;
    }
    texture = PIXI.Texture.fromFrame(action.frames[Math.floor(action.increment)]);
    sprite.setTexture(texture);
};

Status.prototype.updateMen = function () {
    "use strict";
    var countliving = 0, countdead = 0, countsaved = 0, i, man;
    for (i = 0; i < this.world.men.length; i++) {
        man = this.world.men[i].status;
        if (man === "saved") {
            countsaved++;
        } else if (man === "dead") {
            countdead++;
        } else {
            countliving++;
        }
    }
    this.mendead.setText(countdead);
    this.menleft.setText(countliving);
    this.mensaved.setText(countsaved);
};

Status.prototype.updateScore = function () {
    "use strict";
    this.score.setText("Score: " + this.game.score);
};

Status.prototype.updateWave = function () {
    "use strict";
    this.wave.setText("Wave: " + this.game.wave);
};

Status.prototype.statusTick = function (e) {
    "use strict";
    var emitter;
    if (Math.random() < .1) {
        this.manleftaction.acting = true;
    }
    if (Math.random() < .1) {
        this.mansavedaction.acting = true;
    }
    if (Math.random() < .1) {
        if (!this.particlesystem.getEmitter("scoreblooie")) {
            emitter = new PARTSYS.Emitter();
            emitter.x = this.mendead.position.x + this.mendead.width + 20;
            emitter.y = this.mendead.position.y + 10;
            emitter.area = {"xanchor": .5, "yanchor": .5, "width": 1, "height": 1, "radius": 5};
            emitter.density = {"min": 1, "max": 10};
            emitter.angle = {"min": 0, "max": 359};
            emitter.speed = {"min": .1, "max": .5};
            emitter.rotation = 0;
            emitter.particlerotation = {"min": -2, "max": 2};
            emitter.bounded = {"x": emitter.x - 10, "y": emitter.y - 10, "width": 20, "height": 20, "type": "die"};
            emitter.maxparticles = 10;
            emitter.dienoparticles = true;
            emitter.lockparticles = true;
            emitter.onCreateParticle = this.createParticle.bind(this);
            emitter.onUpdateParticles = this.updateParticles.bind(this);
            emitter.onRemoveParticle = this.removeParticle.bind(this);
            emitter.onCleanup = this.cleanupTheDead.bind(this);

            this.mandeadsprite.visible = false;
            this.particlesystem.addEmitter("scoreblooie", emitter);
        }
    }
    this.updateScore();
    this.updateWave();
    this.updateMen();
};

Status.prototype.update = function () {
    "use strict";
    this.updateThrust();
    this.actMen(this.mansavedsprite, this.mansavedaction);
    this.actMen(this.manleftsprite, this.manleftaction);
    this.particlesystem.update();
/*    if (this.world.player) {
        this.playerpos.setText("Position(" + Math.floor(this.world.player.worldx) + "," + Math.floor(this.world.player.worldy) + ")");
    }*/
};