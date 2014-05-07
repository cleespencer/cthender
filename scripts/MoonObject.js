function MoonObject(resource, width, height, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy) {
    "use strict";
    var texture = PIXI.Texture.fromFrame(resource);
    PIXI.Sprite.call(this, texture, width, height);
    this.position.x = 0;
    this.position.y = worldy;
    this.worldx = worldx;
    this.worldwidth = worldwidth;
    this.worldheight = worldheight;
    this.viewwidth = viewwidth - width;
    this.viewheight = viewheight;
    this.halfway = Math.floor(worldwidth / 2);
}

MoonObject.constructor = MoonObject;
MoonObject.prototype = Object.create(PIXI.Sprite.prototype);

MoonObject.prototype.update = function (newx) {
    "use strict";
    var relativedistancefromcenter = Math.abs(this.halfway - newx);

    this.position.x = Math.floor(this.viewwidth - (this.viewwidth * (relativedistancefromcenter / this.halfway)));
};