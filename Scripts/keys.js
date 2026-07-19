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

		// Virtual gamepad bindings (mobile/touch)
		keys.bindSwipes();
		keys.bindButton('btn-fire', 'fire');
	},

	// Binds one on-screen button to one keys.* flag using Pointer Events,
	// which cover touch, mouse, and stylus in one go and support
	// setPointerCapture so a dragging thumb doesn't lose the button.
	// Press sets the flag true immediately; release (wherever it happens,
	// even off the button) sets it false, so holding fires continuously
	// and lifting the finger stops it right away.
	bindButton : function(elId, keyName) {
		var el = document.getElementById(elId);
		if (!el) return;

		var activePointerId = null;

		function press(e) {
			e.preventDefault();
			activePointerId = e.pointerId;
			keys[keyName] = true;

			if (el.setPointerCapture) {
				try { el.setPointerCapture(e.pointerId); } catch (err) {}
			}
		}

		function release(e) {
			// Ignore releases from an unrelated pointer (e.g. a second finger)
			if (activePointerId !== null && e.pointerId !== undefined && e.pointerId !== activePointerId)
				return;

			activePointerId = null;
			keys[keyName] = false;
		}

		el.addEventListener('pointerdown', press);
		el.addEventListener('pointerup', release);
		el.addEventListener('pointercancel', release);
		el.addEventListener('lostpointercapture', release);

		// Safety net: on some mobile browsers a captured pointer's release
		// can fail to reach the element itself. Listening on window as well
		// guarantees the flag always gets cleared when the finger lifts.
		window.addEventListener('pointerup', release);
		window.addEventListener('pointercancel', release);

		el.addEventListener('contextmenu', function(e) {
			e.preventDefault();
		});
	},

	// The 8-directional gesture wheel — now the sole movement control.
	// Direction from the touch-down point picks one of 8 actions (see
	// reference diagram): N=jump, NE/NW=jump+run, E/W=fast run, SE/SW=walk,
	// S=sit. Unlike a one-shot swipe, this tracks the finger live the whole
	// time it's down (like a joystick snapped to 8 fixed detents), so
	// dragging into a new wedge switches actions and lifting the finger
	// always returns to neutral. Jump only fires once per entry into its
	// wedge so holding still there doesn't spam repeat jumps.
	bindSwipes : function() {
		var layer = document.getElementById('swipe-layer');
		if (!layer) return;

		var DEADZONE = 20; // px of wiggle near the touch-down point that stays neutral
		var JUMP_PULSE_MS = 120;
		var touches = {};

		function jumpPulse() {
			keys.up = true;
			setTimeout(function() { keys.up = false; }, JUMP_PULSE_MS);
		}

		// Continuous key state for each wedge. N has none of its own since
		// jump is a one-shot pulse, not a held key.
		var WEDGE_FLAGS = {
			NE : { right: true, accelerate: true },
			NW : { left: true, accelerate: true },
			E  : { right: true, accelerate: true },
			W  : { left: true, accelerate: true },
			SE : { right: true },
			SW : { left: true },
			S  : { down: true }
		};
		var JUMPS_ON_ENTRY = { N: true, NE: true, NW: true };

		function applyWedge(sector) {
			var flags = WEDGE_FLAGS[sector] || {};
			keys.left = !!flags.left;
			keys.right = !!flags.right;
			keys.down = !!flags.down;
			keys.accelerate = !!flags.accelerate;
		}

		function clearMovement() {
			keys.left = false;
			keys.right = false;
			keys.down = false;
			keys.accelerate = false;
		}

		// Buckets a drag vector into one of the 8 compass directions, or
		// null if still within the deadzone. Screen y grows downward, so
		// negative dy is "up".
		function getSector(dx, dy) {
			if (Math.sqrt(dx * dx + dy * dy) < DEADZONE) return null;
			var angle = Math.atan2(dy, dx) * 180 / Math.PI; // -180..180, 0=E, 90=S, -90=N
			if (angle >= -112.5 && angle < -67.5)  return 'N';
			if (angle >= -67.5  && angle < -22.5)  return 'NE';
			if (angle >= -22.5  && angle < 22.5)   return 'E';
			if (angle >= 22.5   && angle < 67.5)   return 'SE';
			if (angle >= 67.5   && angle < 112.5)  return 'S';
			if (angle >= 112.5  && angle < 157.5)  return 'SW';
			if (angle >= -157.5 && angle < -112.5) return 'NW';
			return 'W'; // angle >= 157.5 || angle < -157.5
		}

		layer.addEventListener('pointerdown', function(e) {
			e.preventDefault();
			if (Object.keys(touches).length) return; // one active movement touch at a time
			touches[e.pointerId] = { startX: e.clientX, startY: e.clientY, sector: null };
			try { layer.setPointerCapture(e.pointerId); } catch (err) {}
		});

		layer.addEventListener('pointermove', function(e) {
			var data = touches[e.pointerId];
			if (!data) return;
			e.preventDefault();

			var dx = e.clientX - data.startX;
			var dy = e.clientY - data.startY;
			var sector = getSector(dx, dy);
			if (sector === data.sector) return;

			data.sector = sector;
			if (sector === null) {
				clearMovement();
				return;
			}

			applyWedge(sector);
			if (JUMPS_ON_ENTRY[sector]) jumpPulse();
		});

		function endSwipe(e) {
			var data = touches[e.pointerId];
			if (!data) return;
			clearMovement();
			delete touches[e.pointerId];
		}
		layer.addEventListener('pointerup', endSwipe);
		layer.addEventListener('pointercancel', endSwipe);
	},

	reset : function() {
		keys.left = false;
		keys.right = false;
		keys.accelerate = false;
		keys.fire = false;
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
			case 16://SHIFT (fire, kept separate from run)
				keys.fire = status;
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
	fire : false,
	left : false,
	up : false,
	right : false,
	down : false,
};
