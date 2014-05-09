function GameWorld(stage, renderer, game) {
    "use strict";
    // This class represents the state of the game world.
    // It also holds all of the "actors" in the game world.
    // When Main's "update()" is called, it will call
    // this class' update function, which will translate
    // the virtualized world into a "camera" view
    // representing the internal representation of the
    // "world" as images on the screen.
    // Once the image is drawn, hit detection is performed,
    // the game state is updated (enemy AI, etc)
    // and victory conditions are applied.
    // Only objects that can be seen (+/- the width of the
    // largest object in the game) are submitted for
    // rendering.
    // Leethack... the camera "pans" to the right when
    // the player is on the left hand side of the screen
    // and "pans" to the left when the player is on the
    // right hand side, thus giving the player a wider
    // field of view.  This pan happens whenever a player
    // changes direction.
    // Future DO: implement a mini-map, which should be
    // as easy as representing the world state using
    // colored pixels for each actor, then scaling down
    // by a standard width factor (such as dividing
    // world position by 8x8, giving us a 480x67
    // mini-map...)
    // ya know... it's at times like these that I think
    // I bite off more than I can chew...
    var nummen;
    this.stage = stage;
    this.renderer = renderer;
    this.game = game;
    this.wave = this.game.wave;
    this.basedelta = 5;
    this.keyarrs = [];
    this.city = [];
    this.ships = [];
    this.towers = [];
    this.men = [];
    this.splodythings = [];
    this.viewwidth = 960;
    this.viewheight = 540;
    this.worldwidth = GameWorld.WORLDMAX;
    this.worldheight = 540;
    this.minimap = new MiniMap(stage, this, this.viewwidth, this.viewheight);
    this.keyarrs[13] = 'enter';
    this.keyarrs[27] = 'escape'
    this.keyarrs[32] = 'space';
    this.keyarrs[37] = 'left';
    this.keyarrs[38] = 'up';
    this.keyarrs[39] = 'right';
    this.keyarrs[40] = 'down';
    this.keyarrs[87] = 'up';
    this.keyarrs[83] = 'down';
    this.keyarrs[65] = 'left';
    this.keyarrs[68] = 'right';
    this.particlesystem = new PARTSYS.ParticleSystem();
    this.scroller = new Scroller(this.stage);
    this.moon = new MoonObject("moon.png", 72, 72, GameWorld.WORLDMAX, 540, 960, 540,
                               Math.floor(GameWorld.WORLDMAX / 2), 50);
    this.stage.addChild(this.moon);
    this.cthlugs = [];
    this.buildCity();
    this.player = new PlayerObject(this.stage, this.particlesystem, GameWorld.WORLDMAX, 540, 960, 540, 254);
    this.stage.addChild(this.player);
    this.camerax = 0;
    this.maxcthortals = Math.ceil(this.wave / 3);
    this.maxcthortals = Math.min(this.maxcthortals, 5);
    this.cthortals = [];
    this.maxcthings = 5 + Math.ceil(this.wave / 2);
    //this.maxcthings = 0;
    this.maxcthings = Math.min(this.maxcthings, 25);
    this.cthings = [];
    this.cthombs = [];
    this.bullets = [];
    this.backgroundmusic = new BackgroundMusic();
    this.firstupdate = true;
    nummen = Math.floor(this.men.length * (Math.floor(50 + (this.wave / 5) * 5) / 100));
    this.gamepercentage = new PIXI.Text("Rescue " + nummen + " men to win...",
                                        {font: "20px Play", fill: "white", align: "left"});
    this.gamepercentage.position.x = 480 - (this.gamepercentage.width / 2);
    this.gamepercentage.position.y = this.moon.position.y + this.moon.height + 5;
    this.stage.addChild(this.gamepercentage);
}

GameWorld.constructor = GameWorld;
GameWorld.prototype = Object.create(Object.prototype);

GameWorld.WORLDMAX = 960 * 4 - 1; //0-based so 0...n-1
GameWorld.MAXPLAYERFUEL = 4;

GameWorld.prototype.status = function () {
    "use strict";
    var i;
    if (!this.men.length) {
        return true;
    }
    for (i = 0; i < this.ships.length; i++) {
        if (!this.ships[i].shiplaunchcomplete) {
            return true;
        }
    }
    return false;
};

