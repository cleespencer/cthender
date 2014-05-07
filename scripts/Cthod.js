function Cthod(world, stage, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy) {
    "use strict";
    var width, height, texture;
    this.world = world;
    this.stage = stage;
    this.worldwidth = worldwidth;
    this.worldheight = worldheight;
    this.viewwidth = viewwidth;
    this.viewheight = viewheight;
    this.worldx = worldx;
    this.worldy = worldy;
    this.open = false;

    this.textures = ["cthod_1.png", "cthod_2.png", "cthod_3.png", "cthod_4.png", "cthod_5.png"];
    this.textures_open = ["cthod_open_1.png", "cthod_open_2.png", "cthod_open_3.png"];
    this.textureincrement = 0;
    this.texturevector = 1;
    this.deltav = new PARTSYS.Vector(0, 0);
    width = 48;
    height = 64;

    this.cthlies = [];

    this.cthingsoundplaying = false;
    this.cthingsound = new Howl({
                                    urls : ['resources/sounds/cthod_move.mp3'],
                                    onend: function () {
                                        this.cthingsoundplaying = false;
                                    }.bind(this)
                                });

    GameObject.call(this, this.textures[0], width, height, worldwidth, worldheight, viewwidth, viewheight, worldx,
                    worldy);
    this.timeoutID = setTimeout(this.updateTexture.bind(this), 160);
}

Cthod.constructor = Cthod;
Cthod.prototype = Object.create(GameObject.prototype);

Cthod.prototype.cleanup = function () {
    "use strict";
    var i;
    if (this.timeoutID) {
        clearTimeout(this.timeoutID);
    }
    this.cthingsound.stop();
    for (i = this.cthlies.length - 1; i >= 0; i--) {
        this.removeCthly(i);
    }
};

Cthod.prototype.removeCthly = function (index) {
    "use strict";
    var cthing, et, sound;
    cthing = this.cthlies.splice(index, 1)[0];
    cthing.cleanup();
    this.stage.removeChild(cthing);
    et = new ExplodyCthing(this.stage, this.world.particlesystem,
                           cthing.muto, GameWorld.WORLDMAX, 540, 960, 540, cthing.worldx,
                           cthing.worldy, this.camerax);
    sound = new Howl({urls: ['resources/sounds/cthquish.mp3'], volume: 1.0}).play();
    et.onDone = this.world.removeSplody.bind(this);
    this.world.splodythings.push(et);
};

Cthod.prototype.everySecondNormal = function (e) {
    "use strict";
    var chancesofchange, xchange, ychange, changed;

    //right now we're just changing direction randomly;
    if (this.deltav.x === 0 && this.deltav.y === 0) {
        chancesofchange = 1;
    } else {
        chancesofchange = .75;
    }
    if (Math.random() < chancesofchange) {
        xchange = Math.random();
        ychange = Math.random();

        if (xchange < .17) {
            this.deltav.x = -1;
        } else if (xchange < .34) {
            this.deltav.x = 1;
        } else if (xchange < .51) {
            this.deltav.x = 0;
        }
        if (ychange < .17) {
            this.deltav.y = -1;
        } else if (ychange < .34) {
            this.deltav.y = 1;
        } else if (ychange < .51) {
            this.deltav.y = 0;
        }
        if (xchange > .83 && ychange > .83) {
            this.open = true;
            this.deltav.x = 0;
            this.deltav.y = 0;
            this.textureincrement = -1;
            this.texturevector = 1;
        }
    }
};

Cthod.prototype.everySecondOpen = function (e) {
    "use strict";
    var cthly;
    if (Math.random() < .3) {
        this.open = false;
        this.textureincrement = -1;
        this.texturevector = 1;
        this.everySecondNormal(e);
    }
};

Cthod.prototype.everySecond = function (e) {
    "use strict";
    if (this.open) {
        this.everySecondOpen(e);
    } else {
        this.everySecondNormal(e);
    }
};

Cthod.prototype.updateSound = function () {
    "use strict";
    if (this.world.player) {
        if (this.visible && !this.cthingsoundplaying) {
            this.cthingsoundplaying = true;
            this.cthingsound.play();
        }
        if (!this.visible && this.cthingsoundplaying) {
            this.cthingsound.stop();
            this.cthingsoundplaying = false;
        }
    }
};

Cthod.prototype.updateTexture = function () {
    "use strict";
    var cthodtexture, cthly, ta;
    if (this.open) {
        ta = this.textures_open;
        if (this.textureincrement >= this.textures_open.length) {
            cthly = new Cthly(this.world, this.stage, GameWorld.WORLDMAX, 540, 960, 540, this.worldx + 24,
                              this.worldy + 32);
            this.stage.addChild(cthly);
            this.cthlies.push(cthly);
        }
    } else {
        ta = this.textures;
    }
    this.textureincrement += this.texturevector;
    if (this.textureincrement >= ta.length) {
        if (this.open) {
            cthly = new Cthly(this.world, this.stage, GameWorld.WORLDMAX, 540, 960, 540, this.worldx + 24,
                              this.worldy + 32);
            this.stage.addChild(cthly);
            this.cthlies.push(cthly);
        }
        this.texturevector = -this.texturevector;
        this.textureincrement = ta.length - 1;
    }
    if (this.textureincrement < 0) {
        if (this.open) {
            this.open = false;
        }
        this.textureincrement = 0;
        this.texturevector = -this.texturevector;
    }
    if (this.visible) {
        cthodtexture = PIXI.Texture.fromFrame(ta[this.textureincrement]);
        this.setTexture(cthodtexture);
    }
    this.timeoutID = setTimeout(this.updateTexture.bind(this), 160);
};

Cthod.prototype.update = function (newx, dt) {
    "use strict";
    var x, y = this.worldy, rightmost, fragment = -1, i;
    this.visible = false;

    this.worldx += this.deltav.x * dt * PARTSYS.framerate;
    this.worldy += this.deltav.y * dt * PARTSYS.framerate;

    if (this.worldy < 0) {
        this.worldy = 0;
        this.deltav.y = -this.deltav.y;
    }
    if (this.worldy >= (this.viewheight * .66) - this.height) {
        this.worldy = (this.viewheight * .66) - this.height;
        this.deltav.y = -this.deltav.y;
    }

    if (this.worldx > this.worldwidth) {
        this.worldx = this.worldx - this.worldwidth + 1;
    }
    if (this.worldx < 0) {
        this.worldx = this.worldwidth + this.worldx + 1;
    }

    rightmost = newx + this.viewwidth;
    if (rightmost > this.worldwidth) {
        fragment = rightmost - this.worldwidth - 1;
    }

    if (fragment === -1) {
        if (this.worldx > newx - this.width && this.worldx < rightmost + this.width) {
            x = this.worldx - newx;
            this.visible = true;
        }
    } else {
        if (this.worldx > newx - this.width && this.worldx <= this.worldwidth) {
            x = this.worldx - newx;
            this.visible = true;
        } else if (this.worldx < fragment + this.width) {
            x = this.worldwidth - newx + this.worldx;
            this.visible = true;
        }
    }
    if (this.visible) {
        this.position.x = x;
        this.position.y = y;
    }
    for (i = 0; i < this.cthlies.length; i++) {
        this.cthlies[i].update(newx, dt);
    }
    this.updateSound();
};

