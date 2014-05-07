function PlayerObject(stage, particlesystem, worldwidth, worldheight, viewwidth, viewheight, worldy) {
    "use strict";
    var gravity;
    var worldx = Math.floor(viewwidth * .15);
    this.stage = stage;
    this.particlesystem = particlesystem;
    this.vkey = '';
    this.vtime = null;
    this.playerfuel = 5;
    this.playerdirection = 1; // 1= travelling to the right, -1 = travelling to the left
    this.olddirection = 1;
    this.thrusters = false;
    this.lefttrap = Math.floor(viewwidth * .15);
    this.righttrap = Math.floor(viewwidth * .85) - 84;
    this.tractor = 0;
    this.manattached = null;
    this.soundstate = "stop";
    this.weapon = "laser";
    this.invincible = 3;
    this.displayalpha = .16;
    this.thrustersound = new Howl({urls: ['resources/sounds/thrust.mp3'], loop: true, volume: .25});
    this.turbomaintain = new Howl({urls: ['resources/sounds/turbomaintain.mp3'], loop: true});
    this.turbosound = new Howl({
                                   urls : ['resources/sounds/turbo.mp3'],
                                   onend: function () {
                                       this.currentsound.stop();
                                       this.currentsound = this.turbomaintain;
                                       this.currentsound.play();
                                   }.bind(this)
                               });
    this.currentsound = null;

    gravity = new PARTSYS.Field(0, 0, viewwidth, viewheight);
    gravity.onFieldInfluenced = this.applyGravity.bind(this);
    this.gravitypos = new PARTSYS.Vector(0, 0);

    this.tractoremitter = new PARTSYS.Emitter();
    this.tractoremitter.x = 0;
    this.tractoremitter.y = 0;
    this.tractoremitter.area = {"xanchor": 0, "yanchor": 0, "width": 50, "height": 2, "radius": 0};
    this.tractoremitter.density = {"min": 1, "max": 5};
    this.tractoremitter.angle = {"min": 87, "max": 93};
    this.tractoremitter.speed = {"min": 1, "max": 2};
    this.tractoremitter.rotation = 0;
    this.tractoremitter.particlerotation = {"min": -1, "max": 1};
    //emitter.lifetime = {"min":300,"max":900};
    this.tractoremitter.bounded = {"x": 7, "y": 28, "width": 50, "height": 2, "type": "die"};
    this.tractoremitter.maxparticles = 0;
    this.tractoremitter.dienoparticles = false;
    this.tractoremitter.lockparticles = true;

    this.tractoremitter.onCreateParticle = this.createTractorParticle.bind(this);
    this.tractoremitter.onUpdateParticles = this.updateParticles.bind(this);
    this.tractoremitter.onRemoveParticle = this.removeParticle.bind(this);
    this.particlesystem.addEmitter("playertractor", this.tractoremitter);

    this.thrusteremitter = new PARTSYS.Emitter();
    this.thrusteremitter.x = 0;
    this.thrusteremitter.y = 0;
    this.thrusteremitter.area = {"xanchor": 0, "yanchor": 0, "width": 2, "height": 12, "radius": 0};
    this.thrusteremitter.density = {"min": 1, "max": 5};
    this.thrusteremitter.angle = {"min": 177, "max": 183};
    this.thrusteremitter.speed = {"min": 3, "max": 5};
    this.thrusteremitter.rotation = 0;
    this.thrusteremitter.particlerotation = {"min": -1, "max": 1};
    this.thrusteremitter.emitterfields = [gravity];
    this.thrusteremitter.bounded = {"x": -32, "y": 0, "width": 32, "height": 28, "type": "die"};
    this.thrusteremitter.maxparticles = 0;
    this.thrusteremitter.dienoparticles = false;
    this.thrusteremitter.lockparticles = true;

    this.thrusteremitter.onCreateParticle = this.createThrusterParticle.bind(this);
    this.thrusteremitter.onUpdateParticles = this.updateParticles.bind(this);
    this.thrusteremitter.onRemoveParticle = this.removeParticle.bind(this);
    this.particlesystem.addEmitter("thrusters", this.thrusteremitter);

    GameObject.call(this, "ship.png", 84, 28, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy);
    setTimeout(this.updateTexture.bind(this), 160);
}

