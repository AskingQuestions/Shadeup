import { keyboardKeys } from './keyboardKeys';

export type MouseState = {
	button: [boolean, boolean, boolean];
	clicked: [boolean, boolean, boolean];
	screen: [number, number];
	uv: [number, number];
	startScreen: [number, number];
	startUv: [number, number];
	deltaUv: [number, number];
	frameDeltaUv: [number, number];
	deltaScreen: [number, number];
	frameDeltaScreen: [number, number];
	dragging: boolean;
	velocity: number;
	wheel: number;
	focused: boolean;
};

export function initInput(
	canvas: HTMLCanvasElement,
	mouseState: MouseState,
	keyboardSink: Map<string, boolean>
) {
	let frameKeySink = new Map<string, boolean>();
	window.addEventListener('keydown', (e) => {
		keyboardSink.set(e.code, true);
		frameKeySink.set(e.code, true);
		if (e.code.startsWith('Arrow')) {
			e.preventDefault();
		}
	});

	window.addEventListener('keyup', (e) => {
		if (keyboardSink.has(e.code)) {
			keyboardSink.delete(e.code);
		}
	});

	let puckDown = false;
	let puckId = '';

	let offsetLeft = document.querySelector('.ui-container')?.offsetLeft ?? 0;
	let offsetTop = document.querySelector('.ui-container')?.offsetTop ?? 0;

	window.addEventListener('mousedown', (e: MouseEvent) => {
		if (e.target && (e.target as HTMLElement).closest('.ui-container')) {
			mouseState.button[e.button] = true;
			console.log('down', mouseState.button);
			mouseState.startScreen = [...mouseState.screen];
			mouseState.startUv = [...mouseState.uv];
			mouseState.deltaScreen = [0, 0];
			mouseState.deltaUv = [0, 0];
			mouseState.dragging = true;
		}
	});

	window.addEventListener('mouseup', (e) => {
		mouseState.clicked[0] = false;
		mouseState.clicked[1] = false;
		mouseState.clicked[2] = false;
		mouseState.button[e.button] = false;
		mouseState.dragging = false;
	});

	window.addEventListener('click', (e) => {
		if (e.target && (e.target as HTMLElement).closest('.ui-container')) {
			mouseState.clicked[e.button] = true;
		}
	});

	window.addEventListener('mousemove', (e) => {
		mouseState.screen = [
			(e.clientX - offsetLeft) * window.devicePixelRatio,
			(e.clientY - offsetTop) * window.devicePixelRatio
		];
		mouseState.uv = [
			((e.clientX - offsetLeft) * window.devicePixelRatio) / canvas.width,
			((e.clientY - offsetTop) * window.devicePixelRatio) / canvas.height
		];

		if (mouseState.dragging) {
			mouseState.deltaScreen = [
				mouseState.screen[0] - mouseState.startScreen[0],
				mouseState.screen[1] - mouseState.startScreen[1]
			];
			mouseState.deltaUv = [
				mouseState.uv[0] - mouseState.startUv[0],
				mouseState.uv[1] - mouseState.startUv[1]
			];
		}
	});

	window.addEventListener('touchstart', (e) => {
		if (e.target && (e.target as HTMLElement).closest('.ui-container')) {
			mouseState.button[0] = true;
			mouseState.startScreen = [...mouseState.screen];
			mouseState.startUv = [...mouseState.uv];
			mouseState.deltaScreen = [0, 0];
			mouseState.deltaUv = [0, 0];
			mouseState.dragging = true;
		}
	});

	window.addEventListener('touchend', (e) => {
		mouseState.button[0] = false;
		mouseState.dragging = false;
	});

	window.addEventListener('touchmove', (e) => {
		mouseState.screen = [
			(e.touches[0].clientX - offsetLeft) * window.devicePixelRatio,
			(e.touches[0].clientY - offsetTop) * window.devicePixelRatio
		];
		mouseState.uv = [
			((e.touches[0].clientX - offsetLeft) * window.devicePixelRatio) / canvas.width,
			((e.touches[0].clientY - offsetTop) * window.devicePixelRatio) / canvas.height
		];

		if (mouseState.dragging) {
			mouseState.deltaScreen = [
				mouseState.screen[0] - mouseState.startScreen[0],
				mouseState.screen[1] - mouseState.startScreen[1]
			];
			mouseState.deltaUv = [
				mouseState.uv[0] - mouseState.startUv[0],
				mouseState.uv[1] - mouseState.startUv[1]
			];
		}
	});

	window.addEventListener(
		'wheel',
		(e) => {
			if (
				e.target.matches('canvas') ||
				e.target.matches('.ui-container') ||
				e.target == document.body
			) {
				e.preventDefault();

				mouseState.wheel += normalizeWheel(e).pixelY * -0.01;
			}
		},
		{ passive: false }
	);
	window.addEventListener('scroll', (e) => {
		if (
			e.target.matches('canvas') ||
			e.target.matches('.ui-container') ||
			e.target == document.body
		) {
			e.preventDefault();
		}
	});
	document.addEventListener('scroll', (e) => {
		// e.preventDefault();
	});

	let getKeyboardState = () => {
		let keys: { [key: string]: boolean | [number, number] } = {};
		for (let key of keyboardKeys) {
			if (!key.code) continue;

			let realKey = key.code[0].toLowerCase() + key.code.slice(1);
			keys[realKey] = keyboardSink.has(key.code);
			keys['pressed' + key.code] = frameKeySink.has(key.code);
		}
		let vec = [0, 0];

		if (keys.keyW) vec[1] -= 1;
		if (keys.keyS) vec[1] += 1;
		if (keys.keyA) vec[0] -= 1;
		if (keys.keyD) vec[0] += 1;

		if (keys.arrowUp) vec[1] -= 1;
		if (keys.arrowDown) vec[1] += 1;
		if (keys.arrowLeft) vec[0] -= 1;
		if (keys.arrowRight) vec[0] += 1;

		keys.arrowVector = [vec[0], vec[1]];
		frameKeySink.clear();
		return keys;
	};

	return {
		getKeyboardState
	};
}
// Reasonable defaults
var PIXEL_STEP = 10;
var LINE_HEIGHT = 40;
var PAGE_HEIGHT = 800;

