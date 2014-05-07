function BuildingObject(resource, width, height, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy) {
    "use strict";
    GameObject.call(this, resource, width, height, worldwidth, worldheight, viewwidth, viewheight, worldx, worldy);
}

BuildingObject.constructor = BuildingObject;
BuildingObject.prototype = Object.create(GameObject.prototype);

BuildingObject.prototype.everySecond = function (e) {
    "use strict";
};

