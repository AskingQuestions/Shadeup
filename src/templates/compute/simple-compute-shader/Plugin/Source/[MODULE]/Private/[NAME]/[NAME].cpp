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

DECLARE_STATS_GROUP(TEXT("${NAME}"), STATGROUP_${NAME}, STATCAT_Advanced);
DECLARE_CYCLE_STAT(TEXT("${NAME} Execute"), STAT_${NAME}_Execute, STATGROUP_${NAME});

// This class carries our parameter declarations and acts as the bridge between cpp and HLSL.
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

		// SHADER_PARAMETER_UAV(RWTexture2D<FVector4f>, MyTextureUAV) // On the shader side: RWTexture2D<float4> MyTextureUAV;
		// SHADER_PARAMETER_UAV(RWStructuredBuffer<FMyCustomStruct>, MyCustomStructs) // On the shader side: RWStructuredBuffer<FMyCustomStruct> MyCustomStructs;
		// SHADER_PARAMETER_UAV(RWBuffer<FMyCustomStruct>, MyCustomStructs) // On the shader side: RWBuffer<FMyCustomStruct> MyCustomStructs;

		// SHADER_PARAMETER_SRV(StructuredBuffer<FMyCustomStruct>, MyCustomStructs) // On the shader side: StructuredBuffer<FMyCustomStruct> MyCustomStructs;
		// SHADER_PARAMETER_SRV(Buffer<FMyCustomStruct>, MyCustomStructs) // On the shader side: Buffer<FMyCustomStruct> MyCustomStructs;
		// SHADER_PARAMETER_SRV(Texture2D<FVector4f>, MyReadOnlyTexture) // On the shader side: Texture2D<float4> MyReadOnlyTexture;

		// SHADER_PARAMETER_STRUCT_REF(FMyCustomStruct, MyCustomStruct)

		${instance.example == "pi" ? `
		SHADER_PARAMETER(float, Seed)
		SHADER_PARAMETER_RDG_BUFFER_UAV(RWBuffer<uint32>, Output)
		` : ""}${instance.example == "base" ? `
		SHADER_PARAMETER_RDG_BUFFER_SRV(Buffer<int>, Input)
		SHADER_PARAMETER_RDG_BUFFER_UAV(RWBuffer<int>, Output)
		` : ""}${instance.example == "rt" ? `
		SHADER_PARAMETER_RDG_TEXTURE_UAV(RWTexture2D, RenderTarget)
		` : ""}${instance.example == "mat" ? `
		SHADER_PARAMETER_RDG_TEXTURE_UAV(RWTexture2D, RenderTarget)
		` : ""}${instance.example == "basemat" ? `
		SHADER_PARAMETER(FVector2f, Position)
		SHADER_PARAMETER_RDG_BUFFER_UAV(RWBuffer<float4>, OutputColor)
		` : ""}

	END_SHADER_PARAMETER_STRUCT()

