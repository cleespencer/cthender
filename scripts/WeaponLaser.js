function WeaponLaser(stage, particlesystem, killme, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy,
                     direction, newx) {
    "use strict";
    var emitter, emitternames, i;
    this.stage = stage;
    this.particlesystem = particlesystem;
    this.worldwidth = worldwidth;
    this.worldheight = worldheight;
    this.viewwidth = viewwidth;
    this.viewheight = viewheight;
    this.worldy = worldy + 20;
    this.killme = killme;
    this.width = 20;
    this.height = 2;

    emitter = new PARTSYS.Emitter();
    emitter.x = -2;
    emitter.y = -2;
    emitter.density = {"min": 5, "max": 10};
    if (direction === 1) {
        this.worldx = worldx + 42;
        this.deltax = 20;
        emitter.angle = {"min": 180, "max": 180};
    } else {
        this.worldx = worldx + 42;
        this.deltax = -20;
        emitter.angle = {"min": 0, "max": 0};
    }
    emitter.speed = {"min": 1, "max": 2};
    emitter.rotation = 0;
    emitter.particlerotation = {"min": -1, "max": 1};
    emitter.lifetime = {"min": 16, "max": 17};
    emitter.bounded = {
        "x"     : 0,
        "y"     : 0,
        "width" : worldwidth + viewwidth, // To handle situations where the emitter is in the high worldx but wrapping causes the boundary to be somewhere in the middle of the screen.
        "height": worldheight,
        "type"  : "die"
    };
    emitter.lockbounded = false;
    emitter.lockfields = true;
    emitter.lockparticles = true;

    emitternames = this.particlesystem.getEmitterNames();
    i = 0;
    while (true) {
        this.emittername = this.worldx.toString() + " " + this.worldy.toString() + i;
        if (emitternames.indexOf(this.emittername) === -1) {
            break;
        }
        i += 1;
    }

    emitter.onCreateParticle = this.createParticle.bind(this);
    emitter.onUpdateParticles = this.updateParticles.bind(this);
    emitter.onRemoveParticle = this.removeParticle.bind(this);

    this.particlesystem.addEmitter(this.emittername, emitter);
    this.update(newx, 1000 / 60);
}

WeaponLaser.constructor = WeaponLaser;
WeaponLaser.prototype = Object.create(Object.prototype);

WeaponLaser.prototype.cleanup = function (emitter) {
    "use strict";
    this.particlesystem.removeEmitter(this.emittername);
    this.killme(this);
};

WeaponLaser.prototype.everySecond = function (e) {
    "use strict";
};

WeaponLaser.prototype.createParticle = function (particle) {
    "use strict";
    var texture = PIXI.Texture.fromFrame("explodicle.png");
    particle.sprite = new PIXI.Sprite(texture, 32, 32);
    particle.sprite.position.x = particle.position.x;
    particle.sprite.position.y = particle.position.y;
    particle.sprite.anchor.x = .5;
    particle.sprite.anchor.y = .5;
    this.stage.addChild(particle.sprite);
};

WeaponLaser.prototype.updateParticles = function (emitter, particles) {
    "use strict";
    var i, particle;
    for (i = 0; i < particles.length; i++) {
        if (!this.render) {
            particles[i].visible = false;
            continue;
        }
        particle = particles[i];
        particle.visible = true;
        particle.sprite.position.x = particle.position.x;
        particle.sprite.position.y = particle.position.y;
        particle.sprite.rotation = PARTSYS.degreesToRadians(particle.angle);
    }
};

WeaponLaser.prototype.removeParticle = function (particle) {
    "use strict";
    this.stage.removeChild(particle.sprite);
    particle.sprite = null;
};

WeaponLaser.prototype.update = function (newx, dt) {
    "use strict";
    var rightmost, fragment = -1;
    this.worldx += this.deltax * dt * 60 / 1000;
    if (this.worldx < 0) {
        this.worldx = this.worldwidth + this.worldx;
    }
    if (this.worldx > this.worldwidth) {
        this.worldx = this.worldx - this.worldwidth - 1;
    }

    this.render = false;
    this.y = this.worldy;

    rightmost = newx + this.viewwidth;
    if (rightmost > this.worldwidth) {
        fragment = rightmost - this.worldwidth - 1;
    }
    if (fragment === -1) {
        if (this.worldx >= newx - this.width && this.worldx <= rightmost + this.width) {
            this.x = this.worldx - newx;
            this.render = true;
        }
    } else {
        if (this.worldx >= newx - this.width && this.worldx <= this.worldwidth) {
            this.x = this.worldx - newx;
            this.render = true;
        } else if (this.worldx <= fragment + this.width) {
            this.x = this.worldwidth - newx + this.worldx;
            this.render = true;
        }
    }
    if (!this.render) {
        this.cleanup();
        return;
    }
    this.particlesystem.moveEmitter(this.emittername, this.x, this.y);
};