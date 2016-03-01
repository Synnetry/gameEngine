// background canvas + context
var bgCanvas = document.getElementById('bgCanvas'),
	bgCtx = bgCanvas.getContext('2d'),
// gaming canvas + context (which will be the default)
	gameCanvas = document.getElementById('gameCanvas'),
	ctx = gameCanvas.getContext('2d'),
// canvas size
	w = gameCanvas.width,
	h = gameCanvas.height,
// arrays for listing player ships, enemy ships, and stars
	ships = [],
	enemies = [],
	stars = [],
	selected,
	selectedNum;
// game options
	mouseMovement = false;
// variables for controlling game rate
	isPlaying = false,
	playerTurn = false,
	gameRound = 0,
	roundEndConfirm = false;
// controls for zoom, offset and zoom level
	offsetX = 0,
	offsetY = 0,
	zoomLevel = 1,
	maxZoomLevel = 10,
// grid variables
	gridColour = '#333333',
	grid = { w:10, h:10, x:80, y:60, maxX:80, maxY:60 },
// requesting an animation frame from the different browsers
	requestAnimFrame = 	window.requestAnimationFrame ||
						window.webkitRequestAnimationFrame ||
						window.mozRequestAnimationFrame ||
						window.oRequestAnimationFrame ||
						window.msRequestAnimationFrame ||
						function( callback ) {
							window.setTimeout(callback, 1000 / 60);
						},
// game images file
	imgShips = new Image();
	
// load the image map and then load the game
imgShips.src = 'img/shipsALL.png';
imgShips.addEventListener( 'load', init, false );

// prevent the right click menu
gameCanvas.addEventListener('contextmenu', function(e) {
	if(e.button == 2) {
		e.preventDefault();
		return false;
	}
}, false);

// event listeners for the various controls
document.addEventListener( 'mousedown', function() { mouseClick(event); }, false);
document.addEventListener( 'mousemove', function() { mouseHold(event); }, false);
document.addEventListener( 'mouseup', function() { mouseRelease(event); }, false);
document.addEventListener( 'keydown', function() { buttonPress(event, true); }, false);
//document.addEventListener( 'keyup', function() { buttonPress(event, false); }, false);
gameCanvas.addEventListener( 'wheel', function() { mouseScroll(event); }, false);


/******************  FUNCTION DEFINITIONS  *************************/

// This is how it begins
function init() {
	//pre-game setup
	generateStars( 50 );
	
	//insert testing data here
	ships.push( new Spaceship( 'fighter', 65, 5 ) );
	ships[0].I.x = -10;
	ships[0].I.origX = -10;
	ships[0].I.y = 5;
	ships[0].I.origY = 5;
	ships.push( new Spaceship( 'cruiser', 50, 45 ) );
	ships.push( new Spaceship( 'destroyer', 40, 15 ) );
	
	//And... GO!
	isPlaying = true;
	playerTurn = true;
	requestAnimFrame(loop);
}

// Loop to control the game
function loop() {
	if( isPlaying ) {
		//update();
		draw();
		requestAnimFrame(loop);
	}
}

function update() {
	//update anything that changes regardless of the player
	
}

// Clear the screen and re-draw everything
function draw() {
	clearCtx( bgCtx );
	clearCtx( ctx );
	drawBackground( bgCtx );
	ctx.save();
	ctx.translate( offsetX * grid.w, offsetY * grid.h );
	for( i=0; i<ships.length; i++ ) {
		ships[i].draw();
	}
	for( j=0; j<enemies.length; j++ ) {
		enemies[j].draw();
	}
	ctx.restore();
}

// Clear passed context
function clearCtx( ctx ) {
	ctx.clearRect( 0, 0, w, h );
}

// Create the stars in the background
function generateStars( numStars ) {
	for( i=0; i<numStars; i++ ) {
		var x = Math.floor( Math.random() * w ),
			y = Math.floor( Math.random() * h ),
			diameter = Math.floor( Math.random() * 2 + 1 );
		stars.push( {x:x, y:y, d:diameter} );
	}
}

