function ManObject(world, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy) {
    "use strict";
    var i, width = 12, height = 24, texturesArray;
    this.world = world;
    texturesArray = ["man_standing_1.png", "man_jumping_1.png", "man_jumping_2.png", "man_jumping_3.png",
        "man_jumping_4.png", "man_jumping_5.png",
        "man_waving_1.png", "man_waving_2.png", "man_waving_3.png", "man_waving_4.png", "man_waving_5.png",
        "man_waving_6.png", "man_waving_7.png", "man_waving_8.png",
        "man_flail_1.png", "man_flail_2.png", "man_flail_3.png", "man_flail_4.png",
        "man_flail_5.png", "man_flail_6.png", "man_flail_7.png",
        "man_flail_8.png", "man_flail_9.png", "man_flail_10.png", "man_flail_11.png",
        "man_flail_12.png", "man_flail_13.png", "man_walking_1_l.png", "man_walking_2_l.png",
        "man_walking_3_l.png", "man_walking_4_l.png", "man_walking_5_l.png", "man_walking_6_l.png",
        "man_walking_1_r.png", "man_walking_2_r.png", "man_walking_3_r.png", "man_walking_4_r.png",
        "man_walking_5_r.png", "man_walking_6_r.png"];
    this.man_anims = {"standing": ["man_standing_1.png"], "jumping": texturesArray.slice(1, 6),
        "waving": texturesArray.slice(6, 14), "ascending": texturesArray.slice(4, 6),
        "falling": texturesArray.slice(1, 3), "saving": texturesArray.slice(1, 3), "flying": ["man_jumping_1.png"],
        "flailing": texturesArray.slice(14, 27), "walkingleft": texturesArray.slice(27, 33),
        "walkingright": texturesArray.slice(33, 39)};
    this.textureincrement = 0;
    this.incrementval = 1;
    this.manstate = "standing";
    this.idlestate = "standing";
    this.wavedirection = "left";
    GameObject.call(this, texturesArray[0], width, height, worldwidth, worldheight, viewwidth, viewheight, worldx,
                    worldy);

    this.timeoutID=setTimeout(this.updateTexture.bind(this), 160);
}

ManObject.constructor = ManObject;
ManObject.prototype = Object.create(GameObject.prototype);

ManObject.prototype.cleanup = function () {
    "use strict";
    if (this.timeoutID) {
        clearTimeout(this.timeoutID);
    }
};

// Overrides the GameObject.everySecond event handler.
ManObject.prototype.everySecond = function (e) {
    "use strict";
    var randommod;
    if (e === "cheering") {
        randommod = .2;
    } else {
        randommod = 1;
    }
    var action;
    if (this.manstate === "standing" && (this.idlestate === "standing" ||
        this.idlestate === "walkingleft" || this.idlestate === "walkingright")) {
        this.textureincrement = 0;
        this.incrementval = 1;
        this.wavedirection = "";
        this.idlestate = "standing";
        action = Math.random() * randommod;
        if (action < .10) {
            this.textureincrement = 0;
            this.idlestate = "jumping";
        } else if (action >= .10 && action < .20) {
            this.textureincrement = 0;
            this.idlestate = "waving";
            if (Math.random() < .5) {
                this.wavedirection = "left";
            } else {
                this.wavedirection = "right";
            }
        } else if (action >= .20 && action < .30) {
            this.textureincrement = 0;
            this.idlestate = "walking";
            if (Math.random() < .5) {
                this.idlestate = "walkingleft";
            } else {
                this.idlestate = "walkingright";
            }
        }
    }
};

ManObject.prototype.updateTexture = function () {
    "use strict";
    var playertexture, anim;
    if (this.manstate === "standing") {
        anim = this.idlestate;
    } else {
        anim = this.manstate;
        if (anim === "saved" || anim === "dead") {
            return;
        }
    }
    this.textureincrement += this.incrementval;
    if (this.textureincrement >= this.man_anims[anim].length) {
        if (this.manstate === "standing" && (this.idlestate === "walkingleft" || this.idlestate === "walkingright")) {
            this.textureincrement = 0;
        } else {
            this.incrementval = -this.incrementval;
            this.textureincrement += this.incrementval;
        }
    }
    if (this.textureincrement < 0) {
        this.textureincrement = 0;
        this.incrementval = 1;
        this.scale.x = 1;
        this.anchor.x = 0;
        this.idlestate = "standing";
    }
    if (this.manstate === "standing" && this.idlestate === "waving") {
        if (this.wavedirection === 'right') {
            this.scale.x = -1;
            this.anchor.x = 1;
        } else {
            this.scale.x = 1;
            this.anchor.x = 0;
        }
    }
    if (this.visible && this.status !== "flying") {
        playertexture = PIXI.Texture.fromFrame(this.man_anims[anim][this.textureincrement]);
        this.setTexture(playertexture);
    }
    this.timeoutID=setTimeout(this.updateTexture.bind(this), 160);
};

