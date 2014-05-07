function Cthly(world, stage, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy) {
    "use strict";
    var width, height, texture;
    this.world = world;
    this.stage = stage;
    this.worldwidth = worldwidth;
    this.worldheight = worldheight;
    this.viewwidth = viewwidth;
    this.viewheight = viewheight;
    this.worldx = worldx + 0;
    this.worldy = worldy + 0;
    this.muto = false;

    this.textures = ["cthly1.png", "cthly2.png", "cthly3.png", "cthly4.png"];
    this.textureincrement = 0;
    this.texturevector = 1;
    this.deltav = new PARTSYS.Vector(((Math.random() * 10) - 5) * 2, 0);
    width = 12;
    height = 12;

    this.cthingsoundplaying = false;
    this.cthingsound = new Howl({
                                    urls : ['resources/sounds/cthly_move.mp3'],
                                    onend: function () {
                                        this.cthingsoundplaying = false;
                                    }.bind(this)
                                });

    GameObject.call(this, this.textures[0], width, height, worldwidth, worldheight, viewwidth, viewheight, worldx,
                    worldy);
    this.timeoutID = setTimeout(this.updateTexture.bind(this), 160);
}

Cthly.constructor = Cthly;
Cthly.prototype = Object.create(GameObject.prototype);

Cthly.prototype.cleanup = function () {
    "use strict";
    if (this.timeoutID) {
        clearTimeout(this.timeoutID);
    }
    this.cthingsound.stop();
};

Cthly.prototype.everySecondNormal = function (e) {
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

        if (xchange < .15) {
            this.deltav.x = -5 * Math.random();
        } else if (xchange < .30) {
            this.deltav.x = 5 * Math.random();
        }

        if (ychange < .05) {
            this.deltav.y = -1;
        } else if (ychange < .1) {
            this.deltav.y = 1;
        } else {
            this.deltav.y = 0;
        }
    }
};

Cthly.prototype.everySecond = function (e) {
    "use strict";
    this.everySecondNormal(e);
};

Cthly.prototype.updateSound = function () {
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

Cthly.prototype.updateTexture = function () {
    "use strict";
    var cthlytexture;
    this.textureincrement += this.texturevector;
    if (this.textureincrement >= this.textures.length) {
        this.texturevector = -this.texturevector;
        this.textureincrement = this.textures.length - 1;
    }
    if (this.textureincrement < 0) {
        this.textureincrement = 1;
        this.texturevector = -this.texturevector;
    }
    if (this.visible) {
        cthlytexture = PIXI.Texture.fromFrame(this.textures[this.textureincrement]);
        this.setTexture(cthlytexture);
    }
    this.timeoutID=setTimeout(this.updateTexture.bind(this), 160);
};

Cthly.prototype.update = function (newx, dt) {
    "use strict";
    var x, y = this.worldy, rightmost, fragment = -1;
    this.visible = false;

    this.worldx += this.deltav.x * dt * PARTSYS.framerate;
    this.worldy += this.deltav.y * dt * PARTSYS.framerate;

    if (this.worldy < 0) {
        this.worldy = 0;
        this.deltav.y = -this.deltav.y;
    }
    if (this.worldy >= this.viewheight - this.height) {
        this.worldy = this.viewheight - this.height;
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

    this.updateSound();
};

