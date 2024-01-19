/**__SHADEUP_STRUCT_INJECTION_HOOK__*/
export const __dummy = 1;

import {
	bool,
	float,
	float2,
	float3,
	float4,
	int,
	int2,
	int3,
	int4,
	uint,
	uint3,
	atomic
} from '/std_math';
// import { Mesh } from '/_std/mesh';

export class Mesh {
	private vertices: float3[] = [];
	private triangles: int[] = [];
	private normals: float3[] = [];
	private tangents: float3[] = [];
	private bitangents: float3[] = [];
	private uvs: float2[] = [];
	private colors: float4[] = [];
	symbol: Symbol;

	constructor(prefils: {
		vertices?: float3[];
		triangles?: int[];
		normals?: float3[];
		tangents?: float3[];
		bitangents?: float3[];
		uvs?: float2[];
		colors?: float4[];
	}) {
		this.symbol = Symbol();
		if (prefils.vertices) this.vertices = prefils.vertices;
		if (prefils.triangles) this.triangles = prefils.triangles;
		if (prefils.normals) this.normals = prefils.normals;
		if (prefils.tangents) this.tangents = prefils.tangents;
		if (prefils.bitangents) this.bitangents = prefils.bitangents;
		if (prefils.uvs) this.uvs = prefils.uvs;
		if (prefils.colors) this.colors = prefils.colors;
	}

	getVertices() {
		return this.vertices;
	}

	getTriangles() {
		return this.triangles;
	}

	getNormals() {
		return this.normals;
	}

	getTangents() {
		return this.tangents;
	}

	getBitangents() {
		return this.bitangents;
	}

	getUVs() {
		return this.uvs;
	}

	getColors() {
		return this.colors;
	}
}

/**
 * Prints a set of value(s) to the console. Values will be converted to strings before printing.
 *
 * @param args Any number of values to print to the console
 */
export function print(...args: any[]) {
	console.log(...args);
	if (typeof window['__shadeup_print'] === 'function') {
		window['__shadeup_print'](...args);
	}
}

/**
 * Flushes (executes) all queued compute or draw calls
 * @shadeup=tag(async) @shadeup=noemit_gpu
 */
export async function flush() {
	if (typeof window['flushAdapter'] === 'function') {
		return await window['flushAdapter']();
	}
}

/**
 * Displays a single value in the stats panel at the top right
 *
 * @param name key for this stat (e.g. "fps")
 * @param value any value
 */
export function stat(name: string, value: any) {
	if (typeof window['__shadeup_stat'] === 'function') {
		window['__shadeup_stat'](name, value);
	}
}

/**
 * Display a graph of a numeric value over time
 *
 * @param name key for this stat (e.g. "fps")
 * @param value any numeric value
 * @param sampleRate how often should the graph be updated (e.g. 1 = every call, 2 = every second call, etc.)
 */
export function statGraph(name: string, value: float, sampleRate: int = 1) {
	if (typeof window['__shadeup_statGraph'] === 'function') {
		window['__shadeup_statGraph'](name, value);
	}
}

// type InferPayload1<T> = {
// 	data: [T];
// 	callback: (a: { attachment0: T }) => void;
// };

// type InferPayload2<T, I> = {
// 	data: [T, I];
// 	callback: (a: { attachment0: T; attachment1: I }) => void;
// };

// function infer(payload: InferPayload1 | InferPayload2);
// function infer(a: any) {}

// infer({
// 	data: [67],
// 	callback: (a) => {
// 		a[0];
// 	}
// });

type FnPass<T> = (a: T) => void;

function infer<I, O, C>(fn: (a: I, b: O) => void): shader<I, O, C> {
	return fn as shader<I, O, C>;
}

