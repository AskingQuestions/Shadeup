import { initPuck } from './puck';
import Host from './components/Host.svelte';

export function initUI(canvas: HTMLCanvasElement) {
	let { frame, puck, preFrame, slider, controls } = initPuck(canvas);

	return {
		frame() {
			frame();
		},
		preFrame() {
			preFrame();
		},
		puck,
		slider,
		controls: controls
		// controls: host
	};
}
