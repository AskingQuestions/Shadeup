import type { IndexMapping } from '../../../../shadeup-frontend/lib/generator/root';

import {
	UniformValue,
	type GenericShader,
	type GraphicsAdapter,
	type ShaderCodeMapping,
	type ShaderType,
	type UniformPayload,
	type ShaderParamsMapping,
	type ShaderBindingOptions
} from './adapters/adapter';
import { translateIdentifier } from './util';
import { parse_type, getGl } from './util';
const simpleHash = (str: string) => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash &= hash; // Convert to 32bit integer
	}
	return new Uint32Array([hash])[0].toString(36);
};

export class ShadeupShaderInstance {
	parent: ShadeupShaderSource;
	bindings: any;
	key: string;
	version: number;

	constructor(parentSource: ShadeupShaderSource, bindings: any, key: string) {
		this.parent = parentSource;
		this.bindings = bindings;
		this.key = key;
		this.version = 0;
	}

	getKey() {
		return `${this.key}_${this.version}`;
	}

	get(
		adapter: GraphicsAdapter,
		type: ShaderType,
		config?: ShaderBindingOptions
	): GenericShader | null {
		let shade = adapter.getOrCreateShader(this, type, config);
		shade.uniqueSourceKey = this.getKey();
		return shade;
	}

	bindUniforms(to: UniformPayload) {
		for (let k of Object.keys(this.parent.params.webgl)) {
			let paramType = this.parent.params.webgl[k];
			let val = this.bindings[k];

			let uniVal = new UniformValue(paramType, val);

			let uniformName = translateIdentifier(k);

			to.uniforms.set(uniformName, uniVal);
		}
	}
}

export class ShadeupShaderSource {
	code: ShaderCodeMapping;
	params: ShaderParamsMapping;
	types: { [key: string]: any };
	arraySizes: { [key: string]: any };
	indexMapping: IndexMapping;
	key: string;

	constructor(params: ShaderParamsMapping, code: ShaderCodeMapping, indexMapping: IndexMapping) {
		this.code = code;
		this.params = params;
		this.indexMapping = indexMapping;
		this.types = {};
		this.arraySizes = {};
		this.key = simpleHash(JSON.stringify(code));
	}

	instance(bindings: any) {
		return new ShadeupShaderInstance(this, bindings, this.key);
	}
}
