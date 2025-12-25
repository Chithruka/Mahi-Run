/*
 * *****
 * WRITTEN BY CHITHRUKA SRI YUDAM, 2023.
 * chithrukasri@gmail.com
 * *****
 */
 
var keys = {
	bind : function() {
		$(document).on('keydown', function(event) {	
			return keys.handler(event, true);
		});
		$(document).on('keyup', function(event) {	
			return keys.handler(event, false);
		});
	},
	reset : function() {
		keys.left = false;
		keys.right = false;
		keys.accelerate = false;
		keys.up = false;
		keys.down = false;
	},
	unbind : function() {
		$(document).off('keydown');
		$(document).off('keyup');
	},
	handler : function(event, status) {
		switch(event.keyCode) {
			case 57392://CTRL on MAC
			case 17://CTRL
			case 65://A
				keys.accelerate = status;
				break;
			case 40://DOWN ARROW
				keys.down = status;
				break;
			case 39://RIGHT ARROW
				keys.right = status;
				break;
			case 37://LEFT ARROW
				keys.left = status;			
				break;
			case 38://UP ARROW
				keys.up = status;
				break;
			default:
				return true;
		}
			
		event.preventDefault();
		return false;
	},
	accelerate : false,
	left : false,
	up : false,
	right : false,
	down : false,
};

/*
 * *****
 * WRITTEN BY CHITHRUKA SRI YUDAM, 2023.
 * chithrukasri@gmail.com
 * *****
 */
 
var keys = {
	bind : function() {
		// Keyboard Bindings
		$(document).on('keydown', function(event) {	
			return keys.handler(event, true);
		});
		$(document).on('keyup', function(event) {	
			return keys.handler(event, false);
		});

		// Touch Bindings (Added for Mobile)
		keys.bindTouch('#btn-left', 'left');
		keys.bindTouch('#btn-right', 'right');
		keys.bindTouch('#btn-up', 'up');
		keys.bindTouch('#btn-down', 'down');
		keys.bindTouch('#btn-run', 'accelerate');
	},
	
	// Helper to bind touch events to keys properties
	bindTouch : function(selector, keyName) {
		$(selector).on('touchstart mousedown', function(e) {
			e.preventDefault(); // Prevent scrolling/zooming
			keys[keyName] = true;
		});
		$(selector).on('touchend mouseup mouseout', function(e) {
			e.preventDefault();
			keys[keyName] = false;
		});
	},

	reset : function() {
		keys.left = false;
		keys.right = false;
		keys.accelerate = false;
		keys.up = false;
		keys.down = false;
	},
	unbind : function() {
		$(document).off('keydown');
		$(document).off('keyup');
		// Unbind touch events if necessary
		$('.touch-btn').off('touchstart mousedown touchend mouseup mouseout');
	},
	handler : function(event, status) {
		switch(event.keyCode) {
			case 57392://CTRL on MAC
			case 17://CTRL
			case 65://A
				keys.accelerate = status;
				break;
			case 40://DOWN ARROW
				keys.down = status;
				break;
			case 39://RIGHT ARROW
				keys.right = status;
				break;
			case 37://LEFT ARROW
				keys.left = status;			
				break;
			case 38://UP ARROW
				keys.up = status;
				break;
			default:
				return true;
		}
			
		event.preventDefault();
		return false;
	},
	accelerate : false,
	left : false,
	up : false,
	right : false,
	down : false,
};
