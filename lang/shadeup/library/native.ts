import { float4, float3, float, float2, bool, int } from '/std_math';
import { texture2d } from '/_std/texture';
import { Camera, Camera2d, quat } from '/_std/common';

export function shadeupMakeTextureFromUrl(url: string): texture2d<float4> {
	return (window as any)['shadeupMakeTextureFromUrlNative'](url);
}

export class FrameContext {
	/** Delta between the previous frame's time and this frame (in seconds */
	deltaTime: float;
	/** Current time in seconds from the start of the renderer */
	time: float;
	/** Canvas size in pixels */
	screenSize: float2;
	/** Current frame index */
	frame: int;

	/** Mouse/touch screen input state for this frame */
	mouse: MouseInputState = new MouseInputState();

	/** Keyboard input state for this frame */
	keyboard: KeyboardInputState = new KeyboardInputState();

	/** Controllable camera (Hold right click and use WASD to move) */
	camera: Camera = new Camera();

	camera2d: Camera2d = new Camera2d();

	configureCamera(options: {
		mode?: 'free' | 'orbit' | 'orbit-free';

		spinning?: boolean;

		initialPosition?: float3;
		initialPitch?: float;
		initialYaw?: float;

		speed?: float;

		orbitTarget?: float3;
		orbitDistance?: float;
		orbitPitch?: float;
		orbitYaw?: float;
		orbitMinDistance?: float;
		orbitMaxDistance?: float;
		orbitMinPitch?: float;
		orbitMaxPitch?: float;
	}) {}

	/**
	 * Use external values from the host JavaScript environment.
	 */
	input<T>(key: string, defaultValue: T): T {
		return defaultValue;
	}

	/**
	 * Send values to the host JavaScript environment.
	 */
	output<T>(key: string, value: T) {}
}

export class MouseInputState {
	/** Current mouse position relative to canvas in pixels ((0, 0) is the top left */
	screen: float2;
	/** Current mouse position mapped from 0-1 in canvas space ((0, 0) is the top left while (1, 1) is the bottom right */
	uv: float2;
	/** Caches the mouse position relative to canvas in pixels when any mouse button is pressed (resets after subsequent presses */
	startScreen: float2;
	/** Caches the mouse position mapped from 0-1 in canvas space when any mouse button is pressed (resets after subsequent presses */
	startUv: float2;
	/** If dragging, this will be the delta between the start and current mouse position */
	deltaUv: float2;
	/** If dragging, this will be the delta between the mouse position last frame and the current mouse position */
	frameDeltaUv: float2;
	/** If dragging, this will be the delta between the start and current mouse position */
	deltaScreen: float2;
	/** If dragging, this will be the delta between the mouse position last frame and the current mouse position */
	frameDeltaScreen: float2;
	/** , Some("Mouse button down state for buttons 0-3 (left, middle, right */
	button: [boolean, boolean, boolean] = [false, false, false];
	/** Mouse button pressed state for buttons 0-3 (left, middle, right) */
	clicked: [boolean, boolean, boolean] = [false, false, false];
	/** If currently dragging */
	dragging: bool;
	/** Accumulated mouse wheel movement for this frame in the range of -1 to 1 */
	wheel: float;
	/** Rate of change */
	velocity: float;
	/** Is the mouse focused within the screen */
	focused: bool;
}

export class KeyboardInputState {
	/** Is key down this frame */
	backspace: bool;

	/** Is key down this frame */
	tab: bool;

	/** Is key down this frame */
	enter: bool;

	/** Is key down this frame */
	shiftLeft: bool;

	/** Is key down this frame */
	shiftRight: bool;

	/** Is key down this frame */
	controlLeft: bool;

	/** Is key down this frame */
	controlRight: bool;

	/** Is key down this frame */
	altLeft: bool;

	/** Is key down this frame */
	altRight: bool;

	/** Is key down this frame */
	pause: bool;

	/** Is key down this frame */
	capsLock: bool;

	/** Is key down this frame */
	escape: bool;

	/** Is key down this frame */
	space: bool;

	/** Is key down this frame */
	pageUp: bool;

	/** Is key down this frame */
	pageDown: bool;

	/** Is key down this frame */
	end: bool;

	/** Is key down this frame */
	home: bool;