// Draw the background
function drawBackground( ctx ) {
	ctx.fillStyle = '#000000';
	ctx.fillRect( 0, 0, w, h );
	for( i=0; i<stars.length; i++ ) {
		ctx.fillStyle = '#aaaaff';
		ctx.fillRect( stars[i].x, stars[i].y, stars[i].d, stars[i].d );
	}
	generateGrid();
}

// Draw the game grid
function generateGrid() {
	//draw horizontal lines
	for( i=0; i<=grid.x; i++ ) {
		bgCtx.beginPath();
		bgCtx.strokeStyle = gridColour;
		bgCtx.moveTo( i*grid.w, 0 );
		bgCtx.lineTo( i*grid.w, grid.y*grid.h );
		bgCtx.stroke();
		bgCtx.closePath();
	}
	//draw veritcal lines
	for( j=0; j<=grid.y; j++ ) {
		bgCtx.beginPath();
		bgCtx.strokeStyle = gridColour;
		bgCtx.moveTo( 0, j*grid.h );
		bgCtx.lineTo( grid.x*grid.w, j*grid.h );
		bgCtx.stroke();
		bgCtx.closePath();
	}
}

// Enemies move next, then reset ships and update round counter
function finishRound() {
	//first stop the player
	playerTurn = false;
	//finish moving any ships that were skipped
	for( i=0; i<ships.length; i++ ) {
		if( ! ships[i].moved ) {
			if( ! roundEndConfirm ) {
				roundEndConfirm = confirm( 'There are ships that have not finished moving, end round anyway?' );
				if( roundEndConfirm ) {
					moveShip( ships[i] );
				}else{
					playerTurn = true;
					return false;
				}
			}else{
				moveShip( ships[i] );
			}
		}
	}
	//update enemies
	runAI();
	//reset the ships move/fire counters
	resetPlayerShips();
	//increment round counter
	gameRound++;
	playerTurn = true;
}

// Set player ships to 
function resetPlayerShips() {
	for( i=0; i<ships.length; i++ ) {
		ships[i].origX = ships[i].x;
		ships[i].origSX = ships[i].scaleX;
		ships[i].origY = ships[i].y;
		ships[i].origSY = ships[i].scaleY;
		ships[i].origRot = ships[i].rotation;
		ships[i].origDir = ships[i].dir;
		ships[i].move = ships[i].maxMove;
		ships[i].resetMove();
		ships[i].resetWeapons();
	}
}

// AI to run enemies
function runAI() {
	//alert( 'Insert enemies go now!' );
}

function findShip( x, y ) {
	//check all player ships
	for( i=0; i<ships.length; i++ ) {
		//check vertical
		if( x > ships[i].x * grid.w && x < (ships[i].x + ships[i].w) * grid.w) {
			//check horizontal
			if( y > ships[i].y * grid.h && y < (ships[i].y + ships[i].h) * grid.h ) {
				//return which ship was clicked on
				return i;
			}
		}
	}
	//check all enemy ships here?
}

function selectShip( shipNum, e ) {
	selected = ships[shipNum];
	selectedNum = shipNum;
	ships[shipNum].selected = true;
	ships[shipNum].clickX = Math.round( e.x / grid.w ) - ships[shipNum].origX;
	ships[shipNum].clickY = Math.round( e.y / grid.h ) - ships[shipNum].origY;
	//console.log( ships[i].origX + ' ' + ships[i].clickX );
}

function finishMove() {
	selected.selected = false;
	selected = undefined;
	selectedNum = undefined;
}