GameWorld.prototype.cleanup = function () {
    "use strict";
    var i;
    this.backgroundmusic.stop();
    this.minimap.cleanup();
    this.player.cleanup();
    for (i = 0; i < this.cthortals.length; i++) {
        this.cthortals[i].cleanup();
    }
    for (i = 0; i < this.cthings.length; i++) {
        this.cthings[i].cleanup();
    }
    for (i = 0; i < this.cthombs.length; i++) {
        this.cthombs[i].cleanup();
    }
    for (i = 0; i < this.cthlugs.length; i++) {
        this.cthlugs[i].cleanup();
    }
    for (i = 0; i < this.towers.length; i++) {
        this.towers[i].cleanup();
    }
    for (i = 0; i < Howler._howls.length; i++) {
        Howler._howls[i].stop();
    }
    Howler._howls = [];
};

GameWorld.prototype.addTower = function (x) {
    "use strict";
    var building;
    building = new RescueShip(this, this.stage, GameWorld.WORLDMAX, 540, 960, 540, x, 540 - 224);
    x += building.width - 78;
    this.stage.addChild(building);
    this.ships.push(building);
    building = new TowerObject(this.stage, this.particlesystem, 240, 220, GameWorld.WORLDMAX, 540, 960, 540, x,
                               540 - 220);
    x += 240;
    this.stage.addChild(building);
    this.towers.push(building);

    return x;
};
GameWorld.prototype.buildCity = function () {
    "use strict";
    var x = 0, towers = 0, building, buildingarr = ["building01x2.png", "building02x1.png", "building03x1.png"],
        buildingtype, man, manflying, manx, many;
    while (x < GameWorld.WORLDMAX - 160) {
        if (x > .25 * GameWorld.WORLDMAX && towers === 0) {
            // tower
            x = this.addTower(x);
            towers = 1;
        }
        if (x > .75 * GameWorld.WORLDMAX && towers === 1) {
            x = this.addTower(x);
            towers = 2;
        }
        if (Math.random() < .75) {
            buildingtype = Math.ceil(Math.random() * 3) - 1;
            if (buildingtype === 0) {
                building = new BuildingObject("building03x1.png", 80, 156,
                                              GameWorld.WORLDMAX, 540, 960, 540, x, 540 - 156);
            }
            else if (buildingtype === 1) {
                building = new BuildingObject("building02x1.png", 80, 188,
                                              GameWorld.WORLDMAX, 540, 960, 540, x, 540 - 188);
            }
            else {
                building = new BuildingObject("building01x2.png", 160, 125,
                                              GameWorld.WORLDMAX, 540, 960, 540, x, 540 - 125);
            }
            if (buildingtype === 0 || buildingtype === 1) {
                x += 80;
            }
            else {
                x += 160;
            }
            if (Math.random() < .25) {
                manx = building.worldx + Math.floor(building.width / 2) - 6;
                many = building.worldy - 24;
                man = new ManObject(this, GameWorld.WORLDMAX, 540, 960, 540, manx, many);
                manflying = new ManFlying(GameWorld.WORLDMAX, 540, 960, 540, manx, many);
                this.stage.addChild(man);
                this.stage.addChild(manflying);
                this.men.push({"sprite": man, "flyingsprite": manflying, "status": "standing", "fallheight": null});
            }
            this.stage.addChild(building);
            this.city.push(building);
        } else {
            x += 80;
        }
    }
};

GameWorld.prototype.fireWeapon = function (key) {
    "use strict";
    var sound;
    if (this.player instanceof ExplodyShip) {
        return;
    }
    if (this.bullets.length > 2) {
        return;
    }
    this.bullets.push(new WeaponLaser(this.stage, this.particlesystem,
                                      this.bulletDead.bind(this), GameWorld.WORLDMAX, 540, 960, 540, this.player.worldx,
                                      this.player.worldy, this.player.olddirection, this.camerax));
    sound = new Howl({urls: ['resources/sounds/science_fiction_phaser_gun.mp3'], volume: 1.0}).play();
};

GameWorld.prototype.bulletDead = function (bulletobj) {
    "use strict";
    var i, bullet;
    for (i = this.bullets.length - 1; i >= 0; i--) {
        bullet = this.bullets[i];
        if (bullet === bulletobj) {
            this.bullets.splice(i, 1);
            break;
        }
    }
};

GameWorld.prototype.checkKeyUp = function (key) {
    "use strict";
    if (this.keyarrs[key] === 'left' || this.keyarrs[key] === 'right' || this.keyarrs[key] === 'space' ||
        this.keyarrs[key] === 'down' || this.keyarrs[key] === 'up') {
        this.player.keyreleased(this.keyarrs[key]);
    }
};

GameWorld.prototype.checkKeyDown = function (key) {
    "use strict";
    if (this.keyarrs[key] === 'left' || this.keyarrs[key] === 'right' || this.keyarrs[key] === 'enter' ||
        this.keyarrs[key] === 'down' || this.keyarrs[key] === 'up') {
        this.player.keypressed(this.keyarrs[key]);
    }
    if (this.keyarrs[key] === 'space') {
        this.fireWeapon(key);
    }
};

