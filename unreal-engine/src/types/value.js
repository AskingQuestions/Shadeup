export default class ParsedValue {
	constructor(file, data) {
		this.file = file;
		this.data = data;
		
		this.type = data.value.type;
	}

	value() {
		if (this.type == "number") {
			return parseFloat(this.data.value.text);
		}else if (this.type == "string") {
			return this.data.value.text;
		}else if (this.type == "boolean") {
			return this.data.value.value;
		}else if (this.type == "identifier") {
			return this.data.value.text;
		}else if (this.type == "array") {
			return this.data.value.values.map(v => {
				let pv = new ParsedValue(this.file, v);
				return pv;
			});
		}else if (this.type == "block") {
			let props = {};
			props.$data = this.data;
			for (let prop of this.data.value.items) {
				if (prop.type == "property") {
					let name = prop.identifier.text;
					let value = new ParsedValue(this.file, prop.value);
					props[name] = value;
				}
			}

			return props;
		}
	}

	flatten() {
		if (this.type == "array") {
			return this.value().map(v => v.flatten());
		}else if (this.type == "block") {
			let v = this.value();
			for (let k of Object.keys(v)) {
				v[k] = v[k].flatten();
			}
			return v;
		}else{
			return this.value();
		}
	}

	error(context, message) {
		this.file.error(context, message);
	}

	getType(value) {
		let t = typeof value;
		if (t === "object") {
			if (Array.isArray(t)) {
				return "array";
			}
		}

		return t;
	}
}