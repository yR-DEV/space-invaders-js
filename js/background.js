export default function Background() {
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