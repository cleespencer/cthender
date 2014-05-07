// 46,124 door location.
// gantry 144,28

function RescueShip(world, stage, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy) {
    "use strict";
    var texture;
    this.world = world;
    this.stage = stage;
    this.worldwidth = worldwidth;
    this.worldheight = worldheight;
    this.viewwidth = viewwidth;
    this.viewheight = viewheight;
    this.worldx = worldx;
    this.worldy = worldy;
    this.center = new PARTSYS.Vector(worldx + 112 / 2, worldy + 224 / 2);
    PIXI.DisplayObjectContainer.call(this);
    this.texture_door = ["rescue_door_1.png", "rescue_door_2.png", "rescue_door_3.png", "rescue_door_4.png", "rescue_door_5.png", "rescue_door_6.png", "rescue_door_7.png"];
    this.textureManWalking = ["man_walking_1_l.png", "man_walking_2_l.png", "man_walking_3_l.png", "man_walking_4_l.png", "man_walking_5_l.png", "man_walking_6_l.png"];
    texture = PIXI.Texture.fromFrame("rescue_door_1.png");
    this.door = new PIXI.Sprite(texture, texture.width, texture.height);
    this.door.position.x = 46;
    this.door.position.y = 124;
    this.doorincrement = 0;
    this.doorincrementdelta = .1;
    texture = PIXI.Texture.fromFrame("rescueship.png");
    this.ship = new PIXI.Sprite(texture, texture.width, texture.height);
    this.ship.position.x = 0;
    this.ship.position.y = 0;
    texture = PIXI.Texture.fromFrame("gantrypiece.png");
    this.gantry = new PIXI.Sprite(texture, texture.width, texture.height);
    this.gantry.position.x = 45;
    this.gantry.position.y = 120;
    this.man = null;
    this.men = 0;
    this.waitingfordoor = false;
    this.addChild(this.door);
    this.addChild(this.ship);
    this.addChild(this.gantry);
    this.width = 189;
    this.height = 224;
    this.visible = false;
    this.shiplaunchcomplete = false;
    this.shiptakeoff=false;
    this.takeoffdelta=.1;
    this.particlesystem = new PARTSYS.ParticleSystem();
    this.g = new PIXI.Graphics();
    this.addChild(this.g);

}

RescueShip.constructor = RescueShip;
RescueShip.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

RescueShip.prototype.takeoff = function () {
    "use strict";
    var gravity;
    this.gantry.visible=false;

    gravity = new PARTSYS.Field(-960, 0, 1920, this.height+540);
    gravity.onFieldInfluenced = this.applyGravity.bind(this);
    this.gravitypos = new PARTSYS.Vector(0, 0);

    this.thrusteremitter = new PARTSYS.Emitter();
    this.thrusteremitter.x = 49;
    this.thrusteremitter.y = 215;
    this.thrusteremitter.area = {"xanchor": 0, "yanchor": 0, "width": 14, "height": 2, "radius": 0};
    this.thrusteremitter.density = {"min": 5, "max": 15};
    this.thrusteremitter.angle = {"min": 87, "max": 93};
    this.thrusteremitter.speed = {"min": 3, "max": 5};
    this.thrusteremitter.rotation = 0;
    this.thrusteremitter.particlerotation = {"min": -1, "max": 1};
    this.thrusteremitter.emitterfields = [gravity];
    this.thrusteremitter.bounded = {"x": -960, "y": 0, "width": 1920, "height": 220, "type": "die"};
    this.thrusteremitter.maxparticles = 0;
    this.thrusteremitter.dienoparticles = false;
    this.thrusteremitter.lockparticles = true;

    this.thrusteremitter.onCreateParticle = this.createFireParticle.bind(this);
    this.thrusteremitter.onUpdateParticles = this.updateParticles.bind(this);
    this.thrusteremitter.onRemoveParticle = this.removeParticle.bind(this);
    this.particlesystem.addEmitter("thrusters", this.thrusteremitter);

    this.shiptakeoff=true;
};

RescueShip.prototype.createFireParticle = function (particle) {
    "use strict";
    var texture = PIXI.Texture.fromFrame("explodicle.png");
    particle.sprite = new PIXI.Sprite(texture, 2, 2);
    particle.sprite.position.x = particle.position.x;
    particle.sprite.position.y = particle.position.y;
    particle.sprite.anchor.x = .5;
    particle.sprite.anchor.y = .5;
    this.addChild(particle.sprite);
};

RescueShip.prototype.createSmokeParticle = function (particle) {
    "use strict";
    var texture = PIXI.Texture.fromFrame("smokicle.png");
    particle.sprite = new PIXI.Sprite(texture, 2, 2);
    particle.sprite.position.x = particle.position.x;
    particle.sprite.position.y = particle.position.y;
    particle.sprite.anchor.x = .5;
    particle.sprite.anchor.y = .5;
    this.addChild(particle.sprite);
};

