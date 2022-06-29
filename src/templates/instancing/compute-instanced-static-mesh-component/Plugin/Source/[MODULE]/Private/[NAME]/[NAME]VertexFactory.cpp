// Copyright Epic Games, Inc. All Rights Reserved.
// Adapted from the VirtualHeightfieldMesh plugin

#include "${NAME}VertexFactory.h"

#include "Engine/Engine.h"
#include "EngineGlobals.h"
#include "Materials/Material.h"
#include "MeshMaterialShader.h"
#include "RHIStaticStates.h"
#include "ShaderParameters.h"
#include "ShaderParameterUtils.h"

IMPLEMENT_TYPE_LAYOUT(F${NAME}VertexFactoryShaderParametersBase);

void F${NAME}VertexFactoryShaderParametersBase::Bind(const FShaderParameterMap& ParameterMap)
{

}

void F${NAME}VertexFactoryShaderParametersBase::GetElementShaderBindings(
	const FSceneInterface* Scene,
	const FSceneView* View,
	const FMeshMaterialShader* Shader,
	const EVertexInputStreamType VertexStreamType,
	ERHIFeatureLevel::Type FeatureLevel,
	const FVertexFactory* VertexFactory,
	const FMeshBatchElement& BatchElement,
	class FMeshDrawSingleShaderBindings& ShaderBindings,
	FVertexInputStreamArray& VertexStreams) const
{
	const F${NAME}VertexFactoryBase* ${NAME}VF = static_cast<const F${NAME}VertexFactoryBase*>(VertexFactory);
}

IMPLEMENT_GLOBAL_SHADER_PARAMETER_STRUCT(F${NAME}MeshUniformParameters, "${NAME}MeshVF");

class F${NAME}MeshVertexFactoryShaderParametersVS : public F${NAME}VertexFactoryShaderParametersBase
{
	DECLARE_TYPE_LAYOUT(F${NAME}MeshVertexFactoryShaderParametersVS, NonVirtual);
public:
	void Bind(const FShaderParameterMap& ParameterMap)
	{
		F${NAME}VertexFactoryShaderParametersBase::Bind(ParameterMap);
	}

	void GetElementShaderBindings(
		const FSceneInterface* Scene,
		const FSceneView* View,
		const FMeshMaterialShader* Shader,
		const EVertexInputStreamType InputStreamType,
		ERHIFeatureLevel::Type FeatureLevel,
		const FVertexFactory* VertexFactory,
		const FMeshBatchElement& BatchElement,
		class FMeshDrawSingleShaderBindings& ShaderBindings,
		FVertexInputStreamArray& VertexStreams) const
	{
		F${NAME}VertexFactoryShaderParametersBase::GetElementShaderBindings(Scene, View, Shader, InputStreamType, FeatureLevel, VertexFactory, BatchElement, ShaderBindings, VertexStreams);

		const F${NAME}MeshVertexFactory* ${NAME}MeshVF = static_cast<const F${NAME}MeshVertexFactory*>(VertexFactory);
		ShaderBindings.Add(Shader->GetUniformBufferParameter<F${NAME}MeshUniformParameters>(), ${NAME}MeshVF->GetUniformBuffer());
	}
};

IMPLEMENT_TYPE_LAYOUT(F${NAME}MeshVertexFactoryShaderParametersVS);

class F${NAME}MeshVertexFactoryShaderParametersPS : public F${NAME}VertexFactoryShaderParametersBase
{
	DECLARE_TYPE_LAYOUT(F${NAME}MeshVertexFactoryShaderParametersPS, NonVirtual);
public:
	void GetElementShaderBindings(
		const FSceneInterface* Scene,
		const FSceneView* View,
		const FMeshMaterialShader* Shader,
		const EVertexInputStreamType InputStreamType,
		ERHIFeatureLevel::Type FeatureLevel,
		const FVertexFactory* VertexFactory,
		const FMeshBatchElement& BatchElement,
		class FMeshDrawSingleShaderBindings& ShaderBindings,
		FVertexInputStreamArray& VertexStreams) const
	{
		F${NAME}VertexFactoryShaderParametersBase::GetElementShaderBindings(Scene, View, Shader, InputStreamType, FeatureLevel, VertexFactory, BatchElement, ShaderBindings, VertexStreams);

		const F${NAME}MeshVertexFactory* ${NAME}MeshVF = static_cast<const F${NAME}MeshVertexFactory*>(VertexFactory);
		ShaderBindings.Add(Shader->GetUniformBufferParameter<F${NAME}MeshUniformParameters>(), ${NAME}MeshVF->GetUniformBuffer());
	}

};

