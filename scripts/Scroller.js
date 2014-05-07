function Scroller(stage) {
    "use strict";
    this.bg1 = new BackgroundScroller("bg-1.png", 960, 540, 0, .128);
    this.bg2 = new BackgroundScroller("bg-2.png", 960, 148, 392, .64);
    stage.addChild(this.bg1);
    stage.addChild(this.bg2);

    this.viewportX = 0;
}

Scroller.prototype.getViewportX = function () {
    "use strict";
    return this.viewportX;
};

Scroller.prototype.moveViewportXBy = function (units, dt) {
    "use strict";
    this.viewportX += units * dt * PARTSYS.framerate;
    this.bg1.setViewportX(this.viewportX);
    this.bg2.setViewportX(this.viewportX);
};