RescueShip.prototype.updateParticles = function (emitter, particles) {
    "use strict";
    var i, particle;
    for (i = 0; i < particles.length; i++) {
        particle = particles[i];
        particle.sprite.position.x = particle.position.x;
        particle.sprite.position.y = particle.position.y;
        particle.sprite.rotation = PARTSYS.degreesToRadians(particle.angle);
    }
};

RescueShip.prototype.removeParticle = function (particle) {
    "use strict";
    this.removeChild(particle.sprite);
    particle.sprite = null;
};

RescueShip.prototype.applyWell = function (particle, wellx, welly, wellstrength) {
    "use strict";
    var force;
    var vX = 0;
    var vY = 0;

    vX = wellx - particle.position.x;
    vY = welly - particle.position.y;
    force = wellstrength / Math.pow(vX * vX + vY * vY, 1.5);

    return new PARTSYS.Vector(vX * force, vY * force);
};

RescueShip.prototype.applyGravity = function (particle) {
    "use strict";
    particle.velocity.selfAdd(this.applyWell(particle, 56, 300, 10000));
};

RescueShip.prototype.isClear = function () {
    "use strict";
    return !(this.men || this.man);
};

RescueShip.prototype.cleanup = function () {
    "use strict";
    this.removeChild(this.door);
    this.removeChild(this.ship);
    this.removeChild(this.gantry);
    if (this.man) {
        this.removeChild(this.man);
    }
};

RescueShip.prototype.everySecond = function (e) {
    "use strict";

};

RescueShip.prototype.startMan = function () {
    "use strict";
    var texture;
    texture = PIXI.Texture.fromFrame("man_walking_1_l.png");
    this.man = new PIXI.Sprite(texture, texture.width, texture.height);
    this.man.position.x = this.gantry.position.x + this.gantry.width;
    this.man.position.y = this.gantry.position.y + 2;
    this.man.textureincrement = 0;
    this.man.visible = true;
    this.addChildAt(this.man, 2);
};

RescueShip.prototype.addMan = function () {
    "use strict";
    this.men++;
    if (this.man) {
        return;
    }
    this.startMan();
};

RescueShip.prototype.updateDoor = function (dt) {
    "use strict";
    var texture;
    this.doorincrement += this.doorincrementdelta;
    if (this.doorincrement > this.texture_door.length - 1) {
        this.doorincrementdelta = -this.doorincrementdelta;
        this.doorincrement += this.doorincrementdelta;
        this.removeChild(this.man);
        this.man = null;
        this.men--;
        if (this.men) {
            this.startMan();
        }
    }
    if (this.doorincrement < 0) {
        this.doorincrement = 0;
        this.doorincrementdelta = .1;
        this.waitingfordoor = false;
    }
    texture = PIXI.Texture.fromFrame(this.texture_door[Math.floor(this.doorincrement)]);
    this.door.setTexture(texture);
};

RescueShip.prototype.updateMan = function (dt) {
    "use strict";
    var texture;
    this.man.position.x -= .5 * dt * PARTSYS.framerate;
    if (this.man.position.x < this.gantry.x + 6) {
        this.man.textureincrement = 0;
        this.waitingfordoor = true;
    }
    this.man.textureincrement += .1;
    if (this.man.textureincrement > this.textureManWalking.length - 1) {
        this.man.textureincrement = 0;
    }
    texture = PIXI.Texture.fromFrame(this.textureManWalking[Math.floor(this.man.textureincrement)]);
    this.man.setTexture(texture);
};

RescueShip.prototype.update = function (newx, dt) {
    "use strict";
    this.visible = false;
    var x, y = this.worldy, rightmost, fragment = -1;
    rightmost = newx + this.viewwidth;
    if (rightmost > this.worldwidth) {
        fragment = rightmost - this.worldwidth - 1;
    }

    if (fragment === -1) {
        if (this.worldx > newx - this.width && this.worldx < rightmost + this.width) {
            x = this.worldx - newx;
            this.visible = true;
        }
    } else if (this.worldx > newx - this.width && this.worldx <= this.worldwidth) {
        x = this.worldx - newx;
        this.visible = true;
    } else if (this.worldx < fragment + this.width) {
        x = this.worldwidth - newx + this.worldx;
        this.visible = true;
    }
    if (this.shiptakeoff) {
        this.thrusteremitter.bounded.height+=this.takeoffdelta;
        this.worldy-=this.takeoffdelta;
        this.takeoffdelta+=.02;
        y=this.worldy;
        if (this.worldy<(-1*this.ship.height-100)) {
            this.visible=false;
            this.shiplaunchcomplete = true;
        }
        this.particlesystem.update();
    }
    if (this.visible) {
        this.position.x = x;
        this.position.y = y;
    }
    if (this.man && !this.waitingfordoor) {
        this.updateMan(dt);
    }
    if (this.waitingfordoor) {
        this.updateDoor(dt);
    }
};