// Taken from SO answer/facebook code https://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers
export function normalizeWheel(/*object*/ event: any) /*object*/ {
	var sX = 0,
		sY = 0, // spinX, spinY
		pX = 0,
		pY = 0; // pixelX, pixelY

	// Legacy
	if ('detail' in event) {
		sY = event.detail;
	}
	if ('wheelDelta' in event) {
		sY = -event.wheelDelta / 120;
	}
	if ('wheelDeltaY' in event) {
		sY = -event.wheelDeltaY / 120;
	}
	if ('wheelDeltaX' in event) {
		sX = -event.wheelDeltaX / 120;
	}

	// side scrolling on FF with DOMMouseScroll
	if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
		sX = sY;
		sY = 0;
	}

	pX = sX * PIXEL_STEP;
	pY = sY * PIXEL_STEP;

	if ('deltaY' in event) {
		pY = event.deltaY;
	}
	if ('deltaX' in event) {
		pX = event.deltaX;
	}

	if ((pX || pY) && event.deltaMode) {
		if (event.deltaMode == 1) {
			// delta in LINE units
			pX *= LINE_HEIGHT;
			pY *= LINE_HEIGHT;
		} else {
			// delta in PAGE units
			pX *= PAGE_HEIGHT;
			pY *= PAGE_HEIGHT;
		}
	}

	// Fall-back if spin cannot be determined
	if (pX && !sX) {
		sX = pX < 1 ? -1 : 1;
	}
	if (pY && !sY) {
		sY = pY < 1 ? -1 : 1;
	}

	return { spinX: sX, spinY: sY, pixelX: pX, pixelY: pY };
}