// export function drawAlt(keys: shader<ShaderInput, ShaderOutput, 0>) {}
// export function draw(fullScreenPixelShader: shader<ShaderInput, ShaderOutput, 0>): void;
// export function draw(
// 	first: Mesh | any | shader<ShaderInput, ShaderOutput>,
// 	second?: shader<ShaderInput, ShaderOutput>,
// 	third?: shader<ShaderInput, ShaderOutput>
// ) {
// 	if ('vertices' in first && second && third) {
// 		__shadeup_dispatch_draw_geometry(first, second, third);
// 	} else if (first && !second && !third) {
// 		__shadeup_dispatch_draw(first as shader<ShaderInput, ShaderOutput>);
// 	}
// }

// draw(makeShader('', (a, b) => {}));
// drawAlt(
// 	makeShader(
// 		'000004808000091289258019303699031390005438610',
// 		/**@shadeup=shader*/ (__in, __out) => {
// 			__out.color;
// 		}
// 	)
// );
// /**
//  *
//  */
export function compute(workgroups: int3, computeShader: shader<any, any, any>) {
	(window as any).__shadeup_dispatch_compute(workgroups, computeShader);
}

// function draww(s: shader<{ abc: 123 }, { test: 123 }>) {}

// type x<T> = { x: T };

// function makeTex<T>(a: T): x<T> {
// 	return { x: a };
// }
// draw({
// 	vertex: shader('abc', (__in, __out) => {}),
// 	attachments: [
// 		makeTex({ abc: 123 }),
// 		makeTex({ abc: 123 }),
// 		makeTex({ abc: 123 }),
// 		makeTex({ abc: 123 }),
// 		makeTex({ abc: 123 }),
// 		makeTex({ abc: 123 }),
// 		makeTex({ abc: 123 }),
// 		makeTex({ abc: 123 })
// 	],
// 	mesh: new Mesh(),
// 	fragment: shader('abc', (__in, __out) => {
// 		//__out.attachment0
// 	})
// });

export function globalVarInit<T>(
	fileName: string,
	varName: string,
	initFn: () => T,
	getterFn: any
): T {
	if (!window['shadeup_globals']) {
		window['shadeup_globals'] = {};
	}

	if (!window['shadeup_globals'][fileName]) {
		window['shadeup_globals'][fileName] = {};
	}

	// Disable caching for now
	const cache = false;
	if (!window['shadeup_globals'][fileName][varName] || !cache) {
		window['shadeup_globals'][fileName][varName] = initFn();
	}

	window['shadeup_globals'][fileName]['$getter_' + varName] = getterFn;
	return window['shadeup_globals'][fileName][varName] as T;
}

export function globalVarGet(fileName, varName) {
	if (varName == 'env' || varName == 'PLATFORM_WEBGPU' || varName == 'PLATFORM_WEBGL') {
		return window[varName];
	}

	return window['shadeup_globals'][fileName]['$getter_' + varName]();
}

interface ToString {
	toString(): string;
}

type HashableType =
	| string
	| float
	| int
	| bool
	| float2
	| float3
	| float4
	| int2
	| int3
	| int4
	| ToString;

export function hashableTypeToString(k: HashableType) {
	if (typeof k == 'number') {
		return k.toString();
	} else if (typeof k == 'object') {
		if (Array.isArray(k)) {
			return k.map(hashableTypeToString).join(',');
		} else {
			return k.toString();
		}
	} else {
		return k.toString();
	}
}

declare global {
	const PLATFORM_WEBGPU: boolean;
	const PLATFORM_WEBGL: boolean;

	interface Array<T> {
		len(): int;
		push(...items: T[]): void;
		pop(): T;

		last(): T;
		first(): T;

		append(items: T[]): void;
		remove(index: int): void;

		indexOf(item: T): int;

		__index(index: int | uint): T;

		__index_assign(index: int | uint, value: T): void;
		__index_assign_op(op_fn: (a: T, b: T) => T, index: int | uint, value: T): void;

		[index: number]: T;
	}
}

Array.prototype.len = function () {
	return this.length;
};

Array.prototype.last = function () {
	return this[this.length - 1];
};

Array.prototype.first = function () {
	return this[0];
};

Array.prototype.append = function (items: any[]) {
	for (let i = 0; i < items.length; i++) {
		this.push(items[i]);
	}
};

