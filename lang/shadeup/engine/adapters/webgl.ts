import type { buffer } from 'src/shadeup/library/buffer';
import { ShadeupTexture2d } from '../engine';
import type { ShadeupShaderInstance } from '../shader';
import { translateNumericToGLSL } from '../util';
import {
	GenericShader,
	GraphicsAdapter,
	ShaderDispatch,
	type ShaderCodeMapping,
	type ShaderType,
	type UniformValueType,
	type ShaderBindingOptions
} from './adapter';
import { LRUCache } from 'lru-cache';

export function indexToRowColumn(str: string, index: number) {
	let row = 0;
	let column = 0;
	for (let i = 0; i < index; i++) {
		if (str[i] === '\n') {
			row++;
			column = 0;
		} else {
			column++;
		}
	}
	return { row, column };
}

type WithCachedUniformLocation = {
	getUniformLocationCached: (path: string) => WebGLUniformLocation;
};

const TRANSPOSE_MATRICES_UNIFORM = false;
const boundTextures = new Map<number, any | null>();
let boundTexturesCache = new LRUCache({
	max: 16
});
for (let ti = 0; ti < 16; ti++) {
	boundTextures.set(ti, null);
}

export function rowColumnToIndex(str: string, row: number, column: number) {
	let index = 0;
	let currentRow = 0;
	let currentColumn = 0;
	while (currentRow < row || currentColumn < column) {
		if (str[index] === '\n') {
			currentRow++;
			currentColumn = 0;
		} else {
			currentColumn++;
		}
		index++;
	}
	return index;
}

let webglCounter = 0;
export class WebGLAdapter extends GraphicsAdapter {
	gl: WebGL2RenderingContext | null = null;
	index: number = 0;
	blankImage: HTMLCanvasElement | null = null;
	GL_SHADER_TYPES: { [K in ShaderType]: number } = {
		vertex: 0,
		'vertex-indexed': 0,
		fragment: 0,
		compute: -1
	};

	programCache = new Map<string, WebGLProgram & WithCachedUniformLocation>();

	init() {
		this.index = webglCounter++;
		console.log('Creating gl with index', this.index);
		this.gl = this.canvas.getContext('webgl2', {
			preserveDrawingBuffer: true
		});
		if (!this.gl) {
			throw new Error('WebGL is not supported');
		}

		this.GL_SHADER_TYPES = {
			vertex: this.gl.VERTEX_SHADER,
			fragment: this.gl.FRAGMENT_SHADER,
			'vertex-indexed': this.gl.VERTEX_SHADER,
			compute: -1
		};

		this.blankImage = document.createElement('canvas');
		this.blankImage.width = 1;
		this.blankImage.height = 1;
		this.blankImage.getContext('2d')!.fillRect(0, 0, 1, 1);
		this.setupImageDrawing();
	}

	__program: WebGLProgram | null = null;

	setupImageDrawing() {
		const gl = this.getGL();
		this.__program = gl.createProgram();
		let program = this.__program;
		if (!program) throw new Error('Could not create program');
		let vertexShader = this.genNativeShader(
			`#version 300 es
precision highp float;

in vec4 a_position;
in vec2 a_texcoord;

uniform vec2 size;

out vec2 v_texcoord;

void main() {
	gl_Position = a_position;
	v_texcoord = a_texcoord;

	float x = float((gl_VertexID & 1) << 2);
	float y = float((gl_VertexID & 2) << 1);
	v_texcoord.x = x * 0.5;
	v_texcoord.y = 1.f - (y * 0.5);
	gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);

}
`,
			gl.VERTEX_SHADER
		);

		let fragmentShader = this.genNativeShader(
			`#version 300 es
precision mediump float;
precision mediump int;

in vec2 v_texcoord;
out vec4 _i_gl_out_pixel;
	
uniform sampler2D u_texture;
	
void main() {
	vec2 t = vec2(v_texcoord.x, v_texcoord.y);
	vec4 c = texture(u_texture, t);
	// c.rgb *= c.a;
	_i_gl_out_pixel = c;
	// _i_gl_out_pixel = vec4(t, 0.0, 1.0);
}
`,
			gl.FRAGMENT_SHADER
		);

		if (!vertexShader || !fragmentShader) {
			return;
		}

		gl.attachShader(program, vertexShader!);
		gl.attachShader(program, fragmentShader!);
		gl.linkProgram(program);
	}

