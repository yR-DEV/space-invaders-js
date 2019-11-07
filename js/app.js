// We need to define an image repository
// A single definition ensures that images are only
// created once. This type of object is called a singleton.
var imageRepo = new function() {
    // Define images below
    this.empty = null;
    this.background = new Image();
    this.spaceship = new Image();
    this.bullet = new Image();
    // Making sure that all the images have loaded before starting the game
    var numImages = 3;
    var numLoaded = 0;
    function imageLoaded() {
        numLoaded ++;
        if (numLoaded === numImages) {
            window.init();
        }
    }
    this.background.onload = function() {
        imageLoaded();
    }
    this.spaceship.onload = function() {
        imageLoaded();
    }
    this.bullet.onload = function() {
        imageLoaded();
    }
    // Set the images source
    this.background.src = "imgs/bg.png";
    this.spaceship.src = "imgs/space-ship.png";
    this.bullet.src = "imgs/bullet.png";
};


// Create a drawable object. This object is going to be
// the base class for all drawable object in the game. 
// Sets default balues that all child object will inherit,
// as well as the default functions they will inherit.
function Drawable() {
    this.init = function(x, y, height, width) {
        // Setting default x, y, height, and width values
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
    }
    this.speed = 0;
    this.canvasWidth = 0;
    this.canvasHeight = 0; 
    // Defining abstract functions that will be implemented 
    // in children of Drawable 
    this.draw = function() {
    };
    this.move = function() {
    };
};


// Creating background object; it will be a child of the Drawable class
// and it will be redrawn as it reaches the end of the canvas
function Background() {
    this.speed = 1;
    // Implementing abstract function defined in the Drawable class
    this.draw = function() {
        // Panning the background
        this.y += this.speed;
        this.context.drawImage(imageRepo.background, this.x, this.y);
        // Draw another image at the top edge of the first image
        this.context.drawImage(imageRepo.background, this.x, this.y - this.canvasHeight);
        // If the image moves off the canvas, we need to redraw it!
        if (this.y >= this.canvasHeight) {
            this.y = 0;
        }
    }
};
// Setting background to inherit/be a child of the drawable class
Background.prototype = new Drawable();


// Ensuring the background music has loaded before starting the game
function checkReadyState() {
    if (game.backgroundAudio.readyState === 4) {
        console.log('CHECK READY BRUH.');
        window.clearInterval(game.checkAudio);

    }
}


// Animation loop here! Calls 
function animate() {
    requestAnimFrame( animate );
    game.background.draw();
}

// Creating the game object which will hold all the objects and data
function Game() {
    this.init = function() {
        // Getting the canvas information and setting up 
        // all of the game objects. Initially init function will return true
        // if browser supports HTML5 canvas, and false if it does not. 
        this.bgCanvas = document.getElementById('background-canvas');
        this.menuCanvas = document.getElementById('menu-canvas');
        // Test to see whether or not browser supports HTML5 canvas elements
        // by attempting to get the context of the element on the HTML page
        if (this.bgCanvas.getContext) {
            this.bgContext = this.bgCanvas.getContext('2d');
            // We need to initialize objects to contain their context
            // and their canvas information
            Background.prototype.context = this.bgContext
            Background.prototype.canvasWidth = this.bgCanvas.width;
            Background.prototype.canvasHeight = this.bgCanvas.height;
            // Initialize the background object!
            // Setting initial draw location to cord 0, 0!
            this.background = new Background();
            this.background.init(0, 0);
            // Audio files
            // this.bgCanvas.addEventListener("mouseover", function( event ) {
                this.backgroundAudio = new Audio("audio/ip.mp3");
                this.backgroundAudio.loop = true;
                this.backgroundAudio.volume = 0.2;
                this.backgroundAudio.load();
                this.backgroundAudio.play();
                
            // })
            // Checking and looping audio with setInterval
            // this.checkAudio = window.setInterval(function(){
            //     checkReadyState()
            // }, 1000);
            return true;
        } else {
            return false;
        }
    }
    // Starting the animation loop!
    this.start = function() {
        this.backgroundAudio.play();
        animate();
    }
};

function startMusicXD() {
    this.backgroundAudio = new Audio("audio/ip.mp3");
    this.backgroundAudio.loop = true;
    this.backgroundAudio.volume = 0.2;
    this.backgroundAudio.load();
    this.backgroundAudio.play();
}

// Creating a sound pool for sound effects
// and game song.
function SoundPool() {

}



// Initialize the game
var game = new Game();
function init() {
    if (game.init()) {
        game.start();
    }
}


// requestAnim layer finds the first browser API that 
// will optimize the animation loop for the user's browser
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();