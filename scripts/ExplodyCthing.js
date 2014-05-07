function ExplodyCthing(stage, particlesystem, muto, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy,
                       newx) {
    "use strict";
    var emitter, emitternames, i, gravity, rightmost, fragment = -1;
    this.stage = stage;
    this.worldwidth = worldwidth;
    this.worldheight = worldheight;
    this.viewwidth = viewwidth;
    this.viewheight = viewheight;
    this.worldx = worldx;
    this.worldy = worldy;
    this.muto = muto;
    this.onDone = null;
    this.particlesystem = particlesystem;

    gravity = new PARTSYS.Field(0, 0, viewwidth, viewheight);
    gravity.onFieldInfluenced = this.applyGravity.bind(this);

    emitter = new PARTSYS.Emitter();
    emitter.x = worldx;
    emitter.y = worldy;
    emitter.area = {"xanchor": .5, "yanchor": .5, "width": 1, "height": 1, "radius": 10};
    emitter.density = {"min": 250, "max": 500};
    emitter.angle = {"min": 0, "max": 359};
    emitter.speed = {"min": 1, "max": 2};
    emitter.rotation = 0;
    emitter.particlerotation = {"min": -1, "max": 1};
    emitter.lifetime = {"min": 30, "max": 120};
    emitter.bounded = {"x": -32, "y": -128, "width": viewwidth + 32, "height": viewheight + 160, "type": "die"};
    emitter.maxparticles = 500;
    emitter.dienoparticles = true;
    emitter.lockparticles = true;
    emitter.emitterfields = [gravity];
    emitter.onCreateParticle = this.createParticle.bind(this);
    emitter.onUpdateParticles = this.updateParticles.bind(this);
    emitter.onRemoveParticle = this.removeParticle.bind(this);

    rightmost = newx + this.viewwidth;

    if (rightmost > this.worldwidth) {
        fragment = rightmost - this.worldwidth - 1;
    }
    if (fragment === -1) {
        emitter.x = this.worldx - newx;
    } else {
        if (this.worldx <= fragment) {
            emitter.x = this.worldwidth - newx + this.worldx;
        } else {
            emitter.x = this.worldx - newx;
        }
    }

    this.x = emitter.x;

    emitternames = this.particlesystem.getEmitterNames();
    i = 0;
    while (true) {
        this.emittername = "aliensplode" + i;
        if (emitternames.indexOf(this.emittername) === -1) {
            break;
        }
        i += 1;
    }

    particlesystem.addEmitter(this.emittername, emitter);
}

ExplodyCthing.constructor = ExplodyCthing;
ExplodyCthing.prototype = Object.create(Object.prototype);

ExplodyCthing.prototype.createParticle = function (particle) {
    "use strict";
    var texture;
    if (this.muto) {
        texture = PIXI.Texture.fromFrame("explodicle.png");
    } else {
        texture = PIXI.Texture.fromFrame("cthorticle.png");
    }
    particle.sprite = new PIXI.Sprite(texture, 32, 32);
    particle.sprite.position.x = particle.position.x;
    particle.sprite.position.y = particle.position.y;
    particle.sprite.anchor.x = .5;
    particle.sprite.anchor.y = .5;
    this.stage.addChild(particle.sprite);
};

ExplodyCthing.prototype.updateParticles = function (emitter, particles) {
    "use strict";
    var i, particle;
    for (i = 0; i < particles.length; i++) {
        particle = particles[i];
        particle.sprite.position.x = particle.position.x;
        particle.sprite.position.y = particle.position.y;
        particle.sprite.rotation = PARTSYS.degreesToRadians(particle.angle);
    }
};

ExplodyCthing.prototype.removeParticle = function (particle) {
    "use strict";
    this.stage.removeChild(particle.sprite);
    particle.sprite = null;
};

ExplodyCthing.prototype.applyWell = function (particle, wellx, welly, wellstrength) {
    "use strict";
    var force;
    var vX = 0;
    var vY = 0;

    vX = wellx - particle.position.x;
    vY = welly - particle.position.y;
    force = wellstrength / Math.pow(vX * vX + vY * vY, 1.5);

    return new PARTSYS.Vector(vX * force, vY * force);
};

ExplodyCthing.prototype.applyGravity = function (particle) {
    "use strict";
    particle.velocity.selfAdd(this.applyWell(particle, 400, 1000, 10000));
};

ExplodyCthing.prototype.cleanup = function () {
    "use strict";
    this.onDone();
};

ExplodyCthing.prototype.update = function (newx, units) {
    "use strict";
    var rightmost, fragment;
    this.y = this.worldy;
    rightmost = newx + this.viewwidth;
    fragment = -1;

    if (rightmost > this.worldwidth) {
        fragment = rightmost - this.worldwidth - 1;
    }
    if (fragment === -1) {
        this.x = this.worldx - newx;
    } else {
        if (this.worldx <= fragment) {
            this.x = this.worldwidth - newx + this.worldx;

        } else {
            this.x = this.worldx - newx;
        }
    }
    this.particlesystem.moveEmitter(this.emittername, this.x, this.y);
};

ExplodyCthing.prototype.everySecond = function (e) {
    "use strict";
};