GameWorld.prototype.secondTick = function (e) {
    "use strict";
    var i;
    this.player.everySecond(e);
    for (i = 0; i < this.towers.length; i++) {
        this.towers[i].everySecond(e);
    }
    for (i = 0; i < this.city.length; i++) {
        this.city[i].everySecond(e);
    }
    for (i = 0; i < this.men.length; i++) {
        this.men[i].sprite.everySecond(e);
    }
    for (i = 0; i < this.cthortals.length; i++) {
        this.cthortals[i].everySecond(e);
    }
    for (i = 0; i < this.cthings.length; i++) {
        this.cthings[i].everySecond(e);
    }
    for (i = 0; i < this.cthombs.length; i++) {
        this.cthombs[i].everySecond(e);
    }
    for (i = 0; i < this.cthlugs.length; i++) {
        this.cthlugs[i].everySecond(e);
    }
    for (i = 0; i < this.ships.length; i++) {
        this.ships[i].everySecond(e);
    }
    if (!this.ships[0].shiptakeoff) {
        this.cthortalTick(e);
    }
    this.endGameTick(e);
};

GameWorld.prototype.endGameTick = function (e) {
    "use strict";
    var status, i;
    var alive = false;
    for (i = 0; i < this.men.length; i++) {
        status = this.men[i].status;
        if (status !== "dead" && status !== "saved") {
            alive = true;
            break;
        }
    }
    if (!alive) {
        for (i = 0; i < this.ships.length; i++) {
            if (!this.ships[i].isClear()) {
                alive = true;
                break;
            }
        }
    }
    if (alive) return;
    for (i = 0; i < this.ships.length; i++) {
        this.ships[i].takeoff();
    }
    for (i = this.cthings.length - 1; i >= 0; i--) {
        this.removeCthing(i);
    }
};

GameWorld.prototype.birthCthomb = function (x, y) {
    "use strict";
    var cthomb = new Cthomb(this, this.stage, GameWorld.WORLDMAX, 540, 960, 540, x, y);
    this.cthombs.push(cthomb);
    this.stage.addChild(cthomb);
};

GameWorld.prototype.birthCthlug = function (x, y) {
    "use strict";
    var cthlug = new Cthlug(this, this.stage, GameWorld.WORLDMAX, 540, 960, 540, x, y);
    this.cthlugs.push(cthlug);
    this.stage.addChild(cthlug);
};

GameWorld.prototype.cthortalTick = function (e) {
    "use strict";
    var x, y, i, cthortal, sound, cthing, chances;
    if (this.cthortals.length === 0) {
        chances = 1;
    } else {
        chances = 1 - (this.cthortals.length / this.maxcthortals);
        chances = Math.pow(chances, 1.9);
    }
    if (Math.random() < chances) {
        x = Math.floor(Math.random() * GameWorld.WORLDMAX);
        y = Math.floor(Math.random() * 298) + 32;
        sound = new Howl({urls: ['resources/sounds/cthortal_open.mp3'], volume: 1.0}).play();
        this.cthortals.push(new Cthortal(this.stage, this.particlesystem, GameWorld.WORLDMAX, 540, 960, 540, x, y));
    }
    for (i = this.cthortals.length - 1; i >= 0; i--) {
        cthortal = this.cthortals[i];
        if (cthortal.status === "dead") {
            cthortal.cleanup();
            this.cthortals.splice(i, 1);
        }
        if (Math.random() < .05 && cthortal.status === "living") {
            sound = new Howl({urls: ['resources/sounds/cthortal_close.mp3'], volume: 1.0}).play();
            cthortal.status = "dying";
        }
        if (this.cthings.length === 0) {
            chances = 1;
        } else {
            chances = 1 - (this.cthings.length / this.maxcthings);
            chances = Math.pow(chances, 1.9);
        }
        if (this.maxcthings === 0) {
            chances = 0;
        }
        if ((Math.random() < chances) && cthortal.status === "living") {
            x = cthortal.worldx - 32;
            if (x < 0) {
                x = this.WORLDMAX + x;
            }
            y = cthortal.worldy - 32;
            //cthing = new Cthomber(this, this.stage, GameWorld.WORLDMAX, 540, 960, 540, x, y);
            //cthing = new Cthod(this, this.stage, GameWorld.WORLDMAX, 540, 960, 540, x, y);
            //cthing = new Cthing(this, this.stage, GameWorld.WORLDMAX, 540, 960, 540, x, y);
            if (this.wave < 5) {
                cthing = new Cthing(this, this.stage, GameWorld.WORLDMAX, 540, 960, 540, x, y);
            } else if (this.wave >= 5 && this.wave<10) {
                if (Math.random() < .75) {
                    cthing = new Cthing(this, this.stage, GameWorld.WORLDMAX, 540, 960, 540, x, y);
                } else {
                    cthing = new Cthod(this, this.stage, GameWorld.WORLDMAX, 540, 960, 540, x, y);
                }
            } else {
                chances=Math.random();
                if (chances < .65) {
                    cthing = new Cthing(this, this.stage, GameWorld.WORLDMAX, 540, 960, 540, x, y);
                } else if (chances >= .65 && chances < .90) {
                    cthing = new Cthod(this, this.stage, GameWorld.WORLDMAX, 540, 960, 540, x, y);
                } else {
                    cthing = new Cthomber(this, this.stage, GameWorld.WORLDMAX, 540, 960, 540, x, y);
                }
            }
            if (cthing) {
                sound = new Howl({urls: ['resources/sounds/cthing_born.mp3'], volume: 1.0}).play();
                this.cthings.push(cthing);
                this.stage.addChild(cthing);
            }
        }
    }
};

