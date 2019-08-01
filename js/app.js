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
	this.empty = null;
	this.background = new Image();
	
	// Set image srource files
	this.background.src = "./img/road.png";
}


// ---------------------------------------------------------------
// Creating the base class for all drawable objects in the game
// and setting base variables that all children will inherit 
// ---------------------------------------------------------------
function Drawable() {	
	this.init = function(x, y) {
        // Defualt variables for the drawable constructor
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