PlayerObject.constructor = PlayerObject;
PlayerObject.prototype = Object.create(GameObject.prototype);

PlayerObject.prototype.cleanup = function () {
    "use strict";
    if (this.currentsound) {
        this.currentsound.stop();
    }
    this.particlesystem.removeEmitter("playertractor");
    this.particlesystem.removeEmitter("thrusters");
};

PlayerObject.prototype.applyWell = function (particle, wellx, welly, wellstrength) {
    "use strict";
    var force;
    var vX = 0;
    var vY = 0;

    vX = wellx - particle.position.x;
    vY = welly - particle.position.y;
    force = wellstrength / Math.pow(vX * vX + vY * vY, 1.5);

    return new PARTSYS.Vector(vX * force, vY * force);
};

PlayerObject.prototype.applyGravity = function (particle) {
    "use strict";
    particle.velocity.selfAdd(this.applyWell(particle, this.gravitypos.x, this.gravitypos.y, 500));
};

PlayerObject.prototype.createTractorParticle = function (particle) {
    "use strict";
    var texture = PIXI.Texture.fromFrame("tractoricle.png");
    particle.sprite = new PIXI.Sprite(texture, 32, 32);
    particle.sprite.position.x = particle.position.x;
    particle.sprite.position.y = particle.position.y;
    particle.sprite.anchor.x = .5;
    particle.sprite.anchor.y = .5;
    this.stage.addChild(particle.sprite);
};

PlayerObject.prototype.createThrusterParticle = function (particle) {
    "use strict";
    var texture = PIXI.Texture.fromFrame("explodicle.png");
    particle.sprite = new PIXI.Sprite(texture, 32, 32);
    particle.sprite.position.x = particle.position.x;
    particle.sprite.position.y = particle.position.y;
    particle.sprite.anchor.x = .5;
    particle.sprite.anchor.y = .5;
    this.stage.addChild(particle.sprite);
};

