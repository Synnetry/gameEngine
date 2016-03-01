/*************  Spaceship Generator Class  *************/
function Spaceship( type, x, y ) {
	//image file details
	this.type = type;
	this.x = x;
	this.y = y;
	switch( type ) {
		case 'fighter':
			//source file location
			this.srcX = 55;
			this.srcY = 188;
			this.srcW = 41;
			this.srcH = 52;
			this.srcALL = { up:0, down:200, left:100, right:300 };
			//grid size
			this.w = 3;
			this.h = 3;
			//maximum movement
			this.maxMove = 20;
			this.speed = 3;
			break;
		case 'destroyer':
			this.srcX = 162;
			this.srcY = 181;
			this.srcW = 64;
			this.srcH = 65;
			this.srcALL = { up:0, down:400, left:200, right:600 };
			this.w = 8;
			this.h = 9;
			this.maxMove = 8;
			this.speed = 1;
			break;
		case 'cruiser':
			this.srcX = 288;
			this.srcY = 184;
			this.srcW = 59;
			this.srcH = 58;
			this.srcALL = { up:0, down:290, left:150, right:435 };
			this.w = 6;
			this.h = 6;
			this.maxMove = 5;
			this.speed = 2;
			break;
		default:
			this.srcX = 0;
			this.srcY = 0;
			this.srcW = 0;
			this.srcH = 0;
			this.srcAll = {};
			this.w = 0;
			this.h = 0;
			this.maxMove = 0;
			this.speed = 0;
	}
	
	//ship movement variables
	this.dir = 'left';
	this.rotation = 0;
	this.scaleX = 1;
	this.scaleY = 1;
	this.curMove = this.maxMove;
	this.I = { x:0, y:0, origX:0, origY:0 };  //Inertia
	//ship actions per round
	this.moved = false;
	this.fired = false;
	//click position when selected
	this.selected = false;
	this.clickX = 0;
	this.clickY = 0;
	//original position when moving
	this.origRot = this.rotation;
	this.origDir = this.dir;
	this.origX = this.x;
	this.origSX = this.scaleX;
	this.origY = this.y;
	this.origSY = this.scaleY;
	
	this.drawProjection = true;
	
	this.draw = function() {
		//draw where the ship is right now / projection
		ctx.save();
		ctx.beginPath();
		ctx.translate( (this.x + this.w/2) * grid.w, (this.y + this.h/2) * grid.h );
		ctx.rotate( this.rotation * Math.PI/180 );
		ctx.scale( this.scaleX, this.scaleY );
		ctx.drawImage( imgShips, this.srcX, this.srcY, this.srcW, this.srcH, 0 - this.w/2 * grid.w, 0 - this.h/2 * grid.h, this.w * grid.w, this.h * grid.h );
		ctx.restore();
		//draw where the ship is currently while projecting a move

		if( this.selected ) {
			//draw the ship's inertia ghost
			if(  this.moved ) {
				//display where the ship WAS
				ctx.save();
				ctx.beginPath();
				ctx.globalAlpha = .3;
				ctx.fillStyle = '#0000aa';
				ctx.fillRect( this.x*grid.w, this.y*grid.h, this.w*grid.w, this.h*grid.h );
				ctx.fill();
				ctx.restore();
				ctx.save();
				ctx.beginPath();
				ctx.globalAlpha = .1;
				ctx.translate( (this.origX + this.w/2) * grid.w, (this.origY + this.h/2) * grid.h );
				ctx.fillStyle = '#00aa00';
				ctx.fillRect( 0 - this.w/2 * grid.w, 0 - this.h/2 * grid.h, this.w * grid.w, this.h * grid.h );
				ctx.fill();
				ctx.rotate( this.rotation * Math.PI/180 );
				ctx.scale( this.scaleX, this.scaleY );
				ctx.drawImage( imgShips, this.srcX, this.srcY, this.srcW, this.srcH, 0 - this.w/2 * grid.w, 0 - this.h/2 * grid.h, this.w * grid.w, this.h * grid.h)
				ctx.restore();
				this.drawReverseTracer();
			}else{
				//display where the ship WILL BE
				ctx.save();
				ctx.beginPath();
				ctx.globalAlpha = .4;
				ctx.fillStyle = '#0000aa';
				ctx.fillRect( this.origX*grid.w, this.origY*grid.h, this.w*grid.w, this.h*grid.h );
				ctx.fill();
				ctx.restore();
				ctx.save();
				ctx.beginPath();
				ctx.globalAlpha = .6;
				ctx.translate( (this.origX + this.I.x + this.w/2) * grid.w, (this.origY + this.I.y + this.h/2) * grid.h );
				ctx.fillStyle = '#00aa00';
				ctx.fillRect( 0 - this.w/2 * grid.w, 0 - this.h/2 * grid.h, this.w * grid.w, this.h * grid.h );
				ctx.fill();
				ctx.rotate( this.rotation * Math.PI/180 );
				ctx.scale( this.scaleX, this.scaleY );
				ctx.drawImage( imgShips, this.srcX, this.srcY, this.srcW, this.srcH, 0 - this.w/2 * grid.w, 0 - this.h/2 * grid.h, this.w * grid.w, this.h * grid.h)
				ctx.restore();
				this.drawTracer();
			}
		}
	}
	
	this.drawTracer = function() {
		ctx.save();
		ctx.beginPath;
		ctx.globalAlpha = .2;
		ctx.fillStyle = '#00ff00';
		ctx.moveTo( this.origX * grid.w, this.origY * grid.h );
		ctx.lineTo( this.origX * grid.w, (this.origY + this.h) * grid.h );
		ctx.lineTo( (this.origX + this.w) * grid.w, (this.origY + this.h) * grid.h );
		ctx.lineTo( (this.x + this.I.x + this.w) * grid.w, (this.y + this.I.y + this.h) * grid.h );
		ctx.lineTo( (this.x + this.I.x + this.w) * grid.w, (this.y + this.I.y) * grid.h );
		ctx.lineTo( (this.x + this.I.x) * grid.w, (this.y + this.I.y) * grid.h );
		ctx.fill();
		ctx.restore();
	}
	
	this.drawReverseTracer = function() {
		//console.log( 'reverse tracer goes here' );
	}
	
	this.move = function() {
		
	}
	
	this.resetMove = function() {
		//reset allowed movement
		this.moved = false;
		this.curMove = this.maxMove;
		this.roation = this.origRot;
		//apply any variable effects here:
	}
	
	this.resetWeapons = function() {
		this.fired = false;
	}
	
	this.explode = function() {
		if( selected == this ) {
			var soundEffect = new Audio("audio/explosion.wav");
			soundEffect.play();
			//alter srcX, srcY to the new dead space debris
		}
	}
}