GameWorld.prototype.update = function (dt) {
    "use strict";
    var delta, i, j, units, man;

    this.gamepercentage.alpha = this.gamepercentage.alpha - .005;
    if (this.gamepercentage.alpha < 0) {
        this.gamepercentage.alpha = 0;
    }
    if (this.firstupdate) {
        this.backgroundmusic.next();
        this.firstupdate = false;
    }

    if (this.player.thrusters) {
        delta = this.basedelta * this.player.playerfuel;
    } else {
        delta = this.basedelta;
    }
    units = this.player.playerdirection * delta * dt * 60 / 1000;
    this.camerax += units;

    // Wrap around if we reach the end of the map
    // in either direction...
    if (this.camerax > GameWorld.WORLDMAX) {
        this.camerax -= (GameWorld.WORLDMAX + 1);
    }
    if (this.camerax < 0) {
        this.camerax += (GameWorld.WORLDMAX + 1);
    }

    // So, we have a bunch of lists of objects, which
    // includes buildings, towers, little stick men,
    // etc.  And the player.  The player doesn't need
    // a list, 'cause he's forever-alone.
    // So we take each element of each list
    // and call the update function.
    // (except for the scroller class, because
    // I *totally* ripped it off and it uses
    // another mechanism I don't care about because
    // nothing in the scroller class is interactive.
    // Then I update the moon and the player, two
    // lonely objects with no friends.
    // Eventually there will be aliens here.
    // Eventually... SOON...

    for (i = 0; i < this.bullets.length; i++) {
        this.bullets[i].update(this.camerax, dt);
    }
    for (i = 0; i < this.city.length; i++) {
        this.city[i].update(this.camerax);
    }
    for (i = 0; i < this.ships.length; i++) {
        this.ships[i].update(this.camerax, dt);
    }
    for (i = 0; i < this.towers.length; i++) {
        this.towers[i].update(this.camerax);
    }
    for (i = 0; i < this.men.length; i++) {
        man = this.men[i];
        if (man.manstate === "dead" || man.manstate === "saved") {
            continue;
        }
        man.sprite.update(this.camerax, man, this.player, dt);
        man.flyingsprite.update(this.camerax, man, this.player);
        if (man.status === "flying") {
            man.sprite.visible = false;
        } else {
            man.flyingsprite.visible = false;
        }
    }
    for (i = 0; i < this.splodythings.length; i++) {
        this.splodythings[i].update(this.camerax);
    }
    for (i = 0; i < this.cthortals.length; i++) {
        this.cthortals[i].update(this.camerax);
    }
    for (i = 0; i < this.cthings.length; i++) {
        this.cthings[i].update(this.camerax, dt);
    }
    for (i = this.cthombs.length - 1; i >= 0; i--) {
        if (this.cthombs[i].dead) {
            this.stage.removeChild(this.cthombs[i]);
            this.birthCthlug(this.cthombs[i].worldx, this.cthombs[i].worldy + 12);
            this.cthombs[i].cleanup();
            this.cthombs.splice(i, 1);
            continue;
        }
        this.cthombs[i].update(this.camerax, dt);
    }
    for (i = this.cthlugs.length - 1; i >= 0; i--) {
        if (this.cthlugs[i].dead) {
            this.stage.removeChild(this.cthlugs[i]);
            this.cthlugs[i].cleanup();
            this.cthlugs.splice(i, 1);
            continue;
        }
        this.cthlugs[i].update(this.camerax, dt);
    }
    this.moon.update(this.camerax);
    this.scroller.moveViewportXBy(units, dt);
    this.player.update(this.camerax, units, dt);

    // Then we run the collision function, which will
    // eventually become so complex, it'll take a
    // sentient AI to understand it.  But this is
    // where we find out if things 'splode...
    this.collision();

    // RENDER THIS PUPPY!
    this.particlesystem.update(dt);
    this.minimap.update(this.camerax);
    this.renderer.render(this.stage);
};

