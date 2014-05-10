function ExplodyShip(stage, particlesystem, playerdirection, worldwidth, worldheight, viewwidth, viewheight, worldx,
                     worldy, newx) {
    "use strict";
    var emitter, emitterfire, emittersmoke, gravity, rightmost, fragment = -1;
    this.stage = stage;
    this.worldwidth = worldwidth;
    this.worldheight = worldheight;
    this.viewwidth = viewwidth;
    this.viewheight = viewheight;
    this.worldx = worldx;
    this.worldy = worldy;
    this.playerdirection = playerdirection;
    this.onDone = null;
    this.particlesystem = particlesystem;

    gravity = new PARTSYS.Field(0, 0, viewwidth, viewheight);
    gravity.onFieldInfluenced = this.applyGravity.bind(this);

    // create an Emitter
    emitter = new PARTSYS.Emitter();
    emitter.x = worldx;
    emitter.y = worldy;
    emitter.area = {"xanchor": .5, "yanchor": .5, "width": 1, "height": 1, "radius": 0};
    emitter.density = {"min": 1, "max": 5};
    emitter.angle = {"min": 0, "max": 359};
    emitter.speed = {"min": 1, "max": 3};
    emitter.rotation = 0;
    emitter.particlerotation = {"min": -5, "max": 5};
    //emitter.lifetime = {"min":300,"max":900};
    emitter.bounded = {"x": -32, "y": -64, "width": viewwidth + 64, "height": viewheight + 64, "type": "die"};
    emitter.maxparticles = 10;
    emitter.dienoparticles = true;
    emitter.lockparticles = true;
    emitter.emitterfields = [gravity];
    emitter.onCreateParticle = this.createParticle.bind(this);
    emitter.onUpdateParticles = this.updateParticles.bind(this);
    emitter.onRemoveParticle = this.removeParticle.bind(this);
    emitter.onCleanup = this.cleanup.bind(this);

    emitterfire = new PARTSYS.Emitter();
    emitterfire.x = worldx;
    emitterfire.y = worldy;
    emitterfire.area = {"xanchor": .5, "yanchor": .5, "width": 1, "height": 1, "radius": 0};
    emitterfire.density = {"min": 100, "max": 500};
    emitterfire.angle = {"min": 0, "max": 359};
    emitterfire.speed = {"min": 5, "max": 15};
    emitterfire.rotation = 0;
    emitterfire.particlerotation = {"min": -1, "max": 1};
    emitterfire.lifetime = {"min": 120, "max": 300};
    emitterfire.bounded = {"x": -32, "y": -128, "width": viewwidth + 32, "height": viewheight + 160, "type": "die"};
    emitterfire.maxparticles = 500;
    emitterfire.dienoparticles = true;
    emitterfire.lockparticles = true;
    emitterfire.emitterfields = [gravity];
    emitterfire.onCreateParticle = this.createFireParticle.bind(this);
    emitterfire.onUpdateParticles = this.updateParticles.bind(this);
    emitterfire.onRemoveParticle = this.removeParticle.bind(this);

    emittersmoke = new PARTSYS.Emitter();
    emittersmoke.x = worldx;
    emittersmoke.y = worldy;
    emittersmoke.area = {"xanchor": .5, "yanchor": .5, "width": 1, "height": 1, "radius": 10};
    emittersmoke.density = {"min": 250, "max": 500};
    emittersmoke.angle = {"min": 0, "max": 359};
    emittersmoke.speed = {"min": 1, "max": 2};
    emittersmoke.rotation = 0;
    emittersmoke.particlerotation = {"min": -1, "max": 1};
    emittersmoke.lifetime = {"min": 30, "max": 120};
    emittersmoke.bounded = {"x": -32, "y": -128, "width": viewwidth + 32, "height": viewheight + 160, "type": "die"};
    emittersmoke.maxparticles = 500;
    emittersmoke.dienoparticles = true;
    emittersmoke.lockparticles = true;
    emittersmoke.emitterfields = [gravity];
    emittersmoke.onCreateParticle = this.createSmokeParticle.bind(this);
    emittersmoke.onUpdateParticles = this.updateParticles.bind(this);
    emittersmoke.onRemoveParticle = this.removeParticle.bind(this);

    rightmost = newx + this.viewwidth;

    if (rightmost > this.worldwidth) {
        fragment = rightmost - this.worldwidth - 1;
    }
    if (fragment === -1) {
        emitter.x = this.worldx - newx;
        emitterfire.x = this.worldx - newx;
        emittersmoke.x = this.worldx - newx;
    } else {
        if (this.worldx <= fragment) {
            emitter.x = this.worldwidth - newx + this.worldx;
            emitterfire.x = this.worldwidth - newx + this.worldx;
            emittersmoke.x = this.worldwidth - newx + this.worldx;
        } else {
            emitter.x = this.worldx - newx;
            emitterfire.x = this.worldx - newx;
            emittersmoke.x = this.worldx - newx;
        }
    }

    particlesystem.addEmitter("junk1", emitter);
    particlesystem.addEmitter("fire1", emitterfire);
    particlesystem.addEmitter("smoke1", emittersmoke);
}

