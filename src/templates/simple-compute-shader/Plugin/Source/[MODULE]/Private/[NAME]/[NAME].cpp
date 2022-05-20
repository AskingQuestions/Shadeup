#include "${NAME}.h"
#include "${MODULE_NAME}/Public/${NAME}/${NAME}.h"
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
class ${SCOPE} F${NAME} : public ${instance.material ? "FMeshMaterialShader" : "FGlobalShader"}
{
public:
	${instance.material ? `
	DECLARE_SHADER_TYPE(F${NAME}, MeshMaterial);
	SHADER_USE_PARAMETER_STRUCT_WITH_LEGACY_BASE(F${NAME}, FMeshMaterialShader)
	` : `
	DECLARE_GLOBAL_SHADER(F${NAME});
	SHADER_USE_PARAMETER_STRUCT(F${NAME}, FGlobalShader);
	`
	}
	
	class F${NAME}_Perm_TEST : SHADER_PERMUTATION_INT("TEST", 1);
	using FPermutationDomain = TShaderPermutationDomain<
		F${NAME}_Perm_TEST
	>;

	

	BEGIN_SHADER_PARAMETER_STRUCT(FParameters, )
		/*
		* Here's where you define one or more of the input parameters for your shader.
		* Some examples:
		*/
		// SHADER_PARAMETER(uint32, MyUint32) // On the shader side: uint32 MyUint32;
		// SHADER_PARAMETER(FVector3f, MyVector) // On the shader side: float3 MyVector;

		// SHADER_PARAMETER_TEXTURE(Texture2D, MyTexture) // On the shader side: Texture2D<float4> MyTexture; (float4 should be whatever you expect each pixel in the texture to be, in this case float4(R,G,B,A) for 4 channels)
		// SHADER_PARAMETER_SAMPLER(SamplerState, MyTextureSampler) // On the shader side: SamplerState MySampler; // CPP side: TStaticSamplerState<ESamplerFilter::SF_Bilinear>::GetRHI();

		// SHADER_PARAMETER_ARRAY(float, MyFloatArray, [3]) // On the shader side: float MyFloatArray[3];

		// SHADER_PARAMETER_UAV(RWTexture2D<float4>, MyTextureUAV) // On the shader side: RWTexture2D<float4> MyTextureUAV;
		// SHADER_PARAMETER_UAV(RWStructuredBuffer<FMyCustomStruct>, MyCustomStructs) // On the shader side: RWStructuredBuffer<FMyCustomStruct> MyCustomStructs;
		// SHADER_PARAMETER_UAV(RWBuffer<FMyCustomStruct>, MyCustomStructs) // On the shader side: RWBuffer<FMyCustomStruct> MyCustomStructs;

		// SHADER_PARAMETER_SRV(StructuredBuffer<FMyCustomStruct>, MyCustomStructs) // On the shader side: StructuredBuffer<FMyCustomStruct> MyCustomStructs;
		// SHADER_PARAMETER_SRV(Buffer<FMyCustomStruct>, MyCustomStructs) // On the shader side: Buffer<FMyCustomStruct> MyCustomStructs;
		// SHADER_PARAMETER_SRV(Texture2D<float4>, MyReadOnlyTexture) // On the shader side: Texture2D<MyReadOnlyTexture> MyReadOnlyTexture;

		// SHADER_PARAMETER_STRUCT_REF(FMyCustomStruct, MyCustomStruct)

		${instance.example == "pi" ? `
		SHADER_PARAMETER(float, Seed)
		SHADER_PARAMETER_UAV(RWBuffer<uint32>, Output)
		` : ""}

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

		/*
		* Here you define constants that can be used statically in the shader code.
		* Example:
		*/
		// OutEnvironment.SetDefine(TEXT("MY_CUSTOM_CONST"), TEXT("1"));

		/*
		* These defines are used in the thread count section of our shader
		*/
		OutEnvironment.SetDefine(TEXT("THREADS_X"), NUM_THREADS_${NAME}_X);
		OutEnvironment.SetDefine(TEXT("THREADS_Y"), NUM_THREADS_${NAME}_Y);
		OutEnvironment.SetDefine(TEXT("THREADS_Z"), NUM_THREADS_${NAME}_Z);

		// This shader must support typed UAV load and we are testing if it is supported at runtime using RHIIsTypedUAVLoadSupported
		//OutEnvironment.CompilerFlags.Add(CFLAG_AllowTypedUAVLoads);

		// FForwardLightingParameters::ModifyCompilationEnvironment(Parameters.Platform, OutEnvironment);
	}
private:
};

// This will tell the engine to create the shader and where the shader entry point is.
//                            ShaderType                            ShaderPath                     Shader function name    Type
${instance.material ?
`IMPLEMENT_MATERIAL_SHADER_TYPE(, F${NAME}, TEXT("/${MODULE_NAME}Shaders/${NAME}/${NAME}.usf"), TEXT("${NAME}"), SF_Compute);`
:
`IMPLEMENT_GLOBAL_SHADER(F${NAME}, "/${MODULE_NAME}Shaders/${NAME}/${NAME}.usf", "${NAME}", SF_Compute);`
}

void F${NAME}Interface::DispatchRenderThread(FRHICommandListImmediate& RHICmdList, F${NAME}DispatchParams& Params) {
	// RHICmdList.TransitionResource(EResourceTransitionAccess::ERWBarrier, EResourceTransitionPipeline::EGfxToCompute, ComputeShaderOutputUAV);

	F${NAME}::FParameters PassParameters;
	
	// Set the shader parameters using the data from the Params passed in

	${instance.example == "pi" ? `
	FRHIResourceCreateInfo CreateInfo(TEXT("PIOutputBuffer"));

	TResourceArray<uint32> ResourceArray;
	ResourceArray.SetNumZeroed(1);
	CreateInfo.ResourceArray = &ResourceArray;

	auto OutputBuffer = RHICreateBuffer(1 * sizeof(uint32), BUF_UnorderedAccess | BUF_ShaderResource, sizeof(uint32), ERHIAccess::UAVCompute, CreateInfo);

	auto OutputUAV = RHICreateUnorderedAccessView(OutputBuffer, false, false);
	PassParameters.Output = OutputUAV;
	PassParameters.Seed = Params.Seed;

	uint32* InitialData = (uint32*)RHILockBuffer(OutputBuffer, 0, sizeof(uint32) * 1, RLM_WriteOnly);
	InitialData[0] = 0;
	RHIUnlockBuffer(OutputBuffer);

	PassParameters.Output = RHICreateUnorderedAccessView(OutputBuffer, false, false);
	` : ""}
	
	typename F${NAME}::FPermutationDomain PermutationVector;

	TShaderMapRef<F${NAME}> ComputeShader(GetGlobalShaderMap(GMaxRHIFeatureLevel), PermutationVector);
	FIntVector GroupCounts = FIntVector(FMath::DivideAndRoundUp(Params.X, NUM_THREADS_${NAME}_X), FMath::DivideAndRoundUp(Params.Y, NUM_THREADS_${NAME}_Y), FMath::DivideAndRoundUp(Params.Z, NUM_THREADS_${NAME}_Z));

	FComputeShaderUtils::Dispatch(RHICmdList, ComputeShader, PassParameters, GroupCounts);
	
	${instance.example == "pi" ? `
	auto OutputData = (uint32*) RHILockBuffer(OutputBuffer, 0, sizeof(uint32) * 1, RLM_ReadOnly);
	Params.TotalInCircle = OutputData[0];
	RHIUnlockBuffer(OutputBuffer);
	` : ""}
}