GameWorld.prototype.respawnPlayer = function () {
    "use strict";
    this.camerax = 0;
    this.player = new PlayerObject(this.stage, this.particlesystem, GameWorld.WORLDMAX, 540, 960, 540, 254);
    this.stage.addChild(this.player);
};

GameWorld.prototype.removeSplody = function (splodything) {
    "use strict";
    var index = this.splodythings.indexOf(splodything);
    if (index !== -1) {
        this.splodythings.splice(index, 1);
    }
};

GameWorld.prototype.removeCthlug = function (index) {
    "use strict";
    var cthlug, et, sound;
    cthlug = this.cthlugs.splice(index, 1)[0];
    cthlug.cleanup();
    this.stage.removeChild(cthlug);
    et = new ExplodyCthing(this.stage, this.particlesystem,
                           false, GameWorld.WORLDMAX, 540, 960, 540, cthlug.worldx,
                           cthlug.worldy, this.camerax);
    sound = new Howl({urls: ['resources/sounds/cthquish.mp3'], volume: 1.0}).play();
    et.onDone = this.removeSplody.bind(this);
    this.splodythings.push(et);
};

GameWorld.prototype.removeCthing = function (index) {
    "use strict";
    var cthing, et, sound;
    cthing = this.cthings.splice(index, 1)[0];
    if (cthing.manattached) {
        cthing.manattached.status = "falling";
        cthing.manattached.fallheight = cthing.worldy + 64;
    }
    cthing.cleanup();
    this.stage.removeChild(cthing);
    et = new ExplodyCthing(this.stage, this.particlesystem,
                           cthing.muto, GameWorld.WORLDMAX, 540, 960, 540, cthing.worldx,
                           cthing.worldy, this.camerax);
    sound = new Howl({urls: ['resources/sounds/cthquish.mp3'], volume: 1.0}).play();
    et.onDone = this.removeSplody.bind(this);
    this.splodythings.push(et);
};

GameWorld.prototype.playerBlooie = function (buildinghit) {
    "use strict";
    buildinghit = buildinghit || false;
    var sound, worldx = this.player.worldx, worldy = this.player.worldy;
    this.game.score -= 250;
    if (this.game.score < 0) {
        this.game.score = 0;
    }
    this.player.cleanup();
    this.stage.removeChild(this.player);
    if (this.player.manattached) {
        if (buildinghit) {
            this.manBlooie(this.player.manattached);
        } else {
            this.player.manattached.status = "falling";
            this.player.manattached.fallheight = this.player.worldy + this.player.height;
        }
    }
    this.player = new ExplodyShip(this.stage, this.particlesystem,
                                  this.player.playerdirection, GameWorld.WORLDMAX, 540, 960, 540, worldx,
                                  worldy, this.camerax);
    sound = new Howl({urls: ['resources/sounds/explosion_3.mp3'], volume: 1.0}).play();

    this.player.onDone = this.respawnPlayer.bind(this);
};

GameWorld.prototype.manBlooie = function (test) {
    "use strict";
    var splody, sound;
    this.game.score -= 500;
    if (this.game.score < 0) {
        this.game.score = 0;
    }
    test.status = "dead";
    test.sprite.visible = false;
    splody = new ExplodyMan(this.stage, GameWorld.WORLDMAX, 540, 960, 540, test.sprite.worldx, test.sprite.worldy);
    sound = new Howl({urls: ['resources/sounds/screamdie.mp3'], volume: 1.0}).play();
    splody.onDone = this.removeSplody.bind(this);
    this.splodythings.push(splody);
};

GameWorld.prototype.manSaved = function (test, towerindex) {
    "use strict";
    test.status = "saved";
    test.sprite.visible = false;
    this.game.score += 500;
    this.ships[towerindex].addMan();
};

