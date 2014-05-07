function BackgroundMusic() {
    "use strict";
    this.tracks = ["resources/music/2.mp3", "resources/music/3.mp3",
        "resources/music/4.mp3", "resources/music/5.mp3",
        "resources/music/6.mp3", "resources/music/7.mp3",
        "resources/music/9.mp3", "resources/music/10.mp3",
        "resources/music/11.mp3"];
    this.music = null;
}

BackgroundMusic.constructor = BackgroundMusic;
BackgroundMusic.prototype = Object.create(Object.prototype);

BackgroundMusic.prototype.next = function () {
    "use strict";
    if (this.music) {
        this.music.stop();
    }
    this.music = null;
    this.music = new Howl({
                              urls  : [this.tracks[Math.floor(Math.random() * this.tracks.length)]],
                              onend : this.next.bind(this),
                              volume: 1.0
                          });
    this.music.play();
};

BackgroundMusic.prototype.pause = function () {
    "use strict";
    if (this.music) {
        this.music.pause();
    }
};

BackgroundMusic.prototype.play = function () {
    "use strict";
    if (this.music) {
        this.music.play();
    }
};

BackgroundMusic.prototype.stop = function () {
    "use strict";
    if (this.music) {
        this.music.stop();
    }
};