IMPLEMENT_TYPE_LAYOUT(F${NAME}MeshVertexFactoryShaderParametersPS);

void F${NAME}MeshVertexFactory::InitRHI()
{
	FVertexDeclarationElementList Elements;

	{
		if (Data.PositionComponent.VertexBuffer != NULL)
		{
			Elements.Add(AccessStreamComponent(Data.PositionComponent, 0));
		}

		// only tangent,normal are used by the stream. the binormal is derived in the shader
		uint8 TangentBasisAttributes[2] = { 1, 2 };
		for (int32 AxisIndex = 0; AxisIndex < 2; AxisIndex++)
		{
			if (Data.TangentBasisComponents[AxisIndex].VertexBuffer != NULL)
			{
				Elements.Add(AccessStreamComponent(Data.TangentBasisComponents[AxisIndex], TangentBasisAttributes[AxisIndex]));
			}
		}

		if (Data.ColorComponentsSRV == nullptr)
		{
			Data.ColorComponentsSRV = GNullColorVertexBuffer.VertexBufferSRV;
			Data.ColorIndexMask = 0;
		}

		// Vertex color
		if (Data.ColorComponent.VertexBuffer != NULL)
		{
			Elements.Add(AccessStreamComponent(Data.ColorComponent, 3));
		}
		else
		{
			//If the mesh has no color component, set the null color buffer on a new stream with a stride of 0.
			//This wastes 4 bytes of bandwidth per vertex, but prevents having to compile out twice the number of vertex factories.
			FVertexStreamComponent NullColorComponent(&GNullColorVertexBuffer, 0, 0, VET_Color, EVertexStreamUsage::ManualFetch);
			Elements.Add(AccessStreamComponent(NullColorComponent, 3));
		}

		if (Data.TextureCoordinates.Num())
		{
			const int32 BaseTexCoordAttribute = 4;
			for (int32 CoordinateIndex = 0; CoordinateIndex < Data.TextureCoordinates.Num(); CoordinateIndex++)
			{
				Elements.Add(AccessStreamComponent(
					Data.TextureCoordinates[CoordinateIndex],
					BaseTexCoordAttribute + CoordinateIndex
					));
			}

			for (int32 CoordinateIndex = Data.TextureCoordinates.Num(); CoordinateIndex < MAX_TEXCOORDS; CoordinateIndex++)
			{
				Elements.Add(AccessStreamComponent(
					Data.TextureCoordinates[Data.TextureCoordinates.Num() - 1],
					BaseTexCoordAttribute + CoordinateIndex
					));
			}
		}

#if ${NAME}_ENABLE_GPU_SCENE_MESHES
		if (bAddPrimitiveIDElement)
		{
			// TODO: Support GPU Scene on mobile? Maybe only for CPU particles?
			AddPrimitiveIdStreamElement(EVertexInputStreamType::Default, Elements, 13, 0xFF);
		}
#endif

		//if (Streams.Num() > 0)
		{
			InitDeclaration(Elements);
			check(IsValidRef(GetDeclaration()));
		}
	}
}

bool F${NAME}MeshVertexFactory::ShouldCompilePermutation(const FVertexFactoryShaderPermutationParameters& Parameters)
{
	return	(Parameters.MaterialParameters.bIsUsedWithNiagaraMeshParticles || Parameters.MaterialParameters.bIsSpecialEngineMaterial)
			&& (Parameters.MaterialParameters.MaterialDomain != MD_Volume);
}

