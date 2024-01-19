export class ShadeupExternalSymbol {
	name: string = '';
	kind: string = '';

	outType: string = '';
	parameters: [string, string, boolean][] = [];

	fields: [string, string][] = [];
	methods: ShadeupExternalSymbol[] = [];

	js: string = '';

	constructor(name: string, kind: string) {
		this.name = name;
		this.kind = kind;
	}

	static makeFunction(
		name: string,
		outType: string,
		parameters: [string, string, boolean][],
		source: string
	): ShadeupExternalSymbol {
		let symbol = new ShadeupExternalSymbol(name, 'function');
		symbol.outType = outType;
		symbol.parameters = parameters;
		symbol.js = source;

		return symbol;
	}

	static makeVariable(name: string, outType: string): ShadeupExternalSymbol {
		const symbol = new ShadeupExternalSymbol(name, 'variable');
		symbol.outType = outType;
		return symbol;
	}

	static makeType(
		name: string,
		fields: [string, string][],
		methods: ShadeupExternalSymbol[]
	): ShadeupExternalSymbol {
		let symbol = new ShadeupExternalSymbol(name, 'type');
		symbol.fields = fields;
		symbol.methods = methods;
		return symbol;
	}
}
