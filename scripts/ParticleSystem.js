"use strict";

(function () {
    var that = this;
    var PARTSYS = PARTSYS || {};

    PARTSYS.version = "v0.0.2";

    PARTSYS.pix2 = Math.PI * 2;
    PARTSYS.pidiv180 = 180 / Math.PI;
    PARTSYS.framerate = 60 / 1000;

    /**
     * Get the distance between two points.
     *
     * @method distance
     * @param point1 - Object with .x and .y parameters
     * @param point2 - Object with .x and .y parameters
     * @returns {number}
     */
    PARTSYS.distance = function (point1, point2) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    };

    PARTSYS.distance2 = function (point1, point2) {
        return Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2);
    };

    /**
     * Convert a degree value to radians.
     *
     * @method degreesToRadians
     * @param degrees
     * @returns {number} radians
     */
    PARTSYS.degreesToRadians = function (degrees) {
        return (degrees * Math.PI) / 180;
    };

    /**
     * Convert a radians value to degrees.
     *
     * @method radiansToDegrees
     * @param radians
     * @returns {number} degrees
     */
    PARTSYS.radiansToDegrees = function (radians) {
        return radians * PARTSYS.pidiv180;
    };

    PARTSYS.sleep = function (millis, callback) {
        setTimeout(callback, millis);
    };

    PARTSYS.Vector = function (x, y) {
        this.x = x || 0;
        this.y = y || 0;
    };

    PARTSYS.Vector.constructor = PARTSYS.Vector;
    PARTSYS.Vector.prototype = Object.create(Object.prototype);

    PARTSYS.Vector.prototype.selfAdd = function (vector) {
        this.x += vector.x;
        this.y += vector.y;
    };

    PARTSYS.Vector.prototype.selfSubtract = function (vector) {
        this.x -= vector.x;
        this.y -= vector.y;
    };

    PARTSYS.Vector.prototype.selfMultiply = function (vector) {
        this.x *= vector.x;
        this.y *= vector.y;
    };

    PARTSYS.Vector.prototype.selfDivide = function (vector) {
        this.x /= vector.x;
        this.y /= vector.y;
    };

    PARTSYS.Vector.prototype.add = function (vector) {
        return new PARTSYS.Vector(this.x + vector.x, this.y + vector.y);
    };

    PARTSYS.Vector.prototype.subtract = function (vector) {
        return new PARTSYS.Vector(this.x - vector.x, this.y - vector.y);
    };

    PARTSYS.Vector.prototype.multiply = function (vector) {
        return new PARTSYS.Vector(this.x * vector.x, this.y * vector.y);
    };

    PARTSYS.Vector.prototype.divide = function (vector) {
        return new PARTSYS.Vector(this.x / vector.x, this.y / vector.y);
    };

    PARTSYS.Vector.prototype.multiplyScale = function (scale) {
        return new PARTSYS.Vector(this.x * scale, this.y * scale);
    };

    PARTSYS.Vector.prototype.divideScale = function (scale) {
        return new PARTSYS.Vector(this.x / scale, this.y / scale);
    };

    PARTSYS.Vector.prototype.normalize = function () {
        var magnitude = this.getMagnitude();
        this.x = this.x * (1 / magnitude);
        this.y = this.y * (1 / magnitude);
    };

    PARTSYS.Vector.prototype.unit = function () {
        var x, y, magnitude = this.getMagnitude();
        x = this.x * (1 / magnitude);
        y = this.y * (1 / magnitude);
        return new PARTSYS.Vector(x, y);
    };

    PARTSYS.Vector.prototype.leftNormal = function (vector) {
        return new PARTSYS.Vector(vector.y, -vector.x);
    };

    PARTSYS.Vector.prototype.rightNormal = function (vector) {
        return new PARTSYS.Vector(-vector.y, vector.x);
    };

    PARTSYS.Vector.prototype.dot = function (vector) {
        return this.x * vector.x + this.y * vector.y;
    };

    PARTSYS.Vector.prototype.rotate = function (angle) {
        var x = this.x;
        var y = this.y;
        this.x = x * cos(angle) - y * sin(angle);
        this.y = x * sin(angle) + y * cos(angle);
    };

    PARTSYS.Vector.prototype.getMagnitude = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    PARTSYS.Vector.prototype.getAngle = function () {
        return Math.atan2(this.y, this.x);
    };

    PARTSYS.Vector.fromAngle = function (angle, magnitude) {
        return new PARTSYS.Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
    };

    /**
     * ParticleSystem constructor
     * @param element - this is the id value of the tag that is being rendered to.
     * @constructor
     */
    PARTSYS.ParticleSystem = function (element) {
        this.element = element;
        this.emitters = [];
        this.fields = [];

        // call this function after a new emitter is added to the particle system.
        this.onCreateEmitter = null;

        // call this function before the emitter starts its update.
        this.onEmitterUpdate = null;

        // you might have to do it like this:
        // particlesystem.onCreateParticle = this.createEmitter.bind(this);
    };

    PARTSYS.ParticleSystem.constructor = PARTSYS.ParticleSystem;

    PARTSYS.ParticleSystem.prototype.getEmitterNames = function () {
        var i, arrnames = [];
        for (i = 0; i < this.emitters.length; i++) {
            arrnames.push(this.emitters[i].emittername);
        }
        return arrnames;
    };

    PARTSYS.ParticleSystem.prototype.getFieldNames = function () {
        var i, arrnames = [];
        for (i = 0; i < this.fields.length; i++) {
            arrnames.push(this.fields[i].fieldname);
        }
        return arrnames;
    };

    /**
     * Get the emitter object associated with an emitter name.
     *
     * @param emittername - the name of the emitter.
     * @returns {*} the emitter object | null if not found
     */
    PARTSYS.ParticleSystem.prototype.getEmitter = function (emittername) {
        var i;
        for (i = 0; i < this.emitters.length; i++) {
            if (this.emitters[i].emittername === emittername) {
                return this.emitters[i].emitterobj;
            }
        }
        return null;
    };

    /**
     * Add an emitter with a string-id name
     *
     * @method addEmitter
     * @param emittername - the string-id name of the emitter to be added.
     * @param emitter - an instance of an emitter object.
     */
    PARTSYS.ParticleSystem.prototype.addEmitter = function (emittername, emitter) {
        var i;
        emittername = emittername || "";
        emitter = emitter || new PARTSYS.Emitter();
        emitter.element = this.element;
        for (i = 0; i < this.emitters.length; i++) {
            if (this.emitters[i].emittername === emittername) return;
        }
        this.emitters.push({"emittername": emittername, "emitterobj": emitter});
        if (this.onCreateEmitter) {
            this.onCreateEmitter(emitter);
        }
    };

    /**
     * Remove the specified emitter
     *
     * @method removeEmitter
     * @param emittername - the string-id name of the emitter to be removed.
     */
    PARTSYS.ParticleSystem.prototype.removeEmitter = function (emittername) {
        var i;
        for (i = this.emitters.length - 1; i >= 0; i--) {
            if (this.emitters[i].emittername === emittername) {
                this.emitters[i].emitterobj.cleanup();
                this.emitters.splice(i, 1);
                break;
            }
        }
    };

    /**
     * Add a field to the global field list.
     *
     * @method addField
     * @param fieldname - string-id name of the field to be added.
     * @param field - an instance of a field object.
     */
    PARTSYS.ParticleSystem.prototype.addField = function (fieldname, field) {
        fieldname = fieldname || "";
        field = field || new PARTSYS.Field();
        var i;
        for (i = 0; i < this.fields.length; i++) {
            if (this.fields[i].fieldname === fieldname) return;
        }
        this.fields.push({"fieldname": fieldname, "fieldobj": field});
    };

    /**
     * Remove the specified field from the global list.
     *
     * @method removeField
     * @fieldname - the string-id name of the field to be removed.
     * @public
     */
    PARTSYS.ParticleSystem.prototype.removeField = function (fieldname) {
        var i;
        for (i = this.fields.length - 1; i >= 0; i--) {
            if (this.fields[i].fieldname === fieldname) {
                this.fields.splice(i, 1);
                break;
            }
        }
    };

    /**
     * Move the emitter to another x,y position.
     *
     * @method moveEmitter
     * @param emittername - The string-id of the emitter.
     * @param x - The x position to move it to.
     * @param y - The y position to move it to.
     *                      in proportion to the emitter.
     */
    PARTSYS.ParticleSystem.prototype.moveEmitter = function (emittername, x, y) {
        var emitter, i, pi, dx, dy, vd, field;
        for (i = 0; i < this.emitters.length; i++) {
            if (this.emitters[i].emittername === emittername) {
                emitter = this.emitters[i].emitterobj;
                //console.info("before: " + emittername + "\tbounded.x" + emitter.bounded.x);
                dx = x - emitter.x;
                dy = y - emitter.y;
                if (emitter.lockbounded && emitter.bounded) {
                    emitter.bounded.x += dx;
                    emitter.bounded.y += dy;
                }
                //console.info("after: " + emittername + "\tbounded.x" + emitter.bounded.x);
                //if (isNaN(emitter.bounded.x)) {
                //    console.info("dx = " + dx + "\tx=" + x + "\temitter.x=" + emitter.x);
                //}
                if (emitter.lockfields && emitter.emitterfields) {
                    for (pi = 0; pi < emitter.emitterfields.length; pi++) {
                        field = emitter.emitterfields[pi];
                        field.x += dx;
                        field.y += dy;
                    }
                }
                if (emitter.lockparticles) {
                    vd = new PARTSYS.Vector(dx, dy);
                    for (pi = 0; pi < emitter.particles.length; pi++) {
                        emitter.particles[pi].position.selfAdd(vd);
                    }
                } else {
                    emitter.particles = [];
                }
                emitter.x = x;
                emitter.y = y;
                break;
            }
        }
    };

    /**
     * Move the field to another x,y position.
     *
     * @method moveField
     * @param fieldname - The string-id of the field.
     * @param x - The x position to move it to.
     * @param y - The y position to move it to.
     */
    PARTSYS.ParticleSystem.prototype.moveField = function (fieldname, x, y) {
        var i;
        for (i = 0; i < this.fields.length; i++) {
            if (this.fields[i].fieldname === fieldname) {
                this.fields[i].fieldobj.x = x || this.fields[i].fieldobj.x;
                this.fields[i].fieldobj.y = y || this.fields[i].fieldobj.y;
                break;
            }
        }
    };

    /**
     * Invoked by program code to update emitters, particle systems, etc.
     * Should be the only kind of update ever called externally.
     *
     * @method update
     * @public
     */
    PARTSYS.ParticleSystem.prototype.update = function (dt) {
        var i, fieldlist = [];
        dt = dt || null;

        for (i = 0; i < this.fields.length; i++) {
            fieldlist.push(this.fields[i].fieldobj)
        }

        for (i = 0; i < this.emitters.length; i++) {
            // each emitter is responsible for the maintenence of its points.
            if (this.onEmitterUpdate) {
                this.onEmitterUpdate(this.emitters[i].emitterobj);
            }
            this.emitters[i].emitterobj.update(fieldlist, dt);
        }

        for (i = this.emitters.length - 1; i >= 0; i--) {
            if (this.emitters[i].emitterobj.dead) {
                this.emitters[i].emitterobj.cleanup();
                this.emitters.splice(i, 1);
            }
        }
    };

    /**
     * Constructor for a Particle object
     *
     * @param point - A vector describing the position of the particle.
     * @param velocity - The initial vector describing speed of the particle.
     * @param lifetime - The number of cycles the particle can live.
     *                   Set to 0 for unlimited lifetime (subject to bounded).
     * @param rotation - The number of degrees to rotate the particle each
     *                   update.
     * @constructor
     */
    PARTSYS.Particle = function (point, velocity, lifetime, rotation) {
        this.set(point, velocity, lifetime, rotation);
    };

    PARTSYS.Particle.constructor = PARTSYS.Particle;

    PARTSYS.Particle.prototype.set = function (point, velocity, lifetime, rotation) {
        this.position = point || new PARTSYS.Vector(0, 0);
        this.velocity = velocity || new PARTSYS.Vector(0, 0);
        this.lifetime = lifetime || 0;
        this.rotation = rotation || 0;
        this.oldposition = new PARTSYS.Vector(this.position.x, this.position.y);
        this.age = 0;
        this.dead = false;
        this.angle = Math.floor(Math.random() * 360);

        // properties to be set after instantiation...
        // These are suggested properties, though you can assign any
        // property you want after the pixel has been instantiated.
        // The particle system and the particle itself never references
        // these values.  They are here purely for the renderer.
        this.sprite = null; // a holder for a sprite, if needed.
        this.textures = null; // a holder for a list of textures, if needed.
        this.color = null; // a holder for the particle's color, if needed.
    };

    /**
     * Move point based on velocity.  Add in any acceleration for this update.
     *
     * @method update
     */
    PARTSYS.Particle.prototype.update = function (dt) {
        dt = dt || null;
        var vel;
        this.age += 1;
        if (this.lifetime && this.age >= this.lifetime) {
            this.dead = true;
        }
        if (this.rotation) {
            if (dt) {
                this.angle += this.rotation * dt * PARTSYS.framerate;
            } else {
                this.angle += this.rotation
            }

            if (this.angle > 359) {
                this.angle = this.angle - 360;
            }
            if (this.angle < 0) {
                this.angle = 360 + this.angle;
            }
        }
        this.oldposition.x = this.position.x;
        this.oldposition.y = this.position.y;
        if (dt) {
            vel = new PARTSYS.Vector(this.velocity.x * dt * PARTSYS.framerate,
                                     this.velocity.y * dt * PARTSYS.framerate);
            this.position.selfAdd(vel);
        } else {
            this.position.selfAdd(this.velocity);
        }
    };

    /**
     * Emitter constructor.
     * @param x              - x position of emitter
     * @param y              - y position of emitter
     * @param area           - {width,height,xanchor,yanchor,radius}the box the
     *                         particles can spawn in around the x,y
     *                         coordinates.  xanchor and yanchor are from 0 to 1,
     *                         where .5,.5 is centered on the x,y coordinates (w/2,
     *                         h/2).  A yanchor of .75, for instance, would have
     *                         the area box be 75% above the y point, and 25% below
     *                         it.  If radius is set to a positive non-zero number,
     *                         the anchors will be ignored, and the area will be a
     *                         circle centered on the emitter's x,y coordinates.
     * @param density        - {min,max} number of particles emitted per cycle.
     *                         Use the same number for both to get a non-random
     *                         stream.
     * @param angle          - {min,max} degrees in the arc that particles can
     *                         shoot from.  Use the same number for a straight
     *                         line.
     * @param speed          - {min,max} the initial speed the particles are
     *                         emitted with.
     * @param rotation       - +/- number of degrees in each update. this rotates
     *                         the angle of the emitter(above)
     * @param particlerotation - {min,max} the rotation rate in degrees of the
     *                         emitted particles.
     * @param lifetime       - {min,max} the number of cycles each particle lives
     *                         for before being removed.  {min:"0",max:"0"} allows
     *                         the particle unlimited cycles, but the particle can
     *                         still die for other reasons...
     * @param bounded        - Array of {x,y,width,height,type} = A bounding box.
     *                         If the particle hits the edges of this bounding box,
     *                         it can type= "bounce","teleport", "stop", or "die".
     *                         "bounce": it bounces off at a reverse angle (like
     *                         pong)
     *                         "wrap": disappears off the one side of the
     *                         bounding box and reappears on the other.
     *                         "stop": it sticks to the bounding box at its current
     *                         location.
     *                         "custom": use a custom function assigned to
     *                         Emitter.onCustomBounds to determine particle
     *                         behavior.
     *                         "die": it dies and is removed.  If "die" is set,
     *                         even unlimited lifetime is ignored.
     *                         Set to null for no boundary.  Be careful to set the
     *                         particle lifetime to a reasonable value or the
     *                         particles will never die, filling up memory and
     *                         destroying the world.
     * @param emitterfields  - An array of field objects that only affect particles
     *                         from this emitter.  Set to null for no private
     *                         fields.  The particles will still be affected by the
     *                         global fields in the ParticleSystem.
     * @param lockbounded    - true | false = If true, the bounds are moved with the
     *                         emitter.  If false, the boundary stays where it is.
     * @param lockfields     - true | false = If true, the fields are locked with
     *                         the emitter, so if the emitter moves, the fields
     *                         move with it.  If false, the fields stay where they
     *                         were originally placed.
     * @param lockparticles  - true | false = If true, the particles are locked
     *                         with the emitter, so if it moves, they move with it.
     *                         If false, the particles continue to fly on their own
     *                         course.
     * @param dienoparticles - true | false = after the first update, if the emitter
     *                         has no particles alive, then it is deleted from the
     *                         ParticleSystem.
     * @param maxparticles   - The maximum number of particles the emitter will emit
     *                         before it stops.  A value of 0 means infinite particles
     * @constructor
     */
    PARTSYS.Emitter = function (x, y, area, density, angle, speed, rotation, particlerotation, lifetime, bounded,
                                emitterfields, lockbounded, lockfields, lockparticles, dienoparticles, maxparticles) {
        this.x = x || 0;
        this.y = y || 0;
        this.area = area || {"xanchor": 0.5, "yanchor": 0.5, "width": 1, "height": 1,
            "radius"                  : 0};
        this.density = density || {"min": 1, "max": 1};
        this.angle = angle || {"min": 350, "max": 10};
        this.speed = speed || {"min": 1, "max": 1};
        this.rotation = rotation || 0;
        this.particlerotation = particlerotation || {"min": 0, "max": 0};
        this.lifetime = lifetime || {"min": 0, "max": 0};
        this.bounded = bounded || {"x": 0, "y": 0, "width": window.innerWidth,
            "height"                  : window.innerHeight, "type": "die"};
        this.emitterfields = emitterfields || null;
        this.lockbounded = lockbounded || true;
        this.lockfields = lockfields || false;
        this.lockparticles = lockparticles || false;
        this.dienoparticles = dienoparticles || false;
        this.maxparticles = maxparticles || 0;
        this.particles = [];
        this.reuse = [];
        this.firstupdate = true;
        this.dead = false;
        this.numparticles = 0;

        // Convenience property.  Could just set
        // onUpdateParticles = null
        // then reset to callback function when you want to render again.
        this.render = true;

        // for all of these, if you are pointing the callback to a class method
        // you might have to do it like this:
        // emitter.onCreateParticle = this.createParticle.bind(this);

        // Assign this to a function that creates the particle in the rendering
        // system.  The callback function takes the new particle as a
        // parameter.
        this.onCreateParticle = null;

        // Assign this to a function that tints the particle (for color changes
        // and/or size changes.  The callback function takes this emitter's
        // array of particles as a parameter.
        this.onTransformParticles = null;

        // Assign this to a function that plots the particle in the renderer.
        // The callback function takes this emitter's array of particles as a
        // parameter.
        this.onUpdateParticles = null;

        // Assign this to a function that removes the particle from the renderer.
        // The callback function takes a particle as a parameter.
        this.onRemoveParticle = null;

        // Assign this to a function that has a custom behavior for when a
        // particle hits the bounds.
        this.onCustomBounds = null;

        // Assign this to a function that does any renderer cleanup before
        // the emitter is removed.  The cleanup function takes this emitter
        // object as a parameter.
        this.onCleanup = null;
    };

    PARTSYS.Emitter.prototype.constructor = PARTSYS.Emitter;

    /**
     * Update the position of the particles, mash then, beat them, stick 'em
     * in a stew.  This should never be called explicitly by a program.  Ever.
     * It is called from ParticleSystem.update for every emitter.
     *
     * @method update
     * @param fields - The global fields that act upon the particles.
     * @param dt     - The delta time since the last update.  Optional.
     */
    PARTSYS.Emitter.prototype.update = function (fields, dt) {
        var i, particle, fieldlist;
        dt = dt || null;
        if (this.emitterfields) {
            fieldlist = fields.concat(this.emitterfields);
        }
        else {
            fieldlist = fields;
        }
        this.createParticles(); // Create a whole mess-a-particles
        for (i = this.particles.length - 1; i >= 0; i--) {
            particle = this.particles[i];
            // Move particles around.
            this.moveParticle(particle, fieldlist, dt);
            if (particle.dead) {
                // Any cleanup that needs doing, do it before particle is deleted.
                this.removeParticle(particle);
                this.reuse.push(this.particles.splice(i, 1));
            }
        }
        if (this.firstupdate) {
            this.firstupdate = false;
        } else {
            if (this.particles.length === 0 && this.dienoparticles) {
                this.dead = true;
            }
        }
        if (!this.dead) {
            // Change size, color, anything to do with appearance, but NOT position
            this.transformParticles();
            // This is where we actually plot the particle on the screen.
            if (this.render) {
                this.updateParticles();
            }
        }
    };

    /**
     * See if the particle has collided with the emitter's boundary.
     * If it does, then take appropriate action.
     *
     * @method collider
     * @param particle
     */
    PARTSYS.Emitter.prototype.collider = function (particle) {
        var dir, velN, velT, newvel, wallvect;
        if (!this.bounded) {
            return;
        }
        if (particle.position.x <= this.bounded.x || particle.position.y <= this.bounded.y
            || particle.position.x >= this.bounded.x + this.bounded.width
            || particle.position.y >= this.bounded.y + this.bounded.height) {
            switch (this.bounded.type) {
                case "bounce":
                    newvel = new PARTSYS.Vector(particle.velocity.x, particle.velocity.y);
                    if (particle.position.x < this.bounded.x) {
                        newvel.x = -particle.velocity.x;
                        wallvect = new PARTSYS.Vector(0, this.bounded.y + this.bounded.height);
                        dir = wallvect.leftNormal(wallvect).unit();
                    } else if (particle.position.x > this.bounded.x + this.bounded.width) {
                        newvel.x = -particle.velocity.x;
                        wallvect = new PARTSYS.Vector(0, this.bounded.y + this.bounded.height);
                        dir = wallvect.rightNormal(wallvect).unit();
                    }
                    if (particle.position.y < this.bounded.y) {
                        newvel.y = -particle.velocity.y;
                        wallvect = new PARTSYS.Vector(this.bounded.x + this.bounded.width, 0);
                        dir = wallvect.rightNormal(wallvect).unit();
                    } else if (particle.position.y > this.bounded.y + this.bounded.height) {
                        newvel.y = -particle.velocity.y;
                        wallvect = new PARTSYS.Vector(this.bounded.x + this.bounded.width, 0);
                        dir = wallvect.leftNormal(wallvect).unit();
                    }
                    velN = dir.multiplyScale(particle.velocity.dot(dir));
                    velT = particle.velocity.subtract(velN);
                    particle.position = particle.oldposition.add(velT.subtract(velN));
                    particle.velocity = newvel;
                    break;
                case "wrap":
                    if (particle.position.x < this.bounded.x) {
                        particle.position.x = this.bounded.x + this.bounded.width;
                    } else if (particle.position.x > this.bounded.x + this.bounded.width) {
                        particle.position.x = this.bounded.x;
                    }
                    if (particle.position.y < this.bounded.y) {
                        particle.position.y = this.bounded.y + this.bounded.height;
                    } else if (particle.position.y > this.bounded.y + this.bounded.height) {
                        particle.position.y = this.bounded.y;
                    }
                    break;
                case "stop":
                    particle.position = particle.oldposition;
                    break;
                case "custom":
                    this.onCustomBounds(particle);
                    break;
                case "die":
                    particle.dead = true;
            }
        }
    };

    /**
     * Move each particle, adding in the effect of the fields.
     * It also checks on boundaries and takes the appropriate
     * action if a particle touches the boundary.  Note that this
     * is all internal.  We don't let the renderer know when this
     * is complete.  The renderer will get its chance in
     * updateParticle().
     *
     * @method moveParticle
     * @param particle - A particle object.
     * @param fields - An array of filters that can act on a particle.
     * @param dt     - The delta time since the last update.  Optional.
     */
    PARTSYS.Emitter.prototype.moveParticle = function (particle, fields, dt) {
        var i;
        dt = dt || null;
        for (i = 0; i < fields.length; i++) {
            fields[i].update(particle, dt);
        }
        particle.update(dt);
        this.collider(particle);
    };

    /**
     * Create a particle with position, velocity, and acceleration
     *
     * @method getNewParticle
     * @param position
     */
    PARTSYS.Emitter.prototype.getNewParticle = function (position) {
        var newparticle, range, angle, speed, speedvector, magnitude, velocity, life, rotation = 0;
        if (this.rotation) {
            this.angle.min += this.rotation;
            this.angle.max += this.rotation;
            if (this.angle.min < 0) {
                this.angle.min = 360 + this.angle.min;
            }
            if (this.angle.min > 359) {
                this.angle.min = this.angle.min - 360;
            }
            if (this.angle.max < 0) {
                this.angle.max = 360 + this.angle.max;
            }
            if (this.angle.max > 359) {
                this.angle.max = this.angle.max - 360;
            }
        }
        if (this.angle.min > this.angle.max) {
            range = 360 - this.angle.min + this.angle.max;
        }
        else {
            range = this.angle.max - this.angle.min;
        }
        angle = Math.random() * range + this.angle.min;
        if (angle > 359) {
            angle -= 360;
        }
        angle = PARTSYS.degreesToRadians(angle);
        speed = Math.random() * (this.speed.max - this.speed.min) + this.speed.min;
        speedvector = new PARTSYS.Vector(speed, speed);
        magnitude = speedvector.getMagnitude();
        velocity = PARTSYS.Vector.fromAngle(angle, magnitude);
        life = (Math.random() * this.lifetime.max - this.lifetime.min) + this.lifetime.min;
        if (this.particlerotation.min || this.particlerotation.max) {
            rotation = Math.floor(Math.random() * Math.abs(this.particlerotation.max - this.particlerotation.min) +
                                      this.particlerotation.min);
        }
        if (this.reuse.length) {
            newparticle = this.reuse.pop()[0];
            newparticle.set(position, velocity, life, rotation);
        } else {
            newparticle = new PARTSYS.Particle(position, velocity, life, rotation);
        }
        return newparticle;
    };

    /**
     * Make new particle appear within a plane of a circle based on radius.
     *
     * @method getNewParticleRadius
     */
    PARTSYS.Emitter.prototype.getNewParticleRadius = function () {
        var position;
        var angle = Math.random() * PARTSYS.pix2;
        position = new PARTSYS.Vector(Math.cos(angle) * this.area.radius + this.x,
                                      Math.sin(angle) * this.area.radius + this.y);
        return this.getNewParticle(position);
    };

    /**
     * Make new particle appear within a plane of a rectange based on
     * width, height, xanchor, and yanchor.
     *
     * @method getNewParticleRect
     */
    PARTSYS.Emitter.prototype.getNewParticleRect = function () {
        var position, xbound, ybound, xpos, ypos;
        xbound = this.x - (this.area.xanchor * this.area.width);
        ybound = this.y - (this.area.yanchor * this.area.height);
        xpos = Math.random() * this.area.width + xbound;
        ypos = Math.random() * this.area.height + ybound;
        position = new PARTSYS.Vector(xpos, ypos);
        return this.getNewParticle(position);
    };

    /**
     * Create particles for this cycle.
     *
     * @method createParticles
     */
    PARTSYS.Emitter.prototype.createParticles = function () {
        if (this.numparticles >= this.maxparticles && this.maxparticles) {
            return;
        }
        var numtocreate = Math.floor(Math.random() * (this.density.max -
            this.density.min)) + this.density.min;
        if (this.numparticles + numtocreate > this.maxparticles && this.maxparticles) {
            numtocreate = this.maxparticles - this.numparticles;
        }
        this.numparticles += numtocreate;
        var i, particle;

        for (i = 0; i < numtocreate; i++) {
            if (this.area.radius > 0) {
                particle = this.getNewParticleRadius();
            }
            else {
                particle = this.getNewParticleRect();
            }
            this.particles.push(particle);
            if (this.onCreateParticle) {
                this.onCreateParticle(particle);
            }
        }
    };

    /**
     * If there is a transform function assigned, use it
     *
     * @method transformParticle
     */
    PARTSYS.Emitter.prototype.transformParticles = function () {
        if (this.onTransformParticles) {
            this.onTransformParticles(this.particles);
        }
    };

    /**
     * If there is an update function (and there better be!), use it.
     *
     * @method updateParticle
     */
    PARTSYS.Emitter.prototype.updateParticles = function () {
        if (this.onUpdateParticles) {
            this.onUpdateParticles(this, this.particles);
        }
    };

    /**
     * If there is a remove function (and there should be!), use it.
     *
     * @method removeParticle
     * @param particle
     */
    PARTSYS.Emitter.prototype.removeParticle = function (particle) {
        if (this.onRemoveParticle) {
            this.onRemoveParticle(particle);
        }
    };

    /**
     * If there is a cleanup function (and there should be!), use it.
     *
     * @method cleanup
     */
    PARTSYS.Emitter.prototype.cleanup = function () {
        for (var i = 0; i < this.particles.length; i++) {
            this.removeParticle(this.particles[i]);
        }
        if (this.onCleanup) {
            this.onCleanup(this);
        }
        this.particles = [];
        this.reuse = [];
    };

    // Fields are areas that affect the movement of particles.
    // either by speeding them up, slowing them down, or affecting
    // their tragectory.  Gravity, anti-gravity, water, wind, etc are all fields.
    // You can have multiple fields, so you can have gravity and wind, etc.
    // and their effects stack up.
    // A field works on a bounded area of the screen, so it only affects
    // particles within that boundary.  You can have the largest gravity
    // field ever, but it won't affect particles outside of its boundary.

    PARTSYS.Field = function (x, y, width, height) {
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;

        // This is the function that is called whenever a particle is inside a
        // field.
        this.onFieldInfluenced = null;
    };

    PARTSYS.Field.prototype.constructor = PARTSYS.Field;

    PARTSYS.Field.prototype.update = function (particle, dt) {
        dt = dt || null;
        if (particle.position.x > this.x && particle.position.x < this.x + this.width &&
            particle.position.y > this.y && particle.position.y < this.y + this.height) {
            if (this.onFieldInfluenced) {
                this.onFieldInfluenced(particle, this, dt);
            }
        }
    };

    this.PARTSYS = PARTSYS;
}).call(this);