// Handles when a mouse button is clicked
function mouseClick(e) {
	var keyID = e.keyCode || e.which;
	//is it the player's turn?
	if( playerTurn ) {
		//left click
		if( keyID == 1 ) {
			//check if a ship was clicked on
			var i = findShip( e.x, e.y );
			if( i != undefined ) {
				//check if there is already a ship selected
				if( selected == undefined ) {
					//if not, select that ship
					selectShip( i, e );
				}else{
					//otherwise switch to new ship
					finishMove();
					selectShip( i, e );
				}
			}
		//right click
		}else if( keyID == 3 ) {
			if( selected != undefined ) {
				finishMove();
			}
		}else if( keyID == 2 ) {
			for( i=0; i<ships.length; i++ ) {
				console.log( ships[i] );
			}
		}
	}
}

function mouseHold(e) {
	//mouse movement if the option is enabled
	if( mouseMovement ) {
		//move the selected ship if there is one
		if( selected != undefined ) {
			//allow the ship to only move it's .move
			var coordX = Math.round( e.x / grid.w ) - selected.clickX,
				coordY = Math.round( e.y / grid.h ) - selected.clickY;
			if( coordX < selected.origX + selected.move && coordX > selected.origX - selected.move ) {
				//don't go outside of the border X
				if( coordX < 0 ) {
					selected.x = 0;
				}else if ( coordX + selected.w > grid.x ) {
					selected.x = grid.x - selected.w;
				}else{
					selected.x = coordX;
				}
			}
			if( coordY < selected.origY + selected.move && coordY > selected.origY - selected.move ) {
				//don't go outside of the border Y
				if( coordY < 0 ) {
					selected.y = 0;
				}else if ( coordY + selected.h > grid.y ) {
					selected.y = grid.y - selected.h;
				}else{
					selected.y = coordY;
				}
			}
		}
	}
}

function mouseRelease(e) {
	
	/* carry and drop is so last week
	if( selected != undefined ) {
		selected.selected = false;
		selected = undefined; 
	}
	*/
}

function mouseScroll(e) {
	e.preventDefault();
	//used for zooming
	//implement it later
}

function buttonPress(e, value) {
	//which key was pressed?
	var keyID = e.keyCode || e.which;
	//prevent keys from doing browser stuff, except f5
	if( keyID != 116 ) {
		e.preventDefault();
	}
	//is it the player's turn?
	if( playerTurn ) {
		//left arrow
		if( keyID == 39 ) {
			if( selected == undefined ) {
				if( Math.abs(offsetX) + grid.x < grid.maxX ) {
					offsetX--;
				}
			}else{
				moveProjection( selected, 'left' );
			}
		//right arrow
		}else if( keyID == 37 ) {
			if( selected == undefined ) {
				if( offsetX < 0 ) {
					offsetX++;
				}
			}else{
				moveProjection( selected, 'right' );
			}
		//down arrow
		}else if( keyID == 40 ) {
			if( selected == undefined ) {
				if( Math.abs(offsetY) + grid.y < grid.maxY ) {
					offsetY--;
				}
			}else{
				moveProjection( selected, 'down' );
			}
		//up arrow
		}else if( keyID == 38 ) {
			if( selected == undefined ) {
				if( offsetY < 0 ) {
					offsetY++;
				}
			}else{
				moveProjection( selected, 'up' );
			}
		//enter
		}else if( keyID == 13 ) {
			if( selected != undefined ) {
				//complete the selected move
				moveShip( selected );
				finishMove();
			}else{
				//end the turn
				//but first check if they are sure
				done = finishRound();
				if( ! done ) {
					console.log( 'selecting next ship!' );
					selectNextShip();
				}
			}
		//esc key
		}else if( keyID == 27 ) {
			if( selected != undefined ) {
				cancelMove( selected );
			}
		//tab key
		}else if( keyID == 9 ) {
			e.preventDefault();
			selectNextShip();
			for( i=0; i<ships.length; i++ ) {
				if( selected.moved ) {
					selectNextShip();
				}
			}
		//k key
		}else if( keyID == 75 ) {
			//self-destruct key
			if( selected != undefined) {
				//make sure they want to self-destruct this ship
				var k = confirm( 'Are you sure you want to self destruct this ship?' );
				if( k ) {
					selfDestruct();
				}
			}
		//everything else
		}else{
			console.log( e.which );
		}
	}
}

