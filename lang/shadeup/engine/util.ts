type ExpandedType = { name: string; generics: ExpandedType[] };

export function parse_type(type: string): ExpandedType {
	let name = '';
	let generics = [];
	let generic = '';
	let depth = 0;
	for (let i = 0; i < type.length; i++) {
		let c = type[i];
		if (c == '<') {
			depth += 1;
			if (depth == 1) {
				continue;
			}
		} else if (c == '>') {
			depth -= 1;
			if (depth == 0) {
				generics.push(parse_type(generic));
				generic = '';
				continue;
			}
		} else if (c == ',' && depth == 1) {
			generics.push(parse_type(generic));
			generic = '';
			continue;
		}

		if (depth == 0) {
			name += c;
		} else {
			generic += c;
		}
	}

	return {
		name: name,
		generics: generics
	};
}

export function stringify_type(type: ExpandedType): string {
	return `${type.name}${
		type.generics.length > 0 ? '<' + type.generics.map(stringify_type).join(',') + '>' : ''
	}`;
}

export function translateNumericToGLSL(type: string): string | null {
	if (type == 'float2x2') {
		return 'Matrix2f';
	} else if (type == 'float3x3') {
		return 'Matrix3f';
	} else if (type == 'float4x4') {
		return 'Matrix4f';
	}

	let matches = type.match(/^([A-Za-z]+)(\d)?$/);
	if (!matches) {
		return null;
	}
	let base = matches[1];
	let size = matches[2] ? parseInt(matches[2]) : 1;
	let type_name = '';

	switch (base) {
		case 'float':
			type_name = 'f';
			break;
		case 'int':
			type_name = 'i';
			break;
		case 'uint':
			type_name = 'i';
			break;
		case 'bool':
			type_name = 'i';
			break;
		default:
			return null;
	}

	return `${size}${type_name}`;
}

export function translate_type_for_uniform(type: ExpandedType): string | null {
	if (type.name == 'array') {
		let inner = translate_type_for_uniform(type.generics[0]);
		return `${inner}[]`;
	} else {
		return translateNumericToGLSL(type.name);
	}
}

export function translateIdentifier(str: string) {
	return str.replace(/\_\_\_/g, '_ii_').replace(/\_\_/g, '_i_');
}

export function getGl(): WebGL2RenderingContext {
	return (window as any).gl;
}
