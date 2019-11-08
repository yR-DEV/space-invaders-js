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
    };
};
// Setting background to inherit/be a child of the drawable class
Background.prototype = new Drawable();


// Creating the bullet object which fire from the ship
// when the user presses spacebar and it is drawn on the main canvas
function Bullet() {
    // this will be true if the bullet is in use
    this.alive = false;

    // We are going to set the bullet values here
    this.spawn = function(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.alive = true;
    };
    // DIRTY RECTANGLES!
    // Checking to see if the bullet has gone off canvas
    // if it has, we are going to clear it before it is redrawn
    this.draw = function() {
        this.context.clearRect(this.x, this.y, this.height, this.width);
        this.y -= this.speed;
        if (this.y <= 0 - this.height) {
            return true;
        } else {
            this.context.drawImage(imageRepo.bullet, this.x, this.y);
        }
    };

    // Resetting the bullet values
    this.clear = function() {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
    };
};
Bullet.prototype = new Drawable();


// The POOL OBJECT! IMPORTANT!
// this object holds bullet objects and manages them 
// to prevent garbage collection and work like so:
//     - When the pool is initialized, it will populate an array with bullet object
//     - When the pool needs to create a bullet object for use, it will check to see if it
//       is currently in use in the array or not in use. If it is in use, the pool is full and
//       if it isn't in use, it will spawn the last item in the array and pops it from the end and 
//       pushes it back into the front of the array. This makes the pool have free bullet objects
//       at the back of the array and ones in use at the front
//     - When the pool animates it objects, it checks to see if the object isn't in use; i.e. no need to draw
//       and if it is, it will draw it! 
//     - If the draw function returns true, the object is cleared and uses the array function splice() to remove
//       item from the array and pushes it to the back
//     - This entire pool make the creation and destruction of objects in the pool constant with gameplay
function Pool(maxSize) {
    var size = maxSize;
    var pool = [];

    // Populate the array with bullet objects
    this.init = function() {
        for (var i = 0; i < size; i++) {
            // initialize the bulletz
            var bullet = new Bullet();
            bullet.init(0, 0, imageRepo.bullet.height, imageRepo.bullet.width);
            pool[i] = bullet;
        }
    };

    // Taking a free bullet [i] and pushing it to the front of the array
    this.get = function(x, y, speed) {
        if(!pool[size - 1].alive) {
            pool[size - 1].spawn(x, y, speed);
            pool.unshift(pool.pop());
        }
    };

    // get two is used for the ship to shoot 2 bullets at once
    this.getTwo = function(x1, y1, speed1, x2, y2, speed2) {
        if(!pool[size - 1].alive && !pool[size - 2].alive) {
            this.get(x1, y1, speed1);
            this.get(x2, y2, speed2);
        }
    };
    this.animate = function() {
        for (var i = 0; i < size; i++) {
            // only draw bullets until we find one in pool array that isn't 'alive'
            if (pool[i].alive) {
                if (pool[i].draw()) {
                    pool[i].clear();
                    pool.push((pool.space(i, 1))[0]);
                }
            } else {
                break;
            }
        }
    }
};


