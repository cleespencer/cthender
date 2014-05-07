function Intermission(stage, renderer, game, men) {
    "use strict";
    var texture, sound;
    this.stage = stage;
    this.renderer = renderer;
    this.game = game;
    this.gamemen = men;
    this.men = [];
    this.playerfuel = 4;
    texture = PIXI.Texture.fromFrame("bg-1.png");
    this.bg1 = new PIXI.Sprite(texture, texture.width, texture.height);
    texture = PIXI.Texture.fromFrame("bg-2.png");
    this.bg2 = new PIXI.Sprite(texture, texture.width, texture.height);
    this.bg2.position.y = 540 - this.bg2.height;
    texture = PIXI.Texture.fromFrame("moon.png");
    this.moon = new PIXI.Sprite(texture, texture.width, texture.height);
    this.moon.position.x = 480 - (this.moon.width / 2);
    this.moon.position.y = 50;
    this.stage.addChild(this.bg1);
    this.stage.addChild(this.bg2);
    this.stage.addChild(this.moon);
    this.city = [];
    this.buildCity();
    this.congrats();
    this.sound = new Howl({urls: ['resources/sounds/cheer.mp3'], volume: 1.0}).play();
}

Intermission.WORLDMAX = 960;

Intermission.constructor = Intermission;
Intermission.prototype = Object.create(Object.prototype);

Intermission.prototype.congrats = function () {
    "use strict";
    var bonustext, congratstext, savedtext, hitentertext, saved = 0, i, percentageneeded, percentagegot, bonus;
    for (i = 0; i < this.gamemen.length; i++) {
        if (this.gamemen[i].status === "saved") {
            saved++;
        }
    }
    percentageneeded = Math.floor(50 + (this.game.wave / 5) * 5);
    percentagegot = (saved/this.gamemen.length)*100;
    bonus = Math.floor((percentagegot-percentageneeded) * 50);
    if (bonus>0) {
        this.game.score+=bonus;
        bonustext = new PIXI.Text("Extra effort bonus: "+bonus, {font: "20px Play", fill: "white", align: "left"});
        bonustext.position.x =  480 - (bonustext.width / 2);
        bonustext.position.y = this.moon.position.y + this.moon.height + 5;
        this.stage.addChild(bonustext);
    }
    congratstext = new PIXI.Text("Congratulations!", {font: "20px Play", fill: "white", align: "left"});
    congratstext.position.x = 480 - (congratstext.width / 2);
    if (bonus>0) {
        congratstext.position.y = bonustext.position.y + bonustext.height + 5;
    } else {
        congratstext.position.y = this.moon.position.y + this.moon.height + 5;
    }
    this.stage.addChild(congratstext);
    savedtext = new PIXI.Text("You saved " + saved + " of " + this.gamemen.length + " men",
                              {font: "20px Play", fill: "white", align: "left"});
    savedtext.position.x = 480 - (savedtext.width / 2);
    savedtext.position.y = congratstext.y + congratstext.height + 5;
    this.stage.addChild(savedtext);
    hitentertext = new PIXI.Text("Hit 'Enter' key to continue the fight...",
                                 {font: "20px Play", fill: "white", align: "left"});
    hitentertext.position.x = 480 - (hitentertext.width / 2);
    hitentertext.position.y = savedtext.y + savedtext.height + 5;
    this.stage.addChild(hitentertext);

};

Intermission.prototype.buildCity = function () {
    "use strict";
    var x = 0, buildingtype, building, manx, many, man;
    while (x < Intermission.WORLDMAX) {
        buildingtype = Math.ceil(Math.random() * 3) - 1;
        if (Intermission.WORLDMAX - x < 160) {
            buildingtype = 0;
        }
        if (buildingtype === 0) {
            building = new BuildingObject("building03x1.png", 80, 156,
                                          Intermission.WORLDMAX, 540, 960, 540, x, 540 - 156);
        }
        else if (buildingtype === 1) {
            building = new BuildingObject("building02x1.png", 80, 188,
                                          Intermission.WORLDMAX, 540, 960, 540, x, 540 - 188);
        }
        else {
            building = new BuildingObject("building01x2.png", 160, 125,
                                          Intermission.WORLDMAX, 540, 960, 540, x, 540 - 125);
        }
        if (buildingtype === 0 || buildingtype === 1) {
            x += 80;
        }
        else {
            x += 160;
        }
        if (Math.random() < .75) {
            manx = building.worldx + Math.floor(building.width / 2) - 6;
            many = building.worldy - 24;
            man = new ManObject(this, GameWorld.WORLDMAX, 540, 960, 540, manx, many);
            this.stage.addChild(man);
            this.men.push({"sprite": man, "flyingsprite": null, "status": "standing", "fallheight": null});
        }
        this.stage.addChild(building);
        this.city.push(building);
    }
};

Intermission.prototype.cleanup = function () {
    "use strict";
    this.sound.stop();
};

Intermission.prototype.status = function () {
    "use strict";
    return true;
};

Intermission.prototype.secondTick = function (e) {
    "use strict";
    var i;
    for (i = 0; i < this.men.length; i++) {
        this.men[i].sprite.everySecond("cheering");
    }
};

Intermission.prototype.update = function (dt) {
    "use strict";
    var i;
    for (i = 0; i < this.city.length; i++) {
        this.city[i].update(0);
    }
    for (i = 0; i < this.men.length; i++) {
        this.men[i].sprite.update(0, this.men[i], null, dt);
    }
    this.renderer.render(this.stage);
};

Intermission.prototype.checkKeyUp = function (key) {
    "use strict";

};

Intermission.prototype.checkKeyDown = function (key) {
    "use strict";

};