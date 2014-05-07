function Cthing(world, stage, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy) {
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
    this.manattached = null;
    this.muto = false;
    PIXI.DisplayObjectContainer.call(this);

    this.textures = ["alien1.png", "alien2.png", "alien3.png", "alien4.png"];
    this.textures_capture = ["alien1_capture.png", "alien2_capture.png", "alien3_capture.png", "alien4_capture.png"];
    this.textureincrement = 0;
    this.texturevector = 1;
    this.width = 64;
    this.height = 64;

    this.soundstate = "stop";
    this.deltav = new PARTSYS.Vector(0, 0);

    texture = PIXI.Texture.fromFrame("eyeball.png");
    this.eyeball = new PIXI.Sprite(texture, texture.width, texture.height);
    this.eyeball.position.x = 10;
    this.eyeball.position.y = 12;
    this.eyeball.visible = false;
    this.eyeballfloat = new PARTSYS.Vector(0, 0);

    texture = PIXI.Texture.fromFrame("alien1.png");
    this.alien = new PIXI.Sprite(texture, texture.width, texture.height);
    this.alien.position.x = 0;
    this.alien.position.y = 0;
    this.alien.visible = false;

    this.addChild(this.eyeball);
    this.addChild(this.alien);

    this.cthingsoundplaying = false;
    this.cthingsound = new Howl({
                                    urls : ['resources/sounds/cthing_move.mp3'],
                                    onend: function () {
                                        this.cthingsoundplaying = false;
                                    }.bind(this)
                                });

    this.timeoutID = setTimeout(this.updateTexture.bind(this), 160);
}

Cthing.constructor = Cthing;
Cthing.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

Cthing.prototype.cleanup = function () {
    "use strict";
    if (this.timeoutID) {
        clearTimeout(this.timeoutID);
    }
    this.cthingsound.stop();
    this.removeChild(this.alien);
    this.removeChild(this.eyeball);
};

Cthing.prototype.attachMan = function (man) {
    "use strict";
    this.manattached = man;
    this.eyeballfloat.x = 0;
    this.eyeballfloat.y = -.1;
    this.eyeball.position.x = 10;
    this.deltav.x = 0;
    this.deltav.y = -1;
};