function selfDestruct() {
	selected.explode();
	selected = undefined;
	ships.splice( selectedNum, 1 );
	selectedNum = undefined;
}

function shipDestroyed( ship ) {
	ship.explode();
}

function selectNextShip() {
	if( selected != undefined ) {
		selected.selected = false;
		if( selectedNum < ships.length - 1 ) {
			selectedNum++;
		}else{
			selectedNum = 0;
		}
		selected = ships[selectedNum];
		selected.selected = true;
	}else{
		selectedNum = 0;
		selected = ships[selectedNum];
		selected.selected = true;
	}
}

// Reset the move variables
function cancelMove( ship ) {
	ship.x = ship.origX;
	ship.I.x = ship.I.origX;
	ship.scaleX = ship.origSX;
	ship.y = ship.origY;
	ship.I.y = ship.I.origY;
	ship.scaleY = ship.origSY;
	ship.move = ship.maxMove;
	ship.rotation = ship.origRot;
	ship.dir = ship.origDir;
	ship.moved = false;
	finishMove();
}

function moveProjection( ship, dir ) {
	if( ship.move > 0 ) {
		switch( dir ) {
			case 'up':
				moveUp( ship, 1 );
				break;
			case 'down':
				moveDown( ship, 1 );
				break;
			case 'left':
				moveRight( ship, 1 );
				break;
			case 'right':
				moveLeft( ship, 1 );
				break;
		}
	}
}

//  ******  this is ALL wrong.  this needs to move the ship to it's predicted location. can probably be moved to ships.js
function moveShip( ship ) {
	if( ! ship.moved ) {
		ship.x = ship.origX + ship.I.x;
		ship.y = ship.origY + ship.I.y;
		ship.moved = true;
	}
}


//  ******  These are also ALL wrong, they should be in the ships.js file as this.moveX() functions
function moveUp( ship, steps ) {
	if( ship.dir == 'up' ) {
		if( ship.y - steps >= 0 ) {
			//ship.y-=steps;
			ship.I.y -= steps;
			ship.move--;
		}
	}else if( ship.dir == 'down' ) {
		//fire backwards thrusters and slow down
		ship.I.y -= steps;
		ships.move--;
	}else{
		ship.dir = 'up';
		ship.rotation = 90;
		ship.scaleX = 1;
		ship.scaleY = 1;
		ship.move--;
	}
}

function moveDown( ship, steps ) {
	if( ship.dir == 'down' ) {
		if( ship.y + ship.h + steps <= grid.y ) {
			//ship.y+=steps;
			ship.I.y += steps;
			ship.move--;
		}
	}else if( ship.dir == 'up' ) {
		ship.I.y += steps;
		ship.move--;
	}else{
		ship.dir = 'down';
		ship.rotation = 270;
		ship.scaleX = 1;
		ship.scaleY = 1;
		ship.move--;
	}
}

function moveLeft( ship, steps ) {
	if( ship.dir == 'left' ) {
		if( ship.x + ship.w + steps <= grid.x) {
			//ship.x-=steps;
			ship.I.x -= steps;
			ship.move--;
		}
	}else if( ship.dir == 'right' ) {
		ship.I.x -= steps;
		ship.move--;
	}else{
		ship.dir = 'left';
		ship.rotation = 0;
		ship.scaleX = 1;
		ship.scaleY = 1;
		ship.move--;
	}
}

function moveRight( ship, steps ) {
	if( ship.dir == 'right' ) {
		if( ship.x - steps >= 0 ) {
			//ship.x+=steps;
			ship.I.x += steps;
			ship.move--;
		}
	}else if( ship.dir == 'left' ) {
		ship.I.x += steps;
		ship.move--;
	}else{
		ship.dir = 'right';
		ship.rotation = 0;
		ship.scaleX = -1;
		ship.scaleY = 1;
		ship.move--;
	}
}