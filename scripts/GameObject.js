function GameObject(resource, width, height, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy) {
    "use strict";
    var texture = PIXI.Texture.fromFrame(resource);
    PIXI.Sprite.call(this, texture, width, height);
    this.position.x = 0;
    this.position.y = worldy;
    this.worldx = worldx;
    this.worldy = worldy;
    this.worldwidth = worldwidth;
    this.worldheight = worldheight;
    this.worldheight = worldheight;
    this.viewwidth = viewwidth;
    this.viewheight = viewheight;
    this.alwaysinvisible = false;
}

GameObject.constructor = GameObject;
GameObject.prototype = Object.create(PIXI.Sprite.prototype);

GameObject.prototype.setInvisible = function () {
    "use strict";
    this.alwaysinvisible = true;
};

GameObject.prototype.setVisible = function () {
    "use strict";
    this.alwaysinvisible = false;
};

GameObject.prototype.update = function (newx) {
    "use strict";
    // First we need to see if we're in the view width.
    // We need to see if we're on screen.
    // if not, we set this.visible=False and bail.

    // so, our viewwidth needs to be this.width+this.worldwidth
    // and -this.width
    this.visible = false;
    this.position.y = this.worldy;
    if (this.alwaysinvisible === true) {
        return;
    }

    var rightmost = newx + this.viewwidth, fragment = -1;

    if (rightmost > this.worldwidth) {
        fragment = rightmost - this.worldwidth - 1;
    }
    if (fragment === -1) {
        if (this.worldx >= newx - this.width && this.worldx <= rightmost + this.width) {
            this.position.x = this.worldx - newx;
            this.visible = true;
        }
    } else {
        if (this.worldx >= newx - this.width && this.worldx <= this.worldwidth) {
            this.position.x = this.worldx - newx;
            this.visible = true;
        } else if (this.worldx <= fragment + this.width) {
            this.position.x = this.worldwidth - newx + this.worldx;
            this.visible = true;
        }
    }
};

GameObject.prototype.everySecond = function (e) {
    // stub prototype
};