	/** Is key down this frame */
	arrowLeft: bool;

	/** Is key down this frame */
	arrowUp: bool;

	/** Is key down this frame */
	arrowRight: bool;

	/** Is key down this frame */
	arrowDown: bool;

	/** Is key down this frame */
	printScreen: bool;

	/** Is key down this frame */
	insert: bool;

	/** Is key down this frame */
	delete: bool;

	/** Is key down this frame */
	digit0: bool;

	/** Is key down this frame */
	digit1: bool;

	/** Is key down this frame */
	digit2: bool;

	/** Is key down this frame */
	digit3: bool;

	/** Is key down this frame */
	digit4: bool;

	/** Is key down this frame */
	digit5: bool;

	/** Is key down this frame */
	digit6: bool;

	/** Is key down this frame */
	digit7: bool;

	/** Is key down this frame */
	digit8: bool;

	/** Is key down this frame */
	digit9: bool;

	/** Is key down this frame */
	keyA: bool;

	/** Is key down this frame */
	keyB: bool;

	/** Is key down this frame */
	keyC: bool;

	/** Is key down this frame */
	keyD: bool;

	/** Is key down this frame */
	keyE: bool;

	/** Is key down this frame */
	keyF: bool;

	/** Is key down this frame */
	keyG: bool;

	/** Is key down this frame */
	keyH: bool;

	/** Is key down this frame */
	keyI: bool;

	/** Is key down this frame */
	keyJ: bool;

	/** Is key down this frame */
	keyK: bool;

	/** Is key down this frame */
	keyL: bool;

	/** Is key down this frame */
	keyM: bool;

	/** Is key down this frame */
	keyN: bool;

	/** Is key down this frame */
	keyO: bool;

	/** Is key down this frame */
	keyP: bool;

	/** Is key down this frame */
	keyQ: bool;

	/** Is key down this frame */
	keyR: bool;

	/** Is key down this frame */
	keyS: bool;

	/** Is key down this frame */
	keyT: bool;

	/** Is key down this frame */
	keyU: bool;

	/** Is key down this frame */
	keyV: bool;

	/** Is key down this frame */
	keyW: bool;

	/** Is key down this frame */
	keyX: bool;

	/** Is key down this frame */
	keyY: bool;

	/** Is key down this frame */
	keyZ: bool;

	/** Is key down this frame */
	metaLeft: bool;

	/** Is key down this frame */
	metaRight: bool;

	/** Is key down this frame */
	contextMenu: bool;

	/** Is key down this frame */
	numpad0: bool;

	/** Is key down this frame */
	numpad1: bool;

	/** Is key down this frame */
	numpad2: bool;

	/** Is key down this frame */
	numpad3: bool;

	/** Is key down this frame */
	numpad4: bool;

	/** Is key down this frame */
	numpad5: bool;

	/** Is key down this frame */
	numpad6: bool;

	/** Is key down this frame */
	numpad7: bool;

	/** Is key down this frame */
	numpad8: bool;

	/** Is key down this frame */
	numpad9: bool;

	/** Is key down this frame */
	numpadMultiply: bool;

	/** Is key down this frame */
	numpadAdd: bool;

	/** Is key down this frame */
	numpadSubtract: bool;

	/** Is key down this frame */
	numpadDecimal: bool;

	/** Is key down this frame */
	numpadDivide: bool;

	/** Is key down this frame */
	f1: bool;

	/** Is key down this frame */
	f2: bool;

	/** Is key down this frame */
	f3: bool;

	/** Is key down this frame */
	f4: bool;

	/** Is key down this frame */
	f5: bool;

	/** Is key down this frame */
	f6: bool;

	/** Is key down this frame */
	f7: bool;

	/** Is key down this frame */
	f8: bool;

	/** Is key down this frame */
	f9: bool;

	/** Is key down this frame */
	f10: bool;

	/** Is key down this frame */
	f11: bool;

	/** Is key down this frame */
	f12: bool;

	/** Is key down this frame */
	numLock: bool;

	/** Is key down this frame */
	scrollLock: bool;

	/** Is key down this frame */
	semicolon: bool;

	/** Is key down this frame */
	equal: bool;

	/** Is key down this frame */
	comma: bool;