	drawImage(
		image: HTMLCanvasElement,
		dstX: number,
		dstY: number,
		texWidth: number,
		texHeight: number
	): void {
		const gl = this.getGL();
		const program = this.__program;
		if (!program) throw new Error('Could not create program');

		let positionLocation = gl.getAttribLocation(program, 'a_position');
		let texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');

		let matrixLocation = gl.getUniformLocation(program, 'u_matrix');
		let textureLocation = gl.getUniformLocation(program, 'u_texture');

		let positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

		let positions = [-1, -1, -1, 1, 1, -1, 1, -1];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

		let texcoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

		let texcoords = [0, 0, 0, 1, 1, 0, 1, 0];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

		let unit = this.getTextureUnit(image);
		// let tex = gl.createTexture();
		// gl.bindTexture(gl.TEXTURE_2D, tex);

		// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		gl.useProgram(program);

		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
		gl.enableVertexAttribArray(texcoordLocation);
		gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

		gl.uniform1i(textureLocation, unit);

		// gl.activeTexture(gl.TEXTURE0 + unit);
		// gl.bindTexture(gl.TEXTURE_2D, unit);

		gl.enable(gl.BLEND);
		// gl.blendFunc(gl.ONE, gl.ZERO);

		let indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		let tris = [0, 1, 2];
		let indexArr = new Uint16Array(tris.length);

		for (let i = 0; i < tris.length; i += 3) {
			indexArr[i] = tris[i];
			indexArr[i + 1] = tris[i + 1];
			indexArr[i + 2] = tris[i + 2];
		}
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArr, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

		gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);

