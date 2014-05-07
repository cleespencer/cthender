function Cthortal(stage, particlesystem, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy) {
    "use strict";
    var emitter, emitternames, i;
    this.stage = stage;
    this.worldwidth = worldwidth;
    this.worldheight = worldheight;
    this.viewwidth = viewwidth;
    this.viewheight = viewheight;
    this.worldx = worldx;
    this.worldy = worldy;
    this.particlesystem = particlesystem;
    this.g = new PIXI.Graphics();
    this.stage.addChild(this.g);
    this.render = false;
    this.width = 64;
    this.height = 64;
    this.status = "growing";

    emitter = new PARTSYS.Emitter();
    emitter.x = -2;
    emitter.y = -2;
    emitter.density = {"min": 5, "max": 10};
    emitter.speed = {"min": 1, "max": 2};
    emitter.rotation = 5;
    emitter.lifetime = {"min": 10, "max": 20};
    emitter.bounded = {
        "x"     : this.viewwidth / 2 - (this.width / 2),
        "y"     : this.viewheight / 2 - (this.height / 2),
        "width" : 1,
        "height": 1,
        "type"  : "die"
    };
    emitter.lockbounded = true;
    emitter.lockfields = true;
    emitter.lockparticles = true;

    this.x = emitter.x;
    this.y = emitter.y;

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
}

Cthortal.constructor = Cthortal;
Cthortal.prototype = Object.create(Object.prototype);

Cthortal.prototype.cleanup = function (emitter) {
    "use strict";
    this.particlesystem.removeEmitter(this.emittername);
};

Cthortal.prototype.everySecond = function (e) {
    "use strict";
};

Cthortal.prototype.expand = function (units) {
    "use strict";
    var emitter = this.particlesystem.getEmitter(this.emittername);
    if (emitter) {
        emitter.bounded.width += units;
        emitter.bounded.height += units;
        if (emitter.bounded.width <= 0) {
            if (this.status === "dying") {
                this.status = "dead";
            }
            emitter.bounded.width = 1;
        }
        if (emitter.bounded.height <= 0) {
            if (this.status === "dying") {
                this.status = "dead";
            }
            emitter.bounded.height = 1;
        }
        if (emitter.bounded.width > this.width) {
            if (this.status === "growing") {
                this.status = "living";
            }
            emitter.bounded.width = this.width;
        }
        if (emitter.bounded.height > this.height) {
            if (this.status === "growing") {
                this.status = "living";
            }
            emitter.bounded.height = this.height;
        }
    }
};

Cthortal.prototype.createParticle = function (particle) {
    "use strict";
    var texture = PIXI.Texture.fromFrame("cthorticle.png");
    particle.sprite = new PIXI.Sprite(texture, 32, 32);
    particle.sprite.position.x = particle.position.x;
    particle.sprite.position.y = particle.position.y;
    particle.sprite.anchor.x = .5;
    particle.sprite.anchor.y = .5;
    this.stage.addChild(particle.sprite);
};

Cthortal.prototype.updateParticles = function (emitter, particles) {
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

Cthortal.prototype.removeParticle = function (particle) {
    "use strict";
    this.stage.removeChild(particle.sprite);
    particle.sprite = null;
};

Cthortal.prototype.update = function (newx) {
    "use strict";
    var emitter, rightmost, fragment = -1;
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
    if (this.status === "growing") {
        this.expand(.25);
    }
    if (this.status === "dying") {
        this.expand(-.25);
    }
    emitter = this.particlesystem.getEmitter(this.emittername);
    emitter.bounded.x = this.x - (emitter.bounded.width / 2);
    emitter.bounded.y = this.y - (emitter.bounded.height / 2);
    this.particlesystem.moveEmitter(this.emittername, this.x, this.y);
};