PlayerObject.prototype.updateParticles = function (emitter, particles) {
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

PlayerObject.prototype.removeParticle = function (particle) {
    "use strict";
    this.stage.removeChild(particle.sprite);
    particle.sprite = null;
};

// Overrides the GameObject.everySecond event handler.
PlayerObject.prototype.everySecond = function (e) {
    "use strict";
    this.invincible = this.invincible > 0 ? this.invincible - 1 : 0;
    this.displayalpha = 1 - (this.invincible / 3);
    if (this.thrusters) {
        this.playerfuel -= 1;
        if (this.playerfuel < 1) {
            this.playerfuel = 1;
            this.thrusters = false;
        }
    } else {
        this.playerfuel += 1;
        if (this.playerfuel > GameWorld.MAXPLAYERFUEL) {
            this.playerfuel = GameWorld.MAXPLAYERFUEL;
        }
    }
};

PlayerObject.prototype.updateSound = function () {
    "use strict";
    if (this.playerdirection === 0) {
        if (this.currentsound) {
            this.currentsound.stop();
            this.soundstate = "stop";
        }
    } else {
        if (this.thrusters && this.playerfuel > 1) {
            if (this.soundstate !== "turbo") {
                this.soundstate = "turbo";
                if (this.currentsound) {
                    this.currentsound.stop();
                }
                this.currentsound = this.turbosound;
                this.currentsound.play();
            }
        } else {
            if (this.soundstate !== "thrust") {
                this.soundstate = "thrust";
                if (this.currentsound) {
                    this.currentsound.stop();
                }
                this.currentsound = this.thrustersound;
                this.currentsound.play();
            }
        }
    }
};

PlayerObject.prototype.updateTexture = function () {
    "use strict";
    var pd, animset, texturetype, playertexture;
    pd = this.playerdirection !== 0 ? this.playerdirection : this.olddirection;
    if (pd === 1) {
        animset = "ship_r.png";
    } else {
        animset = "ship.png";
    }
    if (this.playerdirection === 0) {
        texturetype = "stop";
    } else if (this.thrusters && this.playerfuel > 1) {
        texturetype = "afterburn";
    } else {
        texturetype = "thrust";
    }
    playertexture = PIXI.Texture.fromFrame(animset);
    this.setTexture(playertexture);
    this.alpha = this.displayalpha;
    setTimeout(this.updateTexture.bind(this), 160);
};

PlayerObject.prototype.drawme = function (newx) {
    "use strict";
    // First we need to see if we're in the view width.
    // We need to see if we're on screen.
    // if not, we set this.visible=False and bail.

    // so, our viewwidth needs to be this.width+this.worldwidth
    // and -this.width
    var rightmost, fragment = -1;
    this.visible = false;
    this.position.y = this.worldy;
    if (this.alwaysinvisible === true) {
        return;
    }

    rightmost = newx + this.viewwidth;

    if (rightmost > this.worldwidth) {
        fragment = rightmost - this.worldwidth - 1;
    }
    if (fragment === -1) {
        if (this.worldx >= newx - this.width && this.worldx <= rightmost) {
            this.position.x = this.worldx - newx;
            this.visible = true;
        }
    } else {
        if (this.worldx >= newx - this.width && this.worldx <= this.worldwidth) {
            this.position.x = this.worldx - newx;
            this.visible = true;
        } else if (this.worldx <= fragment) {
            this.position.x = this.worldwidth - newx + this.worldx;
            this.visible = true;
        }
    }
    this.tractoremitter.x = this.position.x + 17;
    this.tractoremitter.y = this.position.y + this.height;
    if (this.tractor) {
        this.tractoremitter.bounded = {"x": this.position.x + 17, "y": this.position.y + this.height, "width": 50, "height": this.height + this.tractor, "type": "die"};
    } else {
        this.tractoremitter.bounded = {"x": this.position.x + 17, "y": this.position.y + this.height, "width": 50, "height": 2, "type": "die"};
    }

    if (this.thrusters && this.playerfuel > 1) {
        this.thrusteremitter.density = {"min": 20, "max": 30};
        if (this.playerdirection === 1) {
            this.particlesystem.moveEmitter("thrusters", this.position.x, this.position.y + 8);
            this.thrusteremitter.angle = {"min": 177, "max": 183};
            this.thrusteremitter.bounded = {"x": this.position.x - 64, "y": this.position.y, "width": 64, "height": this.height, "type": "die"};
            this.gravitypos.x = this.position.x - 64;
            this.gravitypos.y = this.position.y + 14;
        } else if (this.playerdirection === -1) {
            this.particlesystem.moveEmitter("thrusters", this.position.x + this.width, this.position.y + 8);
            this.thrusteremitter.angle = {"min": 357, "max": 3};
            this.thrusteremitter.bounded = {"x": this.position.x + this.width, "y": this.position.y, "width": 64, "height": this.height, "type": "die"};
            this.gravitypos.x = this.position.x + this.width + 64;
            this.gravitypos.y = this.position.y + 14;
        }
    } else {
        this.thrusteremitter.density = {"min": 5, "max": 10};
        if (this.playerdirection === 1) {
            this.particlesystem.moveEmitter("thrusters", this.position.x, this.position.y + 8);
            this.thrusteremitter.angle = {"min": 177, "max": 183};
            this.thrusteremitter.bounded = {"x": this.position.x - 32, "y": this.position.y, "width": 32, "height": this.height, "type": "die"};
            this.gravitypos.x = this.position.x - 32;
            this.gravitypos.y = this.position.y + 14;
        } else if (this.playerdirection === -1) {
            this.particlesystem.moveEmitter("thrusters", this.position.x + this.width, this.position.y + 8);
            this.thrusteremitter.angle = {"min": 357, "max": 3};
            this.thrusteremitter.bounded = {"x": this.position.x + this.width, "y": this.position.y, "width": 32, "height": this.height, "type": "die"};
            this.gravitypos.x = this.position.x + this.width + 32;
            this.gravitypos.y = this.position.y + 14;
        } else {
            this.thrusteremitter.density = {"min": 0, "max": 0};
        }
    }
};

PlayerObject.prototype.update = function (newx, units, dt) {
    "use strict";
    this.updateSound();
    var goalx, lt, rt, pd, vdelta;

    if (this.vkey === 'up') {
        if (this.vtime === null) {
            vdelta = -1.25 * dt * PARTSYS.framerate;
        } else {
            // the ship should move 1 pixel (up or down) every 10 milliseconds,
            // or 100 pixels per second.
            vdelta = -((timeStamp() - this.vtime) / 10);
        }
        this.vtime = timeStamp();
    } else if (this.vkey === 'down') {
        if (this.vtime === null) {
            vdelta = 1.25 * dt * PARTSYS.framerate;
        } else {
            // the ship should move 1 pixel (up or down) every 10 milliseconds,
            // or 100 pixels per second.
            vdelta = (timeStamp() - this.vtime) / 10;
        }
        this.vtime = timeStamp();
    } else {
        vdelta = 0;
        this.vtime = null;
    }
    this.worldy += vdelta;
    if (this.worldy < 0) {
        this.worldy = 0;
    }
    if (this.worldy > this.viewheight - this.height) {
        this.worldy = this.viewheight - this.height;
    }

    pd = this.playerdirection !== 0 ? this.playerdirection : this.olddirection;
    lt = newx + this.lefttrap;
    rt = newx + this.righttrap;
    if (lt > this.worldwidth) {
        lt -= (this.worldwidth + 1);
    }
    if (rt > this.worldwidth) {
        rt -= (this.worldwidth + 1);
    }
    if (pd === 1) {
        // moving right
        goalx = lt;
    } else {
        // moving left
        goalx = rt;
    }

    this.worldx += units;
    if (pd === 1 && this.worldx !== lt) {
        this.worldx -= units !== 0 ? units : 5;
    } else if (pd === -1 && this.worldx !== rt) {
        this.worldx -= units !== 0 ? units : -5;
    }
    if (this.worldx > this.worldwidth) {
        this.worldx -= this.worldwidth + 1;
    }
    if (this.worldx < 0) {
        this.worldx += this.worldwidth + 1;
    }

    if (this.worldx < lt && this.worldx > rt && lt > rt) {
        this.worldx = goalx;
    } else if (this.worldx < lt && this.worldx < rt && lt < rt) {
        this.worldx = goalx;
    } else if (this.worldx > lt && this.worldx > rt && lt < rt) {
        this.worldx = goalx;
    }

    if (Math.abs(this.worldx - goalx) < Math.abs(units)) {
        this.worldx = goalx;
    }

    this.drawme(newx);
};

PlayerObject.prototype.keyreleased = function (key) {
    "use strict";
    if (key === 'left' || key === 'right') {
        this.thrusters = false;
    }
    if (key === 'up' && this.vkey === 'up') {
        this.vkey = '';
    }
    if (key === 'down' && this.vkey === 'down') {
        this.vkey = '';
    }
};

PlayerObject.prototype.keypressed = function (key) {
    "use strict";
    if (key === 'left') {
        if (this.playerdirection === -1) {
            this.thrusters = true;
        }
        this.playerdirection = -1;
        this.olddirection = this.playerdirection;
    }
    if (key === 'right') {
        if (this.playerdirection === 1) {
            this.thrusters = true;
        }
        this.playerdirection = 1;
        this.olddirection = this.playerdirection;
    }
    if (key === 'enter') {
        this.thrusters = false;
        this.playerdirection = 0;
    }
    if (key === 'up' && this.vkey === '') {
        this.vkey = 'up';
    }
    if (key === 'down' && this.vkey === '') {
        this.vkey = 'down';
    }

};