		// gl.deleteTexture(tex);
		gl.deleteBuffer(positionBuffer);
		gl.deleteBuffer(texcoordBuffer);
	}

	getGL(): WebGL2RenderingContext {
		if (!this.gl) {
			throw new Error('WebGL is not supported');
		}

		return this.gl;
	}

	setViewport(width: number, height: number) {
		const gl = this.getGL();

		gl.viewport(0, 0, width, height);
	}

	getOrCreateShader(
		instance: ShadeupShaderInstance,
		type: ShaderType,
		config?: ShaderBindingOptions
	): GenericShader {
		const gl = this.getGL();

		let arrSizeChanged = false;
		for (let param of Object.keys(instance.parent.params.webgl)) {
			let type = instance.parent.params.webgl[param];
			if (type.type == 'array') {
				if (!instance.parent.arraySizes[param]) instance.parent.arraySizes[param] = 0;

				if (Array.isArray(instance.bindings[param])) {
					if (instance.bindings[param].length > instance.parent.arraySizes[param]) {
						instance.parent.arraySizes[param] = instance.bindings[param].length;
						arrSizeChanged = true;
					}
				}
			}
		}

		if (instance.parent.types[type] && !arrSizeChanged) {
			return instance.parent.types[type];
		} else {
			if (type == 'compute') {
				throw new Error('Compute shaders are not supported in WebGL');
			}
			let shader = gl.createShader(this.GL_SHADER_TYPES[type]);
			if (!shader) {
				console.log('Shader on canvas failed', this.canvas);
				throw new Error('Failed to create shader of type ' + type);
			}

			let base = instance.parent.code.webgl;
			for (let param of Object.keys(instance.parent.arraySizes)) {
				base = base.replace(`%${param}_size%`, instance.parent.arraySizes[param]);
				// console.log(base, `%${param}_size%`);
			}

			if (type == 'vertex') {
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/',
					`in vec3 a_position;
					in vec3 a_normal;
					in vec3 a_tangent;
					in vec3 a_bitangent;
					in vec2 a_uv;
					in vec4 a_color;
					
					out vec3 _v_position;
					out vec3 _v_normal;
					out vec3 _v_tangent;
					out vec3 _v_bitangent;
					out vec2 _v_uv;
					out vec4 _v_color;
					uniform vec2 _vtex_canvas;`.replace(/\t\n/g, '')
				);
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/',
					`ShaderOutput _i_out;
					_i_out.position = vec4(a_position, 1.0);
					_i_out.normal = a_normal;
					_i_out.tangent = a_tangent;
					_i_out.bitangent = a_bitangent;
					_i_out.uv = a_uv;
					_i_out.color = a_color;

					ShaderInput _i_in;
					_i_in.position = a_position;
					_i_in.uv = a_uv;
					_i_in.normal = a_normal;
					_i_in.tangent = a_tangent;
					_i_in.bitangent = a_bitangent;
					_i_in.color = a_color;
					_i_in.screen = vec2(0, 0);`.replace(/\t\n/g, '')
				);
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/',
					`gl_Position = _i_out.position;
					_v_position = _i_out.position.xyz;
					_v_normal = _i_out.normal;
					_v_tangent = _i_out.tangent;
					_v_bitangent = _i_out.bitangent;
					_v_uv = _i_out.uv;
					_v_color = _i_out.color;`.replace(/\t\n/g, '')
				);
				base = base.replaceAll('_ext_uniform_global_', '_vertex_ext_uniform_global_');
				base = base.replaceAll('_ext_uniform_local_', '_vertex_ext_uniform_local_');
			} else if (type == 'vertex-indexed') {
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/',
					`
					out vec3 _v_position;
					out vec3 _v_normal;
					out vec3 _v_tangent;
					out vec3 _v_bitangent;
					out vec2 _v_uv;
					out vec4 _v_color;
					uniform vec2 _vtex_canvas;`.replace(/\t\n/g, '')
				);
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/',
					`ShaderOutput _i_out;
					_i_out.position = vec4(0.0, 0.0, 0.0, 1.0);
					_i_out.normal = vec3(0.0);
					_i_out.tangent = vec3(0.0);
					_i_out.bitangent = vec3(0.0);
					_i_out.uv = vec2(0.0);
					_i_out.color = vec4(0.0);

					ShaderInput _i_in;
					_i_in.vertexIndex = uint(gl_VertexID);
					_i_in.position = vec3(0.0);
					_i_in.uv = vec2(0.0);
					_i_in.normal = vec3(0.0);
					_i_in.tangent = vec3(0.0);
					_i_in.bitangent = vec3(0.0);
					_i_in.color = vec4(0.0);
					_i_in.screen = vec2(0, 0);`.replace(/\t\n/g, '')
				);
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/',
					`gl_Position = _i_out.position;
					_v_position = _i_out.position.xyz;
					_v_normal = _i_out.normal;
					_v_tangent = _i_out.tangent;
					_v_bitangent = _i_out.bitangent;
					_v_uv = _i_out.uv;
					_v_color = _i_out.color;`.replace(/\t\n/g, '')
				);
				base = base.replaceAll('_ext_uniform_global_', '_vertex_ext_uniform_global_');
				base = base.replaceAll('_ext_uniform_local_', '_vertex_ext_uniform_local_');
			} else {
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/',
					`out vec4 _i_gl_out_pixel;
					in vec3 _v_position;
					in vec3 _v_normal;
					in vec3 _v_tangent;
					in vec3 _v_bitangent;
					in vec2 _v_uv;
					in vec4 _v_color;
					uniform vec2 _vtex_canvas;`.replace(/\t\n/g, '')
				);
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/',
					`ShaderOutput _i_out;
					ShaderInput _i_in;
					_i_in.uv = _v_uv;
					_i_in.normal = _v_normal;
					_i_in.tangent = _v_tangent;
					_i_in.bitangent = _v_bitangent;
					_i_in.color = _v_color;
					_i_in.position = _v_position;
					_i_in.screen = vec2(gl_FragCoord.x, _vtex_canvas.y - gl_FragCoord.y);`.replace(/\t\n/g, '')
				);
				base = base.replace(
					'/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/',
					'_i_gl_out_pixel = _i_out.color;'
				);
				base = base.replaceAll('_ext_uniform_global_', '_pixel_ext_uniform_global_');
				base = base.replaceAll('_ext_uniform_local_', '_pixel_ext_uniform_local_');
			}
			let finalSource = `#version 300 es\nprecision mediump float;\nprecision mediump int;\n\n${base}`;

			gl.shaderSource(shader, finalSource);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				let err = gl.getShaderInfoLog(shader);
				if (err) {
					let location = err.match(/ERROR: \d+:(\d+):/);
					if (location) {
						let line = parseInt(location[1]);
						let col = parseInt(location[0]);

						let lines = finalSource.split('\n');
						console.error(lines[line - 1]);
						console.error(' '.repeat(col - 1) + '^');
					}
				}

				console.error('Shader compile error', gl.getShaderInfoLog(shader));
				// gl.shader;
				console.log(finalSource);
				(window as any).bubbleError('Shader compile error ' + gl.getShaderInfoLog(shader));
			}

			instance.version++;

			let gShader = new GenericShader(instance.parent.code.webgl, type);
			if (!gShader.payload) {
				gShader.payload = {};
			}
			gShader.payload[this.index] = shader;
			gShader.code = finalSource;
			gShader.parent = instance.parent;

			instance.parent.types[type] = gShader;
			return gShader;
		}
	}

	createShader(code: ShaderCodeMapping, type: ShaderType) {
		const gl = this.getGL();

		if (type == 'compute') {
			let gComputeShader = new GenericShader(code.webgl, type);
			gComputeShader.payload = code.software;
			gComputeShader.parent = null;
			return gComputeShader;
		}

		let shader = gl.createShader(this.GL_SHADER_TYPES[type]);

		if (!shader) {
			throw new Error('Failed to create shader');
		}

		gl.shaderSource(shader, code.webgl);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log('Code', code);
			console.error('Shader compile error', gl.getShaderInfoLog(shader));
			throw new Error('Shader compile error');
		}

		let gShader = new GenericShader(code.webgl, type);
		gShader.payload = { [this.index]: shader };
		gShader.parent = null;

		return gShader;
	}

	clear() {
		const gl = this.getGL();

		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
	}

	getProgramVertexPixel(
		vertexShaderKey: string,
		vertexShader: WebGLShader,
		pixelShaderKey: string,
		pixelShader: WebGLShader
	): (WebGLProgram & WithCachedUniformLocation) | null {
		const gl = this.getGL();

		let key = `${vertexShaderKey}_${pixelShaderKey}`;

		let uniformCache = new Map<string, WebGLUniformLocation>();

		if (this.programCache.has(key)) {
			return this.programCache.get(key) ?? null;
		}

		let program: WebGLProgram & WithCachedUniformLocation = gl.createProgram() as any;
		if (!program) {
			return null;
		}

		(program as any).getUniformLocationCached = (path: string) => {
			if (!program) throw new Error('Program is null');

			if (uniformCache.has(path)) {
				return uniformCache.get(path) ?? null;
			}
			// let errBefore = gl.getError();
			let loc = gl.getUniformLocation(program, path);
			if (!loc) {
				// let err = gl.getError();
				// throw new Error('Uniform not found ' + path + ' ' + err + ' ' + errBefore + ' ' + loc);
			} else {
				uniformCache.set(path, loc);
				return loc;
			}
		};

		if (!vertexShader || !pixelShader) {
			return null;
		}

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, pixelShader);
		gl.linkProgram(program);
		gl.useProgram(program);
		this.programCache.set(key, program);
		return program ?? null;
	}

	unbindTexture(texture: ShadeupTexture2d) {
		const gl = this.getGL();
		if (texture.isBound && texture.payload) {
			boundTextures.set(texture.payload.unit, null);
			texture.isBound = false;

			gl.deleteTexture(texture.payload.texture);
			texture.payload = null;
		}
	}

	flush(): void {
		const gl = this.getGL();

		gl.flush();
	}

	getTextureUnit(texture: ShadeupTexture2d | TexImageSource) {
		const gl = this.getGL();

		let isBound = false;
		if (texture instanceof ShadeupTexture2d) {
			texture.flush();
			isBound = texture.isBound;
		}

		if (!isBound) {
			let unit = -1;
			for (let [ti, tex] of boundTextures) {
				if (tex == null) {
					unit = ti;
					break;
				}
			}

			if (unit == -1) {
				let oldest = boundTexturesCache.pop();

				unit = oldest![0];

				// throw new Error('Too many textures bound');
			}

			if (texture instanceof ShadeupTexture2d) {
				texture.payload = {
					texture: gl.createTexture(),
					unit: -1,
					version: texture.version
				};
				gl.activeTexture(gl.TEXTURE0 + unit);
				gl.bindTexture(gl.TEXTURE_2D, texture.payload.texture);
			} else {
				gl.activeTexture(gl.TEXTURE0 + unit);
				if (!texture.$gl) {
					texture.$gl = {};
				}

				if (!texture.$gl[this.index]) {
					texture.$gl[this.index] = gl.createTexture();
				}
				gl.bindTexture(gl.TEXTURE_2D, texture.$gl[this.index]!);
			}

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

			if (texture instanceof ShadeupTexture2d) {
				let webglAdapter = texture.adapter as WebGLAdapter;
				let useImage: TexImageSource = webglAdapter.canvas as TexImageSource;

				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, useImage);
			} else {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
			}

			boundTextures.set(unit, texture);

			if (texture instanceof ShadeupTexture2d) {
				texture.isBound = true;
				texture.payload.unit = unit;

				boundTexturesCache.set(texture.payload.unit, [texture.payload.unit, texture]);
			} else {
				boundTexturesCache.set(unit, [unit, texture]);
			}
			return unit;
		} else {
			if (texture instanceof ShadeupTexture2d) {
				if (texture.payload.version != texture.version) {
					gl.activeTexture(gl.TEXTURE0 + texture.payload.unit);

					gl.bindTexture(gl.TEXTURE_2D, texture.payload.texture);

					let webglAdapter = texture.adapter as WebGLAdapter;
					let useImage: TexImageSource = webglAdapter.canvas as TexImageSource;

					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, useImage);

					texture.payload.version = texture.version;
				}

				boundTexturesCache.set(texture.payload.unit, [
					texture.payload.unit,
					texture.payload.texture
				]);
				return texture.payload.unit;
			}
		}
	}

	setUniform(
		program: WebGLProgram & WithCachedUniformLocation,
		path: string,
		val: any,
		type: UniformValueType,
		shaderKind: 'pixel' | 'vertex'
	) {
		const gl = this.getGL();
		const setUniform = this.setUniform.bind(this);

		let expandedType = type;
		if (expandedType.type == 'array') {
			let innerType = expandedType.element;
			for (let i = 0; i < val.length; i++) {
				setUniform(program, `${path}[${i}]`, val[i], innerType, shaderKind);
			}
			if (path.split('.').length < 2) {
				setUniform(
					program,
					`${path}_size`,
					val.length,
					{ type: 'primitive', name: 'int' },
					shaderKind
				);
			}
		} else if (expandedType.type == 'primitive') {
			if (expandedType.name == 'texture2d' || expandedType.name == 'rwtexture2d') {
				let innerType = expandedType.element;

				let u = this.getTextureUnit(val);

				let loc = program.getUniformLocationCached(path);
				gl.uniform1i(loc, u);

				if (path.split('.').length < 2) {
					setUniform(
						program,
						`${path}_size`,
						val.size,
						{ type: 'primitive', name: 'float2' },
						shaderKind
					);
				}
			} else {
				let methodName = translateNumericToGLSL(expandedType.name);
				let loc = program.getUniformLocationCached(path);
				if (!Array.isArray(val)) {
					val = [val];
				}
				methodName = `uniform${methodName}v`;
				if (methodName.startsWith('uniformMatrix')) {
					// Transpose the matrix if TRANSPOSE_MATRICES_UNIFORM
					if (val.length == 4) {
						if (TRANSPOSE_MATRICES_UNIFORM) val = [val[0], val[2], val[1], val[3]];
					} else if (val.length == 9) {
						if (TRANSPOSE_MATRICES_UNIFORM)
							val = [val[0], val[3], val[6], val[1], val[4], val[7], val[2], val[5], val[8]];
					} else if (val.length == 16) {
						if (TRANSPOSE_MATRICES_UNIFORM)
							val = [
								val[0],
								val[4],
								val[8],
								val[12],
								val[1],
								val[5],
								val[9],
								val[13],
								val[2],
								val[6],
								val[10],
								val[14],
								val[3],
								val[7],
								val[11],
								val[15]
							];
					}
					(gl as any)[methodName](loc, false, val);
				} else {
					(gl as any)[methodName](loc, val);
				}
			}
		} else if (expandedType.type == 'buffer') {
		} else if (expandedType.type == 'struct') {
			for (let field of Object.keys(expandedType.fields)) {
				if (!val) {
					throw new Error(
						`Found null value for ${path}.${field} while passing to shader (nulls are not allowed)`
					);
				}
				setUniform(program, `${path}.${field}`, val[field], expandedType.fields[field], shaderKind);
			}
		}
	}

	dispatchDraw(
		dispatch: ShaderDispatch,
		options: { depthTest: boolean } = {
			depthTest: true
		}
	) {
		const gl = this.getGL();

		let pixelShader = dispatch.fragmentShader;
		let vertexShader = dispatch.vertexShader;
		if (!pixelShader || !vertexShader) {
			return;
		}

		let program = this.getProgramVertexPixel(
			vertexShader.uniqueSourceKey,
			vertexShader.payload[this.index],
			pixelShader.uniqueSourceKey,
			pixelShader.payload[this.index]
		);

		if (!program) {
			return;
		}

		// let err = gl.getError();
		// if (err != gl.NO_ERROR) {
		// 	throw new Error(`WebGL error: ${err}`);
		// }
		// let log = gl.getProgramInfoLog(program);
		// if (log) {
		// 	throw new Error(log + '\n\n' + vertexShader.code + '\n\n' + pixelShader.code);
		// }

		gl.useProgram(program);

		for (let k of dispatch.vertexUniforms.uniforms.keys()) {
			let val = dispatch.vertexUniforms.uniforms.get(k);
			if (!val) continue;
			k = k.replaceAll('_ext_uniform_global_', '_vertex_ext_uniform_global_');
			k = k.replaceAll('_ext_uniform_local_', '_vertex_ext_uniform_local_');
			this.setUniform(program, k, val.value, val.valueType, 'vertex');
		}

		for (let k of dispatch.fragmentUniforms.uniforms.keys()) {
			let val = dispatch.fragmentUniforms.uniforms.get(k);
			if (!val) continue;
			k = k.replaceAll('_ext_uniform_global_', '_pixel_ext_uniform_global_');
			k = k.replaceAll('_ext_uniform_local_', '_pixel_ext_uniform_local_');
			this.setUniform(program, k, val.value, val.valueType, 'pixel');
		}

		const geometry = dispatch.geometry;

		if (!geometry) {
			return;
		}

		let vao = gl.createVertexArray();
		gl.bindVertexArray(vao);

		function generateEmptyData(arr: number[], size: number, numItems: number) {
			if (arr.length == 0) {
				for (let i = 0; i < numItems * size; i++) {
					for (let j = 0; j < size; j++) arr.push(0);
				}
			}

			return arr;
		}

		let geoGl = geometry as typeof geometry & {
			_cacheGL?: {
				positionBuffer: WebGLBuffer | null;
				normalBuffer: WebGLBuffer | null;
				tangentBuffer: WebGLBuffer | null;
				bitangentBuffer: WebGLBuffer | null;
				uvBuffer: WebGLBuffer | null;
				colorBuffer: WebGLBuffer | null;
				indexBuffer: WebGLBuffer | null;
			};
		};

		let positionBuffer: WebGLBuffer | null;
		let normalBuffer: WebGLBuffer | null;
		let tangentBuffer: WebGLBuffer | null;
		let bitangentBuffer: WebGLBuffer | null;
		let uvBuffer: WebGLBuffer | null;
		let colorBuffer: WebGLBuffer | null;
		let indexBuffer: WebGLBuffer | null;

		if (geoGl._cacheGL) {
			positionBuffer = geoGl._cacheGL.positionBuffer;
			normalBuffer = geoGl._cacheGL.normalBuffer;
			tangentBuffer = geoGl._cacheGL.tangentBuffer;
			bitangentBuffer = geoGl._cacheGL.bitangentBuffer;
			uvBuffer = geoGl._cacheGL.uvBuffer;
			colorBuffer = geoGl._cacheGL.colorBuffer;
			indexBuffer = geoGl._cacheGL.indexBuffer;
		} else {
			let tris = geometry.getTriangles();

			positionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array(geometry.getVertices().flat()),
				gl.STATIC_DRAW
			);

			normalBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array(generateEmptyData(geometry.getNormals().flat(), 3, tris.length)),
				gl.STATIC_DRAW
			);

			tangentBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array(generateEmptyData(geometry.getTangents().flat(), 3, tris.length)),
				gl.STATIC_DRAW
			);

			bitangentBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, bitangentBuffer);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array(generateEmptyData(geometry.getBitangents().flat(), 3, tris.length)),
				gl.STATIC_DRAW
			);

			uvBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array(generateEmptyData(geometry.getUVs().flat(), 2, tris.length)),
				gl.STATIC_DRAW
			);

			colorBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array(generateEmptyData(geometry.getColors().flat(), 4, tris.length)),
				gl.STATIC_DRAW
			);

			indexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
			let indexArr = new Uint16Array(tris.length);

			for (let i = 0; i < tris.length; i += 3) {
				if (false) {
					indexArr[i] = tris[i + 2];
					indexArr[i + 1] = tris[i + 1];
					indexArr[i + 2] = tris[i];
				} else {
					indexArr[i] = tris[i];
					indexArr[i + 1] = tris[i + 1];
					indexArr[i + 2] = tris[i + 2];
				}
			}
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArr, gl.STATIC_DRAW);

			geoGl._cacheGL = {
				positionBuffer,
				normalBuffer,
				tangentBuffer,
				bitangentBuffer,
				uvBuffer,
				colorBuffer,
				indexBuffer
			};
		}

		let positionAttr = gl.getAttribLocation(program, 'a_position');
		let normalAttr = gl.getAttribLocation(program, 'a_normal');
		let tangentAttr = gl.getAttribLocation(program, 'a_tangent');
		let bitangentAttr = gl.getAttribLocation(program, 'a_bitangent');
		let uvAttr = gl.getAttribLocation(program, 'a_uv');
		let colorAttr = gl.getAttribLocation(program, 'a_color');

		gl.enable(gl.BLEND);
		if (options.depthTest) gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		if (positionAttr != -1) {
			gl.enableVertexAttribArray(positionAttr);
			gl.vertexAttribPointer(
				positionAttr, // location
				3, // size (components per iteration)
				gl.FLOAT, // type of to get from buffer
				false, // normalize
				0, // stride (bytes to advance each iteration)
				0 // offset (bytes from start of buffer)
			);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
		if (normalAttr != -1) {
			gl.enableVertexAttribArray(normalAttr);
			gl.vertexAttribPointer(
				normalAttr, // location
				3, // size (components per iteration)
				gl.FLOAT, // type of to get from buffer
				false, // normalize
				0, // stride (bytes to advance each iteration)
				0 // offset (bytes from start of buffer)
			);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer);
		if (tangentAttr != -1) {
			gl.enableVertexAttribArray(tangentAttr);
			gl.vertexAttribPointer(
				tangentAttr, // location
				3, // size (components per iteration)
				gl.FLOAT, // type of to get from buffer
				false, // normalize
				0, // stride (bytes to advance each iteration)
				0 // offset (bytes from start of buffer)
			);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, bitangentBuffer);
		if (bitangentAttr != -1) {
			gl.enableVertexAttribArray(bitangentAttr);
			gl.vertexAttribPointer(
				bitangentAttr, // location
				3, // size (components per iteration)
				gl.FLOAT, // type of to get from buffer
				false, // normalize
				0, // stride (bytes to advance each iteration)
				0 // offset (bytes from start of buffer)
			);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
		if (uvAttr != -1) {
			gl.enableVertexAttribArray(uvAttr);
			gl.vertexAttribPointer(
				uvAttr, // location
				2, // size (components per iteration)
				gl.FLOAT, // type of to get from buffer
				false, // normalize
				0, // stride (bytes to advance each iteration)
				0 // offset (bytes from start of buffer)
			);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		if (colorAttr != -1) {
			gl.enableVertexAttribArray(colorAttr);
			gl.vertexAttribPointer(
				colorAttr, // location
				4, // size (components per iteration)
				gl.FLOAT, // type of to get from buffer
				false, // normalize
				0, // stride (bytes to advance each iteration)
				0 // offset (bytes from start of buffer)
			);
		}

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

		gl.drawElements(gl.TRIANGLES, geometry.getTriangles().length, gl.UNSIGNED_SHORT, 0);

		// gl.deleteBuffer(positionBuffer);
		// gl.deleteBuffer(normalBuffer);
		// gl.deleteBuffer(uvBuffer);
		// gl.deleteBuffer(colorBuffer);
		// gl.deleteBuffer(indexBuffer);

		gl.deleteVertexArray(vao);

		// let errors = gl.getError();
		// if (errors) {
		// 	console.error(errors);
		// }
		// let log2 = gl.getProgramInfoLog(program);
		// if (log2) {
		// 	throw new Error(log2 + '\n\n' + vertexShader.code + '\n\n' + pixelShader.code);
		// }
	}

	dispatchDrawIndexed(
		dispatch: ShaderDispatch,
		options: { depthTest: boolean } = {
			depthTest: true
		}
	) {
		const gl = this.getGL();

		let pixelShader = dispatch.fragmentShader;
		let vertexShader = dispatch.vertexShader;
		if (!pixelShader || !vertexShader) {
			return;
		}

		let program = this.getProgramVertexPixel(
			vertexShader.uniqueSourceKey,
			vertexShader.payload[this.index],
			pixelShader.uniqueSourceKey,
			pixelShader.payload[this.index]
		);

		if (!program) {
			return;
		}

		gl.useProgram(program);

		for (let k of dispatch.vertexUniforms.uniforms.keys()) {
			let val = dispatch.vertexUniforms.uniforms.get(k);
			if (!val) continue;
			k = k.replaceAll('_ext_uniform_global_', '_vertex_ext_uniform_global_');
			k = k.replaceAll('_ext_uniform_local_', '_vertex_ext_uniform_local_');
			this.setUniform(program, k, val.value, val.valueType, 'vertex');
		}

		for (let k of dispatch.fragmentUniforms.uniforms.keys()) {
			let val = dispatch.fragmentUniforms.uniforms.get(k);
			if (!val) continue;
			k = k.replaceAll('_ext_uniform_global_', '_pixel_ext_uniform_global_');
			k = k.replaceAll('_ext_uniform_local_', '_pixel_ext_uniform_local_');
			this.setUniform(program, k, val.value, val.valueType, 'pixel');
		}

		const indexBuffer = dispatch.indexBuffer;

		if (!indexBuffer) {
			return;
		}

		// let vertexIdLoc = gl.getAttribLocation(program, '_a_vertex_id');

		// gl.enableVertexAttribArray(vertexIdLoc);

		// gl.bindBuffer(gl.ARRAY_BUFFER, this.getOrCreateBuffer(indexBuffer, gl.ARRAY_BUFFER));

		// const size = 1; // 1 components per iteration
		// const type = gl.UNSIGNED_INT; // the data is 32bit uint
		// const normalize = false; // don't normalize the data
		// const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
		// const offset = 0; // start at the beginning of the buffer
		// gl.vertexAttribPointer(vertexIdLoc, size, type, normalize, stride, offset);

		// let vao = gl.createVertexArray();
		// gl.bindVertexArray(vao);

		function generateEmptyData(arr: number[], size: number, numItems: number) {
			if (arr.length == 0) {
				for (let i = 0; i < numItems * size; i++) {
					for (let j = 0; j < size; j++) arr.push(0);
				}
			}

			return arr;
		}

		gl.enable(gl.BLEND);
		if (options.depthTest) gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		gl.drawArrays(gl.TRIANGLES, 0, indexBuffer.len());

		// gl.deleteVertexArray(vao);
	}

	dispatchDrawCount(
		dispatch: ShaderDispatch,
		options: { depthTest: boolean } = {
			depthTest: true
		}
	) {
		const gl = this.getGL();

		let pixelShader = dispatch.fragmentShader;
		let vertexShader = dispatch.vertexShader;
		if (!pixelShader || !vertexShader) {
			return;
		}

		let program = this.getProgramVertexPixel(
			vertexShader.uniqueSourceKey,
			vertexShader.payload[this.index],
			pixelShader.uniqueSourceKey,
			pixelShader.payload[this.index]
		);

		if (!program) {
			return;
		}

		gl.useProgram(program);

		for (let k of dispatch.vertexUniforms.uniforms.keys()) {
			let val = dispatch.vertexUniforms.uniforms.get(k);
			if (!val) continue;
			k = k.replaceAll('_ext_uniform_global_', '_vertex_ext_uniform_global_');
			k = k.replaceAll('_ext_uniform_local_', '_vertex_ext_uniform_local_');
			this.setUniform(program, k, val.value, val.valueType, 'vertex');
		}

		for (let k of dispatch.fragmentUniforms.uniforms.keys()) {
			let val = dispatch.fragmentUniforms.uniforms.get(k);
			if (!val) continue;
			k = k.replaceAll('_ext_uniform_global_', '_pixel_ext_uniform_global_');
			k = k.replaceAll('_ext_uniform_local_', '_pixel_ext_uniform_local_');
			this.setUniform(program, k, val.value, val.valueType, 'pixel');
		}

		gl.enable(gl.BLEND);
		if (options.depthTest) gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		gl.drawArrays(gl.TRIANGLES, 0, dispatch.drawCount * 3);
	}

	getOrCreateBuffer(buf: buffer<any>, binding: number): WebGLBuffer {
		const gl = this.getGL();

		if (buf.platformPayload) {
			return buf.platformPayload as WebGLBuffer;
		}

		let buffer = gl.createBuffer();
		if (!buffer) {
			throw new Error('Could not create buffer');
		}
		gl.bindBuffer(binding, buffer);

		if (buf.structured) {
			// todo
		} else {
			gl.bufferData(
				binding,
				buf.uintArray ?? buf.floatArray ?? buf.intArray ?? new Uint8Array(0),
				gl.STATIC_DRAW
			);
		}

		buf.platformPayload = buffer;

		return buffer;
	}

	dispatch(
		dispatch: ShaderDispatch,
		options: { depthTest: boolean } = {
			depthTest: true
		}
	): void {
		super.dispatch(dispatch, options);
		if (dispatch.type == 'draw') {
			this.activateDrawContext();
			this.triggerEvent('draw', dispatch);
			if (dispatch.drawType == 'indexed') {
				this.dispatchDrawIndexed(dispatch, options);
			} else if (dispatch.drawType == 'count') {
				this.dispatchDrawCount(dispatch, options);
			} else {
				this.dispatchDraw(dispatch, options);
			}
		}
	}

	genNativeShader(code: string, type: number) {
		const gl = this.getGL();
		let shader = gl.createShader(type);
		if (!shader) {
			throw new Error('Could not create shader');
		}
		gl.shaderSource(shader, code);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log('Code', code);
			console.error('Shader compile error', gl.getShaderInfoLog(shader));
		}

		return shader;
	}
}