public:
	static bool ShouldCompilePermutation(const F${instance.ShaderBase}ShaderPermutationParameters& Parameters)
	{
		const FPermutationDomain PermutationVector(Parameters.PermutationId);
		${instance.material ? `
		const bool bIsCompatible =
			Parameters.MaterialParameters.MaterialDomain == MD_Surface
			&& Parameters.MaterialParameters.BlendMode == BLEND_Opaque
			&& Parameters.MaterialParameters.ShadingModels == MSM_DefaultLit
			&& Parameters.MaterialParameters.bIsUsedWithVirtualHeightfieldMesh;

		return bIsCompatible;` : ``}
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

void F${NAME}Interface::DispatchRenderThread(FRHICommandListImmediate& RHICmdList, F${NAME}DispatchParams Params${ifExample(['base', 'pi', 'basemat'], `, TFunction<void(${ifExample(['base', 'pi'], "int OutputVal")}${ifExample(['basemat'], "FVector3f OutputColor")})> AsyncCallback`)}) {
	FRDGBuilder GraphBuilder(RHICmdList);

	{
		SCOPE_CYCLE_COUNTER(STAT_${NAME}_Execute);
		DECLARE_GPU_STAT(${NAME})
		RDG_EVENT_SCOPE(GraphBuilder, "${NAME}");
		RDG_GPU_STAT_SCOPE(GraphBuilder, ${NAME});
		${instance.material ? `
		const FScene* LocalScene = Params.Scene;
		const FMaterialRenderProxy* MaterialRenderProxy = nullptr;
		const FMaterial* MaterialResource = &Params.MaterialRenderProxy->GetMaterialWithFallback(GMaxRHIFeatureLevel, MaterialRenderProxy);
		MaterialRenderProxy = MaterialRenderProxy ? MaterialRenderProxy : Params.MaterialRenderProxy;

		typename F${NAME}::FPermutationDomain PermutationVector;

		// Add any static permutation options here
		// PermutationVector.Set<F${NAME}::FMyPermutationName>(12345);
		
		TShaderRef<F${NAME}> ComputeShader = MaterialResource->GetShader<F${NAME}>(&FLocalVertexFactory::StaticType, PermutationVector, false);
		` : `
		typename F${NAME}::FPermutationDomain PermutationVector;
		
		// Add any static permutation options here
		// PermutationVector.Set<F${NAME}::FMyPermutationName>(12345);

		TShaderMapRef<F${NAME}> ComputeShader(GetGlobalShaderMap(GMaxRHIFeatureLevel), PermutationVector);
		`}

		bool bIsShaderValid = ComputeShader${instance.material ? `.` : `.`}IsValid();

		if (bIsShaderValid) {
			F${NAME}::FParameters* PassParameters = GraphBuilder.AllocParameters<F${NAME}::FParameters>();

			${ifExample(['rt', 'mat'], `
			FRDGTextureDesc Desc(FRDGTextureDesc::Create2D(Params.RenderTarget->GetSizeXY(), PF_B8G8R8A8, FClearValueBinding::White, TexCreate_RenderTargetable | TexCreate_ShaderResource | TexCreate_UAV));
			FRDGTextureRef TmpTexture = GraphBuilder.CreateTexture(Desc, TEXT("${NAME}_TempTexture"));
			FRDGTextureRef TargetTexture = RegisterExternalTexture(GraphBuilder, Params.RenderTarget->GetRenderTargetTexture(), TEXT("${NAME}_RT"));
			PassParameters->RenderTarget = GraphBuilder.CreateUAV(TmpTexture);
			`)}${instance.example == "base" ? `
			const void* RawData = (void*)Params.Input;
			int NumInputs = 2;
			int InputSize = sizeof(int);
			FRDGBufferRef InputBuffer = CreateUploadBuffer(GraphBuilder, TEXT("InputBuffer"), InputSize, NumInputs, RawData, InputSize * NumInputs);

			PassParameters->Input = GraphBuilder.CreateSRV(FRDGBufferSRVDesc(InputBuffer, PF_R32_SINT));

			FRDGBufferRef OutputBuffer = GraphBuilder.CreateBuffer(
				FRDGBufferDesc::CreateBufferDesc(sizeof(int32), 1),
				TEXT("OutputBuffer"));

			PassParameters->Output = GraphBuilder.CreateUAV(FRDGBufferUAVDesc(OutputBuffer, PF_R32_SINT));
			` : ""}${instance.example == "pi" ? `
			FRDGBufferRef OutputBuffer = GraphBuilder.CreateBuffer(
				FRDGBufferDesc::CreateBufferDesc(sizeof(int32), 1),
				TEXT("OutputBuffer"));

			PassParameters->Output = GraphBuilder.CreateUAV(FRDGBufferUAVDesc(OutputBuffer, PF_R32_SINT));
			` : ""}${instance.example == "basemat" ? `
			FRDGBufferRef OutputBuffer = GraphBuilder.CreateBuffer(
				FRDGBufferDesc::CreateBufferDesc(sizeof(FVector4f), 1),
				TEXT("OutputBuffer"));

			PassParameters->OutputColor = GraphBuilder.CreateUAV(FRDGBufferUAVDesc(OutputBuffer, PF_A32B32G32R32F));
			` : ""}

			auto GroupCount = FComputeShaderUtils::GetGroupCount(FIntVector(Params.X, Params.Y, Params.Z), FComputeShaderUtils::kGolden2DGroupSize);
			GraphBuilder.AddPass(
				RDG_EVENT_NAME("Execute${NAME}"),
				PassParameters,
				ERDGPassFlags::AsyncCompute,
				[&PassParameters, ComputeShader, ${instance.material ? `MaterialRenderProxy, MaterialResource, LocalScene, GameTime = Params.GameTime, Random = Params.Random, ` : ``}GroupCount](FRHIComputeCommandList& RHICmdList)
			{
				${instance.material ? `
				FMeshPassProcessorRenderState DrawRenderState;
				
				MaterialRenderProxy->UpdateUniformExpressionCacheIfNeeded(LocalScene->GetFeatureLevel());
				
				FViewUniformShaderParameters ViewUniformShaderParameters;

				ViewUniformShaderParameters.GameTime = GameTime;
				ViewUniformShaderParameters.Random = Random;

				auto ViewUniformBuffer = TUniformBufferRef<FViewUniformShaderParameters>::CreateUniformBufferImmediate(ViewUniformShaderParameters, UniformBuffer_SingleFrame);
				DrawRenderState.SetViewUniformBuffer(ViewUniformBuffer);

				FMeshMaterialShaderElementData ShaderElementData;

				FMeshProcessorShaders PassShaders;
				PassShaders.ComputeShader = ComputeShader;

				FMeshDrawShaderBindings ShaderBindings;
				ShaderBindings.Initialize(PassShaders);

				int32 DataOffset = 0;
				FMeshDrawSingleShaderBindings SingleShaderBindings = ShaderBindings.GetSingleShaderBindings(SF_Compute, DataOffset);
				ComputeShader->GetShaderBindings(LocalScene, LocalScene->GetFeatureLevel(), nullptr, *MaterialRenderProxy, *MaterialResource, DrawRenderState, ShaderElementData, SingleShaderBindings);

				ShaderBindings.Finalize(&PassShaders);

				FRHIComputeShader* ComputeShaderRHI = ComputeShader.GetComputeShader();
				RHICmdList.SetComputeShader(ComputeShaderRHI);
				ShaderBindings.SetOnCommandList(RHICmdList, ComputeShaderRHI);
				SetShaderParameters(RHICmdList, ComputeShader, ComputeShaderRHI, *PassParameters);
				RHICmdList.DispatchComputeShader(GroupCount.X, GroupCount.Y, GroupCount.Z);
				` : `FComputeShaderUtils::Dispatch(RHICmdList, ComputeShader, *PassParameters, GroupCount);`}
			});

			${ifExample(['base', 'pi', 'basemat'], `
			FRHIGPUBufferReadback* GPUBufferReadback = new FRHIGPUBufferReadback(TEXT("Execute${NAME}Output"));
			AddEnqueueCopyPass(GraphBuilder, GPUBufferReadback, OutputBuffer, 0u);

			auto RunnerFunc = [GPUBufferReadback, AsyncCallback](auto&& RunnerFunc) -> void {
				if (GPUBufferReadback->IsReady()) {
					${ifExample(['base', 'pi'], `
					int32* Buffer = (int32*)GPUBufferReadback->Lock(1);
					int OutVal = Buffer[0];
					`)}${ifExample(['basemat'], `
					FVector4f* Buffer = (FVector4f*)GPUBufferReadback->Lock(1);
					FVector3f OutVal = FVector3f(Buffer[0].X, Buffer[0].Y, Buffer[0].Z);
					`)}
					GPUBufferReadback->Unlock();

					AsyncTask(ENamedThreads::GameThread, [AsyncCallback, OutVal]() {
						AsyncCallback(OutVal);
					});

					delete GPUBufferReadback;
				} else {
					AsyncTask(ENamedThreads::ActualRenderingThread, [RunnerFunc]() {
						RunnerFunc(RunnerFunc);
					});
				}
			};

			AsyncTask(ENamedThreads::ActualRenderingThread, [RunnerFunc]() {
				RunnerFunc(RunnerFunc);
			});
			`)}${ifExample(['rt', 'mat'], `
			AddCopyTexturePass(GraphBuilder, TmpTexture, TargetTexture, FRHICopyTextureInfo());
			`)}
		} else {
			// We silently exit here as we don't want to crash the game if the shader is not found or has an error.
			${ifExample('basemat', `AsyncCallback(FVector3f(0.f));`)}
		}
	}

	GraphBuilder.Execute();
}