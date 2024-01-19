const TYPE_TABLE = {
	"half": "half",
	"float": "float",
	"double": "double",
	"int": "int",
	"uint": "uint",
	"bool": "bool",
	"float2": "FVector2D",
	"float3": "FVector",
	"float4": "FVector4",
	"float4x4": "FMatrix",
};

const REVERSE_TYPE_TABLE = Object.entries(TYPE_TABLE).reduce((acc, [key, value]) => {
	acc[value] = key;
	return acc;
}, {});

export default {
	RemoveFrontWhitespace: function(str) {
		let lines = str.split("\n");
		let minChars = Infinity;
		for (let l of lines) {
			if ((/^\s*$/.test(l))) {
				continue;
			}
			let chars = l.length - l.trimLeft().length;
			
			if (chars < minChars) {
				minChars = chars;
			}
		}

		let regex = new RegExp("^\\s{" + minChars + "}", "gm");

		for (let i = 0; i < lines.length; i++) {
			lines[i] = lines[i].replace(regex, "");
		}

		return lines.join("\n");
	},
	ExtractTemplate(type) {
		let m = type.match(/^([A-Za-z_0-9]+)(<[A-Za-z_0-9<>]+>)?$/);
		let name = m[1];
		let template = m[2];

		return {name, template};
	},
	ConvertType(type, tab) {
		let d = this.ExtractTemplate(type);

		if (d.template) {
			return d.name + "<" + this.ConvertType(d.template.substring(1, d.template.length - 1), tab) + ">";
		}else{
			return tab[d.name] || d.name;
		}
	},
	TypeToCPP(type) {
		return this.ConvertType(type, TYPE_TABLE);
	},
	TypeToHLSL(type) {
		return this.ConvertType(type, REVERSE_TYPE_TABLE);
	}
};