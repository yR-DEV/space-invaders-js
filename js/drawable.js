export default function Drawable() {	
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