	/** Is key down this frame */
	minus: bool;

	/** Is key down this frame */
	period: bool;

	/** Is key down this frame */
	slash: bool;

	/** Is key down this frame */
	backquote: bool;

	/** Is key down this frame */
	bracketLeft: bool;

	/** Is key down this frame */
	backslash: bool;

	/** Is key down this frame */
	bracketRight: bool;

	/** Is key down this frame */
	quote: bool;

	/** Key pressed, triggered once until released  */ pressedBackspace: bool;
	/** Key pressed, triggered once until released  */ pressedTab: bool;
	/** Key pressed, triggered once until released  */ pressedEnter: bool;
	/** Key pressed, triggered once until released  */ pressedShiftLeft: bool;
	/** Key pressed, triggered once until released  */ pressedShiftRight: bool;
	/** Key pressed, triggered once until released  */ pressedControlLeft: bool;
	/** Key pressed, triggered once until released  */ pressedControlRight: bool;
	/** Key pressed, triggered once until released  */ pressedAltLeft: bool;
	/** Key pressed, triggered once until released  */ pressedAltRight: bool;
	/** Key pressed, triggered once until released  */ pressedPause: bool;
	/** Key pressed, triggered once until released  */ pressedCapsLock: bool;
	/** Key pressed, triggered once until released  */ pressedEscape: bool;
	/** Key pressed, triggered once until released  */ pressedSpace: bool;
	/** Key pressed, triggered once until released  */ pressedPageUp: bool;
	/** Key pressed, triggered once until released  */ pressedPageDown: bool;
	/** Key pressed, triggered once until released  */ pressedEnd: bool;
	/** Key pressed, triggered once until released  */ pressedHome: bool;
	/** Key pressed, triggered once until released  */ pressedArrowLeft: bool;
	/** Key pressed, triggered once until released  */ pressedArrowUp: bool;
	/** Key pressed, triggered once until released  */ pressedArrowRight: bool;
	/** Key pressed, triggered once until released  */ pressedArrowDown: bool;
	/** Key pressed, triggered once until released  */ pressedPrintScreen: bool;
	/** Key pressed, triggered once until released  */ pressedInsert: bool;
	/** Key pressed, triggered once until released  */ pressedDelete: bool;
	/** Key pressed, triggered once until released  */ pressedDigit0: bool;
	/** Key pressed, triggered once until released  */ pressedDigit1: bool;
	/** Key pressed, triggered once until released  */ pressedDigit2: bool;
	/** Key pressed, triggered once until released  */ pressedDigit3: bool;
	/** Key pressed, triggered once until released  */ pressedDigit4: bool;
	/** Key pressed, triggered once until released  */ pressedDigit5: bool;
	/** Key pressed, triggered once until released  */ pressedDigit6: bool;
	/** Key pressed, triggered once until released  */ pressedDigit7: bool;
	/** Key pressed, triggered once until released  */ pressedDigit8: bool;
	/** Key pressed, triggered once until released  */ pressedDigit9: bool;
	/** Key pressed, triggered once until released  */ pressedKeyA: bool;
	/** Key pressed, triggered once until released  */ pressedKeyB: bool;
	/** Key pressed, triggered once until released  */ pressedKeyC: bool;
	/** Key pressed, triggered once until released  */ pressedKeyD: bool;
	/** Key pressed, triggered once until released  */ pressedKeyE: bool;
	/** Key pressed, triggered once until released  */ pressedKeyF: bool;
	/** Key pressed, triggered once until released  */ pressedKeyG: bool;
	/** Key pressed, triggered once until released  */ pressedKeyH: bool;
	/** Key pressed, triggered once until released  */ pressedKeyI: bool;
	/** Key pressed, triggered once until released  */ pressedKeyJ: bool;
	/** Key pressed, triggered once until released  */ pressedKeyK: bool;
	/** Key pressed, triggered once until released  */ pressedKeyL: bool;
	/** Key pressed, triggered once until released  */ pressedKeyM: bool;
	/** Key pressed, triggered once until released  */ pressedKeyN: bool;
	/** Key pressed, triggered once until released  */ pressedKeyO: bool;
	/** Key pressed, triggered once until released  */ pressedKeyP: bool;
	/** Key pressed, triggered once until released  */ pressedKeyQ: bool;
	/** Key pressed, triggered once until released  */ pressedKeyR: bool;
	/** Key pressed, triggered once until released  */ pressedKeyS: bool;
	/** Key pressed, triggered once until released  */ pressedKeyT: bool;
	/** Key pressed, triggered once until released  */ pressedKeyU: bool;
	/** Key pressed, triggered once until released  */ pressedKeyV: bool;
	/** Key pressed, triggered once until released  */ pressedKeyW: bool;
	/** Key pressed, triggered once until released  */ pressedKeyX: bool;
	/** Key pressed, triggered once until released  */ pressedKeyY: bool;
	/** Key pressed, triggered once until released  */ pressedKeyZ: bool;
	/** Key pressed, triggered once until released  */ pressedMetaLeft: bool;
	/** Key pressed, triggered once until released  */ pressedMetaRight: bool;
	/** Key pressed, triggered once until released  */ pressedContextMenu: bool;
	/** Key pressed, triggered once until released  */ pressedNumpad0: bool;
	/** Key pressed, triggered once until released  */ pressedNumpad1: bool;
	/** Key pressed, triggered once until released  */ pressedNumpad2: bool;
	/** Key pressed, triggered once until released  */ pressedNumpad3: bool;
	/** Key pressed, triggered once until released  */ pressedNumpad4: bool;
	/** Key pressed, triggered once until released  */ pressedNumpad5: bool;
	/** Key pressed, triggered once until released  */ pressedNumpad6: bool;
	/** Key pressed, triggered once until released  */ pressedNumpad7: bool;
	/** Key pressed, triggered once until released  */ pressedNumpad8: bool;
	/** Key pressed, triggered once until released  */ pressedNumpad9: bool;
	/** Key pressed, triggered once until released  */ pressedNumpadMultiply: bool;
	/** Key pressed, triggered once until released  */ pressedNumpadAdd: bool;
	/** Key pressed, triggered once until released  */ pressedNumpadSubtract: bool;
	/** Key pressed, triggered once until released  */ pressedNumpadDecimal: bool;
	/** Key pressed, triggered once until released  */ pressedNumpadDivide: bool;
	/** Key pressed, triggered once until released  */ pressedF1: bool;
	/** Key pressed, triggered once until released  */ pressedF2: bool;
	/** Key pressed, triggered once until released  */ pressedF3: bool;
	/** Key pressed, triggered once until released  */ pressedF4: bool;
	/** Key pressed, triggered once until released  */ pressedF5: bool;
	/** Key pressed, triggered once until released  */ pressedF6: bool;
	/** Key pressed, triggered once until released  */ pressedF7: bool;
	/** Key pressed, triggered once until released  */ pressedF8: bool;
	/** Key pressed, triggered once until released  */ pressedF9: bool;
	/** Key pressed, triggered once until released  */ pressedF10: bool;
	/** Key pressed, triggered once until released  */ pressedF11: bool;
	/** Key pressed, triggered once until released  */ pressedF12: bool;
	/** Key pressed, triggered once until released  */ pressedNumLock: bool;
	/** Key pressed, triggered once until released  */ pressedScrollLock: bool;
	/** Key pressed, triggered once until released  */ pressedSemicolon: bool;
	/** Key pressed, triggered once until released  */ pressedEqual: bool;
	/** Key pressed, triggered once until released  */ pressedComma: bool;
	/** Key pressed, triggered once until released  */ pressedMinus: bool;
	/** Key pressed, triggered once until released  */ pressedPeriod: bool;
	/** Key pressed, triggered once until released  */ pressedSlash: bool;
	/** Key pressed, triggered once until released  */ pressedBackquote: bool;
	/** Key pressed, triggered once until released  */ pressedBracketLeft: bool;
	/** Key pressed, triggered once until released  */ pressedBackslash: bool;
	/** Key pressed, triggered once until released  */ pressedBracketRight: bool;
	/** Key pressed, triggered once until released  */ pressedQuote: bool;
	/** 2D vector that encodes the arrow keys and WASD aligned with the screen (e.g. up arrow = (0, -1)) */
	arrowVector: float2;
}

declare global {
	const env: FrameContext;
}
