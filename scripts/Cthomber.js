function Cthomber(world, stage, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy) {
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

    this.textures = ["cthomber_1.png", "cthomber_2.png", "cthomber_3.png", "cthomber_4.png"];
    this.textures_birth = ["cthomber_birth_1.png", "cthomber_birth_2.png", "cthomber_birth_3.png", "cthomber_birth_4.png"];
    this.textureincrement = 0;
    this.texturevector = 1;
    this.deltav = new PARTSYS.Vector(0, 0);
    width = 64;
    height = 64;
    this.onebirth = false;

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

Cthomber.constructor = Cthomber;
Cthomber.prototype = Object.create(GameObject.prototype);

Cthomber.prototype.cleanup = function () {
    "use strict";
    if (this.timeoutID) {
        clearTimeout(this.timeoutID);
    }
    this.cthingsound.stop();
};

Cthomber.prototype.tracking = function (target, alienpos) {
    "use strict";
    alienpos = alienpos || {"x": this.worldx, "y": this.worldy};
    var targetx = target.worldx, distanceleft, distanceright;
    if (targetx > alienpos.x) {
        distanceleft = Math.abs(alienpos.x + this.worldwidth - targetx);
    } else {
        distanceleft = alienpos.x - targetx;
    }
    if (targetx < alienpos.x) {
        distanceright = Math.abs(this.worldwidth - alienpos.x + targetx);
    } else {
        distanceright = targetx - alienpos.x;
    }
    if (distanceleft < distanceright) {
        return -1;
    }
    if (distanceleft > distanceright) {
        return 1;
    }
    return 0;
};

Cthomber.prototype.getClosestManDelta = function () {
    "use strict";
    var i, man, manpos, manstatus, alienpos = {"x": this.worldx + 26, "y": this.worldy + 48};
    var manclosest = null, manclosestdistance = null, distance;
    if (this.world.player) {
        manclosestdistance = PARTSYS.distance2(alienpos,
                                               {"x": this.world.player.worldx, "y": this.world.player.worldy});
        manclosest = this.world.player;
    } else {
        manclosestdistance = 90001;
        manclosest = null;
    }
    var dx = 0, dy = 0;
    for (i = 0; i < this.world.men.length; i++) {
        manstatus = this.world.men[i].status;
        if (manstatus !== "standing") {
            continue;
        }
        man = this.world.men[i].sprite;
        manpos = {"x": man.worldx, "y": man.worldy};
        distance = PARTSYS.distance2(alienpos, manpos);
        if (distance < manclosestdistance) {
            manclosest = man;
            manclosestdistance = distance;
        }
    }
    if (manclosest === null) {
        return {"dx": 0, "dy": 0};
    }
    dx = this.tracking(manclosest, alienpos);
    if (alienpos.y > manclosest.worldy) {
        dy = -1;
    } else if (alienpos.y < manclosest.worldy) {
        dy = 1;
    } else {
        dy = 0;
    }
    return {"dx": dx, "dy": dy};
};

Cthomber.prototype.everySecond = function (e) {
    "use strict";
    var chancesofchange, xchange, ychange, changed;

    if (this.birth) {
        return;
    }

    if (Math.random() < .1 && this.worldy < this.worldheight * .50) {
        this.birth = true;
        this.deltav.x = 0;
        this.deltav.y = 0;
        this.textureincrement = -1;
        this.texturevector = 1;
        return;
    }

    //right now we're just changing direction randomly;
    if (this.deltav.x === 0 && this.deltav.y === 0) {
        chancesofchange = 1;
    } else {
        chancesofchange = .75;
    }
    if (Math.random() < chancesofchange) {
        xchange = Math.random();
        ychange = Math.random();
        changed = this.getClosestManDelta();
        if (xchange > .5 || ychange > .5) {
            this.deltav.x = changed.dx;
        } else {
            if (xchange < .17) {
                this.deltav.x = -1;
            } else if (xchange < .34) {
                this.deltav.x = 1;
            } else if (xchange < .51) {
                this.deltav.x = 0;
            }
            if (ychange < .10) {
                this.deltav.y = -1;
            } else if (ychange < .15) {
                this.deltav.y = 1;
            } else if (ychange < .2) {
                this.deltav.y = 0;
            }
        }
    }
};

Cthomber.prototype.updateSound = function () {
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

Cthomber.prototype.updateTexture = function () {
    "use strict";
    var cthodtexture, ta;
    if (this.birth) {
        ta = this.textures_birth;
    } else {
        ta = this.textures;
    }
    this.textureincrement += this.texturevector;
    if (this.textureincrement >= ta.length) {
        this.texturevector = -this.texturevector;
        this.textureincrement = ta.length - 1;
    }
    if (this.textureincrement < 0) {
        this.textureincrement = 1;
        this.texturevector = -this.texturevector;
    }
    if (this.visible) {
        cthodtexture = PIXI.Texture.fromFrame(ta[this.textureincrement]);
        this.setTexture(cthodtexture);
    }
    if (this.cthlugBirthed)
        if (this.textureincrement === 0) {
            this.cthlugBirthed = false;
            this.birth = false;
            this.textureincrement = -1;
            this.texturevector = 1;
        }
    this.timeoutID = setTimeout(this.updateTexture.bind(this), 160);
};

Cthomber.prototype.update = function (newx, dt) {
    "use strict";
    var x, y = this.worldy, rightmost, fragment = -1, i;
    this.visible = false;

    if (this.birth && !this.cthlugBirthed && this.textureincrement === this.textures_birth.length - 1) {
        this.world.birthCthomb(this.worldx + (this.width / 2) - 12, this.worldy + this.height);
        this.cthlugBirthed = true;
    }

    this.worldx += this.deltav.x * dt * PARTSYS.framerate;
    this.worldy += this.deltav.y * dt * PARTSYS.framerate;

    if (this.worldy < 0) {
        this.worldy = 0;
        this.deltav.y = -this.deltav.y;
    }
    if (this.worldy >= (this.worldheight * .60) - this.height) {
        this.worldy = (this.worldheight * .60) - this.height;
        this.deltav.y = -this.deltav.y;
    }

    if (this.worldx > this.worldwidth) {
        this.worldx = this.worldx - this.worldwidth + 1;
    }
    if (this.worldx < 0) {
        this.worldx = this.worldwidth + this.worldx - 1;
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