Cthing.prototype.tracking = function (target, alienpos) {
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

Cthing.prototype.getClosestManDelta = function () {
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

Cthing.prototype.everySecondNormal = function (e) {
    "use strict";
    var chancesofchange, xchange, ychange, changed;

    if (this.manattached) {
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
        this.deltav.x = changed.dx;
        this.deltav.y = changed.dy;
        if (xchange > .5 || ychange > .5) {
            this.deltav.x = changed.dx;
            this.deltav.y = changed.dy;
        } else {
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
        }
    }
};

Cthing.prototype.everySecondMuto = function (e) {
    "use strict";
    var xchange, ychange, targety, direction;
    targety = this.world.player.worldy;
    direction = this.tracking(this.world.player);

    if (Math.random() < .95) {
        if (direction === -1) {
            this.eyeballfloat.x = -.5;
            this.deltav.x = -3;
        } else if (direction === 1) {
            this.eyeballfloat.x = .5;
            this.deltav.x = 3;
        } else {
            this.deltav.x = 0;
        }
        if (targety < this.worldy) {
            this.eyeballfloat.y = -.5;
            this.deltav.y = -3;
        }
        if (targety > this.worldy) {
            this.eyeballfloat.y = .5;
            this.deltav.y = 3;
        }
    } else {
        xchange = Math.random();
        ychange = Math.random();
        if (xchange < .33) {
            this.eyeballfloat.x = -.3;
            this.deltav.x = -3;
        } else if (xchange < .66) {
            if (this.deltav.x > 0) {
                this.eyeballfloat.x = -.3;
            }
            else if (this.deltav.x < 0) {
                this.eyeballfloat.x = .3;
            }
            else {
                this.eyeballfloat.x = 0;
            }
            this.deltav.x = 0;
        } else {
            this.eyeballfloat.x = .3;
            this.deltav.x = 3;
        }
        if (ychange < .33) {
            this.eyeballfloat.y = -.3;
            this.deltav.y = -3;
        } else if (ychange < .66) {
            if (this.deltav.y > 0) {
                this.eyeballfloat.y = -.3;
            }
            else if (this.deltav.y < 0) {
                this.eyeballfloat.y = .3;
            }
            else {
                this.eyeballfloat.y = 0;
            }
            this.deltav.y = 0;
        } else {
            this.eyeballfloat.y = .3;
            this.deltav.y = 3;
        }
    }
};

Cthing.prototype.everySecond = function (e) {
    "use strict";
    if (this.muto) {
        this.everySecondMuto(e);
    } else {
        this.everySecondNormal(e);
    }
};

Cthing.prototype.updateSound = function () {
    "use strict";
    if (this.world.player) {
        if (!this.cthingsoundplaying) {
            if (this.alien.visible) {
                this.cthingsoundplaying = true;
                this.cthingsound.play();
            }
        }
        if (this.cthingsoundplaying && !this.visible) {
            this.cthingsound.stop();
            this.cthingsoundplaying = false;
        }
    }
};

Cthing.prototype.updateTexture = function () {
    "use strict";
    var cthingtexture;
    this.textureincrement += this.texturevector;
    if (this.textureincrement >= this.textures.length) {
        this.texturevector = -this.texturevector;
        this.textureincrement += this.texturevector * 2;
    }
    if (this.textureincrement < 0) {
        this.textureincrement = 0;
        this.texturevector = -this.texturevector;
    }
    if (this.manattached) {
        cthingtexture = PIXI.Texture.fromFrame(this.textures_capture[this.textureincrement]);
    } else {
        cthingtexture = PIXI.Texture.fromFrame(this.textures[this.textureincrement]);
    }
    this.alien.setTexture(cthingtexture);
    this.timeoutID = setTimeout(this.updateTexture.bind(this), 160);
};

Cthing.prototype.update = function (newx, dt) {
    "use strict";
    var x, y = this.worldy, rightmost, fragment = -1;
    this.alien.visible = false;
    this.worldx += this.deltav.x * dt * 60 / 1000;
    this.worldy += this.deltav.y * dt * 60 / 1000;

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
        this.worldx = this.worldwidth + this.worldx - 1;
    }

    rightmost = newx + this.viewwidth;
    if (rightmost > this.worldwidth) {
        fragment = rightmost - this.worldwidth + 1;
    }

    if (fragment === -1) {
        if (this.worldx > newx - this.width && this.worldx < rightmost + this.width) {
            x = this.worldx - newx;
            this.alien.visible = true;
        }
    } else {
        if (this.worldx > newx - this.width && this.worldx <= this.worldwidth) {
            x = this.worldx - newx;
            this.alien.visible = true;
        } else if (this.worldx < fragment + this.width) {
            x = this.worldwidth - newx + this.worldx;
            this.alien.visible = true;
        }
    }
    if (this.alien.visible) {
        this.position.x = x;
        this.position.y = y;
    }
    this.updateEyeball(newx, dt);

    if (this.manattached) {
        this.manattached.sprite.worldx = this.worldx + 26;
        this.manattached.sprite.worldy = this.worldy + 64;
    }

    if (this.worldy <= 1 && this.manattached) {
        this.world.manBlooie(this.manattached);
        this.manattached = null;
        this.muto = true;
        this.alien.tint = 0xFF0000;
        this.eyeball.tint = 0x00FF00;
    }

    this.updateSound();

};

Cthing.prototype.updateEyeball = function (newx, dt) {
    "use strict";
    this.eyeball.visible = this.alien.visible;
    this.eyeball.position.x += this.eyeballfloat.x;
    this.eyeball.position.y += this.eyeballfloat.y;

    if (this.eyeball.position.y < 9) {
        this.eyeball.position.y = 9;
    }
    if (this.eyeball.position.y > 14) {
        this.eyeball.position.y = 14;
    }
    if (this.eyeball.position.x < 6) {
        this.eyeball.position.x = 6;
    }
    if (this.eyeball.position.x > 14) {
        this.eyeball.position.x = 14;
    }

    if (this.deltav.x < 0) {
        this.eyeballfloat.x -= .1;
    }
    if (this.deltav.x > 0) {
        this.eyeballfloat.x += .1;
    }
    if (this.deltav.x === 0) {
        if (this.eyeball.position.x > 10.2) {
            this.eyeballfloat.x -= .1;
        } else if (this.eyeball.position.x < 9.8) {
            this.eyeballfloat.x += .1;
        } else {
            this.eyeballfloat.x = 0;
        }
    }
    if (this.eyeballfloat.x < -.3) {
        this.eyeballfloat.x = -.3;
    }
    if (this.eyeballfloat.x > .3) {
        this.eyeballfloat.x = .3;
    }

    if (this.deltav.y < 0) {
        this.eyeballfloat.y -= .1;
    }
    if (this.deltav.y > 0) {
        this.eyeballfloat.y += .1;
    }
    if (this.deltav.y === 0) {
        if (this.eyeball.position.y > 11.7) {
            this.eyeballfloat.y -= .05;
        } else if (this.eyeball.position.y < 11.3) {
            this.eyeballfloat.y += .05;
        } else {
            this.eyeballfloat.y = 0;
        }
    }
    if (this.eyeballfloat.y < -.2) {
        this.eyeballfloat.y = -.2;
    }
    if (this.eyeballfloat.y > .2) {
        this.eyeballfloat.y = .2;
    }

};