GameWorld.prototype.isCollidedFragment = function (test1, test2) {
    "use strict";
    // We need to split the hit boxes
    // between worldx+width>worldmax for each test and run our
    // test on up to 4 hitboxes (minimum of 3) rather than the
    // typical test of 2.  God I hate infinite wraparound scrollers.

    var test1fragment1 = {}, test1fragment2 = {}, test2fragment1 = {}, test2fragment2 = {};

    // Both test1 and test 2 have fragments.
    if (test1.worldx + test1.width > GameWorld.WORLDMAX) {
        if (test2.worldx + test2.width > GameWorld.WORLDMAX) {
            test1fragment1.worldx = test1.worldx;
            test1fragment1.width = GameWorld.WORLDMAX - test1.worldx;
            test1fragment2.worldx = 0;
            test1fragment2.width = test1.width - test1fragment1.width;

            test2fragment1.worldx = test2.worldx;
            test2fragment1.width = GameWorld.WORLDMAX - test2.worldx;
            test2fragment2.worldx = 0;
            test2fragment2.width = test2.width - test2fragment1.width;

            if (test1.worldx < test2fragment1.worldx + test2fragment1.width &&
                test1.worldx + test1.width > test2fragment1.worldx &&
                test1.worldy < test2.worldy + test2.height &&
                test1.worldy + test1.height > test2.worldy) {
                return true;
            }

            if (test1.worldx < test2fragment2.worldx + test2fragment2.width &&
                test1.worldx + test1.width > test2fragment2.worldx &&
                test1.worldy < test2.worldy + test2.height &&
                test1.worldy + test1.height > test2.worldy) {
                return true;
            }

            if (test2.worldx < test1fragment1.worldx + test1fragment1.width &&
                test2.worldx + test2.width > test1fragment1.worldx &&
                test2.worldy < test1.worldy + test1.height &&
                test2.worldy + test2.height > test1.worldy) {
                return true;
            }

            if (test2.worldx < test1fragment2.worldx + test1fragment2.width &&
                test2.worldx + test2.width > test1fragment2.worldx &&
                test2.worldy < test1.worldy + test1.height &&
                test2.worldy + test2.height > test1.worldy) {
                return true;
            }
        }
    }

    // if test1 is contained without a fragment, then test2 must
    // be split.
    if (test1.worldx + test1.width <= GameWorld.WORLDMAX) {
        test2fragment1.worldx = test2.worldx;
        test2fragment1.width = GameWorld.WORLDMAX - test2.worldx;
        test2fragment2.worldx = 0;
        test2fragment2.width = test2.width - test2fragment1.width;
        if (test1.worldx < test2fragment1.worldx + test2fragment1.width &&
            test1.worldx + test1.width > test2fragment1.worldx &&
            test1.worldy < test2.worldy + test2.height &&
            test1.worldy + test1.height > test2.worldy) {
            return true;
        }

        if (test1.worldx < test2fragment2.worldx + test2fragment2.width &&
            test1.worldx + test1.width > test2fragment2.worldx &&
            test1.worldy < test2.worldy + test2.height &&
            test1.worldy + test1.height > test2.worldy) {
            return true;
        }

        return false;
    }

    //if test1 has a fragment, then test 2 must be contained.
    if (test1.worldx + test1.width > GameWorld.WORLDMAX) {
        test1fragment1.worldx = test1.worldx;
        test1fragment1.width = GameWorld.WORLDMAX - test1.worldx;
        test1fragment2.worldx = 0;
        test1fragment2.width = test1.width - test1fragment1.width;
        if (test2.worldx < test1fragment1.worldx + test1fragment1.width &&
            test2.worldx + test2.width > test1fragment1.worldx &&
            test2.worldy < test1.worldy + test1.height &&
            test2.worldy + test2.height > test1.worldy) {
            return true;
        }

        if (test2.worldx < test1fragment2.worldx + test1fragment2.width &&
            test2.worldx + test2.width > test1fragment2.worldx &&
            test2.worldy < test1.worldy + test1.height &&
            test2.worldy + test2.height > test1.worldy) {
            return true;
        }

        return false;
    }

    console.log("Should never get here.");
    return false;
};

GameWorld.prototype.isCollided = function (test1, test2, ignoreinvisible) {
    "use strict";
    ignoreinvisible = ignoreinvisible || false;
    if ((test1 instanceof ExplodyShip) || (test2 instanceof ExplodyShip)) {
        return false;
    }

    // If you can't see it, you can't touch it.  This will
    // probably bite me in the ass later.  Note to self,
    // WILL BITE YOU IN THE ASS!
    if (ignoreinvisible) {
        if (!test1.visible || !test2.visible) {
            return false;
        }
    }

    if (test1.worldx + test1.width > GameWorld.WORLDMAX || test2.worldx + test2.width > GameWorld.WORLDMAX) {
        return this.isCollidedFragment(test1, test2);
    }

    if (test1.worldx < test2.worldx + test2.width &&
        test1.worldx + test1.width > test2.worldx &&
        test1.worldy < test2.worldy + test2.height &&
        test1.worldy + test1.height > test2.worldy) {
        return true;
    }
    return false;
};

