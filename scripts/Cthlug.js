function Cthlug(world, stage, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy) {
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
    this.dead = false;

    this.textures_l = ["cthlug_1_l.png", "cthlug_2_l.png", "cthlug_3_l.png", "cthlug_4_l.png", "cthlug_5_l.png"];
    this.textures_l_up = ["cthlug_1_lup.png", "cthlug_2_lup.png", "cthlug_3_lup.png", "cthlug_4_lup.png", "cthlug_5_lup.png"];
    this.textures_l_down = ["cthlug_1_ldown.png", "cthlug_2_ldown.png", "cthlug_3_ldown.png", "cthlug_4_ldown.png", "cthlug_5_ldown.png"];
    this.textures_r = ["cthlug_1_r.png", "cthlug_2_r.png", "cthlug_3_r.png", "cthlug_4_r.png", "cthlug_5_r.png"];
    this.textures_r_up = ["cthlug_1_rup.png", "cthlug_2_rup.png", "cthlug_3_rup.png", "cthlug_4_rup.png", "cthlug_5_rup.png"];
    this.textures_r_down = ["cthlug_1_rdown.png", "cthlug_2_rdown.png", "cthlug_3_rdown.png", "cthlug_4_rdown.png", "cthlug_5_rdown.png"];
    this.textures_dying = ["cthlug_dead_1.png", "cthlug_dead_2.png", "cthlug_dead_3.png", "cthlug_dead_4.png", "cthlug_dead_5.png",
        "cthlug_dead_6.png", "cthlug_dead_7.png", "cthlug_dead_8.png", "cthlug_dead_9.png", "cthlug_dead_10.png",
        "cthlug_dead_11.png", "cthlug_dead_12.png"];
    //1 = left, 2 = left/up, 3 = left/down, 4 = right, 5 = right/up, 6 = right/down, 7 = dying
    this.direction = Math.random() < .5 ? 1 : 4;
    this.textureincrement = 0;
    this.texturevector = 1;
    this.deltav = new PARTSYS.Vector(0, 0);
    width = 36;
    height = 12;
    this.dod = timeStamp()+50000+Math.random()*20000;
    this.cthingsoundplaying = false;
    this.cthingsound = new Howl({
                                    urls : ['resources/sounds/placeholder.mp3'],
                                    onend: function () {
                                        this.cthingsoundplaying = false;
                                    }.bind(this)
                                });

    GameObject.call(this, this.textures_l[0], width, height, worldwidth, worldheight, viewwidth, viewheight, worldx,
                    worldy);
    this.timeoutID = setTimeout(this.updateTexture.bind(this), 160);
}

Cthlug.constructor = Cthlug;
Cthlug.prototype = Object.create(GameObject.prototype);

Cthlug.prototype.cleanup = function () {
    "use strict";
    if (this.timeoutID) {
        clearTimeout(this.timeoutID);
    }
    this.cthingsound.stop();
};

Cthlug.prototype.everySecond = function (e) {
    "use strict";
    if (timeStamp()>this.dod && (this.direction===1 || this.direction===4)) {
        this.textureincrement=0;
        this.texturevector=1;
        this.direction=7;
    }
};