ExplodyShip.constructor = ExplodyShip;
ExplodyShip.prototype = Object.create(Object.prototype);

ExplodyShip.prototype.createParticle = function (particle) {
    "use strict";
    var texture = PIXI.Texture.fromFrame("ship_wreck_" + Math.ceil(Math.random() * 6) + ".png");
    particle.sprite = new PIXI.Sprite(texture, 32, 32);
    particle.sprite.position.x = particle.position.x;
    particle.sprite.position.y = particle.position.y;
    particle.sprite.anchor.x = .5;
    particle.sprite.anchor.y = .5;
    this.stage.addChild(particle.sprite);
};

ExplodyShip.prototype.createFireParticle = function (particle) {
    "use strict";
    var texture = PIXI.Texture.fromFrame("explodicle.png");
    particle.sprite = new PIXI.Sprite(texture, 2, 2);
    particle.sprite.position.x = particle.position.x;
    particle.sprite.position.y = particle.position.y;
    particle.sprite.anchor.x = .5;
    particle.sprite.anchor.y = .5;
    this.stage.addChild(particle.sprite);
};

ExplodyShip.prototype.createSmokeParticle = function (particle) {
    "use strict";
    var texture = PIXI.Texture.fromFrame("smokicle.png");
    particle.sprite = new PIXI.Sprite(texture, 2, 2);
    particle.sprite.position.x = particle.position.x;
    particle.sprite.position.y = particle.position.y;
    particle.sprite.anchor.x = .5;
    particle.sprite.anchor.y = .5;
    this.stage.addChild(particle.sprite);
};

ExplodyShip.prototype.updateParticles = function (emitter, particles) {
    "use strict";
    var i, particle;
    for (i = 0; i < particles.length; i++) {
        particle = particles[i];
        particle.sprite.position.x = particle.position.x;
        particle.sprite.position.y = particle.position.y;
        particle.sprite.rotation = PARTSYS.degreesToRadians(particle.angle);
    }
};

ExplodyShip.prototype.removeParticle = function (particle) {
    "use strict";
    this.stage.removeChild(particle.sprite);
    particle.sprite = null;
};

ExplodyShip.prototype.applyWell = function (particle, wellx, welly, wellstrength) {
    "use strict";
    var force;
    var vX = 0;
    var vY = 0;

    vX = wellx - particle.position.x;
    vY = welly - particle.position.y;
    force = wellstrength / Math.pow(vX * vX + vY * vY, 1.5);

    return new PARTSYS.Vector(vX * force, vY * force);
};

ExplodyShip.prototype.applyGravity = function (particle) {
    "use strict";
    particle.velocity.selfAdd(this.applyWell(particle, 400, 1000, 10000));
};

ExplodyShip.prototype.cleanup = function () {
    "use strict";
    this.onDone();
};

ExplodyShip.prototype.forcecleanup = function () {
    this.particlesystem.removeEmitter("junk1");
};

ExplodyShip.prototype.update = function (newx, units) {
    "use strict";
};

ExplodyShip.prototype.everySecond = function (e) {
    "use strict";
};

ExplodyShip.prototype.keyreleased = function (key) {
    "use strict";
    // See below re: controlling explosions.
};

ExplodyShip.prototype.keypressed = function (key) {
    "use strict";
};