GameWorld.prototype.isCollidedPoint = function (test1, x, y, ignoreinvisible) {
    "use strict";
    var test1fragment1 = {}, test1fragment2 = {};
    if (ignoreinvisible) {
        if (!test1.visible) {
            return;
        }
    }
    if (test1.worldx + test1.width > GameWorld.WORLDMAX) {
        test1fragment1.worldx = test1.worldx;
        test1fragment1.width = GameWorld.WORLDMAX - test1.worldx;
        test1fragment2.worldx = 0;
        test1fragment2.width = test1.width - test1fragment1.width;
        if (x >= test1fragment1.worldx && x <= test1fragment1.worldx + test1fragment1.width &&
            y >= test1.worldy && y <= test1.worldy + test1.height) {
            return true;
        }
        if (x >= test1fragment2.worldx && x <= test1fragment2.worldx + test1fragment2.width &&
            y >= test1.worldy && y <= test1.worldy + test1.height) {
            return true;
        }
        return false;
    }
    if (x >= test1.worldx && x <= test1.worldx + test1.width &&
        y >= test1.worldy && y <= test1.worldy + test1.height) {
        return true;
    }
    return false;
};

GameWorld.prototype.isCollidedCoords = function (test1, x, y, width, height, ignoreinvisible) {
    "use strict";
    var test2 = {"worldx": x, "worldy": y, "visible": true, "width": width, "height": height};
    return this.isCollided(test1, test2, ignoreinvisible);
};

GameWorld.prototype.collideplayer = function () {
    "use strict";
    if (this.player.invincible) {
        return;
    }
    var i, j, test, cthing;
    for (i = 0; i < this.city.length; i++) {
        test = this.city[i];
        if (this.isCollided(test, this.player, true)) {
            // oooh NOOOOOOOes!
            this.playerBlooie(true);
        }
    }
    for (i = 0; i < this.cthings.length; i++) {
        cthing = this.cthings[i];
        if (this.isCollided(cthing, this.player, true)) {
            this.playerBlooie(false);
            this.removeCthing(i);
            break;
        }
        if (cthing instanceof Cthod) {
            for (j = 0; j < cthing.cthlies.length; j++) {
                if (this.isCollided(cthing.cthlies[j], this.player, true)) {
                    this.playerBlooie(false);
                    cthing.removeCthly(j);
                    break;
                }
            }
        }
    }
};

GameWorld.prototype.testcollidetowertractor = function (test) {
    "use strict";
    var i, tower, sprite;
    if (test.status === "flying") {
        sprite = test.flyingsprite;
    } else {
        sprite = test.sprite;
    }
    for (i = 0; i < this.towers.length; i++) {
        tower = this.towers[i];
        if (this.isCollidedCoords(sprite, tower.worldx + 20, tower.worldy - 55, tower.width - 40, 55)) {
            test.status = "saving";
            this.player.manattached = null;
        }
    }
};

GameWorld.prototype.testcollidetower = function (test) {
    "use strict";
    var i, tower;
    for (i = 0; i < this.towers.length; i++) {
        tower = this.towers[i];
        if (this.isCollided(test.sprite, tower)) {
            this.manSaved(test, i);
        }
    }
};

GameWorld.prototype.testcollidebuilding = function (test) {
    "use strict";
    var i, building, height, fh = test.fallheight || 9000;
    if (test.sprite.y > 540 - test.sprite.height) {
        this.manBlooie(test);
        return;
    }
    for (i = 0; i < this.city.length; i++) {
        building = this.city[i];
        if (this.isCollided(test.sprite, building, false)) {
            height = Math.abs(fh - building.worldy);
            if (height > test.sprite.height * 3) {
                this.manBlooie(test);
                return;
            }
            test.status = "standing";
            test.fallheight = null;
            test.sprite.worldy = building.worldy - 24;
        }
    }
};

GameWorld.prototype.testcollidetractor = function (test) {
    "use strict";
    if (!(this.player instanceof PlayerObject)) {
        return false;
    }
    if (this.player.manattached) {
        return false;
    }
    if (!(this.isCollidedCoords(test.sprite, this.player.worldx + 17, this.player.worldy, 50, 50 + this.player.height,
                                true))) {
        return false;
    }
    if (test.status === "standing" || test.status === "ascending") {
        test.status = "ascending";
        this.player.tractor = test.sprite.worldy - this.player.worldy - this.player.height;
        return true;
    }
    return false;
};

