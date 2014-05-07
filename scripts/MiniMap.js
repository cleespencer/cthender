function MiniMap(stage, world, viewwidth, viewheight) {
    "use strict";
    this.stage = stage;
    this.world = world;
    this.x = (viewwidth / 2) - (332 / 2);
    this.y = viewheight + 5;
    this.viewwidth = viewwidth;
    this.viewheight = viewheight;
    this.g = new PIXI.Graphics();
    this.g.x = this.x;
    this.g.y = this.y;
    this.g.height = 42;
    this.g.width = 332;
    this.pause = timeStamp();
    this.stage.addChild(this.g);
}

MiniMap.constructor = MiniMap;
MiniMap.prototype = Object.create(Object.prototype);

MiniMap.prototype.cleanup = function () {
    "use strict";
    this.g.clear();
};

MiniMap.prototype.drawObject = function (object, color, newx, extentx, offsetl) {
    "use strict";
    var w, w1 = null, h, x, y;
    this.g.beginFill(color);
    w = object.width / 12;
    h = object.height / 12;
    x = offsetl - newx + object.worldx / 12;
    if (x > extentx) {
        x = x - extentx;
    }
    if (x < 0) {
        x = extentx + x;
    }
    y = object.worldy / 12 + 1;
    if (x + w > extentx) {
        w1 = extentx - x;
        this.g.drawRect(x, y, w1, h);
        w = w - w1;
        this.g.drawRect(0, y, w, h);
    } else {
        this.g.drawRect(x, y, w, h);
    }
    this.g.endFill();

};

MiniMap.prototype.drawCthings = function (newx, extentx, offsetl) {
    "use strict";
    var i, k, color, cthly;
    for (i = 0; i < this.world.cthings.length; i++) {
        if (this.world.cthings[i].muto) {
            color = 0xFF0000;
        }
        else {
            color = 0x00FF00;
        }
        if (this.world.cthings[i] instanceof Cthod) {
            for (k = 0; k < this.world.cthings[i].cthlies.length; k++) {
                cthly = this.world.cthings[i].cthlies[k];
                this.drawObject(cthly,0x101010,newx,extentx,offsetl);
            }
        }
        this.drawObject(this.world.cthings[i], color, newx, extentx, offsetl);
    }
};

MiniMap.prototype.drawPlayer = function (newx, extentx, offsetl) {
    "use strict";
    this.drawObject(this.world.player, 0xFFFFFF, newx, extentx, offsetl);
};

MiniMap.prototype.drawBuildings = function (newx, extentx, offsetl) {
    "use strict";
    var i;
    for (i = 0; i < this.world.city.length; i++) {
        this.drawObject(this.world.city[i], 0x080808, newx, extentx, offsetl);
    }
};

MiniMap.prototype.drawPeople = function (newx, extentx, offsetl) {
    "use strict";
    var i, man;
    for (i = 0; i < this.world.men.length; i++) {
        man = this.world.men[i];
        if (man.status === "dead" || man.status === "saved") {
            continue;
        }
        this.drawObject(man.sprite, 0xB600FF, newx, extentx, offsetl);
    }
};

MiniMap.prototype.drawTowers = function (newx, extentx, offsetl) {
    "use strict";
    var i;
    for (i = 0; i < this.world.towers.length; i++) {
        this.drawObject(this.world.towers[i], 0x00B6FF, newx, extentx, offsetl);
    }
};

MiniMap.prototype.update = function (newx) {
    "use strict";
    var offsetl, offsetr, extentx, extenty, scalenewx = newx / 12, dt;
    dt = timeStamp();
    if (dt - this.pause < 34) {
        return;
    }
    this.pause = dt;
    extentx = this.world.worldwidth / 12;
    extenty = this.world.worldheight / 12;
    offsetl = (extentx / 2) - (this.world.viewwidth / 24) + 1;
    offsetr = (extentx / 2) + (this.world.viewwidth / 24) + 1;

    this.g.clear();
    this.g.beginFill(0x000000);
    this.g.lineStyle(1, 0xFFFF00, 1);
    this.g.moveTo(0, 0);
    this.g.lineTo(extentx + 2, 0);
    this.g.lineTo(extentx + 2, extenty + 2);
    this.g.lineTo(0, extenty + 2);
    this.g.lineTo(0, 0);
    this.g.lineStyle(1, 0xFFFFFF, 1);
    this.drawPlayer(scalenewx, extentx, offsetl);
    this.drawCthings(scalenewx, extentx, offsetl);
    this.drawBuildings(scalenewx, extentx, offsetl);
    this.drawPeople(scalenewx, extentx, offsetl);
    this.drawTowers(scalenewx, extentx, offsetl);
    this.g.moveTo(offsetl, 5);
    this.g.lineTo(offsetl, 1);
    this.g.lineTo(offsetr, 1);
    this.g.lineTo(offsetr, 5);
    this.g.endFill(0x000000);

};