Cthlug.prototype.updateSound = function () {
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

Cthlug.prototype.updateTexture = function (reschedule) {
    "use strict";
    if (reschedule === undefined) {
        reschedule = true;
    }
    var cthlugtexture, ta;
    switch (this.direction) {
        case 1:
            ta = this.textures_l;
            break;
        case 2:
            ta = this.textures_l_up;
            break;
        case 3:
            ta = this.textures_l_down;
            break;
        case 4:
            ta = this.textures_r;
            break;
        case 5:
            ta = this.textures_r_up;
            break;
        case 6:
            ta = this.textures_r_down;
            break;
        case 7:
            ta = this.textures_dying;
            break;
    }
    this.textureincrement += this.texturevector;
    if (this.textureincrement >= ta.length) {
        if (this.direction===7) {
            this.dead=true;
        }
        this.texturevector = -this.texturevector;
        this.textureincrement = ta.length - 1;
    }
    if (this.textureincrement < 0) {
        this.textureincrement = 1;
        this.texturevector = -this.texturevector;
    }
    if (this.visible) {
        cthlugtexture = PIXI.Texture.fromFrame(ta[this.textureincrement]);
        this.setTexture(cthlugtexture);
    }
    if (reschedule) {
        this.timeoutID=setTimeout(this.updateTexture.bind(this), 160);
    }
};

Cthlug.prototype.getTouch = function (i, x, y) {
    "use strict";
    var building, touch = {"tl": null, "tr": null, "bl": null, "br": null, "right": null, "left": null, "bottom": null};

    if (y + this.height >= this.worldheight &&
        ((this.direction < 4 && i === 0) ||
            (this.direction > 3 && i === this.world.city.length))) {
        touch.bl = true;
        touch.bottom = true;
        touch.br = true;
        building = {"worldx": this.worldx - 1, "worldy": this.worldheight, "width": this.width};
    } else if ((this.direction < 4 && i === 0) || (this.direction > 3 && i === this.world.city.length)) {
        return {"touch": null, "building": null};
    } else {
        if (this.direction < 4) {
            building = this.world.city[i - 1];
        } else {
            building = this.world.city[i];
        }
        touch.left = this.world.isCollidedPoint(building, x, y + this.height / 2, false);
        touch.bottom = this.world.isCollidedPoint(building, x + this.width / 2, y + this.height, false);
        touch.right = this.world.isCollidedPoint(building, x + this.width, y + this.height / 2, false);
        touch.tl = this.world.isCollidedPoint(building, x, y, false);
        touch.tr = this.world.isCollidedPoint(building, x + this.width, y, false);
        touch.bl = this.world.isCollidedPoint(building, x, y + this.height, false);
        touch.br = this.world.isCollidedPoint(building, x + this.width, y + this.height, false);
    }
    return {"touch": touch, "building": building};
};

Cthlug.prototype.updatePosition = function (newx, dt) {
    "use strict";
    var i, olddirection, building, x, y, touch, rettouch;
    switch (this.direction) {
        case 1:
            this.deltav.x = -.2;
            this.deltav.y = 1;
            break;
        case 2:
            this.deltav.x = -.2;
            this.deltav.y = -.2;
            break;
        case 3:
            this.deltav.x = .2;
            this.deltav.y = .2;
            break;
        case 4:
            this.deltav.x = .2;
            this.deltav.y = 1;
            break;
        case 5:
            this.deltav.x = .2;
            this.deltav.y = -.2;
            break;
        case 6:
            this.deltav.x = -.2;
            this.deltav.y = .2;
            break;
        case 7:
            this.deltav.x = 0;
            this.deltav.y = 0;
            break;
    }

    //x = this.worldx + (this.deltav.x * dt * PARTSYS.framerate);
    //y = this.worldy + (this.deltav.y * dt * PARTSYS.framerate);

    x = this.worldx + this.deltav.x;
    y = this.worldy + this.deltav.y;

    if (x > this.worldwidth) {
        x = x - this.worldwidth + 1;
    }
    if (x < 0) {
        x = this.worldwidth + x - 1;
    }

    if (this.direction < 4) {
        for (i = 0; i <= this.world.city.length; i++) {
            rettouch = this.getTouch(i, x, y);
            touch = rettouch.touch;
            building = rettouch.building;
            if (touch === null) {
                continue;
            }
            if (!touch.left && !touch.right && !touch.bottom && !touch.tl && !touch.tr && !touch.bl && !touch.br) {
                continue;
            }
            //1 = left, 2 = left/up, 3 = left/down, 4 = right, 5 = right/up, 6 = right/down, 7 = dying
            olddirection = this.direction;
            switch (this.direction) {
                case 1:
                    if (touch.left) {
                        x = building.worldx + building.width;
                        y -= 24;
                        this.direction = 2;
                        break;
                    }
                    if (!touch.bottom && !touch.bl) { //more than halfway past the building edge
                        x = building.worldx - 12;
                        y = building.worldy;
                        this.direction = 3;
                        break;
                    }
                    if (y + 12 >= this.worldheight) {
                        y = this.worldheight - 12;
                    } else {
                        y = building.worldy - 12;
                    }
                    break;
                case 2:
                    if (!touch.left) {
                        x = (building.worldx + building.width) - 36;
                        y = building.worldy - 12;
                        this.direction = 1;
                        break;
                    }
                    x = building.worldx + building.width;
                    break;
                case 3:
                    if (touch.bottom) {
                        x = building.worldx + building.width - 36;
                        y += 24;
                        this.direction = 1;
                        break;
                    }
                    x = building.worldx - 12;
                    break;
            }
            if (olddirection != this.direction) {
                this.visible = true;
                this.updateTexture(false);
                this.visible = false;
            }
            if (i > 0) {
                break;
            }
        }
    } else if (this.direction < 7) {
        for (i = this.world.city.length; i >= 0; i--) {
            rettouch = this.getTouch(i, x, y);
            touch = rettouch.touch;
            building = rettouch.building;
            if (touch === null) {
                continue;
            }
            if (!touch.left && !touch.right && !touch.bottom && !touch.tl && !touch.tr && !touch.bl && !touch.br) {
                continue;
            }
            //1 = left, 2 = left/up, 3 = left/down, 4 = right, 5 = right/up, 6 = right/down, 7 = dying
            olddirection = this.direction;
            switch (this.direction) {
                case 4:
                    if (touch.right) {
                        x = building.worldx - 12;
                        y -= 24;
                        this.direction = 5;
                        break;
                    }
                    if (!touch.bottom && !touch.br) {
                        x = building.worldx + building.width;
                        y = building.worldy - 18;
                        this.direction = 6;
                        break;
                    }
                    if (y + 12 >= this.worldheight) {
                        y = this.worldheight - 12;
                    } else {
                        y = building.worldy - 12;
                    }
                    break;
                case 5:
                    if (!touch.right) {
                        x = building.worldx - 18;
                        y = building.worldy - 12;
                        this.direction = 4;
                        break;
                    }
                    x = building.worldx - 12;
                    break;
                case 6:
                    if (touch.bottom) {
                        x = building.worldx + 1;
                        y += 24;
                        this.direction = 4;
                        break;
                    }
                    x = building.worldx + building.width;
                    break;
            }
            if (olddirection != this.direction) {
                this.visible = true;
                this.updateTexture(false);
                this.visible = false;
                break;
            }
            if (i < this.world.city.length) {
                break;
            }
        }
    }
    this.worldx = x;
    this.worldy = y;
};

Cthlug.prototype.update = function (newx, dt) {
    "use strict";
    var x, y , rightmost, fragment = -1;
    this.visible = false;

    this.updatePosition(newx, dt);
    x = this.worldx;
    y = this.worldy;

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

