const BaseGenerator = require("./base.js");
const { RemoveFrontWhitespace } = require("../util.js");
const util = require("../util.js");

class ShaderGenerator extends BaseGenerator {
	verify() {
		super.verify();

		if (this.shaders.length == 0) {
			this.error(this.data, "You must include at least one shader for this definition. (Did you forget to add Shader = {}; ?)");
		}

		let includesMain = false;

		for (let shader of this.shaders) {
			let code = shader.code.text;

			if (code.includes("void Main")) {
				if (includesMain) {
					this.error(shader.code, "You can only have one shader with a main function");
				}

				includesMain = true;
			}
		}

		if (!includesMain) {
			this.error(this.shaders[this.shaders.length - 1], "Shaders must contain a void Main() function");
		}

		this.parameters = [];

		let rawParams = this.prop("Parameters", []);

		for (let param of rawParams) {
			this.checkKey(param, "Name", "string", "Shader parameters must have a name of type string");
			let name = param.value().Name.value();

			this.checkKey(param, "Type", ["identifier", "block"], "Shader parameters must have a type");
			let type = param.value().Type.value();

			let ro = param.value().ReadOnly;
			let paramData = {};

			if (param.value().Type.type === "identifier") {
				paramData = {
					name,
					readOnly: (ro ? ro.value() : false),
					cppType: util.TypeToCPP(type),
					hlslType: util.TypeToHLSL(type),
					data: param
				};
			}else{
				let subBlock = param.value().Type;
				this.checkKey(subBlock, "CPU", "identifier", "Type definition must have a CPU type (did you forget to add CPU = FVector/float/...?)");
				this.checkKey(subBlock, "GPU", "identifier", "Type definition must have a GPU type (did you forget to add CPU = float3/float/...?)");

				paramData = {
					name,
					readOnly: (ro ? ro.value() : false),
					cppType: subBlock.value().CPU.value(),
					hlslType: subBlock.value().GPU.value(),
					data: param
				};
			}

			let d = util.ExtractTemplate(paramData.cppType);
			if (d.name == "RWTexture2D" || d.name == "RWTexture3D" || d.name == "RWTexture1D") {
				paramData.realCppType = "UTextureRenderTarget*";
				paramData.baseType = "RenderTarget";
			}else if (d.name == "Texture2D" || d.name == "Texture3D") {
				paramData.realCppType = "UTexture*";
				paramData.baseType = "Texture";
			}else if (d.name == "StructuredBuffer") {
				paramData.realCppType = `TArray<${d.template}>`;
				paramData.baseType = "Buffer";
			}else{
				paramData.realCppType = paramData.cppType;
				paramData.baseType = "Real";
			}

			this.parameters.push(paramData);
		}
	}
	
	generate() {
		super.generate();
	}

	shader() {
		let code = "";

		for (let shader of this.shaders) {
			code += RemoveFrontWhitespace(shader.code.text.replace("void Main", "void " + this.name));
		}

		return code;
	}

	parameterStruct() {
		let output = [];

		for (let param of this.parameters) {
			let d = util.ExtractTemplate(param.cppType);
			let paramTemplate = "SHADER_PARAMETER";
			if (d.name == "RWTexture2D" || d.name == "RWTexture3D" || d.name == "RWTexture1D" || d.name == "StructuredBuffer") {
				if (param.readOnly) {
					paramTemplate = "SHADER_PARAMETER_SRV";
				}else{
					paramTemplate = "SHADER_PARAMETER_UAV";
				}
			}else if (d.name == "Texture2D" || d.name == "Texture3D") {
				paramTemplate = "SHADER_PARAMETER_TEXTURE";
			}
			output.push(`${paramTemplate}(${param.cppType}, ${param.name})`);
		}

		return output;
	}
}

module.exports = ShaderGenerator;