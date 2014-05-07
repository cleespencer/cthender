function Cthomb(world, stage, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy) {
    "use strict";
    var width, height;
    this.world = world;
    this.stage = stage;
    this.worldwidth = worldwidth;
    this.worldheight = worldheight;
    this.viewwidth = viewwidth;
    this.viewheight = viewheight;
    this.worldx = worldx;
    this.worldy = worldy;
    this.birth = false;
    this.cthlugBirthed = false;
    this.dead = false;

    this.textures = ["cthomb_1.png", "cthomb_2.png", "cthomb_3.png", "cthomb_4.png", "cthomb_5.png"];
    this.textureincrement = 0;
    this.texturevector = 1;
    this.deltav = new PARTSYS.Vector(Math.random() * 2 - 1, 1);
    width = 24;
    height = 24;

    GameObject.call(this, this.textures[0], width, height, worldwidth, worldheight, viewwidth, viewheight, worldx,
                    worldy);
    this.timeoutID = setTimeout(this.updateTexture.bind(this), 160);
}

Cthomb.constructor = Cthomb;
Cthomb.prototype = Object.create(GameObject.prototype);

Cthomb.prototype.cleanup = function () {
    "use strict";
    if (this.timeoutID) {
        clearTimeout(this.timeoutID);
    }
};

Cthomb.prototype.everySecond = function (e) {
    "use strict";

};

Cthomb.prototype.updateTexture = function () {
    "use strict";
    var cthombtexture;
    this.textureincrement += this.texturevector;
    if (this.textureincrement >= this.textures.length) {
        this.textureincrement = 0;
    }
    if (this.visible) {
        cthombtexture = PIXI.Texture.fromFrame(this.textures[this.textureincrement]);
        this.setTexture(cthombtexture);
    }
    this.timeoutID = setTimeout(this.updateTexture.bind(this), 160 / Math.abs(this.deltav.x));
};

Cthomb.prototype.updatePosition = function (newx, dt) {
    "use strict";
    var x = this.worldx, y = this.worldy, i, building, lp, rp, bounced = false, vertsurface = false;
    this.deltav.y += .05;
    x = this.worldx + this.deltav.x; //* (dt * PARTSYS.framerate);
    y = this.worldy + this.deltav.y; //* (dt * PARTSYS.framerate);

    if (x > this.worldwidth) {
        x = x - this.worldwidth + 1;
    }
    if (x < 0) {
        x = this.worldwidth + x - 1;
    }

    if (y >= this.worldheight - this.height) {
        this.deltav.y = -this.deltav.y;
        y = this.worldheight - this.height;
        this.deltav.y /= 1.5;
        this.deltav.x /= 1.05;
        if (Math.abs(this.deltav.x) < .04 && Math.abs(this.deltav.y) < .04) {
            this.dead = true;
        }

    } else {
        for (i = 0; i < this.world.city.length; i++) {
            building = this.world.city[i];
            if (this.world.isCollidedCoords(building, x, y + 2, 1, this.height - 4, false) ||
                this.world.isCollidedCoords(building, x + this.width, y + 2, 1, this.height - 4, false)) {
                this.deltav.x = -this.deltav.x;
                this.deltav.x /= 1.5;
                bounced = true;
            }
            if (this.world.isCollidedCoords(building, x + 2, y + this.height, this.width - 4, 1, false)) {
                this.deltav.y = -this.deltav.y;
                this.deltav.y /= 1.5;
                this.deltav.x /= 1.05;
                y = building.worldy - this.height;
                bounced = true;
                vertsurface = true;
            }

            lp = this.world.isCollidedPoint(building, x, y + this.height, false);
            rp = this.world.isCollidedPoint(building, x + this.width, y + this.height, false);
            if (lp && !rp) {
                this.deltav.x = Math.abs(this.deltav.x);
                x += this.deltav.x;
                bounced = true;
            } else if (!lp && rp) {
                this.deltav.x = -1 * Math.abs(this.deltav.x);
                x += this.deltav.x;
                bounced = true;
            }

            if (bounced) {
                if (Math.abs(this.deltav.x) < .04 && Math.abs(this.deltav.y) < .04 && vertsurface) {
                    this.dead = true;
                }
                break;
            }
        }
    }

    this.worldx = x;
    this.worldy = y;
};

Cthomb.prototype.update = function (newx, dt) {
    "use strict";
    var x, rightmost, fragment = -1;
    this.visible = false;

    this.updatePosition(newx, dt);
    x = this.worldx;

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
        this.position.y = this.worldy;
    }

};