ManObject.prototype.backtrackMan = function (x, dd) {
    "use strict";
    x -= dd;
    this.idlestate = this.idlestate === "walkingleft" ? "walkingright" : "walkingleft";
    return x;
};

ManObject.prototype.updateWalking = function (dt) {
    "use strict";
    var i, x, y, building, buildingleft, buildingright, testx, dd, man, ret, testbuilding=false;
    x = 0 + this.worldx; // want a copy, not a reference
    y = 0 + this.worldy; // want a copy, not a reference
    if (this.idlestate === "walkingleft") {
        dd = -.5;
        testx = x - 1;
    } else {
        dd = .5;
        testx = x + 12;
    }
    x += dd;
    for (i = 0; i < this.world.city.length; i++) {
        building = this.world.city[i];

        if (this.world.isCollidedCoords(building, this.worldx, this.worldy, this.width, this.height + 1)) {
            testbuilding=true;
            if (i === 0) {
                buildingleft = this.world.city[this.world.city.length - 1];
            } else {
                buildingleft = this.world.city[i - 1];
            }
            if (i === this.world.city.length - 1) {
                buildingright = this.world.city[0];
            } else {
                buildingright = this.world.city[i + 1];
            }

            if (!this.world.isCollidedCoords(building, testx, y + 24, 1, 1, false)) {
                if (!this.world.isCollidedCoords(buildingleft, testx, y + 24, 1, 1, false)) {
                    if (!this.world.isCollidedCoords(buildingright, testx, y + 24, 1, 1, false)) {
                        x = this.backtrackMan(x, dd);
                        break;
                    }
                }
            }
            if (this.idlestate === "walkingleft") {
                if (this.world.isCollidedCoords(buildingleft, x, y, this.width, this.height, false)) {
                    x = this.backtrackMan(x, dd);
                    break;
                }
            } else {
                if (this.world.isCollidedCoords(buildingright, x, y, this.width, this.height, false)) {
                    x = this.backtrackMan(x, dd);
                    break;
                }
            }
        }
    }
    if (!testbuilding) {
        console.log("Shouldn't get here");
    }
    for (i=0;i<this.world.men.length;i++) {
        man=this.world.men[i].sprite;
        if (man===this) { continue; }
        if (this.world.isCollidedCoords(man,x,y,this.width,this.height,false)) {
            x = this.backtrackMan(x,dd);
            break;
        }
    }
    this.worldx = x;
};

ManObject.prototype.update = function (newx, man, carrier, dt) {
    "use strict";
    // First we need to see if we're in the view width.
    // We need to see if we're on screen.
    // if not, we set this.visible=False and bail.

    // so, our viewwidth needs to be this.width+this.worldwidth
    // and -this.width
    this.visible = false;
    if (man.status === "dead" || man.status === "saved") {
        this.manstate = man.status;
        return;
    }

    if (man.status !== this.manstate) {
        this.incrementval = 1;
        this.textureincrement = 0;
        this.scale.x = 1;
        this.anchor.x = 0;
        this.idlestate = "standing";
    }

    if (man.status === "falling" || man.status === "saving") {
        this.worldy += .35 * dt * PARTSYS.framerate;
    }
    if (man.status === "ascending") {
        this.worldy -= .2 * dt * PARTSYS.framerate;
    }
    if (man.status === "flying") {
        this.worldx = carrier.worldx + 50;
        this.worldy = carrier.worldy + carrier.height;
        if (this.worldx > this.worldwidth) {
            this.worldx = this.worldx - this.worldwidth;
        }
    }
    this.manstate = man.status;
    if (this.manstate === "standing" && (this.idlestate === "walkingleft" || this.idlestate === "walkingright")) {
        this.updateWalking(dt);
    }

    this.position.y = this.worldy;

    var rightmost = newx + this.viewwidth, fragment = -1;

    if (rightmost > this.worldwidth) {
        fragment = rightmost - this.worldwidth - 1; //0 based coordinates
    }
    if (fragment === -1) {
        if (this.worldx > newx - this.width && this.worldx < rightmost + this.width) {
            this.position.x = this.worldx - newx;
            this.visible = true;
        }
    } else {
        if (this.worldx > newx - this.width && this.worldx <= this.worldwidth) {
            this.position.x = this.worldx - newx;
            this.visible = true;
        } else if (this.worldx < fragment + this.width) {
            this.position.x = this.worldwidth - newx + this.worldx;
            this.visible = true;
        }
    }

};