GameWorld.prototype.testcollideship = function (test) {
    "use strict";
    if (!(this.player instanceof PlayerObject)) {
        return false;
    }
    if (this.player.manattached && test.status === "flying") {
        return false;
    }
    if (!this.isCollided(test.sprite, this.player, true)) {
        return false;
    }
    if (!this.player.manattached) {
        this.player.manattached = test;
        test.status = "flying";
        return false;
    }
    this.manBlooie(test);
    return true;
};

GameWorld.prototype.testcollidecthing = function (test) {
    "use strict";
    var i, cthing, sound;
    for (i = 0; i < this.cthings.length; i++) {
        cthing = this.cthings[i];
        if (cthing instanceof Cthod || cthing instanceof Cthomber) {
            continue;
        }
        if (!this.isCollidedCoords(test.sprite, cthing.worldx + 26, cthing.worldy + 48, 12, 16)) {
            continue;
        }
        test.status = "flailing";
        cthing.attachMan(test);
        sound = new Howl({urls: ['resources/sounds/hesgotme.mp3'], volume: 1.0}).play();
        return true;
    }
    return false;
};

GameWorld.prototype.testcollidecthomb = function (test) {
    "use strict";
    var i, cthomb, dead = false;
    for (i = 0; i < this.cthombs.length; i++) {
        cthomb = this.cthombs[i];
        if (!this.isCollided(cthomb, test.sprite, false)) {
            continue;
        }
        dead = true;
        break;
    }
    if (dead) {
        this.manBlooie(test);
    }
    return dead;
};

GameWorld.prototype.testcollidecthlug = function (test) {
    "use strict";
    var i, cthlug, dead = false;
    for (i = 0; i < this.cthlugs.length; i++) {
        cthlug = this.cthlugs[i];
        if (!this.isCollided(cthlug, test.sprite, false)) {
            continue;
        }
        dead = true;
        break;
    }
    if (dead) {
        this.manBlooie(test);
    }
    return dead;
};

GameWorld.prototype.collideman = function () {
    "use strict";
    var i, test, death, ret;

    for (i = 0; i < this.men.length; i++) {
        test = this.men[i];
        if (test.status === "dead") {
            continue;
        }
        if (test.status === "saved") {
            continue;
        }
        if (test.status === "flailing") {
            continue;
        }
        if (test.status === "saving") {
            this.testcollidetower(test);
            continue;
        }
        if (test.status === "standing" || test.status === "ascending") {
            death = this.testcollideship(test);
            if (death) continue;
            ret = this.testcollidetractor(test);
            if (ret === false && test.status === "ascending") {
                test.status = "falling";
                test.fallheight = test.sprite.worldy;
            }
            ret = this.testcollidecthing(test);
            ret = this.testcollidecthomb(test);
            ret = this.testcollidecthlug(test);
        } else if (test.status === "falling") {
            this.testcollideship(test);
            this.testcollidebuilding(test);
            this.testcollidetowertractor(test);
            ret = this.testcollidecthing(test);
        } else if (test.status === "flying") {
            if (!(this.player instanceof PlayerObject)) {
                test.status = "falling";
                test.fallheight = test.sprite.worldy;
            } else {
                this.testcollidetowertractor(test);
            }
        }
        // There is a flying status, but right now the man can't collide with anything while in flight.
        // When I implement the rescue towers, the flying status will have
        // "testcollidetowertractor" and "testcollidetower".
    }
};

GameWorld.prototype.collidebullets = function () {
    "use strict";
    var i, j, k, cthly;
    for (i = this.bullets.length - 1; i >= 0; i--) {
        for (j = this.cthings.length - 1; j >= 0; j--) {
            if (this.isCollided(this.bullets[i], this.cthings[j], false)) {
                this.removeCthing(j);
                this.bullets[i].cleanup();
                return;
            }
            if (this.cthings[j] instanceof Cthod) {
                for (k = this.cthings[j].cthlies.length - 1; k >= 0; k--) {
                    cthly = this.cthings[j].cthlies[k];
                    if (this.isCollided(this.bullets[i], cthly, false)) {
                        this.cthings[j].removeCthly(k);
                        this.bullets[i].cleanup();
                        return;
                    }
                }
            }
        }
        for (j = this.cthlugs.length - 1; j >= 0; j--) {
            if (this.isCollided(this.bullets[i], this.cthlugs[j], false)) {
                this.removeCthlug(j);
                this.bullets[i].cleanup();
                return;
            }
        }
    }
};

GameWorld.prototype.collision = function () {
    "use strict";
    this.collideplayer();
    this.player.tractor = false;
    this.collideman();
    this.collidebullets();
};