void F${NAME}MeshVertexFactory::ModifyCompilationEnvironment(const FVertexFactoryShaderPermutationParameters& Parameters, FShaderCompilerEnvironment& OutEnvironment)
{
	F${NAME}VertexFactoryBase::ModifyCompilationEnvironment(Parameters, OutEnvironment);

	// Set a define so we can tell in MaterialTemplate.usf when we are compiling a mesh particle vertex factory
	OutEnvironment.SetDefine(TEXT("${NAME}_MESH_FACTORY"), TEXT("1"));
	OutEnvironment.SetDefine(TEXT("${NAME}_MESH_INSTANCED"), TEXT("1"));
	OutEnvironment.SetDefine(TEXT("${NAME}VFLooseParameters"), TEXT("${NAME}MeshVF"));

#if ${NAME}_ENABLE_GPU_SCENE_MESHES
	const ERHIFeatureLevel::Type MaxSupportedFeatureLevel = GetMaxSupportedFeatureLevel(Parameters.Platform);

	// TODO: Support GPU Scene on mobile?
	const bool bUseGPUScene = UseGPUScene(Parameters.Platform, MaxSupportedFeatureLevel) && MaxSupportedFeatureLevel > ERHIFeatureLevel::ES3_1;
	const bool bSupportsPrimitiveIdStream = Parameters.VertexFactoryType->SupportsPrimitiveIdStream();
	
	// TODO: Support GPU Scene for raytracing
	if (bSupportsPrimitiveIdStream && bUseGPUScene)
	{
		OutEnvironment.SetDefine(TEXT("VF_SUPPORTS_PRIMITIVE_SCENE_DATA"), TEXT("!(RAYHITGROUPSHADER)"));
		OutEnvironment.SetDefine(TEXT("VF_REQUIRES_PER_INSTANCE_CUSTOM_DATA"), TEXT("!(RAYHITGROUPSHADER)"));
	}
	else
	{
		OutEnvironment.SetDefine(TEXT("VF_SUPPORTS_PRIMITIVE_SCENE_DATA"), 0);
		OutEnvironment.SetDefine(TEXT("VF_REQUIRES_PER_INSTANCE_CUSTOM_DATA"), 0);
	}
#endif

	const bool ContainsManualVertexFetch = OutEnvironment.GetDefinitions().Contains("MANUAL_VERTEX_FETCH");
	if (!ContainsManualVertexFetch && RHISupportsManualVertexFetch(Parameters.Platform))
	{
		OutEnvironment.SetDefine(TEXT("MANUAL_VERTEX_FETCH"), TEXT("1"));
	}
}

void F${NAME}MeshVertexFactory::SetData(const FStaticMeshDataType& InData)
{
	check(IsInRenderingThread());
	Data = InData;
	UpdateRHI();
}

#if ${NAME}_ENABLE_GPU_SCENE_MESHES
	#define ${NAME}_MESH_VF_FLAGS (EVertexFactoryFlags::UsedWithMaterials \
		| EVertexFactoryFlags::SupportsDynamicLighting \
		| EVertexFactoryFlags::SupportsRayTracing \
		| EVertexFactoryFlags::SupportsPrimitiveIdStream)
#else
	#define ${NAME}_MESH_VF_FLAGS (EVertexFactoryFlags::UsedWithMaterials \
		| EVertexFactoryFlags::SupportsDynamicLighting \
		| EVertexFactoryFlags::SupportsRayTracing)
#endif
#define ${NAME}_MESH_VF_FLAGS_EX (${NAME}_MESH_VF_FLAGS | EVertexFactoryFlags::SupportsPrecisePrevWorldPos)

IMPLEMENT_VERTEX_FACTORY_PARAMETER_TYPE(F${NAME}MeshVertexFactory, SF_Vertex, F${NAME}MeshVertexFactoryShaderParametersVS);
#if RHI_RAYTRACING
IMPLEMENT_VERTEX_FACTORY_PARAMETER_TYPE(F${NAME}MeshVertexFactory, SF_Compute, F${NAME}MeshVertexFactoryShaderParametersVS);
IMPLEMENT_VERTEX_FACTORY_PARAMETER_TYPE(F${NAME}MeshVertexFactory, SF_RayHitGroup, F${NAME}MeshVertexFactoryShaderParametersVS);
#endif
IMPLEMENT_VERTEX_FACTORY_PARAMETER_TYPE(F${NAME}MeshVertexFactory, SF_Pixel, F${NAME}MeshVertexFactoryShaderParametersPS);

IMPLEMENT_VERTEX_FACTORY_TYPE(F${NAME}MeshVertexFactory, "/${MODULE_NAME}Shaders/${NAME}/${NAME}VertexFactory.ush", ${NAME}_MESH_VF_FLAGS);
