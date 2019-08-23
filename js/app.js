// ---------------------------------------------------------------
// starting and initializing the game
// according to the below link, creating these objects are essentially class definitions
// and they need to have capital names
// https://books.google.com/books?id=kzTk0kOCODEC&pg=PT161&lpg=PT161&dq=having+object+names+in+html5+game+start+with+capital+letter&source=bl&ots=5bTfurpboj&sig=YgTd11vr2b6uISvmfn_4rH-EZpQ&hl=en&sa=X&ei=64CRVeHPE4SFyQTwq7LwDg&ved=0CB8Q6AEwAA#v=onepage&q=having%20object%20names%20in%20html5%20game%20start%20with%20capital%20letter&f=false
// ---------------------------------------------------------------
var game = new Game();

const init = () => {
	if(game.init())
		game.start();
}

// ---------------------------------------------------------------
// Creating a single object/function to hold all
// of the images for the game. More reading can be found here
// https://www.dofactory.com/javascript/singleton-design-pattern
// ---------------------------------------------------------------
const imageRepo = new function() {
	// Defining the images
	this.background = new Image();
	this.biker = new Image();
	this.bikeLock = new Image();

	// Making sure that all images are loaded 
	let numImages = 3;
	let numLoaded = 0;
	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numImages) {
			window.init();
		}
	}
	this.background.onload = function() {
		imageLoaded();
	}
	this.biker.onload = function() {
		imageLoaded();
	}
	this.bikeLock.onload = function() {
		imageLoaded();
	}

	// Set image srource files
	this.background.src = "./img/road.png";
	this.biker.src = "./img/biker.png";
	this.bikeLock.src = "./img/bikeLock.png";
}


// ---------------------------------------------------------------
// Creating the base class for all drawable objects in the game
// and setting base variables that all children will inherit 
// ---------------------------------------------------------------
function Drawable() {	
	this.init = function(x, y, width, height) {
        // Defualt variables for the drawable constructor
		this.height = height;
		this.width = width;
		this.x = x;
		this.y = y;
	}

	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	
    // Define this function to be inherited and further
    // built out by the children of Drawable
	this.draw = function() {
	};
}

// ---------------------------------------------------------------
// Creating a Background object that is a child of the drawable object
// it is drawn on the backgroundCanvas and creates
// moving look by panning the image
// ---------------------------------------------------------------
function Background() {
    // Redefining the speed that is initially set in 
    // the Drawable constructor as 0
    this.speed = 1; 
	
    // Building out the abstract function at the bottom
    // of the Drawable constructor
	this.draw = function() {
		// Start panning the background
		this.x += this.speed;
		this.context.drawImage(imageRepo.background, this.x, this.y);
		
        // Need to draw another image on top of the 
        // image being panned
		this.context.drawImage(imageRepo.background, this.x - this.canvasWidth, this.y);

        // Once the image that is being panned scrolls off the screen
        // redraw the image by resetting x value of background drawable instance
		if (this.x >= this.canvasWidth)
			this.x = 0;
	};
}
// Set the BG to inherit all properties from the Drawable constructor
Background.prototype = new Drawable();

// ---------------------------------------------------------------
// Creating the bikeLock. Multiple instances of the bikeLock will
// be on the page as the user presses spacebar. Instances are held 
// animated, drawn, and spawned in the object pool below
// ---------------------------------------------------------------
function bikeLock() {
	// this will be true if the bullet is currently in use
	this.alive = false;

	// Setting the bullet values
	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	}
	// Employing dirty rectangles to detect which areas of the game
	// have changed and need updating. This will return true if the 
	// bikeLock has gone off of the screen and that it is ready to be
	// cleared in the pool object below
	this.draw = function() {
		this.context.clearRect(this.x, this.y, this.width, this.height);
		this.y -= this.speed;
		// Checking to see whether or not the bikeLock is off the screen
		if (this.y <= 0 - this.height) {
			return true;
		}
		else {
			this.context.drawImage(imageRepo.bikeLock, this.x, this.y);
		}
	};

	// Clearing the values of the bikeLock
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	}
}
bikeLock.prototype = new Drawable();



// ---------------------------------------------------------------
// Pool Object: holds various bikeLock object instances. 
// When it is initialized it creates an array of bikeLock object 
// instances and when it needs to create a new object for use it 
// checks the array to see if the last items are in use or not.
// if it isn't in use it spawns the last bikeLock object instance
// in the array, pops it from the end, and pushes it to the front
// ---------------------------------------------------------------
function Pool(maxSize) {
	let size = maxSize;
	let pool = [];

	// Populating the array with bikeLock object instances 
	this.init = function() {
		for (var i = 0; i < size; i++) {
			// initialize a new bikeLock object instance
			let bikeLock = new bikeLock();
			bikeLock.init(0, 0, imageRepo.bikeLock.width, imageRepo.bikeLock.height);
			pool[i] = bikeLock
		}
	};

	// Grabs the last bikeLock in the array, initializes it
	// and pushes it to the front of the array 
	this.get = function(x, y, speed) {
		if (!pool[size - 1].alive) {
			pool[size - 1].spawn(x, y, speed);
			pool.unshift(pool.pop());
		}
	};

	// getTwo is employed so the biker can throw two bikeLocks
	// at once. If only the get fn above is used twice, the biker
	// would still only shoot 1 bikeLock instead of two so we need
	// to check the bike lock pool against player input
	this.getTwo = function(x1, y1, speed1, x2, y2, speed2) {
		if(!pool[size - 1].alive &&
			!pool[size - 2].alive) {
				 this.get(x1, y1, speed1);
				 this.get(x2, y2, speed2);
		}
	};

	// Now to draw any bikeLocks in use by the object pool
	// if a bikeLock goes off screen the function inside of the bullet 
	// object will clear and push it to the front of the array
	this.animate = function() {
		for (var i = 0; i < size; i++) {
			// only draw more bikeLocks until we find one not alive
			if (pool[i].alive) {
				if (pool[i].draw()) {
					pool[i].clear();
					pool.push((pool.splice(i, 1))[0]);
				}
			}
			else {
				break;
			}
		}
	}
}


// ---------------------------------------------------------------
// Creating the game object which will hold all of the objects
// ---------------------------------------------------------------
function Game() {
	// Getting canvas context and info and setting up game objects.
    // This will return false if the browser does not support HTML5 canvas
    // and prevents animation script from constantly running on old browsers

	this.init = function() {
		// Getting background canvas element
		this.bgCanvas = document.getElementById('backgroundCanvas');
		// Testing to see if the User's browser supports HTML% canvas elements
        // and false will be returned if it does not and message will be displayed
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
		    // Initializing context and canvas information for background
			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;
			// Initializing background
			this.background = new Background();
            // Set the initial drawing point to the X and Y coordinates of 0,0
            this.background.init(0,0); 
			return true;
		} else {
			return false;
		}
	};
	
	// Begin the animation loop man!
	this.start = function() {
		animate();
	};
}




// ---------------------------------------------------------------
// This is animation loop; it calls for requestAnimationFrame 
// to optimize the game loop and draws all of the game objects. 
// This must be a global function
// ---------------------------------------------------------------
function animate() {
	requestAnimFrame( animate );
	game.background.draw();
}


// ---------------------------------------------------------------
// This finds the first API that works to optimize the animation loop
// and if nothing is found it defaults to setTimeout(), function credit to Paul Irish
// ---------------------------------------------------------------
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

// should I continue on or just add the next part?