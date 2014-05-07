function BackgroundScroller(resource, width, height, offsety, deltaX) {
    "use strict";
    //var texture = PIXI.Texture.fromImage(resource);
    var texture = PIXI.Texture.fromFrame(resource);
    PIXI.TilingSprite.call(this, texture, width, height);
    this.position.x = 0;
    this.position.y = offsety;
    this.tilePosition.x = 0;
    this.tilePosition.y = 0;

    this.viewportX = 0;
    this.deltaX = deltaX;
}

BackgroundScroller.constructor = BackgroundScroller;
BackgroundScroller.prototype = Object.create(PIXI.TilingSprite.prototype);

BackgroundScroller.prototype.setViewportX = function (newViewportX) {
    "use strict";
    var distanceTravelled = newViewportX - this.viewportX;
    this.viewportX = newViewportX;
    this.tilePosition.x -= (distanceTravelled * this.deltaX);
};

BackgroundScroller.prototype.setDeltaX = function (deltax) {
    "use strict";
    this.deltaX = deltax;
};