Array.prototype.remove = function (index: int) {
	this.splice(index, 1);
};

Array.prototype.__index = function (index: int) {
	return this[index];
};

Array.prototype.__index_assign = function (index: int, value: any) {
	this[index] = value;
};

Array.prototype.__index_assign_op = function (
	op_fn: (a: any, b: any) => any,
	index: int,
	value: any
) {
	this[index] = op_fn(this[index], value);
};

/** @shadeup=tag(async) */
export function sleep(seconds: float) {
	return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export type array<T> = Array<T>;
export function array<T>(count: number, initializer: any = null): array<T> {
	let arr = new Array<T>(count);
	if (initializer) {
		for (let i = 0; i < count; i++) {
			arr[i] = initializer;
		}
	}
	return arr;
}

export class map<K extends HashableType, V> {
	pairs: Map<string, [K, V]> = new Map<string, [K, V]>();

	constructor(entries?: [K, V][]) {
		if (entries)
			for (let e of entries) {
				this.__index_assign(e[0], e[1]);
			}
	}

	__index(key: K): V {
		if (!this.pairs.has(hashableTypeToString(key))) {
			throw new Error('Key not found: ' + hashableTypeToString(key));
		}

		return this.pairs.get(hashableTypeToString(key))[1];
	}

	__index_assign(key: K, value: V) {
		this.pairs.set(hashableTypeToString(key), [key, value]);
	}

	__index_assign_op(op_fn: (a: V, b: V) => V, key: K, value: V) {
		this.pairs.set(hashableTypeToString(key), [key, op_fn(this.__index(key), value)]);
	}

	delete(key: K) {
		this.pairs.delete(hashableTypeToString(key));
	}

	has(key: K): bool {
		return this.pairs.has(hashableTypeToString(key));
	}

	keys(): K[] {
		return Array.from(this.pairs.values()).map((k) => k[0]);
	}

	values(): V[] {
		return Array.from(this.pairs.values()).map((k) => k[1]);
	}

	static new<K extends HashableType, V>(entries?: [K, V][]): map<K, V> {
		return new map<K, V>(entries);
	}
}

export function __makeMap<V>(initial: { [key: number]: V }): map<number, V>;
export function __makeMap<V>(initial: { [key: string]: V }): map<string, V>;
export function __makeMap<V>(initial: { [key: string | number]: V }): map<string | number, V> {
	return new map<string | number, V>(Object.entries(initial));
}

export function __deepClone(value: any) {
	if (typeof value == 'object') {
		if (Array.isArray(value)) {
			let res = new Array(value.length);
			for (let i = 0; i < value.length; i++) {
				res[i] = __deepClone(value[i]);
			}
			return res;
		} else {
			if (value && typeof value.clone == 'function') {
				return value.clone();
			} else {
				return value;
			}
		}
	} else {
		return value;
	}
}

export interface Spatial2d {
	getPosition(): float2;
	getBoundsMin(): float2;
	getBoundsMax(): float2;
	getRadius(): float;

	setPosition(pos: float2): void;
}

export interface Spatial3d {
	getPosition(): float3;
	getBoundsMin(): float3;
	getBoundsMax(): float3;
	getRadius(): float;

	setPosition(pos: float3): void;
}

export class time {
	/** Saves the current time with a key of name */
	static start(name?: string) {
		performance.mark((name ?? '_default') + '_start');
	}

	/** Returns the difference in milliseconds between a start with the same key */
	static stop(name?: string): float {
		performance.mark((name ?? '_default') + '_end');

		let res = performance.measure(
			(name ?? '_default') + '_diff',
			(name ?? '_default') + '_start',
			(name ?? '_default') + '_end'
		);

		return res.duration;
	}

	/**
	 * This returns a decimal resolution time in milliseconds since the page started. Useful for measuring time differences
	 *
	 * This uses performance.now() under the hood:
	 * The performance.now() method returns a high resolution timestamp in milliseconds. It represents the time elapsed since Performance.timeOrigin
	 */
	static now(): float {
		return performance.now();
	}
}
