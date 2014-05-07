function ExplodyMan(stage, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy) {
    "use strict";
    var i, texture, sprite, x, y, vectorx, vectory;
    this.stage = stage;
    this.worldwidth = worldwidth;
    this.worldheight = worldheight;
    this.viewwidth = viewwidth;
    this.viewheight = viewheight;
    this.worldx = worldx;
    this.worldy = worldy;
    this.initialPlacement = true;
    this.splatArray = ["man_splat_1.png", "man_splat_2.png", "man_splat_3.png", "man_splat_4.png"];
    for (i = 0; i < this.splatArray.length; i++) {
        PIXI.Texture.fromFrame(this.splatArray[i]);
    }
    sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(this.splatArray[0]), 8, 8);
    sprite.visible = false;
    x = worldx + 4;
    y = worldy + 10;
    vectorx = Math.random() * 2 - 1;
    vectory = Math.random() * 2 - 1;
    this.splat = {"sprite": sprite, "x": x, "y": y, "vectorx": vectorx, "vectory": vectory};
    this.splatincrement = 0;
    this.stage.addChild(sprite);

    this.limbs = [];
    texture = PIXI.Texture.fromFrame("man_limb.png");
    for (i = 0; i < 4; i++) {
        sprite = new PIXI.Sprite(texture, 8, 8);
        this.stage.addChild(sprite);
        sprite.visible = false;
        sprite.anchor.x = .5;
        sprite.anchor.y = .5;
        x = worldx + 6;
        y = worldy + 12;
        vectorx = Math.random() * 8 - 4;
        vectory = Math.random() * 8 - 4;
        sprite.rotation = Math.random() * 6;
        this.limbs.push({"sprite": sprite, "x": x, "y": y, "vectorx": vectorx, "vectory": vectory});
    }
    sprite = new PIXI.Sprite(PIXI.Texture.fromFrame("man_head.png"), 8, 8);
    this.stage.addChild(sprite);
    sprite.visible = false;
    sprite.anchor.x = .5;
    sprite.anchor.y = .5;
    x = worldx + 6;
    y = worldy + 12;
    vectorx = Math.random() * 8 - 4;
    vectory = Math.random() * 8 - 4;
    this.melon = {"sprite": sprite, "x": x, "y": y, "vectorx": vectorx, "vectory": vectory};
}

ExplodyMan.constructor = ExplodyMan;

ExplodyMan.prototype.cleanup = function () {
    "use strict";
    var i;
    for (i = 0; i < this.limbs.length; i++) {
        this.stage.removeChild(this.limbs[i].sprite);
    }
    this.stage.removeChild(this.splat.sprite);
    this.stage.removeChild(this.melon.sprite);
    this.onDone(this);
};

ExplodyMan.prototype.getPosX = function (newx, worldx) {
    "use strict";
    var rightmost = newx + this.viewwidth, fragment = -1, posx;

    if (rightmost > this.worldwidth) {
        fragment = rightmost - this.worldwidth - 1; //0 based coordinates
    }
    if (fragment === -1) {
        posx = worldx - newx;
    } else {
        if (this.worldx >= newx - 12 && worldx <= this.worldwidth) {
            posx = worldx - newx;
        } else if (worldx <= fragment) {
            posx = this.worldwidth - newx + worldx;
        }
    }
    return posx;
};

ExplodyMan.prototype.update = function (newx) {
    "use strict";
    var i, texture, sprite;
    if (this.initialPlacement) {
        this.melon.sprite.position.x = this.getPosX(newx, this.melon.x);
        this.melon.sprite.position.y = this.melon.y;
        this.melon.sprite.visible = true;
        this.splat.sprite.position.x = this.getPosX(newx, this.splat.x);
        this.splat.sprite.position.y = this.splat.y;
        this.splat.sprite.visible = true;
        for (i = 0; i < this.limbs.length; i++) {
            this.limbs[i].sprite.position.x = this.getPosX(newx, this.limbs[i].x);
            this.limbs[i].sprite.position.y = this.limbs[i].y;
            this.limbs[i].sprite.visible = true;
        }
        this.initialPlacement = false;
        return;
    }
    this.splatincrement += .1;
    if (this.splatincrement >= this.splatArray.length) {
        this.cleanup();
        return;
    }
    texture = PIXI.Texture.fromFrame(this.splatArray[Math.floor(this.splatincrement)]);
    this.splat.sprite.position.x = this.getPosX(newx, this.splat.x);
    this.splat.sprite.setTexture(texture);
    this.melon.x += .1 * this.melon.vectorx;
    this.melon.y += .1 * this.melon.vectory;
    this.melon.sprite.position.x = this.getPosX(newx, this.melon.x);
    this.melon.sprite.position.y = this.melon.y;
    for (i = 0; i < this.limbs.length; i++) {
        sprite = this.limbs[i];
        sprite.x += .1 * sprite.vectorx;
        sprite.y += .1 * sprite.vectory;
        sprite.sprite.rotation += 1;
        sprite.sprite.position.x = this.getPosX(newx, sprite.x);
        sprite.sprite.position.y = sprite.y;
    }
};