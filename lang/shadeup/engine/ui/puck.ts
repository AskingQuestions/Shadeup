import type { SvelteComponent } from 'svelte';
import Slider from './components/Slider.svelte';
import Combo from './components/Combo.svelte';
import Label from './components/Label.svelte';
import Host from './components/Host.svelte';
import Group from './components/Group.svelte';
import Checkbox from './components/Checkbox.svelte';
import Button from './components/Button.svelte';
import Text from './components/Text.svelte';
import FloatingPanel from './components/FloatingPanel.svelte';

export type UIChild = {
	name: string;
	type: typeof SvelteComponent;
	value: any;
	options: object;
	children?: UIChild[];
	setValue: (v: any) => void;
};

const ENABLE_INERTIA = true;
export function initPuck(canvas: HTMLCanvasElement) {
	let uiContainer = document.querySelector('.ui-container');
	let puckDown = false;
	let puckId = '';
	let pucks = {};

	function blankUISink() {
		return {
			knob: new Map(),
			knobCounter: 0,
			button: new Map(),
			buttonCounter: 0,
			switch: new Map(),
			switchCounter: 0,
			slider: new Map(),
			sliderCounter: 0,
			puck: new Map(),
			puckCounter: 0
		};
	}

	let uiSink = blankUISink();

	function copyUISink(s) {
		return {
			...s,
			knob: new Map(s.knob),
			button: new Map(s.button),
			switch: new Map(s.switch),
			slider: new Map(s.slider),
			puck: new Map(s.puck)
		};
	}

	let uiSinkLastFrame = blankUISink();

	window.addEventListener('mousedown', (e: MouseEvent) => {
		if (e.target.closest('.puck')) {
			let p = e.target.closest('.puck');
			p.dataset.down = true;
			let mp = getPosRelativeToCanvas([e.clientX, e.clientY]);
			let rect = p.getBoundingClientRect();
			let pmp = getPosRelativeToCanvas([rect.left + rect.width / 2, rect.top + rect.height / 2]);
			p.dataset.offsetX = pmp[0] - mp[0];
			p.dataset.offsetY = pmp[1] - mp[1];
			puckId = p.dataset.id;
			puckDown = true;
			lastPuckPos = [...pmp];
			updateDocumentCursor();
		}
	});

	function updateDocumentCursor() {
		if (puckDown) {
			document.body.style.cursor = 'grabbing';
		} else {
			document.body.style.cursor = 'default';
		}
	}

	window.addEventListener('mouseup', (e) => {
		puckDown = false;
		updateDocumentCursor();
		for (let el of [...document.querySelectorAll('.puck')]) {
			let p = el as HTMLElement;
			if (p.dataset.down == 'true') {
				// let velocityX = parseInt(p.dataset.velocityX ?? '0');
				// let velocityY = parseInt(p.dataset.velocityY ?? '0');

				// let vectorLength = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

				// let angle = Math.atan2(velocityY, velocityX);
				// p.dataset.velocity = vectorLength.toString();
				// p.dataset.angle = angle.toString();
				// console.log(p.dataset.velocity, angle * (180 / Math.PI));
				p.dataset.down = 'false';
			}
		}
	});

	function getPuckPos(puck: HTMLElement) {
		let rect = canvas.getBoundingClientRect();
		let x = puck.offsetLeft - rect.left;
		let y = puck.offsetTop - rect.top;

		return [
			[x, y],
			[puck.offsetLeft, puck.offsetTop]
		];
	}

	function getPosRelativeToCanvas(pos: [number, number]) {
		let rect = canvas.getBoundingClientRect();
		return [
			((pos[0] - rect.left) / rect.width) * canvas.width,
			((pos[1] - rect.top) / rect.height) * canvas.height
		];
	}

	const host = new Host({
		target: document.body,
		props: {
			children: []
		}
	});

	let queuedCommands = [];
	let realSetControls: any = null;

	host.$on('init', (e) => {});

	let lastPuckPos = [0, 0];

	window.addEventListener('mousemove', (e) => {
		if (!puckDown) return;

		let puck = document.querySelector(`.puck[data-id="${puckId}"]`) as HTMLElement;
		if (!puck) return;
		let [x, y] = getPosRelativeToCanvas([e.clientX, e.clientY]);
		// puck.dataset.velocityX = (
		// 	(parseInt(puck.dataset.velocityX ?? '0') || 0) +
		// 	(x - lastPuckPos[0]) * 2
		// ).toString();
		// puck.dataset.velocityY = (
		// 	(parseInt(puck.dataset.velocityY ?? '0') || 0) +
		// 	(y - lastPuckPos[1]) * 2
		// ).toString();

		let velocityX = x - lastPuckPos[0];

		let velocityY = y - lastPuckPos[1];

		let vectorLength = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
		let angle = Math.atan2(velocityY, velocityX);

		let oldVel = parseFloat(puck.dataset.velocity ?? '0');
		puck.dataset.velocity = (oldVel + vectorLength).toString();

		let oldAngle = parseFloat(puck.dataset.angle ?? '0');

		let oldDirVelX = oldVel * Math.cos(oldAngle);
		let oldDirVelY = oldVel * Math.sin(oldAngle);

		let newDirVelX = vectorLength * Math.cos(angle);
		let newDirVelY = vectorLength * Math.sin(angle);

		puck.dataset.angle = Math.atan2(oldDirVelY + newDirVelY, oldDirVelX + newDirVelX).toString();

		lastPuckPos = [x, y];

		puck.dataset.oldX = puck.offsetLeft.toString();
		puck.dataset.oldY = puck.offsetTop.toString();

		x += parseInt(puck.dataset.offsetX ?? '0');
		y += parseInt(puck.dataset.offsetY ?? '0');

		uiSinkLastFrame.puck.set(puckId, { vec: [x, y] });
	});

	setInterval(() => {
		for (let el of [...document.querySelectorAll('.puck')]) {
			let p: HTMLElement = el as HTMLElement;

			let maxSpeed = 105;
			let restitution = 0.75;
			// p.dataset.velocityX = Math.max(
			// 	Math.min(parseInt(p.dataset.velocityX ?? '0') * restitution, maxSpeed),
			// 	-maxSpeed
			// ).toString();
			// p.dataset.velocityY = Math.max(
			// 	Math.min(parseInt(p.dataset.velocityY ?? '0') * restitution, maxSpeed),
			// 	-maxSpeed
			// ).toString();
			p.dataset.velocity = Math.max(
				Math.min(parseFloat(p.dataset.velocity ?? '0') * restitution, maxSpeed),
				-maxSpeed
			).toString();
			let angle = parseFloat(p.dataset.angle ?? '0');
			let velocity = parseFloat(p.dataset.velocity ?? '0') / 5;

			if (p.dataset.down == 'true') continue;
			if (ENABLE_INERTIA) {
				if (uiSink.puck.has(p.dataset.id) && velocity > 1) {
					let { vec } = uiSink.puck.get(p.dataset.id);
					uiSinkLastFrame.puck.set(p.dataset.id, {
						vec: [vec[0] + Math.cos(angle) * velocity, vec[1] + Math.sin(angle) * velocity]
					});
				}
			}
		}
	}, 1000 / 60);

	const SIMPLE_MATH = {
		clamp(a, min, max) {
			return Math.min(Math.max(a, min), max);
		},

		clamp2(a, min, max) {
			return [this.clamp(a[0], min[0], max[0]), this.clamp(a[1], min[1], max[1])];
		}
	};

	function _SHADEUP_UI_PUCK(vec, radius = 10, invisible = false) {
		let id = uiSink.puckCounter++;
		uiSink.puck.set(id.toString(), {
			vec: [...vec]
		});

		addPuck(id.toString(), vec, radius, invisible);

		if (uiSinkLastFrame.puck.has(id.toString())) {
			return SIMPLE_MATH.clamp2(
				uiSinkLastFrame.puck.get(id.toString()).vec,
				[0, 0],
				[canvas.width, canvas.height]
			);
		} else {
			return [...vec];
		}
	}

	function addPuck(name, puck, radius = 10, invisible = false) {
		puck = [puck[0] / canvas.width, puck[1] / canvas.height];
		if (pucks[name]) {
			pucks[name].div.style.left = `calc(${puck[0] * 100}% - ${radius}px)`;
			pucks[name].div.style.top = `calc(${puck[1] * 100}% - ${radius}px)`;
			pucks[name].div.style.opacity = invisible ? '0' : '1';
			pucks[name].div.style.width = `${radius * 2}px`;
			pucks[name].div.style.height = `${radius * 2}px`;

			return;
		}
		let div = document.createElement('div');
		div.className = 'puck';
		div.dataset.id = name;
		div.innerHTML = `<span><svg style="width: 10px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path fill="#505050" d="M128 136c0-22.1-17.9-40-40-40L40 96C17.9 96 0 113.9 0 136l0 48c0 22.1 17.9 40 40 40H88c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40H40c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40H88c22.1 0 40-17.9 40-40V328zm32-192v48c0 22.1 17.9 40 40 40h48c22.1 0 40-17.9 40-40V136c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM288 328c0-22.1-17.9-40-40-40H200c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40h48c22.1 0 40-17.9 40-40V328zm32-192v48c0 22.1 17.9 40 40 40h48c22.1 0 40-17.9 40-40V136c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM448 328c0-22.1-17.9-40-40-40H360c-22.1 0-40 17.9-40 40v48c0 22.1 17.9 40 40 40h48c22.1 0 40-17.9 40-40V328z"/></svg></span>`;
		div.style.width = `${radius * 2}px`;
		div.style.height = `${radius * 2}px`;
		div.style.opacity = invisible ? '0' : '1';
		uiContainer.appendChild(div);

		pucks[name] = {
			div,
			puck
		};
	}

	let hostChildren: UIChild[] = [];
	let childrenCrumbs: UIChild[] = [];
	let rootChild: UIChild;

	let preFrameHandlers: (() => void)[] = [];
	let postFrameHandlers: (() => void)[] = [];
	function createImmediateModeUIElement(
		type: string,
		component: typeof SvelteComponent,
		canHaveChildren = false
	) {
		let els: Map<string, SvelteComponent> = new Map();

		function blankUISink() {
			return {
				map: new Map(),
				counter: 0
			};
		}

		let uiSink = blankUISink();
		let uiSinkLastFrame = blankUISink();

		preFrameHandlers.push(() => {
			uiSink = blankUISink();
		});

		postFrameHandlers.push(() => {
			// Clean up unused controls
			for (let name of els.keys()) {
				if (!uiSink.map.has(name)) {
					// els.get(name)!.$destroy();
					// els.delete(name);
				}
			}
			uiSinkLastFrame = blankUISink();
		});

		function invoke(value: any, options: any = {}) {
			let id = uiSink.counter++;
			uiSink.map.set(id.toString(), {
				value: value,
				options: options
			});

			addControl(
				id.toString(),
				{
					value: value,
					options: options
				},
				canHaveChildren
			);

			if (uiSinkLastFrame.map.has(id.toString())) {
				return uiSinkLastFrame.map.get(id.toString()).value;
			} else {
				return value;
			}
		}

		function addControl(name: string, v: { value: any; options: object }, canHaveChildren = false) {
			if (els.has(name)) {
				els.get(name)!.$set({
					value: v.value,
					...v.options
				});
				return;
			}

			function setValue(v: any) {
				uiSinkLastFrame.map.set(name, {
					value: v
				});
			}
			// let comp = new component({
			// 	target: uiContainer!,
			// 	props: {
			// 		value: v.value,
			// 		...v.options,
			// 		setValue
			// 	}
			// });

			rootChild.children?.push({
				type: component,
				value: v.value,
				options: v.options,
				children: canHaveChildren ? [] : undefined,
				setValue,
				name: type
			});

			if (canHaveChildren) {
				childrenCrumbs.push(rootChild);
				rootChild = rootChild.children![rootChild.children!.length - 1];
			}

			// els.set(name, comp);
		}

		return invoke;
	}

	let slider = createImmediateModeUIElement('slider', Slider);
	let label = createImmediateModeUIElement('label', Label);
	let group = createImmediateModeUIElement('group', Group, true);
	let checkbox = createImmediateModeUIElement('checkbox', Checkbox);
	let textbox = createImmediateModeUIElement('textbox', Text);
	let combo = createImmediateModeUIElement('combo', Combo);
	let button = createImmediateModeUIElement('button', Button);

	function preFrame() {
		hostChildren = [];

		rootChild = {
			type: FloatingPanel,
			value: null,
			children: [],
			options: {},
			setValue: () => {},
			name: 'root'
		};

		hostChildren.push(rootChild);
		childrenCrumbs = [rootChild];

		for (let handler of preFrameHandlers) {
			handler();
		}
		uiSink = blankUISink();
	}

	return {
		frame() {
			// Clean up unused pucks
			for (let name in pucks) {
				if (!uiSink.puck.has(name)) {
					pucks[name].div.remove();
					delete pucks[name];
				}
			}

			for (let post of postFrameHandlers) {
				post();
			}

			uiSinkLastFrame = blankUISink();

			host.$set({
				children: hostChildren
			});
		},
		preFrame,
		puck: _SHADEUP_UI_PUCK,
		slider,
		controls: {
			label,
			group,
			checkbox,
			textbox,
			combo,
			button,
			pop() {
				childrenCrumbs.pop();
				rootChild = childrenCrumbs[childrenCrumbs.length - 1];
			}
		}
	};
}
