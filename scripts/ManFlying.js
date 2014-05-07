function ManFlying(worldwidth, worldheight, viewwidth, viewheight, worldx, worldy) {
    "use strict";
    var ta_r, ta_l, anims_r, anims_l, width = 24, height = 12;
    ta_r = ["man_flight_1_r.png", "man_flight_2_r.png", "man_flight_3_r.png", "man_flight_4_r.png", "man_flight_5_r.png",
        "man_flight_6_r.png", "man_flight_7_r.png", "man_flight_8_r.png", "man_flight_9_r.png", "man_flight_10_r.png", "man_flight_11_r.png",
        "man_flight_12_r.png", "man_flail_1_r.png", "man_flail_2_r.png", "man_flail_3_r.png", "man_flail_4_r.png" ];
    ta_l = ["man_flight_1_l.png", "man_flight_2_l.png", "man_flight_3_l.png", "man_flight_4_l.png", "man_flight_5_l.png",
        "man_flight_6_l.png", "man_flight_7_l.png", "man_flight_8_l.png", "man_flight_9_l.png", "man_flight_10_l.png", "man_flight_11_l.png",
        "man_flight_12_l.png", "man_flail_1_l.png", "man_flail_2_l.png", "man_flail_3_l.png", "man_flail_4_l.png" ];
    this.anims_r = {"flying": ta_r.slice(0, 12), "flailing": ta_r.slice(12)};
    this.anims_l = {"flying": ta_l.slice(0, 12), "flailing": ta_l.slice(12)};

    this.textureincrement = .1;
    this.incrementval = .1;

    this.worldwidth = worldwidth;
    this.worldheight = worldheight;
    this.viewwidth = viewwidth;
    this.viewheight = viewheight;
    this.worldx = worldx;
    this.worldy = worldy;
    this.animtype = "flying";

    GameObject.call(this, ta_r[0], width, height, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy);
    this.visible = false;
}

ManFlying.constructor = ManFlying;
ManFlying.prototype = Object.create(GameObject.prototype);

ManFlying.prototype.updateTexture = function (newx, man, carrier) {
    "use strict";
    var anim, playertexture;
    if (carrier.olddirection === 1) {
        anim = this.anims_r;
    } else {
        anim = this.anims_l;
    }
    this.textureincrement += this.incrementval;
    if (this.textureincrement >= anim[this.animtype].length) {
        this.incrementval = -this.incrementval;
        this.textureincrement += this.incrementval;
    }
    if (this.textureincrement < 0) {
        this.incrementval = -this.incrementval;
        this.textureincrement += this.incrementval;
    }
    playertexture = PIXI.Texture.fromFrame(anim[this.animtype][Math.floor(this.textureincrement)]);
    this.setTexture(playertexture);
};

ManFlying.prototype.update = function (newx, man, carrier) {
    "use strict";
    this.visible = false;
    this.worldx = carrier.worldx + 42;
    this.worldy = carrier.worldy + carrier.height;
    this.position.y = this.worldy;
    if (this.worldx > this.worldwidth) {
        this.worldx = this.worldx - this.worldwidth;
    }

    var rightmost = newx + this.viewwidth, fragment = -1;

    if (rightmost > this.worldwidth) {
        fragment = rightmost - this.worldwidth - 1; //0 based coordinates
    }
    if (this.worldx >= newx && this.worldx <= this.worldwidth) {
        this.position.x = this.worldx - newx;
        this.visible = true;
    } else if (this.worldx <= fragment) {
        this.position.x = this.worldwidth - newx + this.worldx;
        this.visible = true;
    }
    if (this.visible && man.status === "flying") {
        this.updateTexture(newx, man, carrier);
    }
};