// THE SHIP OBJECT WHOOooOooO!
// ship is going to be drawn on the ship canvas
// and the ship, like the bullets, uses dirty rectangles to move around the screen
// and prevent unecessary garbage collection
function Ship() {
    // initializing pool for ship bullets!
    this.bulletPool = new Pool();
    this.bulletPool.init();

    // setting default values
    this.speed = 3;
    var fireRate = 15;
    var counter = 0;
    
    // we need to draw the ship on the ship canvas
    this.draw = function() {
        this.context.drawImage(imageRepo.spaceship, this.x, this.y);
    };
    this.move = function() {
        counter++;

        // Checking to see if the user's action is a movement action
        if (KEY_STATUS.left || KEY_STATUS.right || KEY_STATUS.up || KEY_STATUS.down) {

            // if conditional is passed, the user has request that the ship move. 
            // So, we need to erase it from its current location and redraw
            this.context.clearRect(this.x, this.y, this.height, this.width);

            // Updating the x and the y of the ship location and redrawing
            // not adding diagonal movement yet, but all else if's should be 
            // changed to just if's for that movement as well bc canvas runs at 60FPS! CRAZY!
            if (KEY_STATUS.left) {
                this.x -= this.speed;

                // keep the player on the canvas!
                if (this.x <= 0) {
                    this.x = 0;
                } 
            } else if (KEY_STATUS.right) {
                this.x += this.speed;

                // keep the player on the canvas!
                if (this.x >= this.canvasWidth - this.width) {
                    this.x = this.canvasWidth - this.width;
                }
            } else if (KEY_STATUS.up) {
                this.y -= this.speed;

                // keep the player on the canvas!
                if (this.y <= this.canvasHeight / 4 * 3) {
                    this.y = this.canvasHeight / 4 * 3
                }
            } else if (KEY_STATUS.down) {
                this.y += this.speed;

                // keep the player on the canvas!
                if (this.y >= this.canvasHeight - this.height) {
                    this.y = this.canvasHeight - this.height;
                }
            }

            // finish by redrawing the ship with the updated values!
            this.draw();

            // Fire bullets!
            if (KEY_STATUS.space && counter >= fireRate) {
                this.fire();
                counter = 0;
            };
        };

        // Firing two bullets from the user's ship!
        this.fire = function() {
            this.bulletPool.getTwo(this.x + 6, this.y, 3, this.x + 33, this.y 3);
        }
    };
};
Ship.prototype = new Drawable();


// Creating the game object which will hold all the objects and data
function Game() {
    this.init = function() {
        // Getting the canvas information and setting up 
        // all of the game objects. Initially init function will return true
        // if browser supports HTML5 canvas, and false if it does not. 
        this.bgCanvas = document.getElementById('background-canvas');
        this.mainCanvas = document.getElementById('main-canvas');
        this.shipCanvas = document.getElementById('ship-canvas');

        // Test to see whether or not browser supports HTML5 canvas elements
        // by attempting to get the context of the element on the HTML page
        if (this.bgCanvas.getContext) {
            this.bgContext = this.bgCanvas.getContext('2d');
            this.mainContext = this.mainCanvas.getContext('2d');
            this.shipContext = this.shipCanvas.getContext('2d');

            // We need to initialize objects to contain their context
            // and their canvas information.
            // Background canvas
            Background.prototype.context = this.bgContext
            Background.prototype.canvasWidth = this.bgCanvas.width;
            Background.prototype.canvasHeight = this.bgCanvas.height;

            // Main Canvas
            Main.prototype.context = this.mainContext
            Main.prototype.canvasWidth = this.mainCanvas.width;
            Main.prototype.canvasHeight = this.mainCanvas.height;

            // Ship canvas
            Ship.prototype.context = this.shipContext
            Ship.prototype.canvasWidth = this.shipCanvas.width;
            Ship.prototype.canvasHeight = this.shipCanvas.height;

            // Initialize the background object!
            this.background = new Background();
            this.background.init(0, 0);

            // Initialize the ship object!
            this.ship = new Ship();
            var shipStartX = this.shipCanvas.width / 2 - imageRepository.spaceship.width;
			var shipStartY = this.shipCanvas.height / 4 * 3 + imageRepository.spaceship.height * 2;
			this.ship.init(shipStartX, shipStartY, imageRepository.spaceship.width, imageRepository.spaceship.height);
            return true;
        } else {
            return false;
        }
    }

    // Starting the animation loop!
    this.start = function() {
        this.ship.draw();
        animate();
    };
};


// THE ANIMATION LOOP!
// calls on requestAnimFrame to optimize game 
// to user's browser. This MUST be a global function
function animate() {
    requestAnimFrame( animate );
    game.background.draw();
    game.ship.move();
    game.ship.bulletPool.animate();
};


// Initialize the game
var game = new Game();
function init() {
    if (game.init()) {
        game.start();
    }
};


// Keycode object, that will be mapped upon user input
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


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