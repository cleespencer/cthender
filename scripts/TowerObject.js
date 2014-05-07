function TowerObject(stage, particlesystem, width, height, worldwidth, worldheight, viewwidth, viewheight, worldx,
                     worldy) {
    "use strict";
    var emitter, emitternames, i, gravity;
    this.stage = stage;
    this.particlesystem = particlesystem;
    this.recentx = 0;

    gravity = new PARTSYS.Field(worldx, worldy, width, height);
    gravity.onFieldInfluenced = this.applyGravity.bind(this);

    emitter = new PARTSYS.Emitter();
    emitter.x = worldx + 20;
    emitter.y = worldy + 15;
    emitter.area = {"xanchor": 0, "yanchor": 0, "width": width - 40, "height": 2, "radius": 0};
    emitter.density = {"min": 5, "max": 25};
    emitter.angle = {"min": 267, "max": 273};
    emitter.speed = {"min": .5, "max": 2.5};
    emitter.rotation = 0;
    emitter.emitterfields = [gravity];
    emitter.particlerotation = {"min": -2, "max": 2};
    emitter.lifetime = {"min": 10, "max": 25};
    emitter.bounded = {"x": worldx, "y": worldy - 50, "width": width, "height": 65, type: "die"};
    emitter.maxparticles = 0;
    emitter.dienoparticles = false;
    emitter.lockparticles = true;

    emitter.onCreateParticle = this.createTractorParticle.bind(this);
    emitter.onUpdateParticles = this.updateParticles.bind(this);
    emitter.onRemoveParticle = this.removeParticle.bind(this);

    emitternames = this.particlesystem.getEmitterNames();
    i = 0;
    while (true) {
        this.emittername = "tower" + worldx.toString() + " " + worldy.toString() + i;
        if (emitternames.indexOf(this.emittername) === -1) {
            break;
        }
        i += 1;
    }

    this.particlesystem.addEmitter(this.emittername, emitter);

    GameObject.call(this, "tower_off.png", width, height, worldwidth,
                    worldheight, viewwidth, viewheight, worldx, worldy);
}

TowerObject.constructor = TowerObject;
TowerObject.prototype = Object.create(GameObject.prototype);

TowerObject.prototype.cleanup = function () {
    "use strict";
    this.particlesystem.removeEmitter(this.emittername);
};

TowerObject.prototype.applyWell = function (particle, wellx, welly, wellstrength) {
    "use strict";
    var force;
    var vX = 0;
    var vY = 0;

    vX = wellx - particle.position.x;
    vY = welly - particle.position.y;
    force = wellstrength / Math.pow(vX * vX + vY * vY, 1.5);

    return new PARTSYS.Vector(vX * force, vY * force);
};

TowerObject.prototype.applyGravity = function (particle, field) {
    "use strict";
    particle.velocity.selfAdd(this.applyWell(particle, field.x + field.width / 2, field.y + field.height / 2, 1500));
};

TowerObject.prototype.createTractorParticle = function (particle) {
    "use strict";
    var texture = PIXI.Texture.fromFrame("tractoricle.png");
    particle.sprite = new PIXI.Sprite(texture, 32, 32);
    particle.sprite.position.x = particle.position.x;
    particle.sprite.position.y = particle.position.y;
    particle.sprite.anchor.x = .5;
    particle.sprite.anchor.y = .5;
    this.stage.addChild(particle.sprite);
};

TowerObject.prototype.updateParticles = function (emitter, particles) {
    "use strict";

    var visible, i, particle, rightmost, fragment, emitterx, emittery, newx = this.recentx;
    visible = false;
    emittery = emitter.y;
    rightmost = newx + this.viewwidth;
    fragment = -1;

    if (rightmost > this.worldwidth) {
        fragment = rightmost - this.worldwidth - 1;
    }
    if (fragment === -1) {
        if (emitter.x >= newx - this.width && emitter.x <= rightmost + this.width) {
            emitterx = emitter.x - newx;
            visible = true;
        }
    } else {
        if (emitter.x >= newx - this.width && emitter.x <= this.worldwidth + this.width) {
            emitterx = emitter.x - newx;
            visible = true;
        } else if (emitter.x <= fragment + this.width) {
            emitterx = this.worldwidth - newx + emitter.x;
            visible = true;
        }
    }
    if (!visible) {
        for (i = 0; i < particles.length; i++) {
            particles[i].visible = false;
        }
        return;
    }
    for (i = 0; i < particles.length; i++) {
        particle = particles[i];
        particle.visible = true;
        particle.sprite.position.x = emitterx + (particle.position.x - emitter.x);
        particle.sprite.position.y = particle.position.y;
        particle.sprite.rotation = PARTSYS.degreesToRadians(particle.angle);
    }
};

TowerObject.prototype.removeParticle = function (particle) {
    "use strict";
    this.stage.removeChild(particle.sprite);
    particle.sprite = null;
};

TowerObject.prototype.everySecond = function (e) {
    "use strict";
};

TowerObject.prototype.update = function (newx) {
    this.recentx = newx;
    GameObject.prototype.update.call(this, newx);
};