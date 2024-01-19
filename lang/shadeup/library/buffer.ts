import { getValueSize } from '../engine/adapters/webgpu';
import {
	float4,
	float3,
	float,
	float2,
	bool,
	int,
	int2,
	int3,
	int4,
	uint,
	uint2,
	uint3,
	uint4,
	atomic
} from '/std_math';

export class buffer_internal<T> {
	__opaque_buffer: true = true;

	structArray: T[] | null = null;
	floatArray: Float32Array | null = null;
	intArray: Int32Array | null = null;
	uintArray: Uint32Array | null = null;
	arrayBuffer: ArrayBuffer | null = null;
	vectorSize: int = 0;
	typeName: string;

	platformPayload: any = null;
	adapter: any = null;

	dirty: boolean = false;
	pendingWrites: number = 0;
	cpuReadDirty: boolean = false;
	cpuWriteDirty: boolean = false;

	elementCount: int = 0;
	elementBytes: int = 0;
	structured: boolean = false;

	fastIndex: (index: int) => T;
	fastIndexAssign: (index: int, value: T) => void;

	destroy() {
		this.adapter.destroyBuffer(this);
	}

	[index: number]: T;

	__index(index: int | uint): T {
		// this.download();
		// return this.fastIndex(index);
		return null as any;
	}

	__index_assign(index: int | uint, value: T): void {
		// this.download();
		// this.cpuWriteDirty = true;
		// this.fastIndexAssign(index, value);
	}

	__index_assign_op(op_fn: (a: T, b: T) => T, index: int | uint, value: T): void {
		// this.download();
		// this.cpuWriteDirty = true;
		// this.fastIndexAssign(index, op_fn(this.fastIndex(index), value));
	}

	len() {
		return this.elementCount;
	}

	/**
	 * Returns the underlying cpu buffer as a typed array.
	 *
	 * > [!NOTE]
	 * > This is considerably faster than using the raw index [] operator.
	 *
	 * > [!NOTE]
	 * > If the buffer contents are structured (atomic, or a struct), this will return a normal array
	 *
	 * ```shadeup
	 * let buf = buffer<uint>();
	 * let data = buf.getData();
	 *
	 * for (let i = 0; i < data.length; i += 4) {
	 * 	// Do something with data[i]
	 * }
	 * ```
	 */
	getData(): Uint32Array | Float32Array | Uint8Array | Int32Array | T[] {
		if (this.structured) {
			return this.structArray!;
		} else {
			return this.floatArray ?? this.intArray ?? this.uintArray ?? new Uint8Array(0);
		}
	}

	write(other: buffer_internal<T>) {
		if (!this.adapter) return;

		this.adapter.copyBufferToBuffer(other, this);
	}

	watchMutation: boolean = false;

	/** @shadeup=tag(async) @shadeup=noemit_gpu */
	async download() {
		if (!this.adapter) return;

		if (this.pendingWrites > 0) {
			(window as any).flushAdapter();
		}

		if (this.cpuReadDirty) {
			this.cpuReadDirty = false;
			await this.adapter.downloadBuffer(this);
		}
	}

	downloadAsync(): Promise<void> {
		return this['download']();
	}

	/** @shadeup=noemit_gpu */
	upload(): void {
		if (!this.adapter) return;

		if (this.cpuWriteDirty) {
			this.cpuWriteDirty = false;
			this.adapter.uploadBuffer(this);
		}
	}
	symbol: Symbol = Symbol();

