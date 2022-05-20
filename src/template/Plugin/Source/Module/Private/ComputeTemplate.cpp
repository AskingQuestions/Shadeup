#include "${NAME}.h"
#include "PixelShaderUtils.h"
#include "RenderCore/Public/RenderGraphUtils.h"
#include "MeshPassProcessor.inl"
#include "StaticMeshResources.h"
#include "DynamicMeshBuilder.h"
#include "RenderGraphResources.h"
#include "GlobalShader.h"
#include "UnifiedBuffer.h"
#include "CanvasTypes.h"
#include "MaterialShader.h"

/**********************************************************************************************/
/* This class carries our parameter declarations and acts as the bridge between cpp and HLSL. */
/**********************************************************************************************/
class ${SCOPE} F${CLASS_NAME} : public ${instance.prop("ExtendMaterial", false) ? "FMeshMaterialShader" : "FGlobalShader"}
{
public:
	${instance.prop("ExtendMaterial", false) ? `
	DECLARE_SHADER_TYPE(F${CLASS_NAME}, MeshMaterial);
	SHADER_USE_PARAMETER_STRUCT_WITH_LEGACY_BASE(F${CLASS_NAME}, FMeshMaterialShader)
	` : `
	DECLARE_GLOBAL_SHADER(F${CLASS_NAME});
	SHADER_USE_PARAMETER_STRUCT(F${CLASS_NAME}, FGlobalShader);
	`
	}
	
	class F${CLASS_NAME}_Perm_TEST : SHADER_PERMUTATION_INT("TEST", 1);
	using FPermutationDomain = TShaderPermutationDomain<
		F${CLASS_NAME}_Perm_TEST
	>;

	

	BEGIN_SHADER_PARAMETER_STRUCT(FParameters, )
		${instance.parameterStruct().join("\n\t\t")}
	END_SHADER_PARAMETER_STRUCT()

public:
	static bool ShouldCompilePermutation(const F${instance.ShaderBase}ShaderPermutationParameters& Parameters)
	{
		const FPermutationDomain PermutationVector(Parameters.PermutationId);
		
		return true;
	}

	static void ModifyCompilationEnvironment(const F${instance.ShaderBase}ShaderPermutationParameters& Parameters, FShaderCompilerEnvironment& OutEnvironment)
	{
		F${instance.ShaderBase}Shader::ModifyCompilationEnvironment(Parameters, OutEnvironment);

		const FPermutationDomain PermutationVector(Parameters.PermutationId);

		OutEnvironment.SetDefine(TEXT("SHADEUP_VERSION_MAJOR"), TEXT("0"));
		OutEnvironment.SetDefine(TEXT("SHADEUP_VERSION_MINOR"), TEXT("1"));

		// This shader must support typed UAV load and we are testing if it is supported at runtime using RHIIsTypedUAVLoadSupported
		//OutEnvironment.CompilerFlags.Add(CFLAG_AllowTypedUAVLoads);

		// FForwardLightingParameters::ModifyCompilationEnvironment(Parameters.Platform, OutEnvironment);
	}

	${PUBLIC_CODE}
private:
	${PRIVATE_CODE}
};

// This will tell the engine to create the shader and where the shader entry point is.
//                            ShaderType                            ShaderPath                     Shader function name    Type
${instance.prop("ExtendMaterial", false) ?
`IMPLEMENT_MATERIAL_SHADER_TYPE(, F${CLASS_NAME}, TEXT("/${MODULE_NAME}Shaders/${NAME}.usf"), TEXT("${NAME}"), SF_Compute);`
:
`IMPLEMENT_GLOBAL_SHADER(F${CLASS_NAME}, "/${MODULE_NAME}Shaders/${NAME}.usf", "${NAME}", SF_Compute);`
}

void F${CLASS_NAME}Context::DispatchRenderThread(FRHICommandListImmediate& RHICmdList, LocalDrawParameters Params, int x, int y, int z) {
	// RHICmdList.TransitionResource(EResourceTransitionAccess::ERWBarrier, EResourceTransitionPipeline::EGfxToCompute, ComputeShaderOutputUAV);

	F${CLASS_NAME}::FParameters PassParameters;

	${
	instance.parameters.map(p =>
	(({
	"RenderTarget": `
	// FTextureReferenceRHIRef ${p.name}RenderTargetTextureRHI = this->${p.name}->TextureReference.TextureReferenceRHI;
	// if (${p.name}RenderTargetTextureRHI == nullptr) {
	// 	return;
	// }
	// checkf(${p.name}RenderTargetTextureRHI != nullptr, TEXT("Can't get render target %d texture"));

	// FRHITexture* ${p.name}RenderTargetTextureRef = ${p.name}RenderTargetTextureRHI->GetTextureReference()->GetReferencedTexture();

	// PassParameters.${p.name} = RHICreateUnorderedAccessView(${p.name}RenderTargetTextureRHI);

	auto reso${p.name} = Params.${p.name}->GetRenderTargetResource();
	auto reso2d${p.name} = reso${p.name}->GetTextureRenderTarget2DResource();
	
	PassParameters.${p.name} = RHICreateUnorderedAccessView(reso2d${p.name}->GetTextureRHI());
	`,
	"Texture": `PassParameters.${p.name} = Params.${p.name}->GetResource()->GetTexture2DRHI();`,
	"Buffer": `PassParameters.${p.name} = Params.${p.name};`,
	"Real": `PassParameters.${p.name} = Params.${p.name};`,
	})[p.baseType])
	).join('\n\t')
	}
	
	typename F${CLASS_NAME}::FPermutationDomain PermutationVector;

	TShaderMapRef<F${CLASS_NAME}> ComputeShader(GetGlobalShaderMap(GMaxRHIFeatureLevel), PermutationVector);
	FIntVector GroupCounts = FIntVector(FMath::DivideAndRoundUp(x, NUM_THREADS_${CLASS_NAME}_X), FMath::DivideAndRoundUp(y, NUM_THREADS_${CLASS_NAME}_Y), FMath::DivideAndRoundUp(z, NUM_THREADS_${CLASS_NAME}_Z));

	FComputeShaderUtils::Dispatch(RHICmdList, ComputeShader, PassParameters, GroupCounts);
}