	constructor(size: int, typeName: string, structure: any) {
		this.adapter = (window as any).shadeupGetGraphicsAdapter();
		this.typeName = typeName;
		if (structure) {
			if (structure.name && !structure.name.startsWith('atomic')) {
				this.typeName = structure.name;
			}
		}
		this.elementCount = size;
		this.elementBytes = 4;
		if (
			typeName == 'float4' ||
			typeName == 'float3' ||
			typeName == 'float2' ||
			typeName == 'float'
		) {
			this.vectorSize = 1;

			this.fastIndex = (index: int) => {
				return this.floatArray![index] as T;
			};
			this.fastIndexAssign = (index: int, value: T) => {
				this.floatArray![index] = value as float;
			};

			if (typeName == 'float4') {
				this.vectorSize = 4;

				this.fastIndex = (index: int) => {
					return float4(
						this.floatArray![index * 4],
						this.floatArray![index * 4 + 1],
						this.floatArray![index * 4 + 2],
						this.floatArray![index * 4 + 3]
					) as T;
				};
				this.fastIndexAssign = (index: int, value: float4) => {
					this.floatArray![index * 4] = value[0];
					this.floatArray![index * 4 + 1] = value[1];
					this.floatArray![index * 4 + 2] = value[2];
					this.floatArray![index * 4 + 3] = value[3];
				};
			}

			if (typeName == 'float3') {
				this.vectorSize = 3;

				this.fastIndex = (index: int) => {
					return float3(
						this.floatArray![index * 3],
						this.floatArray![index * 3 + 1],
						this.floatArray![index * 3 + 2]
					) as T;
				};
				this.fastIndexAssign = (index: int, value: float3) => {
					this.floatArray![index * 3] = value[0];
					this.floatArray![index * 3 + 1] = value[1];
					this.floatArray![index * 3 + 2] = value[2];
				};
			}
			if (typeName == 'float2') {
				this.vectorSize = 2;

				this.fastIndex = (index: int) => {
					return float2(this.floatArray![index * 2], this.floatArray![index * 2 + 1]) as T;
				};
				this.fastIndexAssign = (index: int, value: float2) => {
					this.floatArray![index * 2] = value[0];
					this.floatArray![index * 2 + 1] = value[1];
				};
			}
			this.floatArray = new Float32Array(size * this.vectorSize);
			this.arrayBuffer = this.floatArray.buffer;
		} else if (
			typeName == 'int4' ||
			typeName == 'int3' ||
			typeName == 'int2' ||
			typeName == 'int'
		) {
			this.vectorSize = 1;

			this.fastIndex = (index: int) => {
				return this.intArray![index] as T;
			};
			this.fastIndexAssign = (index: int, value: T) => {
				this.intArray![index] = value as int;
			};

			if (typeName == 'int4') {
				this.vectorSize = 4;

				this.fastIndex = (index: int) => {
					return int4(
						this.intArray![index * 4],
						this.intArray![index * 4 + 1],
						this.intArray![index * 4 + 2],
						this.intArray![index * 4 + 3]
					) as T;
				};
				this.fastIndexAssign = (index: int, value: int4) => {
					this.intArray![index * 4] = value[0];
					this.intArray![index * 4 + 1] = value[1];
					this.intArray![index * 4 + 2] = value[2];
					this.intArray![index * 4 + 3] = value[3];
				};
			}

			if (typeName == 'int3') {
				this.vectorSize = 3;

				this.fastIndex = (index: int) => {
					return int3(
						this.intArray![index * 3],
						this.intArray![index * 3 + 1],
						this.intArray![index * 3 + 2]
					) as T;
				};
				this.fastIndexAssign = (index: int, value: int3) => {
					this.intArray![index * 3] = value[0];
					this.intArray![index * 3 + 1] = value[1];
					this.intArray![index * 3 + 2] = value[2];
				};
			}

			if (typeName == 'int2') {
				this.vectorSize = 2;

				this.fastIndex = (index: int) => {
					return int2(this.intArray![index * 2], this.intArray![index * 2 + 1]) as T;
				};
				this.fastIndexAssign = (index: int, value: int2) => {
					this.intArray![index * 2] = value[0];
					this.intArray![index * 2 + 1] = value[1];
				};
			}

			this.intArray = new Int32Array(size * this.vectorSize);
			this.arrayBuffer = this.intArray.buffer;
		} else if (
			typeName == 'uint4' ||
			typeName == 'uint3' ||
			typeName == 'uint2' ||
			typeName == 'uint'
		) {
			this.vectorSize = 1;

			this.fastIndex = (index: int) => {
				return this.uintArray![index] as T;
			};
			this.fastIndexAssign = (index: int, value: T) => {
				this.uintArray![index] = value as uint;
			};

			if (typeName == 'uint4') {
				this.vectorSize = 4;

				this.fastIndex = (index: int) => {
					return uint4(
						this.uintArray![index * 4],
						this.uintArray![index * 4 + 1],
						this.uintArray![index * 4 + 2],
						this.uintArray![index * 4 + 3]
					) as T;
				};
				this.fastIndexAssign = (index: int, value: uint4) => {
					this.uintArray![index * 4] = value[0];
					this.uintArray![index * 4 + 1] = value[1];
					this.uintArray![index * 4 + 2] = value[2];
					this.uintArray![index * 4 + 3] = value[3];
				};
			}

			if (typeName == 'uint3') {
				this.vectorSize = 3;

				this.fastIndex = (index: int) => {
					return uint3(
						this.uintArray![index * 3],
						this.uintArray![index * 3 + 1],
						this.uintArray![index * 3 + 2]
					) as T;
				};
				this.fastIndexAssign = (index: int, value: uint3) => {
					this.uintArray![index * 3] = value[0];
					this.uintArray![index * 3 + 1] = value[1];
					this.uintArray![index * 3 + 2] = value[2];
				};
			}

			if (typeName == 'uint2') {
				this.vectorSize = 2;

				this.fastIndex = (index: int) => {
					return uint2(this.uintArray![index * 2], this.uintArray![index * 2 + 1]) as T;
				};
				this.fastIndexAssign = (index: int, value: uint2) => {
					this.uintArray![index * 2] = value[0];
					this.uintArray![index * 2 + 1] = value[1];
				};
			}

			this.uintArray = new Uint32Array(size * this.vectorSize);
			this.arrayBuffer = this.uintArray.buffer;
		} else {
			this.structured = true;

			if (typeName.startsWith('atomic<')) {
				// this.structArray = new Array<T>(size);
				this.arrayBuffer = new ArrayBuffer(size * 4);

				this.watchMutation = true;
				this.vectorSize = 1;
				this.elementBytes = 4;
				this.elementCount = size;
				for (let i = 0; i < size; i++) {
					// this.structArray[i] = atomic(0) as T;
				}
				if (typeName == 'atomic<uint>') {
					this.uintArray = new Uint32Array(this.arrayBuffer);
					this.fastIndex = (index: int) => {
						return atomic(this.uintArray![index]) as T;
					};
					this.fastIndexAssign = (index: int, value: T) => {
						this.uintArray![index] = value.__value as any;
					};
				} else {
					this.intArray = new Int32Array(this.arrayBuffer);
					this.fastIndex = (index: int) => {
						return atomic(this.intArray![index]) as T;
					};
					this.fastIndexAssign = (index: int, value: T) => {
						this.intArray![index] = value.__value as any;
					};
				}
			} else {
				let elementSize = this.adapter.getValueSize(structure);
				let realSize = elementSize * size;
				this.elementCount = size;
				this.elementBytes = elementSize;
				this.arrayBuffer = new ArrayBuffer(realSize);

				this.fastIndex = (index: int) => {
					return this.adapter.readStructuredBuffer(
						structure,
						this.arrayBuffer,
						index * elementSize
					) as T;
				};
				this.fastIndexAssign = (index: int, value: T) => {
					this.cpuWriteDirty = true;
					this.adapter.writeStructuredBuffer(
						structure,
						value,
						this.arrayBuffer,
						index * (elementSize / 4)
					);
				};
			}
		}

		(this.__index as any) = (index: int): T => {
			// await this.download();
			if (this.watchMutation) {
				let data = this.fastIndex(index);
				(data as any).$mutate = (to?: T) => {
					this.cpuWriteDirty = true;
					if (to !== undefined) {
						if (this.intArray) {
							this.intArray[index] = to as any;
						} else {
							this.uintArray![index] = to as any;
						}
					}
				};
				return data;
			} else {
				return this.fastIndex(index);
			}
		};

		this.__index_assign = (index: int, value: T): void => {
			// await this.download();
			this.cpuWriteDirty = true;
			this.fastIndexAssign(index, value);
		};

		this.__index_assign_op = (op_fn: (a: T, b: T) => T, index: int, value: T): void => {
			// await this.download();
			this.cpuWriteDirty = true;

			this.fastIndexAssign(index, op_fn(this.fastIndex(index), value));
		};
	}
}

export type buffer<T> = buffer_internal<T>;

/**
 * Creates a new buffer.
 * ```shadeup
 * let buf = buffer<float>(100);
 *
 * ```
 */
export function buffer<T>(data: T[], typeName: string, structure?: object): buffer<T>;
export function buffer<T>(size: int, typeName: string, structure?: object): buffer<T>;
export function buffer<T>(e1: any, typeName: string, structure?: object): buffer<T> {
	if (typeof e1 === 'number') {
		let size = e1;
		let buf = new buffer_internal<T>(size, typeName, structure!);
		return buf;
	} else {
		let data = e1;
		let buf = new buffer_internal<T>(data.length, typeName, structure!);
		for (let i = 0; i < data.length; i++) {
			buf.fastIndexAssign(i, data[i]);
		}
		return buf;
	}
}
